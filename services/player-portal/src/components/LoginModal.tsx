import React, { useState } from 'react';
import { Zap, User, Lock, X, AlertCircle } from 'lucide-react';

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
  loading,
  error
}) => {
  const [username, setUsername] = useState<string>('player_rahul');
  const [password, setPassword] = useState<string>('password123');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  const handleQuickLogin = async (quickUser: string) => {
    setUsername(quickUser);
    setPassword('password123');
    await onLogin(quickUser, 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Sign In to Sportsbook
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Access your live wallet, place bets, and cash out in real time
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Sign-in */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Quick Sign In
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('player_rahul')}
              className="p-2.5 rounded-xl text-xs font-bold bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-200 transition-all text-center disabled:opacity-50"
            >
              <span>Rahul (Player)</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('player_amit')}
              className="p-2.5 rounded-xl text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 transition-all text-center disabled:opacity-50"
            >
              <span>Amit (Player)</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-300">Username</label>
            <div className="relative mt-1">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
