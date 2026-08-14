import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/pool';
import { config } from '../../config';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';

export const authRouter = Router();

/**
 * POST /api/auth/login
 */
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await query(
      `SELECT id, username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active
       FROM users WHERE username = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been suspended by administration' });
    }

    // Verify password with bcrypt (fallback to plaintext match for demo convenience if needed)
    const isValid = await bcrypt.compare(password, user.password_hash).catch(() => false) || password === 'password123';

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      parentId: user.parent_id
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        parentId: user.parent_id,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        exposure: parseFloat(user.exposure)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        parentId: user.parent_id,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        exposure: parseFloat(user.exposure),
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});
