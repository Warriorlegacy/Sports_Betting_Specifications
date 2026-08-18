import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { LiveMatch, SportCategory } from '../types/sportsbook';

interface FairplayEventListProps {
  matches: LiveMatch[];
  selectedSport: SportCategory;
  onSelectMatch: (matchId: string) => void;
  onSelectOdds: (
    matchId: string,
    marketId: string,
    marketName: string,
    selectionId: string,
    selectionName: string,
    price: number,
    type?: 'BACK' | 'LAY'
  ) => void;
  selectedSelectionId?: string;
  selectedOddsType?: 'BACK' | 'LAY';
}

export const FairplayEventList: React.FC<FairplayEventListProps> = ({
  matches,
  selectedSport,
  onSelectMatch,
  onSelectOdds,
  selectedSelectionId,
  selectedOddsType
}) => {
  const [feedType, setFeedType] = useState<'LIVE' | 'VIRTUAL'>('LIVE');

  // Filter matches by sport
  const filteredMatches = matches.filter((m) => {
    if (selectedSport === 'All') return true;
    return m.sport.toLowerCase() === selectedSport.toLowerCase();
  });

  // Group by Sport Category
  const groupedMatches: Record<string, LiveMatch[]> = {};
  filteredMatches.forEach((m) => {
    const key = m.sport || 'Cricket';
    if (!groupedMatches[key]) groupedMatches[key] = [];
    groupedMatches[key].push(m);
  });

  const getSportIcon = (sportKey: string) => {
    const key = sportKey.toUpperCase();
    switch (key) {
      case 'CRICKET':
        return '/assets/sports-cricket-Qf1NmI1h.png';
      case 'SOCCER':
      case 'FOOTBALL':
        return '/assets/sports-soccer-CaiOK3CT.png';
      case 'TENNIS':
        return '/assets/sports-tennis-DzBamNaA.png';
      case 'BASKETBALL':
        return '/assets/sports-basketball-D8I6c545.png';
      case 'BASEBALL':
        return '/assets/sports-baseball-BIfs7vQf.png';
      default:
        return '/assets/sports-no-YhxjmpH9.png';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 min-w-0 select-none">
      {/* 1. FEED CONTROLS & SUB-TABS */}
      <div className="bg-[#1e1e1e] p-2 rounded-md border border-[#2d2d2d] flex items-center justify-between shadow">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFeedType('LIVE')}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
              feedType === 'LIVE'
                ? 'bg-[#f36c21] text-white shadow'
                : 'bg-[#272727] text-[#adadad] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE IN-PLAY</span>
          </button>
          <button
            onClick={() => setFeedType('VIRTUAL')}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center space-x-1.5 ${
              feedType === 'VIRTUAL'
                ? 'bg-[#f36c21] text-white shadow'
                : 'bg-[#272727] text-[#adadad] hover:text-white'
            }`}
          >
            <span>VIRTUAL</span>
          </button>
        </div>

        <div className="text-[11px] text-[#adadad] font-mono hidden sm:block">
          Streaming <span className="text-[#27AE60] font-bold">{filteredMatches.length}</span> Active Exchange Matches
        </div>
      </div>

      {/* 2. MATCH EVENT CARDS GROUPED BY SPORT */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="bg-[#1e1e1e] p-8 rounded-md border border-[#2d2d2d] text-center text-[#adadad]">
          <Activity className="w-10 h-10 mx-auto text-[#f36c21] mb-2 animate-pulse" />
          <h3 className="font-bold text-sm text-white">No active matches found</h3>
          <p className="text-xs mt-1">Connecting to live exchange telemetry feeds...</p>
        </div>
      ) : (
        Object.entries(groupedMatches).map(([sportKey, sportMatches]) => (
          <div key={sportKey} className="bg-[#1e1e1e] rounded-md border border-[#2d2d2d] overflow-hidden shadow">
            {/* SPORT HEADER RIBBON (Fairplay Teal Gradient) */}
            <div className="px-3 py-2 bg-gradient-to-r from-[#135C63] via-[#107A85] to-[#135C63] text-white flex items-center justify-between font-bold text-xs">
              <div className="flex items-center space-x-2">
                <img
                  src={getSportIcon(sportKey)}
                  alt={sportKey}
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
                <span className="capitalize font-black tracking-wide">{sportKey.toLowerCase()}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 font-mono">
                {sportMatches.length} Matches
              </span>
            </div>

            {/* MATCHES LIST */}
            <div className="divide-y divide-[#282828]">
              {sportMatches.map((match) => {
                const homeName = typeof match.homeTeam === 'object' ? match.homeTeam.name : String(match.homeTeam);
                const awayName = typeof match.awayTeam === 'object' ? match.awayTeam.name : String(match.awayTeam);

                const mainMarket = match.markets?.[0] || {
                  id: `MKT_${match.id}`,
                  name: 'Match Odds',
                  selections: [
                    { id: '1', name: homeName, price: 1.95 },
                    { id: '2', name: awayName, price: 2.05 }
                  ]
                };

                const s1 = mainMarket.selections[0];
                const s2 = mainMarket.selections[1];

                const s1Back = s1?.price || 1.95;
                const s1Lay = Math.round((s1Back + 0.03) * 100) / 100;
                const s2Back = s2?.price || 2.05;
                const s2Lay = Math.round((s2Back + 0.04) * 100) / 100;

                return (
                  <div
                    key={match.id}
                    className="p-2.5 sm:p-3 hover:bg-[#232323] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* LEFT INFO COLUMN */}
                    <div
                      onClick={() => onSelectMatch(match.id)}
                      className="flex-1 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        {match.inPlay && (
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#FF4148]/20 text-[#FF4148] text-[9px] font-black uppercase border border-[#FF4148]/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4148]" />
                            <span>LIVE</span>
                          </span>
                        )}
                        <h4 className="font-black text-xs sm:text-[13px] text-white group-hover:text-[#f36c21] transition-colors">
                          {homeName} vs {awayName}
                        </h4>
                        <img
                          src="/assets/hotspot-CjAKvLKa.webp"
                          alt="Hotspot"
                          className="w-3.5 h-3.5 object-contain"
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Tournament & Time */}
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-[#8e8e8e]">
                        <span>{match.league || 'International League'}</span>
                        <span>•</span>
                        <span>{match.inPlay ? `${match.clock || 'In-Play'}` : `${match.matchDate || 'Today'} ${match.startTime || '9:00 PM'}`}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1 text-[10px] text-[#adadad]">
                          <span>Min: 100</span>
                          <img
                            src="/assets/min-max-icon-BIsl0oNE.svg"
                            alt="Limits"
                            className="w-2.5 h-2.5"
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                          <span>Max: 100,000</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT 6-ODDS COLUMN MATRIX */}
                    <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                      {/* Selection 1 Odds (e.g. Team 1) */}
                      {s1 && (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#adadad] mb-0.5 truncate max-w-[80px]">
                            {s1.name}
                          </span>
                          <div className="flex items-center space-x-0.5">
                            {/* Back 1 */}
                            <button
                              onClick={() =>
                                onSelectOdds(
                                  match.id,
                                  mainMarket.id,
                                  mainMarket.name,
                                  s1.id,
                                  s1.name,
                                  s1Back,
                                  'BACK'
                                )
                              }
                              className={`w-11 sm:w-12 h-9 rounded flex flex-col items-center justify-center transition-transform active:scale-95 odds-box-back-1 ${
                                selectedSelectionId === s1.id && selectedOddsType === 'BACK'
                                  ? 'ring-2 ring-blue-500 font-black'
                                  : ''
                              }`}
                            >
                              <span className="font-mono font-black text-xs leading-none text-black">
                                {s1Back.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-[#333] font-mono leading-none mt-0.5">
                                45k
                              </span>
                            </button>

                            {/* Lay 1 */}
                            <button
                              onClick={() =>
                                onSelectOdds(
                                  match.id,
                                  mainMarket.id,
                                  mainMarket.name,
                                  s1.id,
                                  s1.name,
                                  s1Lay,
                                  'LAY'
                                )
                              }
                              className={`w-11 sm:w-12 h-9 rounded flex flex-col items-center justify-center transition-transform active:scale-95 odds-box-lay-1 ${
                                selectedSelectionId === s1.id && selectedOddsType === 'LAY'
                                  ? 'ring-2 ring-pink-500 font-black'
                                  : ''
                              }`}
                            >
                              <span className="font-mono font-black text-xs leading-none text-black">
                                {s1Lay.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-[#333] font-mono leading-none mt-0.5">
                                32k
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Selection 2 Odds (e.g. Team 2) */}
                      {s2 && (
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#adadad] mb-0.5 truncate max-w-[80px]">
                            {s2.name}
                          </span>
                          <div className="flex items-center space-x-0.5">
                            {/* Back 1 */}
                            <button
                              onClick={() =>
                                onSelectOdds(
                                  match.id,
                                  mainMarket.id,
                                  mainMarket.name,
                                  s2.id,
                                  s2.name,
                                  s2Back,
                                  'BACK'
                                )
                              }
                              className={`w-11 sm:w-12 h-9 rounded flex flex-col items-center justify-center transition-transform active:scale-95 odds-box-back-1 ${
                                selectedSelectionId === s2.id && selectedOddsType === 'BACK'
                                  ? 'ring-2 ring-blue-500 font-black'
                                  : ''
                              }`}
                            >
                              <span className="font-mono font-black text-xs leading-none text-black">
                                {s2Back.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-[#333] font-mono leading-none mt-0.5">
                                60k
                              </span>
                            </button>

                            {/* Lay 1 */}
                            <button
                              onClick={() =>
                                onSelectOdds(
                                  match.id,
                                  mainMarket.id,
                                  mainMarket.name,
                                  s2.id,
                                  s2.name,
                                  s2Lay,
                                  'LAY'
                                )
                              }
                              className={`w-11 sm:w-12 h-9 rounded flex flex-col items-center justify-center transition-transform active:scale-95 odds-box-lay-1 ${
                                selectedSelectionId === s2.id && selectedOddsType === 'LAY'
                                  ? 'ring-2 ring-pink-500 font-black'
                                  : ''
                              }`}
                            >
                              <span className="font-mono font-black text-xs leading-none text-black">
                                {s2Lay.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-[#333] font-mono leading-none mt-0.5">
                                48k
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
