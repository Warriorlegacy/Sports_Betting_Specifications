import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Info,
  Coins,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { LiveMatch, OddsFormat } from '../types/sportsbook';
import { useI18n } from '../services/i18nService';

interface BookmakerMarketHubProps {
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

export const BookmakerMarketHub: React.FC<BookmakerMarketHubProps> = ({
  match,
  oddsFormat,
  onSelectOdds
}) => {
  const { t } = useI18n();

  const homeName = typeof match.homeTeam === 'object' ? match.homeTeam.name : match.homeTeam;
  const awayName = typeof match.awayTeam === 'object' ? match.awayTeam.name : match.awayTeam;

  // Bookmaker 100-Base Odds (e.g. 98/100, 102/104)
  const homeBmBack = 98;
  const homeBmLay = 100;
  const awayBmBack = 102;
  const awayBmLay = 104;

  return (
    <div className="space-y-3.5 text-white select-none">
      {/* 1. MAIN BOOKMAKER (0% COMMISSION) */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#034C6F] via-[#023b57] to-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-black uppercase tracking-wider">BOOKMAKER 0% COMMISSION</h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-black border border-cyan-500/30">
                  100% BOOK
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Fast 1-second auto-settlement • Zero exchange commission</p>
            </div>
          </div>

          <div className="text-[10px] text-slate-300 font-mono">
            Min: 100 ⬍ Max: 100K
          </div>
        </div>

        {/* Odds Grid */}
        <div className="p-3 divide-y divide-[#272727] space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-[#888] px-2 py-1">
            <span className="col-span-6">Runner Selection</span>
            <span className="col-span-3 text-center text-sky-400 font-black">BACK</span>
            <span className="col-span-3 text-center text-pink-400 font-black">LAY</span>
          </div>

          {/* Runner 1 */}
          <div className="grid grid-cols-12 items-center pt-2 gap-2">
            <div className="col-span-6 pr-2">
              <div className="font-bold text-xs text-white">{homeName}</div>
              <div className="text-[10px] text-[#27AE60] font-mono font-bold">+₹0.00</div>
            </div>
            <div className="col-span-3">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    `BM_MAIN_${match.id}`,
                    'Bookmaker 0% Commission',
                    `bm_h_${match.id}`,
                    homeName,
                    +(1 + homeBmBack / 100).toFixed(2),
                    'BACK'
                  )
                }
                className="w-full py-2 px-1 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm">{homeBmBack}</span>
                <span className="text-[9px] font-bold text-slate-600">100K</span>
              </button>
            </div>
            <div className="col-span-3">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    `BM_MAIN_${match.id}`,
                    'Bookmaker 0% Commission',
                    `bm_h_${match.id}`,
                    homeName,
                    +(1 + homeBmLay / 100).toFixed(2),
                    'LAY'
                  )
                }
                className="w-full py-2 px-1 rounded-xl bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm">{homeBmLay}</span>
                <span className="text-[9px] font-bold text-slate-600">100K</span>
              </button>
            </div>
          </div>

          {/* Runner 2 */}
          <div className="grid grid-cols-12 items-center pt-2 gap-2">
            <div className="col-span-6 pr-2">
              <div className="font-bold text-xs text-white">{awayName}</div>
              <div className="text-[10px] text-[#27AE60] font-mono font-bold">+₹0.00</div>
            </div>
            <div className="col-span-3">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    `BM_MAIN_${match.id}`,
                    'Bookmaker 0% Commission',
                    `bm_a_${match.id}`,
                    awayName,
                    +(1 + awayBmBack / 100).toFixed(2),
                    'BACK'
                  )
                }
                className="w-full py-2 px-1 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm">{awayBmBack}</span>
                <span className="text-[9px] font-bold text-slate-600">100K</span>
              </button>
            </div>
            <div className="col-span-3">
              <button
                type="button"
                onClick={() =>
                  onSelectOdds(
                    `BM_MAIN_${match.id}`,
                    'Bookmaker 0% Commission',
                    `bm_a_${match.id}`,
                    awayName,
                    +(1 + awayBmLay / 100).toFixed(2),
                    'LAY'
                  )
                }
                className="w-full py-2 px-1 rounded-xl bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] flex flex-col items-center justify-center transition-transform active:scale-95 shadow cursor-pointer"
              >
                <span className="font-mono font-black text-sm">{awayBmLay}</span>
                <span className="text-[9px] font-bold text-slate-600">100K</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141414] px-4 py-2 border-t border-[#272727] flex items-center justify-between text-[10px] text-[#888] font-mono">
          <span>Min: 100 ⬍ Max: 100K</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Info className="w-3 h-3" />
            Settled at 100% face value
          </span>
        </div>
      </div>

      {/* 2. MINI BOOKMAKER (FAST MICRO-STAKES) */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-[#4a1525] via-[#24131a] to-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">MINI BOOKMAKER</h3>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black border border-amber-500/30">
                  FAST ACTION
                </span>
              </div>
              <p className="text-[10px] text-[#adadad]">Instant micro-limits for quick trading</p>
            </div>
          </div>
          <div className="text-[10px] text-amber-300 font-mono">
            Min: 50 ⬍ Max: 25K
          </div>
        </div>

        <div className="p-3 grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onSelectOdds(
                `MINI_BM_${match.id}`,
                'Mini Bookmaker',
                `mini_h_${match.id}`,
                homeName,
                1.95,
                'BACK'
              )
            }
            className="p-2.5 rounded-xl bg-[#272727] hover:bg-[#333] border border-[#3d3d3d] hover:border-amber-500/50 flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="text-xs font-bold truncate">{homeName}</span>
            <span className="font-mono font-black text-sm text-cyan-300">95 / 97</span>
          </button>
          <button
            onClick={() =>
              onSelectOdds(
                `MINI_BM_${match.id}`,
                'Mini Bookmaker',
                `mini_a_${match.id}`,
                awayName,
                2.05,
                'BACK'
              )
            }
            className="p-2.5 rounded-xl bg-[#272727] hover:bg-[#333] border border-[#3d3d3d] hover:border-amber-500/50 flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="text-xs font-bold truncate">{awayName}</span>
            <span className="font-mono font-black text-sm text-cyan-300">105 / 107</span>
          </button>
        </div>
      </div>
    </div>
  );
};
