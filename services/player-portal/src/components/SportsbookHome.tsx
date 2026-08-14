import React from 'react';
import {
  Activity,
  Sparkles,
  Flame,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Shield,
  Layers
} from 'lucide-react';
import { LiveMatch, OddsFormat } from '../types/sportsbook';
import { formatOdds } from '../services/oddsFormatter';

interface SportsbookHomeProps {
  matches: LiveMatch[];
  selectedSport: string;
  oddsFormat: OddsFormat;
  onSelectMatch: (matchId: string) => void;
  onSelectOdds: (
    matchId: string,
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number
  ) => void;
  onOpenSGP: (matchId: string) => void;
}

export const SportsbookHome: React.FC<SportsbookHomeProps> = ({
  matches,
  selectedSport,
  oddsFormat,
  onSelectMatch,
  onSelectOdds,
  onOpenSGP
}) => {
  const filteredMatches = matches.filter((m) => {
    if (selectedSport === 'All') return true;
    return m.sport.toLowerCase() === selectedSport.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Hero Live In-Play Ribbon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            LIVE IN-PLAY SPORTSBOOK
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Real-Time Feeds
          </span>
        </div>

        <span className="text-xs font-bold text-slate-400 mono-num">
          {filteredMatches.length} Live Matches
        </span>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredMatches.map((match) => {
          const mainMarket = match.markets.find((m) => m.category === 'MAIN') || match.markets[0];

          return (
            <div
              key={match.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-2xl transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top: League & Status */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-300 text-[10px] uppercase">
                    {match.sport}
                  </span>
                  <span className="text-slate-400 font-bold truncate max-w-[180px]">{match.league}</span>
                </div>

                {/* Clock / In-Play Pill */}
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[11px] animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span className="mono-num">{match.clock}</span>
                </div>
              </div>

              {/* Match Teams & Live Score Area */}
              <div
                onClick={() => onSelectMatch(match.id)}
                className="cursor-pointer space-y-3 p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-950 transition-colors border border-slate-800/60"
              >
                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md"
                      style={{ backgroundColor: match.homeTeam.color }}
                    >
                      {match.homeTeam.shortName}
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {match.homeTeam.subScore && (
                      <span className="text-[11px] text-slate-500 font-mono">{match.homeTeam.subScore}</span>
                    )}
                    <span className="mono-num text-xl sm:text-2xl font-black text-white">
                      {match.homeTeam.score}
                    </span>
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md"
                      style={{ backgroundColor: match.awayTeam.color }}
                    >
                      {match.awayTeam.shortName}
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      {match.awayTeam.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {match.awayTeam.subScore && (
                      <span className="text-[11px] text-slate-500 font-mono">{match.awayTeam.subScore}</span>
                    )}
                    <span className="mono-num text-xl sm:text-2xl font-black text-white">
                      {match.awayTeam.score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick 1X2 / Moneyline Odds Grid */}
              {mainMarket && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {mainMarket.name}
                  </span>
                  <div
                    className={`grid gap-2 ${
                      mainMarket.selections.length === 2
                        ? 'grid-cols-2'
                        : mainMarket.selections.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2'
                    }`}
                  >
                    {mainMarket.selections.map((sel) => {
                      const isUp = sel.tick === 'up';
                      const isDown = sel.tick === 'down';

                      return (
                        <button
                          key={sel.id}
                          type="button"
                          onClick={() =>
                            onSelectOdds(
                              match.id,
                              mainMarket.id,
                              mainMarket.name,
                              sel.id,
                              sel.name,
                              sel.price
                            )
                          }
                          className={`p-2.5 rounded-xl border text-center transition-all transform active:scale-95 flex flex-col items-center justify-center ${
                            isUp
                              ? 'bg-emerald-950/40 border-emerald-500/80'
                              : isDown
                              ? 'bg-rose-950/40 border-rose-500/80'
                              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-300 truncate w-full">
                            {sel.name}
                          </span>
                          <span
                            className={`mono-num text-xs sm:text-sm font-black mt-0.5 ${
                              isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-blue-400'
                            }`}
                          >
                            {formatOdds(sel.price, oddsFormat)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSGP(match.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Build SGP</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectMatch(match.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all flex items-center space-x-1"
                >
                  <span>Live Stats & All Markets ({match.markets.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
