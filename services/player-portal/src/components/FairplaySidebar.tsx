import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Trophy, Flame } from 'lucide-react';
import { SportCategory } from '../types/sportsbook';

interface FairplaySidebarProps {
  selectedSport: SportCategory | 'ALL';
  onSelectSport: (sport: SportCategory | 'ALL') => void;
  sportCounts: Record<string, number>;
  onNavigateTab: (tab: string) => void;
}

export const FairplaySidebar: React.FC<FairplaySidebarProps> = ({
  selectedSport,
  onSelectSport,
  sportCounts,
  onNavigateTab
}) => {
  const [allSportsExpanded, setAllSportsExpanded] = useState(true);

  const sportsList: { id: SportCategory | 'ALL'; label: string; icon: string; countKey: string }[] = [
    { id: 'CRICKET', label: 'cricket', icon: '/assets/sports-cricket-Qf1NmI1h.png', countKey: 'cricket' },
    { id: 'SOCCER', label: 'soccer', icon: '/assets/sports-soccer-CaiOK3CT.png', countKey: 'soccer' },
    { id: 'TENNIS', label: 'tennis', icon: '/assets/sports-tennis-DzBamNaA.png', countKey: 'tennis' },
    { id: 'HORSE_RACING', label: 'Horse racing', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'horse_racing' },
    { id: 'TABLE_TENNIS', label: 'Table tennis', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'table_tennis' },
    { id: 'BASEBALL', label: 'Baseball', icon: '/assets/sports-baseball-BIfs7vQf.png', countKey: 'baseball' },
    { id: 'BASKETBALL', label: 'Basketball', icon: '/assets/sports-basketball-D8I6c545.png', countKey: 'basketball' },
    { id: 'FOOTBALL', label: 'American Football', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'football' },
    { id: 'SNOOKER', label: 'Snooker', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'snooker' },
    { id: 'GREYHOUND', label: 'Greyhound racing', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'greyhound' },
    { id: 'KABADDI', label: 'Kabaddi', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'kabaddi' },
    { id: 'ELECTION', label: 'Election', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'election' },
    { id: 'ESPORTS', label: 'Esports', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'esports' },
    { id: 'MMA', label: 'Mixed Martial Arts', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'mma' },
    { id: 'VOLLEYBALL', label: 'Volleyball', icon: '/assets/sports-no-YhxjmpH9.png', countKey: 'volleyball' }
  ];

  return (
    <aside className="w-full lg:w-56 shrink-0 flex flex-col gap-2 select-none text-xs">
      {/* 1. ALL SPORTS ACCORDION */}
      <div className="bg-[#1e1e1e] rounded-md border border-[#2d2d2d] overflow-hidden shadow">
        {/* Accordion Title Header */}
        <div
          onClick={() => setAllSportsExpanded(!allSportsExpanded)}
          className="px-3 py-2.5 bg-[#272727] flex items-center justify-between cursor-pointer font-bold text-white uppercase text-[12px] border-b border-[#333] hover:bg-[#2d2d2d] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-[#f36c21]" />
            <span>All Sports</span>
          </div>
          {allSportsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        {/* Sports Links List */}
        {allSportsExpanded && (
          <div className="py-1">
            <button
              onClick={() => onSelectSport('ALL')}
              className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors ${
                selectedSport === 'ALL'
                  ? 'bg-[#f36c21] text-white font-bold'
                  : 'text-[#adadad] hover:text-white hover:bg-[#272727]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>All Live & Upcoming</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-white font-mono">
                {Object.values(sportCounts).reduce((a, b) => a + b, 0)}
              </span>
            </button>

            {sportsList.map((sport) => {
              const isSelected = selectedSport === sport.id;
              const count = sportCounts[sport.countKey] || 0;

              return (
                <button
                  key={sport.id}
                  onClick={() => onSelectSport(sport.id)}
                  className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-t border-[#262626] ${
                    isSelected
                      ? 'bg-[#f36c21] text-white font-bold'
                      : 'text-[#adadad] hover:text-white hover:bg-[#272727]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <img
                      src={sport.icon}
                      alt={sport.label}
                      className="w-4 h-4 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                    <span className="capitalize truncate">{sport.label}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-[#ffffff] font-mono shrink-0 ml-1">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. QUICK CASINO & MATKA CARDS */}
      <div className="bg-[#1e1e1e] rounded-md border border-[#2d2d2d] p-2 space-y-1.5 shadow">
        <button
          onClick={() => onNavigateTab('CASINO')}
          className="w-full p-2 rounded bg-gradient-to-r from-[#135C63] to-[#107A85] text-white flex items-center space-x-2 font-bold hover:brightness-110 transition-all text-[11px]"
        >
          <img src="/assets/casino-BnBk6FL5.webp" alt="Casino" className="w-4 h-4 object-contain" />
          <span>Evolution Live Casino</span>
        </button>

        <button
          onClick={() => onNavigateTab('MATKA')}
          className="w-full p-2 rounded bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center space-x-2 font-bold hover:brightness-110 transition-all text-[11px]"
        >
          <img src="/assets/gold-pot-B7mS4MfM.webp" alt="Matka" className="w-4 h-4 object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
          <span>Indian Worli Matka (23 Bazars)</span>
        </button>
      </div>
    </aside>
  );
};
