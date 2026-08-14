import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ChevronRight,
  Clock,
  Zap,
  Globe,
  Calendar,
  Layers,
  ChevronDown,
  Trophy
} from 'lucide-react';
import { LiveMatch, OddsFormat, SportCategory } from '../types/sportsbook';
import { formatOdds } from '../services/oddsFormatter';
import { DateFilterBar } from './DateFilterBar';

interface SportsbookHomeProps {
  matches: LiveMatch[];
  selectedSport: SportCategory;
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
  const todayStr = new Date().toISOString().split('T')[0]; // '2026-08-14'
  const [selectedDate, setSelectedDate] = useState<string>(todayStr); // Defaults to 'Today'
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'SETTLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Calculate match counts by date for the calendar strip
  const matchCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach((m) => {
      const d = m.matchDate || todayStr;
      counts[d] = (counts[d] || 0) + 1;
    });
    return counts;
  }, [matches, todayStr]);

  const liveMatchCount = useMemo(() => {
    return matches.filter((m) => m.inPlay).length;
  }, [matches]);

  // 2. Multi-Tier Filtering (Sport, Date, Status, Search)
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Sport filter
      if (selectedSport !== 'All' && m.sport.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }

      // Date filter
      if (selectedDate === 'LIVE') {
        if (!m.inPlay) return false;
      } else if (selectedDate !== 'ALL') {
        const matchD = m.matchDate || todayStr;
        if (matchD !== selectedDate) return false;
      }

      // Status filter
      if (statusFilter === 'LIVE' && !m.inPlay) return false;
      if (statusFilter === 'UPCOMING' && (m.inPlay || m.status === 'SETTLED')) return false;
      if (statusFilter === 'SETTLED' && m.status !== 'SETTLED') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q) ||
          (m.country && m.country.toLowerCase().includes(q));
        if (!matchesName) return false;
      }

      return true;
    });
  }, [matches, selectedSport, selectedDate, statusFilter, searchQuery, todayStr]);

  // 3. Group filtered matches by League
  const groupedByLeague = useMemo(() => {
    const groups: Record<string, { league: string; country?: string; flag?: string; sport: string; matches: LiveMatch[] }> = {};
    filteredMatches.forEach((m) => {
      const key = `${m.sport}_${m.league}`;
      if (!groups[key]) {
        groups[key] = {
          league: m.league,
          country: m.country,
          flag: m.flag,
          sport: m.sport,
          matches: []
        };
      }
      groups[key].matches.push(m);
    });
    return Object.values(groups);
  }, [filteredMatches]);

  return (
    <div className="space-y-6">
      {/* Global Interactive Calendar & Date Filter Bar */}
      <DateFilterBar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        matchCountsByDate={matchCountsByDate}
        liveMatchCount={liveMatchCount}
      />

      {/* Active Filter Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
            {selectedSport === 'All' ? 'ALL WORLD SPORTS' : selectedSport} •{' '}
            {selectedDate === 'LIVE'
              ? 'LIVE IN-PLAY NOW'
              : selectedDate === 'ALL'
              ? 'ALL UPCOMING & LIVE DATES'
              : selectedDate === todayStr
              ? "TODAY'S SCHEDULE"
              : `FIXTURES (${selectedDate})`}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {filteredMatches.length} Matches
          </span>
        </div>

        <div className="text-xs text-slate-400 font-bold flex items-center space-x-2">
          <span>Viewing:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
            {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-white">No Matches Found for this Selection</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try switching the date tab, clearing your search query, or selecting "All Sports" in the top bar to view matches across the globe.
          </p>
          <button
            onClick={() => {
              setSelectedDate('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            Show All Dates & Sports
          </button>
        </div>
      )}

      {/* Grouped Leagues & Matches */}
      {groupedByLeague.map((group) => (
        <div key={`${group.sport}_${group.league}`} className="space-y-3.5">
          {/* League Header Banner */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <span className="text-base">{group.flag || '🌍'}</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-black text-slate-300 text-[10px] uppercase">
                  {group.sport}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                  {group.league}
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400 mono-num">
              {group.matches.length} {group.matches.length === 1 ? 'Match' : 'Matches'}
            </span>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {group.matches.map((match) => {
              const mainMarket = match.markets.find((m) => m.category === 'MAIN') || match.markets[0];

              return (
                <div
                  key={match.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-2xl transition-all backdrop-blur-xl flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Top: Date/Time Badge & In-Play Pill */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-400 text-[10px]">
                        📅 {match.matchDate === todayStr ? 'Today' : match.matchDate}
                      </span>
                      <span className="text-slate-400 font-bold text-[11px]">
                        ⏰ {match.startTime}
                      </span>
                    </div>

                    {/* Clock / In-Play Pill */}
                    {match.inPlay ? (
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[11px] animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span className="mono-num">{match.clock}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>Scheduled</span>
                      </div>
                    )}
                  </div>

                  {/* Match Teams & Score Area */}
                  <div
                    onClick={() => onSelectMatch(match.id)}
                    className="cursor-pointer space-y-3 p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 transition-colors border border-slate-800/60"
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
                          <span className="text-[11px] text-slate-400 font-mono">
                            {match.homeTeam.subScore}
                          </span>
                        )}
                        <span className="mono-num text-xl sm:text-2xl font-black text-white">
                          {match.inPlay ? match.homeTeam.score : '-'}
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
                          <span className="text-[11px] text-slate-400 font-mono">
                            {match.awayTeam.subScore}
                          </span>
                        )}
                        <span className="mono-num text-xl sm:text-2xl font-black text-white">
                          {match.inPlay ? match.awayTeam.score : '-'}
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
                      <span>Match Center & Markets ({match.markets.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
