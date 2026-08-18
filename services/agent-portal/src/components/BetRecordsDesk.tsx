import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';

export interface BetRecord {
  id: string;
  userId: string;
  username: string;
  userRole: string;
  marketId: string;
  eventName: string;
  sport: string;
  selectionId: number;
  selectionName: string;
  type: 'BACK' | 'LAY';
  price: number;
  stake: number;
  matchedStake: number;
  unmatchedStake: number;
  liability: number;
  status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' | 'SETTLED' | 'CANCELLED' | 'SUSPENDED';
  pnl: number;
  createdAt: string;
  matchedAt?: string;
  settledAt?: string;
}

export const BetRecordsDesk: React.FC = () => {
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    totalLiability: 0,
    totalPnL: 0,
    matchedCount: 0,
    unmatchedCount: 0,
    settledCount: 0
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const pageSize = 25;

  const fetchBetRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.bets.getRecords({
        username: searchTerm.trim() || undefined,
        sport: selectedSport !== 'ALL' ? selectedSport : undefined,
        type: selectedType !== 'ALL' ? selectedType : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        limit: pageSize,
        offset: page * pageSize
      });

      setBets(res.bets || []);
      setTotalCount(res.total || 0);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load bet records:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSport, selectedType, selectedStatus, page]);

  useEffect(() => {
    fetchBetRecords();
  }, [fetchBetRecords]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">ADMIN</span>;
      case 'SUPER_MASTER':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">SUPER MASTER</span>;
      case 'MASTER':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">MASTER</span>;
      case 'AGENT':
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">AGENT</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-700 text-slate-300 font-bold">PLAYER</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">MATCHED</span>;
      case 'PARTIALLY_MATCHED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/50">PARTIAL</span>;
      case 'UNMATCHED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50">OPEN QUEUE</span>;
      case 'SETTLED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-200 border border-slate-700">SETTLED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-950/80 text-red-400 border border-red-800/50">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#f36c21]" />
              Live Multi-User Bet Records Desk
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-950/80 text-amber-300 border border-orange-700/60">
              Audit & Risk Stream
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor real-time sports betting activity, unmatched order books, exposures, and settled P&L across all players.
          </p>
        </div>

        <button
          onClick={fetchBetRecords}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-200 text-xs font-bold transition-all border border-zinc-700 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f36c21]' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Turnover</span>
            <Layers className="w-4 h-4 text-[#f36c21]" />
          </div>
          <p className="text-xl font-mono font-black text-white mt-1">
            ₹{stats.totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {totalCount.toLocaleString()} total bets placed
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Open Risk Liability</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-mono font-black text-amber-400 mt-1">
            ₹{stats.totalLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Locked worst-case player exposure
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Net Settled P&L</span>
            {stats.totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-xl font-mono font-black mt-1 ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}₹{stats.totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {stats.settledCount.toLocaleString()} settled bets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active / Queue</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-mono font-black text-emerald-400">{stats.matchedCount}</span>
            <span className="text-xs text-zinc-500 font-bold">Matched</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xl font-mono font-black text-amber-400">{stats.unmatchedCount}</span>
            <span className="text-xs text-zinc-500 font-bold">Unmatched</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Live order matching queue
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Username */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by username or Bet ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#f36c21]"
            />
          </div>

          {/* Sport Filter */}
          <div>
            <select
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#f36c21]"
            >
              <option value="ALL">All Sports</option>
              <option value="Cricket">Cricket</option>
              <option value="Football">Football</option>
              <option value="Tennis">Tennis</option>
              <option value="Basketball">Basketball</option>
            </select>
          </div>

          {/* Bet Type (BACK / LAY) */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#f36c21]"
            >
              <option value="ALL">All Bet Types (Back & Lay)</option>
              <option value="BACK">BACK Bets (For Outcome)</option>
              <option value="LAY">LAY Bets (Against Outcome)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-[#141414] border border-zinc-700 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#f36c21]"
            >
              <option value="ALL">All Statuses</option>
              <option value="MATCHED">MATCHED</option>
              <option value="UNMATCHED">UNMATCHED (In Queue)</option>
              <option value="SETTLED">SETTLED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bet Records Table */}
      <div className="bg-[#1e1e1e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#141414] text-zinc-400 uppercase text-[10px] font-black border-b border-zinc-800 tracking-wider">
              <tr>
                <th className="px-4 py-3">Placed Time</th>
                <th className="px-4 py-3">Player Account</th>
                <th className="px-4 py-3">Event & Sport</th>
                <th className="px-4 py-3">Selection Runner</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-right">Odds (Price)</th>
                <th className="px-4 py-3 text-right">Stake / Matched</th>
                <th className="px-4 py-3 text-right">Exposure / Liability</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Settled P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f36c21] mb-2" />
                    <span>Loading real-time bet records...</span>
                  </td>
                </tr>
              ) : bets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                    <Layers className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                    <p className="font-bold text-zinc-400">No Bet Records Found</p>
                    <p className="text-[11px] mt-1 text-zinc-600">No bets matching your current filter criteria.</p>
                  </td>
                </tr>
              ) : (
                bets.map((bet) => {
                  const isBack = bet.type === 'BACK';
                  const placedDate = new Date(bet.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={bet.id} className="hover:bg-[#262626] transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {placedDate}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{bet.username}</span>
                          {getRoleBadge(bet.userRole)}
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500 block truncate max-w-[110px]">
                          {bet.id.substring(0, 8)}...
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-bold text-white truncate" title={bet.eventName}>
                          {bet.eventName}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                          {bet.sport}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                        {bet.selectionName}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-black rounded-lg uppercase tracking-wider ${
                            isBack
                              ? 'bg-[#0d6efd]/25 text-blue-300 border border-blue-600/40'
                              : 'bg-[#e91e63]/25 text-pink-300 border border-pink-600/40'
                          }`}
                        >
                          {bet.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-black text-sm text-amber-400 whitespace-nowrap">
                        {bet.price.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                        <div className="font-black text-white">₹{bet.stake.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        {bet.matchedStake < bet.stake && (
                          <div className="text-[10px] text-emerald-400">
                            Matched: ₹{bet.matchedStake.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                        ₹{bet.liability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {getStatusBadge(bet.status)}
                      </td>

                      <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                        {bet.status === 'SETTLED' ? (
                          <span
                            className={`font-black text-sm ${
                              bet.pnl > 0
                                ? 'text-emerald-400'
                                : bet.pnl < 0
                                ? 'text-red-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {bet.pnl > 0 ? '+' : ''}₹{bet.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-bold text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#141414] flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing <span className="font-bold text-white">{bets.length}</span> of{' '}
            <span className="font-bold text-white">{totalCount.toLocaleString()}</span> bet records
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#333] disabled:opacity-40 text-white font-bold transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-mono text-zinc-300">
              Page {page + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * pageSize >= totalCount || loading}
              className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#333] disabled:opacity-40 text-white font-bold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
