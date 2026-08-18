import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';
import {
  allocateCreditAtomic,
  recallCreditAtomic,
  depositFundsAtomic,
  submitDepositRequestAtomic,
  processDepositAtomic,
  getDepositsList,
  getUserDeposits,
  requestWithdrawalAtomic,
  processWithdrawalAtomic,
  getUserTransactions,
  getWithdrawalsList
} from '../../db/ledger';

export const ledgerRouter = Router();

/**
 * POST /api/ledger/deposit-request
 * Player submits a deposit request with UTR / Reference after transferring funds to Admin's Bank or UPI/QR.
 */
ledgerRouter.post(
  '/deposit-request',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const {
        amount,
        paymentMethod = 'UPI',
        utrReference,
        paymentMethodId,
        depositAccountDetails,
        proofImageUrl,
        notes
      } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid positive deposit amount is required' });
      }

      if (!utrReference || !utrReference.trim()) {
        return res.status(400).json({ error: '12-digit UTR or Transaction Reference number is required' });
      }

      const result = await submitDepositRequestAtomic({
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        utrReference,
        paymentMethodId,
        depositAccountDetails,
        proofImageUrl,
        notes
      });

      // Broadcast to Admin / Master room for real-time notification
      const io = (req.app as any).get('io');
      if (io) {
        io.emit('admin:deposit_request', {
          depositId: result.depositId,
          userId,
          username: req.user!.username,
          amount: result.amount,
          paymentMethod: result.paymentMethod,
          utrReference: result.utrReference,
          timestamp: new Date().toISOString()
        });
      }

      res.status(201).json({
        message: 'Deposit request submitted successfully. Awaiting operator confirmation.',
        ...result
      });
    } catch (error: any) {
      console.error('Error submitting deposit request:', error);
      res.status(400).json({ error: error.message || 'Failed to submit deposit request' });
    }
  }
);

/**
 * GET /api/ledger/deposits
 * Admin / Master endpoint to view deposit requests queue.
 */
ledgerRouter.get(
  '/deposits',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await getDepositsList(status, undefined, limit, offset, search);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching deposits queue:', error);
      res.status(500).json({ error: 'Failed to fetch deposit requests' });
    }
  }
);

/**
 * POST /api/ledger/deposits/:id/process
 * Admin / Master approves or rejects a player deposit request.
 */
ledgerRouter.post(
  '/deposits/:id/process',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const processorId = req.user!.id;
      const depositId = req.params.id;
      const { action, notes } = req.body;

      if (action !== 'APPROVE' && action !== 'REJECT') {
        return res.status(400).json({ error: "Action must be either 'APPROVE' or 'REJECT'" });
      }

      const result = await processDepositAtomic(
        depositId,
        processorId,
        action,
        notes
      );

      // Emit live WebSocket notification to target player
      const io = (req.app as any).get('io');
      if (io) {
        if (action === 'APPROVE') {
          io.to(`user:${result.userId}`).emit('deposit:success', {
            amount: result.amount,
            availableCredit: result.availableCredit,
            creditLimit: result.creditLimit,
            timestamp: new Date().toISOString()
          });
          io.to(`user:${result.userId}`).emit('user:balance', {
            availableCredit: result.availableCredit,
            creditLimit: result.creditLimit
          });
        } else {
          io.to(`user:${result.userId}`).emit('deposit:rejected', {
            depositId,
            notes: notes || 'Deposit rejected by operator',
            timestamp: new Date().toISOString()
          });
        }
      }

      res.json({
        message: `Deposit request successfully ${action === 'APPROVE' ? 'approved & credited' : 'rejected'}`,
        ...result
      });
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      res.status(400).json({ error: error.message || 'Failed to process deposit request' });
    }
  }
);

/**
 * GET /api/ledger/my-deposits
 * Authenticated player views their own deposit requests history.
 */
ledgerRouter.get(
  '/my-deposits',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await getUserDeposits(userId, limit, offset);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching my deposits:', error);
      res.status(500).json({ error: 'Failed to fetch deposit history' });
    }
  }
);

/**
 * POST /api/ledger/deposit
 * Direct instant credit endpoint (for webhooks or manual testing).
 */
ledgerRouter.post(
  '/deposit',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { amount, paymentMethod, referenceId, notes } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid positive deposit amount is required' });
      }

      const result = await depositFundsAtomic(
        userId,
        parseFloat(amount),
        paymentMethod || 'INSTANT_UPI',
        referenceId,
        notes
      );

      res.json({
        message: 'Funds deposited successfully',
        ...result
      });
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      res.status(400).json({ error: error.message || 'Failed to deposit funds' });
    }
  }
);

/**
 * POST /api/ledger/withdraw
 * Player submits a withdrawal request.
 */
ledgerRouter.post(
  '/withdraw',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { amount, payoutMethod, accountDetails, notes } = req.body;

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid positive withdrawal amount is required' });
      }

      if (!payoutMethod || !accountDetails) {
        return res.status(400).json({ error: 'Payout method and account details are required' });
      }

      const result = await requestWithdrawalAtomic(
        userId,
        parseFloat(amount),
        payoutMethod,
        accountDetails,
        notes
      );

      // Emit live WebSocket notification to Admin / Master desk
      const io = (req.app as any).get('io');
      if (io) {
        io.emit('admin:withdrawal_request', {
          withdrawalId: result.withdrawalId,
          userId,
          username: req.user!.username,
          amount: result.amount,
          payoutMethod: result.payoutMethod,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        message: 'Withdrawal request submitted successfully',
        ...result
      });
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      res.status(400).json({ error: error.message || 'Failed to submit withdrawal request' });
    }
  }
);

/**
 * GET /api/ledger/my-transactions
 * Fetches authenticated user's ledger transaction history.
 */
ledgerRouter.get(
  '/my-transactions',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await getUserTransactions(userId, limit, offset);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching user transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  }
);

/**
 * GET /api/ledger/my-withdrawals
 * Fetches authenticated user's withdrawal requests history.
 */
ledgerRouter.get(
  '/my-withdrawals',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await getWithdrawalsList(undefined, userId, limit, offset);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching user withdrawals:', error);
      res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
  }
);

/**
 * GET /api/ledger/withdrawals
 * Admin/Agent view of all withdrawal requests.
 */
ledgerRouter.get(
  '/withdrawals',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const result = await getWithdrawalsList(status, undefined, limit, offset);
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching withdrawals list:', error);
      res.status(500).json({ error: 'Failed to fetch withdrawals list' });
    }
  }
);

/**
 * POST /api/ledger/withdrawals/:id/process
 * Admin/Agent approves or rejects a withdrawal request.
 */
ledgerRouter.post(
  '/withdrawals/:id/process',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const processorId = req.user!.id;
      const withdrawalId = req.params.id;
      const { action, referenceId, notes } = req.body;

      if (action !== 'APPROVE' && action !== 'REJECT') {
        return res.status(400).json({ error: "Action must be either 'APPROVE' or 'REJECT'" });
      }

      const result = await processWithdrawalAtomic(
        withdrawalId,
        processorId,
        action,
        referenceId,
        notes
      );

      // Emit live WebSocket notification to target user
      const io = (req.app as any).get('io');
      if (io) {
        io.to(`user:${result.userId}`).emit('withdrawal:processed', {
          withdrawalId,
          status: result.status,
          amount: result.amount,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        message: `Withdrawal request successfully ${action.toLowerCase()}d`,
        ...result
      });
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      res.status(400).json({ error: error.message || 'Failed to process withdrawal request' });
    }
  }
);

/**
 * POST /api/ledger/allocate
 * Allocates credit downline from authenticated user to a direct child.
 */
ledgerRouter.post(
  '/allocate',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const senderId = req.user!.id;
      const { receiverId, amount, notes } = req.body;

      if (!receiverId || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid receiverId and positive amount are required' });
      }

      const result = await allocateCreditAtomic(senderId, receiverId, parseFloat(amount), notes);

      res.json({
        message: 'Credit allocated successfully',
        ...result
      });
    } catch (error: any) {
      console.error('Error allocating credit:', error);
      res.status(400).json({ error: error.message || 'Failed to allocate credit' });
    }
  }
);

/**
 * POST /api/ledger/recall
 * Recalls unencumbered credit back from a direct child.
 */
ledgerRouter.post(
  '/recall',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parentId = req.user!.id;
      const { receiverId, amount, notes } = req.body;

      if (!receiverId || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid child user ID and positive amount are required' });
      }

      const result = await recallCreditAtomic(parentId, receiverId, parseFloat(amount), notes);

      res.json({
        message: 'Credit recalled successfully',
        ...result
      });
    } catch (error: any) {
      console.error('Error recalling credit:', error);
      res.status(400).json({ error: error.message || 'Failed to recall credit' });
    }
  }
);

/**
 * GET /api/ledger/history
 * Fetches double-entry ledger transactions.
 */
ledgerRouter.get(
  '/history',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      let sql = '';
      let params: any[] = [];

      if (role === 'ADMIN') {
        sql = `
          SELECT l.id, l.sender_id, l.receiver_id, l.amount, l.transaction_type, l.reference_id, l.notes, l.created_at,
                 su.username as sender_username, ru.username as receiver_username
          FROM ledger_entries l
          LEFT JOIN users su ON l.sender_id = su.id
          LEFT JOIN users ru ON l.receiver_id = ru.id
          ORDER BY l.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        params = [limit, offset];
      } else {
        sql = `
          SELECT l.id, l.sender_id, l.receiver_id, l.amount, l.transaction_type, l.reference_id, l.notes, l.created_at,
                 su.username as sender_username, ru.username as receiver_username
          FROM ledger_entries l
          LEFT JOIN users su ON l.sender_id = su.id
          LEFT JOIN users ru ON l.receiver_id = ru.id
          WHERE l.sender_id = $1 OR l.receiver_id = $1
          ORDER BY l.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        params = [userId, limit, offset];
      }

      const result = await query(sql, params);

      const entries = result.rows.map((r) => ({
        id: r.id,
        senderId: r.sender_id,
        senderUsername: r.sender_username || 'System Mint',
        receiverId: r.receiver_id,
        receiverUsername: r.receiver_username || 'System',
        amount: parseFloat(r.amount),
        transactionType: r.transaction_type,
        referenceId: r.reference_id,
        notes: r.notes,
        createdAt: r.created_at
      }));

      res.json({ entries });
    } catch (error) {
      console.error('Error fetching ledger history:', error);
      res.status(500).json({ error: 'Failed to fetch ledger statement' });
    }
  }
);
