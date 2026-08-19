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

    // Verify password strictly with bcrypt
    const isValid = await bcrypt.compare(password, user.password_hash).catch(() => false);

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

/**
 * POST /api/auth/register
 * Public player self-registration with instant starter wallet credit.
 */
authRouter.post('/register', async (req, res: Response) => {
  try {
    const { username, password, phone, referralCode } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existing = await query(`SELECT id FROM users WHERE username = $1`, [cleanUsername]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `Username '${cleanUsername}' is already taken` });
    }

    // Find default agent or master to act as parent node
    const parentRes = await query(
      `SELECT id FROM users WHERE role = 'AGENT' AND is_active = TRUE ORDER BY created_at ASC LIMIT 1`
    );
    let parentId = parentRes.rows[0]?.id;

    if (!parentId) {
      const adminRes = await query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
      parentId = adminRes.rows[0]?.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const welcomeBonus = 500.00; // Starter promotional balance

    const insertRes = await query(
      `INSERT INTO users (
        username, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active
      ) VALUES ($1, $2, 'USER', $3, 10000.00, $4, 0.00, TRUE)
      RETURNING id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at`,
      [cleanUsername, passwordHash, parentId, welcomeBonus]
    );

    const newUser = insertRes.rows[0];

    // Log welcome bonus in ledger
    await query(
      `INSERT INTO ledger_entries (sender_id, receiver_id, amount, transaction_type, reference_id, notes)
       VALUES ($1, $2, $3, 'WELCOME_BONUS', $4, $5)`,
      [
        parentId,
        newUser.id,
        welcomeBonus,
        `BONUS_${newUser.id.substring(0, 8).toUpperCase()}`,
        `Instant Welcome Bonus on registration (Ref: ${referralCode || 'NEXUS500'})`
      ]
    );

    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      parentId: newUser.parent_id
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account registered successfully! ₹500 welcome credit has been added to your wallet.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        parentId: newUser.parent_id,
        creditLimit: parseFloat(newUser.credit_limit),
        availableCredit: parseFloat(newUser.available_credit),
        exposure: 0
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during registration' });
  }
});

