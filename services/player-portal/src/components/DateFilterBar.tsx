import React from 'react';
import { Calendar, Search } from 'lucide-react';

export interface DateFilterBarProps {
  selectedDate: string; // 'ALL' | 'LIVE' | 'YYYY-MM-DD'
  onSelectDate: (dateKey: string) => void;
  statusFilter: 'ALL' | 'LIVE' | 'UPCOMING' | 'SETTLED';
  onSelectStatus: (status: 'ALL' | 'LIVE' | 'UPCOMING' | 'SETTLED') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCountsByDate: Record<string, number>;
  liveMatchCount: number;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  selectedDate,
  onSelectDate,
  statusFilter,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  matchCountsByDate,
  liveMatchCount
}) => {
  // Generate 7-day calendar strip starting from today
  const today = new Date();
  const dateOptions: { key: string; label: string; subLabel: string; dateStr: string }[] = [];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[d.getDay()];
    const subLabel = `${months[d.getMonth()]} ${d.getDate()}`;

    dateOptions.push({
      key: dateStr,
      label: dayName,
      subLabel,
      dateStr
    });
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Top Row: Title, Search, and Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>GLOBAL FIXTURES CALENDAR</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                World Coverage
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Filter real-time and scheduled matches worldwide by date and sport
            </p>
          </div>
        </div>

        {/* Search Bar & Status Pills */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Live Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, league, or country..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => onSelectStatus('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onSelectStatus('LIVE')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                statusFilter === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live ({liveMatchCount})</span>
            </button>
            <button
              onClick={() => onSelectStatus('UPCOMING')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'UPCOMING'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => onSelectStatus('SETTLED')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'SETTLED'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Results
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Horizontal Date Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-800/80">
        {/* 'LIVE NOW' Quick Tab */}
        <button
          onClick={() => {
            onSelectDate('LIVE');
            onSelectStatus('LIVE');
          }}
          className={`px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[105px] transition-all border ${
            selectedDate === 'LIVE' || statusFilter === 'LIVE'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
              : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center space-x-1.5 text-xs font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE NOW</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400/80 mono-num">
            {liveMatchCount} Matches
          </span>
        </button>

        {/* 'ALL DATES' Tab */}
        <button
          onClick={() => {
            onSelectDate('ALL');
            onSelectStatus('ALL');
          }}
          className={`px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[95px] transition-all border ${
            selectedDate === 'ALL' && statusFilter !== 'LIVE'
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-black">ALL DATES</span>
          <span className="text-[10px] text-slate-300/80 font-medium">World Feed</span>
        </button>

        {/* 7 Daily Date Pills */}
        {dateOptions.map((opt) => {
          const isSelected = selectedDate === opt.key && statusFilter !== 'LIVE';
          const matchCount = matchCountsByDate[opt.key] || 0;

          return (
            <button
              key={opt.key}
              onClick={() => {
                onSelectDate(opt.key);
                if (statusFilter === 'LIVE') onSelectStatus('ALL');
              }}
              className={`px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[100px] transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400'
                  : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black tracking-tight">{opt.label}</span>
                {opt.label === 'Today' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
                <span>{opt.subLabel}</span>
                {matchCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 font-bold text-slate-300 mono-num">
                    {matchCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
