import React, { useState, useEffect } from 'react';
import { MatkaMarket, fetchLiveMatkaMarkets } from '../services/fairplayFeedClient';
import { Sparkles, Clock, Shield, Trophy, Flame, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';

interface MatkaHubProps {
  user: any | null;
  onOpenLogin: () => void;
  onBetPlaced?: (bet: any) => void;
}

export const MatkaHub: React.FC<MatkaHubProps> = ({ user, onOpenLogin, onBetPlaced }) => {
  const [markets, setMarkets] = useState<MatkaMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeMarket, setActiveMarket] = useState<MatkaMarket | null>(null);

  // Betting Form State
  const [betType, setBetType] = useState<'single' | 'jodi' | 'singlePatti' | 'doublePatti' | 'triplePatti'>('single');
  const [selectedDigit, setSelectedDigit] = useState<string>('7');
  const [stakeAmount, setStakeAmount] = useState<number>(500);
  const [betSuccessMsg, setBetSuccessMsg] = useState<string | null>(null);

  const loadMatkaData = async () => {
    setLoading(true);
    const data = await fetchLiveMatkaMarkets();
    setMarkets(data);
    if (data.length > 0 && !activeMarket) {
      setActiveMarket(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMatkaData();
    const interval = setInterval(loadMatkaData, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['ALL', 'MATKA MARKET', 'DELHI MARKET'];

  const filteredMarkets = markets.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getRate = (type: string, market: MatkaMarket | null) => {
    if (!market) return 9;
    if (type === 'single') return market.rates.single || 9;
    if (type === 'jodi') return market.rates.jodi || 90;
    if (type === 'singlePatti') return market.rates.singlePatti || 140;
    if (type === 'doublePatti') return market.rates.doublePatti || 280;
    if (type === 'triplePatti') return market.rates.triplePatti || 700;
    return 9;
  };

  const currentRate = getRate(betType, activeMarket);
  const potentialWin = stakeAmount * currentRate;

  const handlePlaceMatkaBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    if (!activeMarket) return;

    setBetSuccessMsg(
      `🎉 Bet Placed on ${activeMarket.title}! ${betType.toUpperCase()} #${selectedDigit} for ₹${stakeAmount.toLocaleString()} (Potential Win: ₹${potentialWin.toLocaleString()})`
    );

    if (onBetPlaced) {
      onBetPlaced({
        marketId: `MATKA_${activeMarket.id}`,
        eventName: activeMarket.title,
        selectionName: `${betType.toUpperCase()} ${selectedDigit}`,
        stake: stakeAmount,
        odds: currentRate,
        potentialWin
      });
    }

    setTimeout(() => setBetSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900/60 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Live Indian Worli Matka Bazar</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                23 Active Bazars
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              KALYAN • MILAN • DESAWAR • RAJDHANI
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Place official live bids on Single Digit (9x), Jodi (90x), Single Patti (140x), Double Patti (280x), and Triple Patti (700x) with instant automated ledger settlement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMatkaData}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat === 'ALL' ? '🌟 All Markets (23)' : cat}
          </button>
        ))}
      </div>

      {/* Main Grid & Betting Slip Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Matka Market Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMarkets.map((m) => {
              const isSelected = activeMarket?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMarket(m)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90">
                        {m.category}
                      </span>
                      <h3 className="text-base font-black text-white tracking-wide">{m.title}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        m.isSuspended
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {m.isSuspended ? 'Suspended' : 'Open for Bids'}
                    </span>
                  </div>

                  {/* Open & Close Timings */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open: <strong className="text-slate-200">{m.openBids}</strong></span>
                    </div>
                    <span>•</span>
                    <div>
                      <span>Close: <strong className="text-slate-200">{m.closeBids}</strong></span>
                    </div>
                  </div>

                  {/* Rates Row */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400">Single</div>
                      <div className="font-black text-amber-400">1 : {m.rates.single || 9}</div>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400">Jodi</div>
                      <div className="font-black text-amber-400">1 : {m.rates.jodi || 90}</div>
                    </div>
                    <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400">Patti</div>
                      <div className="font-black text-amber-400">1 : {m.rates.singlePatti || 140}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Live Bidding Pad */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Official Bet Slip</span>
                <h3 className="text-lg font-black text-white">{activeMarket?.title || 'Select a Market'}</h3>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
                Rate: {currentRate}x
              </div>
            </div>

            {betSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{betSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handlePlaceMatkaBet} className="space-y-4">
              {/* Bet Type Tabs */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Bet Type</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => { setBetType('single'); setSelectedDigit('7'); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      betType === 'single'
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Single (9x)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBetType('jodi'); setSelectedDigit('72'); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      betType === 'jodi'
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Jodi (90x)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBetType('singlePatti'); setSelectedDigit('124'); }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      betType === 'singlePatti'
                        ? 'bg-amber-500 text-black shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Patti (140x)
                  </button>
                </div>
              </div>

              {/* Number Input / Digit Grid */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">
                  Select {betType === 'single' ? 'Single Digit (0-9)' : betType === 'jodi' ? 'Jodi (00-99)' : 'Pana Number'}
                </label>
                {betType === 'single' ? (
                  <div className="grid grid-cols-5 gap-2 mt-1.5">
                    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => setSelectedDigit(digit)}
                        className={`py-2 rounded-xl text-sm font-black transition-all ${
                          selectedDigit === digit
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={selectedDigit}
                    onChange={(e) => setSelectedDigit(e.target.value)}
                    placeholder="Enter number (e.g. 72)"
                    className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                )}
              </div>

              {/* Stake Quick Buttons */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase">Stake Amount (₹)</label>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setStakeAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        stakeAmount === amt
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Payout Summary */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Market</span>
                  <span className="font-bold text-slate-200">{activeMarket?.title}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Choice</span>
                  <span className="font-bold text-amber-400 font-mono">#{selectedDigit}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Multiplier Rate</span>
                  <span className="font-bold text-slate-200">{currentRate}x</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                  <span className="text-slate-300">Potential Return</span>
                  <span className="text-emerald-400 font-mono">₹{potentialWin.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!activeMarket || activeMarket.isSuspended}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{user ? `Place Bid for ₹${stakeAmount.toLocaleString()}` : 'Sign In to Place Bid'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
