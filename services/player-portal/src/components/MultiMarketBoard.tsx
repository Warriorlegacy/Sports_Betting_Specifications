import React, { useState } from 'react';
import {
  Pin,
  PinOff,
  Layers,
  Zap,
  Activity,
  Tv,
  ChevronRight,
  Sparkles,
  Plus,
  Coins,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LiveMatch, OddsFormat } from '../types/sportsbook';
import { formatOdds } from '../services/oddsFormatter';
import { useI18n } from '../services/i18nService';

interface MultiMarketBoardProps {
  allMatches: LiveMatch[];
  pinnedMatchIds: string[];
  onTogglePin: (matchId: string) => void;
  onSelectMatch: (matchId: string) => void;
  onSelectOdds: (
    matchId: string,
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number,
    type: 'BACK' | 'LAY'
  ) => void;
  oddsFormat: OddsFormat;
}

export const MultiMarketBoard: React.FC<MultiMarketBoardProps> = ({
  allMatches,
  pinnedMatchIds,
  onTogglePin,
  onSelectMatch,
  onSelectOdds,
  oddsFormat
}) => {
  const { t } = useI18n();
  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('ALL');

  // Filter pinned matches
  const pinnedMatches = allMatches.filter((m) => pinnedMatchIds.includes(m.id));

  // Available unpinned live matches to quickly add
  const unpinnedMatches = allMatches.filter((m) => !pinnedMatchIds.includes(m.id) && m.inPlay);

  return (
    <div className="space-y-4 text-white select-none">
      {/* 1. HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#1c1c1c] via-[#241710] to-[#1a1a1a] p-4 rounded-2xl border border-[#2d2d2d] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f36c21] to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Layers className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">{t('multi_markets')}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#f36c21]/20 text-[#f36c21] border border-[#f36c21]/40">
                {pinnedMatches.length} Pinned
              </span>
            </div>
            <p className="text-xs text-[#adadad]">
              Monitor multiple live Back/Lay odds ladders simultaneously and trade in real-time
            </p>
          </div>
        </div>

        {/* Quick Add Suggestions Dropdown / Action */}
        {unpinnedMatches.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#888] hidden md:inline">Quick Pin:</span>
            <div className="flex items-center space-x-1 overflow-x-auto max-w-[280px] sm:max-w-xs no-scrollbar">
              {unpinnedMatches.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  onClick={() => onTogglePin(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#272727] hover:bg-[#333] border border-[#3d3d3d] text-[11px] font-bold text-[#f36c21] flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span className="truncate max-w-[90px]">{typeof m.homeTeam === 'object' ? m.homeTeam.name : m.homeTeam}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. PINNED MATCHES GRID */}
      {pinnedMatches.length === 0 ? (
        /* Empty State */
        <div className="bg-[#1e1e1e] border-2 border-dashed border-[#333] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#272727] flex items-center justify-center border border-[#3d3d3d]">
            <Pin className="w-8 h-8 text-[#888]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-white">No Pinned Matches in Multi-Market Board</h3>
            <p className="text-xs text-[#adadad] max-w-md mx-auto">
              Pin any in-play Cricket, Tennis, or Football match from the In-Play list to watch odds tick side-by-side.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {allMatches.slice(0, 4).map((m) => (
              <button
                key={m.id}
                onClick={() => onTogglePin(m.id)}
                className="px-3 py-1.5 rounded-xl bg-[#272727] hover:bg-[#f36c21]/20 border border-[#3d3d3d] hover:border-[#f36c21] text-xs font-bold text-white flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Pin className="w-3.5 h-3.5 text-[#f36c21]" />
                <span>{typeof m.homeTeam === 'object' ? m.homeTeam.name : m.homeTeam} vs {typeof m.awayTeam === 'object' ? m.awayTeam.name : m.awayTeam}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {pinnedMatches.map((match) => {
            const homeName = typeof match.homeTeam === 'object' ? match.homeTeam.name : match.homeTeam;
            const awayName = typeof match.awayTeam === 'object' ? match.awayTeam.name : match.awayTeam;
            const homeScore = typeof match.homeTeam === 'object' ? match.homeTeam.score : 0;
            const awayScore = typeof match.awayTeam === 'object' ? match.awayTeam.score : 0;

            const mainMarket = match.markets?.find((m) => m.category === 'MAIN') || match.markets?.[0];
            const homeBackOdds = mainMarket?.selections?.[0]?.price || 2.10;
            const homeLayOdds = +(homeBackOdds + 0.04).toFixed(2);
            const awayBackOdds = mainMarket?.selections?.[1]?.price || 1.80;
            const awayLayOdds = +(awayBackOdds + 0.02).toFixed(2);

            return (
              <div
                key={match.id}
                className="bg-[#1e1e1e] border border-[#2d2d2d] hover:border-[#f36c21]/40 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="bg-[#141414] px-3 py-2 border-b border-[#272727] flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-ping" />
                    <span className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">{match.sport} • {match.league || 'Live Match'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onSelectMatch(match.id)}
                      className="p-1 rounded text-[#adadad] hover:text-[#f36c21] transition-colors cursor-pointer"
                      title="Open Match Hub"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onTogglePin(match.id)}
                      className="p-1 rounded text-[#f36c21] hover:text-red-400 transition-colors cursor-pointer"
                      title="Unpin"
                    >
                      <PinOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score Summary & Clock */}
                <div className="p-3 bg-gradient-to-b from-[#181818] to-[#1e1e1e] border-b border-[#272727]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] text-amber-400 font-mono font-bold">{match.currentPeriod || 'LIVE'}</span>
                    <span className="text-[10px] text-[#888] font-mono">{match.clock || 'In-Play'}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-black text-sm">
                      <span className="truncate pr-2">{homeName}</span>
                      <span className="font-mono text-[#27AE60]">{homeScore}</span>
                    </div>
                    <div className="flex items-center justify-between font-black text-sm">
                      <span className="truncate pr-2">{awayName}</span>
                      <span className="font-mono text-amber-400">{awayScore}</span>
                    </div>
                  </div>
                </div>

                {/* Match Odds Back/Lay Grid */}
                <div className="p-3 space-y-2 bg-[#1e1e1e]">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#888] px-1">
                    <span>Selection</span>
                    <div className="flex space-x-8 mr-2">
                      <span className="text-sky-400">{t('back')}</span>
                      <span className="text-pink-400">{t('lay')}</span>
                    </div>
                  </div>

                  {/* Home Runner Row */}
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#141414] border border-[#272727]">
                    <span className="text-xs font-bold truncate flex-1">{homeName}</span>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() =>
                          onSelectOdds(
                            match.id,
                            `MKT_MATCH_${match.id}`,
                            'Match Odds',
                            `sel_home_${match.id}`,
                            homeName,
                            homeBackOdds,
                            'BACK'
                          )
                        }
                        className="w-16 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow transition-transform active:scale-95"
                      >
                        {formatOdds(homeBackOdds, oddsFormat)}
                      </button>
                      <button
                        onClick={() =>
                          onSelectOdds(
                            match.id,
                            `MKT_MATCH_${match.id}`,
                            'Match Odds',
                            `sel_home_${match.id}`,
                            homeName,
                            homeLayOdds,
                            'LAY'
                          )
                        }
                        className="w-16 py-1.5 rounded-lg bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] font-mono font-black text-xs text-center cursor-pointer shadow transition-transform active:scale-95"
                      >
                        {formatOdds(homeLayOdds, oddsFormat)}
                      </button>
                    </div>
                  </div>

                  {/* Away Runner Row */}
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#141414] border border-[#272727]">
                    <span className="text-xs font-bold truncate flex-1">{awayName}</span>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() =>
                          onSelectOdds(
                            match.id,
                            `MKT_MATCH_${match.id}`,
                            'Match Odds',
                            `sel_away_${match.id}`,
                            awayName,
                            awayBackOdds,
                            'BACK'
                          )
                        }
                        className="w-16 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow transition-transform active:scale-95"
                      >
                        {formatOdds(awayBackOdds, oddsFormat)}
                      </button>
                      <button
                        onClick={() =>
                          onSelectOdds(
                            match.id,
                            `MKT_MATCH_${match.id}`,
                            'Match Odds',
                            `sel_away_${match.id}`,
                            awayName,
                            awayLayOdds,
                            'LAY'
                          )
                        }
                        className="w-16 py-1.5 rounded-lg bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] font-mono font-black text-xs text-center cursor-pointer shadow transition-transform active:scale-95"
                      >
                        {formatOdds(awayLayOdds, oddsFormat)}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Limits */}
                <div className="bg-[#141414] px-3 py-1.5 border-t border-[#272727] flex items-center justify-between text-[10px] text-[#888] font-mono">
                  <span>Min: 100 ⬍ Max: 25k</span>
                  <button
                    onClick={() => onSelectMatch(match.id)}
                    className="text-[#f36c21] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <span>Full Markets</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
