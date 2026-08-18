import React, { useState, useEffect } from 'react';
import { Megaphone, Zap, Volume2, VolumeX, ChevronRight, Bell, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface NewsItem {
  id: number;
  type: string;
  category: string;
  text: string;
  date: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 1,
    type: 'ALL',
    category: 'EXCHANGE',
    text: '⚡ WELCOME TO NEXUSVIP LIVE EXCHANGE — SUB-SECOND BETFAIR BACK & LAY LIQUIDITY, LIVE MATCH TV & 5-SECOND AUTOMATED UPI WITHDRAWALS ACTIVE.',
    date: new Date().toISOString()
  },
  {
    id: 2,
    type: 'ALL',
    category: 'CRICKET',
    text: '🏏 LIVE CRICKET TOSS & BOOKMAKER MARKETS ARE LIVE ACROSS ALL INTERNATIONAL & LEAGUE FIXTURES. ENJOY REAL-TIME IN-PLAY BETTING.',
    date: new Date().toISOString()
  },
  {
    id: 3,
    type: 'ALL',
    category: 'CASINO',
    text: '🃏 INDIAN LIVE GAMES: TEEN PATTI 20-20, DRAGON TIGER, LUCKY 7 (7 UP 7 DOWN), & AMAR AKBAR ANTHONY ARE NOW ACTIVE WITH HIGH RESOLUTION LIVE STREAMS.',
    date: new Date().toISOString()
  },
  {
    id: 4,
    type: 'ALL',
    category: 'SECURITY',
    text: '🔒 256-BIT SSL ENCRYPTED GATEWAY: UTR VERIFICATION ENSURES INSTANT DEPOSIT CLEARING. ZERO COMMISSION ON WINNING LIQUIDITY.',
    date: new Date().toISOString()
  }
];

export const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_NEWS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    // Fetch live broadcast news from backend
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news?type=PLAYER', {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.news && data.news.length > 0) {
            setNews(data.news);
          }
        }
      } catch {
        // Fallback to DEFAULT_NEWS seamlessly
      }
    };
    fetchNews();
  }, []);

  // Auto-cycle announcements every 7 seconds
  useEffect(() => {
    if (isPaused || news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, news.length]);

  const currentItem = news[currentIndex] || news[0];

  return (
    <div
      className="w-full bg-gradient-to-r from-[#121212] via-[#1a140f] to-[#121212] border-b border-[#2d2d2d] py-1.5 px-3 select-none flex items-center justify-between text-xs overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        {/* Flash Announcement Tag */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-[#f36c21] to-amber-500 text-black font-black text-[10px] tracking-wider uppercase shrink-0 shadow">
          <Megaphone className="w-3 h-3 animate-pulse text-black" />
          <span>NEWS FLASH</span>
        </div>

        {/* Category Pill */}
        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#272727] text-amber-300 font-mono text-[9px] font-bold uppercase border border-[#333] shrink-0">
          {currentItem.category || 'BROADCAST'}
        </span>

        {/* Ticker Content with Smooth Fade In */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            key={currentItem.id}
            className="truncate text-[#e0e0e0] font-medium text-[11px] animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {currentItem.text}
          </p>
        </div>
      </div>

      {/* Pagination & Indicators */}
      <div className="flex items-center space-x-2 pl-2 shrink-0">
        <div className="hidden md:flex items-center space-x-1">
          {news.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx ? 'w-4 bg-[#f36c21]' : 'w-1.5 bg-[#444] hover:bg-[#666]'
              }`}
              title={`News ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % news.length)}
          className="p-1 rounded bg-[#222] hover:bg-[#333] text-[#adadad] hover:text-white transition-colors"
          title="Next announcement"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
