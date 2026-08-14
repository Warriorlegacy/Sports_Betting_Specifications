import React, { useState } from 'react';
import {
  Activity,
  Flame,
  TrendingUp,
  Target,
  BarChart2,
  Shield,
  Clock,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { LiveMatch, ShotLocation } from '../types/sportsbook';

interface LiveVisualizerHubProps {
  match: LiveMatch;
}

export const LiveVisualizerHub: React.FC<LiveVisualizerHubProps> = ({ match }) => {
  const [activeVisualTab, setActiveVisualTab] = useState<'RADAR' | 'SHOT_MAP' | 'MOMENTUM' | 'WIN_PROB' | 'STATS'>(
    'RADAR'
  );
  const [selectedShot, setSelectedShot] = useState<ShotLocation | null>(null);
  const [shotFilter, setShotFilter] = useState<'ALL' | 'HOME' | 'AWAY'>('ALL');

  const filteredShots = match.shots.filter((s) => {
    if (shotFilter === 'ALL') return true;
    return s.team === shotFilter;
  });

  const lastWinProb = match.winProbabilityHistory[match.winProbabilityHistory.length - 1] || {
    homeProb: 50,
    drawProb: 25,
    awayProb: 25
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Visual Hub Header with Navigation Tabs */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white tracking-tight">LIVE MATCH CENTER & STATS</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Hub</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sub-second 2D pitch telemetry, possession pressure, shot maps & live win probability
              </p>
            </div>
          </div>

          {/* Quick Score & Possession Pill */}
          <div className="flex items-center space-x-4 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{match.homeTeam.shortName}</span>
              <span className="mono-num text-sm font-black text-white">{match.possessionStats.home}% Poss</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{match.awayTeam.shortName}</span>
              <span className="mono-num text-sm font-black text-white">{match.possessionStats.away}% Poss</span>
            </div>
          </div>
        </div>

        {/* Navigation Switcher Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setActiveVisualTab('RADAR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeVisualTab === 'RADAR'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2D Field Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualTab('SHOT_MAP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeVisualTab === 'SHOT_MAP'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Interactive Shot Map ({match.shots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualTab('WIN_PROB')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeVisualTab === 'WIN_PROB'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Win Probability Curve</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualTab('MOMENTUM')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeVisualTab === 'MOMENTUM'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Momentum Wave</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVisualTab('STATS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeVisualTab === 'STATS'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Advanced Box Score</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Content Area */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* ===================== TAB 1: 2D FIELD RADAR ===================== */}
        {activeVisualTab === 'RADAR' && (
          <div className="space-y-4">
            {/* Field Canvas Container */}
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-emerald-950/50 via-slate-950 to-emerald-950/50 rounded-2xl border border-emerald-900/40 overflow-hidden shadow-inner flex items-center justify-center">
              {/* Pitch Markings SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Border */}
                <rect x="2" y="2" width="96" height="56" fill="none" stroke="#10b981" strokeWidth="0.8" />
                {/* Halfway line */}
                <line x1="50" y1="2" x2="50" y2="58" stroke="#10b981" strokeWidth="0.8" />
                {/* Center circle */}
                <circle cx="50" cy="30" r="9" fill="none" stroke="#10b981" strokeWidth="0.8" />
                {/* Center spot */}
                <circle cx="50" cy="30" r="0.8" fill="#10b981" />
                {/* Left Penalty Area */}
                <rect x="2" y="14" width="16" height="32" fill="none" stroke="#10b981" strokeWidth="0.8" />
                <rect x="2" y="21" width="6" height="18" fill="none" stroke="#10b981" strokeWidth="0.8" />
                {/* Right Penalty Area */}
                <rect x="82" y="14" width="16" height="32" fill="none" stroke="#10b981" strokeWidth="0.8" />
                <rect x="92" y="21" width="6" height="18" fill="none" stroke="#10b981" strokeWidth="0.8" />
                {/* Goal boxes */}
                <rect x="0.5" y="24" width="1.5" height="12" fill="#10b981" opacity="0.4" />
                <rect x="98" y="24" width="1.5" height="12" fill="#10b981" opacity="0.4" />
              </svg>

              {/* Heatmap / Danger Zone Pulse */}
              {match.attackPhase === 'DANGEROUS_ATTACK' && (
                <div
                  className="absolute w-40 h-40 rounded-full bg-rose-500/20 blur-2xl pointer-events-none transition-all duration-700 animate-pulse"
                  style={{ left: `${match.ballPosition.x - 20}%`, top: `${match.ballPosition.y - 20}%` }}
                />
              )}

              {/* Live Ball Marker */}
              <div
                className="absolute transition-all duration-700 ease-out z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${match.ballPosition.x}%`, top: `${match.ballPosition.y}%` }}
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-white shadow-xl shadow-white/50 border-2 border-emerald-500 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                  <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-black text-white uppercase whitespace-nowrap shadow-lg">
                  {match.possessionTeam === 'HOME' ? match.homeTeam.name : match.awayTeam.name} Ball
                </div>
              </div>

              {/* Attack Phase Badge Overlay */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    match.attackPhase === 'DANGEROUS_ATTACK'
                      ? 'bg-rose-500 animate-ping'
                      : match.attackPhase === 'BUILD_UP'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">
                  {match.attackPhase.replace('_', ' ')}
                </span>
              </div>

              {/* Live Clock & Match Time */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="mono-num font-extrabold text-emerald-400">{match.clock}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-semibold">{match.currentPeriod}</span>
              </div>
            </div>

            {/* Possession Split Bar */}
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-extrabold">
                <span className="text-rose-400">{match.homeTeam.name} ({match.possessionStats.home}%)</span>
                <span className="text-slate-400 uppercase tracking-widest text-[10px]">Match Possession</span>
                <span className="text-blue-400">{match.awayTeam.name} ({match.possessionStats.away}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-l-full transition-all duration-500"
                  style={{ width: `${match.possessionStats.home}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-r-full transition-all duration-500"
                  style={{ width: `${match.possessionStats.away}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: INTERACTIVE SHOT MAP ===================== */}
        {activeVisualTab === 'SHOT_MAP' && (
          <div className="space-y-4">
            {/* Filter Buttons & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-400 mr-2">Filter Shots:</span>
                {(['ALL', 'HOME', 'AWAY'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setShotFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      shotFilter === filter
                        ? 'bg-slate-100 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'All Shots'
                      : filter === 'HOME'
                      ? `${match.homeTeam.shortName} Only`
                      : `${match.awayTeam.shortName} Only`}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span>Goal</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Saved</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Missed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Blocked</span>
                </span>
              </div>
            </div>

            {/* 2D Shot Pitch */}
            <div className="relative w-full h-72 sm:h-96 bg-gradient-to-b from-slate-950 via-[#0a1120] to-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
              {/* Pitch Visual */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="#64748b" strokeWidth="0.8" />
                <line x1="2" y1="50" x2="98" y2="50" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#64748b" strokeWidth="0.8" />
                <rect x="25" y="2" width="50" height="24" fill="none" stroke="#64748b" strokeWidth="0.8" />
                <rect x="35" y="2" width="30" height="10" fill="none" stroke="#64748b" strokeWidth="0.8" />
                <rect x="25" y="74" width="50" height="24" fill="none" stroke="#64748b" strokeWidth="0.8" />
                <rect x="35" y="88" width="30" height="10" fill="none" stroke="#64748b" strokeWidth="0.8" />
              </svg>

              {/* Shot Map Interactive Points */}
              {filteredShots.map((shot) => {
                const isGoal = shot.outcome === 'GOAL';
                const isSaved = shot.outcome === 'SAVED';
                const isMissed = shot.outcome === 'MISSED';

                const colorClass = isGoal
                  ? 'bg-emerald-400 border-white text-slate-950 shadow-lg shadow-emerald-500/50 scale-125 ring-4 ring-emerald-500/30'
                  : isSaved
                  ? 'bg-amber-400 border-amber-200 text-slate-950'
                  : isMissed
                  ? 'bg-rose-500 border-rose-300 text-white'
                  : 'bg-slate-400 border-slate-200 text-slate-900';

                return (
                  <button
                    key={shot.id}
                    onClick={() => setSelectedShot(shot)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full font-black text-[10px] flex items-center justify-center transition-all duration-300 hover:scale-150 z-20 cursor-pointer border-2 ${
                      selectedShot?.id === shot.id ? 'ring-4 ring-blue-500 scale-150' : ''
                    } ${colorClass} w-6 h-6 sm:w-7 sm:h-7`}
                    style={{ left: `${shot.y}%`, top: `${shot.x}%` }}
                    title={`${shot.player} (${shot.minute}') - ${shot.outcome} (xG: ${shot.xG})`}
                  >
                    {shot.minute}'
                  </button>
                );
              })}

              {/* Clicked Shot Details Flyout */}
              {selectedShot && (
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-slate-950/95 border border-blue-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          selectedShot.outcome === 'GOAL'
                            ? 'bg-emerald-500 text-slate-950'
                            : selectedShot.outcome === 'SAVED'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {selectedShot.outcome}
                      </span>
                      <span className="text-xs font-extrabold text-white">{selectedShot.minute}' Minute</span>
                    </div>
                    <button
                      onClick={() => setSelectedShot(null)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-white">{selectedShot.player}</h4>
                  <p className="text-xs text-slate-400">
                    {selectedShot.team === 'HOME' ? match.homeTeam.name : match.awayTeam.name}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
                    <div className="p-2 bg-slate-900 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">xG Value</span>
                      <span className="mono-num text-xs font-black text-emerald-400">{selectedShot.xG}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
                      <span className="mono-num text-xs font-black text-blue-400">{selectedShot.distance}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Type</span>
                      <span className="text-[11px] font-bold text-slate-200 truncate block">
                        {selectedShot.shotType}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: WIN PROBABILITY CURVE ===================== */}
        {activeVisualTab === 'WIN_PROB' && (
          <div className="space-y-4">
            {/* Live Prob Summary Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-300 block">{match.homeTeam.name} Win %</span>
                <span className="mono-num text-xl font-black text-rose-400">{lastWinProb.homeProb}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Draw / Tie %</span>
                <span className="mono-num text-xl font-black text-slate-300">{lastWinProb.drawProb}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/60 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">{match.awayTeam.name} Win %</span>
                <span className="mono-num text-xl font-black text-blue-400">{lastWinProb.awayProb}%</span>
              </div>
            </div>

            {/* SVG Win Probability Spline Graph */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400">Match Progression Probability Timeline</span>
                <div className="flex items-center space-x-3 text-[11px] font-bold">
                  <span className="text-rose-400">● {match.homeTeam.shortName}</span>
                  <span className="text-slate-400">● Draw</span>
                  <span className="text-blue-400">● {match.awayTeam.shortName}</span>
                </div>
              </div>

              {/* Dynamic SVG Graph */}
              <div className="w-full h-56 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="15" x2="100" y2="15" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.5" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.5" />
                  <line x1="0" y1="45" x2="100" y2="45" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="0.5" />

                  {/* Home Team Probability Path */}
                  <polyline
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    points={match.winProbabilityHistory
                      .map((p, idx) => {
                        const x = (idx / (match.winProbabilityHistory.length - 1 || 1)) * 100;
                        const y = 60 - (p.homeProb / 100) * 55;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Draw Probability Path */}
                  <polyline
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3,2"
                    points={match.winProbabilityHistory
                      .map((p, idx) => {
                        const x = (idx / (match.winProbabilityHistory.length - 1 || 1)) * 100;
                        const y = 60 - (p.drawProb / 100) * 55;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Away Team Probability Path */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={match.winProbabilityHistory
                      .map((p, idx) => {
                        const x = (idx / (match.winProbabilityHistory.length - 1 || 1)) * 100;
                        const y = 60 - (p.awayProb / 100) * 55;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Event Milestone Points */}
                  {match.winProbabilityHistory.map((p, idx) => {
                    if (!p.event) return null;
                    const x = (idx / (match.winProbabilityHistory.length - 1 || 1)) * 100;
                    const y = 60 - (p.homeProb / 100) * 55;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="2" fill="#f43f5e" stroke="#fff" strokeWidth="0.8" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Milestones List */}
              <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar text-[11px]">
                {match.winProbabilityHistory
                  .filter((p) => p.event)
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold whitespace-nowrap"
                    >
                      <span className="text-emerald-400 font-mono mr-1">{p.minute}'</span>
                      <span>{p.event}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: MOMENTUM WAVE ===================== */}
        {activeVisualTab === 'MOMENTUM' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Match Attacking Momentum Wave</span>
                <span className="text-[11px] font-bold text-emerald-400">Calculated from dangerous attacks & shots</span>
              </div>

              {/* Momentum SVG Wave */}
              <div className="w-full h-44 relative bg-slate-900/50 rounded-xl p-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60" preserveAspectRatio="none">
                  {/* Zero Center Line */}
                  <line x1="0" y1="30" x2="100" y2="30" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Momentum Bar Area */}
                  {match.momentumHistory.map((m, idx) => {
                    const x = (idx / (match.momentumHistory.length - 1 || 1)) * 96 + 2;
                    const height = Math.abs(m.momentum) * 0.25;
                    const y = m.momentum >= 0 ? 30 - height : 30;
                    const isHome = m.momentum >= 0;

                    return (
                      <g key={idx}>
                        <rect
                          x={x - 2}
                          y={y}
                          width="4"
                          height={Math.max(2, height)}
                          rx="1"
                          fill={isHome ? '#f43f5e' : '#3b82f6'}
                          opacity={0.85}
                        />
                        {m.event && (
                          <circle
                            cx={x}
                            cy={isHome ? y - 3 : y + height + 3}
                            r="2.5"
                            fill="#10b981"
                            stroke="#fff"
                            strokeWidth="0.8"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="text-rose-400">▲ {match.homeTeam.name} Attacking Pressure</span>
                <span className="text-blue-400">▼ {match.awayTeam.name} Attacking Pressure</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 5: ADVANCED STATS ===================== */}
        {activeVisualTab === 'STATS' && (
          <div className="space-y-3">
            {match.stats.map((stat, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="mono-num text-rose-400 text-sm">{stat.home}</span>
                  <span className="text-slate-400 uppercase text-[11px] tracking-wider">{stat.label}</span>
                  <span className="mono-num text-blue-400 text-sm">{stat.away}</span>
                </div>

                {stat.homePercent !== undefined && stat.awayPercent !== undefined && (
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-rose-500 rounded-l-full transition-all"
                      style={{ width: `${stat.homePercent}%` }}
                    />
                    <div
                      className="h-full bg-blue-500 rounded-r-full transition-all"
                      style={{ width: `${stat.awayPercent}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
