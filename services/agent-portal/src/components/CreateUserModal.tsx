import React, { useState } from 'react';
import { X, UserPlus, Shield, Lock, User, Coins, AlertCircle } from 'lucide-react';
import { TreeNode } from './HierarchyTree';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentUser: TreeNode | null;
  parentAvailableCredit: number;
  onSubmit: (userData: { username: string; password: string; initialCredit?: number; role?: string }) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  parentUser,
  parentAvailableCredit,
  onSubmit
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('password123');
  const [initialCredit, setInitialCredit] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !parentUser) return null;

  const getTargetRole = (parentRole: string) => {
    switch (parentRole) {
      case 'ADMIN':
        return { role: 'SUPER_MASTER', label: 'Level 1 • Super Master', desc: 'Regional branch administrator' };
      case 'SUPER_MASTER':
        return { role: 'MASTER', label: 'Level 2 • Master', desc: 'Local master agency operator' };
      case 'MASTER':
        return { role: 'AGENT', label: 'Level 3 • Agent', desc: 'Retail agency & retail cashier' };
      case 'AGENT':
        return { role: 'USER', label: 'Level 4 • Player / Trader', desc: 'Direct exchange betting player' };
      default:
        return { role: 'USER', label: 'Player', desc: 'Trader' };
    }
  };

  const targetRoleInfo = getTargetRole(parentUser.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    const creditNum = parseFloat(initialCredit) || 0;
    if (parentUser.role !== 'ADMIN' && creditNum > parentAvailableCredit) {
      setError(`Initial credit exceeds your available balance (${parentAvailableCredit.toFixed(2)})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        username: username.trim(),
        password,
        initialCredit: creditNum,
        role: targetRoleInfo.role
      });
      setUsername('');
      setPassword('password123');
      setInitialCredit('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
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
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Create Downline Account</h3>
              <p className="text-xs text-slate-400">Parent: {parentUser.username} ({parentUser.role})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs rounded-xl bg-red-950/50 border border-red-800/60 text-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Role Pill */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">Assigned Role Tier</span>
              <span className="text-sm font-bold text-blue-400">{targetRoleInfo.label}</span>
              <span className="text-[11px] text-slate-500 block">{targetRoleInfo.desc}</span>
            </div>
            <Shield className="w-6 h-6 text-blue-500/50" />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. agent_north or player_deepak"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Initial Credit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Initial Credit Provision (Optional)
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialCredit}
                onChange={(e) => setInitialCredit(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-[11px] text-slate-500 block">
              Available from your balance: {parentAvailableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating Account & Allocating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
