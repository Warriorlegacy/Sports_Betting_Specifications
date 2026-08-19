import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  Building,
  Smartphone,
  Coins,
  ShieldCheck,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  X
} from 'lucide-react';
import { api } from '../services/api';

export const FinancialApprovalsDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEPOSITS' | 'WITHDRAWALS'>('DEPOSITS');

  // Deposits State
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositsLoading, setDepositsLoading] = useState<boolean>(true);
  const [depositStatusFilter, setDepositStatusFilter] = useState<string>('PENDING');
  const [depositSearch, setDepositSearch] = useState<string>('');

  // Withdrawals State
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState<boolean>(true);
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState<string>('PENDING');

  // Action Processing Modals
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [depositAction, setDepositAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [depositNote, setDepositNote] = useState<string>('');
  const [processingDeposit, setProcessingDeposit] = useState<boolean>(false);

  // Lightbox Screenshot Preview
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [previewScreenshotUser, setPreviewScreenshotUser] = useState<string | null>(null);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [withdrawAction, setWithdrawAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [withdrawRefId, setWithdrawRefId] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState<boolean>(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const DEFAULT_MOCK_DEPOSITS = [
    {
      id: 'DEP_DEMO_001',
      username: 'player_rahul',
      amount: 2500,
      payment_method: 'UPI',
      utr_reference: '423987110943',
      deposit_account_name: 'NexusVIP Official UPI (nexusvip.pay@icici)',
      status: 'APPROVED',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      admin_note: 'Verified against ICICI bank statement automatically'
    },
    {
      id: 'DEP_DEMO_002',
      username: 'vip_player_vikram',
      amount: 50000,
      payment_method: 'BANK',
      utr_reference: '394827104921',
      deposit_account_name: 'NexusVIP Corporate IMPS (50200088912456)',
      status: 'PENDING',
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      proof_image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      admin_note: null
    },
    {
      id: 'DEP_DEMO_003',
      username: 'priya_punter',
      amount: 10000,
      payment_method: 'UPI',
      utr_reference: '982347102934',
      deposit_account_name: 'NexusVIP Official UPI (nexusvip.pay@icici)',
      status: 'PENDING',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      proof_image_url: null,
      admin_note: null
    },
    {
      id: 'DEP_DEMO_004',
      username: 'rohit_trader_99',
      amount: 15000,
      payment_method: 'CRYPTO',
      utr_reference: 'TXID_84a92c019b8823f0012',
      deposit_account_name: 'USDT TRC-20 Instant Crypto Deposit',
      status: 'APPROVED',
      created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
      proof_image_url: null,
      admin_note: 'Blockchain 12-block confirmation reached'
    }
  ];

  const DEFAULT_MOCK_WITHDRAWALS = [
    {
      id: 'WTH_741939',
      reference_id: 'WTH_741939',
      username: 'player_rahul',
      amount: 2000,
      payout_method: 'UPI',
      status: 'PENDING',
      account_details: { upiId: 'player.rahul@okaxis' },
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      admin_note: null
    },
    {
      id: 'WTH_DEMO_002',
      reference_id: 'WTH_891024',
      username: 'delhi_trader_8',
      amount: 15000,
      payout_method: 'BANK',
      status: 'PENDING',
      account_details: { bankAccNumber: '501004829104', bankIfsc: 'HDFC0000240', bankHolderName: 'Amit Kumar' },
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      admin_note: null
    },
    {
      id: 'WTH_DEMO_003',
      reference_id: 'WTH_102934',
      username: 'neha_crypto',
      amount: 25000,
      payout_method: 'CRYPTO',
      status: 'APPROVED',
      account_details: { cryptoAddress: 'TYDzsfcHsBwM1bC7K9N8x2yL3m4p5q6r7s', cryptoNetwork: 'TRC20' },
      created_at: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
      admin_note: 'Dispatched via automated Tron node'
    }
  ];

  // Load Deposits
  const fetchDeposits = useCallback(async () => {
    try {
      setDepositsLoading(true);
      const res = await api.ledger.getDeposits(depositStatusFilter, depositSearch).catch(() => ({ deposits: [] }));
      const serverDeposits = res.deposits || [];
      const localDeposits = JSON.parse(localStorage.getItem('exchange_my_deposits') || '[]');

      // Standardize local deposits format for admin table
      const formattedLocal = localDeposits.map((d: any) => ({
        id: d.id,
        username: d.username || 'player_rahul',
        amount: d.amount,
        payment_method: d.payment_method || 'UPI',
        utr_reference: d.utr_reference || d.utr,
        deposit_account_name: d.deposit_account_name || 'NexusVIP Official Gateway',
        status: d.status || 'PENDING',
        created_at: d.created_at || new Date().toISOString(),
        proof_image_url: d.proof_image_url || d.proofImage || null,
        admin_note: d.admin_note || null
      }));

      // Combine server, local, and default records
      const combined = [...serverDeposits];
      for (const loc of formattedLocal) {
        if (!combined.some((c) => c.id === loc.id || c.utr_reference === loc.utr_reference)) {
          combined.unshift(loc);
        }
      }
      for (const mock of DEFAULT_MOCK_DEPOSITS) {
        if (!combined.some((c) => c.id === mock.id || c.utr_reference === mock.utr_reference)) {
          combined.push(mock);
        }
      }

      // Filter by status & search
      let filtered = combined;
      if (depositStatusFilter !== 'ALL') {
        filtered = filtered.filter((d) => d.status === depositStatusFilter);
      }
      if (depositSearch.trim()) {
        const q = depositSearch.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            (d.username && d.username.toLowerCase().includes(q)) ||
            (d.utr_reference && d.utr_reference.toLowerCase().includes(q))
        );
      }

      setDeposits(filtered);
    } catch (err) {
      console.error('Failed to fetch deposits:', err);
    } finally {
      setDepositsLoading(false);
    }
  }, [depositStatusFilter, depositSearch]);

  // Load Withdrawals
  const fetchWithdrawals = useCallback(async () => {
    try {
      setWithdrawalsLoading(true);
      const res = await api.ledger.getWithdrawals(withdrawStatusFilter).catch(() => ({ withdrawals: [] }));
      const serverWithdrawals = res.withdrawals || [];
      const localWithdrawals = JSON.parse(localStorage.getItem('exchange_my_withdrawals') || '[]');

      // Standardize local withdrawals format for admin table
      const formattedLocal = localWithdrawals.map((w: any) => ({
        id: w.id || w.reference_id,
        reference_id: w.reference_id || w.id,
        username: w.username || 'player_rahul',
        amount: w.amount,
        payout_method: w.payout_method || 'UPI',
        status: w.status || 'PENDING',
        account_details: w.account_details || (w.destination ? { upiId: w.destination } : {}),
        created_at: w.created_at || new Date().toISOString(),
        admin_note: w.admin_note || null
      }));

      // Combine server, local, and default records
      const combined = [...serverWithdrawals];
      for (const loc of formattedLocal) {
        if (!combined.some((c) => c.id === loc.id || c.reference_id === loc.reference_id)) {
          combined.unshift(loc);
        }
      }
      for (const mock of DEFAULT_MOCK_WITHDRAWALS) {
        if (!combined.some((c) => c.id === mock.id || c.reference_id === mock.reference_id)) {
          combined.push(mock);
        }
      }

      // Filter by status
      let filtered = combined;
      if (withdrawStatusFilter !== 'ALL') {
        filtered = filtered.filter((w) => w.status === withdrawStatusFilter);
      }

      setWithdrawals(filtered);
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  }, [withdrawStatusFilter]);

  useEffect(() => {
    if (activeTab === 'DEPOSITS') {
      fetchDeposits();
    } else {
      fetchWithdrawals();
    }
  }, [activeTab, fetchDeposits, fetchWithdrawals]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Execute Deposit Approval or Rejection
  const handleProcessDeposit = async () => {
    if (!selectedDeposit || !depositAction) return;
    try {
      setProcessingDeposit(true);
      try {
        await api.ledger.processDeposit(selectedDeposit.id, depositAction, depositNote);
      } catch (err) {
        console.warn('Backend processDeposit endpoint unavailable, updating local store:', err);
      }

      // Update local storage record
      const localDeposits = JSON.parse(localStorage.getItem('exchange_my_deposits') || '[]');
      const updatedLocal = localDeposits.map((d: any) =>
        d.id === selectedDeposit.id || d.utr_reference === selectedDeposit.utr_reference
          ? { ...d, status: depositAction === 'APPROVE' ? 'APPROVED' : 'REJECTED', admin_note: depositNote }
          : d
      );
      localStorage.setItem('exchange_my_deposits', JSON.stringify(updatedLocal));

      setSelectedDeposit(null);
      setDepositAction(null);
      setDepositNote('');
      await fetchDeposits();
    } catch (err: any) {
      alert(err.message || 'Failed to process deposit');
    } finally {
      setProcessingDeposit(false);
    }
  };

  // Execute Withdrawal Approval or Rejection
  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal || !withdrawAction) return;
    try {
      setProcessingWithdrawal(true);
      try {
        await api.ledger.processWithdrawal(selectedWithdrawal.id, withdrawAction, withdrawRefId, withdrawNote);
      } catch (err) {
        console.warn('Backend processWithdrawal endpoint unavailable, updating local store:', err);
      }

      // Update local storage record
      const localWithdrawals = JSON.parse(localStorage.getItem('exchange_my_withdrawals') || '[]');
      const updatedLocal = localWithdrawals.map((w: any) =>
        w.id === selectedWithdrawal.id || w.reference_id === selectedWithdrawal.reference_id
          ? {
              ...w,
              status: withdrawAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
              admin_note: withdrawNote,
              reference_id: withdrawRefId || w.reference_id
            }
          : w
      );
      localStorage.setItem('exchange_my_withdrawals', JSON.stringify(updatedLocal));

      // If rejected, refund user wallet
      if (withdrawAction === 'REJECT') {
        const savedUser = localStorage.getItem('nexus_demo_user');
        if (savedUser) {
          try {
            const u = JSON.parse(savedUser);
            u.availableCredit = (u.availableCredit || 0) + (selectedWithdrawal.amount || 0);
            localStorage.setItem('nexus_demo_user', JSON.stringify(u));
          } catch {}
        }
      }

      setSelectedWithdrawal(null);
      setWithdrawAction(null);
      setWithdrawRefId('');
      setWithdrawNote('');
      await fetchWithdrawals();
    } catch (err: any) {
      alert(err.message || 'Failed to process withdrawal');
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#f36c21]" />
              Financial Approvals & Settlement Desk
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-950/80 text-amber-300 border border-orange-700/60">
              Audit & Clearing
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Authorize player deposit UTRs, verify transfers, and dispatch IMPS/UPI withdrawal requests.
          </p>
        </div>

        <button
          onClick={activeTab === 'DEPOSITS' ? fetchDeposits : fetchWithdrawals}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-200 text-xs font-bold transition-all border border-zinc-700 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Tab Selector */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('DEPOSITS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'DEPOSITS'
              ? 'bg-[#f36c21] text-white shadow-lg shadow-orange-500/25'
              : 'bg-[#1e1e1e] text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Deposit Requests Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'WITHDRAWALS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-[#1e1e1e] text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdrawal Requests Queue</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: DEPOSITS APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'DEPOSITS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-3 bg-[#1e1e1e] rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex space-x-1 w-full sm:w-auto">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setDepositStatusFilter(status)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    depositStatusFilter === status
                      ? 'bg-[#f36c21] text-white shadow-md shadow-orange-600/30'
                      : 'bg-[#141414] text-zinc-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by UTR or username..."
                value={depositSearch}
                onChange={(e) => setDepositSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#f36c21]"
              />
            </div>
          </div>

          {/* Deposits Table */}
          <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#141414] text-zinc-400 uppercase text-[10px] font-black border-b border-zinc-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Submitted At</th>
                    <th className="px-4 py-3">Player Account</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                    <th className="px-4 py-3">12-Digit UTR / Ref</th>
                    <th className="px-4 py-3">Target Deposit Account</th>
                    <th className="px-4 py-3 text-center">Payment Proof</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {depositsLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f36c21] mb-2" />
                        <span>Loading deposit requests...</span>
                      </td>
                    </tr>
                  ) : deposits.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                        <p className="font-bold text-zinc-400">Deposit Queue Empty</p>
                        <p className="text-[11px] mt-1 text-zinc-600">No deposit requests matching current filter.</p>
                      </td>
                    </tr>
                  ) : (
                    deposits.map((dep) => {
                      const dt = new Date(dep.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={dep.id} className="hover:bg-[#262626] transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {dt}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-white">{dep.username}</div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Bal: ₹{parseFloat(dep.available_credit || '0').toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-[#262626] text-zinc-300 font-bold text-[10px] uppercase border border-zinc-700">
                              {dep.payment_method}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right font-mono font-black text-sm text-emerald-400 whitespace-nowrap">
                            ₹{parseFloat(dep.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="px-4 py-3 font-mono whitespace-nowrap">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-white bg-[#141414] px-2 py-1 rounded border border-zinc-700">
                                {dep.utr_reference}
                              </span>
                              <button
                                onClick={() => copyToClipboard(dep.utr_reference, `dep_${dep.id}`)}
                                className="p-1 rounded bg-[#242424] hover:bg-[#333] text-zinc-300"
                                title="Copy UTR"
                              >
                                {copiedKey === `dep_${dep.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-zinc-300 max-w-[180px] truncate">
                            {dep.deposit_account_details ? (
                              <span>
                                {dep.deposit_account_details.displayName || dep.deposit_account_details.bankName || 'Nexus Account'}
                              </span>
                            ) : (
                              <span className="text-zinc-500">Default Gateway</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {dep.proof_image_url ? (
                              <button
                                onClick={() => {
                                  setPreviewScreenshotUrl(dep.proof_image_url);
                                  setPreviewScreenshotUser(`${dep.username} • ₹${parseFloat(dep.amount).toLocaleString()} (UTR: ${dep.utr_reference})`);
                                }}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-[#f36c21]/60 text-amber-300 font-bold text-[11px] transition-all hover:scale-105 shadow-sm"
                                title="View Payment Screenshot Proof"
                              >
                                <ImageIcon className="w-3.5 h-3.5 text-[#f36c21]" />
                                <span>View Proof</span>
                              </button>
                            ) : (
                              <span className="text-zinc-600 text-[10px] italic">No Image</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {dep.status === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse">
                                PENDING APPROVAL
                              </span>
                            )}
                            {dep.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                APPROVED & CREDITED
                              </span>
                            )}
                            {dep.status === 'REJECTED' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800/60">
                                REJECTED
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {dep.status === 'PENDING' ? (
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedDeposit(dep);
                                    setDepositAction('APPROVE');
                                    setDepositNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDeposit(dep);
                                    setDepositAction('REJECT');
                                    setDepositNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs transition-all border border-red-800/60"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">
                                by {dep.processor_username || 'Admin'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: WITHDRAWALS APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="p-3 bg-[#1e1e1e] rounded-2xl border border-zinc-800 flex items-center space-x-1">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setWithdrawStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  withdrawStatusFilter === status
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-[#141414] text-zinc-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Withdrawals Table */}
          <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#141414] text-zinc-400 uppercase text-[10px] font-black border-b border-zinc-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Requested At</th>
                    <th className="px-4 py-3">Player Account</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount (₹)</th>
                    <th className="px-4 py-3">Payout Destination (Bank / UPI)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {withdrawalsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                        <span>Loading withdrawal requests...</span>
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                        <p className="font-bold text-zinc-400">Withdrawal Queue Empty</p>
                        <p className="text-[11px] mt-1 text-zinc-600">No withdrawal requests matching current filter.</p>
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((wth) => {
                      const dt = new Date(wth.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const acc = wth.account_details || {};

                      return (
                        <tr key={wth.id} className="hover:bg-[#262626] transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                            {dt}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-bold text-white">{wth.username}</div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Role: {wth.role}
                            </span>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-[#262626] text-zinc-300 font-bold text-[10px] uppercase border border-zinc-700">
                              {wth.payout_method}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right font-mono font-black text-sm text-amber-400 whitespace-nowrap">
                            ₹{parseFloat(wth.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="px-4 py-3">
                            {wth.payout_method === 'UPI' ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-white bg-[#141414] px-2 py-1 rounded border border-zinc-700">
                                  {acc.upiId || 'N/A'}
                                </span>
                                {acc.upiId && (
                                  <button
                                    onClick={() => copyToClipboard(acc.upiId, `wth_upi_${wth.id}`)}
                                    className="p-1 rounded bg-[#242424] text-zinc-300 hover:bg-[#333]"
                                    title="Copy UPI ID"
                                  >
                                    {copiedKey === `wth_upi_${wth.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-0.5 text-[11px]">
                                <div className="font-bold text-white flex items-center space-x-2">
                                  <span>{acc.bankHolderName || 'A/C Holder'}</span>
                                  <span className="font-mono text-zinc-400">({acc.bankAccNumber})</span>
                                  {acc.bankAccNumber && (
                                    <button
                                      onClick={() => copyToClipboard(acc.bankAccNumber, `wth_acc_${wth.id}`)}
                                      className="p-0.5 rounded bg-[#242424] text-zinc-300"
                                    >
                                      {copiedKey === `wth_acc_${wth.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-400">
                                  IFSC: <span className="text-amber-300 font-bold">{acc.bankIfsc}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {wth.status === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse">
                                PENDING DISPATCH
                              </span>
                            )}
                            {wth.status === 'APPROVED' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                APPROVED & PAID
                              </span>
                            )}
                            {wth.status === 'REJECTED' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800/60">
                                REJECTED (REFUNDED)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {wth.status === 'PENDING' ? (
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(wth);
                                    setWithdrawAction('APPROVE');
                                    setWithdrawRefId(`IMPS_${Date.now()}`);
                                    setWithdrawNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow"
                                >
                                  Dispatch
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(wth);
                                    setWithdrawAction('REJECT');
                                    setWithdrawNote('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs transition-all border border-red-800/60"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">
                                Ref: {wth.reference_id || 'N/A'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEPOSIT ACTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {selectedDeposit && depositAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2">
                {depositAction === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Approve Deposit & Credit Wallet</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span>Reject Deposit Request</span>
                  </>
                )}
              </h3>
            </div>

            <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Player:</span>
                <span className="font-bold text-white">{selectedDeposit.username}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Deposit Amount:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ₹{parseFloat(selectedDeposit.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>UTR Reference:</span>
                <span className="font-mono font-bold text-white">{selectedDeposit.utr_reference}</span>
              </div>

              {selectedDeposit.proof_image_url && (
                <div className="pt-2 border-t border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#f36c21] flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> Uploaded Payment Screenshot
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewScreenshotUrl(selectedDeposit.proof_image_url);
                        setPreviewScreenshotUser(`${selectedDeposit.username} (UTR: ${selectedDeposit.utr_reference})`);
                      }}
                      className="text-[10px] text-[#f36c21] hover:text-amber-400 font-bold underline"
                    >
                      Enlarge Proof
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      setPreviewScreenshotUrl(selectedDeposit.proof_image_url);
                      setPreviewScreenshotUser(`${selectedDeposit.username} (UTR: ${selectedDeposit.utr_reference})`);
                    }}
                    className="cursor-pointer rounded-lg overflow-hidden border border-zinc-700 bg-black/60 max-h-36 flex items-center justify-center relative group"
                  >
                    <img
                      src={selectedDeposit.proof_image_url}
                      alt="Deposit Proof"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold gap-1 transition-opacity">
                      <Eye className="w-4 h-4" /> Click to Inspect
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {depositAction === 'APPROVE' ? 'Operator Notes (Optional)' : 'Reason for Rejection *'}
              </label>
              <textarea
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                placeholder={
                  depositAction === 'APPROVE'
                    ? 'e.g. Verified in ICICI Bank statement'
                    : 'e.g. UTR not matching banking records'
                }
                rows={2}
                className="w-full p-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#f36c21]"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDeposit(null);
                  setDepositAction(null);
                }}
                disabled={processingDeposit}
                className="flex-1 py-2.5 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 font-bold text-xs transition-colors border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessDeposit}
                disabled={processingDeposit || (depositAction === 'REJECT' && !depositNote.trim())}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg disabled:opacity-50 transition-all ${
                  depositAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                    : 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
                }`}
              >
                {processingDeposit ? 'Processing...' : depositAction === 'APPROVE' ? 'Confirm & Credit ₹' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WITHDRAWAL ACTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {selectedWithdrawal && withdrawAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2">
                {withdrawAction === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Approve & Dispatch Payout</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span>Reject & Refund to Wallet</span>
                  </>
                )}
              </h3>
            </div>

            <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Player:</span>
                <span className="font-bold text-white">{selectedWithdrawal.username}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Withdrawal Amount:</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  ₹{parseFloat(selectedWithdrawal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payout Method:</span>
                <span className="font-bold text-white">{selectedWithdrawal.payout_method}</span>
              </div>
            </div>

            {withdrawAction === 'APPROVE' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Bank IMPS / UPI RRN Reference</label>
                <input
                  type="text"
                  value={withdrawRefId}
                  onChange={(e) => setWithdrawRefId(e.target.value)}
                  placeholder="e.g. IMPS99201948201"
                  className="w-full p-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#f36c21]"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Reason for Rejection (Refund Reason) *</label>
                <textarea
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="e.g. Invalid bank IFSC code or account holder name mismatch"
                  rows={2}
                  className="w-full p-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#f36c21]"
                />
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setWithdrawAction(null);
                }}
                disabled={processingWithdrawal}
                className="flex-1 py-2.5 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 font-bold text-xs transition-colors border border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessWithdrawal}
                disabled={processingWithdrawal || (withdrawAction === 'REJECT' && !withdrawNote.trim())}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg disabled:opacity-50 transition-all ${
                  withdrawAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                    : 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
                }`}
              >
                {processingWithdrawal ? 'Dispatching...' : withdrawAction === 'APPROVE' ? 'Confirm Payout' : 'Confirm & Refund Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-RES LIGHTBOX SCREENSHOT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-4xl bg-[#1e1e1e] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#141414] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-[#f36c21]/30 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-[#f36c21]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Payment Receipt / Screenshot Inspection</h3>
                  {previewScreenshotUser && (
                    <p className="text-xs text-zinc-400 font-mono">{previewScreenshotUser}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1.5 rounded-xl bg-[#242424] text-zinc-400 hover:text-white hover:bg-[#333] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-black/80 flex items-center justify-center min-h-[300px]">
              <img
                src={previewScreenshotUrl}
                alt="Payment Receipt"
                className="max-h-[68vh] max-w-full object-contain rounded-lg shadow-2xl border border-zinc-800"
              />
            </div>
            <div className="p-3 bg-[#141414] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Operator Verified Banking Proof
              </span>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="px-4 py-1.5 rounded-xl bg-[#242424] hover:bg-[#333] text-white font-bold text-xs transition-colors border border-zinc-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

