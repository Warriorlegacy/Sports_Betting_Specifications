import React from 'react';
import {
  Flame,
  Trophy,
  Sparkles,
  Layers,
  FileText,
  User,
  Smartphone,
  DollarSign
} from 'lucide-react';

interface MobileBottomNavProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  openBetsCount: number;
  betSlipCount: number;
  onToggleBetSlip: () => void;
  onOpenAppDownload: () => void;
  onOpenCashier: () => void;
  user: any | null;
  onOpenLogin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNavTab,
  setActiveNavTab,
  openBetsCount,
  betSlipCount,
  onToggleBetSlip,
  onOpenAppDownload,
  onOpenCashier,
  user,
  onOpenLogin
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161616]/95 backdrop-blur-md border-t border-[#2d2d2d] px-2 py-1.5 flex items-center justify-around text-[10px] font-bold text-[#adadad] select-none pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-2xl">
      {/* 1. In-Play */}
      <button
        onClick={() => setActiveNavTab('inplay')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeNavTab === 'inplay' ? 'text-[#f36c21]' : 'hover:text-white'
        }`}
      >
        <Flame className={`w-5 h-5 ${activeNavTab === 'inplay' ? 'fill-[#f36c21] text-[#f36c21]' : ''}`} />
        <span className="mt-0.5">In-Play</span>
      </button>

      {/* 2. Sportsbook */}
      <button
        onClick={() => setActiveNavTab('sportbook')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeNavTab === 'sportbook' ? 'text-[#f36c21]' : 'hover:text-white'
        }`}
      >
        <Trophy className={`w-5 h-5 ${activeNavTab === 'sportbook' ? 'text-[#f36c21]' : ''}`} />
        <span className="mt-0.5">Sports</span>
      </button>

      {/* 3. CENTER FLOATING BET SLIP BUTTON */}
      <button
        onClick={onToggleBetSlip}
        className="relative -mt-6 flex flex-col items-center justify-center group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f36c21] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 transform active:scale-95 transition-transform border-2 border-[#161616]">
          <FileText className="w-5 h-5" />
          {betSlipCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF4148] text-white text-[10px] font-mono font-black flex items-center justify-center shadow-md animate-bounce">
              {betSlipCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-black text-white uppercase mt-0.5 tracking-tight">Bet Slip</span>
      </button>

      {/* 4. Live Casino */}
      <button
        onClick={() => setActiveNavTab('live_casino')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
          activeNavTab === 'live_casino' ? 'text-[#f36c21]' : 'hover:text-white'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${activeNavTab === 'live_casino' ? 'text-[#f36c21]' : ''}`} />
        <span className="mt-0.5">Casino</span>
      </button>

      {/* 5. Matka or Wallet */}
      {user ? (
        <button
          onClick={onOpenCashier}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#27AE60] hover:brightness-110"
        >
          <DollarSign className="w-5 h-5" />
          <span className="mt-0.5 font-mono">₹{user.availableCredit >= 1000 ? `${(user.availableCredit / 1000).toFixed(1)}k` : user.availableCredit}</span>
        </button>
      ) : (
        <button
          onClick={onOpenLogin}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#f36c21] hover:text-white"
        >
          <User className="w-5 h-5" />
          <span className="mt-0.5">Login</span>
        </button>
      )}
    </div>
  );
};
