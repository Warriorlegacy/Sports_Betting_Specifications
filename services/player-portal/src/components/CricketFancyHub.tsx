import React from 'react';
import { Flame, Shield, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import { LiveMatch } from '../types/sportsbook';

interface CricketFancyHubProps {
  match: LiveMatch;
  onSelectFancy: (
    fancyName: string,
    type: 'YES' | 'NO',
    runs: number,
    rate: number
  ) => void;
}

export const CricketFancyHub: React.FC<CricketFancyHubProps> = ({ match, onSelectFancy }) => {
  const home = (match && typeof match.homeTeam === 'object' && match.homeTeam !== null)
    ? match.homeTeam
    : { name: 'Home Team', shortName: 'HOM' };
  const homeName = home.name || 'Home Team';
  const homeShortName = home.shortName || 'HOM';

  // Generate realistic, dynamic cricket session fancy markets based on match teams
  const fancies = [
    {
      id: 'FNC_6OV',
      category: 'SESSION (6 OVERS)',
      name: `6 Overs Session ${homeName}`,
      noRuns: 48,
      noRate: 100,
      yesRuns: 50,
      yesRate: 100,
      maxBet: '₹50,000',
      active: true
    },
    {
      id: 'FNC_10OV',
      category: 'SESSION (10 OVERS)',
      name: `10 Overs Session ${homeName}`,
      noRuns: 82,
      noRate: 95,
      yesRuns: 85,
      yesRate: 105,
      maxBet: '₹50,000',
      active: true
    },
    {
      id: 'FNC_20OV',
      category: 'INNINGS TOTAL',
      name: `20 Overs Total Runs ${homeName}`,
      noRuns: 174,
      noRate: 100,
      yesRuns: 178,
      yesRate: 100,
      maxBet: '₹1,00,000',
      active: true
    },
    {
      id: 'FNC_WKT1',
      category: 'WICKET FANCY',
      name: `Fall of 1st Wicket ${homeName}`,
      noRuns: 24,
      noRate: 110,
      yesRuns: 26,
      yesRate: 90,
      maxBet: '₹25,000',
      active: true
    },
    {
      id: 'FNC_BAT1',
      category: 'BATSMAN FANCY',
      name: `Top Opener Runs (${homeShortName})`,
      noRuns: 32,
      noRate: 100,
      yesRuns: 34,
      yesRate: 100,
      maxBet: '₹25,000',
      active: true
    },
    {
      id: 'FNC_SIX',
      category: 'MATCH FANCY',
      name: 'Total Match 6s in Match',
      noRuns: 12,
      noRate: 100,
      yesRuns: 14,
      yesRate: 100,
      maxBet: '₹50,000',
      active: true
    },
    {
      id: 'FNC_FOUR',
      category: 'MATCH FANCY',
      name: 'Total Match 4s in Match',
      noRuns: 28,
      noRate: 95,
      yesRuns: 31,
      yesRate: 105,
      maxBet: '₹50,000',
      active: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <span>Cricket Session & Fancy Markets</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                100% Commission-Free
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Bet NO (Lay) or YES (Back) on ball-by-ball sessions, total innings runs, player boundaries, and fall of wickets.
            </p>
          </div>
        </div>
      </div>

      {/* Fancy Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-slate-950/90 p-3 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
          <div className="col-span-6 sm:col-span-7">Fancy Market Name</div>
          <div className="col-span-3 sm:col-span-2 text-center text-rose-400">NO (Lay)</div>
          <div className="col-span-3 sm:col-span-2 text-center text-blue-400">YES (Back)</div>
          <div className="hidden sm:block sm:col-span-1 text-right text-slate-500">Max</div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {fancies.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-12 items-center p-3 sm:p-4 hover:bg-slate-800/40 transition-colors gap-2"
            >
              {/* Market Name & Category */}
              <div className="col-span-6 sm:col-span-7 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-amber-400/90 tracking-wider">
                  {f.category}
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white">{f.name}</h4>
              </div>

              {/* NO (Lay) Button */}
              <div className="col-span-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => onSelectFancy(f.name, 'NO', f.noRuns, f.noRate)}
                  className="w-full py-2 px-1 rounded-xl bg-gradient-to-b from-rose-500/20 to-rose-600/30 hover:from-rose-500/40 hover:to-rose-600/50 border border-rose-500/40 text-center transition-all group"
                >
                  <div className="text-xs sm:text-sm font-black text-rose-300 font-mono group-hover:scale-105 transition-transform">
                    {f.noRuns}
                  </div>
                  <div className="text-[10px] text-rose-400/80 font-bold font-mono">
                    {f.noRate}
                  </div>
                </button>
              </div>

              {/* YES (Back) Button */}
              <div className="col-span-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => onSelectFancy(f.name, 'YES', f.yesRuns, f.yesRate)}
                  className="w-full py-2 px-1 rounded-xl bg-gradient-to-b from-blue-500/20 to-blue-600/30 hover:from-blue-500/40 hover:to-blue-600/50 border border-blue-500/40 text-center transition-all group"
                >
                  <div className="text-xs sm:text-sm font-black text-blue-300 font-mono group-hover:scale-105 transition-transform">
                    {f.yesRuns}
                  </div>
                  <div className="text-[10px] text-blue-400/80 font-bold font-mono">
                    {f.yesRate}
                  </div>
                </button>
              </div>

              {/* Max Stake */}
              <div className="hidden sm:block sm:col-span-1 text-right text-[11px] font-bold text-slate-400 font-mono">
                {f.maxBet}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
