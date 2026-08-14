import React, { useState } from 'react';
import { Layers, XCircle, CheckCircle2, History } from 'lucide-react';

export interface UserBet {
  id: string;
  marketId: string;
  eventName: string;
  selectionId: number;
  selectionName: string;
  type: 'BACK' | 'LAY';
  price: number;
  stake: number;
  matchedStake: number;
  unmatchedStake: number;
  liability: number;
  status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' | 'SETTLED' | 'CANCELLED';
  pnl: number;
  createdAt: string;
}

interface MyBetsProps {
  bets: UserBet[];
  onCancelBet: (betId: string) => Promise<void>;
  onRefresh: () => void;
}

export const MyBets: React.FC<MyBetsProps> = ({ bets, onCancelBet, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'UNMATCHED' | 'MATCHED' | 'SETTLED'>('UNMATCHED');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const unmatchedBets = bets.filter((b) => b.status === 'UNMATCHED' || b.status === 'PARTIALLY_MATCHED');
  const matchedBets = bets.filter((b) => b.status === 'MATCHED');
  const settledBets = bets.filter((b) => b.status === 'SETTLED');

  const displayedBets =
    activeTab === 'UNMATCHED' ? unmatchedBets : activeTab === 'MATCHED' ? matchedBets : settledBets;

  const handleCancel = async (betId: string) => {
    try {
      setCancellingId(betId);
      await onCancelBet(betId);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel bet');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-4">
        <button
          type="button"
          onClick={() => setActiveTab('UNMATCHED')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'UNMATCHED'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Unmatched Orders ({unmatchedBets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MATCHED')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'MATCHED'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Matched Bets ({matchedBets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SETTLED')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'SETTLED'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Settled History ({settledBets.length})</span>
        </button>
      </div>

      {/* Bets List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Runner</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5 text-center">Odds</th>
              <th className="px-4 py-2.5 text-right">Stake</th>
              <th className="px-4 py-2.5 text-right">Matched</th>
              <th className="px-4 py-2.5 text-right">Liability</th>
              {activeTab === 'SETTLED' && <th className="px-4 py-2.5 text-right">PnL</th>}
              {activeTab === 'UNMATCHED' && <th className="px-4 py-2.5 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {displayedBets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  No {activeTab.toLowerCase()} orders found.
                </td>
              </tr>
            ) : (
              displayedBets.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-200 block truncate max-w-[150px]">
                      {b.selectionName}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[150px]">
                      {b.eventName}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.type === 'BACK'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'bg-pink-600/20 text-pink-300 border border-pink-500/30'
                      }`}
                    >
                      {b.type}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center mono-num font-bold text-slate-200">
                    {b.price.toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-right mono-num font-bold text-slate-200">
                    ₹{b.stake.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right mono-num font-bold text-slate-400">
                    ₹{b.matchedStake.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right mono-num font-bold text-rose-400">
                    ₹{b.liability.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  {activeTab === 'SETTLED' && (
                    <td
                      className={`px-4 py-3 text-right mono-num font-black ${
                        b.pnl > 0 ? 'text-emerald-400' : b.pnl < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {b.pnl > 0 ? `+₹${b.pnl.toFixed(2)}` : b.pnl < 0 ? `-₹${Math.abs(b.pnl).toFixed(2)}` : '₹0.00'}
                    </td>
                  )}

                  {activeTab === 'UNMATCHED' && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
