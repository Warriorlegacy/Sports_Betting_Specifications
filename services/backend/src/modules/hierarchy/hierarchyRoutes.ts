import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles, isSubordinateOrSelf } from '../../middleware/auth';
import { allocateCreditAtomic } from '../../db/ledger';

export const hierarchyRouter = Router();

// Allowed default downline creations by role
const ROLE_DOWNLINE_MAP: Record<string, string> = {
  ADMIN: 'SUPER_MASTER',
  SUPER_MASTER: 'MASTER',
  MASTER: 'AGENT',
  AGENT: 'USER'
};

/**
 * Role Definitions with structured Responsibilities, Powers, and Capabilities.
 */
export const ROLES_SPECIFICATION = [
  {
    role: 'ADMIN',
    level: 0,
    title: 'Global Platform Admin (Root)',
    description: 'Supreme administrator with full platform ownership, financial control, and market settlement power.',
    responsibilities: [
      'Maintain overall platform solvency and liquidity reserve',
      'Manage multiple Bank accounts and UPI/QR code deposit options',
      'Oversee global risk exposure and settle/close sports markets',
      'Approve and reject player deposits and withdrawals',
      'Provision genesis credit and manage top-tier franchise accounts'
    ],
    abilities: [
      'Unlimited Genesis Credit Provisioning',
      'Create and manage all roles (Super Master, Master, Agent, User)',
      'Add, edit, and deactivate Bank Accounts and UPI/QR codes',
      'Process (Approve/Reject) all deposits and withdrawals',
      'Reset credentials and passwords for any account',
      'Settle markets, lock markets, and manage data feeds'
    ],
    canCreateRoles: ['SUPER_MASTER', 'MASTER', 'AGENT', 'USER'],
    canBet: false,
    canManageBanking: true,
    canApproveTransactions: true,
    badgeColor: 'purple'
  },
  {
    role: 'SUPER_MASTER',
    level: 1,
    title: 'Super Master (Regional Agency Head)',
    description: 'Regional distributor overseeing multi-territory master agencies and high-volume operations.',
    responsibilities: [
      'Distribute and monitor credit lines to regional Masters',
      'Oversee regional risk exposure and volume turnover',
      'Ensure compliance and settlement across downline agencies'
    ],
    abilities: [
      'Create and provision Master agency accounts',
      'Allocate and recall credit to direct Master agencies',
      'Monitor downline bet records and P&L summaries',
      'Suspend or activate subordinate Master accounts'
    ],
    canCreateRoles: ['MASTER'],
    canBet: false,
    canManageBanking: false,
    canApproveTransactions: false,
    badgeColor: 'blue'
  },
  {
    role: 'MASTER',
    level: 2,
    title: 'Master (City / Franchise Agency)',
    description: 'Local franchise operator managing retail agents and local betting networks.',
    responsibilities: [
      'Manage local networks of retail bookmakers and agents',
      'Distribute credit lines to direct retail agents',
      'Monitor daily retail turnover and exposure'
    ],
    abilities: [
      'Create and provision Agent accounts',
      'Allocate and recall credit to direct Agent bookmakers',
      'Inspect downline agent player bets and risk positions',
      'Suspend or activate subordinate Agent accounts'
    ],
    canCreateRoles: ['AGENT'],
    canBet: false,
    canManageBanking: false,
    canApproveTransactions: false,
    badgeColor: 'emerald'
  },
  {
    role: 'AGENT',
    level: 3,
    title: 'Retail Agent (Local Bookmaker)',
    description: 'Direct retail point-of-contact onboarding players and managing retail player balances.',
    responsibilities: [
      'Direct customer onboarding and player relationship management',
      'Distribute betting credit to verified players',
      'Monitor retail player bet placement and settle cash balances'
    ],
    abilities: [
      'Create direct Player (USER) accounts',
      'Allocate and recall credit to player accounts',
      'Inspect live bets of direct players',
      'Suspend or activate player accounts'
    ],
    canCreateRoles: ['USER'],
    canBet: false,
    canManageBanking: false,
    canApproveTransactions: false,
    badgeColor: 'amber'
  },
  {
    role: 'USER',
    level: 4,
    title: 'Player / Bettor (End Trader)',
    description: 'Direct exchange trader placing Back/Lay bets, building parlays, and trading live sports.',
    responsibilities: [
      'Deposit funds via Admin bank accounts or UPI QR codes',
      'Place responsible sports bets and manage open liabilities',
      'Request timely withdrawals of winnings'
    ],
    abilities: [
      'Place Back and Lay bets on live multi-sport exchange',
      'Cash out open positions early for guaranteed profit/loss',
      'Submit deposit requests with 12-digit UTR',
      'Submit IMPS/UPI withdrawal requests'
    ],
    canCreateRoles: [],
    canBet: true,
    canManageBanking: false,
    canApproveTransactions: false,
    badgeColor: 'slate'
  }
];

/**
 * GET /api/hierarchy/roles
 * Returns complete role definitions, responsibilities, abilities, and powers.
 */
hierarchyRouter.get('/roles', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ roles: ROLES_SPECIFICATION });
});

/**
 * GET /api/hierarchy/tree
 * Returns full recursive downline hierarchy for the logged-in user.
 */
hierarchyRouter.get(
  '/tree',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const rootUserId = req.user!.id;

      // Recursive CTE to query entire subtree
      const result = await query(
        `WITH RECURSIVE downline AS (
           SELECT id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at, 0 as depth
           FROM users 
           WHERE id = $1
           
           UNION ALL
           
           SELECT u.id, u.username, u.role, u.parent_id, u.credit_limit, u.available_credit, u.exposure, u.is_active, u.created_at, d.depth + 1
           FROM users u
           INNER JOIN downline d ON u.parent_id = d.id
         )
         SELECT * FROM downline ORDER BY depth ASC, created_at ASC;`,
        [rootUserId]
      );

      // Build hierarchical tree object in memory
      const nodes = result.rows.map((r) => ({
        id: r.id,
        username: r.username,
        role: r.role,
        parentId: r.parent_id,
        creditLimit: parseFloat(r.credit_limit),
        availableCredit: parseFloat(r.available_credit),
        exposure: parseFloat(r.exposure),
        isActive: r.is_active,
        createdAt: r.created_at,
        depth: r.depth,
        children: [] as any[]
      }));

      const nodeMap = new Map<string, any>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      let treeRoot = null;
      nodes.forEach((n) => {
        if (n.id === rootUserId) {
          treeRoot = n;
        } else if (n.parentId && nodeMap.has(n.parentId)) {
          nodeMap.get(n.parentId).children.push(n);
        }
      });

      res.json({
        tree: treeRoot || (nodes.length > 0 ? nodes[0] : null),
        totalSubordinates: nodes.length - 1,
        flatList: nodes
      });
    } catch (error) {
      console.error('Error fetching hierarchy tree:', error);
      res.status(500).json({ error: 'Failed to fetch hierarchy tree' });
    }
  }
);

/**
 * GET /api/hierarchy/subordinates
 * Returns direct children of the current user.
 */
hierarchyRouter.get(
  '/subordinates',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parentId = req.user!.id;
      const result = await query(
        `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at
         FROM users WHERE parent_id = $1 ORDER BY created_at DESC`,
        [parentId]
      );

      const subordinates = result.rows.map((r) => ({
        id: r.id,
        username: r.username,
        role: r.role,
        parentId: r.parent_id,
        creditLimit: parseFloat(r.credit_limit),
        availableCredit: parseFloat(r.available_credit),
        exposure: parseFloat(r.exposure),
        isActive: r.is_active,
        createdAt: r.created_at
      }));

      res.json({ subordinates });
    } catch (error) {
      console.error('Error fetching direct subordinates:', error);
      res.status(500).json({ error: 'Failed to fetch subordinates' });
    }
  }
);

/**
 * POST /api/hierarchy/users
 * Creates a new downline user account with custom/auto username and password.
 */
hierarchyRouter.post(
  '/users',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const creator = req.user!;
      const { username, password, initialCredit, role, parentId: customParentId } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Determine target parent
      let targetParentId = creator.id;
      if (creator.role === 'ADMIN' && customParentId) {
        targetParentId = customParentId;
      }

      // Validate role creation authority
      let targetRole = role;
      if (creator.role === 'ADMIN') {
        targetRole = role || 'SUPER_MASTER';
      } else {
        const expectedRole = ROLE_DOWNLINE_MAP[creator.role];
        if (!expectedRole) {
          return res.status(403).json({ error: 'Your role cannot create subordinate accounts' });
        }
        targetRole = expectedRole;
      }

      const cleanUsername = username.trim();

      // Check if username already exists
      const existingUser = await query(`SELECT id FROM users WHERE username = $1`, [cleanUsername]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: `Username '${cleanUsername}' is already taken` });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const creditNum = Math.max(0, parseFloat(initialCredit || '0'));

      // Validate creator balance if initial credit is allocated
      if (creator.role !== 'ADMIN' && creditNum > 0) {
        const creatorRes = await query(`SELECT available_credit FROM users WHERE id = $1`, [creator.id]);
        const creatorAvail = parseFloat(creatorRes.rows[0]?.available_credit || '0');
        if (creatorAvail < creditNum) {
          return res.status(400).json({
            error: `Insufficient available credit to provision account. Available: ${creatorAvail}, Requested: ${creditNum}`
          });
        }
      }

      // Insert new user
      const insertRes = await query(
        `INSERT INTO users (username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active)
         VALUES ($1, $2, $3, $4, 0.00, 0.00, 0.00, TRUE)
         RETURNING id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at`,
        [cleanUsername, passwordHash, targetRole, targetParentId]
      );

      const newUser = insertRes.rows[0];

      // If initial credit specified, allocate it atomically
      if (creditNum > 0) {
        await allocateCreditAtomic(creator.id, newUser.id, creditNum, `Initial credit provision on account creation as ${newUser.role}`);
      }

      res.status(201).json({
        message: `Account '${newUser.username}' created successfully as ${newUser.role}`,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          parentId: newUser.parent_id,
          creditLimit: creditNum,
          availableCredit: creditNum,
          exposure: 0,
          isActive: newUser.is_active,
          createdAt: newUser.created_at
        },
        credentials: {
          username: newUser.username,
          password,
          role: newUser.role,
          initialCredit: creditNum
        }
      });
    } catch (error: any) {
      console.error('Error creating subordinate user:', error);
      res.status(500).json({ error: error.message || 'Failed to create subordinate user' });
    }
  }
);

/**
 * PATCH /api/hierarchy/users/:userId/status
 * Suspends or activates a subordinate account.
 */
hierarchyRouter.patch(
  '/users/:userId/status',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requesterId = req.user!.id;
      const targetUserId = req.params.userId;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive boolean flag is required' });
      }

      // Check hierarchy subtree access
      if (req.user!.role !== 'ADMIN') {
        const isSub = await isSubordinateOrSelf(requesterId, targetUserId);
        if (!isSub || requesterId === targetUserId) {
          return res.status(403).json({ error: 'Forbidden: Cannot change status of this account' });
        }
      }

      const updateRes = await query(
        `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, is_active`,
        [isActive, targetUserId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: `User ${updateRes.rows[0].username} is now ${isActive ? 'ACTIVE' : 'SUSPENDED'}`,
        user: updateRes.rows[0]
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
);

/**
 * PATCH /api/hierarchy/users/:userId/password
 * Admin or direct parent resets a user's password.
 */
hierarchyRouter.patch(
  '/users/:userId/password',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requesterId = req.user!.id;
      const targetUserId = req.params.userId;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Check access
      if (req.user!.role !== 'ADMIN') {
        const isSub = await isSubordinateOrSelf(requesterId, targetUserId);
        if (!isSub) {
          return res.status(403).json({ error: 'Forbidden: You can only reset passwords of downline accounts' });
        }
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const updateRes = await query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, role`,
        [newHash, targetUserId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: `Password for ${updateRes.rows[0].username} has been reset successfully`,
        user: updateRes.rows[0],
        newPassword
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: error.message || 'Failed to reset user password' });
    }
  }
);

/**
 * PATCH /api/hierarchy/users/:userId/role
 * Admin changes or assigns a different role to a user.
 */
hierarchyRouter.patch(
  '/users/:userId/role',
  authenticateToken,
  requireRoles(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const targetUserId = req.params.userId;
      const { newRole } = req.body;

      const validRoles = ['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT', 'USER'];
      if (!newRole || !validRoles.includes(newRole)) {
        return res.status(400).json({ error: `Valid role is required (${validRoles.join(', ')})` });
      }

      const updateRes = await query(
        `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, role`,
        [newRole, targetUserId]
      );

      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: `Role for ${updateRes.rows[0].username} updated to ${newRole}`,
        user: updateRes.rows[0]
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: error.message || 'Failed to update user role' });
    }
  }
);
