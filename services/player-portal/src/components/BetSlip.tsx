import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Zap, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export interface SelectedBet {
  marketId: string;
  eventName: string;
  selectionId: number;
  selectionName: string;
  type: 'BACK' | 'LAY';
  price: number;
}

interface BetSlipProps {
  bet: SelectedBet | null;
  availableCredit: number;
  onClose: () => void;
  onPlaceBet: (payload: {
    marketId: string;
    selectionId: number;
    type: 'BACK' | 'LAY';
    price: number;
    stake: number;
  }) => Promise<void>;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  bet,
  availableCredit,
  onClose,
  onPlaceBet
}) => {
  const [price, setPrice] = useState<number>(bet ? bet.price : 2.0);
  const [stake, setStake] = useState<string>('500');
  const [betType, setBetType] = useState<'BACK' | 'LAY'>(bet ? bet.type : 'BACK');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (bet) {
      setPrice(bet.price);
      setBetType(bet.type);
      setError(null);
      setSuccess(false);
    }
  }, [bet]);

  if (!bet) return null;

  const numStake = parseFloat(stake) || 0;

  // Real-time Liability & Profit calculations
  const liability =
    betType === 'BACK'
      ? numStake
      : Math.round(numStake * (price - 1) * 100) / 100;

  const potentialProfit =
    betType === 'BACK'
      ? Math.round(numStake * (price - 1) * 100) / 100
      : numStake;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numStake <= 0) {
      setError('Please enter a stake greater than 0');
      return;
    }
    if (price <= 1.0) {
      setError('Price must be greater than 1.00');
      return;
    }
    if (liability > availableCredit) {
      setError(`Liability (₹${liability.toFixed(2)}) exceeds available credit (₹${availableCredit.toFixed(2)})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onPlaceBet({
        marketId: bet.marketId,
        selectionId: bet.selectionId,
        type: betType,
        price,
        stake: numStake
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Bet placement rejected');
    } finally {
      setLoading(false);
    }
  };

  const adjustPrice = (delta: number) => {
    setPrice((prev) => Math.max(1.01, Math.round((prev + delta) * 100) / 100));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-96 p-3 sm:p-0 animate-in slide-in-from-bottom duration-200">
      <div
        className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl ${
          betType === 'BACK'
            ? 'bg-slate-900/95 border-blue-600/60 shadow-blue-900/20'
            : 'bg-slate-900/95 border-pink-600/60 shadow-pink-900/20'
        }`}
      >
        {/* Slip Header */}
        <div
          className={`px-4 py-3 flex items-center justify-between text-white font-bold text-sm ${
            betType === 'BACK' ? 'bg-blue-600' : 'bg-pink-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="uppercase tracking-wider text-xs font-black px-2 py-0.5 rounded bg-black/20">
              {betType} BET SLIP
            </span>
            <span className="truncate max-w-[160px]">{bet.selectionName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>Order Matched / Placed into Order Book!</span>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBetType('BACK')}
              className={`py-1.5 font-extrabold rounded-lg transition-all ${
                betType === 'BACK'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BACK (BUY)
            </button>
            <button
              type="button"
              onClick={() => setBetType('LAY')}
              className={`py-1.5 font-extrabold rounded-lg transition-all ${
                betType === 'LAY'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LAY (SELL)
            </button>
          </div>

          {/* Odds (Price) Input with Steppers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Odds (Price)</label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => adjustPrice(-0.01)}
                  className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 1.01)}
                  required
                  className="w-full text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjustPrice(0.01)}
                  className="px-2.5 py-2 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Stake (₹)</label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="500"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm text-right focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Stake Chips */}
          <div className="grid grid-cols-5 gap-1">
            {[100, 500, 1000, 2500, 5000].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setStake(chip.toString())}
                className="py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono font-semibold border border-slate-700/60"
              >
                ₹{chip}
              </button>
            ))}
          </div>

          {/* Liability & Profit Preview Card */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Locked Liability (Risk):</span>
              <span className="mono-num font-bold text-rose-400">
                ₹{liability.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Potential Net Profit:</span>
              <span className="mono-num font-bold text-emerald-400">
                +₹{potentialProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3 rounded-xl font-extrabold text-white text-sm shadow-xl transition-all ${
              betType === 'BACK'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                : 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/30'
            } disabled:opacity-50`}
          >
            {loading ? 'Locking Liability & Matching...' : `PLACE ${betType} ORDER (₹${liability.toFixed(0)})`}
          </button>
        </form>
      </div>
    </div>
  );
};
