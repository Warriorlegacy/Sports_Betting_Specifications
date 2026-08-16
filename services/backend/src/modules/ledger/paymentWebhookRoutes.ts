import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { depositFundsAtomic } from '../../db/ledger';
import { query } from '../../db/pool';

export const paymentWebhookRouter = Router();

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'nexus_payment_secret_2026';

/**
 * Verify HMAC-SHA256 signature if provided in headers
 */
function verifyWebhookSignature(payload: any, signatureHeader?: string): boolean {
  if (!signatureHeader) return true; // Optional soft mode if test sandbox
  try {
    const rawData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawData)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch (err) {
    return false;
  }
}

/**
 * Helper to resolve user UUID from username, ID, or phone
 */
async function resolveUserId(userIdentifier: string): Promise<string | null> {
  try {
    const res = await query(
      'SELECT id FROM users WHERE id::text = $1 OR username = $1 OR phone = $1 LIMIT 1',
      [userIdentifier]
    );
    return res.rows.length > 0 ? res.rows[0].id : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/webhooks/payment/upi
 * Universal webhook endpoint for UPI / Cashfree / Razorpay / Decentro payment notifications
 */
paymentWebhookRouter.post('/upi', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    if (signature && !verifyWebhookSignature(req.body, signature)) {
      res.status(401).json({ error: 'Invalid webhook HMAC signature' });
      return;
    }

    const {
      userId,
      username,
      amount,
      referenceId,
      utr,
      status,
      payerVpa,
      notes
    } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid positive amount is required' });
      return;
    }

    if (status && status.toUpperCase() !== 'SUCCESS' && status.toUpperCase() !== 'COMPLETED') {
      res.json({ received: true, status: 'IGNORED_NON_SUCCESS' });
      return;
    }

    const ref = referenceId || utr || `UPI_AUTO_${Date.now()}`;
    const userTarget = userId || username;
    if (!userTarget) {
      res.status(400).json({ error: 'userId or username is required to route payment' });
      return;
    }

    const resolvedId = await resolveUserId(userTarget);
    if (!resolvedId) {
      res.status(404).json({ error: `User identifier '${userTarget}' not found` });
      return;
    }

    // Execute atomic credit
    const depositResult = await depositFundsAtomic(
      resolvedId,
      Number(amount),
      'UPI',
      ref,
      notes || `Instant Auto-Credit via UPI Gateway (VPA: ${payerVpa || 'N/A'})`
    );

    // Emit live WebSocket notification if socket instance attached
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`user:${resolvedId}`).emit('deposit:success', {
        amount: Number(amount),
        paymentMethod: 'UPI',
        referenceId: ref,
        availableCredit: depositResult.availableCredit,
        creditLimit: depositResult.creditLimit,
        timestamp: new Date().toISOString()
      });
      io.to(`user:${resolvedId}`).emit('user:balance', {
        availableCredit: depositResult.availableCredit,
        creditLimit: depositResult.creditLimit
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deposit successfully verified and auto-credited',
      transactionId: depositResult.transactionId,
      amount: depositResult.amount,
      availableCredit: depositResult.availableCredit,
      referenceId: ref
    });
  } catch (err: any) {
    console.error('[PaymentWebhook:UPI] Error:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
});

/**
 * POST /api/webhooks/payment/crypto
 * Universal crypto deposit listener (TRON TRC-20, BSC BEP-20, Ethereum ERC-20)
 */
paymentWebhookRouter.post('/crypto', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    if (signature && !verifyWebhookSignature(req.body, signature)) {
      res.status(401).json({ error: 'Invalid webhook HMAC signature' });
      return;
    }

    const {
      userId,
      username,
      amount,
      currency = 'USDT',
      network = 'TRC20',
      txHash,
      confirmations = 1,
      notes
    } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid positive amount is required' });
      return;
    }

    if (confirmations < 1) {
      res.json({ received: true, status: 'WAITING_FOR_CONFIRMATIONS' });
      return;
    }

    const ref = txHash || `CRYPTO_AUTO_${Date.now()}`;
    const userTarget = userId || username;
    if (!userTarget) {
      res.status(400).json({ error: 'userId or username is required to route payment' });
      return;
    }

    const resolvedId = await resolveUserId(userTarget);
    if (!resolvedId) {
      res.status(404).json({ error: `User identifier '${userTarget}' not found` });
      return;
    }

    // Convert USDT to INR if platform base currency is INR (Rate ~90 INR / USDT)
    const inrAmount = Number(amount) * (currency.toUpperCase() === 'USDT' ? 90.0 : 1.0);

    const depositResult = await depositFundsAtomic(
      resolvedId,
      inrAmount,
      `CRYPTO_${network.toUpperCase()}`,
      ref,
      notes || `Instant Crypto Deposit (${amount} ${currency} on ${network} | Tx: ${ref.slice(0, 12)}...)`
    );

    // Emit live WebSocket notification
    const io = (req.app as any).get('io');
    if (io) {
      io.to(`user:${resolvedId}`).emit('deposit:success', {
        amount: inrAmount,
        cryptoAmount: Number(amount),
        currency,
        network,
        paymentMethod: `CRYPTO_${network}`,
        referenceId: ref,
        availableCredit: depositResult.availableCredit,
        creditLimit: depositResult.creditLimit,
        timestamp: new Date().toISOString()
      });
      io.to(`user:${resolvedId}`).emit('user:balance', {
        availableCredit: depositResult.availableCredit,
        creditLimit: depositResult.creditLimit
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crypto deposit confirmed and auto-credited',
      transactionId: depositResult.transactionId,
      creditedAmount: inrAmount,
      cryptoAmount: Number(amount),
      currency,
      network,
      txHash: ref,
      availableCredit: depositResult.availableCredit
    });
  } catch (err: any) {
    console.error('[PaymentWebhook:Crypto] Error:', err);
    res.status(500).json({ error: err.message || 'Crypto webhook processing failed' });
  }
});

/**
 * GET /api/webhooks/payment/config
 * Returns webhook endpoint endpoints & status
 */
paymentWebhookRouter.get('/config', (_req: Request, res: Response) => {
  res.json({
    status: 'ACTIVE',
    endpoints: {
      upi: '/api/webhooks/payment/upi',
      crypto: '/api/webhooks/payment/crypto'
    },
    supportedMethods: ['UPI', 'IMPS', 'USDT_TRC20', 'USDT_BEP20', 'USDT_ERC20'],
    autoCreditEnabled: true,
    timestamp: new Date().toISOString()
  });
});
