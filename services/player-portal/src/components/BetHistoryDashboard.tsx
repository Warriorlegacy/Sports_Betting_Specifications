import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Calendar,
  Trophy,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  X,
  ChevronDown
} from 'lucide-react';
import { UserBet } from './MyBets';

interface BetHistoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bets: UserBet[];
  user: any | null;
}

export const BetHistoryDashboard: React.FC<BetHistoryDashboardProps> = ({
  isOpen,
  onClose,
  bets,
  user
}) => {
  const [dateRange, setDateRange] = useState<'TODAY' | '7D' | '30D' | 'ALL'>('ALL');
  const [sportFilter, setSportFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WON' | 'LOST' | 'OPEN'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'STAKE' | 'PNL'>('DATE');

  // Filter logic
  const filteredBets = useMemo(() => {
    let result = [...bets];

    // Date range filter
    if (dateRange !== 'ALL') {
      const now = Date.now();
      const msMap = { TODAY: 86400000, '7D': 604800000, '30D': 2592000000, ALL: 0 };
      const cutoff = now - (msMap[dateRange] || 0);
      result = result.filter((b) => new Date(b.createdAt).getTime() >= cutoff);
    }

    // Status filter
    if (statusFilter === 'WON') result = result.filter((b) => (b.pnl || 0) > 0);
    else if (statusFilter === 'LOST') result = result.filter((b) => (b.pnl || 0) < 0);
    else if (statusFilter === 'OPEN') result = result.filter((b) => b.status === 'MATCHED' || b.status === 'UNMATCHED');

    // Sort
    if (sortBy === 'STAKE') result.sort((a, b) => (b.stake || 0) - (a.stake || 0));
    else if (sortBy === 'PNL') result.sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [bets, dateRange, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const totalBets = filteredBets.length;
    const totalStake = filteredBets.reduce((s, b) => s + (b.stake || 0), 0);
    const totalPnl = filteredBets.reduce((s, b) => s + (b.pnl || 0), 0);
    const wins = filteredBets.filter((b) => (b.pnl || 0) > 0).length;
    const losses = filteredBets.filter((b) => (b.pnl || 0) < 0).length;
    const openBets = filteredBets.filter((b) => b.status === 'MATCHED' || b.status === 'UNMATCHED').length;
    const winRate = totalBets > 0 ? ((wins / Math.max(wins + losses, 1)) * 100) : 0;
    const avgStake = totalBets > 0 ? totalStake / totalBets : 0;
    const roi = totalStake > 0 ? ((totalPnl / totalStake) * 100) : 0;
    const bestWin = filteredBets.reduce((max, b) => Math.max(max, b.pnl || 0), 0);
    const worstLoss = filteredBets.reduce((min, b) => Math.min(min, b.pnl || 0), 0);
    return { totalBets, totalStake, totalPnl, wins, losses, openBets, winRate, avgStake, roi, bestWin, worstLoss };
  }, [filteredBets]);

  // P&L chart data (last 7 points)
  const chartData = useMemo(() => {
    const sorted = [...filteredBets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let cumPnl = 0;
    const points = sorted.map((b) => {
      cumPnl += b.pnl || 0;
      return { date: b.createdAt, pnl: cumPnl, label: b.selectionName };
    });
    // Take last 12 points for chart
    return points.slice(-12);
  }, [filteredBets]);

  const maxPnl = Math.max(...chartData.map((p) => Math.abs(p.pnl)), 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333] bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f36c21] to-amber-500 flex items-center justify-center shadow-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Bet History & P&L</h2>
              <p className="text-[11px] text-[#888]">
                {user?.username || 'Player'} • {stats.totalBets} total bets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#333] transition cursor-pointer">
            <X size={18} className="text-[#888]" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border-b border-[#333]">
          <StatCard
            icon={<Target size={14} />}
            label="Total P&L"
            value={`₹${stats.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
            color={stats.totalPnl >= 0 ? '#27AE60' : '#FF4148'}
          />
          <StatCard
            icon={<Trophy size={14} />}
            label="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            color={stats.winRate >= 50 ? '#27AE60' : '#ffc107'}
            sub={`${stats.wins}W / ${stats.losses}L`}
          />
          <StatCard
            icon={<Activity size={14} />}
            label="ROI"
            value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`}
            color={stats.roi >= 0 ? '#27AE60' : '#FF4148'}
          />
          <StatCard
            icon={<PieChart size={14} />}
            label="Avg Stake"
            value={`₹${stats.avgStake.toFixed(0)}`}
            color="#f36c21"
            sub={`${stats.openBets} open`}
          />
        </div>

        {/* P&L Chart */}
        {chartData.length > 1 && (
          <div className="px-4 py-3 border-b border-[#333]">
            <div className="text-[10px] uppercase text-[#888] font-bold mb-2 tracking-wider">Cumulative P&L</div>
            <div className="flex items-end space-x-1 h-16">
              {chartData.map((point, idx) => {
                const height = Math.max(Math.abs(point.pnl) / maxPnl * 100, 5);
                const isPositive = point.pnl >= 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPositive
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-red-600 to-red-400'
                      }`}
                      style={{ height: `${height}%`, minHeight: '3px' }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#333] text-[9px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                      ₹{point.pnl.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-[#333] bg-[#181818]">
          <div className="flex items-center space-x-1 bg-[#272727] rounded-lg p-0.5">
            {(['TODAY', '7D', '30D', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                  dateRange === range ? 'bg-[#f36c21] text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-1 bg-[#272727] rounded-lg p-0.5">
            {(['ALL', 'WON', 'LOST', 'OPEN'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                  statusFilter === status ? 'bg-[#f36c21] text-white' : 'text-[#888] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center space-x-1 text-[10px] text-[#888]">
            <Filter size={10} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#272727] border-none text-[#ccc] text-[10px] px-2 py-1 rounded cursor-pointer"
            >
              <option value="DATE">Sort: Date</option>
              <option value="STAKE">Sort: Stake</option>
              <option value="PNL">Sort: P&L</option>
            </select>
          </div>
        </div>

        {/* Bet List */}
        <div className="flex-1 overflow-y-auto">
          {filteredBets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#555]">
              <BarChart3 size={40} className="mb-3 opacity-40" />
              <p className="text-sm font-bold">No bets found</p>
              <p className="text-xs mt-1">Start placing bets to see your history here</p>
            </div>
          ) : (
            <div className="divide-y divide-[#272727]">
              {filteredBets.map((bet) => (
                <BetRow key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#333] bg-[#181818] text-[10px]">
          <div className="flex items-center space-x-4">
            <span className="text-[#888]">
              Total Staked: <span className="text-white font-bold">₹{stats.totalStake.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-[#888]">
              Best Win: <span className="text-emerald-400 font-bold">+₹{stats.bestWin.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-[#888]">
              Worst Loss: <span className="text-red-400 font-bold">₹{stats.worstLoss.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className={`font-black text-sm ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}₹{stats.totalPnl.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable stat card
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  sub?: string;
}> = ({ icon, label, value, color, sub }) => (
  <div className="bg-[#222] rounded-lg p-2.5 border border-[#333]">
    <div className="flex items-center space-x-1.5 mb-1">
      <span style={{ color }} className="opacity-80">{icon}</span>
      <span className="text-[9px] uppercase text-[#888] font-bold tracking-wider">{label}</span>
    </div>
    <div className="text-sm font-black" style={{ color }}>{value}</div>
    {sub && <div className="text-[9px] text-[#666] mt-0.5">{sub}</div>}
  </div>
);

// Individual bet row
const BetRow: React.FC<{ bet: UserBet }> = ({ bet }) => {
  const isWin = (bet.pnl || 0) > 0;
  const isLoss = (bet.pnl || 0) < 0;
  const isOpen = bet.status === 'MATCHED' || bet.status === 'UNMATCHED';

  const statusColor = isWin ? '#27AE60' : isLoss ? '#FF4148' : isOpen ? '#ffc107' : '#888';
  const statusLabel = isWin ? 'WON' : isLoss ? 'LOST' : isOpen ? 'OPEN' : bet.status;

  const time = new Date(bet.createdAt);
  const timeStr = time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
    time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center px-4 py-2.5 hover:bg-[#1e1e1e] transition">
      {/* Status indicator */}
      <div className="w-1 h-8 rounded-full mr-3" style={{ backgroundColor: statusColor }} />

      {/* Bet details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
              bet.type === 'BACK' ? 'bg-blue-500/20 text-blue-400' : bet.type === 'LAY' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'
            }`}
          >
            {bet.type}
          </span>
          <span className="text-xs font-bold text-white truncate">{bet.selectionName}</span>
        </div>
        <div className="text-[10px] text-[#888] mt-0.5 truncate">{bet.eventName}</div>
      </div>

      {/* Odds & Stake */}
      <div className="text-right mx-4">
        <div className="text-xs font-mono font-bold text-[#ccc]">@{bet.price?.toFixed(2)}</div>
        <div className="text-[10px] text-[#888]">₹{(bet.stake || 0).toLocaleString('en-IN')}</div>
      </div>

      {/* P&L */}
      <div className="text-right min-w-[70px]">
        <div className="text-xs font-black" style={{ color: statusColor }}>
          {isOpen ? (
            <span className="text-[10px] font-bold uppercase">OPEN</span>
          ) : (
            <>
              {isWin ? '+' : ''}₹{(bet.pnl || 0).toLocaleString('en-IN')}
            </>
          )}
        </div>
        <div className="text-[9px] text-[#666]">{timeStr}</div>
      </div>
    </div>
  );
};
