import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Shield,
  Users,
  Flame,
  ChevronRight,
  X,
  Maximize2,
  Trophy,
  DollarSign,
  Clock,
  Volume2,
  VolumeX,
  Tv,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  Sliders
} from 'lucide-react';
import { getSavedQuickStakes, QuickStakeModal } from './QuickStakeModal';

interface CasinoGame {
  id: string;
  gameCode: 't20' | 'oneday' | 'dt6' | 'lucky7eu' | 'aaa' | 'poker' | 'andar_bahar' | 'roulette' | 'crazy_time';
  name: string;
  provider: 'Evolution' | 'Ezugi' | 'SuperNowa' | 'ShivExch Live';
  category: 'INDIAN' | 'CARDS' | 'ROULETTE' | 'GAMESHOW';
  thumbnailUrl: string;
  minBet: number;
  maxBet: number;
  livePlayers: number;
  isHot?: boolean;
  description: string;
}

const CASINO_GAMES: CasinoGame[] = [
  {
    id: 't20',
    gameCode: 't20',
    name: 'Teen Patti 20-20 Live (T20)',
    provider: 'ShivExch Live',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 200000,
    livePlayers: 4820,
    isHot: true,
    description: 'Classic Indian 3-card poker. Player A vs Player B with Pair Plus & 6 Card Bonus.'
  },
  {
    id: 'oneday',
    gameCode: 'oneday',
    name: 'Teen Patti One Day',
    provider: 'ShivExch Live',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 500000,
    livePlayers: 3190,
    isHot: true,
    description: 'Back and Lay match odds on Teen Patti hands with dynamic floating market price.'
  },
  {
    id: 'dt6',
    gameCode: 'dt6',
    name: 'Dragon Tiger 6 (DT6)',
    provider: 'SuperNowa',
    category: 'CARDS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 300000,
    livePlayers: 5410,
    isHot: true,
    description: 'Highest card wins! Dragon vs Tiger with Suited Tie (50x), Odd/Even, and Red/Black props.'
  },
  {
    id: 'lucky7eu',
    gameCode: 'lucky7eu',
    name: 'Lucky 7 (7 Up 7 Down)',
    provider: 'ShivExch Live',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 100000,
    livePlayers: 2940,
    isHot: true,
    description: 'Guess Low (1-6 @ 2.0x), Exact 7 (11x), or High (8-12 @ 2.0x) with side suit multipliers.'
  },
  {
    id: 'aaa',
    gameCode: 'aaa',
    name: 'Amar Akbar Anthony (AAA)',
    provider: 'ShivExch Live',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 150000,
    livePlayers: 2150,
    isHot: true,
    description: 'Bollywood card classic: Amar (Low 1-6 @ 2x), Akbar (Mid 7-10 @ 3x), Anthony (J/Q/K @ 4x).'
  },
  {
    id: 'poker',
    gameCode: 'poker',
    name: '20-20 Live Poker',
    provider: 'Ezugi',
    category: 'CARDS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 250000,
    livePlayers: 1820,
    description: 'Two-player Texas Holdem shootout with instant river card showdown.'
  },
  {
    id: 'andar_bahar',
    gameCode: 'andar_bahar',
    name: 'Super Andar Bahar Live',
    provider: 'Evolution',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 100000,
    livePlayers: 3840,
    isHot: true,
    description: 'Desi favorite: Match the Joker card on Andar or Bahar with up to 4000x multipliers.'
  },
  {
    id: 'roulette',
    gameCode: 'roulette',
    name: 'Namaste Hindi Lightning Roulette',
    provider: 'Evolution',
    category: 'ROULETTE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80',
    minBet: 20,
    maxBet: 500000,
    livePlayers: 6120,
    isHot: true,
    description: 'Hindi-speaking live dealers with 500x Lucky Number Lightning strikes on every spin.'
  }
];

interface LiveCasinoHubProps {
  user: any | null;
  onOpenLogin: () => void;
  onOpenCashier: () => void;
}

export const LiveCasinoHub: React.FC<LiveCasinoHubProps> = ({ user, onOpenLogin, onOpenCashier }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);

  // Live Table Round Simulation State
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(15);
  const [roundPhase, setRoundPhase] = useState<'BETTING' | 'DEALING' | 'RESULT'>('BETTING');
  const [roundId, setRoundId] = useState<string>('849201934');
  const [selectedBetSide, setSelectedBetSide] = useState<string | null>(null);
  const [selectedStake, setSelectedStake] = useState<number>(500);
  const [placedBets, setPlacedBets] = useState<Array<{ side: string; name: string; odds: number; stake: number }>>([]);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [roundHistory, setRoundHistory] = useState<string[]>(['A', 'B', 'A', 'A', 'B', 'A', 'B', 'B']);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isQuickStakeModalOpen, setIsQuickStakeModalOpen] = useState<boolean>(false);
  const [quickStakes, setQuickStakes] = useState<number[]>(getSavedQuickStakes());

  const categories = [
    { id: 'ALL', label: '🌟 All Live Tables' },
    { id: 'INDIAN', label: '🇮🇳 Indian Desi Games (Teen Patti / Lucky 7)' },
    { id: 'CARDS', label: '🃏 Dragon Tiger & Poker' },
    { id: 'ROULETTE', label: '🎡 Live Roulette (500x)' }
  ];

  // Real-time 20-second game round cycle loop
  useEffect(() => {
    if (!activeGame) return;

    const timer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition Phases
        if (roundPhase === 'BETTING') {
          setRoundPhase('DEALING');
          return 4;
        } else if (roundPhase === 'DEALING') {
          setRoundPhase('RESULT');
          // Determine Winner
          const winners = ['Player A', 'Player B', 'Dragon', 'Tiger', 'Low (1-6)', 'High (8-12)', 'Amar', 'Akbar'];
          const picked = winners[Math.floor(Math.random() * winners.length)];
          setLastWinner(picked);
          setRoundHistory((h) => [picked.charAt(0), ...h.slice(0, 9)]);
          return 5;
        } else {
          // New round
          setRoundPhase('BETTING');
          setRoundId(`${Math.floor(100000000 + Math.random() * 900000000)}`);
          setPlacedBets([]);
          setSelectedBetSide(null);
          return 15;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGame, roundPhase]);

  const filteredGames = CASINO_GAMES.filter((g) => {
    if (selectedCategory === 'ALL') return true;
    return g.category === selectedCategory;
  });

  const handleLaunchGame = (game: CasinoGame) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setActiveGame(game);
    setRoundPhase('BETTING');
    setRoundTimeLeft(15);
    setPlacedBets([]);
  };

  const handlePlaceTableBet = (side: string, name: string, odds: number) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (roundPhase !== 'BETTING') return;
    if (selectedStake > user.availableCredit) {
      alert('Insufficient wallet balance.');
      return;
    }

    const newBet = { side, name, odds, stake: selectedStake };
    setPlacedBets((prev) => [...prev, newBet]);
    setSelectedBetSide(side);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-[#130d24] to-slate-950 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Live Indian Exchange Games (ShivExch & Evolution)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                24/7 Sub-Second Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              TEEN PATTI T20 • DRAGON TIGER • LUCKY 7 • AMAR AKBAR ANTHONY
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Authentic Indian dealer exchange card rooms with 20-second live rounds, Pair Plus side multipliers, and instant automated ledger settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={onOpenCashier}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-[#f36c21] hover:brightness-110 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center space-x-2 transition-all"
              >
                <DollarSign className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-[#f36c21] hover:brightness-110 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center space-x-2 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Sign In to Join Table</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#f36c21] text-white shadow-lg shadow-orange-600/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="group relative rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-[#f36c21]/60 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col"
          >
            {/* Image Thumbnail & Overlay */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={game.thumbnailUrl}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-black/80 text-amber-300 border border-amber-500/30">
                  {game.provider}
                </span>
                {game.isHot && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#FF4148] text-white flex items-center gap-0.5 animate-pulse">
                    <Flame className="w-3 h-3" /> HOT
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-emerald-400 flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{game.livePlayers.toLocaleString()}</span>
              </div>

              {/* Play Overlay Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => handleLaunchGame(game)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f36c21] to-amber-500 hover:brightness-110 text-black font-black text-xs shadow-xl flex items-center space-x-2 transform scale-90 group-hover:scale-100 transition-transform"
                >
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Launch Live Table</span>
                </button>
              </div>
            </div>

            {/* Bottom Card Content */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors truncate">
                  {game.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <div>
                  Min: <strong className="text-slate-200 font-bold">₹{game.minBet}</strong>
                </div>
                <div>
                  Max: <strong className="text-slate-200 font-bold">₹{game.maxBet.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE LIVE TABLE MODAL (With Live Round Simulation & Betting Grid) */}
      {/* ========================================================================= */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
          <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0d111d] border border-slate-800 shadow-2xl flex flex-col max-h-[95vh] text-white">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#080c16] border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#f36c21] text-black">
                  {activeGame.provider} Live
                </span>
                <h3 className="text-sm font-black text-white">{activeGame.name}</h3>
                <span className="hidden sm:inline text-xs text-slate-400 font-mono">Round #{roundId}</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                  Wallet: ₹{user ? user.availableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Game Canvas Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Live Round Header & Video Stream Simulation */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#12192b] via-[#0d111e] to-black border border-slate-800 p-4 sm:p-6 overflow-hidden shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Round Status */}
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950">
                    <span className={`font-mono font-black text-xl ${roundTimeLeft <= 3 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>
                      {roundTimeLeft}s
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        roundPhase === 'BETTING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        roundPhase === 'DEALING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-purple-950 text-purple-400 border border-purple-800'
                      }`}>
                        {roundPhase === 'BETTING' ? '● Betting Open' : roundPhase === 'DEALING' ? '🃏 Cards Dealing' : '🏆 Winner Declared'}
                      </span>
                    </div>
                    <h4 className="font-black text-base text-white mt-1">
                      {roundPhase === 'BETTING' ? 'Place Your Bets on Board' : roundPhase === 'DEALING' ? 'Evaluating Hands...' : `Round Winner: ${lastWinner || 'Player A'}`}
                    </h4>
                  </div>
                </div>

                {/* Right: Last 10 Results Bar */}
                <div className="flex flex-col items-center sm:items-end space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Recent Results</span>
                  <div className="flex space-x-1">
                    {roundHistory.map((res, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] font-mono shadow ${
                          res === 'A' || res === 'D' || res === 'L' ? 'bg-blue-600 text-white' :
                          res === 'B' || res === 'T' || res === 'H' ? 'bg-red-600 text-white' :
                          'bg-amber-500 text-black'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* BETTING BOARD GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wide">Live Odds Board</span>
                  <span className="text-[10px] text-slate-400">Click any odds box to stake</span>
                </div>

                {/* Teen Patti / Cards Board Layout */}
                {(activeGame.gameCode === 't20' || activeGame.gameCode === 'oneday' || activeGame.gameCode === 'poker') && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('PLAYER_A', 'Player A Win', 1.98)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        selectedBetSide === 'PLAYER_A'
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-black block uppercase text-blue-400">Player A</span>
                      <span className="font-mono font-black text-lg text-white">1.98</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('PLAYER_B', 'Player B Win', 1.98)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        selectedBetSide === 'PLAYER_B'
                          ? 'bg-red-600 border-red-400 text-white shadow-lg'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-black block uppercase text-red-400">Player B</span>
                      <span className="font-mono font-black text-lg text-white">1.98</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('PAIR_PLUS_A', 'Pair Plus (Player A)', 3.50)}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center"
                    >
                      <span className="text-xs font-bold block text-amber-400">Pair Plus A</span>
                      <span className="font-mono font-bold text-lg text-slate-200">3.50</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('PAIR_PLUS_B', 'Pair Plus (Player B)', 3.50)}
                      className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-center"
                    >
                      <span className="text-xs font-bold block text-amber-400">Pair Plus B</span>
                      <span className="font-mono font-bold text-lg text-slate-200">3.50</span>
                    </button>
                  </div>
                )}

                {/* Dragon Tiger Layout */}
                {activeGame.gameCode === 'dt6' && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('DRAGON', 'Dragon Win', 1.98)}
                      className="p-4 rounded-2xl bg-gradient-to-b from-blue-950 to-slate-900 border border-blue-600/50 hover:border-blue-400 text-center shadow"
                    >
                      <span className="text-sm font-black block uppercase text-blue-400">🐉 Dragon</span>
                      <span className="font-mono font-black text-xl text-white">1.98</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('TIE', 'Tie Hand', 9.00)}
                      className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950 to-slate-900 border border-emerald-600/50 hover:border-emerald-400 text-center shadow"
                    >
                      <span className="text-sm font-black block uppercase text-emerald-400">🤝 Tie (9x)</span>
                      <span className="font-mono font-black text-xl text-white">9.00</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('TIGER', 'Tiger Win', 1.98)}
                      className="p-4 rounded-2xl bg-gradient-to-b from-red-950 to-slate-900 border border-red-600/50 hover:border-red-400 text-center shadow"
                    >
                      <span className="text-sm font-black block uppercase text-red-400">🐅 Tiger</span>
                      <span className="font-mono font-black text-xl text-white">1.98</span>
                    </button>
                  </div>
                )}

                {/* Lucky 7 (7 Up 7 Down) Layout */}
                {activeGame.gameCode === 'lucky7eu' && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('LOW_7', 'Low (1-6)', 2.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-blue-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-blue-400">🔻 Low (1 to 6)</span>
                      <span className="font-mono font-black text-xl text-white">2.00</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('EXACT_7', 'Exact 7 (11x)', 11.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-amber-400">⭐ Exact 7</span>
                      <span className="font-mono font-black text-xl text-white">11.00</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('HIGH_7', 'High (8-12)', 2.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-red-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-red-400">🔺 High (8 to 12)</span>
                      <span className="font-mono font-black text-xl text-white">2.00</span>
                    </button>
                  </div>
                )}

                {/* Amar Akbar Anthony Layout */}
                {activeGame.gameCode === 'aaa' && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('AMAR', 'Amar (1 to 6)', 2.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-emerald-400">Amar (1-6)</span>
                      <span className="font-mono font-black text-xl text-white">2.00</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('AKBAR', 'Akbar (7 to 10)', 3.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-amber-400">Akbar (7-10)</span>
                      <span className="font-mono font-black text-xl text-white">3.00</span>
                    </button>

                    <button
                      disabled={roundPhase !== 'BETTING'}
                      onClick={() => handlePlaceTableBet('ANTHONY', 'Anthony (J, Q, K)', 4.00)}
                      className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/50 text-center"
                    >
                      <span className="text-sm font-black block uppercase text-purple-400">Anthony (J/Q/K)</span>
                      <span className="font-mono font-black text-xl text-white">4.00</span>
                    </button>
                  </div>
                )}
              </div>

              {/* STAKE SELECTOR RIBBON */}
              <div className="p-3 bg-[#080c16] rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Stake Amount:</span>
                  <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
                    {quickStakes.map((stk) => (
                      <button
                        key={stk}
                        type="button"
                        onClick={() => setSelectedStake(stk)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedStake === stk
                            ? 'bg-[#f36c21] text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        ₹{stk >= 1000 ? `${stk / 1000}k` : stk}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickStakeModalOpen(true)}
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                    title="Edit quick stake values"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Placed Bets Summary */}
                <div className="text-xs text-right">
                  <span className="text-slate-400">Active Bets: </span>
                  <span className="font-mono font-bold text-amber-400">
                    {placedBets.length} (₹{placedBets.reduce((acc, b) => acc + b.stake, 0).toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stakes Modal */}
      <QuickStakeModal
        isOpen={isQuickStakeModalOpen}
        onClose={() => setIsQuickStakeModalOpen(false)}
        onSave={(newStakes) => setQuickStakes(newStakes)}
      />
    </div>
  );
};
