import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  X,
  QrCode,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const apkDownloadUrl = `${window.location.origin}/apk/nexusvip-exchange.apk`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(apkDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-[#181818] border border-[#333] shadow-2xl text-white flex flex-col">
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#2a170a] via-[#1a1a1a] to-[#141414] border-b border-[#333] overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 p-0.5 shadow-xl shadow-orange-500/20">
              <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center">
                <img
                  src="/assets/fairplayvip8252.png"
                  alt="NexusVIP App"
                  className="w-10 h-10 object-contain"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white tracking-tight">NexusVIP Android App</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/40">
                  v2.0.0 APK
                </span>
              </div>
              <p className="text-xs text-[#adadad] mt-0.5">
                Official Native Android App • Sub-Second Live Betting & Casino
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Key Advantages Pill Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#1f1f1f] border border-[#2d2d2d] flex items-center space-x-2.5">
              <Zap className="w-5 h-5 text-[#f36c21] shrink-0" />
              <div>
                <span className="text-xs font-bold block text-white">0-Lag Odds Feed</span>
                <span className="text-[10px] text-[#8e8e8e]">Direct WebSocket Engine</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1f1f1f] border border-[#2d2d2d] flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-[#27AE60] shrink-0" />
              <div>
                <span className="text-xs font-bold block text-white">100% Virus-Free</span>
                <span className="text-[10px] text-[#8e8e8e]">Verified Signature</span>
              </div>
            </div>
          </div>

          {/* Direct Download Button */}
          <div className="space-y-2">
            <a
              href="/apk/nexusvip-exchange.apk"
              download="nexusvip-exchange.apk"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#f36c21] to-[#e05b12] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-orange-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Android APK (48 KB)</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-[#8e8e8e] px-1">
              <span>Compatible with Android 7.0 to 15+</span>
              <button
                onClick={handleCopyLink}
                className="text-[#f36c21] hover:underline flex items-center space-x-1 font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
            </div>
          </div>

          {/* QR Code / Share on Mobile Box */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-[#2d2d2d] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-24 h-24 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(apkDownloadUrl)}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Scan with Phone Camera</h4>
              <p className="text-[11px] text-[#adadad] leading-relaxed">
                Scan this QR code directly with any Android camera or Google Lens to instantly download the APK file on your mobile.
              </p>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-2.5 pt-2 border-t border-[#2d2d2d]">
            <h4 className="text-xs font-black uppercase text-[#adadad] tracking-wider">3-Step Easy Install:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f36c21]/20 text-[#f36c21] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-slate-300">
                  Tap <strong>Download Android APK</strong> and confirm file download.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f36c21]/20 text-[#f36c21] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-slate-300">
                  Open downloaded file and allow <em>"Install from Unknown Sources"</em> if prompted.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-[#f36c21]/20 text-[#f36c21] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-slate-300">
                  Launch <strong>NexusVIP Exchange</strong> and enjoy live high-speed betting!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
