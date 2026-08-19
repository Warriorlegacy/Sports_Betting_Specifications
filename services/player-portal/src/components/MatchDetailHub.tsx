import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Layers,
  ChevronLeft,
  Flame,
  Zap,
  Lock,
  ArrowRight,
  Tv,
  Radio
} from 'lucide-react';
import { LiveMatch, BettingMarket, SelectionOdds, OddsFormat, SGPTicket } from '../types/sportsbook';
import { LiveVisualizerHub } from './LiveVisualizerHub';
import { SGPBuilder } from './SGPBuilder';
import { CricketMatchCenter } from './CricketMatchCenter';
import { FootballMatchCenter } from './FootballMatchCenter';
import { CricketFancyHub } from './CricketFancyHub';
import { LiveMatchStreamPlayer } from './LiveMatchStreamPlayer';
import { fairplaySocket } from '../services/fairplaySocket';
import { formatOdds } from '../services/oddsFormatter';

interface MatchDetailHubProps {
  match: LiveMatch;
  oddsFormat: OddsFormat;
  onBack: () => void;
  onSelectOdds: (
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number
  ) => void;
  onAddSGPToSlip: (ticket: SGPTicket, stake: number) => void;
}

export const MatchDetailHub: React.FC<MatchDetailHubProps> = ({
  match,
  oddsFormat,
  onBack,
  onSelectOdds,
  onAddSGPToSlip
}) => {
  const [activeTab, setActiveTab] = useState<'MARKETS' | 'FANCY' | 'STREAM' | 'SGP' | 'VISUALIZER'>('MARKETS');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string>('ALL');

  // Real-time WebSocket connection to Fairplay / ZPlay broadcast
  useEffect(() => {
    const rawId = match.id.replace(/^FP_|^ZPLAY_|^MKT_/, '');
    fairplaySocket.connect();
    fairplaySocket.subscribe(rawId);

    return () => {
      fairplaySocket.unsubscribe(rawId);
    };
  }, [match.id]);

  const home = (match && typeof match.homeTeam === 'object' && match.homeTeam !== null)
    ? match.homeTeam
    : { name: 'Home Team', shortName: 'HOM', color: '#3b82f6', score: 0 };
  const away = (match && typeof match.awayTeam === 'object' && match.awayTeam !== null)
    ? match.awayTeam
    : { name: 'Away Team', shortName: 'AWY', color: '#ef4444', score: 0 };
  const sport = match?.sport || 'Football';
  const league = match?.league || 'International League';
  const clock = match?.clock || 'Live';
  const currentPeriod = match?.currentPeriod || '1st Half';
  const events = Array.isArray(match?.events) ? match.events : [];

  const categories = [
    { id: 'ALL', label: 'All Markets' },
    ...(sport === 'Cricket' ? [{ id: 'TOSS', label: '🪙 Toss Winner' }] : []),
    { id: 'MAIN', label: 'Main Lines' },
    { id: 'HANDICAPS', label: 'Spreads & Handicaps' },
    { id: 'TOTALS', label: 'Totals (Over/Under)' },
    { id: 'PROPS', label: 'Player Props' },
    { id: 'CORNERS_CARDS', label: 'Corners & Cards' }
  ];

  // Auto-inject Toss Market for Cricket if not present (as in IndianBet77 TossBook)
  const rawMarkets = Array.isArray(match?.markets) ? match.markets : [];
  const allMarkets = [...rawMarkets];
  if (sport === 'Cricket' && !allMarkets.some((m) => m.category === 'TOSS')) {
    allMarkets.unshift({
      id: `MKT_TOSS_${match.id}`,
      name: 'Coin Toss Winner (Back & Lay)',
      category: 'TOSS',
      selections: [
        { id: `toss_h_${match.id}`, name: `${home.name} (Win Toss)`, price: 1.95, tick: 'same' },
        { id: `toss_a_${match.id}`, name: `${away.name} (Win Toss)`, price: 1.95, tick: 'same' }
      ]
    });
  }

  const filteredMarkets = allMarkets.filter((m) => {
    if (selectedMarketCategory === 'ALL') return true;
    return m.category === selectedMarketCategory;
  });

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Matches</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <span className="text-slate-500">{sport}</span>
          <span>/</span>
          <span className="text-slate-300">{league}</span>
        </div>
      </div>

      {/* Hero Live Scoreboard Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a1020] to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: home.color || '#3b82f6' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: away.color || '#ef4444' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Home Team */}
          <div className="flex items-center space-x-4 flex-1 justify-start">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl border border-white/10"
              style={{ backgroundColor: home.color || '#3b82f6' }}
            >
              {home.shortName}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{home.name}</h2>
              <span className="text-xs text-slate-400 font-semibold">Home Team</span>
            </div>
          </div>

          {/* Center Score & Clock */}
          <div className="flex flex-col items-center text-center px-6">
            {match?.inPlay && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase mb-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>IN-PLAY LIVE</span>
              </div>
            )}

            {sport === 'Cricket' ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-3 sm:space-x-6">
                  <div className="flex flex-col items-center">
                    <span className="mono-num text-2xl sm:text-4xl font-black text-emerald-400">
                      {String(home.score).includes('/') ? home.score : (home.score !== '-' ? `${home.score || 164}/3` : '-')}
                    </span>
                    {home.subScore && (
                      <span className="text-[11px] text-slate-400 font-bold mt-0.5">
                        {home.subScore}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-slate-500 uppercase px-2 py-1 rounded bg-slate-900 border border-slate-800">
                    vs
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="mono-num text-2xl sm:text-4xl font-black text-amber-400">
                      {String(away.score).includes('/') ? away.score : (away.score !== '-' ? `${away.score || 182}/6` : '-')}
                    </span>
                    {away.subScore && (
                      <span className="text-[11px] text-slate-400 font-bold mt-0.5">
                        {away.subScore}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="mono-num text-3xl sm:text-5xl font-black text-white">{home.score}</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-600">-</span>
                <span className="mono-num text-3xl sm:text-5xl font-black text-white">{away.score}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-2 text-xs font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="mono-num text-emerald-400 font-extrabold">{clock}</span>
              <span className="text-slate-600">•</span>
              <span>{currentPeriod}</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-white">{away.name}</h2>
              <span className="text-xs text-slate-400 font-semibold">Away Team</span>
            </div>
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl border border-white/10"
              style={{ backgroundColor: away.color || '#ef4444' }}
            >
              {away.shortName}
            </div>
          </div>
        </div>

        {/* Live Event Marquee Strip */}
        {events.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center space-x-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Live Events:</span>
            {events.map((e) => (
              <div
                key={e.id}
                className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-bold whitespace-nowrap flex items-center space-x-1.5"
              >
                <span className="text-emerald-400 mono-num">{e.minute}</span>
                <span>{e.player}</span>
                {e.detail && <span className="text-[10px] text-slate-400 font-normal">({e.detail})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live In-Play Match Center (Cricket Ball-by-ball / Football Possession Attack) */}
      <CricketMatchCenter match={match} />
      <FootballMatchCenter match={match} />

      {/* Main Mode Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('MARKETS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'MARKETS'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Live Markets ({allMarkets.length})</span>
          </button>

          {match.sport === 'Cricket' && (
            <button
              type="button"
              onClick={() => setActiveTab('FANCY')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-2 ${
                activeTab === 'FANCY'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 font-black'
                  : 'bg-slate-900 text-amber-400/90 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>⚡ Cricket Fancy & Sessions</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('STREAM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'STREAM'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>📺 Live TV & Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SGP')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'SGP'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Same-Game Parlay (SGP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VISUALIZER')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'VISUALIZER'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Visualizer & Stats Hub</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Betting Markets */}
      {activeTab === 'MARKETS' && (
        <div className="space-y-4">
          {/* Market Categories Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedMarketCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMarketCategory === cat.id
                    ? 'bg-slate-100 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Markets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-white">{market.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{market.category}</span>
                </div>

                <div
                  className={`grid gap-2 ${
                    market.selections.length === 2
                      ? 'grid-cols-2'
                      : market.selections.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-2'
                  }`}
                >
                  {market.selections.map((sel) => {
                    const isUp = sel.tick === 'up';
                    const isDown = sel.tick === 'down';

                    return (
                      <button
                        key={sel.id}
                        type="button"
                        onClick={() =>
                          onSelectOdds(market.id, market.name, sel.id, sel.name, sel.price)
                        }
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all transform active:scale-95 ${
                          isUp
                            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-900/20'
                            : isDown
                            ? 'bg-rose-950/40 border-rose-500/80 shadow-md shadow-rose-900/20'
                            : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-300 truncate">{sel.name}</span>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`mono-num text-sm sm:text-base font-black ${
                              isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-blue-400'
                            }`}
                          >
                            {formatOdds(sel.price, oddsFormat)}
                          </span>
                          {sel.tick && sel.tick !== 'same' && (
                            <span
                              className={`text-[10px] font-black ${
                                isUp ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isUp ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Cricket Fancy & Session Markets */}
      {activeTab === 'FANCY' && (
        <CricketFancyHub
          match={match}
          onSelectFancy={(fancyName, type, runs, rate) => {
            onSelectOdds(
              `FANCY_${match.id}_${fancyName}`,
              fancyName,
              type,
              `${fancyName} (${type} ${runs} Runs)`,
              rate > 10 ? +(rate / 100).toFixed(2) + 1 : 1.95
            );
          }}
        />
      )}

      {/* Mode 3: Live TV Video Stream & Radar Scorecard */}
      {activeTab === 'STREAM' && <LiveMatchStreamPlayer match={match} />}

      {/* Mode 4: Same-Game Parlay (SGP) Builder */}
      {activeTab === 'SGP' && (
        <SGPBuilder match={match} oddsFormat={oddsFormat} onAddSGPToSlip={onAddSGPToSlip} />
      )}

      {/* Mode 5: Live Visualizer & Stats Hub */}
      {activeTab === 'VISUALIZER' && <LiveVisualizerHub match={match} />}
    </div>
  );
};
