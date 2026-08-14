import React from 'react';
import {
  Zap,
  Wallet,
  LogOut,
  RefreshCw,
  Sparkles,
  Activity,
  Layers,
  DollarSign,
  TrendingUp,
  Sliders,
  History
} from 'lucide-react';
import { OddsFormat, SportCategory } from '../types/sportsbook';

interface SportsbookHeaderProps {
  user: {
    id: string;
    username: string;
    availableCredit: number;
    exposure: number;
  } | null;
  activeView: 'SPORTSBOOK' | 'EXCHANGE' | 'CASHOUT' | 'MY_BETS';
  setActiveView: (view: 'SPORTSBOOK' | 'EXCHANGE' | 'CASHOUT' | 'MY_BETS') => void;
  selectedSport: SportCategory;
  setSelectedSport: (sport: SportCategory) => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (format: OddsFormat) => void;
  cashOutCount: number;
  betSlipCount: number;
  onToggleSlip: () => void;
  onLogout: () => void;
  onRefresh: () => void;
}

export const SportsbookHeader: React.FC<SportsbookHeaderProps> = ({
  user,
  activeView,
  setActiveView,
  selectedSport,
  setSelectedSport,
  oddsFormat,
  setOddsFormat,
  cashOutCount,
  betSlipCount,
  onToggleSlip,
  onLogout,
  onRefresh
}) => {
  const sports: { id: SportCategory; label: string }[] = [
    { id: 'All', label: '🔥 All In-Play' },
    { id: 'Football', label: '⚽ Football' },
    { id: 'Cricket', label: '🏏 Cricket' },
    { id: 'Basketball', label: '🏀 Basketball' },
    { id: 'Tennis', label: '🎾 Tennis' },
    { id: 'Baseball', label: '⚾ Baseball' },
    { id: 'American Football', label: '🏈 NFL' },
    { id: 'Esports', label: '🎮 Esports' }
  ];


  return (
    <header className="sticky top-0 z-40 w-full bg-[#060911]/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand & Mode Switchers */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('SPORTSBOOK')}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                    NEXUS SPORTSBOOK
                  </span>
                  <span className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live 24/7</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block">
                  Live In-Play Odds • Same-Game Parlays • Dynamic Cash-Out
                </p>
              </div>
            </div>

            {/* Main Navigation Views */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveView('SPORTSBOOK')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  activeView === 'SPORTSBOOK'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Sportsbook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('EXCHANGE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  activeView === 'EXCHANGE'
                    ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>P2P Ladder</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('CASHOUT')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  activeView === 'CASHOUT'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Cash Out</span>
                {cashOutCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-400 text-slate-950">
                    {cashOutCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveView('MY_BETS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                  activeView === 'MY_BETS'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>My Bets</span>
              </button>
            </nav>
          </div>

          {/* Right Controls: Odds Format, Wallet & Bet Slip */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Odds Format Selector */}
            <div className="hidden sm:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              {(['DECIMAL', 'AMERICAN', 'FRACTIONAL'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOddsFormat(fmt)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    oddsFormat === fmt
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt === 'DECIMAL' ? 'Dec' : fmt === 'AMERICAN' ? 'US' : 'Frac'}
                </button>
              ))}
            </div>

            {/* Wallet Widget */}
            {user && (
              <div className="flex items-center space-x-2.5 bg-slate-950/90 px-3.5 py-2 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Available</span>
                  <span className="mono-num text-xs sm:text-sm font-black text-emerald-400">
                    ₹{user.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={onRefresh}
                  title="Refresh Balance"
                  className="p-1 text-slate-500 hover:text-blue-400 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bet Slip Trigger */}
            <button
              type="button"
              onClick={onToggleSlip}
              className="relative p-2.5 sm:px-4 sm:py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Slip</span>
              {betSlipCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {betSlipCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950/80 rounded-2xl border border-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher & Sports Navigation Row */}
        <div className="flex items-center justify-between pb-3 pt-1 gap-2 overflow-x-auto no-scrollbar">
          {/* Sports Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {sports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedSport === sport.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>

          {/* Mobile Tab Pills */}
          <div className="flex lg:hidden items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveView('SPORTSBOOK')}
              className={`px-2 py-1 rounded-lg ${activeView === 'SPORTSBOOK' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Book
            </button>
            <button
              onClick={() => setActiveView('EXCHANGE')}
              className={`px-2 py-1 rounded-lg ${activeView === 'EXCHANGE' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              P2P
            </button>
            <button
              onClick={() => setActiveView('CASHOUT')}
              className={`px-2 py-1 rounded-lg ${activeView === 'CASHOUT' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              CashOut
            </button>
            <button
              onClick={() => setActiveView('MY_BETS')}
              className={`px-2 py-1 rounded-lg ${activeView === 'MY_BETS' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Bets
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
