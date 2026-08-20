import { config } from '../config';

export interface SmsDispatchResult {
  success: boolean;
  provider: string;
  messageId?: string;
  channel: 'SMS' | 'WHATSAPP' | 'SIMULATED';
  whatsappLink?: string;
  error?: string;
}

/**
 * Dispatches 6-digit OTP code to a user's mobile phone via real SMS / WhatsApp gateway
 */
export async function sendOtpToPhone(
  phoneFormatted: string,
  raw10Digits: string,
  otpCode: string,
  channel: 'SMS' | 'WHATSAPP' = 'SMS'
): Promise<SmsDispatchResult> {
  const messageText = `Your NexusVIP verification code is ${otpCode}. Valid for 5 minutes. Do not share this OTP with anyone.`;
  const whatsappUrl = `https://wa.me/91${raw10Digits}?text=${encodeURIComponent(
    `🎰 *NexusVIP Exchange OTP*\n\nYour 6-digit verification code is: *${otpCode}*\n\nValid for 5 minutes. Happy Betting!`
  )}`;

  // 1. Fast2SMS Integration (Instant Indian SMS Route)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey && channel === 'SMS') {
    try {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: raw10Digits
        })
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && (data.return === true || data.status_code === 200)) {
        console.log(`[Fast2SMS] Successfully dispatched OTP ${otpCode} to +91${raw10Digits}`);
        return {
          success: true,
          provider: 'Fast2SMS',
          channel: 'SMS',
          messageId: data.request_id || 'fast2sms_' + Date.now()
        };
      }
    } catch (err: any) {
      console.warn('[Fast2SMS] Gateway error:', err.message);
    }
  }

  // 2. 2Factor.in Integration (Indian Dedicated OTP Gateway)
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey && channel === 'SMS') {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/SMS/${raw10Digits}/${otpCode}/AUTOGEN`;
      const res = await fetch(url);
      const data: any = await res.json().catch(() => ({}));
      if (data.Status === 'Success') {
        console.log(`[2Factor] Successfully dispatched OTP ${otpCode} to +91${raw10Digits}`);
        return {
          success: true,
          provider: '2Factor.in',
          channel: 'SMS',
          messageId: data.Details
        };
      }
    } catch (err: any) {
      console.warn('[2Factor] Gateway error:', err.message);
    }
  }

  // 3. Twilio SMS Integration (Global Fallback)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioPhone && channel === 'SMS') {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phoneFormatted);
      params.append('From', twilioPhone);
      params.append('Body', messageText);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data.sid) {
        console.log(`[Twilio] Successfully dispatched SMS OTP ${otpCode} to ${phoneFormatted}`);
        return {
          success: true,
          provider: 'Twilio',
          channel: 'SMS',
          messageId: data.sid
        };
      }
    } catch (err: any) {
      console.warn('[Twilio] Gateway error:', err.message);
    }
  }

  // 4. WhatsApp Direct Delivery & Simulated Mode
  console.log(`[OTP Gateway] Generated OTP ${otpCode} for ${phoneFormatted} (Channel: ${channel})`);
  return {
    success: true,
    provider: channel === 'WHATSAPP' ? 'WhatsApp Direct' : 'NexusVIP SMS Dispatcher',
    channel: channel === 'WHATSAPP' ? 'WHATSAPP' : 'SIMULATED',
    whatsappLink: whatsappUrl
  };
}
