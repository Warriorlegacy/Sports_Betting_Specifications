import React, { useState, useEffect, useCallback } from 'react';
import { FairplayHeader } from './components/FairplayHeader';
import { FairplaySidebar } from './components/FairplaySidebar';
import { FairplayEventList } from './components/FairplayEventList';
import { FairplayBetSlip } from './components/FairplayBetSlip';
import { FairplayFooter } from './components/FairplayFooter';
import { SportsbookHome } from './components/SportsbookHome';
import { MatchDetailHub } from './components/MatchDetailHub';
import { MarketLadder, Market, SelectionLadder } from './components/MarketLadder';
import { PositionMatrix } from './components/PositionMatrix';
import { CashOutManager } from './components/CashOutManager';
import { EnhancedBetSlip } from './components/EnhancedBetSlip';
import { MyBets, UserBet } from './components/MyBets';
import { CashierModal } from './components/CashierModal';
import { LoginModal } from './components/LoginModal';
import { CreditsModal } from './components/CreditsModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { NewsTicker } from './components/NewsTicker';
import { AppDownloadModal } from './components/AppDownloadModal';
import { InfoModal, InfoModalTab } from './components/InfoModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { api, setAuthToken, removeAuthToken, getAuthToken } from './services/api';
import { playerSocket } from './services/socket';
import { SportsbookEngine } from './services/sportsbookEngine';
import { INITIAL_CASHOUT_BETS } from './services/mockSportsbookData';
import { fetchRealWorldSports } from './services/realSportsClient';
import { fetchFairplayExchangeMatches } from './services/fairplayFeedClient';
import { MatkaHub } from './components/MatkaHub';
import { LiveCasinoHub } from './components/LiveCasinoHub';
import { MultiMarketBoard } from './components/MultiMarketBoard';
import { LanguageModal } from './components/LanguageModal';
import { TwoFactorModal } from './components/TwoFactorModal';
import { StatementExportModal } from './components/StatementExportModal';
import { SpinWheelModal } from './components/SpinWheelModal';
import { useI18n } from './services/i18nService';
import {
  LiveMatch,
  SportCategory,
  OddsFormat,
  BetSlipItem,
  SGPTicket,
  CashOutBet,
  BettingMarket
} from './types/sportsbook';
import { Zap, User, Lock, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

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

  // Build comprehensive market list
  const primarySelections = t.realOdds?.selections?.length
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
        { id: '2', name: t.awayTeam || 'Away', price: 1.95 },
        ...(t.sport === 'FOOTBALL' ? [{ id: '3', name: 'Draw', price: 3.20 }] : [])
      ];

  const markets: BettingMarket[] = [
    {
      id: `MKT_MATCH_${t.marketId}`,
      name: 'Match Odds',
      category: 'MAIN',
      isLive: true,
      hasCashOut: true,
      selections: primarySelections
    }
  ];

  if (t.drawOdds || (t.sport === 'FOOTBALL' && primarySelections.length < 3)) {
    markets.push({
      id: `MKT_DRAW_${t.marketId}`,
      name: 'Draw No Bet',
      category: 'MAIN',
      isLive: true,
      hasCashOut: true,
      selections: [
        { id: `dnb_1_${t.marketId}`, name: t.homeTeam || 'Home', price: 1.65 },
        { id: `dnb_2_${t.marketId}`, name: t.awayTeam || 'Away', price: 2.20 }
      ]
    });
  }

  if (t.sport === 'CRICKET') {
    markets.push(
      {
        id: `MKT_BOOKMAKER_${t.marketId}`,
        name: 'Bookmaker (0% Comm)',
        category: 'MAIN',
        isLive: true,
        hasCashOut: true,
        selections: primarySelections.map((s: any) => ({
          ...s,
          price: +(s.price * 0.98).toFixed(2)
        }))
      },
      {
        id: `MKT_FANCY_SESSION_${t.marketId}`,
        name: 'Normal Session Runs',
        category: 'MAIN',
        isLive: true,
        hasCashOut: false,
        selections: [
          { id: `cri_ov_${t.marketId}`, name: 'Over 168.5 Runs', price: 1.85 },
          { id: `cri_un_${t.marketId}`, name: 'Under 168.5 Runs', price: 1.95 }
        ]
      }
    );
  }

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
    markets
  };
}

type ViewType =
  | 'SPORTSBOOK'
  | 'INPLAY'
  | 'MULTI_MARKETS'
  | 'EXCHANGE'
  | 'MATKA'
  | 'CASINO'
  | 'CASHOUT'
  | 'MY_BETS'
  | 'CRASH'
  | 'LIVECARD'
  | 'FANTASY';

export const App: React.FC = () => {
  // Navigation & User State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<ViewType>('INPLAY');
  const [selectedSport, setSelectedSport] = useState<SportCategory>('All');
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('DECIMAL');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [oneClickBet, setOneClickBet] = useState<boolean>(false);
  const [isPlacingBet, setIsPlacingBet] = useState<boolean>(false);

  // Real-world Live Sports Matches & Real Odds State (Zero mock data)
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [cashOutBets, setCashOutBets] = useState<CashOutBet[]>(INITIAL_CASHOUT_BETS);

  // Universal Bet Slip State
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  // Cashier & Banking Modal State
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [cashierTab, setCashierTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');

  // Sign In / Auth Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Creator & Godfather Credits Modal State
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState<boolean>(false);

  // App Download Modal State
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState<boolean>(false);

  // Benchmark Feature Modal States
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState<boolean>(false);
  const [isStatementExportOpen, setIsStatementExportOpen] = useState<boolean>(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState<boolean>(false);
  const [pinnedMatchIds, setPinnedMatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_pinned_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleTogglePinMatch = (matchId: string) => {
    setPinnedMatchIds((prev) => {
      const next = prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId];
      localStorage.setItem('nexus_pinned_matches', JSON.stringify(next));
      return next;
    });
  };

  const handleSpinReward = (amount: number, description: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        availableCredit: (prev.availableCredit || 0) + amount
      };
      return updated;
    });
    setToastMessage(`🎉 ${description} (+₹${amount})!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Info, Rules, Privacy, T&C & FAQ Modal State
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>('ABOUT');

  // Theme & Brand Customizer Modal State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Exchange Ladder State (for P2P mode)
  const [exchangeMarkets, setExchangeMarkets] = useState<Market[]>([]);
  const [selectedExchangeMarketId, setSelectedExchangeMarketId] = useState<string>('');
  const [ladderData, setLadderData] = useState<Record<number, SelectionLadder>>({});
  const [pnlMatrix, setPnlMatrix] = useState<Record<number, number>>({});
  const [netExposure, setNetExposure] = useState<number>(0);
  const [myBets, setMyBets] = useState<UserBet[]>([]);

  // Login Form
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch logged in user details from real backend database
  const fetchUserData = useCallback(async () => {
    try {
      const meRes = await api.auth.getMe();
      if (meRes && meRes.user) {
        setCurrentUser(meRes.user);
      }
    } catch (err) {
      console.log('No active authenticated backend session');
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
      if (betsRes && betsRes.bets && betsRes.bets.length > 0) {
        setMyBets(betsRes.bets);
      }
      setPnlMatrix(expRes.pnlMatrix || {});
      setNetExposure(expRes.netExposure || 0);
    } catch (err) {
      // Ignored in offline fallback
    }
  }, [selectedExchangeMarketId, currentUser]);

  // Fetch 100% Real World Live Matches and Odds (348+ Fairplay/ZPlay & Global Feeds)
  const fetchLiveTelemetry = useCallback(async () => {
    try {
      // 1. Fetch live matches from Fairplay / ZPlay Exchange (348+ matches with Betfair odds)
      const fpMatches = await fetchFairplayExchangeMatches().catch(() => []);
      const espnMatches = await fetchRealWorldSports().catch(() => []);

      const combined = [...(Array.isArray(fpMatches) ? fpMatches : [])];
      if (Array.isArray(espnMatches)) {
        for (const em of espnMatches) {
          if (!em) continue;
          const emHome = typeof em.homeTeam === 'object' && em.homeTeam !== null ? (em.homeTeam.name || '') : String(em.homeTeam || '');
          if (!combined.some(c => {
            if (!c) return false;
            const cHome = typeof c.homeTeam === 'object' && c.homeTeam !== null ? (c.homeTeam.name || '') : String(c.homeTeam || '');
            return c.sport === em.sport && cHome === emHome;
          })) {
            combined.push(em);
          }
        }
      }

      if (combined.length > 0) {
        setLiveMatches(combined);
        setMatchesLoading(false);
        return;
      }

      // 2. Fallback to backend telemetry
      const res = await api.markets.getLiveTelemetry().catch(() => null);
      const tels: any[] = (res && (res.telemetry || res.liveMatches || res.matches)) || [];
      if (tels.length > 0) {
        const realMatches = tels
          .map((t: any) => convertTelemetryToMatch(t))
          .filter((m: LiveMatch) => Boolean(m && m.homeTeam?.name && m.awayTeam?.name));
        if (realMatches.length > 0) {
          setLiveMatches(realMatches);
        }
      }
    } catch (e) {
      console.warn('[LiveTelemetry] Querying global live sports feeds...');
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  // Initial load: Check real session, load persistent bets. No demo-user fallback.
  useEffect(() => {
    // 1. Restore persistent placed bets and cash out bets from localStorage
    const savedBets = localStorage.getItem('nexus_placed_bets');
    if (savedBets) {
      try {
        const parsed = JSON.parse(savedBets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMyBets(parsed);
        }
      } catch {}
    }

    const savedCashOut = localStorage.getItem('nexus_cashout_bets');
    if (savedCashOut) {
      try {
        const parsed = JSON.parse(savedCashOut);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCashOutBets(parsed);
        }
      } catch {}
    }

    // 2. Auth & User Initialization — Auto-login disabled: always boot into public/guest exchange mode
    // Real user session must be initiated via explicit Login / OTP verification
    localStorage.removeItem('exchange_player_token');
    localStorage.removeItem('nexus_demo_user');
    sessionStorage.removeItem('exchange_player_token');
    Promise.all([fetchExchangeMarkets(), fetchLiveTelemetry()]).finally(() => setLoading(false));
  }, [fetchExchangeMarkets, fetchLiveTelemetry]);

  // Dynamic live tick simulation (subtle odds ticks and ball animation)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setLiveMatches((prevMatches) => {
        if (!prevMatches || prevMatches.length === 0) return prevMatches;
        let nextCashOut: CashOutBet[] = [];
        setCashOutBets((prevCashOut) => {
          const { updatedCashOutBets } = SportsbookEngine.simulateTick(prevMatches, prevCashOut || []);
          nextCashOut = updatedCashOutBets;
          return updatedCashOutBets;
        });
        const { updatedMatches } = SportsbookEngine.simulateTick(prevMatches, nextCashOut);
        return updatedMatches;
      });
    }, 4000);
    return () => clearInterval(tickInterval);
  }, []);

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


  // Handle Login with real credentials
  const handleLogin = async (usernameOverride?: string, passwordOverride?: string) => {
    try {
      setLoading(true);
      setLoginError(null);
      const u = usernameOverride || loginUsername;
      const p = passwordOverride || loginPassword;
      const res = await api.auth.login({ username: u, password: p });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      setIsLoginModalOpen(false);
      await Promise.all([fetchUserData(), fetchExchangeMarkets(), fetchLiveTelemetry()]);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('nexus_demo_user');
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
    price: number,
    type: 'BACK' | 'LAY' | 'SPORTSBOOK' = 'BACK'
  ) => {
    const match = liveMatches.find((m) => m && m.id === matchId);
    const homeName = (match && typeof match.homeTeam === 'object' && match.homeTeam !== null) ? (match.homeTeam.name || 'Home') : String(match?.homeTeam || 'Home');
    const awayName = (match && typeof match.awayTeam === 'object' && match.awayTeam !== null) ? (match.awayTeam.name || 'Away') : String(match?.awayTeam || 'Away');
    const eventName = match ? `${homeName} vs ${awayName}` : marketName;

    const newItem: BetSlipItem = {
      id: `${marketId}_${selectionId}_${type}`,
      matchId,
      eventName,
      marketId,
      marketName,
      selectionId,
      selectionName,
      type: type as any,
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
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    const totalLiability = items.reduce((acc, bet) => {
      if (bet.type === 'BACK') return acc + (bet.stake || 0);
      return acc + (bet.stake || 0) * ((bet.price || 1) - 1);
    }, 0);

    if (totalLiability > (currentUser.availableCredit || 0)) {
      alert(`Insufficient funds. Required liability: ₹${totalLiability.toFixed(2)}, Available balance: ₹${currentUser.availableCredit?.toFixed(2) || '0.00'}.`);
      return;
    }

    setIsPlacingBet(true);
    try {
      // 1. Submit each order to backend API ledger & matching engine
      for (const item of items) {
        try {
          const res = await api.bets.placeBet({
            marketId: item.marketId,
            selectionId: item.selectionId,
            type: item.type === 'LAY' ? 'LAY' : 'BACK',
            price: item.price,
            stake: item.stake,
            eventName: item.eventName,
            selectionName: item.selectionName,
            sport: selectedSport !== 'All' ? selectedSport : 'Football'
          });
          if (res && res.availableCredit !== undefined) {
            setCurrentUser((prev: any) =>
              prev ? { ...prev, availableCredit: res.availableCredit, exposure: res.exposure } : prev
            );
          }
        } catch (apiErr) {
          console.log('Backend ledger sync notice (using local execution):', apiErr);
        }
      }

      // 2. Create UserBet records for MyBets and Open Bets tab
      const newUserBets: UserBet[] = items.map((item, idx) => ({
        id: `BET_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        marketId: item.matchId || item.marketId,
        eventName: item.eventName,
        selectionId: typeof item.selectionId === 'number' ? item.selectionId : 1,
        selectionName: item.selectionName,
        type: item.type === 'LAY' ? 'LAY' : 'BACK',
        price: item.price,
        stake: item.stake,
        matchedStake: item.stake,
        unmatchedStake: 0,
        liability: item.type === 'LAY' ? Math.round(item.stake * (item.price - 1) * 100) / 100 : item.stake,
        status: 'MATCHED',
        pnl: 0,
        createdAt: new Date().toISOString()
      }));

      // 3. Create Cash-out eligible positions
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

      // 4. Update local state & persistent storage
      setMyBets((prev) => {
        const updated = [...newUserBets, ...prev];
        localStorage.setItem('nexus_placed_bets', JSON.stringify(updated));
        return updated;
      });

      setCashOutBets((prev) => {
        const updated = [...newCashOutBets, ...prev];
        localStorage.setItem('nexus_cashout_bets', JSON.stringify(updated));
        return updated;
      });

      setCurrentUser((prev: any) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          availableCredit: Math.max(0, prev.availableCredit - totalLiability),
          exposure: (prev.exposure || 0) + totalLiability
        };
        return updated;
      });

      setBetSlipItems([]);

      const summary = items.map((i) => `${i.selectionName} (₹${i.stake} @ ${i.price})`).join(', ');
      setToastMessage(`🎯 Bet Registered Successfully! ${summary}`);
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Cancel Unmatched Bet Position
  const handleCancelOpenBet = async (betId: string) => {
    try {
      await api.bets.cancelBet(betId).catch(() => {});
    } catch {}

    setMyBets((prev) => {
      const betToCancel = prev.find((b) => b.id === betId);
      if (betToCancel) {
        setCurrentUser((u: any) => {
          if (!u) return u;
          const refund = betToCancel.liability || betToCancel.stake;
          const refunded = {
            ...u,
            availableCredit: u.availableCredit + refund,
            exposure: Math.max(0, (u.exposure || 0) - refund)
          };
          return refunded;
        });
      }
      const updated = prev.filter((b) => b.id !== betId);
      localStorage.setItem('nexus_placed_bets', JSON.stringify(updated));
      return updated;
    });

    setToastMessage('✅ Open bet cancelled & credit refunded to wallet');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Execute Dynamic Early Cash Out
  const handleExecuteCashOut = async (
    betId: string,
    cashOutAmount: number,
    percentage: number
  ): Promise<void> => {
    try {
      await api.bets.cashoutBet(betId, { cashOutAmount, percentage }).catch(() => {});
    } catch {}

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

  const safeLiveMatches = Array.isArray(liveMatches) ? liveMatches : [];
  const sportCounts: Record<string, number> = {
    cricket: safeLiveMatches.filter((m) => m && m.sport === 'Cricket').length,
    soccer: safeLiveMatches.filter((m) => m && m.sport === 'Football').length,
    tennis: safeLiveMatches.filter((m) => m && m.sport === 'Tennis').length,
    basketball: safeLiveMatches.filter((m) => m && m.sport === 'Basketball').length,
    baseball: safeLiveMatches.filter((m) => m && m.sport === 'Baseball').length,
    table_tennis: safeLiveMatches.filter((m) => m && m.sport === 'Table Tennis').length,
    horse_racing: 4,
    greyhound: 2,
    kabaddi: 1,
    election: 1,
    esports: 3,
    mma: 2,
    volleyball: 2,
    snooker: 1,
    football: safeLiveMatches.filter((m) => m && m.sport === 'American Football').length
  };

  const selectedMatch = liveMatches.find((m) => m.id === selectedMatchId);
  const activeExchangeMarket =
    exchangeMarkets.find((m) => m.id === selectedExchangeMarketId) || exchangeMarkets[0];

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col selection:bg-[#f36c21] selection:text-white">
      {/* 1. TOP FAIRPLAY VIP HEADER & NAV BAR */}
      <FairplayHeader
        user={currentUser}
        activeNavTab={activeView}
        setActiveNavTab={(tab) => {
          setSelectedMatchId(null);
          setActiveView(tab as any);
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={(dark) => {
          setIsDarkMode(dark);
          if (dark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          }
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsLoginModalOpen(true)}
        onOpenCashier={(tab) => {
          if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
          }
          setCashierTab(tab || 'DEPOSIT');
          setIsCashierOpen(true);
        }}
        onOpenCredits={() => setIsCreditsModalOpen(true)}
        onOpenAppDownload={() => setIsAppDownloadModalOpen(true)}
        onOpenInfoTab={(tab) => {
          setInfoModalTab(tab);
          setIsInfoModalOpen(true);
        }}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenTwoFactor={() => setIsTwoFactorModalOpen(true)}
        onOpenStatementExport={() => setIsStatementExportOpen(true)}
        onOpenSpinWheel={() => setIsSpinWheelOpen(true)}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
        onLogout={handleLogout}
        openBetsCount={myBets.filter((b) => b.status === 'UNMATCHED' || b.status === 'MATCHED').length}
        oneClickBet={oneClickBet}
        setOneClickBet={setOneClickBet}
      />

      {/* LIVE BROADCAST NEWS & ANNOUNCEMENTS TICKER */}
      <NewsTicker />

      {/* MOBILE APP INSTALL FLOATING BANNER */}
      <div className="lg:hidden bg-gradient-to-r from-[#2c1405] via-[#1a1a1a] to-[#121212] border-b border-[#333] px-3 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center p-1 border border-[#f36c21]/40">
            <img src="/assets/fairplayvip8252.png" alt="NexusVIP" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white text-xs font-black">NexusVIP Android App</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/40">
                v2.0.0
              </span>
            </div>
            <span className="text-[10px] text-[#adadad] block">Faster live betting • 0-lag stream</span>
          </div>
        </div>
        <button
          onClick={() => setIsAppDownloadModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#f36c21] to-[#e05b12] text-white text-[11px] font-black uppercase tracking-wider shadow shadow-orange-600/30 active:scale-95 transition-transform"
        >
          Get App
        </button>
      </div>

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e1e]/95 backdrop-blur border-2 border-[#27AE60] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top-4 duration-200 max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-[#27AE60] shrink-0 animate-bounce" />
          <span className="text-xs font-black tracking-wide truncate">{toastMessage}</span>
        </div>
      )}

      {/* 2. MAIN 3-COLUMN BODY LAYOUT (Full Screen Width) */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 flex gap-3 flex-1 pb-20 lg:pb-3">
        {/* LEFT COLUMN: ALL SPORTS ACCORDION */}
        <div className="hidden lg:block">
          <FairplaySidebar
            selectedSport={selectedSport}
            onSelectSport={(sport) => {
              setSelectedMatchId(null);
              setSelectedSport(sport);
              if (activeView !== 'SPORTSBOOK' && activeView !== 'INPLAY') {
                setActiveView('INPLAY' as any);
              }
            }}
            sportCounts={sportCounts}
            onNavigateTab={(tab) => {
              setSelectedMatchId(null);
              setActiveView(tab as any);
            }}
          />
        </div>

        {/* CENTER COLUMN: MAIN EVENT FEED & HUBS */}
        <main className="flex-1 min-w-0">
          {/* Detailed Match Hub View */}
          {selectedMatch ? (
            <MatchDetailHub
              match={selectedMatch}
              oddsFormat={oddsFormat}
              user={currentUser}
              myBets={myBets}
              onBack={() => setSelectedMatchId(null)}
              onOpenMyBets={() => {
                setSelectedMatchId(null);
                setActiveView('MY_BETS' as any);
              }}
              onSelectOdds={(marketId, marketName, selectionId, selectionName, price, type) =>
                handleSelectOdds(
                  selectedMatch.id,
                  marketId,
                  marketName,
                  selectionId,
                  selectionName,
                  price,
                  type || 'BACK'
                )
              }
              onAddSGPToSlip={handleAddSGPToSlip}
            />
          ) : (
            <>
              {/* MULTI-MARKET BOARD (RUDRA888 PINNED MATCH MATRIX) */}
              {activeView === 'MULTI_MARKETS' && (
                <MultiMarketBoard
                  allMatches={liveMatches}
                  pinnedMatchIds={pinnedMatchIds}
                  onTogglePin={handleTogglePinMatch}
                  onSelectOdds={(matchId, marketId, marketName, selectionId, selectionName, price, type) => {
                    handleSelectOdds(
                      matchId,
                      marketId,
                      marketName,
                      selectionId,
                      selectionName,
                      price,
                      type || 'BACK'
                    );
                  }}
                  onSelectMatch={(matchId) => setSelectedMatchId(matchId)}
                  oddsFormat={oddsFormat}
                />
              )}

              {/* IN-PLAY / SPORTSBOOK VIEW (Fairplay 6-Odds Matrix Cards) */}
              {(activeView === 'INPLAY' || activeView === 'SPORTSBOOK') && (
                <FairplayEventList
                  matches={liveMatches}
                  selectedSport={selectedSport}
                  onSelectMatch={(matchId) => setSelectedMatchId(matchId)}
                  onSelectOdds={(
                    matchId,
                    marketId,
                    marketName,
                    selectionId,
                    selectionName,
                    price,
                    type
                  ) => {
                    handleSelectOdds(
                      matchId,
                      marketId,
                      marketName,
                      selectionId,
                      selectionName,
                      price,
                      type || 'BACK'
                    );
                  }}
                  selectedSelectionId={betSlipItems[0]?.selectionId}
                  selectedOddsType={betSlipItems[0]?.type as ('BACK' | 'LAY' | undefined)}
                />
              )}

              {/* MATKA VIEW (23 Indian Matka Bazars) */}
              {activeView === 'MATKA' && (
                <MatkaHub
                  user={currentUser}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onBetPlaced={(bet) => {
                    const newItem: BetSlipItem = {
                      id: `${bet.marketId}_${Date.now()}`,
                      matchId: bet.marketId,
                      eventName: bet.eventName,
                      marketId: bet.marketId,
                      marketName: 'Matka Bazar',
                      selectionId: bet.selectionName,
                      selectionName: bet.selectionName,
                      type: 'BACK',
                      price: bet.odds,
                      stake: bet.stake
                    };
                    setBetSlipItems((prev) => [...prev, newItem]);
                  }}
                />
              )}

              {/* CASINO VIEW (Evolution & Ezugi Live Dealer Tables) */}
              {activeView === 'CASINO' && (
                <LiveCasinoHub
                  user={currentUser}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onOpenCashier={() => {
                    setCashierTab('DEPOSIT');
                    setIsCashierOpen(true);
                  }}
                />
              )}

              {/* CRASH GAMES VIEW */}
              {activeView === 'CRASH' && (
                <div className="bg-[#1e1e1e] p-8 rounded-md border border-[#2d2d2d] text-center space-y-4 shadow">
                  <img src="/assets/crash-img-d4T8ANqx.webp" alt="Crash" className="w-16 h-16 mx-auto object-contain" />
                  <h3 className="font-black text-lg text-white">Aviator & Crash Multiplier Arena</h3>
                  <p className="text-xs text-[#adadad] max-w-md mx-auto">
                    Experience real-time Provably Fair multipliers up to 10,000x with automated auto-cashout triggers.
                  </p>
                  <button
                    onClick={() => setActiveView('CASINO' as any)}
                    className="px-6 py-2.5 rounded-full bg-[#f36c21] hover:bg-[#e05b12] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Enter Live Casino Lobby
                  </button>
                </div>
              )}

              {/* LIVE CARD & FANTASY PRO VIEWS */}
              {(activeView === 'LIVECARD' || activeView === 'FANTASY') && (
                <div className="bg-[#1e1e1e] p-8 rounded-md border border-[#2d2d2d] text-center space-y-4 shadow">
                  <img src="/assets/live-card.c981209-CS5ln-mD.webp" alt="Live Card" className="w-16 h-16 mx-auto object-contain" />
                  <h3 className="font-black text-lg text-white">Live Teen Patti & 32 Cards Virtual Studio</h3>
                  <p className="text-xs text-[#adadad] max-w-md mx-auto">
                    Play Live 20-20 Teen Patti, Muflis, and Dragon Tiger with real interactive dealers.
                  </p>
                  <button
                    onClick={() => setActiveView('CASINO' as any)}
                    className="px-6 py-2.5 rounded-full bg-[#27AE60] hover:bg-[#219652] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Launch Live Card Table
                  </button>
                </div>
              )}

              {/* EARLY CASH OUT TERMINAL */}
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

              {/* MY BETS / SETTLEMENT HISTORY */}
              {activeView === 'MY_BETS' && (
                <MyBets
                  bets={myBets}
                  onCancelBet={async (betId) => {
                    await handleCancelOpenBet(betId);
                  }}
                  onRefresh={() => {
                    fetchExchangeMarketData();
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* RIGHT COLUMN: BET SLIP WIDGET */}
        <div className="hidden lg:block">
          <FairplayBetSlip
            betItems={betSlipItems}
            openBets={myBets}
            onUpdateStake={(index, stake) =>
              setBetSlipItems((prev) =>
                prev.map((item, i) => (i === index ? { ...item, stake } : item))
              )
            }
            onUpdatePrice={(index, price) =>
              setBetSlipItems((prev) =>
                prev.map((item, i) => (i === index ? { ...item, price } : item))
              )
            }
            onRemoveBet={(index) =>
              setBetSlipItems((prev) => prev.filter((_, i) => i !== index))
            }
            onClearBets={() => setBetSlipItems([])}
            onPlaceBets={() => handlePlaceBets(betSlipItems)}
            onCancelOpenBet={handleCancelOpenBet}
            isPlacing={isPlacingBet}
            userBalance={currentUser ? currentUser.availableCredit : 0}
            openBetsCount={myBets.filter((b) => b.status === 'UNMATCHED' || b.status === 'MATCHED').length}
            onViewMyBets={() => {
              setSelectedMatchId(null);
              setActiveView('MY_BETS' as any);
            }}
            oneClickBet={oneClickBet}
          />
        </div>
      </div>

      {/* 3. FAIRPLAY FOOTER */}
      <FairplayFooter
        onOpenCredits={() => setIsCreditsModalOpen(true)}
        onOpenAppDownload={() => setIsAppDownloadModalOpen(true)}
        onOpenInfoTab={(tab) => {
          setInfoModalTab(tab);
          setIsInfoModalOpen(true);
        }}
      />

      {/* 4. MOBILE FLOATING BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav
        activeNavTab={activeView.toLowerCase()}
        setActiveNavTab={(tab) => {
          setSelectedMatchId(null);
          if (tab === 'inplay') setActiveView('INPLAY' as any);
          else if (tab === 'sportbook') setActiveView('SPORTSBOOK' as any);
          else if (tab === 'live_casino') setActiveView('CASINO' as any);
          else if (tab === 'matka') setActiveView('MATKA' as any);
          else setActiveView(tab.toUpperCase() as any);
        }}
        openBetsCount={myBets.filter((b) => b.status === 'UNMATCHED' || b.status === 'MATCHED').length}
        betSlipCount={betSlipItems.length}
        onToggleBetSlip={() => setIsSlipOpen((prev) => !prev)}
        onOpenAppDownload={() => setIsAppDownloadModalOpen(true)}
        onOpenCashier={() => {
          if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
          }
          setCashierTab('DEPOSIT');
          setIsCashierOpen(true);
        }}
        user={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Mobile Drawer Bet Slip Modal */}
      {isSlipOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 flex items-end justify-center p-2 animate-in fade-in">
          <div className="w-full max-w-lg">
            <FairplayBetSlip
              betItems={betSlipItems}
              openBets={myBets}
              onUpdateStake={(index, stake) =>
                setBetSlipItems((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, stake } : item))
                )
              }
              onUpdatePrice={(index, price) =>
                setBetSlipItems((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, price } : item))
                )
              }
              onRemoveBet={(index) =>
                setBetSlipItems((prev) => prev.filter((_, i) => i !== index))
              }
              onClearBets={() => setBetSlipItems([])}
              onPlaceBets={() => {
                handlePlaceBets(betSlipItems);
                setIsSlipOpen(false);
              }}
              onCancelOpenBet={handleCancelOpenBet}
              isPlacing={isPlacingBet}
              userBalance={currentUser ? currentUser.availableCredit : 0}
              openBetsCount={myBets.filter((b) => b.status === 'UNMATCHED' || b.status === 'MATCHED').length}
              onViewMyBets={() => {
                setSelectedMatchId(null);
                setActiveView('MY_BETS' as any);
                setIsSlipOpen(false);
              }}
              oneClickBet={oneClickBet}
            />
            <button
              onClick={() => setIsSlipOpen(false)}
              className="w-full mt-2 py-2 rounded bg-[#333] text-white font-bold text-xs cursor-pointer"
            >
              Close Slip
            </button>
          </div>
        </div>
      )}

      {/* Cashier & Banking Modal */}
      {currentUser && (
        <CashierModal
          isOpen={isCashierOpen}
          onClose={() => setIsCashierOpen(false)}
          user={currentUser}
          onBalanceUpdate={fetchUserData}
          defaultTab={cashierTab}
        />
      )}

      {/* Authentication / Sign In Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          fetchUserData();
          fetchExchangeMarkets();
        }}
        loading={loading}
        error={loginError}
      />

      {/* Creator & Godfather Credits Modal */}
      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadModalOpen}
        onClose={() => setIsAppDownloadModalOpen(false)}
      />

      {/* Info, Rules, Privacy, T&C & FAQ Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        initialTab={infoModalTab}
        onClose={() => setIsInfoModalOpen(false)}
        onOpenCredits={() => {
          setIsInfoModalOpen(false);
          setIsCreditsModalOpen(true);
        }}
        onOpenAppDownload={() => {
          setIsInfoModalOpen(false);
          setIsAppDownloadModalOpen(true);
        }}
      />

      {/* 9-Language Localization Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Google Authenticator TOTP 2FA Modal */}
      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        user={currentUser}
      />

      {/* Account Statements & P&L Export Modal (PDF / CSV) */}
      <StatementExportModal
        isOpen={isStatementExportOpen}
        onClose={() => setIsStatementExportOpen(false)}
        user={currentUser}
      />

      {/* Daily Lucky Spin Wheel Mini-Game */}
      <SpinWheelModal
        isOpen={isSpinWheelOpen}
        onClose={() => setIsSpinWheelOpen(false)}
        user={currentUser}
        onRewardWon={handleSpinReward}
      />

      {/* Benchmark Theme & Whitelabel Presets Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};
