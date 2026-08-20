import React, { useState } from 'react';
import {
  Menu,
  X,
  Globe,
  Download,
  Smartphone,
  ChevronDown,
  Shield,
  Clock,
  History,
  Lock,
  LogOut,
  HelpCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Star,
  CheckCircle2,
  ExternalLink,
  Zap,
  Award
} from 'lucide-react';
import { SportCategory } from '../types/sportsbook';
import { useI18n, LanguageCode } from '../services/i18nService';

export type InfoModalTab = 'ABOUT' | 'PRIVACY' | 'TERMS' | 'RULES' | 'FAQ' | 'RESPONSIBLE';

interface FairplayHeaderProps {
  user: {
    id: string;
    username: string;
    availableCredit: number;
    exposure: number;
    creditLimit: number;
  } | null;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenCashier: (tab?: 'DEPOSIT' | 'WITHDRAW' | 'HISTORY') => void;
  onOpenCredits?: () => void;
  onOpenAppDownload?: () => void;
  onOpenInfoTab?: (tab: InfoModalTab) => void;
  onOpenLanguageModal?: () => void;
  onOpenTwoFactor?: () => void;
  onOpenStatementExport?: () => void;
  onOpenSpinWheel?: () => void;
  onOpenThemeCustomizer?: () => void;
  onLogout: () => void;
  openBetsCount: number;
  oneClickBet: boolean;
  setOneClickBet: (val: boolean) => void;
}

export const FairplayHeader: React.FC<FairplayHeaderProps> = ({
  user,
  activeNavTab,
  setActiveNavTab,
  isDarkMode,
  setIsDarkMode,
  onOpenLogin,
  onOpenRegister,
  onOpenCashier,
  onOpenCredits,
  onOpenAppDownload,
  onOpenInfoTab,
  onOpenLanguageModal,
  onOpenTwoFactor,
  onOpenStatementExport,
  onOpenSpinWheel,
  onOpenThemeCustomizer,
  onLogout,
  openBetsCount,
  oneClickBet,
  setOneClickBet
}) => {
  const { t, lang, languages } = useI18n();
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLangMeta = languages.find((l) => l.code === lang) || languages[0];

  const navTabs = [
    { id: 'INPLAY', label: t('inplay'), icon: '/assets/inplay.a7c4dae-C8xV8pYh.webp' },
    { id: 'MULTI_MARKETS', label: t('multi_markets'), icon: '/assets/sportbook_icon-CaAh8qoq.svg' },
    { id: 'FANTASY', label: t('fantasy'), icon: '/assets/fantasybookicon.225b8cb-Cjpd3wag.webp' },
    { id: 'SPORTSBOOK', label: t('sportsbook'), icon: '/assets/sportbook_icon-CaAh8qoq.svg' },
    { id: 'CASINO', label: t('casino'), icon: '/assets/casino-BnBk6FL5.webp' },
    { id: 'CRASH', label: t('crash'), icon: '/assets/crash-img-d4T8ANqx.webp' },
    { id: 'LIVECARD', label: t('livecard'), icon: '/assets/live-card.c981209-CS5ln-mD.webp' },
    { id: 'MATKA', label: t('matka'), icon: '/assets/gold-pot-B7mS4MfM.webp' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1e1e1e] border-b border-[#2d2d2d] select-none text-white shadow-xl">
      {/* 1. TOP MINI-BAR */}
      <div className="hidden lg:flex items-center justify-between px-4 py-1 bg-[#141414] text-[11px] text-[#adadad] border-b border-[#222]">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setActiveNavTab('SPORTSBOOK')}
            className="hover:text-[#f36c21] transition-colors cursor-pointer"
          >
            Market
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => onOpenCredits && onOpenCredits()}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#f36c21]" />
            <span>Creator Credits</span>
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => onOpenInfoTab?.('ABOUT')}
            className="hover:text-[#f36c21] transition-colors cursor-pointer"
          >
            About Us
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => onOpenInfoTab?.('PRIVACY')}
            className="hover:text-[#f36c21] transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => onOpenInfoTab?.('FAQ')}
            className="hover:text-[#f36c21] transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => onOpenInfoTab?.('TERMS')}
            className="hover:text-[#f36c21] transition-colors cursor-pointer"
          >
            T&C
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Spin Wheel Daily Bonus Button */}
          {onOpenSpinWheel && (
            <button
              type="button"
              onClick={onOpenSpinWheel}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] cursor-pointer animate-pulse"
            >
              <span>🎁</span>
              <span>{t('spin_wheel')}</span>
            </button>
          )}

          {/* Language Selector */}
          <button
            type="button"
            onClick={onOpenLanguageModal}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#272727] hover:bg-[#333] border border-[#333] cursor-pointer text-slate-200 hover:text-white transition-colors"
          >
            <span>{currentLangMeta.flag}</span>
            <span className="font-bold">{currentLangMeta.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-[#888]" />
          </button>

          {/* Download App */}
          <button
            type="button"
            onClick={onOpenAppDownload || (() => { window.location.href = '/apk/nexusvip-exchange.apk'; })}
            className="flex items-center space-x-1 text-[#f36c21] font-bold hover:underline cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('download_app')}</span>
          </button>

          {/* WhatsApp Support Buttons */}
          <div className="flex items-center space-x-2">
            <a
              href="https://wa.me/916202442690"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:opacity-90 bg-[#27AE60]/20 px-2 py-0.5 rounded border border-[#27AE60]/40 text-[#27AE60] font-bold text-[10px]"
            >
              <img src="/assets/whatsapp-DAYLN6oX.webp" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
              <span>WA: +91 62024 42690</span>
            </a>
            <a
              href="https://wa.me/918789868764"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1 hover:opacity-90 bg-[#27AE60]/20 px-2 py-0.5 rounded border border-[#27AE60]/40 text-[#27AE60] font-bold text-[10px]"
            >
              <img src="/assets/whatsapp-DAYLN6oX.webp" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
              <span>+91 87898 68764</span>
            </a>
          </div>

          {/* Theme Presets Switcher (Allpanel7 / Fairplay / Rudra888 / Lotusrun) */}
          {onOpenThemeCustomizer && (
            <button
              type="button"
              onClick={onOpenThemeCustomizer}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#272727] hover:bg-[#333] border border-[#3d3d3d] transition-all text-[10px] text-amber-300 font-bold cursor-pointer"
            >
              <span>🎨</span>
              <span>Themes</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#272727] hover:bg-[#333] transition-all text-[10px]"
          >
            <img
              src={isDarkMode ? '/assets/dark-mode-BmqJVb2n.svg' : '/assets/light-mode-DgcBPrMx.svg'}
              alt="Theme"
              className="w-3.5 h-3.5"
            />
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="w-full px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-[#272727] text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="cursor-pointer flex items-center space-x-2" onClick={() => setActiveNavTab('INPLAY')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center text-lg sm:text-xl font-black tracking-tight">
                <span className="text-white">NEXUS</span>
                <span className="text-[#f36c21]">VIP</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-widest">EXCHANGE</span>
            </div>
          </div>
        </div>

        {/* User Account / Auth Section */}
        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* One Click Bet Toggle */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#272727] border border-[#333] text-[11px]">
              <span className="text-[#adadad]">1-Click Bet</span>
              <input
                type="checkbox"
                checked={oneClickBet}
                onChange={(e) => setOneClickBet(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#f36c21] cursor-pointer"
              />
            </div>

            {/* Wallet Info */}
            <div className="flex flex-col text-right text-[11px]">
              <div className="font-bold text-[#adadad]">
                Wallet: <span className="text-[#27AE60] font-mono font-black">₹{user.availableCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[10px] text-[#adadad]">
                Exp: <span className="text-[#FF4148] font-mono font-bold">₹{user.exposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Deposit & Withdraw Buttons */}
            <button
              onClick={() => onOpenCashier('DEPOSIT')}
              className="px-3 py-1.5 rounded-md bg-[#f36c21] hover:bg-[#e05b12] text-white font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              Deposit
            </button>
            <button
              onClick={() => onOpenCashier('WITHDRAW')}
              className="hidden sm:inline-block px-3 py-1.5 rounded-md bg-[#27AE60] hover:bg-[#219652] text-white font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
            >
              Withdraw
            </button>

            {/* Profile Drawer Toggle */}
            <button
              onClick={() => setUserDrawerOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#272727] hover:bg-[#333] border border-[#333] text-xs font-bold transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#f36c21] text-white flex items-center justify-center font-black text-[11px]">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#adadad]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button onClick={onOpenLogin} className="login-btn">
              Login
            </button>
            <button onClick={onOpenRegister} className="register-btn">
              Register
            </button>
          </div>
        )}
      </div>

      {/* 3. GAME CATEGORY SUB-NAV TABS */}
      <div className="w-full bg-[#272727] border-t border-[#333] px-2 sm:px-4 overflow-x-auto no-scrollbar">
        <div className="w-full flex items-center space-x-1 sm:space-x-2 py-1">
          {navTabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveNavTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-[#f36c21] text-white shadow-md'
                    : 'text-[#adadad] hover:text-white hover:bg-[#323232]'
                }`}
              >
                <img src={tab.icon} alt={tab.label} className="w-4 h-4 object-contain shrink-0" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. USER PROFILE SIDE SLIDE-OUT DRAWER */}
      {user && userDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-80 max-w-full bg-[#1e1e1e] h-full shadow-2xl flex flex-col border-l border-[#333] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#272727] border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-[#f36c21] text-white flex items-center justify-center font-black text-sm">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{user.username}</h4>
                  <span className="text-[10px] text-amber-400 font-bold">Nexusvip VIP Member</span>
                </div>
              </div>
              <button onClick={() => setUserDrawerOpen(false)} className="p-1 rounded bg-[#333] text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Balances Card */}
            <div className="p-4 bg-[#141414] m-3 rounded-lg border border-[#2d2d2d] space-y-2 text-xs">
              <div className="flex justify-between text-[#adadad]">
                <span>Wallet Balance</span>
                <span className="font-mono font-black text-[#27AE60]">₹{user.availableCredit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#adadad]">
                <span>Net Exposure</span>
                <span className="font-mono font-bold text-[#FF4148]">₹{user.exposure.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
              <button onClick={() => { onOpenCashier('DEPOSIT'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-[#f36c21]" />
                  <span>{t('deposit')}</span>
                </div>
              </button>
              <button onClick={() => { onOpenCashier('WITHDRAW'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#27AE60]" />
                  <span>{t('withdraw')}</span>
                </div>
              </button>
              {onOpenSpinWheel && (
                <button onClick={() => { onOpenSpinWheel(); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 text-amber-300 text-left border border-amber-500/30 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🎁</span>
                    <span className="font-bold">{t('spin_wheel')} (Daily)</span>
                  </div>
                </button>
              )}
              <button onClick={() => { setActiveNavTab('MULTI_MARKETS'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{t('multi_markets')} Board</span>
                </div>
              </button>
              <button onClick={() => { setActiveNavTab('MY_BETS'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{t('open_bets')} ({openBetsCount})</span>
                </div>
              </button>
              <button onClick={() => { setActiveNavTab('MY_BETS'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('settled_bets')}</span>
                </div>
              </button>
              <button onClick={() => { if (onOpenStatementExport) onOpenStatementExport(); else onOpenCashier('HISTORY'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{t('account_statement')} & P&L (PDF/Excel)</span>
                </div>
              </button>
              <button onClick={() => { if (onOpenTwoFactor) onOpenTwoFactor(); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>{t('two_factor_auth')}</span>
                </div>
              </button>
              <button onClick={() => { setActiveNavTab('CASHOUT'); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>{t('cashout')} Terminal</span>
                </div>
              </button>
              {onOpenThemeCustomizer && (
                <button onClick={() => { onOpenThemeCustomizer(); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400">🎨</span>
                    <span className="text-amber-300 font-bold">Theme & Whitelabel Presets</span>
                  </div>
                </button>
              )}
              <button onClick={() => { onOpenAppDownload && onOpenAppDownload(); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-[#f36c21]" />
                  <span className="text-white font-bold">{t('download_app')} (v2.0.0)</span>
                </div>
              </button>
              <button onClick={() => { onOpenCredits && onOpenCredits(); setUserDrawerOpen(false); }} className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#272727] text-left cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#f36c21]" />
                  <span className="text-amber-300 font-bold">Creator Credits & Architect</span>
                </div>
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-[#333]">
              <button
                onClick={() => { onLogout(); setUserDrawerOpen(false); }}
                className="w-full py-2 rounded-md bg-[#FF4148]/20 hover:bg-[#FF4148]/30 text-[#FF4148] font-bold text-xs flex items-center justify-center space-x-2 border border-[#FF4148]/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
