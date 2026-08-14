import React from 'react';
import { BookOpen, ArrowDownLeft, ArrowUpRight, Award, Percent, Coins } from 'lucide-react';

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
  const getTypeBadge = (type: string) => {
    switch (type) {
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
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">Double-Entry Ledger Audit Trail</h2>
            <p className="text-xs text-slate-400">Tamper-evident transaction and credit flow log</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                  No ledger entries recorded yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{getTypeBadge(entry.transactionType)}</td>
                  <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap font-bold">
                    {entry.senderUsername}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap font-bold">
                    {entry.receiverUsername}
                  </td>
                  <td className="px-5 py-3.5 text-right mono-num font-bold text-slate-100 whitespace-nowrap">
                    {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 mono-num whitespace-nowrap">
                    {entry.referenceId}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 max-w-xs truncate" title={entry.notes || ''}>
                    {entry.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
