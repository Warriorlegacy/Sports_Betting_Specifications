import React from 'react';
import {
  Shield,
  User,
  Wallet,
  Activity,
  LogOut,
  RefreshCw,
  Zap,
  Building,
  CheckCircle2,
  ListFilter,
  FileSpreadsheet,
  Award,
  Sparkles,
  KeyRound
} from 'lucide-react';

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
  onOpenRolesMatrix: () => void;
  onOpenCredits: () => void;
  onOpenChangePassword?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onRefresh,
  activeTab,
  setActiveTab,
  onOpenRolesMatrix,
  onOpenCredits,
  onOpenChangePassword
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">L0 • Admin</span>;
      case 'SUPER_MASTER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">L1 • Super Master</span>;
      case 'MASTER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">L2 • Master</span>;
      case 'AGENT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">L3 • Agent</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40">L4 • Player</span>;
    }
  };

  const navItems = [
    { id: 'hierarchy', label: 'Downline Tree', icon: null },
    { id: 'bets', label: 'Bet Records Desk', icon: Activity },
    { id: 'approvals', label: 'Approvals Desk', icon: CheckCircle2 },
    { id: 'banking', label: 'Deposit Gateways', icon: Building },
    { id: 'markets', label: 'Market Controls', icon: null },
    { id: 'providers', label: 'Data Feeds', icon: null },
    { id: 'ledger', label: 'Ledger', icon: null }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
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
              <p className="text-xs text-slate-400 font-medium">5-Tier Credit Ledger & Multi-Role Operations</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Status & Balance Widget */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Creator Credits Button */}
              <button
                onClick={onOpenCredits}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-slate-900 border border-[#f36c21]/40 hover:border-[#f36c21] text-amber-300 text-xs font-bold transition-all shadow-sm hover:shadow-orange-500/20"
                title="Solo Creator & Godfather of Platform"
              >
                <Award className="w-3.5 h-3.5 text-[#f36c21]" />
                <span>Creator Credits</span>
              </button>

              {/* Roles Matrix Button */}
              <button
                onClick={onOpenRolesMatrix}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/60 hover:bg-purple-900/60 text-purple-300 text-xs font-bold transition-colors"
                title="View Role Powers & Responsibilities"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Roles & Powers</span>
              </button>

              <div className="hidden lg:flex items-center space-x-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Available Credit</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ₹{user.availableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Exposure</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    ₹{user.exposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Profile Pill */}
              <div className="flex items-center space-x-2 bg-slate-800/60 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/60">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-100">{user.username}</span>
                  {getRoleBadge(user.role)}
                </div>
                {onOpenChangePassword && (
                  <button
                    onClick={onOpenChangePassword}
                    title="Change My Password"
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onRefresh}
                  title="Refresh Data"
                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Compact Subnav for medium screens */}
        <div className="xl:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
