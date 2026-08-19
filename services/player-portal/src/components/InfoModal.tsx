import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  HelpCircle,
  Scale,
  Award,
  Info,
  BookOpen,
  ChevronDown,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Activity,
  HeartHandshake
} from 'lucide-react';

export type InfoModalTab = 'ABOUT' | 'PRIVACY' | 'TERMS' | 'RULES' | 'FAQ' | 'RESPONSIBLE';

interface InfoModalProps {
  isOpen: boolean;
  initialTab?: InfoModalTab;
  onClose: () => void;
  onOpenCredits?: () => void;
  onOpenAppDownload?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  initialTab = 'ABOUT',
  onClose,
  onOpenCredits,
  onOpenAppDownload
}) => {
  const [activeTab, setActiveTab] = useState<InfoModalTab>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs: { id: InfoModalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'ABOUT', label: 'About Us', icon: <Info className="w-4 h-4" /> },
    { id: 'RULES', label: 'Rules & Regulations', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'FAQ', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'TERMS', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" /> },
    { id: 'PRIVACY', label: 'Privacy Policy', icon: <Lock className="w-4 h-4" /> },
    { id: 'RESPONSIBLE', label: 'Responsible Gaming', icon: <HeartHandshake className="w-4 h-4" /> }
  ];

  const faqs = [
    {
      q: 'How do I deposit funds into my NexusVIP wallet?',
      a: 'Click on the DEPOSIT button at the top header. You can choose from Instant UPI (GPay, PhonePe, Paytm), Direct IMPS/NEFT Bank Transfer, or USDT (TRC-20). Enter the amount, transfer using the provided QR/details, and submit your 12-digit UTR transaction number. Funds are credited instantly.'
    },
    {
      q: 'How fast are withdrawals processed?',
      a: 'Withdrawals are processed through our 5-second automated UPI clearing pipeline. Enter your registered UPI ID or Bank Account details in the WITHDRAW tab. Payouts are dispatched 24/7 with zero withdrawal fees.'
    },
    {
      q: 'What is the difference between Back and Lay betting on the Exchange?',
      a: 'A BACK bet (Sky Blue) means you are betting FOR an outcome to happen (e.g. India to win). A LAY bet (Light Pink) means you are acting as the bookmaker, betting AGAINST the outcome (e.g. India will NOT win). This Betfair-style peer-to-peer matching ensures the highest market odds with zero rigged bookmaker margins.'
    },
    {
      q: 'How does the in-play Cash-Out feature work?',
      a: 'The Cash-Out button in live matches allows you to lock in guaranteed profit or cut potential losses before the match finishes. It dynamically calculates fair value based on live odds movement (Payout = Stake × Placed Odds / Current Odds). You can cash out 100% or use our slider for partial cash-outs (25%, 50%, 75%).'
    },
    {
      q: 'What happens if a Cricket match gets rained out or abandoned?',
      a: 'If a match is officially declared abandoned without a minimum number of overs being completed to produce a result, all unsettled match winner bets are voided and 100% of stakes are refunded back to your wallet balance within minutes.'
    },
    {
      q: 'Are casino games, Matka, and live streams fair and certified?',
      a: 'Yes. All live casino tables are provided by world-certified studios (Evolution Gaming & Ezugi) with physical real dealers. Crash games use Provably Fair cryptographic SHA-256 seed verification, and Indian Matka bazars settle automatically against official public declared numbers.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#181818] border border-[#2d2d2d] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#141414] px-6 py-4 border-b border-[#262626] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center shadow-md">
              <span className="text-black font-black text-xs">NV</span>
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>NEXUS<span className="text-[#f36c21]">VIP</span></span>
                <span className="text-xs text-[#888] font-bold">| Information Center</span>
              </h3>
              <p className="text-[11px] text-slate-400">Official Platform Documentation & Compliance</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-lg p-2 rounded-xl hover:bg-[#252525] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-[#1c1c1c] border-b border-[#282828] px-4 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`py-3 px-3.5 border-b-2 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#f36c21] text-[#f36c21] bg-[#242424]/60'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-[#242424]/30'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed custom-scrollbar flex-1">
          {/* TAB 1: ABOUT US */}
          {activeTab === 'ABOUT' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 via-[#1e1e1e] to-black border border-orange-600/30 space-y-2 shadow">
                <div className="flex items-center space-x-2 text-[#f36c21] font-black text-sm uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Welcome to NexusVIP Sports Exchange & Live Casino</span>
                </div>
                <p className="text-xs text-slate-300">
                  NexusVIP is premier high-liquidity Sports Betting Exchange and Live Casino portal. Engineered to deliver authentic Betfair-grade Back & Lay matching, live telemetry streaming, Indian Worli Matka bazars, and instant multi-channel cashier solutions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <h4 className="font-black text-white text-xs">Sub-Second Execution</h4>
                  <p className="text-[11px] text-slate-400">
                    High-frequency order matching engine processing bets in under 50 milliseconds with zero slippage.
                  </p>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <h4 className="font-black text-white text-xs">256-Bit SSL Certified</h4>
                  <p className="text-[11px] text-slate-400">
                    Military-grade encryption securing user credentials, financial transactions, and double-entry ledgers.
                  </p>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    🎰
                  </div>
                  <h4 className="font-black text-white text-xs">Evolution & Ezugi Tables</h4>
                  <p className="text-[11px] text-slate-400">
                    Over 200+ physical live dealer tables including Teen Patti, Andar Bahar, Roulette, and Baccarat.
                  </p>
                </div>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">Creator & Architecture Credits</h4>
                <p className="text-[11px] text-slate-400">
                  Architected & Engineered by <b>Piyush Raj Singh</b> (Solo Creator & Godfather), powered by Signhify AI Studio.
                </p>
                {onOpenCredits && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCredits();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-[#f36c21]" />
                    <span>View Full Creator Credits & Engineering Hall of Fame</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RULES & REGULATIONS */}
          {activeTab === 'RULES' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-4">
                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                  <h4 className="font-black text-[#f36c21] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1. Exchange Betting Rules (Back & Lay)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-2">
                    <li><b>Backing:</b> A Back bet is placed when a player predicts a specific runner will win. Profit = Stake × (Odds - 1).</li>
                    <li><b>Laying:</b> A Lay bet is placed when a player acts as bookmaker against an outcome. Liability = Stake × (Odds - 1).</li>
                    <li><b>Unmatched Bets:</b> If an order does not find an opposing counterpart at the requested price, it remains in the UNMATCHED queue until matched or manually cancelled before market closure.</li>
                    <li><b>Commission:</b> Standard exchange rake is 2% only on net winning market profit (zero commission on losing bets).</li>
                  </ul>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                  <h4 className="font-black text-[#f36c21] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. Cricket Fancy & Session Market Rules</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-2">
                    <li><b>Session Runs (6, 10, 15, 20 Overs):</b> Market settles strictly upon completion of the stipulated overs. If rain reduces overs, session markets for incomplete blocks are voided.</li>
                    <li><b>Only Completed Overs:</b> In case of match abandonment, all fancy bets placed on overs that were completed remain valid.</li>
                    <li><b>Tied Match / Super Over:</b> For standard Match Winner markets, Super Over results decide the winner. For Tied Match markets, the regular 20/50 overs result applies.</li>
                  </ul>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                  <h4 className="font-black text-[#f36c21] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Tennis Retirement & Walkover Rules</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-2">
                    <li>If a player retires before Set 1 is completed, all match odds bets are voided and stakes refunded.</li>
                    <li>If Set 1 has been completed and a player retires, the player advancing to the next round is officially declared the match winner.</li>
                  </ul>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                  <h4 className="font-black text-[#f36c21] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>4. Indian Worli Matka Bazars (23 Bazars)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-2">
                    <li>Single Ank (1 to 9): 9.5x payout.</li>
                    <li>Jodi (00 to 99): 95x payout.</li>
                    <li>Single Patti (Panna): 150x payout.</li>
                    <li>Double Patti: 300x payout | Triple Patti: 900x payout.</li>
                    <li>All results are settled automatically against official public market declarations at open/close times.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'FAQ' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-slate-400 mb-2">
                Have questions? Here are the most frequently asked questions about deposits, betting, cashouts, and rules:
              </p>
              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left font-black text-xs text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#f36c21] shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#f36c21]' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 text-[11px] text-slate-400 leading-relaxed border-t border-[#222] pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & CONDITIONS */}
          {activeTab === 'TERMS' && (
            <div className="space-y-4 text-slate-400 text-[11px] animate-in fade-in duration-150">
              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">1. User Eligibility & Account Registration</h4>
                <p>
                  You must be at least 18 years of age or the legal age of majority in your jurisdiction to open an account or place bets on NexusVIP. Only one account per person/household is permitted.
                </p>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">2. Financial Transactions & KYC Verification</h4>
                <p>
                  All deposits must originate from accounts registered in the user’s name. NexusVIP reserves the right to request proof of identity (KYC) prior to processing large withdrawals. UTR numbers submitted for deposits must match verified bank transaction records.
                </p>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">3. Bet Placement & Cancellation</h4>
                <p>
                  Once an exchange bet is matched against another player, it cannot be cancelled or altered. Unmatched bets may be cancelled at any time prior to matching or market suspension.
                </p>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">4. Anti-Fraud & Syndicate Protection</h4>
                <p>
                  Any use of automated scraping bots, latency arbitrage exploits, or collusion between accounts will result in immediate suspension and forfeiture of illegitimate balances.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY POLICY */}
          {activeTab === 'PRIVACY' && (
            <div className="space-y-4 text-slate-400 text-[11px] animate-in fade-in duration-150">
              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Privacy & Data Protection Principles</span>
                </h4>
                <p>
                  NexusVIP respects your privacy and is committed to protecting your personal and financial data. We do not sell, rent, or lease customer data to any third-party marketing entities under any circumstances.
                </p>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">Information We Collect</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Account credentials (username, encrypted password hash).</li>
                  <li>Financial transaction history (deposit UTR references, withdrawal UPI addresses).</li>
                  <li>Double-entry ledger records of placed, matched, and settled betting orders.</li>
                </ul>
              </div>

              <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-2">
                <h4 className="font-black text-white text-xs uppercase">Security Measures</h4>
                <p>
                  All client-server communications are encrypted via SSL/TLS (HTTPS). Sensitive session tokens are protected via HTTP-only flags, and wallet ledger updates are verified atomically on our PostgreSQL clearing backend.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: RESPONSIBLE GAMING */}
          {activeTab === 'RESPONSIBLE' && (
            <div className="space-y-4 text-slate-400 text-[11px] animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-600/30 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-black text-xs uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Responsible Gaming Policy (18+ Only)</span>
                </div>
                <p className="text-slate-300">
                  Sports betting and casino games are intended purely for adult entertainment. Always gamble responsibly, set personal deposit limits, and never bet money that you cannot afford to lose.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-1">
                  <h5 className="font-black text-white text-xs">Self-Exclusion</h5>
                  <p>You may request a temporary cool-off period or permanent self-exclusion by contacting our 24/7 support desk.</p>
                </div>

                <div className="bg-[#141414] p-4 rounded-2xl border border-[#2a2a2a] space-y-1">
                  <h5 className="font-black text-white text-xs">Deposit & Stake Limits</h5>
                  <p>Players can configure daily and weekly stake ceilings to ensure disciplined, enjoyable gameplay.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#141414] px-6 py-3 border-t border-[#262626] flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#27AE60]" />
            <span>Official NexusVIP Security & Compliance</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#f36c21] hover:bg-[#e05b12] text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
