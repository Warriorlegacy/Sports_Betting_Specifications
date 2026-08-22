const express = require('express');
const { initializeDatabase } = require('../services/backend/dist/db/init');
const { query } = require('../services/backend/dist/db/pool');
const { authRouter } = require('../services/backend/dist/modules/auth/authRoutes');

async function testAuthRoutes() {
  console.log('🧪 Testing Auth API Routes with Secure Direct OTP Flow...\n');

  console.log('0. Initializing DB schema and migrations...');
  await initializeDatabase();
  console.log('✅ DB Schema verified.\n');

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  try {
    // 1. Send OTP to Phone
    console.log('1. Dispatching OTP to Phone (+919811223344)...');
    const sendRes1 = await fetch(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9811223344', channel: 'SMS' })
    });
    const sendData1 = await sendRes1.json();
    console.log('Send OTP Response:', sendData1);

    if (!sendData1.success) {
      throw new Error('Send OTP failed');
    }

    // Assert that NO plaintext OTP or deep-link leaks exist in the API response
    if (sendData1.whatsappLink || sendData1.telegramLink || sendData1.testOtp) {
      throw new Error('SECURITY VIOLATION: OTP or plaintext links exposed in API response!');
    }
    console.log('🔒 Verified: Response is sanitized and exposes NO OTP to frontend.');

    // Fetch generated OTP from DB for automated test verification
    const dbOtpRes = await query(`SELECT otp FROM otps WHERE phone = '9811223344' LIMIT 1`);
    const otpCode = dbOtpRes.rows[0]?.otp;
    if (!otpCode) {
      throw new Error('OTP was not persisted in database');
    }

    // 2. Verify with Incorrect OTP
    console.log('\n2. Testing verification with invalid OTP...');
    const badVerifyRes = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9811223344', otp: '000000' })
    });
    const badVerifyData = await badVerifyRes.json();
    console.log('Bad Verify Status:', badVerifyRes.status, badVerifyData);
    if (badVerifyRes.status !== 401) {
      throw new Error('Expected 401 on invalid OTP');
    }

    // 3. Verify with Correct OTP
    console.log('\n3. Testing verification with correct OTP...');
    const goodVerifyRes = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9811223344', otp: otpCode })
    });
    const goodVerifyData = await goodVerifyRes.json();
    console.log('Good Verify Status:', goodVerifyRes.status, goodVerifyData);
    if (!goodVerifyData.token || !goodVerifyData.user) {
      throw new Error('Verification failed to return token and user');
    }

    // 4. Send OTP to Email
    console.log('\n4. Dispatching OTP to Email (vip_player@nexusvip.in)...');
    const emailSendRes = await fetch(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vip_player@nexusvip.in', channel: 'EMAIL' })
    });
    const emailSendData = await emailSendRes.json();
    console.log('Email Send Response:', emailSendData);
    if (!emailSendData.success) {
      throw new Error('Email OTP dispatch failed');
    }
    if (emailSendData.testOtp || emailSendData.whatsappLink) {
      throw new Error('SECURITY VIOLATION: Email OTP response contains plaintext leak');
    }

    const emailOtpRes = await query(`SELECT otp FROM otps WHERE phone = 'vip_player@nexusvip.in' LIMIT 1`);
    const emailOtpCode = emailOtpRes.rows[0]?.otp;

    // 5. Verify Email OTP
    console.log('\n5. Verifying Email OTP...');
    const emailVerifyRes = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vip_player@nexusvip.in', otp: emailOtpCode })
    });
    const emailVerifyData = await emailVerifyRes.json();
    console.log('Email Verify Status:', emailVerifyRes.status, emailVerifyData);
    if (!emailVerifyData.token || !emailVerifyData.user) {
      throw new Error('Email OTP verification failed');
    }

    console.log('\n🎉 ALL AUTH & PRODUCTION SECURE OTP ROUTE TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

testAuthRoutes().catch((err) => {
  console.error('❌ Auth Routes Test Failed:', err);
  process.exit(1);
});

