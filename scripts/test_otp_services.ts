import { sendOtpToTarget } from '../services/backend/src/services/smsService';

async function testFreeOtpServices() {
  console.log('🧪 Starting Free Multi-Channel OTP Verification Services Test Suite...\n');

  // Test 1: SMS Channel Dispatch (Fast2SMS / 2Factor / MSG91 / Sandbox)
  console.log('--- Test 1: Mobile SMS OTP Dispatch ---');
  const smsResult = await sendOtpToTarget({
    phoneFormatted: '+919876543210',
    raw10Digits: '9876543210',
    otpCode: '839201',
    channel: 'SMS'
  });
  console.log('SMS Result:', smsResult);
  if (!smsResult.success || !smsResult.testOtp) {
    throw new Error('SMS OTP dispatch failed');
  }
  console.log('✅ SMS OTP Dispatch Passed!\n');

  // Test 2: WhatsApp 1-Click Gateway Dispatch
  console.log('--- Test 2: WhatsApp 1-Click Gateway Dispatch ---');
  const waResult = await sendOtpToTarget({
    phoneFormatted: '+919876543210',
    raw10Digits: '9876543210',
    otpCode: '492015',
    channel: 'WHATSAPP'
  });
  console.log('WhatsApp Result:', waResult);
  if (!waResult.success || !waResult.whatsappLink || !waResult.whatsappLink.includes('wa.me/919876543210')) {
    throw new Error('WhatsApp 1-Click Link generation failed');
  }
  console.log('✅ WhatsApp 1-Click Gateway Dispatch Passed!\n');

  // Test 3: Free Email OTP Dispatch (Resend / Brevo / Supabase)
  console.log('--- Test 3: Free Email OTP Dispatch ---');
  const emailResult = await sendOtpToTarget({
    emailRecipient: 'trader_vip@example.com',
    otpCode: '617283',
    channel: 'EMAIL'
  });
  console.log('Email Result:', emailResult);
  if (!emailResult.success || !emailResult.testOtp) {
    throw new Error('Email OTP dispatch failed');
  }
  console.log('✅ Free Email OTP Dispatch Passed!\n');

  // Test 4: Free Telegram Bot API Dispatch
  console.log('--- Test 4: Free Telegram Bot API Dispatch ---');
  const tgResult = await sendOtpToTarget({
    telegramId: '@test_trader',
    otpCode: '901248',
    channel: 'TELEGRAM'
  });
  console.log('Telegram Result:', tgResult);
  if (!tgResult.success || !tgResult.telegramLink) {
    throw new Error('Telegram OTP dispatch failed');
  }
  console.log('✅ Telegram Bot OTP Dispatch Passed!\n');

  console.log('🎉 ALL FREE MULTI-CHANNEL OTP SERVICE TESTS PASSED SUCCESSFULLY!');
}

testFreeOtpServices().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
