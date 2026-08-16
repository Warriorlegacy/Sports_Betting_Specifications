import React, { useState, useEffect, useCallback } from 'react';
import { SportsbookHeader } from './components/SportsbookHeader';
import { SportsbookHome } from './components/SportsbookHome';
import { MatchDetailHub } from './components/MatchDetailHub';
import { MarketLadder, Market, SelectionLadder } from './components/MarketLadder';
import { PositionMatrix } from './components/PositionMatrix';
import { CashOutManager } from './components/CashOutManager';
import { EnhancedBetSlip } from './components/EnhancedBetSlip';
import { MyBets, UserBet } from './components/MyBets';
import { CashierModal } from './components/CashierModal';
import { api, setAuthToken, removeAuthToken, getAuthToken } from './services/api';
import { playerSocket } from './services/socket';
import {
  LiveMatch,
  SportCategory,
  OddsFormat,
  BetSlipItem,
  SGPTicket,
  CashOutBet
} from './types/sportsbook';
import { Zap, User, Lock, ArrowRight, Shield } from 'lucide-react';

function convertTelemetryToMatch(t: any): LiveMatch {
  const sportMap: Record<string, SportCategory> = {
    CRICKET: 'Cricket',
    FOOTBALL: 'Football',
    TENNIS: 'Tennis',
    BASKETBALL: 'Basketball',
    BASEBALL: 'Baseball',
    HORSE_RACING: 'Football'
  };

  const sportCat: SportCategory = sportMap[t.sport] || 'Football';
  const todayStr = new Date().toISOString().split('T')[0];

  let homeScore: number | string = 0;
  let awayScore: number | string = 0;
  let homeSubScore: string | undefined = undefined;
  let awaySubScore: string | undefined = undefined;
  let clock = '00:00';

  if (t.cricket) {
    homeScore = `${t.cricket.runs}/${t.cricket.wickets}`;
    awayScore = t.cricket.target ? `Target: ${t.cricket.target}` : '-';
    homeSubScore = `(${t.cricket.overs} ov)`;
    clock = `${t.cricket.overs} Overs`;
  } else if (t.tennis) {
    const curSet = t.tennis.sets?.[t.tennis.currentSet - 1] || { home: 0, away: 0 };
    homeScore = curSet.home;
    awayScore = curSet.away;
    homeSubScore = `Pts: ${t.tennis.currentGameScore?.home || '0'}`;
    awaySubScore = `Pts: ${t.tennis.currentGameScore?.away || '0'}`;
    clock = `Set ${t.tennis.currentSet}`;
  } else if (t.basketball) {
    homeScore = t.basketball.homeScore;
    awayScore = t.basketball.awayScore;
    clock = `${t.basketball.quarterName} ${t.basketball.gameClock}`;
  } else if (t.football) {
    homeScore = t.football.homeGoals;
    awayScore = t.football.awayGoals;
    clock = `${t.football.minute}'`;
  }

  const matchDate = t.startTime ? t.startTime.split('T')[0] : todayStr;
  const startTime = t.startTime
    ? new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '19:00';

  return {
    id: t.marketId,
    sport: sportCat,
    league: t.venue || 'Global Tournament',
    country: 'Global',
    flag: '🌍',
    matchDate,
    startTime,
    currentPeriod: '1st Half',
    possessionTeam: 'HOME',
    attackPhase: 'BUILD_UP',
    ballPosition: { x: 50, y: 50 },

    possessionStats: { home: 50, away: 50 },
    shots: [],
    events: [],
    stats: [
      { label: 'Attacks', home: 45, away: 40, homePercent: 53, awayPercent: 47 },
      { label: 'Dangerous Attacks', home: 22, away: 18, homePercent: 55, awayPercent: 45 }
    ],
    winProbabilityHistory: [
      { minute: 0, homeProb: 45, drawProb: 25, awayProb: 30 },
      { minute: 45, homeProb: 50, drawProb: 20, awayProb: 30 }
    ],
    momentumHistory: [
      { minute: 0, momentum: 0 },
      { minute: 45, momentum: 20 }
    ],

    homeTeam: {
      name: t.homeTeam || 'Home Team',
      shortName: (t.homeTeam || 'HOM').substring(0, 3).toUpperCase(),
      color: '#3b82f6',
      score: homeScore,
      subScore: homeSubScore
    },
    awayTeam: {
      name: t.awayTeam || 'Away Team',
      shortName: (t.awayTeam || 'AWY').substring(0, 3).toUpperCase(),
      color: '#ef4444',
      score: awayScore,
      subScore: awaySubScore
    },
    clock,
    inPlay: Boolean(t.inPlay),
    status: t.status === 'COMPLETED' ? 'SETTLED' : t.inPlay ? 'LIVE' : 'UPCOMING',
    isLocked: Boolean(t.isLocked),
    markets: [
      {
        id: `MKT_MAIN_${t.marketId}`,
        name: t.realOdds?.marketName || 'Match Winner / Moneyline',
        category: 'MAIN',
        selections: t.realOdds?.selections?.length
          ? t.realOdds.selections.map((s: any) => ({
              id: String(s.selectionId),
              name: s.name,
              price: s.backPrice || 1.95,
              backPrice: s.backPrice,
              layPrice: s.layPrice,
              backVolume: s.backVolume,
              layVolume: s.layVolume,
              depth: s.depth
            }))
          : [
              { id: '1', name: t.homeTeam || 'Home', price: 1.95 },
              { id: '2', name: t.awayTeam || 'Away', price: 1.95 }
            ]
      }
    ]
  };
}

export const App: React.FC = () => {


  // Navigation & User State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'SPORTSBOOK' | 'EXCHANGE' | 'CASHOUT' | 'MY_BETS'>(
    'SPORTSBOOK'
  );
  const [selectedSport, setSelectedSport] = useState<SportCategory>('All');
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('DECIMAL');

  // Sportsbook & Live Match State — starts EMPTY, filled by real live match data
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [cashOutBets, setCashOutBets] = useState<CashOutBet[]>([]);

  // Universal Bet Slip State
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  // Cashier & Banking Modal State
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [cashierTab, setCashierTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');

  // Exchange Ladder State (for P2P mode)
  const [exchangeMarkets, setExchangeMarkets] = useState<Market[]>([]);
  const [selectedExchangeMarketId, setSelectedExchangeMarketId] = useState<string>('');
  const [ladderData, setLadderData] = useState<Record<number, SelectionLadder>>({});
  const [pnlMatrix, setPnlMatrix] = useState<Record<number, number>>({});
  const [netExposure, setNetExposure] = useState<number>(0);
  const [myBets, setMyBets] = useState<UserBet[]>([]);

  // Login Form
  const [loginUsername, setLoginUsername] = useState<string>('player_rahul');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch logged in user details
  const fetchUserData = useCallback(async () => {
    try {
      const meRes = await api.auth.getMe();
      setCurrentUser(meRes.user);
    } catch (err) {
      console.log('No backend user session, initialized local trader profile.');
    }
  }, []);

  // Fetch exchange markets if available
  const fetchExchangeMarkets = useCallback(async () => {
    try {
      const res = await api.markets.getAll();
      if (res.markets && res.markets.length > 0) {
        setExchangeMarkets(res.markets);
        if (!selectedExchangeMarketId) {
          setSelectedExchangeMarketId(res.markets[0].id);
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }, [selectedExchangeMarketId]);

  const fetchExchangeMarketData = useCallback(async () => {
    if (!selectedExchangeMarketId || !currentUser) return;
    try {
      const [betsRes, expRes] = await Promise.all([
        api.bets.getMyBets(),
        api.bets.getMarketExposure(selectedExchangeMarketId).catch(() => ({ pnlMatrix: {}, netExposure: 0 }))
      ]);
      setMyBets(betsRes.bets || []);
      setPnlMatrix(expRes.pnlMatrix || {});
      setNetExposure(expRes.netExposure || 0);
    } catch (err) {
      // Ignored in offline fallback
    }
  }, [selectedExchangeMarketId, currentUser]);

  // Fetch live real telemetry from backend (ESPN / global sports feeds)
  // Replaces the full match list with real data — never merges with mock data
  const fetchLiveTelemetry = useCallback(async () => {
    try {
      const res = await api.markets.getLiveTelemetry();
      const tels: any[] = res.telemetry || res.liveMatches || [];
      if (tels.length > 0) {
        // Convert every telemetry entry to a LiveMatch and replace the list entirely
        const realMatches = tels
          .map((t: any) => convertTelemetryToMatch(t))
          .filter((m: LiveMatch) => Boolean(m.homeTeam?.name && m.awayTeam?.name));
        setLiveMatches(realMatches);
        setMatchesLoading(false);
      }
    } catch (e) {
      // Backend unreachable — leave current state as-is (don't inject mock data)
      console.warn('[LiveTelemetry] Backend unreachable, retrying next poll...');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      Promise.all([fetchUserData(), fetchExchangeMarkets(), fetchLiveTelemetry()]).finally(() => setLoading(false));
    } else {
      // Default demo session for instantaneous access
      setCurrentUser({
        id: '00000000-0000-0000-0000-000000000004',
        username: 'player_rahul',
        availableCredit: 10000.0,
        exposure: 1500.0,
        creditLimit: 25000.0
      });
      fetchLiveTelemetry();
      setLoading(false);
    }
  }, [fetchUserData, fetchExchangeMarkets, fetchLiveTelemetry]);

  // NOTE: SportsbookEngine.simulateTick() has been intentionally removed.
  // All match data comes from the real ESPN API via fetchLiveTelemetry.
  // Simulated odds ticks were causing fake matches to persist alongside real data.

  // Poll real ESPN/live feed every 30 seconds to refresh actual match data
  useEffect(() => {
    const livePolling = setInterval(() => {
      fetchLiveTelemetry();
    }, 30000);
    return () => clearInterval(livePolling);
  }, [fetchLiveTelemetry]);


  // Socket.io Real-Time Streaming for Exchange & Live Telemetry
  useEffect(() => {
    const socket = playerSocket.connect();
    socket.emit('subscribe:telemetry');

    if (currentUser) {
      socket.emit('subscribe:user', { userId: currentUser.id });
    }

    if (selectedExchangeMarketId) {
      socket.emit('subscribe:market', { marketId: selectedExchangeMarketId });
    }

    // 1. Live Match Point-by-point / Ball-by-ball Telemetry Updates
    const handleTelemetry = (data: { marketId: string; telemetry: any }) => {
      if (!data || !data.telemetry) return;
      const t = data.telemetry;

      setLiveMatches((prev) => {
        const exists = prev.some((m) => m.id === data.marketId);
        if (!exists) {
          const newMatch = convertTelemetryToMatch(t);
          return [newMatch, ...prev];
        }

        return prev.map((m) => {
          if (m.id === data.marketId) {
            let updated = { ...m };
            updated.isLocked = Boolean(t.isLocked);

            if (t.cricket) {
              updated.homeTeam = { ...m.homeTeam, score: `${t.cricket.runs}/${t.cricket.wickets}`, subScore: `(${t.cricket.overs} ov)` };
              updated.clock = `${t.cricket.overs} Overs`;
              updated.events = [
                { id: `ev-${Date.now()}`, minute: `${t.cricket.overs} Ov`, team: 'HOME', type: 'BOUNDARY', player: t.cricket.striker?.name || 'Batsman', detail: t.cricket.lastEventDescription },
                ...(m.events || []).slice(0, 8)
              ];
            } else if (t.tennis) {
              const curSet = t.tennis.sets?.[t.tennis.currentSet - 1] || { home: 0, away: 0 };
              updated.homeTeam = { ...m.homeTeam, score: curSet.home, subScore: `Pts: ${t.tennis.currentGameScore?.home || '0'}` };
              updated.awayTeam = { ...m.awayTeam, score: curSet.away, subScore: `Pts: ${t.tennis.currentGameScore?.away || '0'}` };
              updated.clock = `Set ${t.tennis.currentSet}`;
            } else if (t.basketball) {
              updated.homeTeam = { ...m.homeTeam, score: t.basketball.homeScore };
              updated.awayTeam = { ...m.awayTeam, score: t.basketball.awayScore };
              updated.clock = `${t.basketball.quarterName} ${t.basketball.gameClock}`;
            } else if (t.football) {
              updated.homeTeam = { ...m.homeTeam, score: t.football.homeGoals };
              updated.awayTeam = { ...m.awayTeam, score: t.football.awayGoals };
              updated.clock = `${t.football.minute}'`;
            }

            if (t.realOdds?.selections?.length) {
              updated.markets = [
                {
                  id: `MKT_MAIN_${t.marketId}`,
                  name: t.realOdds.marketName || 'Match Winner / Moneyline',
                  category: 'MAIN',
                  selections: t.realOdds.selections.map((s: any) => ({
                    id: String(s.selectionId),
                    name: s.name,
                    price: s.backPrice || 1.95,
                    backPrice: s.backPrice,
                    layPrice: s.layPrice,
                    backVolume: s.backVolume,
                    layVolume: s.layVolume,
                    depth: s.depth
                  }))
                }
              ];
            }
            return updated;
          }
          return m;
        });
      });
    };

    socket.on('match:telemetry', handleTelemetry);
    socket.on('match:global_telemetry', handleTelemetry);


    socket.on('ladder:update', (data: { marketId: string; ladder: Record<number, SelectionLadder> }) => {
      if (data.marketId === selectedExchangeMarketId) {
        setLadderData(data.ladder);
      }
    });

    socket.on('market:status', (data: { marketId: string; isLocked: boolean; status: string }) => {
      setExchangeMarkets((prev) =>
        prev.map((m) => (m.id === data.marketId ? { ...m, isLocked: data.isLocked, status: data.status } : m))
      );
      setLiveMatches((prev) =>
        prev.map((m) => (m.id === data.marketId ? { ...m, isLocked: data.isLocked } : m))
      );
    });

    socket.on('user:balance', (data: { availableCredit: number; exposure: number }) => {
      setCurrentUser((prev: any) =>
        prev ? { ...prev, availableCredit: data.availableCredit, exposure: data.exposure } : prev
      );
      fetchExchangeMarketData();
    });

    return () => {
      if (selectedExchangeMarketId) {
        socket.emit('unsubscribe:market', { marketId: selectedExchangeMarketId });
      }
      socket.off('match:telemetry', handleTelemetry);
      socket.off('match:global_telemetry', handleTelemetry);
      socket.off('ladder:update');
      socket.off('market:status');
      socket.off('user:balance');
    };
  }, [currentUser, selectedExchangeMarketId, fetchExchangeMarketData]);


  // Handle Login
  const handleLogin = async (usernameOverride?: string) => {
    try {
      setLoading(true);
      setLoginError(null);
      const u = usernameOverride || loginUsername;
      try {
        const res = await api.auth.login({ username: u, password: loginPassword });
        setAuthToken(res.token);
        setCurrentUser(res.user);
      } catch (e) {
        // Fallback local session if backend DB is cold
        setCurrentUser({
          id: '00000000-0000-0000-0000-000000000004',
          username: u,
          availableCredit: 10000.0,
          exposure: 1500.0,
          creditLimit: 25000.0
        });
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    playerSocket.disconnect();
  };

  // Add individual odds selection to Universal Bet Slip
  const handleSelectOdds = (
    matchId: string,
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number
  ) => {
    const match = liveMatches.find((m) => m.id === matchId);
    const eventName = match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : marketName;

    const newItem: BetSlipItem = {
      id: `${marketId}_${selectionId}`,
      matchId,
      eventName,
      marketId,
      marketName,
      selectionId,
      selectionName,
      type: 'SPORTSBOOK',
      price,
      stake: 500
    };

    setBetSlipItems((prev) => {
      const exists = prev.some((i) => i.id === newItem.id);
      if (exists) {
        return prev.filter((i) => i.id !== newItem.id);
      }
      return [...prev, newItem];
    });
    setIsSlipOpen(true);
  };

  // Add Same-Game Parlay (SGP) Ticket to Bet Slip
  const handleAddSGPToSlip = (ticket: SGPTicket, stake: number) => {
    const sgpItem: BetSlipItem = {
      id: `SGP_${ticket.matchId}_${Date.now()}`,
      matchId: ticket.matchId,
      eventName: ticket.eventName,
      marketId: 'SGP_BUILDER',
      marketName: `Same-Game Parlay (${ticket.legs.length} Legs)`,
      selectionId: 'SGP_COMBO',
      selectionName: ticket.legs.map((l) => l.selectionName).join(' + '),
      type: 'SGP',
      price: ticket.finalBoostedOdds,
      stake: stake || 500,
      isSGP: true,
      sgpTicket: ticket
    };

    setBetSlipItems((prev) => [...prev, sgpItem]);
    setIsSlipOpen(true);
  };

  // Place Bets from Universal Bet Slip
  const handlePlaceBets = async (items: BetSlipItem[]) => {
    const totalStake = items.reduce((sum, item) => sum + (item.stake || 0), 0);

    // Update user balance locally
    setCurrentUser((prev: any) =>
      prev
        ? {
            ...prev,
            availableCredit: Math.max(0, prev.availableCredit - totalStake),
            exposure: prev.exposure + totalStake
          }
        : prev
    );

    // Create new cash-out eligible bets from placed bets
    const newCashOutBets: CashOutBet[] = items.map((item) => ({
      id: `BET_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      matchId: item.matchId,
      eventName: item.eventName,
      marketName: item.marketName,
      selectionName: item.selectionName,
      type: item.type,
      placedOdds: item.price,
      currentOdds: item.price,
      stake: item.stake,
      remainingStake: item.stake,
      potentialReturn: Math.round(item.stake * item.price * 100) / 100,
      cashOutOffer: Math.round(item.stake * 0.95 * 100) / 100,
      status: 'OPEN',
      cashedOutAmount: 0,
      sgpLegsSummary: item.sgpTicket?.legs.map((l) => `• ${l.selectionName} (${l.marketName})`),
      placedAt: 'Just now'
    }));

    setCashOutBets((prev) => [...newCashOutBets, ...prev]);
  };

  // Execute Dynamic Early Cash Out
  const handleExecuteCashOut = async (
    betId: string,
    cashOutAmount: number,
    percentage: number
  ): Promise<void> => {
    // Immediate wallet balance payout
    setCurrentUser((prev: any) =>
      prev
        ? {
            ...prev,
            availableCredit: prev.availableCredit + cashOutAmount,
            exposure: Math.max(0, prev.exposure - cashOutAmount * 0.8)
          }
        : prev
    );

    // Update cashout bet status
    setCashOutBets((prev) =>
      prev.map((b) => {
        if (b.id !== betId) return b;
        if (percentage >= 100) {
          return {
            ...b,
            status: 'CASHED_OUT',
            cashedOutAmount: b.cashedOutAmount + cashOutAmount,
            remainingStake: 0
          };
        } else {
          const newRemainingStake = Math.round(b.remainingStake * (1 - percentage / 100) * 100) / 100;
          return {
            ...b,
            status: 'PARTIALLY_CASHED_OUT',
            cashedOutAmount: b.cashedOutAmount + cashOutAmount,
            remainingStake: newRemainingStake,
            potentialReturn: Math.round(newRemainingStake * b.placedOdds * 100) / 100
          };
        }
      })
    );
  };

  // Login view
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#060911] relative overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-sky-200 to-emerald-300 bg-clip-text text-transparent">
              NEXUS SPORTSBOOK
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Live In-Play Betting • SGP Parlays • Dynamic Cash-Out
            </p>
          </div>

          {loginError && (
            <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800/80 text-red-200">
              {loginError}
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Trader Login (Pre-funded)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin('player_rahul')}
                className="p-3 rounded-xl text-xs font-bold bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-200 transition-all text-left flex flex-col"
              >
                <span>Rahul (Player)</span>
                <span className="text-[10px] text-blue-400 font-normal">₹10,000 Balance</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('player_amit')}
                className="p-3 rounded-xl text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-200 transition-all text-left flex flex-col"
              >
                <span>Amit (Player)</span>
                <span className="text-[10px] text-emerald-400 font-normal">₹10,000 Balance</span>
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold uppercase text-slate-300">Username</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Sportsbook Terminal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedMatch = liveMatches.find((m) => m.id === selectedMatchId);
  const activeExchangeMarket =
    exchangeMarkets.find((m) => m.id === selectedExchangeMarketId) || exchangeMarkets[0];

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col pb-20 sm:pb-8 selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <SportsbookHeader
        user={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        oddsFormat={oddsFormat}
        setOddsFormat={setOddsFormat}
        cashOutCount={cashOutBets.filter((b) => b.status === 'OPEN').length}
        betSlipCount={betSlipItems.length}
        onToggleSlip={() => setIsSlipOpen(!isSlipOpen)}
        onOpenCashier={(tab) => {
          setCashierTab(tab || 'DEPOSIT');
          setIsCashierOpen(true);
        }}
        onLogout={handleLogout}
        onRefresh={() => {
          fetchUserData();
          fetchExchangeMarketData();
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: SPORTSBOOK (Live Matches & Match Hub) */}
        {activeView === 'SPORTSBOOK' && (
          <>
            {selectedMatch ? (
              <MatchDetailHub
                match={selectedMatch}
                oddsFormat={oddsFormat}
                onBack={() => setSelectedMatchId(null)}
                onSelectOdds={(marketId, marketName, selectionId, selectionName, price) =>
                  handleSelectOdds(
                    selectedMatch.id,
                    marketId,
                    marketName,
                    selectionId,
                    selectionName,
                    price
                  )
                }
                onAddSGPToSlip={handleAddSGPToSlip}
              />
            ) : (
              <SportsbookHome
                matches={liveMatches}
                selectedSport={selectedSport}
                oddsFormat={oddsFormat}
                onSelectMatch={(matchId) => setSelectedMatchId(matchId)}
                onSelectOdds={handleSelectOdds}
                onOpenSGP={(matchId) => setSelectedMatchId(matchId)}
              />
            )}
          </>
        )}

        {/* VIEW 2: P2P EXCHANGE (Back/Lay Ladder & Exposure Matrix) */}
        {activeView === 'EXCHANGE' && (
          <div className="space-y-6">
            {/* Exchange Market Selection Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {exchangeMarkets.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedExchangeMarketId(m.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-2 ${
                    selectedExchangeMarketId === m.id
                      ? 'bg-slate-800 border-blue-500 text-white shadow-lg shadow-blue-500/15'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{m.eventName}</span>
                </button>
              ))}
            </div>

            {activeExchangeMarket && (
              <MarketLadder
                market={activeExchangeMarket}
                ladderData={ladderData}
                pnlMatrix={pnlMatrix}
                onSelectOdds={(selectionId, selectionName, type, price) => {
                  const newItem: BetSlipItem = {
                    id: `${activeExchangeMarket.id}_${selectionId}_${type}`,
                    matchId: activeExchangeMarket.id,
                    eventName: activeExchangeMarket.eventName,
                    marketId: activeExchangeMarket.id,
                    marketName: 'Match Odds',
                    selectionId: selectionId.toString(),
                    selectionName: `${selectionName} (${type})`,
                    type,
                    price,
                    stake: 500
                  };
                  setBetSlipItems((prev) => [...prev, newItem]);
                  setIsSlipOpen(true);
                }}
              />
            )}

            {activeExchangeMarket && (
              <PositionMatrix
                selections={activeExchangeMarket.selections}
                pnlMatrix={pnlMatrix}
                netExposure={netExposure}
              />
            )}
          </div>
        )}

        {/* VIEW 3: EARLY CASH-OUT TERMINAL */}
        {activeView === 'CASHOUT' && (
          <CashOutManager
            bets={cashOutBets}
            oddsFormat={oddsFormat}
            onExecuteCashOut={handleExecuteCashOut}
            onSetAutoCashOut={(betId, threshold) => {
              setCashOutBets((prev) =>
                prev.map((b) => (b.id === betId ? { ...b, autoCashOutThreshold: threshold } : b))
              );
            }}
          />
        )}

        {/* VIEW 4: MY BETS & SETTLEMENT HISTORY */}
        {activeView === 'MY_BETS' && (
          <MyBets
            bets={myBets}
            onCancelBet={async (betId) => {
              await api.bets.cancelBet(betId);
              fetchExchangeMarketData();
            }}
            onRefresh={fetchExchangeMarketData}
          />
        )}
      </main>

      {/* Interactive Universal Bet Slip */}
      {isSlipOpen && (
        <EnhancedBetSlip
          items={betSlipItems}
          availableCredit={currentUser.availableCredit}
          oddsFormat={oddsFormat}
          onRemoveItem={(id) => setBetSlipItems((prev) => prev.filter((i) => i.id !== id))}
          onClearAll={() => setBetSlipItems([])}
          onUpdateStake={(id, stake) =>
            setBetSlipItems((prev) => prev.map((i) => (i.id === id ? { ...i, stake } : i)))
          }
          onPlaceBets={handlePlaceBets}
          onClose={() => setIsSlipOpen(false)}
        />
      )}

      {/* Cashier & Banking Modal */}
      <CashierModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
        user={currentUser}
        onBalanceUpdate={fetchUserData}
        defaultTab={cashierTab}
      />
    </div>
  );
};
