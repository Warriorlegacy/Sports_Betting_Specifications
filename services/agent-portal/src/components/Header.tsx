import React from 'react';
import { Shield, User, Wallet, Activity, LogOut, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  user: {
    id: string;
    username: string;
    role: string;
    creditLimit: number;
    availableCredit: number;
    exposure: number;
  } | null;
  onLogout: () => void;
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onRefresh,
  activeTab,
  setActiveTab
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">L0 • Global Admin</span>;
      case 'SUPER_MASTER':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">L1 • Super Master</span>;
      case 'MASTER':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">L2 • Master</span>;
      case 'AGENT':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">L3 • Agent</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40">L4 • Player</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-[#f36c21] to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#f36c21] via-amber-300 to-white bg-clip-text text-transparent">
                  NEXUSVIP EXCHANGE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-orange-950/80 text-amber-300 rounded border border-orange-700/50">
                  Admin & Risk Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">7-Tier Credit Ledger & Risk Control</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'hierarchy'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Downline Tree
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'markets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Market Kill-Switch
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'providers'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Data Feeds & APIs
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'ledger'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Double-Entry Ledger
            </button>
          </nav>

          {/* User Status & Balance Widget */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Available Credit</span>
                  <span className="mono-num text-sm font-bold text-emerald-400">
                    {user.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Liability</span>
                  <span className="mono-num text-sm font-bold text-amber-400">
                    {user.exposure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Profile Pill */}
              <div className="flex items-center space-x-2.5 bg-slate-800/60 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/60">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-100">{user.username}</span>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={onRefresh}
                  title="Refresh Data"
                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
