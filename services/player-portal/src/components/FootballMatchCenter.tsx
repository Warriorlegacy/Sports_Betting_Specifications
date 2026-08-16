import React from 'react';
import { Activity, Zap, Shield, Flag, Award, Clock } from 'lucide-react';
import { LiveMatch } from '../types/sportsbook';

interface FootballMatchCenterProps {
  match: LiveMatch;
}

export const FootballMatchCenter: React.FC<FootballMatchCenterProps> = ({ match }) => {
  const isFootball = match.sport === 'Football';
  if (!isFootball) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/40 border border-blue-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-widest text-blue-400">
            Live Match Attack Center
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-bold border border-blue-700/50 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{match.clock || "68'"}</span>
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-400">{match.league}</span>
      </div>

      {/* Live Possession & Attack Pressure Bar */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-blue-400">{match.homeTeam.name} (58%)</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Possession</span>
          <span className="text-rose-400">(42%) {match.awayTeam.name}</span>
        </div>
        {/* Dual Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
          <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400" style={{ width: '58%' }} />
          <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500" style={{ width: '42%' }} />
        </div>
      </div>

      {/* Match Statistics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Shots on Target</span>
          <div className="flex items-center justify-center space-x-2 font-black text-sm">
            <span className="text-blue-400">7</span>
            <span className="text-slate-600">-</span>
            <span className="text-rose-400">4</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Corner Kicks</span>
          <div className="flex items-center justify-center space-x-2 font-black text-sm">
            <span className="text-blue-400">5</span>
            <span className="text-slate-600">-</span>
            <span className="text-rose-400">3</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dangerous Attacks</span>
          <div className="flex items-center justify-center space-x-2 font-black text-sm">
            <span className="text-blue-400">46</span>
            <span className="text-slate-600">-</span>
            <span className="text-rose-400">31</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Yellow / Red Cards</span>
          <div className="flex items-center justify-center space-x-2 font-black text-sm">
            <span className="text-yellow-400">1</span>
            <span className="text-slate-600">-</span>
            <span className="text-yellow-400">2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
