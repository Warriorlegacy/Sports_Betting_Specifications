import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle2, DollarSign, Zap, Sliders, ArrowRight, XCircle } from 'lucide-react';
import { BetSlipItem } from '../types/sportsbook';
import { UserBet } from './MyBets';
import { getSavedQuickStakes, QuickStakeModal } from './QuickStakeModal';

interface FairplayBetSlipProps {
  betItems: BetSlipItem[];
  openBets?: UserBet[];
  onUpdateStake: (index: number, stake: number) => void;
  onUpdatePrice: (index: number, price: number) => void;
  onRemoveBet: (index: number) => void;
  onClearBets: () => void;
  onPlaceBets: () => void;
  onCancelOpenBet?: (betId: string) => void;
  isPlacing: boolean;
  userBalance: number;
  openBetsCount: number;
  onViewMyBets: () => void;
  oneClickBet: boolean;
  user?: any | null;
  onOpenLogin?: () => void;
}

export const FairplayBetSlip: React.FC<FairplayBetSlipProps> = ({
  betItems,
  openBets = [],
  onUpdateStake,
  onUpdatePrice,
  onRemoveBet,
  onClearBets,
  onPlaceBets,
  onCancelOpenBet,
  isPlacing,
  userBalance,
  openBetsCount,
  onViewMyBets,
  oneClickBet,
  user,
  onOpenLogin
}) => {
  const [activeTab, setActiveTab] = useState<'BET_SLIP' | 'OPEN_BETS'>('BET_SLIP');
  const [quickStakes, setQuickStakes] = useState<number[]>(getSavedQuickStakes());
  const [isQuickStakeModalOpen, setIsQuickStakeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setQuickStakes(getSavedQuickStakes());
  }, []);

  // Auto switch tab if a new bet is added to slip
  useEffect(() => {
    if (betItems.length > 0) {
      setActiveTab('BET_SLIP');
    }
  }, [betItems.length]);

  const totalLiability = betItems.reduce((acc, bet) => {
    if (bet.type === 'BACK') return acc + (bet.stake || 0);
    return acc + (bet.stake || 0) * ((bet.price || 1) - 1);
  }, 0);

  const totalProfit = betItems.reduce((acc, bet) => {
    if (bet.type === 'BACK') return acc + (bet.stake || 0) * ((bet.price || 1) - 1);
    return acc + (bet.stake || 0);
  }, 0);

  const hasInsufficientCredit = totalLiability > userBalance;
  const activeOpenBets = openBets.filter((b) => b.status === 'MATCHED' || b.status === 'UNMATCHED' || b.status === 'PARTIALLY_MATCHED');

  return (
    <div className="w-full lg:w-80 shrink-0 bg-[#1e1e1e] rounded-md border border-[#2d2d2d] overflow-hidden flex flex-col shadow select-none text-xs">
      {/* 1. BET SLIP TABS (Fairplay & Rudra888 Style: Bet Slip | Open Bets | Edit Stakes) */}
      <div className="bg-[#272727] flex items-center border-b border-[#333]">
        <button
          onClick={() => setActiveTab('BET_SLIP')}
          className={`flex-1 py-2.5 text-center font-black text-[11px] uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'BET_SLIP'
              ? 'border-[#f36c21] text-[#f36c21] bg-[#1e1e1e]'
              : 'border-transparent text-[#adadad] hover:text-white'
          }`}
        >
          Bet Slip ({betItems.length})
        </button>
        <button
          onClick={() => setActiveTab('OPEN_BETS')}
          className={`flex-1 py-2.5 text-center font-black text-[11px] uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'OPEN_BETS'
              ? 'border-[#f36c21] text-[#f36c21] bg-[#1e1e1e]'
              : 'border-transparent text-[#adadad] hover:text-white'
          }`}
        >
          Open ({openBetsCount || activeOpenBets.length})
        </button>
        <button
          type="button"
          onClick={() => setIsQuickStakeModalOpen(true)}
          className="px-3 py-2.5 text-center font-bold text-[10px] uppercase text-amber-400 hover:text-amber-300 hover:bg-[#333] transition-colors border-b-2 border-transparent flex items-center justify-center gap-1 cursor-pointer"
        >
          <Sliders className="w-3 h-3 text-[#f36c21]" />
          <span>Edit Stakes</span>
        </button>
      </div>

      {/* 2. BODY CONTENT: BET SLIP OR OPEN BETS */}
      {activeTab === 'BET_SLIP' ? (
        <div className="p-3 flex-1 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto">
          {betItems.length === 0 ? (
            <div className="py-12 text-center text-[#8e8e8e] space-y-2">
              <Zap className="w-8 h-8 mx-auto text-[#f36c21]/60" />
              <p className="font-bold text-xs text-white">Your bet slip is empty</p>
              <p className="text-[11px]">Click on any Back (Blue) or Lay (Pink) odds to place a bet</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-1 border-b border-[#2d2d2d]">
                <span className="text-[11px] text-[#adadad]">Exchange Order</span>
                <button
                  onClick={onClearBets}
                  className="text-[10px] text-[#FF4148] hover:underline font-bold cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {betItems.map((bet, index) => {
                const isBack = bet.type === 'BACK';
                const liability = isBack ? bet.stake : bet.stake * (bet.price - 1);
                const profit = isBack ? bet.stake * (bet.price - 1) : bet.stake;

                return (
                  <div
                    key={`${bet.marketId}-${bet.selectionId}-${index}`}
                    className={`p-2.5 rounded border flex flex-col gap-2 ${
                      isBack
                        ? 'bg-blue-950/20 border-blue-600/40'
                        : 'bg-pink-950/20 border-pink-600/40'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            isBack ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                          }`}
                        >
                          {bet.type}
                        </span>
                        <h5 className="font-black text-white text-xs mt-1">{bet.selectionName}</h5>
                        <span className="text-[10px] text-[#adadad]">{bet.eventName}</span>
                      </div>
                      <button
                        onClick={() => onRemoveBet(index)}
                        className="text-[#adadad] hover:text-[#FF4148] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Odds & Stake Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#adadad] block mb-0.5 font-bold">Odds</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bet.price}
                          onChange={(e) => onUpdatePrice(index, parseFloat(e.target.value) || 1.01)}
                          className="w-full bg-[#141414] border border-[#333] rounded px-2 py-1 text-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#adadad] block mb-0.5 font-bold">Stake (₹)</label>
                        <input
                          type="number"
                          step="10"
                          value={bet.stake}
                          onChange={(e) => onUpdateStake(index, parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#141414] border border-[#333] rounded px-2 py-1 text-white font-mono font-bold text-xs"
                        />
                      </div>
                    </div>

                    {/* Quick Stake Buttons */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-[#8e8e8e]">
                        <span>Quick Add Stake:</span>
                        <button
                          type="button"
                          onClick={() => setIsQuickStakeModalOpen(true)}
                          className="text-[#f36c21] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Sliders className="w-2.5 h-2.5" />
                          <span>Edit Values</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {quickStakes.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => onUpdateStake(index, (bet.stake || 0) + amt)}
                            className="py-1 rounded bg-[#272727] hover:bg-[#333] text-[10px] font-mono font-bold text-[#adadad] hover:text-white transition-colors cursor-pointer"
                          >
                            +{amt >= 1000 ? `${amt / 1000}k` : amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Return Summary */}
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-[#333]/50">
                      <span className="text-[#adadad]">
                        {isBack ? 'Profit:' : 'Liability:'}{' '}
                        <span className={isBack ? 'text-[#27AE60] font-mono font-bold' : 'text-[#FF4148] font-mono font-bold'}>
                          ₹{isBack ? profit.toFixed(2) : liability.toFixed(2)}
                        </span>
                      </span>
                      <span className="text-[#adadad]">
                        Payout:{' '}
                        <span className="text-white font-mono font-bold">
                          ₹{(bet.stake + (isBack ? profit : 0)).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : (
        /* OPEN BETS TAB BODY */
        <div className="p-3 flex-1 flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          {activeOpenBets.length === 0 ? (
            <div className="py-12 text-center text-[#8e8e8e] space-y-3">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#27AE60]/60" />
              <p className="font-bold text-xs text-white">No Open Bets</p>
              <p className="text-[11px] text-[#adadad]">You have no active unmatched or matched bets running.</p>
              <button
                onClick={() => setActiveTab('BET_SLIP')}
                className="px-3 py-1.5 rounded bg-[#272727] hover:bg-[#333] text-[#f36c21] font-bold text-xs cursor-pointer"
              >
                Place a New Bet
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-1 border-b border-[#2d2d2d]">
                <span className="text-[11px] font-bold text-white">Active Positions ({activeOpenBets.length})</span>
                <button
                  onClick={onViewMyBets}
                  className="text-[10px] text-[#f36c21] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  Full History <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {activeOpenBets.map((bet) => {
                const isBack = bet.type === 'BACK';
                const isMatched = bet.status === 'MATCHED';

                return (
                  <div
                    key={bet.id}
                    className={`p-2.5 rounded border flex flex-col gap-1.5 ${
                      isBack ? 'bg-blue-950/20 border-blue-600/30' : 'bg-pink-950/20 border-pink-600/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                              isBack ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                            }`}
                          >
                            {bet.type}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                              isMatched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {bet.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-xs mt-1">{bet.selectionName}</h5>
                        <p className="text-[10px] text-[#adadad] truncate max-w-[180px]">{bet.eventName}</p>
                      </div>

                      {onCancelOpenBet && bet.status === 'UNMATCHED' && (
                        <button
                          onClick={() => onCancelOpenBet(bet.id)}
                          className="text-[#FF4148] hover:bg-[#FF4148]/10 p-1 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                          title="Cancel Unmatched Order"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1.5 rounded text-[10px] font-mono">
                      <div>
                        <span className="text-[#8e8e8e] block text-[9px]">Odds</span>
                        <span className="text-white font-bold">{bet.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[#8e8e8e] block text-[9px]">Stake</span>
                        <span className="text-white font-bold">₹{bet.stake}</span>
                      </div>
                      <div>
                        <span className="text-[#8e8e8e] block text-[9px]">Liability</span>
                        <span className="text-[#FF4148] font-bold">₹{bet.liability?.toFixed(2) || bet.stake}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. BET SLIP FOOTER */}
      {activeTab === 'BET_SLIP' && betItems.length > 0 && (
        <div className="p-3 bg-[#181818] border-t border-[#2d2d2d] space-y-2">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[#adadad]">
              <span>Total Liability:</span>
              <span className="font-mono font-black text-[#FF4148]">₹{totalLiability.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#adadad]">
              <span>Potential Net Profit:</span>
              <span className="font-mono font-black text-[#27AE60]">₹{totalProfit.toFixed(2)}</span>
            </div>
          </div>

          {hasInsufficientCredit && (
            <div className="p-2 rounded bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-[10px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Insufficient wallet credit to cover liability.</span>
            </div>
          )}

          {/* Place Bet Button (Fairplay style) */}
          {!user ? (
            <button
              onClick={onOpenLogin || onPlaceBets}
              className="w-full py-2.5 rounded bg-gradient-to-r from-[#f36c21] to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <span>🔒</span>
              <span>Login / Register to Place Bet</span>
            </button>
          ) : (
            <button
              onClick={onPlaceBets}
              disabled={isPlacing || hasInsufficientCredit || betItems.length === 0}
              className="w-full py-2.5 rounded bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer active:scale-98"
            >
              {isPlacing ? 'Submitting to Engine...' : `Place Bet (₹${totalLiability.toFixed(2)})`}
            </button>
          )}
        </div>
      )}

      {/* Customizable Quick Stake Buttons Modal */}
      <QuickStakeModal
        isOpen={isQuickStakeModalOpen}
        onClose={() => setIsQuickStakeModalOpen(false)}
        onSave={(newStakes) => setQuickStakes(newStakes)}
      />
    </div>
  );
};
