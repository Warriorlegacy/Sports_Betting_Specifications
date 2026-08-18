import React from 'react';
import { Download, ShieldCheck, HelpCircle, PhoneCall, Smartphone, Lock } from 'lucide-react';

export const FairplayFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#181818] border-t border-[#2d2d2d] select-none text-white mt-8">
      {/* 1. DOWNLOAD THE APP BANNER */}
      <div className="bg-gradient-to-r from-[#f36c21] via-[#e05b12] to-[#f36c21] py-4 px-4 shadow-lg">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-black/20 text-white">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">
                Download the Official Nexusvip Android App
              </h3>
              <p className="text-xs text-white/90">
                Experience sub-second in-play betting, live match TV streaming, and instant UPI withdrawals.
              </p>
            </div>
          </div>

          <a
            href="https://assets3.hurry2.com/site_apk/4516fairplayvip.apk"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-full bg-[#212121] hover:bg-black text-white font-black text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md shrink-0"
          >
            <Download className="w-4 h-4 text-[#f36c21]" />
            <span>Download APK</span>
          </a>
        </div>
      </div>

      {/* 2. PAYMENT METHODS & TRUST BADGES */}
      <div className="max-w-[1440px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-[#adadad]">
        {/* About Nexusvip */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f36c21] via-amber-500 to-amber-300 flex items-center justify-center">
              <span className="text-black font-black text-xs">NV</span>
            </div>
            <span className="font-black text-base tracking-tight text-white">NEXUS<span className="text-[#f36c21]">VIP</span></span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#8e8e8e]">
            Nexusvip is India's leading sports betting and live casino exchange, offering Betfair-grade Back & Lay liquidity, Indian Worli Matka, and live Evolution casino tables.
          </p>
          <div className="flex items-center space-x-2 text-[#27AE60] font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>256-Bit SSL Encrypted & Certified</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="font-black text-white uppercase text-xs">Quick Links</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><a href="#about" className="hover:text-[#f36c21]">About Us</a></li>
            <li><a href="#privacy" className="hover:text-[#f36c21]">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-[#f36c21]">Terms & Conditions</a></li>
            <li><a href="#rules" className="hover:text-[#f36c21]">Rules & Regulations</a></li>
            <li><a href="#responsible" className="hover:text-[#f36c21]">Responsible Gaming (18+)</a></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <h4 className="font-black text-white uppercase text-xs">Payment Methods</h4>
          <p className="text-[10px] text-[#8e8e8e]">Instant Deposit & 5-Second Automated UPI Payouts</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">UPI</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">GPay</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">PhonePe</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">Paytm</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">Bitcoin</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">USDT (TRC20)</span>
            <span className="px-2 py-1 rounded bg-[#272727] text-white font-bold text-[10px] border border-[#333]">IMPS / Bank</span>
          </div>
        </div>

        {/* 24/7 Support */}
        <div className="space-y-2">
          <h4 className="font-black text-white uppercase text-xs">24/7 Customer Support</h4>
          <p className="text-[11px] text-[#8e8e8e]">Need help with deposits, bets, or withdrawals? Contact our dedicated support team on WhatsApp.</p>
          <a
            href="https://wa.me/+919038629155"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded bg-[#27AE60]/20 hover:bg-[#27AE60]/30 text-[#27AE60] border border-[#27AE60]/40 flex items-center space-x-2 font-bold text-xs transition-colors"
          >
            <img src="/assets/whatsapp-DAYLN6oX.webp" alt="WhatsApp" className="w-4 h-4 object-contain" />
            <span>Connect on WhatsApp (+91 90386 29155)</span>
          </a>
        </div>
      </div>

      {/* 3. COPYRIGHT & 18+ NOTICE */}
      <div className="bg-[#121212] py-3 px-4 text-center text-[10px] text-[#666] border-t border-[#222]">
        <p>© 2026 Nexusvip. All Rights Reserved. 18+ Only. Please gamble responsibly.</p>
      </div>
    </footer>
  );
};
