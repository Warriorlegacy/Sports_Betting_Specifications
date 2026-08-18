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
  Sparkles,
  Gift,
  Download,
  Smartphone
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
  const [depositMethod, setDepositMethod] = useState<'UPI' | 'CRYPTO' | 'BANK'>('UPI');
  const [depositAmount, setDepositAmount] = useState<string>('2500');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('NEXUS100');
  const [promoApplied, setPromoApplied] = useState<boolean>(true);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Withdraw State
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'BANK' | 'CRYPTO'>('UPI');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('2000');
  const [upiId, setUpiId] = useState<string>('');
  const [bankAccNumber, setBankAccNumber] = useState<string>('');
  const [bankIfsc, setBankIfsc] = useState<string>('');
  const [bankHolderName, setBankHolderName] = useState<string>('');
  const [cryptoAddress, setCryptoAddress] = useState<string>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<any | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawStep, setWithdrawStep] = useState<number>(0);

  // History State
  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 'TXN_DEP_9921',
      type: 'DEPOSIT',
      method: 'UPI Instant',
      amount: 5000,
      bonus: 500,
      utr: '423987110943',
      status: 'COMPLETED',
      timestamp: 'Today, 02:45 PM'
    },
    {
      id: 'TXN_WTH_8812',
      type: 'WITHDRAWAL',
      method: 'IMPS Bank Transfer',
      amount: 3500,
      bonus: 0,
      utr: 'IMPS99812401',
      status: 'COMPLETED',
      timestamp: 'Yesterday, 07:12 PM'
    }
  ]);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DEPOSITS' | 'WITHDRAWALS'>('ALL');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setDepositSuccess(null);
      setWithdrawSuccess(null);
      setWithdrawError(null);
      setWithdrawStep(0);
    }
  }, [isOpen, defaultTab]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const quickDepositAmounts = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  // 1. EXECUTE INSTANT UPI / CRYPTO DEPOSIT WITH UTR VALIDATION
  const handleDepositSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 100) return;

    setDepositLoading(true);
    setTimeout(() => {
      setDepositLoading(false);
      const bonusAmt = promoApplied ? amount * 0.1 : 0;
      const totalCredit = amount + bonusAmt;

      const successData = {
        txnId: `TXN_${Date.now()}`,
        amount,
        bonus: bonusAmt,
        totalCredit,
        utr: utrNumber || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDepositSuccess(successData);

      // Add to transaction history
      setTransactions((prev) => [
        {
          id: successData.txnId,
          type: 'DEPOSIT',
          method: depositMethod === 'UPI' ? 'UPI Auto-UTR' : depositMethod === 'CRYPTO' ? 'USDT TRC20' : 'Bank IMPS',
          amount,
          bonus: bonusAmt,
          utr: successData.utr,
          status: 'COMPLETED',
          timestamp: 'Just now'
        },
        ...prev
      ]);

      if (user) {
        user.availableCredit += totalCredit;
      }
      onBalanceUpdate();
    }, 1500);
  };

  // 2. EXECUTE 5-SECOND AUTOMATED WITHDRAWAL
  const handleWithdrawSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWithdrawError(null);
    const amount = parseFloat(withdrawAmount);

    if (!user) return;
    if (!amount || amount < 500) {
      setWithdrawError('Minimum withdrawal amount is ₹500.');
      return;
    }

    const maxWithdrawable = Math.max(0, user.availableCredit - user.exposure);
    if (amount > maxWithdrawable) {
      setWithdrawError(`Cannot withdraw ₹${amount.toLocaleString()}. Maximum available without exposure risk is ₹${maxWithdrawable.toLocaleString()}.`);
      return;
    }

    setWithdrawLoading(true);
    setWithdrawStep(1);

    // Step 1: Security Audit
    setTimeout(() => {
      setWithdrawStep(2);
      // Step 2: Bank Clearing
      setTimeout(() => {
        setWithdrawStep(3);
        // Step 3: Payout Complete
        setTimeout(() => {
          setWithdrawLoading(false);
          user.availableCredit -= amount;
          onBalanceUpdate();

          const successData = {
            txnId: `WTH_${Date.now()}`,
            amount,
            destination: withdrawMethod === 'UPI' ? upiId || 'your UPI ID' : bankAccNumber || 'Bank Account',
            rrn: `RRN${Math.floor(100000000000 + Math.random() * 900000000000)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setWithdrawSuccess(successData);
          setTransactions((prev) => [
            {
              id: successData.txnId,
              type: 'WITHDRAWAL',
              method: withdrawMethod === 'UPI' ? 'Instant UPI Payout' : 'Bank IMPS Payout',
              amount,
              bonus: 0,
              utr: successData.rrn,
              status: 'COMPLETED',
              timestamp: 'Just now'
            },
            ...prev
          ]);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-4 sm:p-6 shadow-2xl relative z-10 space-y-4 text-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm uppercase tracking-wide text-white">
                  NEXUS<span className="text-[#f36c21]">VIP</span> CASHIER
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                  Auto-UTR Enabled
                </span>
              </div>
              <p className="text-[11px] text-[#adadad]">Instant UPI Deposits & 5-Second Automated Withdrawals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#272727] text-[#adadad] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Balance Overview Ribbon */}
        {user && (
          <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] flex items-center justify-between text-xs shrink-0">
            <div>
              <span className="text-[10px] text-[#adadad] block">Available Wallet Balance</span>
              <span className="font-mono font-black text-base text-[#27AE60]">
                ₹{user.availableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#adadad] block">Open Risk Exposure</span>
              <span className="font-mono font-bold text-sm text-[#FF4148]">
                ₹{user.exposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-xl border border-[#272727] text-xs font-bold shrink-0">
          <button
            onClick={() => {
              setActiveTab('DEPOSIT');
              setDepositSuccess(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'DEPOSIT'
                ? 'bg-[#f36c21] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('WITHDRAW');
              setWithdrawSuccess(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'WITHDRAW'
                ? 'bg-[#27AE60] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-[#0d6efd] text-white shadow'
                : 'text-[#adadad] hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Ledger History</span>
          </button>
        </div>

        {/* TAB BODY CONTAINER (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* ======================================================== */}
          {/* TAB 1: DEPOSIT */}
          {/* ======================================================== */}
          {activeTab === 'DEPOSIT' && (
            <>
              {depositSuccess ? (
                <div className="p-6 bg-[#141414] rounded-xl border border-emerald-600/40 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-14 h-14 mx-auto text-[#27AE60] animate-bounce" />
                  <h4 className="font-black text-base text-white">Deposit Verified & Credited!</h4>
                  <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333] max-w-sm mx-auto text-left space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#adadad]">
                      <span>Amount Credited:</span>
                      <span className="font-mono font-black text-[#27AE60]">₹{depositSuccess.amount.toLocaleString()}</span>
                    </div>
                    {depositSuccess.bonus > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>VIP Bonus:</span>
                        <span className="font-mono font-bold">+₹{depositSuccess.bonus.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#adadad]">
                      <span>UTR / Reference:</span>
                      <span className="font-mono font-bold text-white">{depositSuccess.utr}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDepositSuccess(null)}
                    className="px-6 py-2 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] text-white font-bold text-xs uppercase"
                  >
                    Make Another Deposit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDepositMethod('UPI')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'UPI'
                          ? 'bg-[#f36c21]/20 border-[#f36c21] text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-[#f36c21]" />
                      <span className="font-bold text-[11px]">Instant UPI QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('CRYPTO')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'CRYPTO'
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-[11px]">USDT / Crypto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('BANK')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'BANK'
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Building className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-[11px]">Bank IMPS</span>
                    </button>
                  </div>

                  {/* Amount Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-[#adadad]">Deposit Amount (₹)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2.5 text-lg font-mono font-black text-white focus:border-[#f36c21] focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {quickDepositAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(String(amt))}
                          className="px-2.5 py-1 rounded bg-[#272727] hover:bg-[#333] text-[11px] font-mono font-bold text-[#adadad] hover:text-white"
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPI QR & Copy Section */}
                  {depositMethod === 'UPI' && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center shrink-0 shadow">
                          <QrCode className="w-24 h-24 text-black" />
                        </div>
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div>
                            <span className="text-[10px] text-[#adadad] block uppercase font-bold">Official Nexusvip UPI ID</span>
                            <div className="flex items-center justify-center sm:justify-start space-x-2 mt-0.5">
                              <code className="font-mono font-black text-sm text-[#27AE60]">nexusvip.pay@icici</code>
                              <button
                                onClick={() => copyToClipboard('nexusvip.pay@icici', 'upi')}
                                className="p-1 rounded bg-[#272727] text-white hover:bg-[#333]"
                              >
                                {copiedKey === 'upi' ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#8e8e8e]">
                            Scan using PhonePe, Google Pay, Paytm, or BHIM. After paying, enter your 12-digit UTR below.
                          </p>
                        </div>
                      </div>

                      {/* UTR Input Form */}
                      <form onSubmit={handleDepositSubmit} className="space-y-2 pt-2 border-t border-[#222]">
                        <label className="text-[10px] font-bold uppercase text-amber-400 block">
                          Enter 12-Digit UPI UTR / Ref No.
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={12}
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 423987110943"
                            className="flex-1 bg-[#1e1e1e] border border-amber-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={depositLoading || !depositAmount}
                            className="px-5 py-2 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] disabled:opacity-50 text-white font-black text-xs uppercase transition-all shadow"
                          >
                            {depositLoading ? 'Verifying...' : 'Verify UTR'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Crypto Section */}
                  {depositMethod === 'CRYPTO' && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#adadad]">Equivalent USDT (TRC-20):</span>
                        <span className="font-mono font-black text-amber-400">
                          {(parseFloat(depositAmount || '0') / 85).toFixed(2)} USDT
                        </span>
                      </div>
                      <label className="text-[10px] text-[#adadad] uppercase font-bold block">Deposit Wallet Address</label>
                      <div className="flex items-center space-x-2 bg-[#1e1e1e] p-2 rounded-lg border border-[#333]">
                        <code className="font-mono text-[11px] text-amber-300 truncate flex-1">
                          TJX9vNp8Wk2mQ7LaR3vB1dF5uP4zY6eH
                        </code>
                        <button
                          onClick={() => copyToClipboard('TJX9vNp8Wk2mQ7LaR3vB1dF5uP4zY6eH', 'crypto')}
                          className="p-1 rounded bg-[#272727] text-white hover:bg-[#333]"
                        >
                          {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDepositSubmit()}
                        disabled={depositLoading}
                        className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase"
                      >
                        {depositLoading ? 'Verifying Block...' : 'I Have Transferred USDT'}
                      </button>
                    </div>
                  )}

                  {/* Bank Transfer Section */}
                  {depositMethod === 'BANK' && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-2 text-[11px]">
                      <div className="grid grid-cols-2 gap-2 text-[#adadad]">
                        <div>Bank Name: <span className="text-white font-bold block">ICICI Bank Ltd</span></div>
                        <div>Account Name: <span className="text-white font-bold block">NEXUSVIP ENTERPRISES</span></div>
                        <div>Account Number: <span className="text-white font-mono font-bold block">50200088912456</span></div>
                        <div>IFSC Code: <span className="text-white font-mono font-bold block">ICIC0000104</span></div>
                      </div>
                      <button
                        onClick={() => handleDepositSubmit()}
                        disabled={depositLoading}
                        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase"
                      >
                        {depositLoading ? 'Verifying IMPS...' : 'Submit IMPS Reference'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 2: WITHDRAW */}
          {/* ======================================================== */}
          {activeTab === 'WITHDRAW' && (
            <>
              {withdrawSuccess ? (
                <div className="p-6 bg-[#141414] rounded-xl border border-emerald-600/40 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-14 h-14 mx-auto text-[#27AE60] animate-bounce" />
                  <h4 className="font-black text-base text-white">Withdrawal Dispatched!</h4>
                  <p className="text-xs text-[#adadad]">
                    ₹{withdrawSuccess.amount.toLocaleString()} has been sent to {withdrawSuccess.destination}.
                  </p>
                  <div className="p-2.5 bg-[#1e1e1e] rounded-lg border border-[#333] text-left max-w-sm mx-auto text-xs space-y-1">
                    <div className="flex justify-between text-[#adadad]">
                      <span>Bank Reference RRN:</span>
                      <span className="font-mono font-bold text-white">{withdrawSuccess.rrn}</span>
                    </div>
                    <div className="flex justify-between text-[#adadad]">
                      <span>Estimated Arrival:</span>
                      <span className="text-[#27AE60] font-bold">5 - 10 Seconds</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setWithdrawSuccess(null)}
                    className="px-6 py-2 rounded-lg bg-[#27AE60] hover:bg-[#219652] text-white font-bold text-xs uppercase"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  {withdrawError && (
                    <div className="p-2.5 rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{withdrawError}</span>
                    </div>
                  )}

                  {/* Method Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('UPI')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                        withdrawMethod === 'UPI'
                          ? 'bg-[#27AE60]/20 border-[#27AE60] text-white font-bold'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad]'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-[#27AE60]" />
                      <span>Instant UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('BANK')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                        withdrawMethod === 'BANK'
                          ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad]'
                      }`}
                    >
                      <Building className="w-4 h-4 text-blue-400" />
                      <span>Bank IMPS</span>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-[#adadad]">Withdraw Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min={500}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-base font-mono font-black text-white focus:border-[#27AE60] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#8e8e8e]">Minimum: ₹500 • Maximum: ₹500,000 per transaction</span>
                  </div>

                  {/* UPI Inputs */}
                  {withdrawMethod === 'UPI' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-[#adadad]">Your UPI ID (VPA)</label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9876543210@paytm or user@oksbi"
                        className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-white font-mono font-bold text-xs focus:border-[#27AE60] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Bank Inputs */}
                  {withdrawMethod === 'BANK' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#adadad]">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          value={bankHolderName}
                          onChange={(e) => setBankHolderName(e.target.value)}
                          placeholder="Name as per bank records"
                          className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-1.5 text-white text-xs font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#adadad]">Account Number</label>
                          <input
                            type="text"
                            required
                            value={bankAccNumber}
                            onChange={(e) => setBankAccNumber(e.target.value)}
                            placeholder="Bank Account Number"
                            className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-1.5 text-white font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-[#adadad]">IFSC Code</label>
                          <input
                            type="text"
                            required
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                            placeholder="e.g. SBIN0001234"
                            className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-1.5 text-white font-mono font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Withdrawal Processing Tracker (Simulated 5-second progress) */}
                  {withdrawLoading && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-emerald-500/40 space-y-2 animate-in fade-in">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Fast Payout...</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-[#adadad]">
                        <div className={`flex items-center space-x-2 ${withdrawStep >= 1 ? 'text-[#27AE60]' : ''}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>1. Risk & Exposure Check: Cleared</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${withdrawStep >= 2 ? 'text-[#27AE60]' : ''}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>2. Automated IMPS Payout Gate: Initiated</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${withdrawStep >= 3 ? 'text-[#27AE60]' : ''}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3. Bank Credit Transfer: Finalizing</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={withdrawLoading || !withdrawAmount}
                    className="w-full py-2.5 rounded-lg bg-[#27AE60] hover:bg-[#219652] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow"
                  >
                    {withdrawLoading ? 'Clearing Payout...' : `Withdraw ₹${parseFloat(withdrawAmount || '0').toLocaleString()} Instantly`}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 3: LEDGER HISTORY */}
          {/* ======================================================== */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#adadad]">Recent Transactions</span>
                <div className="flex space-x-1 text-[10px]">
                  <button
                    onClick={() => setHistoryFilter('ALL')}
                    className={`px-2 py-0.5 rounded ${historyFilter === 'ALL' ? 'bg-[#f36c21] text-white' : 'bg-[#272727] text-[#adadad]'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setHistoryFilter('DEPOSITS')}
                    className={`px-2 py-0.5 rounded ${historyFilter === 'DEPOSITS' ? 'bg-[#f36c21] text-white' : 'bg-[#272727] text-[#adadad]'}`}
                  >
                    Deposits
                  </button>
                  <button
                    onClick={() => setHistoryFilter('WITHDRAWALS')}
                    className={`px-2 py-0.5 rounded ${historyFilter === 'WITHDRAWALS' ? 'bg-[#f36c21] text-white' : 'bg-[#272727] text-[#adadad]'}`}
                  >
                    Withdrawals
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {transactions
                  .filter((t) => {
                    if (historyFilter === 'DEPOSITS') return t.type === 'DEPOSIT';
                    if (historyFilter === 'WITHDRAWALS') return t.type === 'WITHDRAWAL';
                    return true;
                  })
                  .map((t) => (
                    <div key={t.id} className="p-2.5 bg-[#141414] rounded-lg border border-[#2d2d2d] flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            t.type === 'DEPOSIT' ? 'bg-emerald-950 text-[#27AE60]' : 'bg-blue-950 text-blue-400'
                          }`}
                        >
                          {t.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{t.method}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">
                              {t.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8e8e8e] font-mono">{t.utr} • {t.timestamp}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`font-black ${t.type === 'DEPOSIT' ? 'text-[#27AE60]' : 'text-white'}`}>
                          {t.type === 'DEPOSIT' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Security Footer */}
        <div className="pt-2 border-t border-[#2d2d2d] flex items-center justify-between text-[10px] text-[#8e8e8e] shrink-0">
          <div className="flex items-center space-x-1.5 text-[#27AE60]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Nexusvip Gateway</span>
          </div>
          <span>24/7 WhatsApp Financial Desk</span>
        </div>
      </div>
    </div>
  );
};
