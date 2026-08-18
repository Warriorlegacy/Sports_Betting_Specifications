import { Router, Request, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';

export const paymentMethodRouter = Router();

/**
 * GET /api/payment-methods
 * Public/authenticated endpoint for players to fetch active deposit accounts (Bank, UPI, QR, Crypto).
 */
paymentMethodRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, account_type, display_name, bank_name, account_holder, account_number,
              ifsc_code, branch, upi_id, qr_code_url, crypto_network, crypto_address,
              min_deposit, max_deposit, instructions, is_primary
       FROM deposit_accounts
       WHERE is_active = TRUE
       ORDER BY is_primary DESC, created_at ASC`
    );

    const accounts = result.rows.map((r) => ({
      id: r.id,
      accountType: r.account_type,
      displayName: r.display_name,
      bankName: r.bank_name,
      accountHolder: r.account_holder,
      accountNumber: r.account_number,
      ifscCode: r.ifsc_code,
      branch: r.branch,
      upiId: r.upi_id,
      qrCodeUrl: r.qr_code_url,
      cryptoNetwork: r.crypto_network,
      cryptoAddress: r.crypto_address,
      minDeposit: parseFloat(r.min_deposit),
      maxDeposit: parseFloat(r.max_deposit),
      instructions: r.instructions,
      isPrimary: r.is_primary
    }));

    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching active payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch active deposit methods' });
  }
});

/**
 * GET /api/payment-methods/admin
 * Admin/Master endpoint to retrieve all deposit accounts including inactive.
 */
paymentMethodRouter.get(
  '/admin',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER']),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await query(
        `SELECT id, account_type, display_name, bank_name, account_holder, account_number,
                ifsc_code, branch, upi_id, qr_code_url, crypto_network, crypto_address,
                min_deposit, max_deposit, daily_limit, instructions, is_active, is_primary,
                created_at, updated_at
         FROM deposit_accounts
         ORDER BY is_primary DESC, created_at ASC`
      );

      const accounts = result.rows.map((r) => ({
        id: r.id,
        accountType: r.account_type,
        displayName: r.display_name,
        bankName: r.bank_name,
        accountHolder: r.account_holder,
        accountNumber: r.account_number,
        ifscCode: r.ifsc_code,
        branch: r.branch,
        upiId: r.upi_id,
        qrCodeUrl: r.qr_code_url,
        cryptoNetwork: r.crypto_network,
        cryptoAddress: r.crypto_address,
        minDeposit: parseFloat(r.min_deposit),
        maxDeposit: parseFloat(r.max_deposit),
        dailyLimit: parseFloat(r.daily_limit),
        instructions: r.instructions,
        isActive: r.is_active,
        isPrimary: r.is_primary,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.json({ accounts });
    } catch (error) {
      console.error('Error fetching admin payment accounts:', error);
      res.status(500).json({ error: 'Failed to fetch deposit accounts' });
    }
  }
);

/**
 * POST /api/payment-methods
 * Admin adds a new Bank Account, UPI ID / QR Code, or Crypto Wallet.
 */
paymentMethodRouter.post(
  '/',
  authenticateToken,
  requireRoles(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        accountType,
        displayName,
        bankName,
        accountHolder,
        accountNumber,
        ifscCode,
        branch,
        upiId,
        qrCodeUrl,
        cryptoNetwork,
        cryptoAddress,
        minDeposit,
        maxDeposit,
        dailyLimit,
        instructions,
        isActive = true,
        isPrimary = false
      } = req.body;

      if (!accountType || !displayName) {
        return res.status(400).json({ error: 'accountType and displayName are required' });
      }

      if (accountType === 'BANK' && (!accountNumber || !ifscCode || !bankName)) {
        return res.status(400).json({ error: 'bankName, accountNumber, and ifscCode are required for Bank Accounts' });
      }

      if (accountType === 'UPI' && !upiId && !qrCodeUrl) {
        return res.status(400).json({ error: 'upiId or qrCodeUrl is required for UPI / QR Code' });
      }

      if (isPrimary) {
        // If this is set as primary, unmark previous primary for this accountType
        await query(`UPDATE deposit_accounts SET is_primary = FALSE WHERE account_type = $1`, [accountType]);
      }

      const insertRes = await query(
        `INSERT INTO deposit_accounts (
          account_type, display_name, bank_name, account_holder, account_number,
          ifsc_code, branch, upi_id, qr_code_url, crypto_network, crypto_address,
          min_deposit, max_deposit, daily_limit, instructions, is_active, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          accountType.toUpperCase(),
          displayName.trim(),
          bankName ? bankName.trim() : null,
          accountHolder ? accountHolder.trim() : null,
          accountNumber ? accountNumber.trim() : null,
          ifscCode ? ifscCode.trim().toUpperCase() : null,
          branch ? branch.trim() : null,
          upiId ? upiId.trim() : null,
          qrCodeUrl ? qrCodeUrl.trim() : null,
          cryptoNetwork ? cryptoNetwork.trim().toUpperCase() : null,
          cryptoAddress ? cryptoAddress.trim() : null,
          parseFloat(minDeposit || '100'),
          parseFloat(maxDeposit || '500000'),
          parseFloat(dailyLimit || '2000000'),
          instructions ? instructions.trim() : null,
          Boolean(isActive),
          Boolean(isPrimary)
        ]
      );

      res.status(201).json({
        message: 'Deposit account added successfully',
        account: insertRes.rows[0]
      });
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      res.status(500).json({ error: error.message || 'Failed to create payment method' });
    }
  }
);

/**
 * PUT /api/payment-methods/:id
 * Admin updates account details, toggles active/inactive, or sets as primary.
 */
paymentMethodRouter.put(
  '/:id',
  authenticateToken,
  requireRoles(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const accountId = req.params.id;
      const {
        displayName,
        bankName,
        accountHolder,
        accountNumber,
        ifscCode,
        branch,
        upiId,
        qrCodeUrl,
        cryptoNetwork,
        cryptoAddress,
        minDeposit,
        maxDeposit,
        dailyLimit,
        instructions,
        isActive,
        isPrimary
      } = req.body;

      const existingRes = await query(`SELECT * FROM deposit_accounts WHERE id = $1`, [accountId]);
      if (existingRes.rows.length === 0) {
        return res.status(404).json({ error: 'Deposit account not found' });
      }

      const existing = existingRes.rows[0];

      if (isPrimary && !existing.is_primary) {
        await query(`UPDATE deposit_accounts SET is_primary = FALSE WHERE account_type = $1`, [existing.account_type]);
      }

      const updateRes = await query(
        `UPDATE deposit_accounts SET
          display_name = COALESCE($1, display_name),
          bank_name = COALESCE($2, bank_name),
          account_holder = COALESCE($3, account_holder),
          account_number = COALESCE($4, account_number),
          ifsc_code = COALESCE($5, ifsc_code),
          branch = COALESCE($6, branch),
          upi_id = COALESCE($7, upi_id),
          qr_code_url = COALESCE($8, qr_code_url),
          crypto_network = COALESCE($9, crypto_network),
          crypto_address = COALESCE($10, crypto_address),
          min_deposit = COALESCE($11, min_deposit),
          max_deposit = COALESCE($12, max_deposit),
          daily_limit = COALESCE($13, daily_limit),
          instructions = COALESCE($14, instructions),
          is_active = COALESCE($15, is_active),
          is_primary = COALESCE($16, is_primary),
          updated_at = NOW()
        WHERE id = $17
        RETURNING *`,
        [
          displayName !== undefined ? displayName.trim() : null,
          bankName !== undefined ? bankName.trim() : null,
          accountHolder !== undefined ? accountHolder.trim() : null,
          accountNumber !== undefined ? accountNumber.trim() : null,
          ifscCode !== undefined ? ifscCode.trim().toUpperCase() : null,
          branch !== undefined ? branch.trim() : null,
          upiId !== undefined ? upiId.trim() : null,
          qrCodeUrl !== undefined ? qrCodeUrl.trim() : null,
          cryptoNetwork !== undefined ? cryptoNetwork.trim().toUpperCase() : null,
          cryptoAddress !== undefined ? cryptoAddress.trim() : null,
          minDeposit !== undefined ? parseFloat(minDeposit) : null,
          maxDeposit !== undefined ? parseFloat(maxDeposit) : null,
          dailyLimit !== undefined ? parseFloat(dailyLimit) : null,
          instructions !== undefined ? instructions.trim() : null,
          isActive !== undefined ? Boolean(isActive) : null,
          isPrimary !== undefined ? Boolean(isPrimary) : null,
          accountId
        ]
      );

      res.json({
        message: 'Deposit account updated successfully',
        account: updateRes.rows[0]
      });
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      res.status(500).json({ error: error.message || 'Failed to update payment method' });
    }
  }
);

/**
 * DELETE /api/payment-methods/:id
 * Admin deletes a deposit account.
 */
paymentMethodRouter.delete(
  '/:id',
  authenticateToken,
  requireRoles(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const accountId = req.params.id;
      const deleteRes = await query(`DELETE FROM deposit_accounts WHERE id = $1 RETURNING id, display_name`, [accountId]);
      if (deleteRes.rows.length === 0) {
        return res.status(404).json({ error: 'Deposit account not found' });
      }

      res.json({
        message: `Account '${deleteRes.rows[0].display_name}' deleted successfully`
      });
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      res.status(500).json({ error: error.message || 'Failed to delete payment method' });
    }
  }
);
