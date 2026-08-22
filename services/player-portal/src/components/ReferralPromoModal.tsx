import React, { useState, useEffect } from 'react';
import {
  X,
  Gift,
  Copy,
  Check,
  Users,
  Share2,
  Tag,
  Sparkles,
  ArrowRight,
  Trophy,
  Zap,
  MessageCircle,
  QrCode
} from 'lucide-react';

interface ReferralPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onBonusCredit: (amount: number, description: string) => void;
}

export const ReferralPromoModal: React.FC<ReferralPromoModalProps> = ({
  isOpen,
  onClose,
  user,
  onBonusCredit
}) => {
  const [activeTab, setActiveTab] = useState<'REFER' | 'PROMO'>('REFER');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nexus_used_promos') || '[]');
    } catch { return []; }
  });

  // Generate persistent referral code from user
  const referralCode = user
    ? `NEXUS${user.username?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'VIP'}${String(user.id || '').slice(-3).toUpperCase() || '777'}`
    : 'NEXUSVIP777';

  const referralLink = `https://player-portal-kappa.vercel.app/?ref=${referralCode}`;

  // Referral stats (persisted)
  const [referralStats, setReferralStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nexus_referral_stats') || '{}');
    } catch { return {}; }
  });

  const totalReferred = referralStats.totalReferred || 0;
  const totalEarned = referralStats.totalEarned || 0;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `🎰 Join NexusVIP — India's #1 Live Sports Betting Exchange! Use my referral code ${referralCode} and get ₹500 bonus! 🔥\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = `🎰 Join NexusVIP — India's #1 Live Sports Betting Exchange! Use my referral code ${referralCode} and get ₹500 bonus! 🔥`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Valid promo codes with rewards
  const PROMO_CATALOG: Record<string, { bonus: number; desc: string; minDeposit?: number }> = {
    'WELCOME500': { bonus: 500, desc: '₹500 Welcome Bonus' },
    'NEXUS100': { bonus: 100, desc: '₹100 First Bet Bonus' },
    'IPL2026': { bonus: 250, desc: '₹250 IPL Season Bonus' },
    'CASHBACK10': { bonus: 200, desc: '₹200 Cashback Promo' },
    'VIP1000': { bonus: 1000, desc: '₹1000 VIP Bonus', minDeposit: 5000 },
    'CRICKET300': { bonus: 300, desc: '₹300 Cricket Special' },
    'DIWALI2026': { bonus: 500, desc: '₹500 Diwali Special Bonus' },
    'FREESPIN': { bonus: 150, desc: '₹150 Free Spin Bonus' },
  };

  const handleRedeemPromo = () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError(null);
    setPromoSuccess(null);

    if (!code) {
      setPromoError('Please enter a promo code');
      return;
    }
    if (usedCodes.includes(code)) {
      setPromoError('This promo code has already been used');
      return;
    }

    const promo = PROMO_CATALOG[code];
    if (!promo) {
      setPromoError('Invalid promo code. Please check and try again.');
      return;
    }

    setPromoLoading(true);
    setTimeout(() => {
      const updated = [...usedCodes, code];
      setUsedCodes(updated);
      localStorage.setItem('nexus_used_promos', JSON.stringify(updated));
      onBonusCredit(promo.bonus, promo.desc);
      setPromoSuccess(`✅ ${promo.desc} credited to your wallet!`);
      setPromoCode('');
      setPromoLoading(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#f36c21] via-amber-500 to-[#f36c21] p-4 text-center">
          <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full bg-black/30 hover:bg-black/50 transition cursor-pointer">
            <X size={16} className="text-white" />
          </button>
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-2 shadow-lg">
            <Gift size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Refer & Earn</h2>
          <p className="text-xs text-white/80 mt-0.5">Share the thrill, earn rewards together!</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333]">
          {(['REFER', 'PROMO'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                activeTab === tab
                  ? 'text-[#f36c21] border-b-2 border-[#f36c21] bg-[#1e1e1e]'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              {tab === 'REFER' ? '🎁 Refer Friends' : '🏷️ Promo Code'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'REFER' ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#222] rounded-lg p-3 border border-[#333] text-center">
                  <Users size={16} className="text-[#f36c21] mx-auto mb-1" />
                  <div className="text-lg font-black text-white">{totalReferred}</div>
                  <div className="text-[9px] text-[#888] uppercase">Friends Referred</div>
                </div>
                <div className="bg-[#222] rounded-lg p-3 border border-[#333] text-center">
                  <Trophy size={16} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-black text-emerald-400">₹{totalEarned}</div>
                  <div className="text-[9px] text-[#888] uppercase">Total Earned</div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-[#222] rounded-lg p-3 border border-[#333]">
                <div className="text-[10px] text-[#888] uppercase font-bold mb-2">Your Referral Code</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[#141414] rounded-lg px-3 py-2.5 font-mono text-base font-black text-[#f36c21] tracking-wider border border-dashed border-[#f36c21]/30">
                    {referralCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2.5 rounded-lg bg-[#f36c21] hover:brightness-110 transition cursor-pointer"
                  >
                    {copiedRef ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                  </button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="bg-[#222] rounded-lg p-3 border border-[#333]">
                <div className="text-[10px] text-[#888] uppercase font-bold mb-2">Share Link</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[#141414] rounded-lg px-3 py-2 text-[10px] text-[#888] truncate border border-[#333]">
                    {referralLink}
                  </div>
                  <button
                    onClick={handleCopyReferralLink}
                    className="px-3 py-2 rounded-lg bg-[#272727] hover:bg-[#333] transition text-xs text-white cursor-pointer"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#25D366] hover:brightness-110 transition text-white text-xs font-bold cursor-pointer"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#0088CC] hover:brightness-110 transition text-white text-xs font-bold cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Telegram</span>
                </button>
              </div>

              {/* How it works */}
              <div className="bg-[#181818] rounded-lg p-3 border border-[#272727]">
                <div className="text-[10px] text-[#f36c21] uppercase font-bold mb-2">How It Works</div>
                <div className="space-y-2">
                  {[
                    { step: '1', text: 'Share your referral code or link with friends' },
                    { step: '2', text: 'Friend signs up using your code' },
                    { step: '3', text: 'Both of you get ₹500 bonus credits! 🎉' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center space-x-2 text-[11px] text-[#ccc]">
                      <div className="w-5 h-5 rounded-full bg-[#f36c21] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                        {item.step}
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Promo Code Input */}
              <div className="bg-[#222] rounded-lg p-4 border border-[#333]">
                <div className="text-[10px] text-[#888] uppercase font-bold mb-2">Enter Promo Code</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                    placeholder="e.g. WELCOME500"
                    className="flex-1 bg-[#141414] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white font-mono font-bold placeholder-[#555] focus:border-[#f36c21] focus:outline-none tracking-wider"
                    maxLength={20}
                  />
                  <button
                    onClick={handleRedeemPromo}
                    disabled={promoLoading}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#f36c21] to-amber-500 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold uppercase transition cursor-pointer"
                  >
                    {promoLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Redeem'
                    )}
                  </button>
                </div>
                {promoError && (
                  <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded">{promoError}</div>
                )}
                {promoSuccess && (
                  <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded flex items-center space-x-2">
                    <Sparkles size={12} />
                    <span>{promoSuccess}</span>
                  </div>
                )}
              </div>

              {/* Available Promos */}
              <div>
                <div className="text-[10px] text-[#888] uppercase font-bold mb-2">Available Promotions</div>
                <div className="space-y-2">
                  {Object.entries(PROMO_CATALOG).map(([code, promo]) => {
                    const used = usedCodes.includes(code);
                    return (
                      <div
                        key={code}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition ${
                          used ? 'bg-[#1a1a1a] border-[#272727] opacity-50' : 'bg-[#222] border-[#333] hover:border-[#f36c21]/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            used ? 'bg-[#333]' : 'bg-gradient-to-br from-[#f36c21] to-amber-500'
                          }`}>
                            {used ? <Check size={14} className="text-[#888]" /> : <Tag size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white font-mono">{code}</div>
                            <div className="text-[10px] text-[#888]">{promo.desc}</div>
                          </div>
                        </div>
                        {!used ? (
                          <button
                            onClick={() => { setPromoCode(code); }}
                            className="text-[10px] text-[#f36c21] font-bold hover:underline cursor-pointer"
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="text-[9px] text-[#666] uppercase font-bold">Used</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Previously used */}
              {usedCodes.length > 0 && (
                <div className="bg-[#181818] rounded-lg p-3 border border-[#272727]">
                  <div className="text-[10px] text-[#888] uppercase font-bold mb-1">Previously Redeemed</div>
                  <div className="flex flex-wrap gap-1.5">
                    {usedCodes.map((code) => (
                      <span key={code} className="px-2 py-1 rounded bg-[#272727] text-[10px] text-[#666] font-mono">
                        {code} ✓
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
