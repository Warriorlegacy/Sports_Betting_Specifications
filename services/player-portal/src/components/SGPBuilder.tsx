import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Plus,
  Check,
  AlertTriangle,
  Zap,
  TrendingUp,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { LiveMatch, SGPLeg, SGPTicket, OddsFormat } from '../types/sportsbook';
import { SportsbookEngine } from '../services/sportsbookEngine';
import { formatOdds } from '../services/oddsFormatter';

interface SGPBuilderProps {
  match: LiveMatch;
  oddsFormat: OddsFormat;
  onAddSGPToSlip: (ticket: SGPTicket, stake: number) => void;
}

export const SGPBuilder: React.FC<SGPBuilderProps> = ({
  match,
  oddsFormat,
  onAddSGPToSlip
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLegs, setSelectedLegs] = useState<SGPLeg[]>([]);
  const [stake, setStake] = useState<string>('500');

  // Flatten available match selections into selectable SGP legs
  const availableLegs: SGPLeg[] = useMemo(() => {
    const legs: SGPLeg[] = [];
    for (const market of match.markets) {
      for (const sel of market.selections) {
        legs.push({
          id: `${market.id}_${sel.id}`,
          marketId: market.id,
          marketName: market.name,
          selectionId: sel.id,
          selectionName: sel.name,
          price: sel.price,
          category: market.category
        });
      }
    }
    return legs;
  }, [match]);

  const categories = [
    { id: 'ALL', label: 'All Picks' },
    { id: 'MAIN', label: 'Match Result' },
    { id: 'TOTALS', label: 'Totals & Over/Under' },
    { id: 'PROPS', label: 'Player Props' },
    { id: 'CORNERS_CARDS', label: 'Corners & Cards' },
    { id: 'HANDICAPS', label: 'Spreads' }
  ];

  const filteredLegs = availableLegs.filter((leg) => {
    if (selectedCategory === 'ALL') return true;
    return leg.category === selectedCategory;
  });

  const isLegSelected = (legId: string) => selectedLegs.some((l) => l.id === legId);

  const toggleLeg = (leg: SGPLeg) => {
    if (isLegSelected(leg.id)) {
      setSelectedLegs((prev) => prev.filter((l) => l.id !== leg.id));
    } else {
      setSelectedLegs((prev) => [...prev, leg]);
    }
  };

  const removeLeg = (legId: string) => {
    setSelectedLegs((prev) => prev.filter((l) => l.id !== legId));
  };

  // SGP calculation & conflict check
  const eventName = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
  const conflictError = useMemo(() => SportsbookEngine.validateSGPConflicts(selectedLegs), [selectedLegs]);
  const sgpTicket = useMemo(
    () => SportsbookEngine.calculateSGPTicket(match.id, eventName, selectedLegs),
    [match.id, eventName, selectedLegs]
  );

  const numStake = parseFloat(stake) || 0;
  const potentialPayout = sgpTicket ? Math.round(numStake * sgpTicket.finalBoostedOdds * 100) / 100 : 0;

  const handleAddToSlip = () => {
    if (!sgpTicket || conflictError) return;
    onAddSGPToSlip(sgpTicket, numStake);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* SGP Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-white tracking-tight">SAME-GAME PARLAY (SGP) BUILDER</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Bet Builder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Combine multiple correlated outcomes from {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
          </div>
        </div>

        {/* Live Boost Badge */}
        {sgpTicket && sgpTicket.boostPercentage > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-pulse">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>+{sgpTicket.boostPercentage}% SGP BOOST UNLOCKED!</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Builder Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Side: Available Legs Selector (7 Cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-3 max-h-[520px] overflow-y-auto">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1">
            <span>Choose Match Legs to Combine</span>
            <span className="mono-num">{filteredLegs.length} Picks Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredLegs.map((leg) => {
              const selected = isLegSelected(leg.id);

              return (
                <button
                  key={leg.id}
                  type="button"
                  onClick={() => toggleLeg(leg)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selected
                      ? 'bg-purple-950/50 border-purple-500/80 shadow-lg shadow-purple-900/25 ring-2 ring-purple-500/30'
                      : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {leg.marketName}
                    </span>
                    <span className="text-xs font-black text-white block">{leg.selectionName}</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`mono-num text-xs font-black px-2 py-1 rounded-lg ${
                        selected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300'
                      }`}
                    >
                      {formatOdds(leg.price, oddsFormat)}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        selected
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-600'
                      }`}
                    >
                      {selected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: SGP Ticket Preview & Calculation (5 Cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-950/50 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Selected SGP Legs ({selectedLegs.length})</span>
              </span>
              {selectedLegs.length > 0 && (
                <button
                  onClick={() => setSelectedLegs([])}
                  className="text-[11px] font-bold text-slate-400 hover:text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Conflict Warning */}
            {conflictError && (
              <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span className="font-bold">{conflictError}</span>
              </div>
            )}

            {/* Selected Legs List */}
            {selectedLegs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
                <p className="text-xs font-bold text-slate-400">Select 2 or more picks from this matchup to build your SGP.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedLegs.map((leg) => (
                  <div
                    key={leg.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">{leg.marketName}</span>
                      <span className="font-extrabold text-white">{leg.selectionName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="mono-num font-black text-purple-300">
                        {formatOdds(leg.price, oddsFormat)}
                      </span>
                      <button
                        onClick={() => removeLeg(leg.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SGP Combined Calculation Box */}
          {sgpTicket && selectedLegs.length >= 2 && !conflictError && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/60 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300">Combined SGP Odds:</span>
                <div className="text-right">
                  <span className="mono-num text-xl font-black bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                    {formatOdds(sgpTicket.finalBoostedOdds, oddsFormat)}
                  </span>
                  {sgpTicket.boostPercentage > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 block">
                      +{sgpTicket.boostPercentage}% Boost Applied
                    </span>
                  )}
                </div>
              </div>

              {/* Stake input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Wager Amount (₹)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="10"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                  />
                  {[500, 1000, 2500].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setStake(quick.toString())}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[11px] font-mono font-bold text-slate-300"
                    >
                      ₹{quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potential Return */}
              <div className="flex justify-between items-center pt-2 border-t border-purple-900/40">
                <span className="text-xs font-bold text-slate-400">Total Potential Return:</span>
                <span className="mono-num text-base font-black text-emerald-400">
                  ₹{potentialPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Add to slip button */}
              <button
                type="button"
                onClick={handleAddToSlip}
                className="w-full py-3 rounded-xl font-black text-white text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Add SGP Ticket to Bet Slip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
