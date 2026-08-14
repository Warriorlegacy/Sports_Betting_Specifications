import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Percent,
  Clock,
  Sparkles
} from 'lucide-react';
import { CashOutBet, OddsFormat } from '../types/sportsbook';
import { formatOdds } from '../services/oddsFormatter';

interface CashOutManagerProps {
  bets: CashOutBet[];
  oddsFormat: OddsFormat;
  onExecuteCashOut: (betId: string, cashOutAmount: number, percentage: number) => Promise<void>;
  onSetAutoCashOut: (betId: string, threshold: number) => void;
}

export const CashOutManager: React.FC<CashOutManagerProps> = ({
  bets,
  oddsFormat,
  onExecuteCashOut,
  onSetAutoCashOut
}) => {
  const [partialPercentages, setPartialPercentages] = useState<Record<string, number>>({});
  const [activeSliderBetId, setActiveSliderBetId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<{ id: string; amount: number } | null>(null);
  const [autoThresholdInputs, setAutoThresholdInputs] = useState<Record<string, string>>({});

  const activeBets = bets.filter((b) => b.status === 'OPEN' || b.status === 'PARTIALLY_CASHED_OUT');
  const cashedOutBets = bets.filter((b) => b.status === 'CASHED_OUT');

  const handleCashOut = async (bet: CashOutBet, percentage: number = 100) => {
    try {
      setProcessingId(bet.id);
      const cashOutValue = Math.round(bet.cashOutOffer * (percentage / 100) * 100) / 100;
      await onExecuteCashOut(bet.id, cashOutValue, percentage);
      setSuccessToast({ id: bet.id, amount: cashOutValue });
      setActiveSliderBetId(null);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Cash out execution failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSliderChange = (betId: string, val: number) => {
    setPartialPercentages((prev) => ({ ...prev, [betId]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-100 flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block">Early Cash-Out Settled!</span>
              <span className="text-xs text-emerald-300">
                ₹{successToast.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to your available balance immediately.
              </span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">EARLY CASH-OUT TERMINAL</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Dynamic Payouts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Lock in profit or mitigate risk before the final whistle. Full & Partial sliders supported.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <span className="mono-num text-emerald-400 font-extrabold">{activeBets.length} Active Eligible</span>
          <span>•</span>
          <span className="mono-num text-slate-300 font-extrabold">{cashedOutBets.length} Settled</span>
        </div>
      </div>

      {/* Active Cash Out Bets List */}
      <div className="space-y-4">
        {activeBets.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
            <DollarSign className="w-10 h-10 mx-auto text-slate-600" />
            <h4 className="text-sm font-bold text-slate-300">No Open Cash-Out Eligible Bets</h4>
            <p className="text-xs text-slate-500">
              Place bets on in-play or upcoming markets to manage early cash-outs here.
            </p>
          </div>
        ) : (
          activeBets.map((bet) => {
            const percentage = partialPercentages[bet.id] || 50;
            const partialCashOutAmount = Math.round(bet.cashOutOffer * (percentage / 100) * 100) / 100;
            const remainingStake = Math.round(bet.remainingStake * (1 - percentage / 100) * 100) / 100;
            const remainingReturn = Math.round(remainingStake * bet.placedOdds * 100) / 100;
            const isSliderOpen = activeSliderBetId === bet.id;
            const isProfit = bet.cashOutOffer > bet.stake;

            return (
              <div
                key={bet.id}
                className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 transition-all hover:border-slate-700"
              >
                {/* Top Row: Event & Selection Details */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600/20 text-blue-300 border border-blue-500/30">
                        {bet.type}
                      </span>
                      <span className="text-xs font-black text-slate-400">{bet.eventName}</span>
                    </div>
                    <h4 className="text-base font-black text-white mt-1">{bet.selectionName}</h4>
                    <span className="text-xs text-slate-400 block">{bet.marketName}</span>
                  </div>

                  {/* Odds & Stake Info */}
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end space-x-2 text-xs">
                      <span className="text-slate-400">Placed @</span>
                      <span className="mono-num font-extrabold text-blue-400">
                        {formatOdds(bet.placedOdds, oddsFormat)}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-slate-400">Live:</span>
                      <span
                        className={`mono-num font-extrabold ${
                          bet.currentOdds < bet.placedOdds ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatOdds(bet.currentOdds, oddsFormat)}
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400">Stake: </span>
                      <span className="mono-num font-bold text-slate-200">₹{bet.remainingStake.toLocaleString()}</span>
                      <span className="text-slate-500"> | Win: </span>
                      <span className="mono-num font-bold text-emerald-400">
                        ₹{bet.potentialReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SGP Legs Summary if applicable */}
                {bet.sgpLegsSummary && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                    {bet.sgpLegsSummary.map((leg, idx) => (
                      <div key={idx} className="text-slate-300 font-medium">
                        {leg}
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Dynamic Cash Out Action Bar */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                        bet.tick === 'up'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : bet.tick === 'down'
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {bet.tick === 'up' ? (
                        <TrendingUp className="w-5 h-5 animate-bounce" />
                      ) : bet.tick === 'down' ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <DollarSign className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Cash-Out Value</span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`mono-num text-xl sm:text-2xl font-black ${
                            isProfit ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          ₹{bet.cashOutOffer.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {isProfit && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                            PROFIT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Full Cash Out & Partial Toggle */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveSliderBetId(isSliderOpen ? null : bet.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        isSliderOpen
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Partial Slider</span>
                    </button>

                    <button
                      type="button"
                      disabled={processingId === bet.id}
                      onClick={() => handleCashOut(bet, 100)}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-white text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      {processingId === bet.id ? 'Settling...' : `FULL CASH OUT (₹${bet.cashOutOffer.toFixed(0)})`}
                    </button>
                  </div>
                </div>

                {/* Partial Cash Out Slider Drawer */}
                {isSliderOpen && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-950 to-slate-950 border border-purple-800/50 space-y-4 animate-in slide-in-from-top duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        <span>Partial Cash-Out Amount:</span>
                      </span>
                      <span className="mono-num text-sm font-black text-purple-400">{percentage}%</span>
                    </div>

                    {/* Range Slider */}
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={percentage}
                      onChange={(e) => handleSliderChange(bet.id, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Receive Immediately</span>
                        <span className="mono-num text-sm font-black text-emerald-400">
                          +₹{partialCashOutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Remaining Potential Win</span>
                        <span className="mono-num text-sm font-black text-blue-400">
                          ₹{remainingReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Execute Partial Button */}
                    <button
                      type="button"
                      disabled={processingId === bet.id}
                      onClick={() => handleCashOut(bet, percentage)}
                      className="w-full py-2.5 rounded-xl font-black text-white text-xs uppercase bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
                    >
                      {processingId === bet.id ? 'Settling Partial...' : `CASH OUT ${percentage}% (₹${partialCashOutAmount.toFixed(2)})`}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
