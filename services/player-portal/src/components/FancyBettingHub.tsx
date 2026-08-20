import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Info,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  Lock,
  Coins
} from 'lucide-react';
import { LiveMatch, OddsFormat } from '../types/sportsbook';
import { useI18n } from '../services/i18nService';

export interface FancyMarketItem {
  id: string;
  category: 'SESSIONS' | 'WP' | 'ODD_EVEN' | 'XTRA' | 'METER' | 'KHADDA' | 'OVER_BY_OVER';
  title: string;
  noRuns: number;
  noRate: number;
  yesRuns: number;
  yesRate: number;
  minBet: number;
  maxBet: number;
  maxLiability: number;
  isSuspended?: boolean;
  statusText?: string;
}

interface FancyBettingHubProps {
  match: LiveMatch;
  oddsFormat: OddsFormat;
  onSelectOdds: (
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number,
    type: 'BACK' | 'LAY'
  ) => void;
}

export const FancyBettingHub: React.FC<FancyBettingHubProps> = ({
  match,
  oddsFormat,
  onSelectOdds
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Comprehensive 7-Category Indian Session / Fancy Markets
  const fancyMarkets: FancyMarketItem[] = [
    // 1. SESSIONS
    {
      id: `fancy_sess_6ov_${match.id}`,
      category: 'SESSIONS',
      title: '6 Over Runs (Powerplay Session)',
      noRuns: 48,
      noRate: 100,
      yesRuns: 50,
      yesRate: 100,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 25000
    },
    {
      id: `fancy_sess_10ov_${match.id}`,
      category: 'SESSIONS',
      title: '10 Over Runs Session',
      noRuns: 82,
      noRate: 100,
      yesRuns: 85,
      yesRate: 100,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 25000
    },
    {
      id: `fancy_sess_15ov_${match.id}`,
      category: 'SESSIONS',
      title: '15 Over Runs Session',
      noRuns: 124,
      noRate: 100,
      yesRuns: 127,
      yesRate: 100,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 25000
    },
    {
      id: `fancy_sess_20ov_${match.id}`,
      category: 'SESSIONS',
      title: '20 Over Total Innings Runs',
      noRuns: 174,
      noRate: 100,
      yesRuns: 177,
      yesRate: 100,
      minBet: 100,
      maxBet: 50000,
      maxLiability: 50000
    },

    // 2. W/P MARKET
    {
      id: `fancy_wp_fall1st_${match.id}`,
      category: 'WP',
      title: 'Fall of 1st Wicket Runs (W/P)',
      noRuns: 28,
      noRate: 90,
      yesRuns: 29,
      yesRate: 110,
      minBet: 100,
      maxBet: 20000,
      maxLiability: 22000
    },
    {
      id: `fancy_wp_opening_stand_${match.id}`,
      category: 'WP',
      title: 'Opening Partnership Over 35.5',
      noRuns: 35,
      noRate: 100,
      yesRuns: 36,
      yesRate: 100,
      minBet: 100,
      maxBet: 15000,
      maxLiability: 15000
    },

    // 3. ODD / EVEN
    {
      id: `fancy_oddeven_1stov_${match.id}`,
      category: 'ODD_EVEN',
      title: '1st Over Runs Odd or Even',
      noRuns: 0,
      noRate: 95,
      yesRuns: 0,
      yesRate: 95,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 23750,
      statusText: 'ODD: 1.95 / EVEN: 1.95'
    },
    {
      id: `fancy_oddeven_total_${match.id}`,
      category: 'ODD_EVEN',
      title: 'Match Total Runs Odd or Even',
      noRuns: 0,
      noRate: 95,
      yesRuns: 0,
      yesRate: 95,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 23750
    },

    // 4. XTRA MARKETS
    {
      id: `fancy_xtra_total_sixes_${match.id}`,
      category: 'XTRA',
      title: 'Total Match 6s (Over/Under 12.5)',
      noRuns: 12,
      noRate: 100,
      yesRuns: 13,
      yesRate: 100,
      minBet: 100,
      maxBet: 20000,
      maxLiability: 20000
    },
    {
      id: `fancy_xtra_total_fours_${match.id}`,
      category: 'XTRA',
      title: 'Total Match 4s (Over/Under 28.5)',
      noRuns: 28,
      noRate: 100,
      yesRuns: 29,
      yesRate: 100,
      minBet: 100,
      maxBet: 20000,
      maxLiability: 20000
    },

    // 5. METER
    {
      id: `fancy_meter_strike_rate_${match.id}`,
      category: 'METER',
      title: 'Top Batsman Strike Rate > 140.0',
      noRuns: 139,
      noRate: 100,
      yesRuns: 141,
      yesRate: 100,
      minBet: 100,
      maxBet: 15000,
      maxLiability: 15000
    },

    // 6. KHADDA & OVER BY OVER
    {
      id: `fancy_khadda_over7_${match.id}`,
      category: 'OVER_BY_OVER',
      title: '7th Over Runs (Current Live Over)',
      noRuns: 7,
      noRate: 100,
      yesRuns: 8,
      yesRate: 100,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 25000
    },
    {
      id: `fancy_khadda_over8_${match.id}`,
      category: 'OVER_BY_OVER',
      title: '8th Over Runs (Upcoming Over)',
      noRuns: 8,
      noRate: 100,
      yesRuns: 9,
      yesRate: 100,
      minBet: 100,
      maxBet: 25000,
      maxLiability: 25000
    }
  ];

  const fancyTabs = [
    { id: 'ALL', label: 'All Fancy' },
    { id: 'SESSIONS', label: 'Sessions' },
    { id: 'WP', label: 'W/P Market' },
    { id: 'ODD_EVEN', label: 'Odd / Even' },
    { id: 'XTRA', label: 'Xtra Market' },
    { id: 'METER', label: 'Meter' },
    { id: 'OVER_BY_OVER', label: 'Over by Over' }
  ];

  const filteredMarkets = activeTab === 'ALL'
    ? fancyMarkets
    : fancyMarkets.filter((m) => m.category === activeTab);

  return (
    <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-xl text-white select-none space-y-3">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#2c1405] via-[#1c1c1c] to-[#121212] px-4 py-3 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-[#f36c21] fill-[#f36c21]" />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Indian Fancy & Session Betting
            </h3>
            <p className="text-[10px] text-[#adadad]">
              Fast ball-by-ball, over runs, and exotic session lines with instant settlement
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-[#adadad] font-mono">
          <span>Min: 100</span>
          <span>•</span>
          <span>Max: 25k</span>
        </div>
      </div>

      {/* 2. Category Sub-Tabs */}
      <div className="px-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {fancyTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f36c21] text-white shadow'
                    : 'bg-[#272727] hover:bg-[#333] text-[#adadad] hover:text-white border border-[#333]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Market Rows Table */}
      <div className="px-3 pb-3 space-y-2">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-[#888] px-3 py-1 bg-[#141414] rounded-lg border border-[#272727]">
          <span className="col-span-6 sm:col-span-7">Fancy Market</span>
          <span className="col-span-3 sm:col-span-2 text-center text-pink-400 font-black">NO (LAY)</span>
          <span className="col-span-3 text-center text-sky-400 font-black">YES (BACK)</span>
        </div>

        {/* Market Items */}
        {filteredMarkets.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 items-center p-2.5 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#272727] transition-all gap-2"
          >
            {/* Title & Min/Max */}
            <div className="col-span-6 sm:col-span-7 pr-2">
              <div className="font-bold text-xs text-white leading-tight">{item.title}</div>
              <div className="text-[10px] text-[#888] font-mono mt-0.5 flex items-center gap-1.5">
                <span>Max Liability: ₹{item.maxLiability.toLocaleString()}</span>
                {item.statusText && <span className="text-amber-400 font-bold">• {item.statusText}</span>}
              </div>
            </div>

            {/* NO / LAY Box */}
            <div className="col-span-3 sm:col-span-2">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    item.id,
                    item.title,
                    `no_${item.id}`,
                    `${item.title} - NO`,
                    item.noRuns > 0 ? item.noRuns : 1.95,
                    'LAY'
                  )
                }
                className="w-full py-1.5 px-1 rounded-xl bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm leading-none">
                  {item.noRuns > 0 ? item.noRuns : 'NO'}
                </span>
                <span className="text-[9px] font-bold text-red-800 leading-none mt-0.5">
                  {item.noRate}
                </span>
              </button>
            </div>

            {/* YES / BACK Box */}
            <div className="col-span-3">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    item.id,
                    item.title,
                    `yes_${item.id}`,
                    `${item.title} - YES`,
                    item.yesRuns > 0 ? item.yesRuns : 1.95,
                    'BACK'
                  )
                }
                className="w-full py-1.5 px-1 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm leading-none">
                  {item.yesRuns > 0 ? item.yesRuns : 'YES'}
                </span>
                <span className="text-[9px] font-bold text-blue-800 leading-none mt-0.5">
                  {item.yesRate}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
