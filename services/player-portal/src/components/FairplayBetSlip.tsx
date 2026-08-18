import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle, CheckCircle2, DollarSign, Zap, Sliders } from 'lucide-react';
import { BetSlipItem } from '../types/sportsbook';
import { getSavedQuickStakes, QuickStakeModal } from './QuickStakeModal';

interface FairplayBetSlipProps {
  betItems: BetSlipItem[];
  onUpdateStake: (index: number, stake: number) => void;
  onUpdatePrice: (index: number, price: number) => void;
  onRemoveBet: (index: number) => void;
  onClearBets: () => void;
  onPlaceBets: () => void;
  isPlacing: boolean;
  userBalance: number;
  openBetsCount: number;
  onViewMyBets: () => void;
  oneClickBet: boolean;
}

export const FairplayBetSlip: React.FC<FairplayBetSlipProps> = ({
  betItems,
  onUpdateStake,
  onUpdatePrice,
  onRemoveBet,
  onClearBets,
  onPlaceBets,
  isPlacing,
  userBalance,
  openBetsCount,
  onViewMyBets,
  oneClickBet
}) => {
  const [activeTab, setActiveTab] = useState<'BET_SLIP' | 'OPEN_BETS'>('BET_SLIP');
  const [quickStakes, setQuickStakes] = useState<number[]>(getSavedQuickStakes());
  const [isQuickStakeModalOpen, setIsQuickStakeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setQuickStakes(getSavedQuickStakes());
  }, []);

  const totalLiability = betItems.reduce((acc, bet) => {
    if (bet.type === 'BACK') return acc + (bet.stake || 0);
    return acc + (bet.stake || 0) * ((bet.price || 1) - 1);
  }, 0);

  const totalProfit = betItems.reduce((acc, bet) => {
    if (bet.type === 'BACK') return acc + (bet.stake || 0) * ((bet.price || 1) - 1);
    return acc + (bet.stake || 0);
  }, 0);

  const hasInsufficientCredit = totalLiability > userBalance;

  return (
    <div className="w-full lg:w-80 shrink-0 bg-[#1e1e1e] rounded-md border border-[#2d2d2d] overflow-hidden flex flex-col shadow select-none text-xs">
      {/* 1. BET SLIP TABS (Fairplay Style) */}
      <div className="bg-[#272727] flex items-center border-b border-[#333]">
        <button
          onClick={() => setActiveTab('BET_SLIP')}
          className={`flex-1 py-2.5 text-center font-black text-xs uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'BET_SLIP'
              ? 'border-[#f36c21] text-[#f36c21] bg-[#1e1e1e]'
              : 'border-transparent text-[#adadad] hover:text-white'
          }`}
        >
          Bet Slip ({betItems.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('OPEN_BETS');
            onViewMyBets();
          }}
          className={`flex-1 py-2.5 text-center font-black text-xs uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'OPEN_BETS'
              ? 'border-[#f36c21] text-[#f36c21] bg-[#1e1e1e]'
              : 'border-transparent text-[#adadad] hover:text-white'
          }`}
        >
          Open Bets ({openBetsCount})
        </button>
      </div>

      {/* 2. BET SLIP ITEMS BODY */}
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
                className="text-[10px] text-[#FF4148] hover:underline font-bold"
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
                      className="text-[#adadad] hover:text-[#FF4148] p-1"
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
                        className="text-[#f36c21] hover:underline font-bold flex items-center gap-0.5"
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
                          className="py-1 rounded bg-[#272727] hover:bg-[#333] text-[10px] font-mono font-bold text-[#adadad] hover:text-white transition-colors"
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

      {/* 3. BET SLIP FOOTER */}
      {betItems.length > 0 && (
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
          <button
            onClick={onPlaceBets}
            disabled={isPlacing || hasInsufficientCredit || betItems.length === 0}
            className="w-full py-2.5 rounded bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
          >
            {isPlacing ? 'Submitting to Engine...' : `Place Bet (₹${totalLiability.toFixed(2)})`}
          </button>
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
