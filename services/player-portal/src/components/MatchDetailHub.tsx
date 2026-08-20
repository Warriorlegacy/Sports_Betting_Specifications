import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Layers,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Lock,
  ArrowRight,
  Tv,
  Radio,
  Star,
  Share2,
  Filter,
  BarChart2,
  Info,
  Dices,
  Play,
  RotateCcw,
  CheckCircle2,
  Coins
} from 'lucide-react';
import { LiveMatch, BettingMarket, SelectionOdds, OddsFormat, SGPTicket } from '../types/sportsbook';
import { UserBet } from './MyBets';
import { LiveVisualizerHub } from './LiveVisualizerHub';
import { SGPBuilder } from './SGPBuilder';
import { CricketMatchCenter } from './CricketMatchCenter';
import { FootballMatchCenter } from './FootballMatchCenter';
import { CricketFancyHub } from './CricketFancyHub';
import { FancyBettingHub } from './FancyBettingHub';
import { BookmakerMarketHub } from './BookmakerMarketHub';
import { LiveMatchStreamPlayer } from './LiveMatchStreamPlayer';
import { fairplaySocket } from '../services/fairplaySocket';
import { formatOdds } from '../services/oddsFormatter';
import { useI18n } from '../services/i18nService';

interface MatchDetailHubProps {
  match: LiveMatch;
  oddsFormat: OddsFormat;
  user?: any | null;
  myBets?: UserBet[];
  onBack: () => void;
  onOpenMyBets?: () => void;
  onSelectOdds: (
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number,
    type?: 'BACK' | 'LAY'
  ) => void;
  onAddSGPToSlip?: (ticket: SGPTicket, stake: number) => void;
}

export const MatchDetailHub: React.FC<MatchDetailHubProps> = ({
  match,
  oddsFormat,
  user,
  myBets = [],
  onBack,
  onOpenMyBets,
  onSelectOdds,
  onAddSGPToSlip
}) => {
  const { t } = useI18n();
  const [activeMarketTab, setActiveMarketTab] = useState<string>('MAIN');
  const [isScoreboardExpanded, setIsScoreboardExpanded] = useState<boolean>(true);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState<boolean>(false);
  const [cashOutSliderPercent, setCashOutSliderPercent] = useState<number>(100);
  const [showLadderView, setShowLadderView] = useState<boolean>(false);
  const [collapsedAccordions, setCollapsedAccordions] = useState<Record<string, boolean>>({});

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
    : { name: 'Home Player', shortName: 'HOM', color: '#3b82f6', score: 0 };
  const away = (match && typeof match.awayTeam === 'object' && match.awayTeam !== null)
    ? match.awayTeam
    : { name: 'Away Player', shortName: 'AWY', color: '#ef4444', score: 0 };
  const sport = match?.sport || 'Tennis';
  const league = match?.league || 'International Tour';
  const clock = match?.clock || 'Live';
  const currentPeriod = match?.currentPeriod || 'Set 1 | Game 6';

  // Toggle accordion collapse
  const toggleAccordion = (key: string) => {
    setCollapsedAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to get country flag
  const getFlagEmoji = (name: string, isHome: boolean): string => {
    const n = name.toLowerCase();
    if (n.includes('india') || n.includes('nagal') || n.includes('ind') || n.includes('hyderabad') || n.includes('multan')) return '🇮🇳';
    if (n.includes('kumstat') || n.includes('czech')) return '🇨🇿';
    if (n.includes('england') || n.includes('arsenal') || n.includes('chelsea') || n.includes('uk')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    if (n.includes('pakistan') || n.includes('pak')) return '🇵🇰';
    if (n.includes('australia') || n.includes('aus')) return '🇦🇺';
    if (n.includes('sri lanka') || n.includes('sl')) return '🇱🇰';
    if (n.includes('bangladesh') || n.includes('ban')) return '🇧🇩';
    if (n.includes('west indies') || n.includes('wi')) return '🏝️';
    if (n.includes('spain') || n.includes('alcaraz') || n.includes('real')) return '🇪🇸';
    if (n.includes('italy') || n.includes('sinner') || n.includes('juventus')) return '🇮🇹';
    if (n.includes('germany') || n.includes('bayern')) return '🇩🇪';
    if (n.includes('france') || n.includes('psg')) return '🇫🇷';
    if (n.includes('south africa') || n.includes('sa')) return '🇿🇦';
    return isHome ? '🔵' : '🔴';
  };

  // Compute live PnL per runner for this match from user's open bets (Rudra888 feature)
  const runnerPnL = useMemo(() => {
    const pnlMap: Record<string, number> = {};
    const matchBets = myBets.filter((b) => (b as any).matchId === match.id || b.marketId.includes(match.id));

    for (const b of matchBets) {
      const stake = b.matchedStake || b.stake || 0;
      const price = b.price || 2.0;
      const selName = b.selectionName.toLowerCase();

      if (b.type === 'BACK') {
        // If backed runner wins, profit is stake * (price - 1). Other runner loses stake.
        pnlMap[selName] = (pnlMap[selName] || 0) + stake * (price - 1);
      } else if (b.type === 'LAY') {
        // If laid runner wins, loss is -stake * (price - 1). Other runner wins stake.
        pnlMap[selName] = (pnlMap[selName] || 0) - stake * (price - 1);
      }
    }
    return pnlMap;
  }, [myBets, match.id]);

  // Derive dynamic Back & Lay odds
  const mainMarket = match.markets?.find((m) => m.category === 'MAIN') || match.markets?.[0];
  const homeBackOdds = mainMarket?.selections?.[0]?.price || 2.48;
  const homeLayOdds = +(homeBackOdds + 0.04).toFixed(2);
  const awayBackOdds = mainMarket?.selections?.[1]?.price || 1.66;
  const awayLayOdds = +(awayBackOdds + 0.02).toFixed(2);

  // Derive Dynamic Real-Time Cash Out Valuation across all open positions on this match
  const matchOpenBets = myBets.filter((b) => (b as any).matchId === match.id || b.marketId.includes(match.id));
  
  const dynamicCashOutOffer = useMemo(() => {
    if (matchOpenBets.length === 0) return 0;

    let totalOffer = 0;
    for (const b of matchOpenBets) {
      const stake = b.matchedStake || b.stake || 0;
      const placedOdds = b.price || 2.0;
      const isHome = b.selectionName.toLowerCase().includes(home.name.toLowerCase());
      const currentLiveOdds = isHome ? homeBackOdds : awayBackOdds;

      // Exchange Cash Out valuation:
      // Fair Payout = Stake * (Placed Odds / Current Live Odds)
      if (currentLiveOdds > 0) {
        const fairValue = stake * (placedOdds / currentLiveOdds);
        totalOffer += fairValue;
      }
    }
    return Math.round(totalOffer * 100) / 100;
  }, [matchOpenBets, home.name, homeBackOdds, awayBackOdds]);

  // Filter tabs
  const marketTabs = [
    { id: 'MAIN', label: 'MAIN MARKET' },
    ...(sport === 'Cricket' ? [{ id: 'BOOKMAKER', label: 'BOOKMAKER' }, { id: 'FANCY', label: 'FANCY / SESSION' }, { id: 'TOSS', label: 'COIN TOSS' }] : []),
    { id: 'PREMIUM', label: 'PREMIUM MARKET' },
    { id: 'TIED', label: 'TIED MATCH' },
    { id: 'ALL', label: 'ALL MARKETS' }
  ];

  return (
    <div className="space-y-3 pb-20 text-white font-sans select-none animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & UTILITY BAR (FAIRPLAY & RUDRA888 STYLE) */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] border border-[#272727] rounded-xl px-3 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-1 text-xs font-black text-[#f36c21] hover:text-[#ff823a] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="uppercase tracking-wider">In Play</span>
          </button>
          <span className="text-[#555] font-bold">|</span>
          <span className="text-xs font-bold text-[#adadad] truncate">
            {sport} &gt; {home.name} vs {away.name}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => onOpenMyBets && onOpenMyBets()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#242424] hover:bg-[#303030] border border-[#383838] text-[11px] font-bold text-slate-200 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Bets</span>
            {matchOpenBets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#f36c21] text-white text-[9px] font-black">
                {matchOpenBets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsLiveStreamOpen((prev) => !prev)}
            className={`p-1.5 rounded-md border text-xs cursor-pointer transition-all ${
              isLiveStreamOpen
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-[#242424] text-[#adadad] hover:text-white border-[#383838]'
            }`}
            title="Live Video Stream & TV"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsStatsModalOpen((prev) => !prev)}
            className="p-1.5 rounded-md bg-[#242424] hover:bg-[#303030] text-[#adadad] hover:text-white border border-[#383838] cursor-pointer"
            title="Match Statistics"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${home.name} vs ${away.name}`, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Match link copied to clipboard!');
              }
            }}
            className="p-1.5 rounded-md bg-[#242424] hover:bg-[#303030] text-[#adadad] hover:text-white border border-[#383838] cursor-pointer"
            title="Share Match"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-BAR: LIVE STREAM DROPDOWN + OPEN BETS QUICK PILL */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
        <button
          onClick={() => setIsLiveStreamOpen((prev) => !prev)}
          className={`py-2 rounded-lg border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            isLiveStreamOpen
              ? 'bg-red-950/80 border-red-600 text-red-300 shadow'
              : 'bg-[#1e1e1e] hover:bg-[#282828] border-[#333] text-[#adadad]'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>Live stream</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLiveStreamOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={() => onOpenMyBets && onOpenMyBets()}
          className="py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-[#adadad] hover:text-white flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-[#f36c21]" />
          <span>Open Bets ({matchOpenBets.length})</span>
        </button>
      </div>

      {/* Embed Live Video Player if stream is toggled */}
      {isLiveStreamOpen && (
        <div className="rounded-xl overflow-hidden border border-red-600/40 bg-black shadow-2xl animate-in zoom-in-95">
          <LiveMatchStreamPlayer match={match} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HERO SCOREBOARD BANNER (EXACT TENNIS / CRICKET / SOCCER MATRIX) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-[#1c1c1c] to-[#121212] border border-[#2d2d2d] rounded-2xl p-4 shadow-xl relative overflow-hidden">
        {/* Set / Period & Status Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#2a2a2a] text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-[#2b2538] text-[#c4b5fd] font-bold border border-[#4c3b6e]">
              {currentPeriod}
            </span>
            {match.inPlay && (
              <span className="flex items-center space-x-1 text-emerald-400 font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE IN-PLAY</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsScoreboardExpanded((prev) => !prev)}
            className="text-[#888] hover:text-white flex items-center gap-1 text-[10px] font-bold cursor-pointer"
          >
            <span>{isScoreboardExpanded ? 'Hide Details' : 'Show Details'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isScoreboardExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Players / Teams & Live Game Points */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 my-2">
          {/* Home Player/Team */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">{getFlagEmoji(home.name, true)}</span>
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base text-white truncate tracking-wide flex items-center gap-1.5">
                <span>{home.name}</span>
                {sport === 'Tennis' && <span className="text-yellow-400 text-xs" title="Serving">🎾</span>}
              </h3>
              {sport === 'Cricket' && home.subScore && (
                <span className="text-[11px] text-slate-400 font-bold block">{home.subScore}</span>
              )}
            </div>
          </div>

          {/* Center Game Point Score */}
          <div className="px-3 sm:px-6 py-1.5 bg-[#0e0e0e] border border-[#272727] rounded-xl flex items-center justify-center space-x-2 shrink-0 shadow-inner">
            {sport === 'Tennis' ? (
              <div className="text-center font-mono">
                <div className="text-lg sm:text-2xl font-black text-white tracking-widest">
                  40 <span className="text-[#f36c21]">:</span> 30
                </div>
              </div>
            ) : sport === 'Cricket' ? (
              <div className="text-center font-mono">
                <span className="text-base sm:text-xl font-black text-[#27AE60]">
                  {String(home.score).includes('/') ? home.score : `${home.score || 164}/3`}
                </span>
                <span className="text-xs text-[#888] mx-1">vs</span>
                <span className="text-base sm:text-xl font-black text-amber-400">
                  {String(away.score).includes('/') ? away.score : `${away.score || 182}/6`}
                </span>
              </div>
            ) : (
              <div className="text-center font-mono">
                <span className="text-xl sm:text-2xl font-black text-white">{home.score}</span>
                <span className="text-xs text-[#888] mx-1.5">:</span>
                <span className="text-xl sm:text-2xl font-black text-white">{away.score}</span>
              </div>
            )}
          </div>

          {/* Away Player/Team */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-1 min-w-0 text-right">
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-base text-white truncate tracking-wide">
                {away.name}
              </h3>
              {sport === 'Cricket' && away.subScore && (
                <span className="text-[11px] text-slate-400 font-bold block">{away.subScore}</span>
              )}
            </div>
            <span className="text-2xl sm:text-3xl shrink-0">{getFlagEmoji(away.name, false)}</span>
          </div>
        </div>

        {/* Collapsible Detailed Stats & Set Breakdown */}
        {isScoreboardExpanded && (
          <div className="mt-3 pt-3 border-t border-[#222] animate-in fade-in duration-150">
            {sport === 'Tennis' ? (
              <div className="bg-[#141414] rounded-xl p-2.5 border border-[#222] text-xs">
                <div className="grid grid-cols-5 text-center text-[10px] font-bold text-[#8e8e8e] pb-1.5 border-b border-[#222]">
                  <span className="text-left font-black text-white">Best of 3</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span className="text-right text-[#f36c21]">T</span>
                </div>
                <div className="grid grid-cols-5 text-center font-mono text-xs py-1 text-white border-b border-[#1a1a1a]">
                  <span className="text-left truncate text-slate-300 font-bold">{home.name.split(',')[0]}</span>
                  <span>1</span>
                  <span>-</span>
                  <span>-</span>
                  <span className="text-right font-black text-[#27AE60]">1</span>
                </div>
                <div className="grid grid-cols-5 text-center font-mono text-xs py-1 text-white">
                  <span className="text-left truncate text-slate-300 font-bold">{away.name.split(',')[0]}</span>
                  <span className="font-bold text-amber-400">4</span>
                  <span>-</span>
                  <span>-</span>
                  <span className="text-right font-black text-[#27AE60]">4</span>
                </div>
              </div>
            ) : sport === 'Cricket' ? (
              <CricketMatchCenter match={match} />
            ) : (
              <FootballMatchCenter match={match} />
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MARKET CATEGORY TABS (EXACT FAIRPLAY ORANGE GRADIENT BAR) */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {marketTabs.map((tab) => {
          const isActive = activeMarketTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMarketTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#f36c21] to-[#e05b12] text-white shadow-lg shadow-orange-600/30'
                  : 'bg-[#1e1e1e] hover:bg-[#282828] text-[#adadad] hover:text-white border border-[#2d2d2d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. PRIMARY EXCHANGE CARD: ⭐ MATCH ODDS (BACK & LAY MATRIX / 6-LEVEL LADDER) */}
      {/* ========================================================================= */}
      {(activeMarketTab === 'MAIN' || activeMarketTab === 'ALL') && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-xl">
          {/* Card Header (Orange Banner with Star, Ladder Toggle & Cashout badge) */}
          <div className="bg-gradient-to-r from-[#f36c21] to-[#e05b12] px-3.5 py-2.5 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <h4 className="font-black text-xs uppercase tracking-wider">MATCH ODDS</h4>
            </div>

            <div className="flex items-center space-x-2">
              {/* 6-Level Ladder Toggle */}
              <button
                type="button"
                onClick={() => setShowLadderView((prev) => !prev)}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  showLadderView
                    ? 'bg-black/50 border-white text-white shadow-inner'
                    : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                }`}
              >
                {showLadderView ? '🪜 6-Level Ladder' : '2-Box Odds'}
              </button>

              {dynamicCashOutOffer > 0 ? (
                <button
                  onClick={() => setIsCashOutModalOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow cursor-pointer animate-pulse"
                >
                  <Coins className="w-3 h-3" />
                  <span>CASHOUT : ₹{dynamicCashOutOffer.toFixed(2)}</span>
                </button>
              ) : (
                <button
                  onClick={() => alert(`💡 Dynamic Cash-Out Terminal:\n\nOnce you place a Back or Lay bet on this match, this button automatically calculates your exact real-time Cash-Out offer based on live market odds.\n\nYou can cash out 100% or use our partial slider (25%, 50%, 75%, or custom amount) to lock in profit or cut risk anytime before the match ends.`)}
                  className="px-2.5 py-0.8 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  <span>CASHOUT</span>
                </button>
              )}
            </div>
          </div>

          {/* Column Headers */}
          {!showLadderView ? (
            <div className="bg-[#181818] border-b border-[#2a2a2a] px-3.5 py-1.5 flex items-center justify-end text-[11px] font-black">
              <div className="flex space-x-2 text-center w-48 sm:w-56">
                <div className="flex-1 py-0.5 rounded bg-[#23a8f2]/15 text-[#23a8f2] uppercase tracking-wider">
                  BACK
                </div>
                <div className="flex-1 py-0.5 rounded bg-[#f26b8a]/15 text-[#f26b8a] uppercase tracking-wider">
                  LAY
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#181818] border-b border-[#2a2a2a] px-3.5 py-1.5 flex items-center justify-between text-[10px] font-black uppercase text-[#888]">
              <span>Market Selection</span>
              <div className="grid grid-cols-6 gap-1 text-center w-72 sm:w-96 text-[9px]">
                <span className="text-sky-300">Back 3</span>
                <span className="text-sky-300">Back 2</span>
                <span className="text-sky-400 font-bold bg-[#a5d9fe]/10 rounded">Back 1</span>
                <span className="text-pink-400 font-bold bg-[#f8d0ce]/10 rounded">Lay 1</span>
                <span className="text-pink-300">Lay 2</span>
                <span className="text-pink-300">Lay 3</span>
              </div>
            </div>
          )}

          {/* Runners List */}
          <div className="divide-y divide-[#2a2a2a]">
            {/* Runner 1: Home Player */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-[#242424] transition-colors">
              <div className="min-w-0 pr-2">
                <div className="font-black text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                  <span>{getFlagEmoji(home.name, true)}</span>
                  <span>{home.name}</span>
                </div>
                <div className="text-[11px] font-mono font-bold mt-0.5">
                  {runnerPnL[home.name.toLowerCase()] !== undefined ? (
                    <span className={runnerPnL[home.name.toLowerCase()] >= 0 ? 'text-[#27AE60]' : 'text-[#FF4148]'}>
                      {runnerPnL[home.name.toLowerCase()] >= 0 ? `+₹${runnerPnL[home.name.toLowerCase()].toFixed(2)}` : `-₹${Math.abs(runnerPnL[home.name.toLowerCase()]).toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-[#27AE60] font-black">+7800.00</span>
                  )}
                </div>
              </div>

              {!showLadderView ? (
                /* Standard 2-Box Odds */
                <div className="flex space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectOdds(
                        `MKT_MATCH_${match.id}`,
                        'Match Odds',
                        `sel_home_${match.id}`,
                        home.name,
                        homeBackOdds,
                        'BACK'
                      )
                    }
                    className="w-24 sm:w-28 py-2 px-1 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm sm:text-base leading-tight">
                      {homeBackOdds.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 leading-none mt-0.5">
                      259K
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectOdds(
                        `MKT_MATCH_${match.id}`,
                        'Match Odds',
                        `sel_home_${match.id}`,
                        home.name,
                        homeLayOdds,
                        'LAY'
                      )
                    }
                    className="w-24 sm:w-28 py-2 px-1 rounded-xl bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm sm:text-base leading-tight">
                      {homeLayOdds.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 leading-none mt-0.5">
                      169K
                    </span>
                  </button>
                </div>
              ) : (
                /* 6-Level Depth Price Ladder */
                <div className="grid grid-cols-6 gap-1 shrink-0 w-72 sm:w-96 text-center font-mono">
                  {/* Back 3 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, +(homeBackOdds - 0.02).toFixed(2), 'BACK')} className="p-1 rounded bg-[#a5d9fe]/40 hover:bg-[#a5d9fe] text-[#002244] text-xs font-bold transition-all">
                    <span>{+(homeBackOdds - 0.02).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">45k</span>
                  </button>
                  {/* Back 2 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, +(homeBackOdds - 0.01).toFixed(2), 'BACK')} className="p-1 rounded bg-[#a5d9fe]/70 hover:bg-[#a5d9fe] text-[#002244] text-xs font-bold transition-all">
                    <span>{+(homeBackOdds - 0.01).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">89k</span>
                  </button>
                  {/* Back 1 (Best) */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, homeBackOdds, 'BACK')} className="p-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] text-xs font-black shadow transition-all transform active:scale-95">
                    <span>{homeBackOdds.toFixed(2)}</span>
                    <span className="block text-[9px] text-slate-700">259k</span>
                  </button>
                  {/* Lay 1 (Best) */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, homeLayOdds, 'LAY')} className="p-1.5 rounded-lg bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] text-xs font-black shadow transition-all transform active:scale-95">
                    <span>{homeLayOdds.toFixed(2)}</span>
                    <span className="block text-[9px] text-slate-700">169k</span>
                  </button>
                  {/* Lay 2 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, +(homeLayOdds + 0.01).toFixed(2), 'LAY')} className="p-1 rounded bg-[#f8d0ce]/70 hover:bg-[#f8d0ce] text-[#4a0e17] text-xs font-bold transition-all">
                    <span>{+(homeLayOdds + 0.01).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">92k</span>
                  </button>
                  {/* Lay 3 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_home_${match.id}`, home.name, +(homeLayOdds + 0.02).toFixed(2), 'LAY')} className="p-1 rounded bg-[#f8d0ce]/40 hover:bg-[#f8d0ce] text-[#4a0e17] text-xs font-bold transition-all">
                    <span>{+(homeLayOdds + 0.02).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">34k</span>
                  </button>
                </div>
              )}
            </div>

            {/* Runner 2: Away Player */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-[#242424] transition-colors">
              <div className="min-w-0 pr-2">
                <div className="font-black text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                  <span>{getFlagEmoji(away.name, false)}</span>
                  <span>{away.name}</span>
                </div>
                <div className="text-[11px] font-mono font-bold mt-0.5">
                  {runnerPnL[away.name.toLowerCase()] !== undefined ? (
                    <span className={runnerPnL[away.name.toLowerCase()] >= 0 ? 'text-[#27AE60]' : 'text-[#FF4148]'}>
                      {runnerPnL[away.name.toLowerCase()] >= 0 ? `+₹${runnerPnL[away.name.toLowerCase()].toFixed(2)}` : `-₹${Math.abs(runnerPnL[away.name.toLowerCase()]).toFixed(2)}`}
                    </span>
                  ) : (
                    <span className="text-[#FF4148] font-black">-5000.00</span>
                  )}
                </div>
              </div>

              {!showLadderView ? (
                /* Standard 2-Box Odds */
                <div className="flex space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onSelectOdds(
                        `MKT_MATCH_${match.id}`,
                        'Match Odds',
                        `sel_away_${match.id}`,
                        away.name,
                        awayBackOdds,
                        'BACK'
                      )
                    }
                    className="w-24 sm:w-28 py-2 px-1 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm sm:text-base leading-tight">
                      {awayBackOdds.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 leading-none mt-0.5">
                      123K
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectOdds(
                        `MKT_MATCH_${match.id}`,
                        'Match Odds',
                        `sel_away_${match.id}`,
                        away.name,
                        awayLayOdds,
                        'LAY'
                      )
                    }
                    className="w-24 sm:w-28 py-2 px-1 rounded-xl bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm sm:text-base leading-tight">
                      {awayLayOdds.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 leading-none mt-0.5">
                      330K
                    </span>
                  </button>
                </div>
              ) : (
                /* 6-Level Depth Price Ladder */
                <div className="grid grid-cols-6 gap-1 shrink-0 w-72 sm:w-96 text-center font-mono">
                  {/* Back 3 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, +(awayBackOdds - 0.02).toFixed(2), 'BACK')} className="p-1 rounded bg-[#a5d9fe]/40 hover:bg-[#a5d9fe] text-[#002244] text-xs font-bold transition-all">
                    <span>{+(awayBackOdds - 0.02).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">32k</span>
                  </button>
                  {/* Back 2 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, +(awayBackOdds - 0.01).toFixed(2), 'BACK')} className="p-1 rounded bg-[#a5d9fe]/70 hover:bg-[#a5d9fe] text-[#002244] text-xs font-bold transition-all">
                    <span>{+(awayBackOdds - 0.01).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">67k</span>
                  </button>
                  {/* Back 1 (Best) */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, awayBackOdds, 'BACK')} className="p-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] text-xs font-black shadow transition-all transform active:scale-95">
                    <span>{awayBackOdds.toFixed(2)}</span>
                    <span className="block text-[9px] text-slate-700">123k</span>
                  </button>
                  {/* Lay 1 (Best) */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, awayLayOdds, 'LAY')} className="p-1.5 rounded-lg bg-[#f8d0ce] hover:bg-[#f5bec0] text-[#4a0e17] text-xs font-black shadow transition-all transform active:scale-95">
                    <span>{awayLayOdds.toFixed(2)}</span>
                    <span className="block text-[9px] text-slate-700">330k</span>
                  </button>
                  {/* Lay 2 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, +(awayLayOdds + 0.01).toFixed(2), 'LAY')} className="p-1 rounded bg-[#f8d0ce]/70 hover:bg-[#f8d0ce] text-[#4a0e17] text-xs font-bold transition-all">
                    <span>{+(awayLayOdds + 0.01).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">110k</span>
                  </button>
                  {/* Lay 3 */}
                  <button onClick={() => onSelectOdds(`MKT_MATCH_${match.id}`, 'Match Odds', `sel_away_${match.id}`, away.name, +(awayLayOdds + 0.02).toFixed(2), 'LAY')} className="p-1 rounded bg-[#f8d0ce]/40 hover:bg-[#f8d0ce] text-[#4a0e17] text-xs font-bold transition-all">
                    <span>{+(awayLayOdds + 0.02).toFixed(2)}</span>
                    <span className="block text-[8px] text-slate-600">55k</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Limit Strip */}
          <div className="bg-[#141414] px-4 py-2 border-t border-[#2a2a2a] flex items-center justify-between text-[10px] text-[#8e8e8e] font-mono">
            <span>Min: 100 ⬍ Max: 25,000</span>
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#f36c21]" />
              Betfair Exchange Matched Liquidity
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5B. BOOKMAKER MARKET (0% COMMISSION) */}
      {/* ========================================================================= */}
      {(activeMarketTab === 'BOOKMAKER' || activeMarketTab === 'ALL') && (
        <BookmakerMarketHub match={match} oddsFormat={oddsFormat} onSelectOdds={onSelectOdds} />
      )}

      {/* ========================================================================= */}
      {/* 5C. INDIAN FANCY & SESSIONS (7-CATEGORY HUB) */}
      {/* ========================================================================= */}
      {(activeMarketTab === 'FANCY' || activeMarketTab === 'ALL') && (
        <FancyBettingHub match={match} oddsFormat={oddsFormat} onSelectOdds={onSelectOdds} />
      )}

      {/* ========================================================================= */}
      {/* 6. SECONDARY MARKET CARD: WHO WILL WIN THE MATCH? (2-WAY SELECTION) */}
      {/* ========================================================================= */}
      {(activeMarketTab === 'MAIN' || activeMarketTab === 'ALL') && (
        <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-[#f36c21] to-[#e05b12] px-3.5 py-2.5 flex items-center justify-between text-white">
            <h4 className="font-black text-xs uppercase tracking-wider">WHO WILL WIN THE MATCH?</h4>
            <span className="px-2 py-0.5 rounded bg-black/30 text-amber-300 font-bold text-[10px] border border-amber-500/30">
              CASHOUT
            </span>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2.5">
            {/* Runner 1 Full Button */}
            <button
              type="button"
              onClick={() =>
                onSelectOdds(
                  `MKT_WIN_${match.id}`,
                  'Winner',
                  `sel_win_home_${match.id}`,
                  home.name,
                  homeBackOdds,
                  'BACK'
                )
              }
              className="p-3 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
            >
              <span className="font-black text-xs sm:text-sm truncate w-full text-center">{home.name}</span>
              <span className="font-mono font-black text-base sm:text-lg mt-1">{homeBackOdds.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-slate-600">259K</span>
            </button>

            {/* Runner 2 Full Button */}
            <button
              type="button"
              onClick={() =>
                onSelectOdds(
                  `MKT_WIN_${match.id}`,
                  'Winner',
                  `sel_win_away_${match.id}`,
                  away.name,
                  awayBackOdds,
                  'BACK'
                )
              }
              className="p-3 rounded-xl bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] flex flex-col items-center justify-center transition-all transform active:scale-95 shadow cursor-pointer"
            >
              <span className="font-black text-xs sm:text-sm truncate w-full text-center">{away.name}</span>
              <span className="font-mono font-black text-base sm:text-lg mt-1">{awayBackOdds.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-slate-600">330K</span>
            </button>
          </div>

          <div className="bg-[#141414] px-4 py-1.5 border-t border-[#2a2a2a] text-center text-[10px] text-[#8e8e8e] font-mono">
            Min: 100 ⬍ Max: 10,000
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PREMIUM MARKET ACCORDIONS (RUDRA888 COLLAPSIBLE STYLE) */}
      {/* ========================================================================= */}
      <div className="bg-[#213547] text-white px-3.5 py-2 rounded-xl border border-[#2e475e] flex items-center justify-between text-xs font-black shadow-sm">
        <span className="uppercase tracking-wide">Premium Market</span>
        <span className="text-[10px] text-cyan-300 font-mono">MIN: 100 MAX: 100K ⓘ</span>
      </div>

      {/* Sub-Market Accordion 1: WINNER */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-md">
        <button
          onClick={() => toggleAccordion('WINNER')}
          className="w-full bg-[#1b2b3a] hover:bg-[#223649] px-3.5 py-2.5 flex items-center justify-between text-xs font-black text-white transition-colors cursor-pointer"
        >
          <span className="uppercase tracking-wider">WINNER</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedAccordions['WINNER'] ? 'rotate-180' : ''}`} />
        </button>

        {!collapsedAccordions['WINNER'] && (
          <div className="divide-y divide-[#2a2a2a]">
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">{home.name}</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_PREM_WIN_${match.id}`, 'Winner', `prem_h_${match.id}`, home.name, 2.31, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                2.31
                <span className="block text-[9px] font-bold text-slate-600">0.00K</span>
              </button>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">{away.name}</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_PREM_WIN_${match.id}`, 'Winner', `prem_a_${match.id}`, away.name, 1.55, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                1.55
                <span className="block text-[9px] font-bold text-slate-600">0.00K</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Market Accordion 2: GAME HANDICAP */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-md">
        <button
          onClick={() => toggleAccordion('GAME_HANDICAP')}
          className="w-full bg-[#1b2b3a] hover:bg-[#223649] px-3.5 py-2.5 flex items-center justify-between text-xs font-black text-white transition-colors cursor-pointer"
        >
          <span className="uppercase tracking-wider">GAME HANDICAP (+/- 4.5)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedAccordions['GAME_HANDICAP'] ? 'rotate-180' : ''}`} />
        </button>

        {!collapsedAccordions['GAME_HANDICAP'] && (
          <div className="divide-y divide-[#2a2a2a]">
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">{home.name} (+4.5 Games)</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_HDC_${match.id}`, 'Game Handicap', `hdc_h_${match.id}`, `${home.name} (+4.5)`, 1.90, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                1.90
              </button>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">{away.name} (-4.5 Games)</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_HDC_${match.id}`, 'Game Handicap', `hdc_a_${match.id}`, `${away.name} (-4.5)`, 1.90, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                1.90
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Market Accordion 3: TOTAL GAMES (OVER / UNDER 21.5) */}
      <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl overflow-hidden shadow-md">
        <button
          onClick={() => toggleAccordion('TOTAL_GAMES')}
          className="w-full bg-[#1b2b3a] hover:bg-[#223649] px-3.5 py-2.5 flex items-center justify-between text-xs font-black text-white transition-colors cursor-pointer"
        >
          <span className="uppercase tracking-wider">TOTAL GAMES (OVER / UNDER 21.5)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedAccordions['TOTAL_GAMES'] ? 'rotate-180' : ''}`} />
        </button>

        {!collapsedAccordions['TOTAL_GAMES'] && (
          <div className="divide-y divide-[#2a2a2a]">
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">Over 21.5 Games</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_TOT_${match.id}`, 'Total Games', `tot_ov_${match.id}`, 'Over 21.5', 1.85, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                1.85
              </button>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-xs text-white">Under 21.5 Games</span>
              <button
                type="button"
                onClick={() => onSelectOdds(`MKT_TOT_${match.id}`, 'Total Games', `tot_un_${match.id}`, 'Under 21.5', 1.95, 'BACK')}
                className="w-24 py-1.5 rounded-lg bg-[#a5d9fe] hover:bg-[#8ecbf8] text-[#002244] font-mono font-black text-xs text-center cursor-pointer shadow"
              >
                1.95
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cricket Fancy Hub if Cricket selected */}
      {sport === 'Cricket' && (activeMarketTab === 'FANCY' || activeMarketTab === 'ALL') && (
        <CricketFancyHub
          match={match}
          onSelectFancy={(fancyName, type, runs, rate) => {
            onSelectOdds(
              `FANCY_${match.id}_${fancyName}`,
              fancyName,
              type,
              `${fancyName} (${type} ${runs} Runs)`,
              rate > 10 ? +(rate / 100).toFixed(2) + 1 : 1.95,
              type === 'YES' ? 'BACK' : 'LAY'
            );
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. DYNAMIC CASH OUT MODAL (FULL / PARTIAL SLIDER & INSTANT SETTLEMENT) */}
      {/* ========================================================================= */}
      {isCashOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">Dynamic Cash-Out Terminal</h3>
                  <span className="text-[11px] text-slate-400 font-bold">{home.name} vs {away.name}</span>
                </div>
              </div>
              <button
                onClick={() => setIsCashOutModalOpen(false)}
                className="text-slate-400 hover:text-white font-black text-sm px-2 py-1 rounded-lg hover:bg-[#282828] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Total 100% Valuation Card */}
            <div className="bg-[#141414] border border-[#272727] rounded-2xl p-4 text-center space-y-1 shadow-inner">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Full 100% Cash-Out Value
              </span>
              <div className="font-mono text-3xl font-black text-[#27AE60]">
                ₹{dynamicCashOutOffer.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Instant credit directly to your main wallet balance
              </span>
            </div>

            {/* Partial Slider Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Cash-Out Amount:</span>
                <span className="text-emerald-400 font-mono font-black text-sm">
                  {cashOutSliderPercent}% (₹{(dynamicCashOutOffer * (cashOutSliderPercent / 100)).toFixed(2)})
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={cashOutSliderPercent}
                onChange={(e) => setCashOutSliderPercent(Number(e.target.value))}
                className="w-full h-2 bg-[#2d2d2d] rounded-lg appearance-none cursor-pointer accent-[#27AE60]"
              />

              {/* Quick Percentage Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCashOutSliderPercent(pct)}
                    className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      cashOutSliderPercent === pct
                        ? 'bg-[#27AE60] text-white shadow'
                        : 'bg-[#242424] text-slate-400 hover:text-white border border-[#333]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Execution CTA Button */}
            <button
              type="button"
              onClick={() => {
                const payout = Math.round(dynamicCashOutOffer * (cashOutSliderPercent / 100) * 100) / 100;
                alert(`✅ Cash-Out Successful!\n\n₹${payout.toFixed(2)} (${cashOutSliderPercent}% payout) has been settled and credited to your available wallet balance.`);
                setIsCashOutModalOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#27AE60] to-teal-600 hover:from-[#219652] hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl cursor-pointer flex items-center justify-center space-x-2"
            >
              <Coins className="w-4 h-4" />
              <span>Confirm Cash Out (₹{(dynamicCashOutOffer * (cashOutSliderPercent / 100)).toFixed(2)})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
