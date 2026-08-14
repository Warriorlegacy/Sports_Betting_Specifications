import React from 'react';
import { TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { MarketRunner } from './MarketLadder';

interface PositionMatrixProps {
  selections: MarketRunner[];
  pnlMatrix: Record<number, number>;
  netExposure: number;
}

export const PositionMatrix: React.FC<PositionMatrixProps> = ({
  selections,
  pnlMatrix,
  netExposure
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-extrabold text-white">Live Position Matrix & Market Exposure</h3>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400">Worst-Case Exposure:</span>
          <span className="mono-num font-extrabold text-rose-400">
            ₹{netExposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {selections.map((runner) => {
          const pnl = pnlMatrix[runner.selectionId] || 0;
          return (
            <div
              key={runner.selectionId}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                pnl > 0
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : pnl < 0
                  ? 'bg-rose-950/30 border-rose-800/60'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <span className="text-xs font-bold text-slate-300 truncate">If {runner.name} Wins</span>
              <span
                className={`mono-num text-sm sm:text-base font-black mt-1 ${
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
          );
        })}
      </div>
    </div>
  );
};
