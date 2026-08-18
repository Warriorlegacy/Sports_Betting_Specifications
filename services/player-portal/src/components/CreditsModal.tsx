import React from 'react';
import {
  X,
  Award,
  Sparkles,
  ExternalLink,
  Instagram,
  Linkedin,
  Github,
  Globe,
  Heart,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#181818] border border-[#2d2d2d] rounded-2xl p-5 sm:p-7 shadow-2xl relative z-10 text-white max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2d2d2d] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Award className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base uppercase tracking-wider text-white">
                  Platform Credits & Architect
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-[#f36c21] font-black border border-[#f36c21]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Creator
                </span>
              </div>
              <p className="text-[11px] text-[#adadad]">Visionary, Architect & Solo Developer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#272727] text-[#adadad] hover:text-white hover:bg-[#333] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs py-4">
          {/* Creator Profile Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#222] to-[#161616] border border-[#333] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f36c21]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f36c21] to-amber-400 p-0.5 shrink-0 shadow-lg">
                <div className="w-full h-full bg-[#181818] rounded-[14px] flex items-center justify-center font-black text-2xl text-transparent bg-clip-text bg-gradient-to-tr from-[#f36c21] to-amber-300 font-mono">
                  PR
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-xl font-black text-white tracking-tight">Piyush Raj Singh</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                    Creator & Godfather
                  </span>
                </div>
                <p className="text-xs text-amber-400/90 font-medium italic">
                  "Solo Creator & Godfather of Signhify AI and Sports Betting Exchange Platform"
                </p>
                <p className="text-[11px] text-[#adadad] leading-relaxed pt-1">
                  Piyush Raj Singh is the sole architect, developer, and visionary behind this entire multi-tier sports betting exchange & sportsbook platform. He conceived, designed, and built the full-stack architecture from the ground up — from the double-entry credit ledger and real-time FIFO order matching engine to the pixel-perfect Betfair Back/Lay trading experience.
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-4 pt-4 border-t border-[#2d2d2d] grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="https://www.instagram.com/piyushrajsingh.golu?igsh=eHFnNnhwZjJyYmo2&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] text-pink-400 hover:text-pink-300 font-bold transition-all text-[11px]"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>

              <a
                href="https://linkedin.com/in/piyushraj-singh"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] text-blue-400 hover:text-blue-300 font-bold transition-all text-[11px]"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://signhify.lovable.app"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] text-amber-400 hover:text-amber-300 font-bold transition-all text-[11px]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>AI Studio</span>
              </a>

              <a
                href="https://github.com/Warriorlegacy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] text-white hover:text-slate-200 font-bold transition-all text-[11px]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Key Architecture Pillars Built by Piyush */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-black tracking-wider text-[#adadad] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#f36c21]" /> Engineering Milestones & Architecture
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Zap className="w-3.5 h-3.5 text-[#f36c21]" />
                  <span>Real-Time Matching Engine</span>
                </div>
                <p className="text-[11px] text-[#8e8e8e]">
                  High-speed in-memory FIFO orderbook with price-time priority matching and continuous market liquidity.
                </p>
              </div>

              <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5-Tier Double-Entry Ledger</span>
                </div>
                <p className="text-[11px] text-[#8e8e8e]">
                  ACID credit allocation tree (Admin &rarr; Super Master &rarr; Master &rarr; Agent &rarr; Player) with 0 double-spend.
                </p>
              </div>

              <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fairplay VIP 6-Odds Matrix</span>
                </div>
                <p className="text-[11px] text-[#8e8e8e]">
                  Betfair standard 6-odds back & lay depth columns with instant liability calculation and one-click betting slip.
                </p>
              </div>

              <div className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Automated Financial Clearing</span>
                </div>
                <p className="text-[11px] text-[#8e8e8e]">
                  Multi-bank dynamic cashier, UPI QR code generator, payment proof screenshot uploads, and 1-click admin settlement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#2d2d2d] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8e8e8e] shrink-0 text-center sm:text-left">
          <div className="flex items-center space-x-1 text-[#f36c21] font-bold">
            <Heart className="w-3.5 h-3.5 fill-[#f36c21]" />
            <span>Built with ❤️ by Piyush Raj Singh</span>
          </div>
          <span className="font-mono text-[10px] text-[#777]">"Type less. Signhify everything."</span>
        </div>
      </div>
    </div>
  );
};
