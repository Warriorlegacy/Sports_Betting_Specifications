import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  Building,
  Coins,
  History,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    availableCredit: number;
    exposure: number;
  } | null;
  onBalanceUpdate: () => void;
  defaultTab?: 'DEPOSIT' | 'WITHDRAW' | 'HISTORY';
}

export const CashierModal: React.FC<CashierModalProps> = ({
  isOpen,
  onClose,
  user,
  onBalanceUpdate,
  defaultTab = 'DEPOSIT'
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>(defaultTab);

  // Deposit State
  const [depositMethod, setDepositMethod] = useState<'UPI' | 'CRYPTO' | 'BANK' | 'CARD'>('UPI');
  const [depositAmount, setDepositAmount] = useState<string>('2500');
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC20' | 'BEP20' | 'ERC20'>('TRC20');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'BANK' | 'CRYPTO'>('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [bankAccNumber, setBankAccNumber] = useState<string>('');
  const [bankIfsc, setBankIfsc] = useState<string>('');
  const [bankHolderName, setBankHolderName] = useState<string>('');
  const [cryptoAddress, setCryptoAddress] = useState<string>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<any | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BET'>('ALL');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setDepositSuccess(null);
      setWithdrawSuccess(null);
      setWithdrawError(null);
      if (activeTab === 'HISTORY') {
        fetchHistory();
      }
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (activeTab === 'HISTORY' && isOpen) {
      fetchHistory();
    }
  }, [activeTab, isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDepositSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    setDepositLoading(true);
    setDepositSuccess(null);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sports-exchange-backend-j1aj.onrender.com';

    try {
      const res = await fetch(`${apiUrl}/api/ledger/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod: depositMethod,
          referenceId: `DEP_${depositMethod}_${Date.now()}`,
          notes: `Instant ${depositMethod} Deposit`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deposit failed');
      }

      setDepositSuccess(data);
      onBalanceUpdate();
    } catch (err: any) {
      alert(err.message || 'Deposit could not be completed.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount');
      return;
    }

    if (user && amount > user.availableCredit) {
      setWithdrawError(`Amount exceeds available balance (₹${user.availableCredit.toFixed(2)})`);
      return;
    }

    let accountDetails: Record<string, any> = {};
    if (withdrawMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setWithdrawError('Please provide a valid UPI ID (e.g., name@okaxis)');
        return;
      }
      accountDetails = { upiId };
    } else if (withdrawMethod === 'BANK') {
      if (!bankAccNumber || !bankIfsc || !bankHolderName) {
        setWithdrawError('Please fill all bank account details (Account, IFSC, Name)');
        return;
      }
      accountDetails = {
        accountNumber: bankAccNumber,
        ifsc: bankIfsc.toUpperCase(),
        holderName: bankHolderName
      };
    } else if (withdrawMethod === 'CRYPTO') {
      if (!cryptoAddress || cryptoAddress.length < 15) {
        setWithdrawError('Please provide a valid crypto wallet address');
        return;
      }
      accountDetails = { network: cryptoNetwork, address: cryptoAddress };
    }

    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sports-exchange-backend-j1aj.onrender.com';

    try {
      const res = await fetch(`${apiUrl}/api/ledger/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          payoutMethod: withdrawMethod,
          accountDetails,
          notes: `Withdrawal via ${withdrawMethod}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setWithdrawSuccess(data);
      setWithdrawAmount('');
      onBalanceUpdate();
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sports-exchange-backend-j1aj.onrender.com';

    try {
      const [txRes, withRes] = await Promise.all([
        fetch(`${apiUrl}/api/ledger/my-transactions?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/ledger/my-withdrawals?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
      if (withRes.ok) {
        const withData = await withRes.json();
        setWithdrawals(withData.withdrawals || []);
      }
    } catch (e) {
      console.error('Failed to load transaction history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0b101d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Cashier & Banking</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>256-Bit SSL</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">Instant deposits, fast payouts & double-entry auditing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Overview Bar */}
        {user && (
          <div className="grid grid-cols-2 gap-4 px-6 py-3.5 bg-slate-950 border-b border-slate-800/60">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Available Cash Balance
              </span>
              <span className="text-xl font-black text-emerald-400 mono-num">
                ₹{user.availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Bet Exposure
              </span>
              <span className="text-xl font-black text-rose-400 mono-num">
                ₹{user.exposure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/40 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('DEPOSIT'); setDepositSuccess(null); }}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'DEPOSIT'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={() => { setActiveTab('WITHDRAW'); setWithdrawSuccess(null); setWithdrawError(null); }}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'WITHDRAW'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Payout</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-3 px-4 text-xs font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'HISTORY'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Statement History</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ======================= TAB 1: DEPOSIT ======================= */}
          {activeTab === 'DEPOSIT' && (
            <div className="space-y-6">
              {depositSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-center space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Deposit Successful!</h3>
                    <p className="text-sm text-emerald-300 mt-1">
                      ₹{depositSuccess.amount.toLocaleString()} has been credited to your available balance.
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      Ref: {depositSuccess.referenceId}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setDepositSuccess(null)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      Make Another Deposit
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                    >
                      Return to Sportsbook
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Select Payment Method */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">Select Payment Rail</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'UPI', label: '⚡ Instant UPI', sub: 'GPay, PhonePe, Paytm' },
                        { id: 'CRYPTO', label: '🪙 Crypto / USDT', sub: 'TRC-20, BEP-20' },
                        { id: 'BANK', label: '🏦 Bank IMPS', sub: 'Direct Wire / RTGS' },
                        { id: 'CARD', label: '💳 Cards / NetBanking', sub: 'Visa, MC, Rupay' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setDepositMethod(m.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            depositMethod === m.id
                              ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950 text-white'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-white">{m.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset Amount Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">Deposit Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter custom amount (min ₹100)"
                        className="w-full pl-8 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-white font-black text-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {[500, 1000, 2500, 5000, 10000, 25000, 50000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt.toString())}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            depositAmount === amt.toString()
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          +₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rail Details & Instructions */}
                  {depositMethod === 'UPI' && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Merchant UPI ID:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            nexuspay@icici
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('nexuspay@icici', 'upi')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedKey === 'upi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        Scan or pay via any UPI app (Google Pay, PhonePe, Paytm, Cred). Instant auto-approval within 2 seconds.
                      </div>
                    </div>
                  )}

                  {depositMethod === 'CRYPTO' && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex gap-2">
                        {(['TRC20', 'BEP20', 'ERC20'] as const).map(net => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setCryptoNetwork(net)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              cryptoNetwork === net ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            USDT-{net}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Deposit Address:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-[11px] font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 truncate max-w-[200px]">
                            {cryptoNetwork === 'TRC20' ? 'TQ9y7XZq...x89p2M' : '0x71C...99dF2'}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('TQ9y7XZqp8X99p2MNexusExchangeTronDeposit', 'crypto')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            {copiedKey === 'crypto' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Exchange Rate: 1 USDT ≈ ₹89.50. 1 network confirmation required.
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={depositLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                    onClick={() => handleDepositSubmit()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {depositLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Instant Deposit...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span>Complete Deposit of ₹{parseFloat(depositAmount || '0').toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ======================= TAB 2: WITHDRAW ======================= */}
          {activeTab === 'WITHDRAW' && (
            <div className="space-y-6">
              {withdrawSuccess ? (
                <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/80 text-center space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Clock className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Withdrawal Request Queued</h3>
                    <p className="text-sm text-blue-300 mt-1">
                      ₹{withdrawSuccess.amount.toLocaleString()} requested via {withdrawSuccess.payoutMethod}.
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Funds have been locked from your available credit and will dispatch within 5–15 minutes.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setWithdrawSuccess(null)}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                    >
                      New Withdrawal
                    </button>
                    <button
                      onClick={() => setActiveTab('HISTORY')}
                      className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                    >
                      View in History
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {withdrawError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  {/* Method Picker */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">Payout Destination</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'UPI', label: '⚡ UPI Direct', sub: 'Instant to Bank' },
                        { id: 'BANK', label: '🏦 Bank IMPS', sub: 'Account Transfer' },
                        { id: 'CRYPTO', label: '🪙 USDT (TRC20)', sub: 'Zero-Fee Payout' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            withdrawMethod === m.id
                              ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-950 text-white'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-white">{m.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-300">Withdrawal Amount (₹)</label>
                      {user && (
                        <span className="text-[11px] text-slate-400">
                          Max: <strong className="text-emerald-400">₹{user.availableCredit.toFixed(2)}</strong>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Min ₹500"
                        className="w-full pl-8 pr-20 py-3 bg-slate-900/80 border border-slate-700 rounded-2xl text-white font-black text-lg focus:outline-none focus:border-blue-500"
                      />
                      {user && (
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(user.availableCredit.toString())}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-black transition-all"
                        >
                          MAX
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payout Details Form */}
                  {withdrawMethod === 'UPI' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-300 block">Your UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {withdrawMethod === 'BANK' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">Account Holder Full Name</label>
                        <input
                          type="text"
                          value={bankHolderName}
                          onChange={(e) => setBankHolderName(e.target.value)}
                          placeholder="As registered with your bank"
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">Account Number</label>
                          <input
                            type="text"
                            value={bankAccNumber}
                            onChange={(e) => setBankAccNumber(e.target.value)}
                            placeholder="Bank Account No."
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">IFSC Code</label>
                          <input
                            type="text"
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                            placeholder="e.g. HDFC0001234"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm uppercase focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {withdrawMethod === 'CRYPTO' && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-300 block">USDT TRC-20 Wallet Address</label>
                      <input
                        type="text"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="Enter your Tron (TRC-20) address (starts with T)"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    onClick={() => handleWithdrawSubmit()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {withdrawLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Payout Request...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Request Withdrawal of ₹{parseFloat(withdrawAmount || '0').toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ======================= TAB 3: STATEMENT HISTORY ======================= */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'BET'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        historyFilter === f
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  onClick={fetchHistory}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                  title="Refresh Statement"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {historyLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading immutable ledger statement...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No transactions recorded yet. Make a deposit to start betting!
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {transactions
                    .filter(tx => {
                      if (historyFilter === 'DEPOSIT') return tx.transaction_type === 'DEPOSIT';
                      if (historyFilter === 'WITHDRAWAL') return tx.transaction_type.includes('WITHDRAWAL');
                      if (historyFilter === 'BET') return tx.transaction_type.includes('BET') || tx.transaction_type.includes('COMMISSION');
                      return true;
                    })
                    .map(tx => {
                      const isCredit = tx.receiver_id === user?.id || tx.transaction_type === 'DEPOSIT' || tx.transaction_type === 'BET_SETTLEMENT_WIN';
                      return (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isCredit ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <span>{tx.transaction_type.replace(/_/g, ' ')}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  #{tx.reference_id?.slice(0, 10)}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(tx.created_at).toLocaleString()} • {tx.notes || 'System transaction'}
                              </div>
                            </div>
                          </div>
                          <div className={`text-sm font-black mono-num ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isCredit ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
