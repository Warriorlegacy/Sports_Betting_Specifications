import React from 'react';
import { Lock, Trophy, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export interface LadderLevel {
  price: number;
  size: number;
}

export interface SelectionLadder {
  selectionId: number;
  back: LadderLevel[]; // Top 3 sorted DESC
  lay: LadderLevel[];  // Top 3 sorted ASC
}

export interface MarketRunner {
  selectionId: number;
  name: string;
  status: string;
}

export interface Market {
  id: string;
  eventName: string;
  marketType: string;
  sport: string;
  isLocked: boolean;
  inPlay: boolean;
  status: string;
  winningSelectionId: number | null;
  selections: MarketRunner[];
}

interface MarketLadderProps {
  market: Market;
  ladderData: Record<number, SelectionLadder>;
  pnlMatrix: Record<number, number>;
  onSelectOdds: (selectionId: number, selectionName: string, type: 'BACK' | 'LAY', price: number) => void;
}

export const MarketLadder: React.FC<MarketLadderProps> = ({
  market,
  ladderData,
  pnlMatrix,
  onSelectOdds
}) => {
  const isSuspended = market.isLocked || market.status === 'SUSPENDED';
  const isSettled = market.status === 'SETTLED';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Market Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
            {market.sport}
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {market.eventName}
          </h2>
          {market.inPlay && !isSuspended && !isSettled && (
            <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>In-Play Live</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <span>Match Odds</span>
          <span className="text-slate-600">•</span>
          <span className="mono-num">2% Commission</span>
        </div>
      </div>

      {/* Ladder Column Header */}
      <div className="grid grid-cols-12 bg-slate-950/90 text-center py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
        <div className="col-span-5 sm:col-span-6 text-left">Selections / Position</div>
        <div className="col-span-3 text-blue-400 font-extrabold bg-blue-950/30 rounded-t py-0.5">
          BACK (BLUE)
        </div>
        <div className="col-span-4 sm:col-span-3 text-pink-400 font-extrabold bg-pink-950/30 rounded-t py-0.5">
          LAY (PINK)
        </div>
      </div>

      {/* Suspension / Settled Overlay */}
      {isSuspended && (
        <div className="absolute inset-x-0 bottom-0 top-14 bg-slate-950/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-2 p-6 text-center animate-in fade-in">
          <div className="p-3 rounded-full bg-red-600/20 text-red-400 border border-red-500/40">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider">MARKET SUSPENDED</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Critical match event or in-play pause. Order matching and betting temporarily frozen.
          </p>
        </div>
      )}

      {isSettled && (
        <div className="absolute inset-x-0 bottom-0 top-14 bg-slate-950/90 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-2 p-6 text-center animate-in fade-in">
          <div className="p-3 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/40">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider">MARKET SETTLED</h3>
          <p className="text-xs text-slate-300">
            Winning Selection:{' '}
            <span className="font-bold text-emerald-400">
              {market.selections.find((s) => s.selectionId === market.winningSelectionId)?.name || 'Winner'}
            </span>
          </p>
        </div>
      )}

      {/* Runners Rows */}
      <div className="divide-y divide-slate-800/80">
        {market.selections.map((runner) => {
          const ladder = ladderData[runner.selectionId] || { back: [], lay: [] };
          const pnl = pnlMatrix[runner.selectionId] || 0;

          // Back prices (Top 3)
          const back1 = ladder.back[0] || { price: 1.85, size: 2500 };
          const back2 = ladder.back[1] || { price: 1.83, size: 5000 };
          const back3 = ladder.back[2] || { price: 1.81, size: 10000 };

          // Lay prices (Top 3)
          const lay1 = ladder.lay[0] || { price: 1.87, size: 2500 };
          const lay2 = ladder.lay[1] || { price: 1.89, size: 5000 };
          const lay3 = ladder.lay[2] || { price: 1.91, size: 10000 };

          return (
            <div
              key={runner.selectionId}
              className="grid grid-cols-12 items-stretch hover:bg-slate-800/30 transition-colors"
            >
              {/* Runner Info & Position P&L */}
              <div className="col-span-5 sm:col-span-6 p-3 sm:p-4 flex flex-col justify-center">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-100">{runner.name}</span>
                  {market.winningSelectionId === runner.selectionId && (
                    <Trophy className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                {/* Net P&L Indicator */}
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] text-slate-400">Position:</span>
                  <span
                    className={`mono-num text-xs font-black ${
                      pnl > 0
                        ? 'text-emerald-400'
                        : pnl < 0
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {pnl > 0 ? `+₹${pnl.toFixed(2)}` : pnl < 0 ? `-₹${Math.abs(pnl).toFixed(2)}` : '₹0.00'}
                  </span>
                </div>
              </div>

              {/* BACK Odds Columns (Blue) */}
              <div className="col-span-3 grid grid-cols-3 gap-1 p-1 sm:p-1.5 bg-blue-950/15">
                {/* Level 3 (Hidden on mobile) */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'BACK', back3.price)}
                  className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/70 border border-blue-700/40 transition-all text-center"
                >
                  <span className="mono-num text-xs font-bold text-blue-200">{back3.price.toFixed(2)}</span>
                  <span className="mono-num text-[10px] text-blue-400">₹{back3.size.toLocaleString()}</span>
                </button>

                {/* Level 2 */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'BACK', back2.price)}
                  className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded-lg bg-blue-800/50 hover:bg-blue-700/70 border border-blue-600/50 transition-all text-center"
                >
                  <span className="mono-num text-xs font-extrabold text-blue-100">{back2.price.toFixed(2)}</span>
                  <span className="mono-num text-[10px] text-blue-300">₹{back2.size.toLocaleString()}</span>
                </button>

                {/* Level 1: Best Back Odds (Dominant) */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'BACK', back1.price)}
                  className="col-span-3 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/50 transition-all transform active:scale-95"
                >
                  <span className="mono-num text-sm sm:text-base font-black tracking-tight">
                    {back1.price.toFixed(2)}
                  </span>
                  <span className="mono-num text-[10px] text-blue-100 font-semibold">
                    ₹{back1.size.toLocaleString()}
                  </span>
                </button>
              </div>

              {/* LAY Odds Columns (Pink) */}
              <div className="col-span-4 sm:col-span-3 grid grid-cols-3 gap-1 p-1 sm:p-1.5 bg-pink-950/15">
                {/* Level 1: Best Lay Odds (Dominant) */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'LAY', lay1.price)}
                  className="col-span-3 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 border border-pink-400/50 transition-all transform active:scale-95"
                >
                  <span className="mono-num text-sm sm:text-base font-black tracking-tight">
                    {lay1.price.toFixed(2)}
                  </span>
                  <span className="mono-num text-[10px] text-pink-100 font-semibold">
                    ₹{lay1.size.toLocaleString()}
                  </span>
                </button>

                {/* Level 2 */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'LAY', lay2.price)}
                  className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded-lg bg-pink-800/50 hover:bg-pink-700/70 border border-pink-600/50 transition-all text-center"
                >
                  <span className="mono-num text-xs font-extrabold text-pink-100">{lay2.price.toFixed(2)}</span>
                  <span className="mono-num text-[10px] text-pink-300">₹{lay2.size.toLocaleString()}</span>
                </button>

                {/* Level 3 */}
                <button
                  type="button"
                  onClick={() => onSelectOdds(runner.selectionId, runner.name, 'LAY', lay3.price)}
                  className="hidden sm:flex flex-col items-center justify-center p-1.5 rounded-lg bg-pink-900/40 hover:bg-pink-800/70 border border-pink-700/40 transition-all text-center"
                >
                  <span className="mono-num text-xs font-bold text-pink-200">{lay3.price.toFixed(2)}</span>
                  <span className="mono-num text-[10px] text-pink-400">₹{lay3.size.toLocaleString()}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
