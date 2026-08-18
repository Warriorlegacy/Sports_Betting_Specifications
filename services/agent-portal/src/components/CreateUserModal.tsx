import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Lock,
  User,
  Coins,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { TreeNode } from './HierarchyTree';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentUser: TreeNode | null;
  parentAvailableCredit: number;
  currentUserRole?: string;
  onSubmit: (userData: { username: string; password: string; initialCredit?: number; role?: string; parentId?: string }) => Promise<void>;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  parentUser,
  parentAvailableCredit,
  currentUserRole = 'ADMIN',
  onSubmit
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('USER');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('pass' + Math.floor(1000 + Math.random() * 9000));
  const [initialCredit, setInitialCredit] = useState<string>('1000');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !parentUser) return null;

  const isAdmin = currentUserRole === 'ADMIN' || parentUser.role === 'ADMIN';

  const getDefaultRoleForParent = (pRole: string) => {
    switch (pRole) {
      case 'ADMIN':
        return 'SUPER_MASTER';
      case 'SUPER_MASTER':
        return 'MASTER';
      case 'MASTER':
        return 'AGENT';
      case 'AGENT':
        return 'USER';
      default:
        return 'USER';
    }
  };

  const currentRole = isAdmin ? selectedRole : getDefaultRoleForParent(parentUser.role);

  const generateRandomUsername = (role: string) => {
    const prefixes: Record<string, string> = {
      SUPER_MASTER: 'SM_',
      MASTER: 'MST_',
      AGENT: 'AGT_',
      USER: 'PLR_'
    };
    const pfx = prefixes[role] || 'USR_';
    const randNum = Math.floor(10000 + Math.random() * 90000);
    setUsername(`${pfx}${randNum}`);
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword('Nexus@' + pwd);
  };

  const copyCredentialsText = () => {
    if (!createdCredentials) return;
    const text = `🌟 NEXUSVIP EXCHANGE ACCOUNT CREDENTIALS 🌟\n\n👤 Username: ${createdCredentials.username}\n🔑 Password: ${createdCredentials.password}\n🎖️ Role: ${createdCredentials.role}\n💰 Initial Balance: ₹${parseFloat(createdCredentials.initialCredit || '0').toLocaleString()}\n\n🔗 Login Portal: https://nexusvip.exchange\n🛡️ Official & Secure 256-bit Encrypted Platform`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        role: currentRole,
        parentId: parentUser.id
      });

      setCreatedCredentials({
        username: username.trim(),
        password,
        role: currentRole,
        initialCredit: creditNum
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAll = () => {
    setCreatedCredentials(null);
    setUsername('');
    setPassword('password123');
    setInitialCredit('1000');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Provision Client Account</h3>
              <p className="text-xs text-slate-400">Supervisor / Parent: {parentUser.username}</p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Credentials Card */}
        {createdCredentials ? (
          <div className="p-6 space-y-4 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400 animate-bounce" />
            <h4 className="font-black text-lg text-white">Account Provisioned Successfully!</h4>
            <p className="text-xs text-slate-400">
              Share these login credentials directly with your client or agency partner.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Username / ID:</span>
                <span className="font-bold text-white text-sm">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Password:</span>
                <span className="font-bold text-amber-300">{createdCredentials.password}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Role Tier:</span>
                <span className="font-bold text-blue-400">{createdCredentials.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Balance:</span>
                <span className="font-bold text-emerald-400">₹{parseFloat(createdCredentials.initialCredit).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={copyCredentialsText}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Card!' : 'Copy WhatsApp Card'}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection (If Admin) */}
            {isAdmin ? (
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Select Account Role Tier
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { r: 'SUPER_MASTER', label: 'Super Master', desc: 'Regional head' },
                    { r: 'MASTER', label: 'Master', desc: 'City agency' },
                    { r: 'AGENT', label: 'Agent', desc: 'Retail bookmaker' },
                    { r: 'USER', label: 'Player (User)', desc: 'Real sports bettor' }
                  ].map((item) => (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(item.r);
                        generateRandomUsername(item.r);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        selectedRole === item.r
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Assigned Role Tier</span>
                  <span className="text-sm font-bold text-blue-400">{currentRole}</span>
                </div>
                <Shield className="w-6 h-6 text-blue-500/50" />
              </div>
            )}

            {/* Username Field with Generator */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase text-slate-300 text-[10px]">Username / User ID *</label>
                <button
                  type="button"
                  onClick={() => generateRandomUsername(currentRole)}
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 text-[10px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate ID</span>
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. master_delhi or player_rahul"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password Field with Generator */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase text-slate-300 text-[10px]">Password *</label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 text-[10px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate Password</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Initial Credit Provision */}
            <div className="space-y-1">
              <label className="font-bold uppercase text-slate-300 text-[10px]">
                Initial Credit Provision (₹)
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="1000"
                  value={initialCredit}
                  onChange={(e) => setInitialCredit(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                Available parent balance: ₹{parentAvailableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating Account & Allocating Balance...' : 'Create Account & Generate Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
