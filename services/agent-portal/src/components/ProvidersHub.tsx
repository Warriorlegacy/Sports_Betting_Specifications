import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';

interface ProviderTier {
  name: string;
  priority: number;
  healthy: boolean;
  keyConfigured: boolean;
  lastFetchCount: number;
  lastFetchAt: number | null;
  consecutiveFailures?: number;
  nextProbeAt?: number | null;
}

interface ProviderStatusResponse {
  summary: {
    totalMatches: number;
    activeTier: string;
    timestamp: string;
  };
  tiers: ProviderTier[];
}

export const ProvidersHub: React.FC = () => {
  const [statusData, setStatusData] = useState<ProviderStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Key Configuration Modal
  const [keyModalOpen, setKeyModalOpen] = useState<boolean>(false);
  const [selectedProviderKey, setSelectedProviderKey] = useState<'odds' | 'sportmonks' | 'cricapi'>('odds');
  const [newKeyInput, setNewKeyInput] = useState<string>('');
  const [keyUpdating, setKeyUpdating] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/markets/providers/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error('Failed to fetch provider status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/markets/providers/sync', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestProvider = async (provider: 'odds' | 'sportmonks' | 'cricapi') => {
    try {
      setTestingProvider(provider);
      setTestResult(null);
      const res = await fetch('/api/markets/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setKeyUpdating(true);
      const res = await fetch('/api/markets/providers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProviderKey, apiKey: newKeyInput.trim() })
      });
      if (res.ok) {
        setKeyModalOpen(false);
        setNewKeyInput('');
        await fetchStatus();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update key');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setKeyUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#1e1e1e] via-[#242424] to-[#1e1e1e] border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-[#f36c21]/30 flex items-center justify-center text-[#f36c21]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Live Data Feeds & Real Odds Engine</h2>
              <p className="text-xs text-zinc-400">
                Multi-tier failover chain with real bookmaker odds, ESPN free scraper, and automatic settlements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 text-xs font-semibold flex items-center space-x-2 border border-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f36c21]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] active:scale-95 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-600/30 transition"
          >
            <Zap className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
            <span>{syncing ? 'Syncing All Feeds...' : 'Sync All Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#1e1e1e] border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Real Matches</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">
              {statusData?.summary.totalMatches ?? '—'}
            </div>
            <span className="text-[11px] text-zinc-500">Across 15+ global leagues</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1e1e1e] border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Primary Tier</span>
            <div className="text-base font-bold text-white mt-1 truncate max-w-[200px]">
              {statusData?.summary.activeTier ?? 'ESPN Free (Tier 4)'}
            </div>
            <span className="text-[11px] text-[#f36c21] font-medium">Automatic failover active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-[#f36c21]/20 flex items-center justify-center text-[#f36c21]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1e1e1e] border border-zinc-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Automated Settlement</span>
            <div className="text-base font-bold text-amber-400 mt-1">
              Atomic Double-Entry
            </div>
            <span className="text-[11px] text-zinc-500">PostgreSQL ledger + payouts</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Free API Options & Setup Guide */}
      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="text-sm font-bold text-emerald-300">100% Free & Zero-Cost Out-of-the-Box Mode Active</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              The platform is currently operating with real-world scores, clocks, and live odds without needing any paid subscriptions.
              You can optionally enhance odds precision with <strong>100% free API keys</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#141414] border border-zinc-800 text-xs">
                <div className="font-bold text-white">The-Odds-API (500 free/mo)</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Real Las Vegas & European bookmaker decimal odds.</div>
                <a
                  href="https://the-odds-api.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f36c21] hover:text-amber-400 font-semibold inline-flex items-center space-x-1 mt-2"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-zinc-800 text-xs">
                <div className="font-bold text-white">CricAPI (100 free/day)</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Live cricket ball-by-ball scorecards and schedules.</div>
                <a
                  href="https://cricapi.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#f36c21] hover:text-amber-400 font-semibold inline-flex items-center space-x-1 mt-2"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-zinc-800 text-xs">
                <div className="font-bold text-white">ESPN Public Feeds</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">Built-in default, unlimited calls, 0 API key required.</div>
                <span className="text-emerald-400 font-semibold text-[11px] inline-block mt-2">Active & Running ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Tiers Table */}
      <div className="rounded-2xl bg-[#1e1e1e] border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Configured Provider Failover Chain</h3>
          <span className="text-xs text-zinc-400">Higher priority (lower tier number) overrides matching fixtures</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#141414] text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                <th className="py-3.5 px-5">Tier / Provider</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">API Key</th>
                <th className="py-3.5 px-5">Last Synced</th>
                <th className="py-3.5 px-5">Matches Returned</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {statusData?.tiers.map((tier) => (
                <tr key={tier.name} className="hover:bg-[#262626] transition">
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-[#141414] border border-zinc-700 text-zinc-300 font-bold text-[11px] flex items-center justify-center">
                        T{tier.priority}
                      </span>
                      <div>
                        <div className="font-bold text-white">{tier.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {tier.priority === 1
                            ? 'Real bookmaker odds & scores'
                            : tier.priority === 2
                            ? 'Football statistics & lineups'
                            : tier.priority === 3
                            ? 'Cricket specialist'
                            : tier.priority === 4
                            ? 'Global sports scoreboard (Free)'
                            : 'Matching engine liquidity'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    {tier.healthy ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Healthy (Closed)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Circuit Open</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    {tier.priority === 4 || tier.priority === 5 ? (
                      <span className="text-zinc-400 font-medium">Not Required (Free)</span>
                    ) : tier.keyConfigured ? (
                      <span className="text-emerald-400 font-medium flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Configured</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center space-x-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Key Missing</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-zinc-300 font-mono">
                    {tier.lastFetchAt ? new Date(tier.lastFetchAt).toLocaleTimeString() : 'Pending'}
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-bold text-white font-mono">{tier.lastFetchCount}</span>
                    <span className="text-zinc-500 text-[11px] ml-1">matches</span>
                  </td>

                  <td className="py-4 px-5 text-right space-x-2">
                    {tier.priority <= 3 && (
                      <>
                        <button
                          onClick={() => {
                            const pKey = tier.priority === 1 ? 'odds' : tier.priority === 2 ? 'sportmonks' : 'cricapi';
                            setSelectedProviderKey(pKey);
                            setKeyModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#333] text-[#f36c21] text-[11px] font-semibold border border-zinc-700 transition"
                        >
                          Configure Key
                        </button>
                        <button
                          onClick={() => {
                            const pKey = tier.priority === 1 ? 'odds' : tier.priority === 2 ? 'sportmonks' : 'cricapi';
                            handleTestProvider(pKey);
                          }}
                          disabled={testingProvider !== null}
                          className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 text-amber-300 text-[11px] font-semibold border border-orange-500/30 transition"
                        >
                          {testingProvider === (tier.priority === 1 ? 'odds' : tier.priority === 2 ? 'sportmonks' : 'cricapi')
                            ? 'Testing...'
                            : 'Test'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Test Result Panel */}
      {testResult && (
        <div className="p-5 rounded-2xl bg-[#1e1e1e] border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#f36c21]" />
              <span>Provider Test Result: {testResult.provider}</span>
            </h4>
            <button onClick={() => setTestResult(null)} className="text-xs text-zinc-400 hover:text-white">
              Dismiss
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#141414] border border-zinc-800 text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Key Configuration Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#1e1e1e] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#f36c21]" />
                <span>Configure {selectedProviderKey.toUpperCase()} API Key</span>
              </h3>
              <button onClick={() => setKeyModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  API Key for {selectedProviderKey === 'odds' ? 'The-Odds-API' : selectedProviderKey === 'sportmonks' ? 'Sportmonks' : 'CricAPI'}
                </label>
                <input
                  type="password"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  placeholder="Paste your API key here..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-zinc-700 text-white text-sm focus:outline-none focus:border-[#f36c21] font-mono"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  The key will be activated instantly and circuit breakers will reset automatically.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-300 text-xs font-semibold transition border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={keyUpdating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition"
                >
                  {keyUpdating ? 'Saving & Syncing...' : 'Save & Sync Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

