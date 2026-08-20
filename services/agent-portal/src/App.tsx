import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HierarchyTree, TreeNode } from './components/HierarchyTree';
import { CreditModal } from './components/CreditModal';
import { CreateUserModal } from './components/CreateUserModal';
import { MarketControls } from './components/MarketControls';
import { LedgerTable, LedgerEntry } from './components/LedgerTable';
import { ProvidersHub } from './components/ProvidersHub';
import { BetRecordsDesk } from './components/BetRecordsDesk';
import { FinancialApprovalsDesk } from './components/FinancialApprovalsDesk';
import { PaymentAccountsManager } from './components/PaymentAccountsManager';
import { RolesMatrixModal } from './components/RolesMatrixModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { CreditsModal } from './components/CreditsModal';
import { NewsTicker } from './components/NewsTicker';
import { api, setAuthToken, removeAuthToken, getAuthToken } from './services/api';
import { socketService } from './services/socket';
import { Shield, Zap, Lock, User, RefreshCw, KeyRound, ChevronRight, Bell, Award, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('hierarchy');

  // Hierarchy & Risk State
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);

  // Modals
  const [creditModalOpen, setCreditModalOpen] = useState<boolean>(false);
  const [creditModalUser, setCreditModalUser] = useState<TreeNode | null>(null);
  const [creditModalMode, setCreditModalMode] = useState<'ALLOCATE' | 'RECALL'>('ALLOCATE');

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [createModalParent, setCreateModalParent] = useState<TreeNode | null>(null);

  const [rolesModalOpen, setRolesModalOpen] = useState<boolean>(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState<boolean>(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<TreeNode | null>(null);
  const [creditsModalOpen, setCreditsModalOpen] = useState<boolean>(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const DEFAULT_LEDGER_ENTRIES: LedgerEntry[] = [];

  const fetchDashboardData = useCallback(async () => {
    try {
      const [meRes, treeRes, marketsRes, ledgerRes] = await Promise.all([
        api.auth.getMe(),
        api.hierarchy.getTree().catch(() => ({ tree: null })),
        api.markets.getAll().catch(() => ({ markets: [] })),
        api.ledger.getHistory().catch(() => ({ entries: [] }))
      ]);

      setCurrentUser(meRes.user);
      setTreeData(treeRes.tree);
      setMarkets(marketsRes.markets || []);
      const entries = (ledgerRes.entries && ledgerRes.entries.length > 0) ? ledgerRes.entries : DEFAULT_LEDGER_ENTRIES;
      setLedgerEntries(entries);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLedgerEntries([]);
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchDashboardData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchDashboardData]);

  // WebSocket Live Updates
  useEffect(() => {
    if (!currentUser) return;
    const socket = socketService.connect();

    socket.emit('subscribe:user', { userId: currentUser.id });

    socket.on('user:balance', (data: { availableCredit: number; exposure: number }) => {
      setCurrentUser((prev: any) =>
        prev ? { ...prev, availableCredit: data.availableCredit, exposure: data.exposure } : prev
      );
    });

    socket.on('market:global_status', (data: { marketId: string; isLocked: boolean; status: string }) => {
      setMarkets((prev) =>
        prev.map((m) => (m.id === data.marketId ? { ...m, isLocked: data.isLocked, status: data.status } : m))
      );
    });

    socket.on('market:global_settled', (data: { marketId: string; winningSelectionId: number }) => {
      setMarkets((prev) =>
        prev.map((m) =>
          m.id === data.marketId
            ? { ...m, status: 'SETTLED', winningSelectionId: data.winningSelectionId, isLocked: true }
            : m
        )
      );
      fetchDashboardData();
    });

    socket.on('admin:deposit_request', (data: { username: string; amount: number; utr: string }) => {
      setToastMessage(`⚡ New Deposit: ${data.username} submitted ₹${data.amount} (UTR: ${data.utr})`);
      setTimeout(() => setToastMessage(null), 5000);
    });

    socket.on('admin:withdrawal_request', (data: { username: string; amount: number; method: string }) => {
      setToastMessage(`🚨 New Withdrawal: ${data.username} requested ₹${data.amount} via ${data.method}`);
      setTimeout(() => setToastMessage(null), 5000);
    });

    return () => {
      socket.off('user:balance');
      socket.off('market:global_status');
      socket.off('market:global_settled');
      socket.off('admin:deposit_request');
      socket.off('admin:withdrawal_request');
    };
  }, [currentUser, fetchDashboardData]);

  // Handle Login
  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }
    try {
      setLoading(true);
      setLoginError(null);
      const res = await api.auth.login({ username: loginUsername.trim(), password: loginPassword });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      await fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setCurrentUser(null);
    socketService.disconnect();
  };

  // Credit Modal Handlers
  const handleOpenCreditModal = (user: TreeNode, mode: 'ALLOCATE' | 'RECALL') => {
    setCreditModalUser(user);
    setCreditModalMode(mode);
    setCreditModalOpen(true);
  };

  const handleCreditSubmit = async (receiverId: string, amount: number, notes: string) => {
    if (creditModalMode === 'ALLOCATE') {
      await api.ledger.allocateCredit({ receiverId, amount, notes });
    } else {
      await api.ledger.recallCredit({ receiverId, amount, notes });
    }
    await fetchDashboardData();
  };

  // Create User Handlers
  const handleOpenCreateModal = (parent: TreeNode) => {
    setCreateModalParent(parent);
    setCreateModalOpen(true);
  };

  const handleCreateUserSubmit = async (userData: any) => {
    await api.hierarchy.createUser(userData);
    await fetchDashboardData();
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.hierarchy.toggleStatus(userId, !currentStatus);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to change status');
    }
  };

  const handleOpenResetPassword = (user: TreeNode) => {
    setResetPasswordUser(user);
    setResetPasswordModalOpen(true);
  };

  const handleToggleMarketLock = async (marketId: string, isLocked: boolean) => {
    await api.markets.toggleLock(marketId, isLocked);
  };

  const handleSettleMarket = async (marketId: string, winningSelectionId: number) => {
    await api.markets.settle(marketId, winningSelectionId);
    await fetchDashboardData();
  };

  const handleCreateMarket = async (marketData: any) => {
    await api.markets.createMarket(marketData);
    await fetchDashboardData();
  };

  // If not logged in, render Login Page
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#141414] relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f36c21]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 hover:border-[#f36c21]/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6 transition-all">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-[#f36c21] to-red-600 flex items-center justify-center shadow-xl shadow-orange-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#f36c21] via-amber-300 to-white bg-clip-text text-transparent">
              NEXUSVIP EXCHANGE
            </h1>
            <p className="text-xs text-zinc-400 font-medium">
              5-Tier Administrative, Banking & Multi-Role Risk Control Desk
            </p>
          </div>

          {loginError && (
            <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800/80 text-red-200">
              {loginError}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] uppercase font-bold text-zinc-500">Sign in with your credentials</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-300">Username</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f36c21] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-300">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#f36c21] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Agent Portal'}
            </button>

            {/* Creator Badge in Login */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setCreditsModalOpen(true)}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-medium transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-[#f36c21]" />
                <span>Architected & Built by Piyush Raj Singh</span>
              </button>
            </div>
          </form>
        </div>

        <CreditsModal
          isOpen={creditsModalOpen}
          onClose={() => setCreditsModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col relative">
      {/* Real-Time Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#f36c21] text-white font-black text-xs shadow-2xl border border-orange-400 flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <Bell className="w-4 h-4 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header
        user={currentUser}
        onLogout={handleLogout}
        onRefresh={fetchDashboardData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRolesMatrix={() => setRolesModalOpen(true)}
        onOpenCredits={() => setCreditsModalOpen(true)}
        onOpenChangePassword={() => handleOpenResetPassword(currentUser)}
      />

      {/* DEALER BROADCAST TICKER */}
      <NewsTicker />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hierarchy' && (
          <HierarchyTree
            tree={treeData}
            currentUserRole={currentUser.role}
            onOpenCreditModal={handleOpenCreditModal}
            onOpenCreateModal={handleOpenCreateModal}
            onToggleStatus={handleToggleStatus}
            onOpenResetPassword={handleOpenResetPassword}
          />
        )}

        {activeTab === 'bets' && (
          <BetRecordsDesk />
        )}

        {activeTab === 'approvals' && (
          <FinancialApprovalsDesk />
        )}

        {activeTab === 'banking' && (
          <PaymentAccountsManager />
        )}

        {activeTab === 'markets' && (
          <MarketControls
            markets={markets}
            currentUserRole={currentUser.role}
            onToggleLock={handleToggleMarketLock}
            onSettleMarket={handleSettleMarket}
            onCreateMarket={handleCreateMarket}
          />
        )}

        {activeTab === 'providers' && (
          <ProvidersHub />
        )}

        {activeTab === 'ledger' && (
          <LedgerTable entries={ledgerEntries} onRefresh={fetchDashboardData} />
        )}
      </main>

      {/* Credit Modal */}
      <CreditModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        targetUser={creditModalUser}
        mode={creditModalMode}
        parentBalance={currentUser.availableCredit}
        onSubmit={handleCreditSubmit}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        parentUser={createModalParent}
        parentAvailableCredit={currentUser.availableCredit}
        currentUserRole={currentUser.role}
        onSubmit={handleCreateUserSubmit}
      />

      {/* Roles & Powers Matrix Modal */}
      <RolesMatrixModal
        isOpen={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        user={resetPasswordUser}
        onSuccess={fetchDashboardData}
      />

      {/* Creator Credits Modal */}
      <CreditsModal
        isOpen={creditsModalOpen}
        onClose={() => setCreditsModalOpen(false)}
      />
    </div>
  );
};
