import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  User,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  RotateCw,
  Edit2,
  Sparkles,
  KeyRound,
  MessageSquare,
  Mail,
  Send,
  ExternalLink,
  Check
} from 'lucide-react';
import { api, setAuthToken } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onLoginSuccess,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<'OTP' | 'PASSWORD' | 'REGISTER'>('OTP');

  // OTP Channel & Input State
  const [otpChannel, setOtpChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL' | 'TELEGRAM'>('SMS');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telegramId, setTelegramId] = useState<string>('');
  
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [activeIdentifier, setActiveIdentifier] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);
  const [whatsappDeliveryLink, setWhatsappDeliveryLink] = useState<string | null>(null);
  const [telegramDeliveryLink, setTelegramDeliveryLink] = useState<string | null>(null);
  const [deliveryProvider, setDeliveryProvider] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [otpVerifiedSuccess, setOtpVerifiedSuccess] = useState<boolean>(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Password Login State
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register State
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState<boolean>(false);

  // 60-Second Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // WebOTP API: Automatic SMS OTP Extraction on mobile browsers
  useEffect(() => {
    if (!otpSent || otpVerifiedSuccess || typeof window === 'undefined') return;

    if ('OTPCredential' in window && navigator.credentials) {
      const ac = new AbortController();
      (navigator.credentials as any)
        .get({
          otp: { transport: ['sms'] },
          signal: ac.signal
        })
        .then((otpCredential: any) => {
          if (otpCredential && otpCredential.code) {
            const extractedCode = otpCredential.code.slice(0, 6);
            const digits = extractedCode.split('');
            setOtpCode(digits);
            triggerVerifyOtp(extractedCode);
          }
        })
        .catch(() => {
          // WebOTP aborted or not granted - harmless fallback
        });

      return () => {
        ac.abort();
      };
    }
  }, [otpSent, otpVerifiedSuccess]);

  if (!isOpen) return null;

  // 1. Send OTP Request
  const handleSendOtp = async (
    e?: React.FormEvent,
    forceChannel?: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'TELEGRAM'
  ) => {
    if (e) e.preventDefault();
    const targetChannel = forceChannel || otpChannel;

    let payload: any = { channel: targetChannel };
    let idDisplay = '';

    if (targetChannel === 'EMAIL') {
      if (!email.trim() || !email.includes('@')) {
        setOtpError('Please enter a valid email address');
        return;
      }
      payload.email = email.trim();
      idDisplay = email.trim();
    } else if (targetChannel === 'TELEGRAM') {
      if (!telegramId.trim()) {
        setOtpError('Please enter your Telegram username or ID');
        return;
      }
      payload.telegramId = telegramId.trim();
      idDisplay = telegramId.trim();
    } else {
      const cleanDigits = phone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setOtpError('Please enter a valid 10-digit mobile number');
        return;
      }
      payload.phone = cleanDigits;
      idDisplay = `+91 ${cleanDigits}`;
    }

    try {
      setOtpLoading(true);
      setOtpError(null);
      const res = await api.auth.sendOtp(payload);

      setOtpSent(true);
      setActiveIdentifier(idDisplay);
      setCountdown(60);
      setDeliveryProvider(res.provider || 'Free Instant Verification Gateway');
      
      if (res.whatsappLink) {
        setWhatsappDeliveryLink(res.whatsappLink);
      }
      if (res.telegramLink) {
        setTelegramDeliveryLink(res.telegramLink);
      }
      if (res.testOtp) {
        setTestOtpNotice(res.testOtp);
      }

      // If user chose WhatsApp channel and link exists, prompt 1-click
      if (targetChannel === 'WHATSAPP' && res.whatsappLink) {
        window.open(res.whatsappLink, '_blank');
      }

      // Focus first OTP input on dispatch
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to dispatch OTP. Please try another channel.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Handle 6-Digit OTP Box Change
  const handleOtpDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    const newOtp = [...otpCode];

    if (clean.length > 1) {
      // Pasted full OTP string
      const digits = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtpCode(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      if (digits.length === 6) {
        triggerVerifyOtp(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = clean.slice(-1);
    setOtpCode(newOtp);

    // Auto-advance focus to next input box
    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are typed
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      triggerVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // 3. Verify OTP & Authenticate
  const triggerVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otpCode.join('');
    if (finalOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError(null);

      const payload: any = { otp: finalOtp };
      if (otpChannel === 'EMAIL') {
        payload.email = email.trim();
      } else if (otpChannel === 'TELEGRAM') {
        payload.identifier = telegramId.trim();
      } else {
        payload.phone = phone.replace(/\D/g, '');
      }

      const res = await api.auth.verifyOtp(payload);

      if (res.token) {
        setAuthToken(res.token);
      }
      setOtpVerifiedSuccess(true);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 800);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await onLogin(username.trim(), password);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim()) return;

    try {
      setRegLoading(true);
      setRegError(null);
      const res = await api.auth.register({
        username: regUsername.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim() || undefined,
        referralCode: referralCode.trim() || undefined
      });

      if (res.token) {
        setAuthToken(res.token);
      }
      setRegisterSuccess(true);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 1000);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-5 sm:p-7 shadow-2xl relative z-10 space-y-5 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="flex items-center justify-center text-xl font-black tracking-tight">
            <span>NEXUS</span>
            <span className="text-[#f36c21]">VIP</span>
          </div>
          <p className="text-xs text-[#adadad] font-medium">
            India's Leading Free-OTP Exchange & Casino Portal
          </p>
        </div>

        {/* 3 Main Authentication Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-xl border border-[#272727] text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('OTP');
              setOtpError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'OTP'
                ? 'bg-[#f36c21] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Free OTP</span>
          </button>
          <button
            onClick={() => setActiveTab('PASSWORD')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'PASSWORD'
                ? 'bg-[#272727] text-white border border-[#444] shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
              activeTab === 'REGISTER'
                ? 'bg-[#27AE60] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-3 text-xs rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. FREE MULTI-CHANNEL OTP TAB (SMS, WHATSAPP, EMAIL, TELEGRAM)            */}
        {/* ========================================================================= */}
        {activeTab === 'OTP' && (
          <div className="space-y-4">
            {otpVerifiedSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-14 h-14 mx-auto text-[#27AE60] animate-bounce" />
                <h4 className="font-black text-sm text-white">Verified Successfully!</h4>
                <p className="text-xs text-[#adadad]">Welcome to NexusVIP. Launching your terminal...</p>
              </div>
            ) : !otpSent ? (
              /* Step 1: Select Channel & Enter Identifier */
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                {otpError && (
                  <div className="p-2.5 rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* 4 Free Delivery Channels */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#adadad] block mb-1.5">
                    Select Free Verification Channel
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('SMS');
                        setOtpError(null);
                      }}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        otpChannel === 'SMS'
                          ? 'border-[#f36c21] bg-[#f36c21]/20 text-[#f36c21] shadow-sm shadow-orange-500/20'
                          : 'border-[#333] bg-[#161616] text-[#8e8e8e] hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('WHATSAPP');
                        setOtpError(null);
                      }}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        otpChannel === 'WHATSAPP'
                          ? 'border-[#27AE60] bg-[#27AE60]/20 text-[#27AE60] shadow-sm shadow-green-500/20'
                          : 'border-[#333] bg-[#161616] text-[#8e8e8e] hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('EMAIL');
                        setOtpError(null);
                      }}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        otpChannel === 'EMAIL'
                          ? 'border-sky-500 bg-sky-500/20 text-sky-400 shadow-sm shadow-sky-500/20'
                          : 'border-[#333] bg-[#161616] text-[#8e8e8e] hover:text-white'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpChannel('TELEGRAM');
                        setOtpError(null);
                      }}
                      className={`py-2 px-1 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        otpChannel === 'TELEGRAM'
                          ? 'border-blue-400 bg-blue-400/20 text-blue-300 shadow-sm shadow-blue-400/20'
                          : 'border-[#333] bg-[#161616] text-[#8e8e8e] hover:text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </button>
                  </div>
                </div>

                {/* Input Field: Conditional based on channel */}
                {otpChannel === 'EMAIL' ? (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#adadad] flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-sky-400 font-bold">Resend/Brevo Free Tier</span>
                    </label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-[#141414] border border-[#333] rounded-lg pl-9 pr-3 py-2.5 text-white text-xs font-bold focus:border-sky-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ) : otpChannel === 'TELEGRAM' ? (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#adadad] flex items-center justify-between">
                      <span>Telegram ID or Handle</span>
                      <span className="text-[10px] text-blue-400 font-bold">100% Free Bot Delivery</span>
                    </label>
                    <div className="relative mt-1">
                      <Send className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        placeholder="@username or Chat ID"
                        className="w-full bg-[#141414] border border-[#333] rounded-lg pl-9 pr-3 py-2.5 text-white text-xs font-bold focus:border-blue-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#adadad] flex items-center justify-between">
                      <span>Mobile Phone Number</span>
                      <span className="text-[10px] text-[#27AE60] font-bold">Fast2SMS / 2Factor / WhatsApp</span>
                    </label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#333] bg-[#181818] text-white text-xs font-bold font-mono">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        autoFocus
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full bg-[#141414] border border-[#333] rounded-r-lg px-3 py-2.5 text-white text-sm font-mono font-bold focus:border-[#f36c21] focus:outline-none tracking-wider"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    otpLoading ||
                    (otpChannel === 'EMAIL'
                      ? !email.includes('@')
                      : otpChannel === 'TELEGRAM'
                      ? !telegramId.trim()
                      : phone.length < 10)
                  }
                  className="w-full py-2.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {otpLoading
                      ? 'Dispatching Free OTP...'
                      : `Send Verification Code via ${
                          otpChannel === 'WHATSAPP'
                            ? 'WhatsApp'
                            : otpChannel === 'EMAIL'
                            ? 'Email'
                            : otpChannel === 'TELEGRAM'
                            ? 'Telegram'
                            : 'SMS'
                        }`}
                  </span>
                </button>
              </form>
            ) : (
              /* Step 2: 6-Digit OTP Entry with WebOTP & Direct Deep-Links */
              <div className="space-y-3.5">
                {otpError && (
                  <div className="p-2.5 rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Sent Channel Banner */}
                <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8e8e8e] block text-[10px]">
                      {otpChannel === 'WHATSAPP'
                        ? '💬 WhatsApp Code Sent To:'
                        : otpChannel === 'EMAIL'
                        ? '📧 Email Code Sent To:'
                        : otpChannel === 'TELEGRAM'
                        ? '✈️ Telegram Code Sent To:'
                        : '📱 SMS Code Sent To:'}
                    </span>
                    <span className="font-mono font-bold text-white tracking-wide">
                      {activeIdentifier}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode(['', '', '', '', '', '']);
                      setOtpError(null);
                    }}
                    className="text-[11px] text-[#f36c21] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Direct WhatsApp Deep Link Trigger */}
                {whatsappDeliveryLink && otpChannel === 'WHATSAPP' && (
                  <a
                    href={whatsappDeliveryLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#27AE60]/20 hover:bg-[#27AE60]/30 border border-[#27AE60]/50 text-[#27AE60] text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Code in WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {/* Direct Telegram Deep Link Trigger */}
                {telegramDeliveryLink && otpChannel === 'TELEGRAM' && (
                  <a
                    href={telegramDeliveryLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open Telegram Bot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {/* Instant Sandbox Autofill Pill */}
                {testOtpNotice && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px]">
                        Security Code:{' '}
                        <strong className="font-mono tracking-widest text-white">
                          {testOtpNotice}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = testOtpNotice.split('');
                        setOtpCode(digits);
                        triggerVerifyOtp(testOtpNotice);
                      }}
                      className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] uppercase cursor-pointer hover:bg-amber-400"
                    >
                      Autofill
                    </button>
                  </div>
                )}

                {/* 6 Individual OTP Boxes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[#adadad] text-center block">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-10 h-12 text-center text-lg font-mono font-black rounded-lg border bg-[#141414] focus:outline-none transition-all ${
                          digit
                            ? 'border-[#f36c21] text-white shadow-md shadow-orange-500/20'
                            : 'border-[#333] text-neutral-400 focus:border-[#f36c21]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => triggerVerifyOtp()}
                  disabled={otpLoading || otpCode.some((d) => d === '')}
                  className="w-full py-2.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>{otpLoading ? 'Verifying Code...' : 'Verify & Enter'}</span>
                </button>

                {/* Resend OTP Options */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#262626]">
                  {countdown > 0 ? (
                    <span className="text-[11px] text-[#8e8e8e] font-mono">
                      Resend code in <strong className="text-white">{countdown}s</strong>
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <button
                        type="button"
                        onClick={() => handleSendOtp(undefined, 'SMS')}
                        className="text-[11px] text-[#f36c21] hover:underline font-bold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>SMS</span>
                      </button>
                      <span className="text-[#444]">•</span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp(undefined, 'WHATSAPP')}
                        className="text-[11px] text-[#27AE60] hover:underline font-bold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                      <span className="text-[#444]">•</span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp(undefined, 'EMAIL')}
                        className="text-[11px] text-sky-400 hover:underline font-bold inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PASSWORD LOGIN TAB                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#adadad]">Username</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-[#141414] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-white text-xs font-bold focus:border-[#f36c21] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#adadad]">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-[#141414] border border-[#333] rounded-lg pl-9 pr-9 py-2 text-white text-xs font-mono font-bold focus:border-[#f36c21] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* 3. REGISTER TAB                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'REGISTER' && (
          <div className="space-y-3">
            {registerSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#27AE60] animate-bounce" />
                <h4 className="font-black text-sm text-white">Registration Successful!</h4>
                <p className="text-xs text-[#adadad]">Welcome to NexusVIP. Launching player portal...</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                {regError && (
                  <div className="p-2 rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-[11px] flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">Desired Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. rahul_trader"
                    className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-[#27AE60] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit phone number"
                    className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:border-[#27AE60] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:border-[#27AE60] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">
                    Referral / Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full bg-[#141414] border border-amber-500/40 rounded-lg px-3 py-2 text-amber-300 text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 rounded-lg bg-[#27AE60] hover:bg-[#219652] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{regLoading ? 'Creating Player Account...' : 'Create Player Account'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Trust Footer */}
        <div className="pt-2 border-t border-[#272727] flex items-center justify-between text-[10px] text-[#8e8e8e]">
          <div className="flex items-center space-x-1.5 text-[#27AE60]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Engine</span>
          </div>
          <span>18+ Responsible Gaming</span>
        </div>
      </div>
    </div>
  );
};
