import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Coins, AlertCircle } from 'lucide-react';
import { TreeNode } from './HierarchyTree';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: TreeNode | null;
  mode: 'ALLOCATE' | 'RECALL';
  parentBalance: number;
  onSubmit: (receiverId: string, amount: number, notes: string) => Promise<void>;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  mode,
  parentBalance,
  onSubmit
}) => {
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const numAmount = parseFloat(amount) || 0;
  const isAllocate = mode === 'ALLOCATE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Please enter a valid credit amount strictly greater than 0');
      return;
    }

    if (isAllocate && numAmount > parentBalance) {
      setError(`Cannot allocate ${numAmount.toFixed(2)}: exceeds your available credit balance of ${parentBalance.toFixed(2)}`);
      return;
    }

    if (!isAllocate && numAmount > targetUser.availableCredit) {
      setError(`Cannot recall ${numAmount.toFixed(2)}: exceeds subordinate's unencumbered credit of ${targetUser.availableCredit.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(targetUser.id, numAmount, notes);
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            {isAllocate ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-base text-slate-100">
                {isAllocate ? 'Allocate Downline Credit' : 'Recall Subordinate Credit'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAllocate ? 'Provision credit lines down the tree' : 'Recall unencumbered credit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs rounded-xl bg-red-950/50 border border-red-800/60 text-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Target Info */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Account:</span>
              <span className="font-bold text-slate-200">{targetUser.username} ({targetUser.role})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Available Credit:</span>
              <span className="mono-num font-semibold text-emerald-400">
                {targetUser.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Target Active Exposure:</span>
              <span className="mono-num font-semibold text-amber-400">
                {targetUser.exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {isAllocate && (
              <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Your Available Balance:</span>
                <span className="mono-num font-bold text-blue-400">
                  {parentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Credit Amount
            </label>
            <div className="relative">
              <Coins className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex space-x-2">
            {[500, 1000, 5000, 10000].map((quickAmt) => (
              <button
                key={quickAmt}
                type="button"
                onClick={() => setAmount(quickAmt.toString())}
                className="flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
              >
                +{quickAmt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Notes / Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Ledger Note / Reference
            </label>
            <input
              type="text"
              placeholder={isAllocate ? 'e.g. Weekly operational credit' : 'e.g. Settlement sweep'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-sm font-bold rounded-xl text-white shadow-lg transition-all ${
                isAllocate
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
              } disabled:opacity-50`}
            >
              {loading
                ? 'Executing Atomic Transaction...'
                : isAllocate
                ? `Allocate ${numAmount > 0 ? numAmount.toLocaleString() + ' Credit' : ''}`
                : `Recall ${numAmount > 0 ? numAmount.toLocaleString() + ' Credit' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
