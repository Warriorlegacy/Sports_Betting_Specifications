import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../db/pool';

export interface AuthUser {
  id: string;
  username: string;
  role: 'ADMIN' | 'SUPER_MASTER' | 'MASTER' | 'AGENT' | 'USER';
  parentId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Verifies JWT token in Authorization: Bearer <token> header.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  jwt.verify(token, config.jwtSecret, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token' });
    }
    req.user = decodedUser as AuthUser;
    next();
  });
}

/**
 * Enforces role-based permissions (e.g. ['ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT']).
 */
export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: role '${req.user.role}' lacks permission. Required: [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
}

/**
 * Checks if targetUserId is equal to requesterId or is within requester's downline subtree using a recursive CTE.
 */
export async function isSubordinateOrSelf(requesterId: string, targetUserId: string): Promise<boolean> {
  if (requesterId === targetUserId) return true;

  const result = await query(
    `WITH RECURSIVE downline AS (
       SELECT id FROM users WHERE id = $1
       UNION ALL
       SELECT u.id FROM users u
       INNER JOIN downline d ON u.parent_id = d.id
     )
     SELECT EXISTS (SELECT 1 FROM downline WHERE id = $2) as is_subordinate;`,
    [requesterId, targetUserId]
  );

  return !!result.rows[0]?.is_subordinate;
}

/**
 * Middleware ensuring requester has authority over the target user specified in req.params.userId.
 */
export async function verifySubtreeAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const targetUserId = req.params.userId || req.body.userId || req.body.receiverId;
    if (!targetUserId) {
      return next();
    }

    // Global Admin has universal access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const hasAccess = await isSubordinateOrSelf(req.user.id, targetUserId);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Forbidden: Target user is outside your administrative hierarchy branch'
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying subtree access:', error);
    res.status(500).json({ error: 'Internal server error verifying hierarchy permissions' });
  }
}
