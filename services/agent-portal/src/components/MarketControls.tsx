import React, { useState } from 'react';
import { ShieldAlert, Play, Pause, CheckCircle, PlusCircle, Trophy, Activity } from 'lucide-react';

interface MarketSelection {
  selectionId: number;
  name: string;
  status: string;
}

interface Market {
  id: string;
  eventName: string;
  marketType: string;
  sport: string;
  isLocked: boolean;
  inPlay: boolean;
  status: string;
  winningSelectionId: number | null;
  selections: MarketSelection[];
}

interface MarketControlsProps {
  markets: Market[];
  currentUserRole: string;
  onToggleLock: (marketId: string, isLocked: boolean) => Promise<void>;
  onSettleMarket: (marketId: string, winningSelectionId: number) => Promise<void>;
  onCreateMarket: (marketData: any) => Promise<void>;
}

export const MarketControls: React.FC<MarketControlsProps> = ({
  markets,
  currentUserRole,
  onToggleLock,
  onSettleMarket,
  onCreateMarket
}) => {
  const [selectedMarketForSettle, setSelectedMarketForSettle] = useState<Market | null>(null);
  const [selectedWinningRunner, setSelectedWinningRunner] = useState<number | null>(null);
  const [settling, setSettling] = useState<boolean>(false);

  // New Market Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newMarketId, setNewMarketId] = useState<string>('');
  const [newEventName, setNewEventName] = useState<string>('');
  const [newSport, setNewSport] = useState<string>('Cricket');
  const [runner1, setRunner1] = useState<string>('');
  const [runner2, setRunner2] = useState<string>('');
  const [runner3, setRunner3] = useState<string>('');

  const isAdmin = currentUserRole === 'ADMIN';

  const handleSettleSubmit = async () => {
    if (!selectedMarketForSettle || selectedWinningRunner === null) return;
    try {
      setSettling(true);
      await onSettleMarket(selectedMarketForSettle.id, selectedWinningRunner);
      setSelectedMarketForSettle(null);
      setSelectedWinningRunner(null);
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selections = [runner1.trim(), runner2.trim()];
    if (runner3.trim()) selections.push(runner3.trim());

    if (!newMarketId || !newEventName || selections.length < 2) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      await onCreateMarket({
        id: newMarketId.trim(),
        eventName: newEventName.trim(),
        sport: newSport,
        marketType: 'MATCH_ODDS',
        selections
      });
      setShowCreateModal(false);
      setNewMarketId('');
      setNewEventName('');
      setRunner1('');
      setRunner2('');
      setRunner3('');
    } catch (err: any) {
      alert(err.message || 'Failed to create market');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#1e1e1e] border border-zinc-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-[#f36c21]" />
          <div>
            <h2 className="text-base font-bold text-white">Live Market Control & Emergency Killswitch</h2>
            <p className="text-xs text-zinc-400">Freeze order matching or settle positions instantly across the exchange</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white shadow-lg shadow-orange-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {markets.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              m.status === 'SETTLED'
                ? 'bg-[#141414] border-zinc-800 opacity-60'
                : m.isLocked || m.status === 'SUSPENDED'
                ? 'bg-red-950/20 border-red-900/50 shadow-red-900/10 shadow-lg'
                : 'bg-[#1e1e1e] border-zinc-800 hover:border-[#f36c21]/40 shadow-xl'
            }`}
          >
            <div>
              {/* Status and Sport Badges */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#141414] text-zinc-300 border border-zinc-700">
                  {m.sport}
                </span>

                <div className="flex items-center space-x-1.5">
                  {m.status === 'OPEN' && !m.isLocked && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  )}
                  {(m.isLocked || m.status === 'SUSPENDED') && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                      SUSPENDED
                    </span>
                  )}
                  {m.status === 'SETTLED' && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      SETTLED
                    </span>
                  )}
                </div>
              </div>

              {/* Event Name */}
              <h3 className="font-bold text-base text-white tracking-tight leading-snug mb-1">
                {m.eventName}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mb-4">ID: {m.id}</p>

              {/* Runner Selections */}
              <div className="space-y-1.5 mb-5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Runners
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {m.selections.map((sel) => (
                    <div
                      key={sel.selectionId}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-between ${
                        m.winningSelectionId === sel.selectionId
                          ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                          : 'bg-[#141414] border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="truncate">{sel.name}</span>
                      {m.winningSelectionId === sel.selectionId && (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {m.status !== 'SETTLED' && (
              <div className="flex items-center space-x-2 pt-3 border-t border-zinc-800">
                {/* Emergency Lock / Unlock Toggle */}
                <button
                  onClick={() => onToggleLock(m.id, !m.isLocked)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                    m.isLocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                  }`}
                >
                  {m.isLocked ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Market</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Freeze Kill-Switch</span>
                    </>
                  )}
                </button>

                {/* Settle Outcome Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => setSelectedMarketForSettle(m)}
                    className="flex items-center space-x-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-[#242424] hover:bg-[#333] border border-zinc-700 text-white shadow-sm transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#f36c21]" />
                    <span>Settle</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settle Market Modal */}
      {selectedMarketForSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div>
              <h3 className="font-bold text-lg text-white">Settle Market Result</h3>
              <p className="text-xs text-zinc-400">{selectedMarketForSettle.eventName}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Select Winning Runner
              </label>
              <div className="space-y-2">
                {selectedMarketForSettle.selections.map((sel) => (
                  <button
                    key={sel.selectionId}
                    type="button"
                    onClick={() => setSelectedWinningRunner(sel.selectionId)}
                    className={`w-full p-3 rounded-xl text-sm font-bold text-left border flex items-center justify-between transition-all ${
                      selectedWinningRunner === sel.selectionId
                        ? 'bg-orange-950/40 border-[#f36c21] text-amber-300'
                        : 'bg-[#141414] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span>{sel.name}</span>
                    {selectedWinningRunner === sel.selectionId && <CheckCircle className="w-4 h-4 text-[#f36c21]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300">
              Warning: Settling executes double-entry payouts to all winning traders, unlocks user exposures, and deposits the 2% operator rake into the Admin treasury. This action is irreversible.
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setSelectedMarketForSettle(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 border border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedWinningRunner === null || settling}
                onClick={handleSettleSubmit}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white shadow-lg shadow-orange-600/25 disabled:opacity-50 transition-all"
              >
                {settling ? 'Settling P&L...' : 'Confirm & Settle Payouts'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-lg text-white">Create New Sporting Event</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Market ID (Unique)</label>
                <input
                  type="text"
                  placeholder="e.g. MKT_CSK_MI_IPL"
                  value={newMarketId}
                  onChange={(e) => setNewMarketId(e.target.value)}
                  required
                  className="w-full mt-1 p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai Super Kings vs Mumbai Indians - IPL Final"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  required
                  className="w-full mt-1 p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Sport</label>
                <select
                  value={newSport}
                  onChange={(e) => setNewSport(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                >
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300">Runners / Selections</label>
                <input
                  type="text"
                  placeholder="Runner 1 (e.g. CSK)"
                  value={runner1}
                  onChange={(e) => setRunner1(e.target.value)}
                  required
                  className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Runner 2 (e.g. MI)"
                  value={runner2}
                  onChange={(e) => setRunner2(e.target.value)}
                  required
                  className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Runner 3 (Optional, e.g. The Draw)"
                  value={runner3}
                  onChange={(e) => setRunner3(e.target.value)}
                  className="w-full p-2 bg-[#141414] border border-zinc-700 rounded-lg text-xs text-white focus:border-[#f36c21] focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#242424] hover:bg-[#333] text-zinc-300 border border-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white shadow-lg shadow-orange-600/25 transition-all"
                >
                  Create Market
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
