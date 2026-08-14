import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Zap,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { BetSlipItem, OddsFormat, SGPTicket } from '../types/sportsbook';
import { formatOdds } from '../services/oddsFormatter';

interface EnhancedBetSlipProps {
  items: BetSlipItem[];
  availableCredit: number;
  oddsFormat: OddsFormat;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onUpdateStake: (id: string, stake: number) => void;
  onPlaceBets: (items: BetSlipItem[]) => Promise<void>;
  onClose: () => void;
}

export const EnhancedBetSlip: React.FC<EnhancedBetSlipProps> = ({
  items,
  availableCredit,
  oddsFormat,
  onRemoveItem,
  onClearAll,
  onUpdateStake,
  onPlaceBets,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SINGLES' | 'PARLAYS'>('SINGLES');

  if (items.length === 0) return null;

  const totalStake = items.reduce((sum, item) => sum + (item.stake || 0), 0);
  const totalPotentialReturn = items.reduce((sum, item) => {
    if (item.isSGP && item.sgpTicket) {
      return sum + (item.stake || 0) * item.sgpTicket.finalBoostedOdds;
    }
    return sum + (item.stake || 0) * item.price;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalStake <= 0) {
      setError('Please enter a stake for your selections');
      return;
    }
    if (totalStake > availableCredit) {
      setError(
        `Total Stake (₹${totalStake.toFixed(2)}) exceeds available credit (₹${availableCredit.toFixed(2)})`
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onPlaceBets(items);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClearAll();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to place bets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-[420px] p-3 sm:p-0 animate-in slide-in-from-bottom duration-300">
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col max-h-[85vh]">
        {/* Bet Slip Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-black text-sm uppercase tracking-wider">UNIVERSAL BET SLIP</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/30">
              {items.length} {items.length === 1 ? 'Pick' : 'Picks'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClearAll}
              className="p-1 rounded-lg hover:bg-black/20 text-white/80 hover:text-white transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slip Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span className="font-bold">Bets successfully placed & matched into order book!</span>
            </div>
          )}

          {/* Ticket Items List */}
          <div className="space-y-2.5">
            {items.map((item) => {
              if (item.isSGP && item.sgpTicket) {
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/70 space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>SGP Bet Builder</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 truncate max-w-[160px]">
                        {item.eventName}
                      </span>
                    </div>

                    {/* SGP Legs List */}
                    <div className="space-y-1 pl-2 border-l-2 border-purple-500/40">
                      {item.sgpTicket.legs.map((leg) => (
                        <div key={leg.id} className="text-[11px] font-bold text-slate-200">
                          • {leg.selectionName}{' '}
                          <span className="text-slate-400 text-[10px]">({leg.marketName})</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-purple-900/40">
                      <span className="text-xs font-bold text-slate-400">Combined Odds:</span>
                      <span className="mono-num text-sm font-black text-purple-300">
                        {formatOdds(item.sgpTicket.finalBoostedOdds, oddsFormat)}
                      </span>
                    </div>

                    {/* Stake Input for SGP */}
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-400">Stake (₹):</span>
                      <input
                        type="number"
                        min="1"
                        value={item.stake}
                        onChange={(e) => onUpdateStake(item.id, parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-right"
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      {item.eventName} • {item.marketName}
                    </span>
                    <span className="font-extrabold text-white text-xs">{item.selectionName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="mono-num text-sm font-black text-blue-400">
                      {formatOdds(item.price, oddsFormat)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-400 font-bold">Stake (₹):</span>
                      <input
                        type="number"
                        min="1"
                        value={item.stake}
                        onChange={(e) => onUpdateStake(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-right text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stake Preset Chips */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[100, 500, 1000, 2500, 5000].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  items.forEach((item) => onUpdateStake(item.id, chip));
                }}
                className="py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-[10px] border border-slate-700"
              >
                +₹{chip}
              </button>
            ))}
          </div>

          {/* Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Total Wager Stake:</span>
              <span className="mono-num text-white font-black">
                ₹{totalStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Est. Total Return:</span>
              <span className="mono-num text-emerald-400 font-black">
                ₹{totalPotentialReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Place Bet Action Button */}
          <button
            type="submit"
            disabled={loading || success || totalStake <= 0}
            className="w-full py-3.5 rounded-2xl font-black text-white text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-xl shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Locking Liability & Submitting...</span>
            ) : (
              <>
                <span>PLACE BETS (₹{totalStake.toFixed(0)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
