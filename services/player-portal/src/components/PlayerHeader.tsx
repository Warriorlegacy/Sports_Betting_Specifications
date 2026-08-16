import React from 'react';
import { Zap, Wallet, Lock, User, LogOut, RefreshCw, Activity, ArrowRightLeft } from 'lucide-react';

interface PlayerHeaderProps {
  user: {
    id: string;
    username: string;
    availableCredit: number;
    exposure: number;
    creditLimit: number;
  } | null;
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  onOpenCashier?: (tab?: 'DEPOSIT' | 'WITHDRAW' | 'HISTORY') => void;
  onLogout: () => void;
  onRefresh: () => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  user,
  selectedSport,
  setSelectedSport,
  onOpenCashier,
  onLogout,
  onRefresh
}) => {
  const sports = [
    { id: 'All', label: 'All In-Play', count: 3 },
    { id: 'Cricket', label: '🏏 Cricket', count: 1 },
    { id: 'Football', label: '⚽ Football', count: 1 },
    { id: 'Tennis', label: '🎾 Tennis', count: 1 }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-400 via-sky-200 to-white bg-clip-text text-transparent">
                  NEXUS EXCHANGE
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700/60 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>P2P LADDER</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sub-50ms Real-Time Back & Lay Order Book
              </p>
            </div>
          </div>

          {/* User Wallet Widget */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Balance Widget */}
              <div
                onClick={() => onOpenCashier && onOpenCashier('HISTORY')}
                className="flex items-center space-x-3 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer shadow-inner transition-all"
                title="Click to view Ledger Statement"
              >
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Available Balance
                  </span>
                  <span className="mono-num text-sm font-extrabold text-emerald-400">
                    ₹{user.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Locked Exposure
                  </span>
                  <span className="mono-num text-sm font-extrabold text-rose-400">
                    ₹{user.exposure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deposit Button */}
              {onOpenCashier && (
                <button
                  type="button"
                  onClick={() => onOpenCashier('DEPOSIT')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
              )}

              {/* Account Pill */}
              <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200">{user.username}</span>
                  <span className="text-[10px] text-blue-400 font-semibold uppercase">Level 4 Player</span>
                </div>
                <button
                  onClick={onRefresh}
                  title="Refresh Balance"
                  className="p-1 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sports Navigation Bar */}
        <div className="flex items-center space-x-2 pb-2.5 overflow-x-auto no-scrollbar">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                selectedSport === sport.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
              }`}
            >
              <span>{sport.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
