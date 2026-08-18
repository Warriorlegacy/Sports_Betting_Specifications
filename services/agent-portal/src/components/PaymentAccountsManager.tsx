import React, { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Smartphone,
  QrCode,
  Coins,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Star,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export interface DepositAccount {
  id: string;
  accountType: 'BANK' | 'UPI' | 'QR' | 'CRYPTO';
  displayName: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
  cryptoNetwork?: string;
  cryptoAddress?: string;
  minDeposit: number;
  maxDeposit: number;
  dailyLimit?: number;
  instructions?: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export const PaymentAccountsManager: React.FC = () => {
  const [accounts, setAccounts] = useState<DepositAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | 'BANK' | 'UPI' | 'CRYPTO'>('ALL');

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<DepositAccount | null>(null);

  // Form State
  const [accountType, setAccountType] = useState<'BANK' | 'UPI' | 'CRYPTO'>('BANK');
  const [displayName, setDisplayName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('ICICI Bank Ltd');
  const [accountHolder, setAccountHolder] = useState<string>('NEXUSVIP ENTERPRISES LTD');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [branch, setBranch] = useState<string>('Nariman Point Mumbai');
  const [upiId, setUpiId] = useState<string>('nexusvip.pay@icici');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [cryptoNetwork, setCryptoNetwork] = useState<string>('TRC20');
  const [cryptoAddress, setCryptoAddress] = useState<string>('');
  const [minDeposit, setMinDeposit] = useState<string>('500');
  const [maxDeposit, setMaxDeposit] = useState<string>('500000');
  const [instructions, setInstructions] = useState<string>('Enter 12-digit UTR after completing payment.');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.paymentMethods.getAll();
      setAccounts(res.accounts || []);
    } catch (err) {
      console.error('Failed to fetch payment accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenAdd = (type: 'BANK' | 'UPI' | 'CRYPTO') => {
    setEditingAccount(null);
    setAccountType(type);
    setDisplayName(type === 'BANK' ? 'Corporate IMPS Current Account' : type === 'UPI' ? 'Official PhonePe / Google Pay QR' : 'USDT TRC20 Wallet');
    setBankName('ICICI Bank Ltd');
    setAccountHolder('NEXUSVIP ENTERPRISES LTD');
    setAccountNumber('');
    setIfscCode('');
    setBranch('Main Branch');
    setUpiId('nexusvip.pay@icici');
    setQrCodeUrl('');
    setCryptoNetwork('TRC20');
    setCryptoAddress('');
    setMinDeposit(type === 'UPI' ? '100' : '500');
    setMaxDeposit('500000');
    setInstructions('Enter 12-digit UTR number after payment confirmation.');
    setIsActive(true);
    setIsPrimary(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: DepositAccount) => {
    setEditingAccount(acc);
    setAccountType(acc.accountType as any);
    setDisplayName(acc.displayName);
    setBankName(acc.bankName || '');
    setAccountHolder(acc.accountHolder || '');
    setAccountNumber(acc.accountNumber || '');
    setIfscCode(acc.ifscCode || '');
    setBranch(acc.branch || '');
    setUpiId(acc.upiId || '');
    setQrCodeUrl(acc.qrCodeUrl || '');
    setCryptoNetwork(acc.cryptoNetwork || 'TRC20');
    setCryptoAddress(acc.cryptoAddress || '');
    setMinDeposit(String(acc.minDeposit));
    setMaxDeposit(String(acc.maxDeposit));
    setInstructions(acc.instructions || '');
    setIsActive(acc.isActive);
    setIsPrimary(acc.isPrimary);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!displayName.trim()) {
      setFormError('Display name is required');
      return;
    }

    if (accountType === 'BANK' && (!accountNumber.trim() || !ifscCode.trim() || !bankName.trim())) {
      setFormError('Bank Name, Account Number, and IFSC Code are mandatory for Bank accounts');
      return;
    }

    if (accountType === 'UPI' && !upiId.trim() && !qrCodeUrl.trim()) {
      setFormError('UPI ID or QR Code URL is required for UPI accounts');
      return;
    }

    const payload = {
      accountType,
      displayName: displayName.trim(),
      bankName: bankName.trim(),
      accountHolder: accountHolder.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      branch: branch.trim(),
      upiId: upiId.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
      cryptoNetwork: cryptoNetwork.trim(),
      cryptoAddress: cryptoAddress.trim(),
      minDeposit: parseFloat(minDeposit) || 100,
      maxDeposit: parseFloat(maxDeposit) || 500000,
      instructions: instructions.trim(),
      isActive,
      isPrimary
    };

    try {
      setSubmitting(true);
      if (editingAccount) {
        await api.paymentMethods.update(editingAccount.id, payload);
      } else {
        await api.paymentMethods.create(payload);
      }
      setModalOpen(false);
      await fetchAccounts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (acc: DepositAccount) => {
    try {
      await api.paymentMethods.update(acc.id, { isActive: !acc.isActive });
      await fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleTogglePrimary = async (acc: DepositAccount) => {
    try {
      await api.paymentMethods.update(acc.id, { isPrimary: true });
      await fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to set primary account');
    }
  };


  const handleDelete = async (acc: DepositAccount) => {
    if (!confirm(`Are you sure you want to delete '${acc.displayName}'? Players will no longer be able to deposit to this account.`)) {
      return;
    }
    try {
      await api.paymentMethods.delete(acc.id);
      await fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    if (activeTypeTab === 'ALL') return true;
    return a.accountType === activeTypeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#f36c21]" />
              Deposit Accounts & Banking Manager
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-950/80 text-amber-300 border border-orange-700/60">
              Live Player Gateway
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add multiple bank accounts, UPI IDs, and dynamic QR codes. Active accounts reflect immediately in the Player Cashier.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenAdd('BANK')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#333] text-white text-xs font-bold transition-all border border-zinc-700 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#f36c21]" />
            <span>Add Bank Account</span>
          </button>

          <button
            onClick={() => handleOpenAdd('UPI')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add UPI / QR Code</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-2">
        {(['ALL', 'BANK', 'UPI', 'CRYPTO'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTypeTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTypeTab === tab
                ? 'bg-[#f36c21] text-white shadow-md shadow-orange-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            {tab === 'ALL' ? 'All Gateways' : tab === 'BANK' ? 'Bank Accounts' : tab === 'UPI' ? 'UPI & QR Codes' : 'Crypto Wallets'}
          </button>
        ))}
      </div>

      {/* Grid of Accounts */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f36c21] mb-2" />
          <span>Loading deposit accounts...</span>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="p-12 bg-[#1e1e1e] rounded-2xl border border-zinc-800 text-center text-zinc-400 space-y-3 shadow-xl">
          <Building className="w-10 h-10 mx-auto text-zinc-600" />
          <h4 className="font-bold text-white">No Deposit Accounts Configured</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Add at least one Bank Account or UPI QR Code so real players can fund their exchange wallets.
          </p>
          <button
            onClick={() => handleOpenAdd('BANK')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] text-white font-bold text-xs shadow-lg shadow-orange-600/25"
          >
            Add First Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => {
            const isBank = acc.accountType === 'BANK';
            const isUpi = acc.accountType === 'UPI';
            const isCrypto = acc.accountType === 'CRYPTO';

            return (
              <div
                key={acc.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  acc.isActive
                    ? 'bg-[#1e1e1e] border-zinc-800 hover:border-[#f36c21]/40 shadow-xl'
                    : 'bg-[#141414] border-zinc-900 opacity-60'
                }`}
              >
                <div>
                  {/* Top Badge Ribbon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isBank
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : isUpi
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isBank ? <Building className="w-5 h-5" /> : isUpi ? <Smartphone className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                          {acc.accountType}
                        </span>
                        <h4 className="font-bold text-sm text-white">{acc.displayName}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(acc)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        acc.isActive
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}
                    >
                      {acc.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </div>

                  {/* Account Details Box */}
                  <div className="p-3 bg-[#141414] rounded-xl border border-zinc-800 space-y-2 text-xs">
                    {isBank && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Bank:</span>
                          <span className="font-bold text-white">{acc.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">A/C Name:</span>
                          <span className="font-bold text-zinc-200">{acc.accountHolder}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">A/C Number:</span>
                          <div className="flex items-center space-x-1.5 font-mono font-bold text-amber-300">
                            <span>{acc.accountNumber}</span>
                            <button
                              onClick={() => copyToClipboard(acc.accountNumber || '', `acc_${acc.id}`)}
                              className="p-1 rounded bg-[#242424] hover:bg-[#333] text-zinc-300"
                            >
                              {copiedKey === `acc_${acc.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">IFSC Code:</span>
                          <span className="font-mono font-bold text-emerald-400">{acc.ifscCode}</span>
                        </div>
                      </>
                    )}

                    {isUpi && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">UPI ID:</span>
                          <div className="flex items-center space-x-1.5 font-mono font-bold text-emerald-400">
                            <span>{acc.upiId}</span>
                            <button
                              onClick={() => copyToClipboard(acc.upiId || '', `upi_${acc.id}`)}
                              className="p-1 rounded bg-[#242424] hover:bg-[#333] text-zinc-300"
                            >
                              {copiedKey === `upi_${acc.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        {acc.qrCodeUrl && (
                          <div className="pt-2 flex items-center justify-center">
                            <img
                              src={acc.qrCodeUrl}
                              alt="QR Code"
                              className="w-28 h-28 object-contain rounded-lg border border-zinc-700 bg-white p-1"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {isCrypto && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Network:</span>
                          <span className="font-bold text-[#f36c21] font-mono">{acc.cryptoNetwork}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Wallet:</span>
                          <div className="flex items-center space-x-1 font-mono text-[10px] text-zinc-300">
                            <span className="truncate max-w-[120px]">{acc.cryptoAddress}</span>
                            <button
                              onClick={() => copyToClipboard(acc.cryptoAddress || '', `cry_${acc.id}`)}
                              className="p-1 rounded bg-[#242424] hover:bg-[#333] text-zinc-300"
                            >
                              {copiedKey === `cry_${acc.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-2 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-400">
                      <span>Deposit Range:</span>
                      <span className="font-mono text-zinc-200">
                        ₹{acc.minDeposit.toLocaleString()} - ₹{acc.maxDeposit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800 text-xs">
                  <button
                    onClick={() => handleTogglePrimary(acc)}
                    disabled={acc.isPrimary}
                    className={`flex items-center space-x-1 font-bold ${
                      acc.isPrimary ? 'text-amber-400 cursor-default' : 'text-zinc-500 hover:text-amber-300'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${acc.isPrimary ? 'fill-amber-400' : ''}`} />
                    <span>{acc.isPrimary ? 'Primary Gateway' : 'Set as Primary'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#333] text-zinc-300 border border-zinc-700 transition-colors"
                      title="Edit Account Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DEPOSIT ACCOUNT */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center space-x-2">
                {accountType === 'BANK' ? <Building className="w-5 h-5 text-blue-400" /> : <Smartphone className="w-5 h-5 text-[#f36c21]" />}
                <span>{editingAccount ? 'Edit Deposit Gateway' : 'Add New Deposit Gateway'}</span>
              </h3>
            </div>

            {formError && (
              <div className="p-3 text-xs rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* Account Type Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">Account Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BANK', 'UPI', 'CRYPTO'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAccountType(t)}
                      className={`py-2 rounded-xl font-bold transition-all border ${
                        accountType === t
                          ? 'bg-[#f36c21] text-white border-orange-500 shadow-md shadow-orange-600/30'
                          : 'bg-[#141414] text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {t === 'BANK' ? 'Bank Account' : t === 'UPI' ? 'UPI / QR' : 'Crypto'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1">Display Title *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. ICICI Corporate Primary Current"
                  className="w-full p-2.5 bg-[#141414] border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#f36c21]"
                />
              </div>

              {/* Bank Specific Fields */}
              {accountType === 'BANK' && (
                <div className="space-y-3 p-3 bg-[#141414] rounded-xl border border-zinc-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="ICICI Bank Ltd"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Account Holder *</label>
                      <input
                        type="text"
                        required
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Company or Beneficiary Name"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Account Number *</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="50200088912456"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="ICIC0000104"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono font-bold focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Branch Location</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Nariman Point Mumbai"
                      className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white focus:border-[#f36c21] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* UPI Specific Fields */}
              {accountType === 'UPI' && (
                <div className="space-y-3 p-3 bg-[#141414] rounded-xl border border-zinc-800">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">UPI ID (VPA) *</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. nexusvip.pay@icici or business@paytm"
                      className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono font-bold text-emerald-400 focus:border-[#f36c21] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                      Custom QR Code Image URL (Optional - default generates SVG QR)
                    </label>
                    <input
                      type="text"
                      value={qrCodeUrl}
                      onChange={(e) => setQrCodeUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono text-[11px] focus:border-[#f36c21] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Crypto Specific Fields */}
              {accountType === 'CRYPTO' && (
                <div className="space-y-3 p-3 bg-[#141414] rounded-xl border border-zinc-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Network</label>
                      <input
                        type="text"
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        placeholder="TRC20"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Wallet Address</label>
                      <input
                        type="text"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="TJX9vNp8Wk2mQ7LaR3vB1dF5uP4zY6eH"
                        className="w-full p-2 bg-[#1e1e1e] border border-zinc-700 rounded-lg text-white font-mono text-[11px] focus:border-[#f36c21] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Limits & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Min Deposit (₹)</label>
                  <input
                    type="number"
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(e.target.value)}
                    className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-white font-mono focus:border-[#f36c21] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Max Deposit (₹)</label>
                  <input
                    type="number"
                    value={maxDeposit}
                    onChange={(e) => setMaxDeposit(e.target.value)}
                    className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-white font-mono focus:border-[#f36c21] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Player Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter 12-digit UTR after completing payment."
                  className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-white text-xs focus:border-[#f36c21] focus:outline-none"
                />
              </div>

              {/* Flags */}
              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-[#141414] border-zinc-700 text-[#f36c21] focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-200">Active in Player Cashier</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded bg-[#141414] border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <span className="text-xs font-semibold text-zinc-200">Default / Featured</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 font-bold text-xs transition-colors border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white font-bold text-xs shadow-lg shadow-orange-600/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving Gateway...' : editingAccount ? 'Update Gateway' : 'Create Gateway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

