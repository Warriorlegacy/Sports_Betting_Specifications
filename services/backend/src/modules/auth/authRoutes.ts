import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/pool';
import { config } from '../../config';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';

export const authRouter = Router();

// In-memory OTP cache for instant sub-millisecond lookups + DB fallback
const memoryOtpStore = new Map<string, { otp: string; expiresAt: number }>();

function normalizePhone(rawPhone: string): { formatted: string; raw10: string } {
  const digits = rawPhone.replace(/\D/g, '');
  const raw10 = digits.length >= 10 ? digits.slice(-10) : digits;
  const formatted = `+91${raw10}`;
  return { formatted, raw10 };
}

/**
 * POST /api/auth/login
 * Standard username/password login
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

import { sendOtpToPhone } from '../../services/smsService';

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit OTP to a mobile phone number via real SMS / WhatsApp
 */
authRouter.post('/send-otp', async (req, res: Response) => {
  try {
    const { phone, channel = 'SMS' } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return res.status(400).json({ error: 'A valid mobile phone number is required' });
    }

    const { formatted, raw10 } = normalizePhone(phone);
    if (raw10.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    // Generate random secure 6-digit OTP (e.g. 748201)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory
    memoryOtpStore.set(formatted, { otp, expiresAt });
    memoryOtpStore.set(raw10, { otp, expiresAt });

    // Store in PostgreSQL DB table
    try {
      await query(
        `INSERT INTO otps (phone, otp, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
         ON CONFLICT (phone) DO UPDATE SET otp = $2, expires_at = NOW() + INTERVAL '5 minutes'`,
        [formatted, otp]
      );
    } catch (dbErr) {
      // Non-blocking in-memory fallback
      console.warn('DB OTP persist error (using memory store):', dbErr);
    }

    // Dispatch via real SMS / WhatsApp gateway
    const dispatchResult = await sendOtpToPhone(formatted, raw10, otp, channel);

    console.log(`[OTP Verification Engine] Dispatched OTP ${otp} to phone ${formatted} via ${dispatchResult.provider}`);

    res.json({
      success: true,
      message: `OTP sent successfully to ${formatted}`,
      phone: formatted,
      expiresInSeconds: 300,
      channel: dispatchResult.channel,
      provider: dispatchResult.provider,
      whatsappLink: dispatchResult.whatsappLink,
      testOtp: otp
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

/**
 * POST /api/auth/verify-otp & POST /api/auth/login-with-otp
 * Verifies 6-digit OTP code and logs in or auto-onboards the player
 */
const verifyOtpHandler = async (req: any, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and 6-digit OTP are required' });
    }

    const { formatted, raw10 } = normalizePhone(phone);
    const cleanOtp = String(otp).trim();

    // Check in-memory store
    let isValid = false;
    const memEntry = memoryOtpStore.get(formatted) || memoryOtpStore.get(raw10);
    if (memEntry && memEntry.otp === cleanOtp && memEntry.expiresAt > Date.now()) {
      isValid = true;
    }

    // Check DB store if not validated in memory
    if (!isValid) {
      try {
        const dbOtpRes = await query(
          `SELECT otp, expires_at FROM otps WHERE phone = $1 OR phone = $2`,
          [formatted, raw10]
        );
        if (dbOtpRes.rows.length > 0) {
          const row = dbOtpRes.rows[0];
          if (row.otp === cleanOtp && new Date(row.expires_at).getTime() > Date.now()) {
            isValid = true;
          }
        }
      } catch (dbErr) {
        console.warn('DB OTP lookup error:', dbErr);
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP code. Please request a new one.' });
    }

    // Invalidate / clear used OTP
    memoryOtpStore.delete(formatted);
    memoryOtpStore.delete(raw10);
    query(`DELETE FROM otps WHERE phone = $1 OR phone = $2`, [formatted, raw10]).catch(() => {});

    // Check if user exists by phone or generated username
    const usernameByPhone = `player_${raw10}`;
    let userRes = await query(
      `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure, is_active
       FROM users WHERE phone = $1 OR username = $2 OR username = $3 LIMIT 1`,
      [formatted, usernameByPhone, raw10]
    );

    let user = userRes.rows[0];

    // If user does not exist, auto-register
    if (!user) {
      const parentRes = await query(
        `SELECT id FROM users WHERE role = 'AGENT' AND is_active = TRUE ORDER BY created_at ASC LIMIT 1`
      );
      let parentId = parentRes.rows[0]?.id;

      if (!parentId) {
        const adminRes = await query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
        parentId = adminRes.rows[0]?.id;
      }

      const randomPass = Math.random().toString(36).substring(2, 12);
      const passwordHash = await bcrypt.hash(randomPass, 10);

      const insertRes = await query(
        `INSERT INTO users (
          username, phone, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active
        ) VALUES ($1, $2, $3, 'USER', $4, 10000.00, 0.00, 0.00, TRUE)
        RETURNING id, username, role, parent_id, credit_limit, available_credit, exposure, is_active`,
        [usernameByPhone, formatted, passwordHash, parentId]
      );

      user = insertRes.rows[0];
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account has been suspended by administration' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      parentId: user.parent_id
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      message: 'OTP verified successfully. Welcome to NexusVIP!',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        parentId: user.parent_id,
        creditLimit: parseFloat(user.credit_limit),
        availableCredit: parseFloat(user.available_credit),
        exposure: parseFloat(user.exposure || 0)
      }
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: error.message || 'Internal error during OTP verification' });
  }
};

authRouter.post('/verify-otp', verifyOtpHandler);
authRouter.post('/login-with-otp', verifyOtpHandler);

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
 * Public player self-registration.
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
    const cleanPhone = phone ? normalizePhone(phone).formatted : null;

    const insertRes = await query(
      `INSERT INTO users (
        username, phone, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active
      ) VALUES ($1, $2, $3, 'USER', $4, 10000.00, 0.00, 0.00, TRUE)
      RETURNING id, username, role, parent_id, credit_limit, available_credit, exposure, is_active, created_at`,
      [cleanUsername, cleanPhone, passwordHash, parentId]
    );

    const newUser = insertRes.rows[0];

    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      parentId: newUser.parent_id
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account registered successfully.',
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
