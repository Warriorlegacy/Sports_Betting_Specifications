import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Percent,
  Coins,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Wallet,
  ShieldCheck
} from 'lucide-react';

export interface LedgerEntry {
  id: string;
  senderId: string | null;
  senderUsername: string;
  receiverId: string | null;
  receiverUsername: string;
  amount: number;
  transactionType: string;
  referenceId: string;
  notes: string | null;
  createdAt: string;
}

interface LedgerTableProps {
  entries: LedgerEntry[];
  onRefresh: () => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'LEDGER' | 'WITHDRAWALS'>('LEDGER');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sports-exchange-backend-j1aj.onrender.com';

    try {
      const res = await fetch(`${apiUrl}/api/ledger/withdrawals?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.error('Failed to load withdrawals', e);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'WITHDRAWALS') {
      fetchWithdrawals();
    }
  }, [activeSubTab]);

  const handleProcessWithdrawal = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sports-exchange-backend-j1aj.onrender.com';

    try {
      const res = await fetch(`${apiUrl}/api/ledger/withdrawals/${id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          referenceId: `TX_${action}_${Date.now()}`,
          notes: action === 'APPROVE' ? 'Approved & Dispatched by Operator' : 'Rejected by Operator'
        })
      });

      if (res.ok) {
        await fetchWithdrawals();
        onRefresh();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to process withdrawal');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deposit</span>
          </span>
        );
      case 'WITHDRAWAL_PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Withdraw Pending</span>
          </span>
        );
      case 'WITHDRAWAL_COMPLETED':
      case 'WITHDRAWAL_APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Withdraw Paid</span>
          </span>
        );
      case 'WITHDRAWAL_REFUND':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdraw Refund</span>
          </span>
        );
      case 'CREDIT_ALLOCATION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Allocation</span>
          </span>
        );
      case 'CREDIT_RECALL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Recall</span>
          </span>
        );
      case 'BET_SETTLEMENT_WIN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Win Payout</span>
          </span>
        );
      case 'COMMISSION_RAKE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Percent className="w-3.5 h-3.5" />
            <span>Commission Rake</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <Coins className="w-3.5 h-3.5" />
            <span>{type}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-xl gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-[#f36c21]/30 flex items-center justify-center shadow-lg shadow-orange-600/20">
            <BookOpen className="w-5 h-5 text-[#f36c21]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Financial & Ledger Management</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                Audited
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Tamper-evident transactions, deposits & payout approval queue</p>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('LEDGER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'LEDGER'
                ? 'bg-[#f36c21] text-white shadow-md shadow-orange-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ledger Trail</span>
          </button>
          <button
            onClick={() => setActiveSubTab('WITHDRAWALS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'WITHDRAWALS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Withdrawals Queue</span>
          </button>
          <button
            onClick={() => {
              onRefresh();
              if (activeSubTab === 'WITHDRAWALS') fetchWithdrawals();
            }}
            title="Refresh Ledger"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#242424]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: IMMUTABLE LEDGER ENTRIES */}
      {activeSubTab === 'LEDGER' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#1e1e1e] shadow-xl">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#141414] text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Sender</th>
                <th className="px-5 py-3.5">Receiver</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium text-xs">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                    No ledger entries recorded yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#262626] transition-colors">
                    <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{getTypeBadge(entry.transactionType)}</td>
                    <td className="px-5 py-3.5 text-xs text-white font-bold">{entry.senderUsername}</td>
                    <td className="px-5 py-3.5 text-xs text-white font-bold">{entry.receiverUsername}</td>
                    <td className="px-5 py-3.5 text-right font-black font-mono text-white">
                      ₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono">{entry.referenceId}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 max-w-xs truncate" title={entry.notes || ''}>
                      {entry.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-VIEW 2: WITHDRAWALS APPROVAL QUEUE */}
      {activeSubTab === 'WITHDRAWALS' && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#1e1e1e] shadow-xl">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#141414] text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Requested At</th>
                <th className="px-5 py-3.5">Player</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Account / Payout Details</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium text-xs">
              {withdrawalsLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading withdrawal queue...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                    No pending withdrawal requests. All payouts are up to date!
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#262626] transition-colors">
                    <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono whitespace-nowrap">
                      {new Date(w.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-bold text-white">{w.username}</div>
                      <div className="text-[10px] text-zinc-400 uppercase">{w.role}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#242424] text-zinc-300 border border-zinc-700">
                        {w.payout_method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-300 font-mono">
                      {typeof w.account_details === 'object' ? (
                        <div>
                          {w.account_details.upiId && <div>UPI: {w.account_details.upiId}</div>}
                          {w.account_details.accountNumber && (
                            <div>
                              A/C: {w.account_details.accountNumber} • IFSC: {w.account_details.ifsc} ({w.account_details.holderName})
                            </div>
                          )}
                          {w.account_details.address && <div>Addr: {w.account_details.address}</div>}
                        </div>
                      ) : (
                        w.account_details
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black font-mono text-emerald-400 text-base">
                      ₹{parseFloat(w.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          w.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : w.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            disabled={processingId === w.id}
                            onClick={() => handleProcessWithdrawal(w.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={processingId === w.id}
                            onClick={() => handleProcessWithdrawal(w.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


