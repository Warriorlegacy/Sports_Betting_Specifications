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
      <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#141414]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-[#f36c21] border border-[#f36c21]/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Provision Client Account</h3>
              <p className="text-xs text-zinc-400">Supervisor / Parent: {parentUser.username}</p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#242424]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Credentials Card */}
        {createdCredentials ? (
          <div className="p-6 space-y-4 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400 animate-bounce" />
            <h4 className="font-black text-lg text-white">Account Provisioned Successfully!</h4>
            <p className="text-xs text-zinc-400">
              Share these login credentials directly with your client or agency partner.
            </p>

            <div className="p-4 bg-[#141414] rounded-2xl border border-zinc-800 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span className="text-zinc-400">Username / ID:</span>
                <span className="font-bold text-white text-sm">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span className="text-zinc-400">Password:</span>
                <span className="font-bold text-amber-300">{createdCredentials.password}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1">
                <span className="text-zinc-400">Role Tier:</span>
                <span className="font-bold text-[#f36c21]">{createdCredentials.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Allocated Balance:</span>
                <span className="font-bold text-emerald-400">₹{parseFloat(createdCredentials.initialCredit).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={copyCredentialsText}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-600/25"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Card!' : 'Copy WhatsApp Card'}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseAll}
                className="px-5 py-3 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-200 font-bold text-xs border border-zinc-700"
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
                <label className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">
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
                          ? 'bg-[#f36c21]/20 border-[#f36c21] text-white'
                          : 'bg-[#141414] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{item.label}</div>
                      <div className="text-[10px] text-zinc-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Assigned Role Tier</span>
                  <span className="text-sm font-bold text-[#f36c21]">{currentRole}</span>
                </div>
                <Shield className="w-6 h-6 text-[#f36c21]/50" />
              </div>
            )}

            {/* Username Field with Generator */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase text-zinc-300 text-[10px]">Username / User ID *</label>
                <button
                  type="button"
                  onClick={() => generateRandomUsername(currentRole)}
                  className="text-[#f36c21] hover:text-amber-400 font-bold flex items-center space-x-1 text-[10px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate ID</span>
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. master_north or user_101"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#f36c21]"
                />
              </div>
            </div>

            {/* Password Field with Generator */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase text-zinc-300 text-[10px]">Password *</label>
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
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#f36c21]"
                />
              </div>
            </div>

            {/* Initial Credit Provision */}
            <div className="space-y-1">
              <label className="font-bold uppercase text-zinc-300 text-[10px]">
                Initial Credit Provision (₹)
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="1000"
                  value={initialCredit}
                  onChange={(e) => setInitialCredit(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#f36c21]"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">
                Available parent balance: ₹{parentAvailableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white shadow-lg shadow-orange-600/25 disabled:opacity-50 transition-all"
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

