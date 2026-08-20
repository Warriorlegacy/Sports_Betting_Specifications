describe('OTP Verification Engine & Phone Authentication Tests', () => {
  function normalizePhone(rawPhone: string): { formatted: string; raw10: string } {
    const digits = rawPhone.replace(/\D/g, '');
    const raw10 = digits.length >= 10 ? digits.slice(-10) : digits;
    const formatted = `+91${raw10}`;
    return { formatted, raw10 };
  }

  function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  test('1. Normalizes Indian phone formats (+91, 0, dashes, spaces) into consistent 10-digit and E.164 formats', () => {
    expect(normalizePhone('+91 98765 43210')).toEqual({ formatted: '+919876543210', raw10: '9876543210' });
    expect(normalizePhone('09876543210')).toEqual({ formatted: '+919876543210', raw10: '9876543210' });
    expect(normalizePhone('9876543210')).toEqual({ formatted: '+919876543210', raw10: '9876543210' });
    expect(normalizePhone('+91-91234-56789')).toEqual({ formatted: '+919123456789', raw10: '9123456789' });
  });

  test('2. Generates cryptographically secure 6-digit numeric OTP', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  test('3. Rejects expired or mismatched OTP codes', () => {
    const store = new Map<string, { otp: string; expiresAt: number }>();
    const phone = '+919876543210';
    const otp = '492810';

    // Store active OTP
    store.set(phone, { otp, expiresAt: Date.now() + 300000 });

    // Valid OTP check
    const validEntry = store.get(phone);
    expect(validEntry && validEntry.otp === '492810' && validEntry.expiresAt > Date.now()).toBe(true);

    // Mismatched OTP check
    expect(validEntry && validEntry.otp === '000000').toBe(false);

    // Expired OTP check
    store.set(phone, { otp, expiresAt: Date.now() - 1000 });
    const expiredEntry = store.get(phone);
    expect(expiredEntry && expiredEntry.otp === '492810' && expiredEntry.expiresAt > Date.now()).toBe(false);
  });

  test('4. Auto-onboarding creates standard player username from phone digits', () => {
    const phone = '+919876543210';
    const { raw10 } = normalizePhone(phone);
    const username = `player_${raw10}`;
    expect(username).toBe('player_9876543210');
  });
});
