import React, { useState } from 'react';
import {
  Zap,
  User,
  Lock,
  X,
  AlertCircle,
  Smartphone,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Gift,
  ShieldCheck,
  ArrowRight
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
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'OTP' | 'REGISTER'>('LOGIN');

  // Password Login State
  const [username, setUsername] = useState<string>('player_rahul');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // OTP Login State
  const [phone, setPhone] = useState<string>('9876543210');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('123456');
  const [otpLoading, setOtpLoading] = useState<boolean>(false);

  // Register State
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('NEXUSVIP500');
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await onLogin(username.trim(), password);
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) return;
    setOtpLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtpLoading(false);
    }, 600);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      const mockUser = {
        id: `usr_${Date.now()}`,
        username: `user_${phone.slice(-4)}`,
        availableCredit: 5000,
        exposure: 0,
        creditLimit: 25000
      };
      onLoginSuccess(mockUser);
    }, 600);
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

  const handleQuickLogin = async (quickUser: string) => {
    setUsername(quickUser);
    setPassword('password123');
    await onLogin(quickUser, 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-5 sm:p-7 shadow-2xl relative z-10 space-y-5 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors"
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
            India's Leading Betting Exchange & Live Casino Portal
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-xl border border-[#272727] text-xs font-bold">
          <button
            onClick={() => setActiveTab('LOGIN')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'LOGIN'
                ? 'bg-[#f36c21] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('OTP')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'OTP'
                ? 'bg-[#f36c21] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            Instant OTP
          </button>
          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'REGISTER'
                ? 'bg-[#27AE60] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 text-xs rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. PASSWORD LOGIN TAB */}
        {activeTab === 'LOGIN' && (
          <div className="space-y-4">
            {/* Quick Demo Sign-in */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#adadad] block text-center">
                1-Click Demo Profiles
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('player_rahul')}
                  className="p-2 rounded-lg text-xs font-bold bg-[#272727] hover:bg-[#333] border border-[#333] text-white transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#27AE60]" />
                  <span>Rahul (₹10k)</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('player_amit')}
                  className="p-2 rounded-lg text-xs font-bold bg-[#272727] hover:bg-[#333] border border-[#333] text-white transition-all text-center flex items-center justify-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Amit (₹25k)</span>
                </button>
              </div>
            </div>

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
                className="w-full py-2.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 2. OTP LOGIN TAB */}
        {activeTab === 'OTP' && (
          <form onSubmit={handleOtpVerify} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#adadad]">Mobile Number</label>
              <div className="relative mt-1 flex space-x-2">
                <div className="relative flex-1">
                  <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-[#141414] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-white text-xs font-mono font-bold focus:border-[#f36c21] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || phone.length < 10}
                  className="px-3 py-2 rounded-lg bg-[#272727] hover:bg-[#333] text-[#f36c21] font-bold text-xs whitespace-nowrap border border-[#333] disabled:opacity-50"
                >
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="animate-in fade-in duration-200 space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[#adadad]">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#141414] border border-emerald-500/50 rounded-lg px-3 py-2 text-center text-white text-base font-mono font-black tracking-widest focus:outline-none"
                />
                <span className="text-[10px] text-[#27AE60] flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OTP dispatched to +91 {phone} via WhatsApp / SMS</span>
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading || !otpSent}
              className="w-full py-2.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{otpLoading ? 'Verifying...' : 'Verify OTP & Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. REGISTER TAB */}
        {activeTab === 'REGISTER' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-600/40 text-emerald-300 text-xs flex items-center space-x-2">
              <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">₹500 Instant Registration Bonus</span>
                <span className="text-[10px] text-emerald-200">Automatically credited to your Nexusvip wallet upon sign-up.</span>
              </div>
            </div>

            {registerSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#27AE60] animate-bounce" />
                <h4 className="font-black text-sm text-white">Registration Successful!</h4>
                <p className="text-xs text-[#adadad]">Welcome to Nexusvip. ₹500 welcome credit added. Logging in...</p>
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
                    placeholder="e.g. virat_bettor"
                    className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-[#27AE60] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">Mobile Number</label>
                  <input
                    type="tel"
                    required
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
                  <label className="text-[10px] font-bold uppercase text-[#adadad]">Referral / Promo Code</label>
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
                  className="w-full py-2.5 rounded-lg bg-[#27AE60] hover:bg-[#219652] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{regLoading ? 'Creating Player Account...' : 'Register & Claim ₹500 Bonus'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Trust Footer */}
        <div className="pt-2 border-t border-[#272727] flex items-center justify-between text-[10px] text-[#8e8e8e]">
          <div className="flex items-center space-x-1.5 text-[#27AE60]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>18+ Responsible Play</span>
        </div>
      </div>
    </div>
  );
};
