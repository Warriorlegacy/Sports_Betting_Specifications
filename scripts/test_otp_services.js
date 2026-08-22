const { sendOtpToTarget } = require('../services/backend/dist/services/smsService');

async function runOtpTests() {
  console.log('🧪 Starting Direct Multi-Channel OTP Verification Services Test Suite...\n');

  // Test 1: SMS Channel
  console.log('--- Test 1: Mobile SMS OTP Direct Dispatch ---');
  const smsResult = await sendOtpToTarget({
    phoneFormatted: '+919876543210',
    raw10Digits: '9876543210',
    otpCode: '839201',
    channel: 'SMS'
  });
  console.log('SMS Result:', smsResult);
  if (!smsResult.success || smsResult.channel !== 'SMS') {
    throw new Error('SMS OTP direct dispatch failed');
  }
  console.log('✅ SMS OTP Direct Dispatch Passed!\n');

  // Test 2: WhatsApp Direct Gateway
  console.log('--- Test 2: WhatsApp Direct Gateway Dispatch ---');
  const waResult = await sendOtpToTarget({
    phoneFormatted: '+919876543210',
    raw10Digits: '9876543210',
    otpCode: '492015',
    channel: 'WHATSAPP'
  });
  console.log('WhatsApp Result:', waResult);
  if (!waResult.success || waResult.channel !== 'WHATSAPP') {
    throw new Error('WhatsApp Direct Gateway Dispatch failed');
  }
  console.log('✅ WhatsApp Direct Gateway Dispatch Passed!\n');

  // Test 3: Direct Email OTP
  console.log('--- Test 3: Direct Email OTP Dispatch ---');
  const emailResult = await sendOtpToTarget({
    emailRecipient: 'trader_vip@example.com',
    otpCode: '617283',
    channel: 'EMAIL'
  });
  console.log('Email Result:', emailResult);
  if (!emailResult.success || emailResult.channel !== 'EMAIL') {
    throw new Error('Email OTP direct dispatch failed');
  }
  console.log('✅ Direct Email OTP Dispatch Passed!\n');

  // Test 4: Direct Telegram Bot API
  console.log('--- Test 4: Direct Telegram Bot API Dispatch ---');
  const tgResult = await sendOtpToTarget({
    telegramId: '@test_trader',
    otpCode: '901248',
    channel: 'TELEGRAM'
  });
  console.log('Telegram Result:', tgResult);
  if (!tgResult.success || tgResult.channel !== 'TELEGRAM') {
    throw new Error('Telegram OTP direct dispatch failed');
  }
  console.log('✅ Telegram Bot OTP Direct Dispatch Passed!\n');

  console.log('🎉 ALL DIRECT MULTI-CHANNEL OTP SERVICE TESTS PASSED 100% SECURELY!');
}

runOtpTests().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});

