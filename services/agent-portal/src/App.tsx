import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HierarchyTree, TreeNode } from './components/HierarchyTree';
import { CreditModal } from './components/CreditModal';
import { CreateUserModal } from './components/CreateUserModal';
import { MarketControls } from './components/MarketControls';
import { LedgerTable, LedgerEntry } from './components/LedgerTable';
import { api, setAuthToken, removeAuthToken, getAuthToken } from './services/api';
import { socketService } from './services/socket';
import { Shield, Zap, Lock, User, RefreshCw, KeyRound, ChevronRight } from 'lucide-react';

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

  // Login form state
  const [loginUsername, setLoginUsername] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [loginError, setLoginError] = useState<string | null>(null);

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
      setLedgerEntries(ledgerRes.entries || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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

    return () => {
      socket.off('user:balance');
      socket.off('market:global_status');
      socket.off('market:global_settled');
    };
  }, [currentUser, fetchDashboardData]);

  // Handle Login
  const handleLogin = async (usernameOverride?: string) => {
    try {
      setLoading(true);
      setLoginError(null);
      const u = usernameOverride || loginUsername;
      const res = await api.auth.login({ username: u, password: loginPassword });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      await fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
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

  // If not logged in, render Login Page with Demo Account Switcher
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070a12] relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
              NEXUS EXCHANGE
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Tier Administrative & Credit Control Portal
            </p>
          </div>

          {loginError && (
            <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800/80 text-red-200">
              {loginError}
            </div>
          )}

          {/* Quick Demo Login Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Switch Role Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLogin('admin')}
                className="p-2.5 rounded-xl text-xs font-bold bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-purple-200 transition-all text-left flex flex-col"
              >
                <span>Global Admin</span>
                <span className="text-[10px] text-purple-400 font-normal">Level 0 Root (10M)</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('supermaster_asia')}
                className="p-2.5 rounded-xl text-xs font-bold bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 text-blue-200 transition-all text-left flex flex-col"
              >
                <span>Super Master</span>
                <span className="text-[10px] text-blue-400 font-normal">Level 1 Asia (500k)</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('master_mumbai')}
                className="p-2.5 rounded-xl text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-emerald-200 transition-all text-left flex flex-col"
              >
                <span>Master Agency</span>
                <span className="text-[10px] text-emerald-400 font-normal">Level 2 Mumbai (100k)</span>
              </button>

              <button
                type="button"
                onClick={() => handleLogin('agent_vikram')}
                className="p-2.5 rounded-xl text-xs font-bold bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 text-amber-200 transition-all text-left flex flex-col"
              >
                <span>Retail Agent</span>
                <span className="text-[10px] text-amber-400 font-normal">Level 3 Vikram (25k)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Or manual credentials</span>
            <div className="h-px flex-1 bg-slate-800" />
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
              <label className="text-xs font-semibold uppercase text-slate-300">Username</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Agent Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onRefresh={fetchDashboardData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'hierarchy' && (
          <HierarchyTree
            tree={treeData}
            currentUserRole={currentUser.role}
            onOpenCreditModal={handleOpenCreditModal}
            onOpenCreateModal={handleOpenCreateModal}
            onToggleStatus={handleToggleStatus}
          />
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
        onSubmit={handleCreateUserSubmit}
      />
    </div>
  );
};
