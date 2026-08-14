import { Router, Response } from 'express';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles } from '../../middleware/auth';

export const reportRouter = Router();

/**
 * GET /api/reports/risk-summary
 * Summarizes total exposure and credit volume across subordinates for risk monitoring.
 */
reportRouter.get(
  '/risk-summary',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requesterId = req.user!.id;
      const role = req.user!.role;

      let sql = '';
      let params: any[] = [];

      if (role === 'ADMIN') {
        sql = `
          SELECT 
            COUNT(u.id) as total_users,
            COALESCE(SUM(u.credit_limit), 0) as total_credit_limit,
            COALESCE(SUM(u.available_credit), 0) as total_available_credit,
            COALESCE(SUM(u.exposure), 0) as total_exposure,
            (SELECT COUNT(*) FROM bets WHERE status IN ('MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED')) as open_bets_count,
            (SELECT COALESCE(SUM(stake), 0) FROM bets WHERE status = 'MATCHED') as matched_volume_total
          FROM users u;
        `;
      } else {
        sql = `
          WITH RECURSIVE downline AS (
            SELECT id FROM users WHERE id = $1
            UNION ALL
            SELECT u.id FROM users u INNER JOIN downline d ON u.parent_id = d.id
          )
          SELECT 
            COUNT(u.id) as total_users,
            COALESCE(SUM(u.credit_limit), 0) as total_credit_limit,
            COALESCE(SUM(u.available_credit), 0) as total_available_credit,
            COALESCE(SUM(u.exposure), 0) as total_exposure,
            (SELECT COUNT(*) FROM bets b JOIN downline d ON b.user_id = d.id WHERE b.status IN ('MATCHED', 'PARTIALLY_MATCHED', 'UNMATCHED')) as open_bets_count,
            (SELECT COALESCE(SUM(stake), 0) FROM bets b JOIN downline d ON b.user_id = d.id WHERE b.status = 'MATCHED') as matched_volume_total
          FROM users u
          JOIN downline dl ON u.id = dl.id
          WHERE u.id != $1;
        `;
        params = [requesterId];
      }

      const result = await query(sql, params);
      const row = result.rows[0];

      res.json({
        summary: {
          totalUsers: parseInt(row.total_users || '0', 10),
          totalCreditLimit: parseFloat(row.total_credit_limit || '0'),
          totalAvailableCredit: parseFloat(row.total_available_credit || '0'),
          totalExposure: parseFloat(row.total_exposure || '0'),
          openBetsCount: parseInt(row.open_bets_count || '0', 10),
          matchedVolumeTotal: parseFloat(row.matched_volume_total || '0')
        }
      });
    } catch (error) {
      console.error('Error generating risk summary:', error);
      res.status(500).json({ error: 'Failed to generate risk report' });
    }
  }
);
