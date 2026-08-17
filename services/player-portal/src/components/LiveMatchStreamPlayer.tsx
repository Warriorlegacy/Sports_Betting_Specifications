import React, { useState } from 'react';
import { Tv, Radio, Maximize2, Volume2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { LiveMatch } from '../types/sportsbook';

interface LiveMatchStreamPlayerProps {
  match: LiveMatch;
}

export const LiveMatchStreamPlayer: React.FC<LiveMatchStreamPlayerProps> = ({ match }) => {
  const [streamMode, setStreamMode] = useState<'TV' | 'RADAR'>('TV');
  const [streamError, setStreamError] = useState<boolean>(false);

  // Extract event id from match id (e.g. FP_3391823 -> 3391823)
  const rawId = match.id.replace(/^FP_|^ZPLAY_|^MKT_/, '');
  const sportId = match.sport === 'Cricket' ? 4 : match.sport === 'Football' ? 1 : match.sport === 'Tennis' ? 2 : 1;

  const tvStreamUrl = `https://vid.dreamcasino.live/GetAPI.html?MatchID=${rawId}`;
  const radarUrl = `https://scorecard.oddstrad.com/get-scorecard-iframe/${sportId}/${rawId}/0`;

  return (
    <div className="space-y-4">
      {/* Stream Selector Controls */}
      <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => { setStreamMode('TV'); setStreamError(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              streamMode === 'TV'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>📺 Live TV Broadcast</span>
          </button>

          <button
            type="button"
            onClick={() => setStreamMode('RADAR')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              streamMode === 'RADAR'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>📊 Sportradar 3D Field</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
          <span className="hidden sm:inline-flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Low-Latency CDN</span>
          </span>
        </div>
      </div>

      {/* Embedded Player Frame */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        {streamMode === 'TV' ? (
          !streamError ? (
            <iframe
              src={tvStreamUrl}
              title={`${match.homeTeam.name} vs ${match.awayTeam.name} Live Stream`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              onError={() => setStreamError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-950 to-slate-900">
              <Tv className="w-12 h-12 text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">Live TV Stream Connecting...</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Broadcast rights for this fixture are loading or stream is initializing for match #{rawId}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStreamMode('RADAR')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-500 transition-all"
              >
                Switch to 3D Radar Tracker
              </button>
            </div>
          )
        ) : (
          <iframe
            src={radarUrl}
            title={`${match.homeTeam.name} vs ${match.awayTeam.name} Radar Scorecard`}
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        )}
      </div>
    </div>
  );
};
