import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, ShieldAlert } from 'lucide-react';

interface NewsItem {
  id: number;
  type: string;
  category: string;
  text: string;
  date: string;
}

const DEFAULT_DEALER_NEWS: NewsItem[] = [
  {
    id: 1,
    type: 'DL',
    category: 'OPERATIONS',
    text: '⚡ DEALER RISK DESK: ZERO COMMISSION OVERHANG ACTIVE. ENSURE 12-DIGIT UTR MATCHING BEFORE INSTANT CLEARING.',
    date: new Date().toISOString()
  },
  {
    id: 2,
    type: 'DL',
    category: 'MARKETS',
    text: '🏏 TOSS & BOOKMAKER MARKETS FOR UPCOMING INTERNATIONAL FIXTURES ARE OPEN WITH AUTOMATED LIQUIDITY BALANCING.',
    date: new Date().toISOString()
  },
  {
    id: 3,
    type: 'DL',
    category: 'CASINO',
    text: '🃏 INDIAN CASINO DESK: TEEN PATTI T20, DRAGON TIGER & LUCKY 7 ROUNDS STREAMING WITH LIVE RESULT VERIFICATION.',
    date: new Date().toISOString()
  },
  {
    id: 4,
    type: 'DL',
    category: 'RISK',
    text: '🔒 SUSPICIOUS ARBITRAGE PATTERNS ARE MONITORED AT L0 ADMIN LEVEL. SETTLED TICKETS ARE RECORDED TO IMMUTABLE LEDGER.',
    date: new Date().toISOString()
  }
];

export const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_DEALER_NEWS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news?type=DL', {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.news && data.news.length > 0) {
            setNews(data.news);
          }
        }
      } catch {
        // Fallback to defaults
      }
    };
    fetchNews();
  }, []);

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
      className="w-full bg-[#111111] border-b border-[#292929] py-1.5 px-4 select-none flex items-center justify-between text-xs overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-orange-950/80 border border-orange-600/50 text-amber-300 font-black text-[10px] tracking-wider uppercase shrink-0 shadow">
          <Megaphone className="w-3 h-3 animate-pulse text-[#f36c21]" />
          <span>DEALER BROADCAST</span>
        </div>

        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#242424] text-white font-mono text-[9px] font-bold uppercase border border-[#383838] shrink-0">
          {currentItem.category || 'NOTICE'}
        </span>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            key={currentItem.id}
            className="truncate text-zinc-200 font-medium text-[11px] animate-in fade-in slide-in-from-right-4 duration-300 font-mono"
          >
            {currentItem.text}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 pl-2 shrink-0">
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % news.length)}
          className="p-1 rounded bg-[#242424] hover:bg-[#333] text-zinc-400 hover:text-white transition-colors"
          title="Next notice"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
