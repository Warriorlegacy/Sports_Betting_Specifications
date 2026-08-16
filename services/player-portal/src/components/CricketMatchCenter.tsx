import React from 'react';
import { Activity, Zap, TrendingUp, ShieldAlert, Award, Flame } from 'lucide-react';
import { LiveMatch } from '../types/sportsbook';

interface CricketMatchCenterProps {
  match: LiveMatch;
}

export const CricketMatchCenter: React.FC<CricketMatchCenterProps> = ({ match }) => {
  const isCricket = match.sport === 'Cricket';
  if (!isCricket) return null;

  // Generate realistic live over progression balls (e.g. from score or dynamic telemetry)
  const currentOverBalls = ['1', '0', '4', '2', 'W', '6'];
  const strikerName = match.homeTeam.name?.includes('vs') ? 'Striker' : `${match.homeTeam.name} Batsman 1`;
  const nonStrikerName = `${match.homeTeam.name} Batsman 2`;
  const bowlerName = `${match.awayTeam.name} Bowler`;

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            Live Ball-by-Ball Match Center
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-700/50">
            {match.clock || 'Live In-Play'}
          </span>
        </div>
        <div className="text-[11px] font-bold text-slate-400 flex items-center space-x-3">
          <span>CRR: <strong className="text-white">8.75</strong></span>
          <span>RRR: <strong className="text-amber-400">9.40</strong></span>
        </div>
      </div>

      {/* Current Score & Target Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">{match.homeTeam.name}</span>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-2xl font-black text-emerald-400 mono-num">{match.homeTeam.score}</span>
            <span className="text-xs text-slate-400 font-semibold">{match.homeTeam.subScore || '(17.4 Ov)'}</span>
          </div>
        </div>

        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-bold text-slate-400">Match Equation</span>
          <span className="text-xs font-bold text-amber-300 mt-1">
            Need 38 runs in 14 balls to win
          </span>
          <span className="text-[10px] text-slate-400">Target: 186 runs</span>
        </div>

        {/* Current Over Balls Timeline */}
        <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">This Over ({match.clock || 'Ov 18'})</span>
          <div className="flex items-center space-x-1.5">
            {currentOverBalls.map((ball, idx) => {
              const isWicket = ball === 'W';
              const isBoundary = ball === '4' || ball === '6';
              const isDot = ball === '0';
              return (
                <span
                  key={idx}
                  className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shadow-md transition-transform hover:scale-110 ${
                    isWicket
                      ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
                      : isBoundary
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-amber-500/30'
                      : isDot
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-blue-600/80 text-white'
                  }`}
                >
                  {ball}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Batsmen & Bowler Mini Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Batsmen In Crease */}
        <div className="bg-slate-950/40 rounded-2xl p-3.5 border border-slate-800/60">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2 block flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Batting (In Crease)</span>
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-white">{strikerName} *</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] mono-num">
                <span><strong className="text-emerald-400">42</strong> (24b)</span>
                <span className="text-slate-400">4s: 3 | 6s: 2</span>
                <span className="text-sky-300 font-bold">SR: 175.0</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="font-medium text-slate-300">{nonStrikerName}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] mono-num">
                <span><strong className="text-white">18</strong> (11b)</span>
                <span className="text-slate-400">4s: 1 | 6s: 1</span>
                <span className="text-sky-300">SR: 163.6</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Bowler Spell */}
        <div className="bg-slate-950/40 rounded-2xl p-3.5 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2 block flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Current Bowler Spell</span>
          </span>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">{bowlerName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold border border-rose-800/40">Right-arm Fast</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] mono-num">
              <span><strong>3.4</strong> ov</span>
              <span><strong>1</strong> mdn</span>
              <span><strong className="text-rose-400">28</strong> runs</span>
              <span><strong className="text-emerald-400">2</strong> wkts</span>
              <span className="text-amber-300 font-bold">Econ: 7.6</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 italic mt-2 px-1">
            Last Ball: Length delivery on off stump, driven forcefully over long-off for <strong>SIX!</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
