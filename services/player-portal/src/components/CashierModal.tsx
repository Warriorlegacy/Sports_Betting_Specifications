import React, { useState, useEffect, useCallback } from 'react';
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
  Smartphone
} from 'lucide-react';
import { api } from '../services/api';

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

  // Dynamic Payment Methods loaded from backend
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [methodsLoading, setMethodsLoading] = useState<boolean>(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  // Deposit State
  const [depositMethod, setDepositMethod] = useState<'UPI' | 'BANK' | 'CRYPTO'>('UPI');
  const [depositAmount, setDepositAmount] = useState<string>('2500');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<any | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
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

  // History State
  const [myDeposits, setMyDeposits] = useState<any[]>([]);
  const [myWithdrawals, setMyWithdrawals] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'DEPOSITS' | 'WITHDRAWALS'>('ALL');

  // Load Active Payment Methods
  const loadPaymentMethods = useCallback(async () => {
    try {
      setMethodsLoading(true);
      const res = await api.paymentMethods.getActive();
      const accounts = res.accounts || [];
      setPaymentMethods(accounts);
      if (accounts.length > 0) {
        const upiAccount = accounts.find((a: any) => a.accountType === 'UPI') || accounts[0];
        setSelectedMethodId(upiAccount.id);
        setDepositMethod(upiAccount.accountType);
      }
    } catch (err) {
      console.error('Failed to load active deposit methods:', err);
    } finally {
      setMethodsLoading(false);
    }
  }, []);

  // Load History
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const [depRes, wthRes] = await Promise.all([
        api.ledger.getMyDeposits().catch(() => ({ deposits: [] })),
        api.ledger.getMyWithdrawals().catch(() => ({ withdrawals: [] }))
      ]);
      setMyDeposits(depRes.deposits || []);
      setMyWithdrawals(wthRes.withdrawals || []);
    } catch (err) {
      console.error('Failed to load cashier history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setDepositSuccess(null);
      setDepositError(null);
      setWithdrawSuccess(null);
      setWithdrawError(null);
      loadPaymentMethods();
      loadHistory();
    }
  }, [isOpen, defaultTab, loadPaymentMethods, loadHistory]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const quickDepositAmounts = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  // Active method details
  const selectedAccount = paymentMethods.find((a) => a.id === selectedMethodId) || paymentMethods[0];

  // 1. SUBMIT DEPOSIT REQUEST TO BACKEND API
  const handleDepositSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDepositError(null);
    const amount = parseFloat(depositAmount);

    if (!amount || amount < 100) {
      setDepositError('Minimum deposit amount is ₹100.');
      return;
    }
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setDepositError('Please enter a valid 12-digit UPI / IMPS UTR transaction reference.');
      return;
    }

    try {
      setDepositLoading(true);
      const res = await api.ledger.submitDepositRequest({
        amount,
        paymentMethod: depositMethod,
        utrReference: utrNumber.trim(),
        depositAccountId: selectedAccount ? selectedAccount.id : undefined
      });

      setDepositSuccess({
        amount,
        utr: utrNumber.trim(),
        method: selectedAccount ? selectedAccount.displayName : depositMethod,
        status: res.deposit ? res.deposit.status : 'PENDING'
      });
      setUtrNumber('');
      onBalanceUpdate();
      loadHistory();
    } catch (err: any) {
      setDepositError(err.message || 'Failed to submit deposit request');
    } finally {
      setDepositLoading(false);
    }
  };

  // 2. SUBMIT WITHDRAWAL REQUEST TO BACKEND API
  const handleWithdrawSubmit = async (e?: React.FormEvent) => {
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
      setWithdrawError(`Cannot withdraw ₹${amount.toLocaleString()}. Maximum available without active risk is ₹${maxWithdrawable.toLocaleString()}.`);
      return;
    }

    const accountDetails: Record<string, any> = {};
    if (withdrawMethod === 'UPI') {
      if (!upiId.trim()) {
        setWithdrawError('Please enter your valid UPI ID (e.g. 9876543210@paytm).');
        return;
      }
      accountDetails.upiId = upiId.trim();
    } else if (withdrawMethod === 'BANK') {
      if (!bankAccNumber.trim() || !bankIfsc.trim() || !bankHolderName.trim()) {
        setWithdrawError('Please enter complete Bank Account Number, IFSC code, and Account Holder Name.');
        return;
      }
      accountDetails.bankAccNumber = bankAccNumber.trim();
      accountDetails.bankIfsc = bankIfsc.trim().toUpperCase();
      accountDetails.bankHolderName = bankHolderName.trim();
    } else if (withdrawMethod === 'CRYPTO') {
      if (!cryptoAddress.trim()) {
        setWithdrawError('Please enter your USDT TRC-20 wallet address.');
        return;
      }
      accountDetails.cryptoAddress = cryptoAddress.trim();
      accountDetails.cryptoNetwork = 'TRC20';
    }

    try {
      setWithdrawLoading(true);
      const res = await api.ledger.requestWithdrawal({
        amount,
        payoutMethod: withdrawMethod,
        accountDetails
      });

      setWithdrawSuccess({
        amount,
        destination: withdrawMethod === 'UPI' ? upiId : withdrawMethod === 'BANK' ? `${bankHolderName} (${bankAccNumber})` : cryptoAddress,
        payoutMethod: withdrawMethod,
        ref: res.withdrawal ? res.withdrawal.id : `WTH_${Date.now()}`
      });
      user.availableCredit -= amount;
      onBalanceUpdate();
      loadHistory();
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to process withdrawal request');
    } finally {
      setWithdrawLoading(false);
    }
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
                  Live Banking Gateway
                </span>
              </div>
              <p className="text-[11px] text-[#adadad]">Instant Multi-Bank Deposits & Automated Fast Withdrawals</p>
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
              <span className="text-[10px] text-[#adadad] block">Active Risk Liability</span>
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
            <span>Deposit Funds</span>
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
            <span>Withdraw Funds</span>
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
            <span>My Passbook</span>
          </button>
        </div>

        {/* TAB BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* ======================================================== */}
          {/* TAB 1: DEPOSIT */}
          {/* ======================================================== */}
          {activeTab === 'DEPOSIT' && (
            <>
              {depositSuccess ? (
                <div className="p-6 bg-[#141414] rounded-xl border border-emerald-600/40 text-center space-y-3 animate-in zoom-in-95">
                  <CheckCircle2 className="w-14 h-14 mx-auto text-[#27AE60] animate-bounce" />
                  <h4 className="font-black text-base text-white">Deposit Request Submitted!</h4>
                  <p className="text-xs text-[#adadad]">
                    Your deposit reference has been recorded in the Admin clearing desk.
                  </p>
                  <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333] max-w-sm mx-auto text-left space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#adadad]">
                      <span>Amount:</span>
                      <span className="font-black text-[#27AE60]">₹{depositSuccess.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#adadad]">
                      <span>UTR / Reference:</span>
                      <span className="font-bold text-white">{depositSuccess.utr}</span>
                    </div>
                    <div className="flex justify-between text-[#adadad]">
                      <span>Status:</span>
                      <span className="text-amber-400 font-bold">QUEUED FOR APPROVAL</span>
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
                  {depositError && (
                    <div className="p-2.5 rounded-lg bg-[#FF4148]/20 border border-[#FF4148]/40 text-[#FF4148] text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{depositError}</span>
                    </div>
                  )}

                  {/* Method Selector Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDepositMethod('UPI');
                        const uAcc = paymentMethods.find((a) => a.accountType === 'UPI');
                        if (uAcc) setSelectedMethodId(uAcc.id);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'UPI'
                          ? 'bg-[#f36c21]/20 border-[#f36c21] text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-[#f36c21]" />
                      <span className="font-bold text-[11px]">UPI & QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDepositMethod('BANK');
                        const bAcc = paymentMethods.find((a) => a.accountType === 'BANK');
                        if (bAcc) setSelectedMethodId(bAcc.id);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'BANK'
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Building className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-[11px]">Bank IMPS Transfer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDepositMethod('CRYPTO');
                        const cAcc = paymentMethods.find((a) => a.accountType === 'CRYPTO');
                        if (cAcc) setSelectedMethodId(cAcc.id);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all ${
                        depositMethod === 'CRYPTO'
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-[#141414] border-[#2d2d2d] text-[#adadad] hover:border-[#444]'
                      }`}
                    >
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-[11px]">USDT (TRC-20)</span>
                    </button>
                  </div>

                  {/* Multiple Accounts Dropdown if multiple exist */}
                  {paymentMethods.filter((a) => a.accountType === depositMethod).length > 1 && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#adadad]">
                        Select Receiving Gateway Account
                      </label>
                      <select
                        value={selectedMethodId}
                        onChange={(e) => setSelectedMethodId(e.target.value)}
                        className="w-full bg-[#141414] border border-[#333] rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {paymentMethods
                          .filter((a) => a.accountType === depositMethod)
                          .map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.displayName} ({acc.bankName || acc.upiId || acc.cryptoNetwork})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

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
                            <span className="text-[10px] text-[#adadad] block uppercase font-bold">
                              {selectedAccount ? selectedAccount.displayName : 'Official Nexusvip UPI ID'}
                            </span>
                            <div className="flex items-center justify-center sm:justify-start space-x-2 mt-0.5">
                              <code className="font-mono font-black text-sm text-[#27AE60]">
                                {selectedAccount?.upiId || 'nexusvip.pay@icici'}
                              </code>
                              <button
                                onClick={() => copyToClipboard(selectedAccount?.upiId || 'nexusvip.pay@icici', 'upi')}
                                className="p-1 rounded bg-[#272727] text-white hover:bg-[#333]"
                              >
                                {copiedKey === 'upi' ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#8e8e8e]">
                            Pay via PhonePe, Google Pay, Paytm, or BHIM. Enter your 12-digit UTR below.
                          </p>
                        </div>
                      </div>

                      {/* UTR Input Form */}
                      <form onSubmit={handleDepositSubmit} className="space-y-2 pt-2 border-t border-[#222]">
                        <label className="text-[10px] font-bold uppercase text-amber-400 block">
                          Enter 12-Digit UPI UTR / Transaction Ref No. *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={16}
                            required
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
                            {depositLoading ? 'Submitting...' : 'Submit Deposit'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Bank Transfer Section */}
                  {depositMethod === 'BANK' && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-3">
                      <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333] space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#adadad]">Bank Name:</span>
                          <span className="font-bold text-white">{selectedAccount?.bankName || 'ICICI Bank Ltd'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#adadad]">Beneficiary:</span>
                          <span className="font-bold text-slate-200">{selectedAccount?.accountHolder || 'NEXUSVIP ENTERPRISES LTD'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#adadad]">Account Number:</span>
                          <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                            <span>{selectedAccount?.accountNumber || '50200088912456'}</span>
                            <button
                              onClick={() => copyToClipboard(selectedAccount?.accountNumber || '50200088912456', 'bank_acc')}
                              className="p-0.5 rounded bg-[#272727]"
                            >
                              {copiedKey === 'bank_acc' ? <Check className="w-3 h-3 text-[#27AE60]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#adadad]">IFSC Code:</span>
                          <div className="flex items-center space-x-1.5 text-[#27AE60] font-bold">
                            <span>{selectedAccount?.ifscCode || 'ICIC0000104'}</span>
                            <button
                              onClick={() => copyToClipboard(selectedAccount?.ifscCode || 'ICIC0000104', 'bank_ifsc')}
                              className="p-0.5 rounded bg-[#272727]"
                            >
                              {copiedKey === 'bank_ifsc' ? <Check className="w-3 h-3 text-[#27AE60]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* IMPS UTR Form */}
                      <form onSubmit={handleDepositSubmit} className="space-y-2 pt-2 border-t border-[#222]">
                        <label className="text-[10px] font-bold uppercase text-amber-400 block">
                          Enter Bank IMPS / NEFT 12-Digit RRN / UTR *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. IMPS423987110943"
                            className="flex-1 bg-[#1e1e1e] border border-blue-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={depositLoading || !depositAmount}
                            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase transition-all shadow"
                          >
                            {depositLoading ? 'Submitting...' : 'Submit IMPS UTR'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Crypto Section */}
                  {depositMethod === 'CRYPTO' && (
                    <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#adadad]">Approx. USDT equivalent:</span>
                        <span className="font-mono font-black text-amber-400">
                          {(parseFloat(depositAmount || '0') / 86).toFixed(2)} USDT
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#1e1e1e] p-2 rounded-lg border border-[#333]">
                        <code className="font-mono text-[11px] text-amber-300 truncate flex-1">
                          {selectedAccount?.cryptoAddress || 'TJX9vNp8Wk2mQ7LaR3vB1dF5uP4zY6eH'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedAccount?.cryptoAddress || 'TJX9vNp8Wk2mQ7LaR3vB1dF5uP4zY6eH', 'crypto')}
                          className="p-1 rounded bg-[#272727] text-white hover:bg-[#333]"
                        >
                          {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <form onSubmit={handleDepositSubmit} className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-amber-400 block">
                          Enter Blockchain Transaction Hash (TxID) *
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            placeholder="e.g. 7c9a1b2e3f4d..."
                            className="flex-1 bg-[#1e1e1e] border border-amber-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold text-xs"
                          />
                          <button
                            type="submit"
                            disabled={depositLoading}
                            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase"
                          >
                            {depositLoading ? 'Verifying...' : 'Submit TxID'}
                          </button>
                        </div>
                      </form>
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
                  <h4 className="font-black text-base text-white">Withdrawal Request Dispatched!</h4>
                  <p className="text-xs text-[#adadad]">
                    ₹{withdrawSuccess.amount.toLocaleString()} will be credited to {withdrawSuccess.destination}.
                  </p>
                  <div className="p-2.5 bg-[#1e1e1e] rounded-lg border border-[#333] text-left max-w-sm mx-auto text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-[#adadad]">
                      <span>Withdrawal Ref:</span>
                      <span className="font-bold text-white">{withdrawSuccess.ref.slice(0, 16)}</span>
                    </div>
                    <div className="flex justify-between text-[#adadad]">
                      <span>Status:</span>
                      <span className="text-amber-400 font-bold">QUEUED FOR DISPATCH</span>
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
                      <span>Instant UPI VPA</span>
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
                      <span>Bank IMPS Direct</span>
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
                    <span className="text-[10px] text-[#8e8e8e]">Minimum: ₹500 • Maximum: ₹500,000 per request</span>
                  </div>

                  {/* UPI Inputs */}
                  {withdrawMethod === 'UPI' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-[#adadad]">Your UPI ID (VPA) *</label>
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
                        <label className="text-[10px] font-bold uppercase text-[#adadad]">Account Holder Name *</label>
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
                          <label className="text-[10px] font-bold uppercase text-[#adadad]">Account Number *</label>
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
                          <label className="text-[10px] font-bold uppercase text-[#adadad]">IFSC Code *</label>
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

                  <button
                    type="submit"
                    disabled={withdrawLoading || !withdrawAmount}
                    className="w-full py-2.5 rounded-lg bg-[#27AE60] hover:bg-[#219652] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow"
                  >
                    {withdrawLoading ? 'Processing Request...' : `Request Withdrawal of ₹${parseFloat(withdrawAmount || '0').toLocaleString()}`}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PASSBOOK HISTORY */}
          {/* ======================================================== */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#adadad]">Transaction History</span>
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

              {historyLoading ? (
                <div className="p-8 text-center text-[#adadad]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#f36c21] mb-1" />
                  <span>Loading history...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Deposits List */}
                  {(historyFilter === 'ALL' || historyFilter === 'DEPOSITS') &&
                    myDeposits.map((dep) => {
                      const dt = new Date(dep.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={dep.id} className="p-2.5 bg-[#141414] rounded-lg border border-[#2d2d2d] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-950 text-[#27AE60]">
                              <ArrowDownLeft className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>Deposit ({dep.payment_method})</span>
                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                  dep.status === 'APPROVED'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : dep.status === 'REJECTED'
                                    ? 'bg-red-950 text-red-400'
                                    : 'bg-amber-950 text-amber-400'
                                }`}>
                                  {dep.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8e8e8e] font-mono">
                                UTR: {dep.utr_reference} • {dt}
                              </span>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-black text-[#27AE60]">
                              +₹{parseFloat(dep.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {/* Withdrawals List */}
                  {(historyFilter === 'ALL' || historyFilter === 'WITHDRAWALS') &&
                    myWithdrawals.map((wth) => {
                      const dt = new Date(wth.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <div key={wth.id} className="p-2.5 bg-[#141414] rounded-lg border border-[#2d2d2d] flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-950 text-blue-400">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>Withdrawal ({wth.payout_method})</span>
                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                  wth.status === 'APPROVED'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : wth.status === 'REJECTED'
                                    ? 'bg-red-950 text-red-400'
                                    : 'bg-amber-950 text-amber-400'
                                }`}>
                                  {wth.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8e8e8e] font-mono">
                                Ref: {wth.reference_id || wth.id.slice(0, 8)} • {dt}
                              </span>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-black text-white">
                              -₹{parseFloat(wth.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {myDeposits.length === 0 && myWithdrawals.length === 0 && (
                    <div className="p-6 text-center text-[#8e8e8e]">
                      No transaction history found.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="pt-2 border-t border-[#2d2d2d] flex items-center justify-between text-[10px] text-[#8e8e8e] shrink-0">
          <div className="flex items-center space-x-1.5 text-[#27AE60]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted Banking Channel</span>
          </div>
          <span>Instant Settlement Assurance</span>
        </div>
      </div>
    </div>
  );
};
