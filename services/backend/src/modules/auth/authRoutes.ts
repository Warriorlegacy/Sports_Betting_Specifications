import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/pool';
import { config } from '../../config';
import { AuthenticatedRequest, authenticateToken } from '../../middleware/auth';
import { sendOtpToTarget } from '../../services/smsService';

export const authRouter = Router();

// In-memory OTP cache for instant sub-millisecond lookups + DB fallback
const memoryOtpStore = new Map<string, { otp: string; expiresAt: number }>();

// Anti-abuse rate limiter: max 5 requests per 5 minutes per identifier
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxAttempts) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

function normalizePhone(rawPhone: string): { formatted: string; raw10: string } {
  const digits = rawPhone.replace(/\D/g, '');
  const raw10 = digits.length >= 10 ? digits.slice(-10) : digits;
  const formatted = `+91${raw10}`;
  return { formatted, raw10 };
}

function normalizeEmail(rawEmail: string): string {
  return rawEmail.trim().toLowerCase();
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

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit OTP code to mobile phone, email, or Telegram
 * Supports: Fast2SMS, 2Factor.in, MSG91, Resend, Brevo, Nodemailer, WhatsApp, Telegram, Supabase Auth
 */
authRouter.post('/send-otp', async (req, res: Response) => {
  try {
    const { phone, email, telegramId, channel = 'SMS' } = req.body;

    let targetKey = '';
    let phoneFormatted = '';
    let raw10 = '';
    let emailClean = '';

    if (email && String(email).includes('@')) {
      emailClean = normalizeEmail(String(email));
      targetKey = emailClean;
    } else if (phone && typeof phone === 'string' && phone.trim().length >= 6) {
      const parsed = normalizePhone(phone);
      phoneFormatted = parsed.formatted;
      raw10 = parsed.raw10;
      targetKey = raw10;
    } else if (telegramId) {
      targetKey = String(telegramId).trim();
    } else {
      return res.status(400).json({ error: 'A valid 10-digit mobile number or email address is required' });
    }

    // Anti-abuse rate limiting check
    if (!checkRateLimit(targetKey, 5, 5 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait 5 minutes before requesting a new code.'
      });
    }

    // Generate random secure 6-digit OTP (e.g. 748201)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory cache
    memoryOtpStore.set(targetKey, { otp, expiresAt });
    if (phoneFormatted) memoryOtpStore.set(phoneFormatted, { otp, expiresAt });
    if (emailClean) memoryOtpStore.set(emailClean, { otp, expiresAt });

    // Store in PostgreSQL DB table
    try {
      await query(
        `INSERT INTO otps (phone, otp, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
         ON CONFLICT (phone) DO UPDATE SET otp = $2, expires_at = NOW() + INTERVAL '5 minutes'`,
        [targetKey, otp]
      );
    } catch (dbErr) {
      // In-memory fallback
      console.warn('DB OTP persist error (using memory store):', dbErr);
    }

    // Dispatch via multi-gateway dispatcher
    const dispatchResult = await sendOtpToTarget({
      phoneFormatted,
      raw10Digits: raw10,
      emailRecipient: emailClean,
      telegramId: telegramId ? String(telegramId) : undefined,
      otpCode: otp,
      channel
    });

    console.log(`[Direct OTP Engine] Dispatched verification code to ${targetKey} via ${dispatchResult.provider}`);

    res.json({
      success: true,
      message: `OTP sent successfully to ${emailClean || phoneFormatted || targetKey}`,
      identifier: emailClean || phoneFormatted || targetKey,
      phone: phoneFormatted || undefined,
      email: emailClean || undefined,
      expiresInSeconds: 300,
      channel: dispatchResult.channel,
      provider: dispatchResult.provider
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
    const { phone, email, identifier, otp } = req.body;

    const rawTarget = email || phone || identifier;
    if (!rawTarget || !otp) {
      return res.status(400).json({ error: 'Phone/Email identifier and 6-digit OTP are required' });
    }

    const cleanOtp = String(otp).trim();
    let isEmail = String(rawTarget).includes('@');
    let emailClean = isEmail ? normalizeEmail(String(rawTarget)) : '';
    let phoneParsed = !isEmail ? normalizePhone(String(rawTarget)) : { formatted: '', raw10: '' };

    // Check in-memory store
    let isValid = false;
    const lookupKeys = [
      emailClean,
      phoneParsed.formatted,
      phoneParsed.raw10,
      String(rawTarget).trim()
    ].filter(Boolean);

    for (const key of lookupKeys) {
      const entry = memoryOtpStore.get(key);
      if (entry && entry.otp === cleanOtp && entry.expiresAt > Date.now()) {
        isValid = true;
        break;
      }
    }

    // Check DB store if not validated in memory
    if (!isValid) {
      try {
        const dbOtpRes = await query(
          `SELECT otp, expires_at FROM otps WHERE phone = ANY($1::text[])`,
          [lookupKeys]
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
      return res.status(401).json({ error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    // Clear used OTP from memory and DB
    for (const key of lookupKeys) {
      memoryOtpStore.delete(key);
    }
    query(`DELETE FROM otps WHERE phone = ANY($1::text[])`, [lookupKeys]).catch(() => {});

    // Find or Auto-Onboard Player Account
    const usernameGenerated = isEmail
      ? `player_${emailClean.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}`
      : `player_${phoneParsed.raw10}`;

    let userRes = await query(
      `SELECT id, username, role, parent_id, credit_limit, available_credit, exposure, is_active
       FROM users 
       WHERE phone = $1 OR phone = $2 OR username = $3 OR username = $4 LIMIT 1`,
      [phoneParsed.formatted, phoneParsed.raw10, usernameGenerated, emailClean]
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

      const randomPass = Math.random().toString(36).substring(2, 14);
      const passwordHash = await bcrypt.hash(randomPass, 10);

      const insertRes = await query(
        `INSERT INTO users (
          username, phone, password_hash, role, parent_id, credit_limit, available_credit, exposure, is_active
        ) VALUES ($1, $2, $3, 'USER', $4, 10000.00, 0.00, 0.00, TRUE)
        RETURNING id, username, role, parent_id, credit_limit, available_credit, exposure, is_active`,
        [usernameGenerated, phoneParsed.formatted || emailClean, passwordHash, parentId]
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
