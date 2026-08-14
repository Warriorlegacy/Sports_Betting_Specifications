import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';
import { allocateCreditAtomic, recallCreditAtomic } from '../../db/ledger';

export const ledgerRouter = Router();

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
      const { receiverId, amount, notes } = req.body; // receiverId is the child in UI

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
