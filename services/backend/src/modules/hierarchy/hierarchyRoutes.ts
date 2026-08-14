import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../db/pool';
import { AuthenticatedRequest, authenticateToken, requireRoles, isSubordinateOrSelf } from '../../middleware/auth';
import { allocateCreditAtomic } from '../../db/ledger';

export const hierarchyRouter = Router();

// Allowed downline creations by role
const ROLE_DOWNLINE_MAP: Record<string, string> = {
  ADMIN: 'SUPER_MASTER',
  SUPER_MASTER: 'MASTER',
  MASTER: 'AGENT',
  AGENT: 'USER'
};

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
 * Creates a new downline user account.
 */
hierarchyRouter.post(
  '/users',
  authenticateToken,
  requireRoles(['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const creator = req.user!;
      const { username, password, initialCredit, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Determine expected role
      const expectedRole = ROLE_DOWNLINE_MAP[creator.role];
      if (!expectedRole) {
        return res.status(403).json({ error: 'Your role cannot create subordinate accounts' });
      }

      // If role is explicitly provided, verify it is allowed
      const targetRole = role || expectedRole;
      if (targetRole !== expectedRole) {
        return res.status(400).json({
          error: `Invalid role creation. As a ${creator.role}, you can only create ${expectedRole} accounts.`
        });
      }

      // Check if username already exists
      const existingUser = await query(`SELECT id FROM users WHERE username = $1`, [username.trim()]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: `Username '${username}' is already taken` });
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
        [username.trim(), passwordHash, targetRole, creator.id]
      );

      const newUser = insertRes.rows[0];

      // If initial credit specified, allocate it atomically
      if (creditNum > 0) {
        await allocateCreditAtomic(creator.id, newUser.id, creditNum, 'Initial credit provision upon account creation');
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
