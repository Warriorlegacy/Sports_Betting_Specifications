import React, { useState } from 'react';
import { Sparkles, Play, Shield, Users, Flame, ChevronRight, X, Maximize2, Trophy, DollarSign } from 'lucide-react';

interface CasinoGame {
  id: string;
  name: string;
  provider: 'Evolution' | 'Ezugi' | 'Pragmatic Live' | 'Dream Gaming';
  category: 'INDIAN' | 'ROULETTE' | 'CARDS' | 'GAMESHOW';
  thumbnailUrl: string;
  minBet: number;
  maxBet: number;
  livePlayers: number;
  isHot?: boolean;
}

const CASINO_GAMES: CasinoGame[] = [
  {
    id: 'andar_bahar',
    name: 'Super Andar Bahar Live',
    provider: 'Evolution',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 100000,
    livePlayers: 2840,
    isHot: true
  },
  {
    id: 'teen_patti',
    name: 'Teen Patti 20-20 Live',
    provider: 'Ezugi',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 50000,
    livePlayers: 1920,
    isHot: true
  },
  {
    id: 'dragon_tiger',
    name: 'Dragon Tiger Live',
    provider: 'Evolution',
    category: 'CARDS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 200000,
    livePlayers: 3410,
    isHot: true
  },
  {
    id: 'lightning_roulette',
    name: 'Lightning Roulette (500x)',
    provider: 'Evolution',
    category: 'ROULETTE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80',
    minBet: 20,
    maxBet: 500000,
    livePlayers: 5120,
    isHot: true
  },
  {
    id: 'crazy_time',
    name: 'Crazy Time Game Show',
    provider: 'Evolution',
    category: 'GAMESHOW',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    minBet: 10,
    maxBet: 250000,
    livePlayers: 8930,
    isHot: true
  },
  {
    id: 'hindi_roulette',
    name: 'Namaste Hindi Roulette',
    provider: 'Ezugi',
    category: 'ROULETTE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 150000,
    livePlayers: 1420
  },
  {
    id: 'speed_baccarat',
    name: 'Speed Baccarat VIP',
    provider: 'Pragmatic Live',
    category: 'CARDS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 500000,
    livePlayers: 1640
  },
  {
    id: 'lucky7',
    name: 'Lucky 7 Live (7 Up 7 Down)',
    provider: 'Ezugi',
    category: 'INDIAN',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80',
    minBet: 50,
    maxBet: 50000,
    livePlayers: 2150
  },
  {
    id: 'infinite_blackjack',
    name: 'Infinite Blackjack Live',
    provider: 'Evolution',
    category: 'CARDS',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    minBet: 100,
    maxBet: 300000,
    livePlayers: 2790
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

  const categories = [
    { id: 'ALL', label: '🌟 All Live Tables' },
    { id: 'INDIAN', label: '🇮🇳 Indian Desi Games' },
    { id: 'ROULETTE', label: '🎡 Live Roulette' },
    { id: 'CARDS', label: '🃏 Baccarat & Cards' },
    { id: 'GAMESHOW', label: '🎪 Crazy Game Shows' }
  ];

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
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Live Dealer Casino (Evolution & Ezugi)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                24/7 HD Streams
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              ANDAR BAHAR • TEEN PATTI • LIGHTNING ROULETTE
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Play with real interactive dealers in Hindi and English with instant wallet balance integration and automated round settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={onOpenCashier}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center space-x-2 transition-all"
              >
                <DollarSign className="w-4 h-4" />
                <span>Deposit to Play</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center space-x-2 transition-all"
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
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="group relative rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col"
          >
            {/* Image Thumbnail & Overlay */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={game.thumbnailUrl}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Provider & Hot Badge */}
              <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-950/80 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                  {game.provider}
                </span>
                {game.isHot && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/80 text-white flex items-center space-x-1 shadow-lg">
                    <Flame className="w-3 h-3" />
                    <span>HOT</span>
                  </span>
                )}
              </div>

              {/* Live Players Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{game.livePlayers.toLocaleString()} Online</span>
              </div>

              {/* Play Overlay Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => handleLaunchGame(game)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/40 flex items-center space-x-2 transform scale-90 group-hover:scale-100 transition-transform"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Live Table</span>
                </button>
              </div>
            </div>

            {/* Bottom Card Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                  {game.name}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <div>
                  Min: <strong className="text-slate-200">₹{game.minBet}</strong>
                </div>
                <div>
                  Max: <strong className="text-slate-200">₹{game.maxBet.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Game Frame Modal */}
      {activeGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {activeGame.provider} Live
                </span>
                <h3 className="text-sm sm:text-base font-black text-white">{activeGame.name}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                  Balance: ₹{user ? user.availableCredit.toLocaleString() : '0'}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Live Stream / Game Simulation Frame */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-xl font-black text-white">{activeGame.name} Table Connected</h4>
                <p className="text-xs text-slate-400 font-medium">
                  Live dealer feed initialized with instant wallet bet placement. Minimum bet ₹{activeGame.minBet}, Maximum bet ₹{activeGame.maxBet.toLocaleString()}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all"
                >
                  Return to Lobby
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
