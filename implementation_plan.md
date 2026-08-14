# Live Multi-Sport Data Ingestion & In-Play Betting Implementation Plan

Comprehensive plan to integrate real-time server-side match telemetry for **Cricket, Tennis, Basketball, Football, and other sports**, stream live scores and odds shifts via WebSockets, and enable full in-play betting on the Player and Agent portals.

---

## 🏗️ 1. Architecture Overview

```
[ Live Sports Data Providers ]
  ├── The-Odds-API / Sportmonks / CricAPI / RapidAPI / Sportradar
  └── Live Feeder & In-Play Simulator Engine (High-Frequency Mock / Testing)
                    │
                    ▼  (REST Polling / Webhook / WebSockets)
[ Ingestion & Normalization Layer ] (`services/backend/src/sportsFeeds/`)
  ├── LiveFeedManager (Orchestrator)
  ├── CricketFeedAdapter (Overs, Wickets, CRR/RRR, Batsman/Bowler)
  ├── TennisFeedAdapter (Sets, Games, Points 15/30/40/Adv, Serving Indicator)
  ├── BasketballFeedAdapter (Quarters Q1-Q4, Game Clock, Shot Clock, Fouls)
  └── FootballFeedAdapter (Match Minute, Halves, Goals, Cards, VAR)
                    │
                    ├───> [ Postgres 16 (Neon) ] (Event state, market status, bets, ledger)
                    ├───> [ Redis 7 (Upstash) ] (Pub/Sub: `sports:live:telemetry`, ladders)
                    │
                    ▼  (<50ms WebSocket Broadcast)
[ Real-Time Socket.io Gateway ] (`services/backend/src/realtime/socketGateway.ts`)
  ├── `match:telemetry` (Live scores, point-by-point, commentary)
  ├── `ladder:update` (Dynamic Back & Lay depth shifts)
  └── `market:status` (Auto-suspension on Wickets, VAR, Penalties, Break Points)
                    │
                    ▼
[ Player Portal Match Center (React + Vite) ] (`services/player-portal/`)
  ├── Live Sports Navigation (🏏 Cricket, 🎾 Tennis, 🏀 Basketball, ⚽ Football)
  ├── 2D In-Play Interactive Visualizer & Momentum Radar
  ├── Live Dual-Depth Exchange Ladder (Back Blue / Lay Pink with Flash animations)
  ├── In-Play 1-Click Bet Slip with 3s Anti-Courtsiding Countdown
  └── Real-Time Early Cash-Out Slider
```

---

## 📋 2. Proposed Changes & Code Structure

### Component 1: Multi-Sport Normalization & Ingestion Layer (`services/backend/src/sportsFeeds/`)

#### [NEW] `services/backend/src/sportsFeeds/types.ts`
- Standardized normalized data contracts for:
  - `SportType`: `'CRICKET' | 'TENNIS' | 'BASKETBALL' | 'FOOTBALL' | 'HORSE_RACING'`
  - `LiveMatchTelemetry`: Unified score payload, match status (`PRE_MATCH | IN_PLAY | PAUSED | COMPLETED | SUSPENDED`), event timeline.
  - `CricketScoreDetails`: `runs`, `wickets`, `overs`, `target`, `crr`, `rrr`, `activeBatsmen`, `activeBowler`, `lastBall`.
  - `TennisScoreDetails`: `sets`, `currentGameScore`, `servingPlayerId`, `breakPointAlert`, `aces`, `faults`.
  - `BasketballScoreDetails`: `period` (Q1-Q4, OT), `clock`, `shotClock`, `homeScore`, `awayScore`, `teamFouls`.
  - `FootballScoreDetails`: `minute`, `period` (1H, HT, 2H), `homeGoals`, `awayGoals`, `yellowCards`, `redCards`, `corners`.

#### [NEW] `services/backend/src/sportsFeeds/interfaces/IFeedAdapter.ts`
- Generic interface `IFeedAdapter`:
  - `fetchLiveTelemetry(eventId: string): Promise<LiveMatchTelemetry>`
  - `subscribeLiveUpdates(eventId: string, onUpdate: (data: LiveMatchTelemetry) => void): void`
  - `calculateDynamicOddsShift(telemetry: LiveMatchTelemetry): Record<number, number>` (Dynamic price adjuster)

#### [NEW] `services/backend/src/sportsFeeds/adapters/CricketFeedAdapter.ts`
- Ingests and formats live ball-by-ball cricket data, computes Win Probability Index based on DLS/CRR, and shifts Match Odds + Over/Under line odds.

#### [NEW] `services/backend/src/sportsFeeds/adapters/TennisFeedAdapter.ts`
- Handles point-by-point tennis scoring (0 -> 15 -> 30 -> 40 -> Deuce -> Adv -> Game), detects Break Point opportunities to trigger market micro-suspensions.

#### [NEW] `services/backend/src/sportsFeeds/adapters/BasketballFeedAdapter.ts`
- Parses live NBA/FIBA feeds, tracks possession and momentum swings, updates Spread and Moneyline prices.

#### [NEW] `services/backend/src/sportsFeeds/adapters/FootballFeedAdapter.ts`
- Tracks soccer match clock, cards, corners, and triggers auto-locks on Goals, Penalties, and Red Cards.

#### [NEW] `services/backend/src/sportsFeeds/LiveFeedManager.ts`
- Central feed orchestrator that runs high-frequency telemetry cycles (every 1.5s in-play), broadcasts telemetry updates via `socketGateway`, and synchronizes market statuses.

---

### Component 2: Anti-Courtsiding In-Play Betting Guard (`services/backend/src/modules/bets/`)

#### [MODIFY] `services/backend/src/modules/bets/betRoutes.ts`
- Add **In-Play Bet Delay Protection**:
  - Unmatched in-play exchange orders are placed in a 3–5 second pending buffer.
  - If a major market event (e.g. Wicket, Goal, Red Card) occurs during the buffer window, the bet is automatically cancelled without liability exposure.
  - Prevents latency exploitation and courtsiding.

---

### Component 3: Live Match Center & In-Play UI (`services/player-portal/`)

#### [NEW] `services/player-portal/src/components/LiveMatchCenter.tsx`
- Comprehensive multi-sport in-play dashboard:
  - Sport-specific live match banner with animated state indicators (Cricket scorecard, Tennis point grid, Basketball quarter ticker).
  - Ball-by-ball / point-by-point commentary stream.
  - In-play odds ladder with live tick animations.
  - Instant 1-Click Bet Slip with in-play countdown animation.

#### [MODIFY] `services/player-portal/src/components/SportsbookHome.tsx`
- Add multi-sport category filters (Cricket 🏏, Tennis 🎾, Basketball 🏀, Football ⚽).
- Display in-play match badges with real-time score updates.

---

## 🗺️ 3. Complete Development Roadmap (Phases 1 to 5)

| Phase | Milestone | Deliverables | Timeline |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Ingestion Engine & Multi-Sport Adapters** | Normalized models, Cricket, Tennis, Basketball, Football feed adapters, dynamic odds adjuster | Day 1–2 |
| **Phase 2** | **In-Play Engine & Anti-Courtsiding** | 3s in-play bet buffer, automatic market suspension triggers, WebSocket broadcast integration | Day 3 |
| **Phase 3** | **Player Portal Live Match Center** | 2D match visualizer, point-by-point scoreboard, animated exchange ladders, SGP builder | Day 4–5 |
| **Phase 4** | **Third-Party API Provider Integration** | The-Odds-API / Sportmonks / CricAPI webhooks, API key config, failover feeder logic | Day 6 |
| **Phase 5** | **Automated Oracle Settlement & Audit** | Auto-settlement on match completion, double-entry ledger payout distribution, commission rake | Day 7 |

---

## 🧪 4. Verification & Testing Plan

### Automated Unit & Integration Tests
- Ingestion schema validation for each sport adapter.
- Dynamic odds adjustment unit tests based on match events (e.g., wicket fall -> odds lengthen).
- In-play bet delay test (confirm order cancels if market suspends during 3s window).

### Manual Verification
- Launch backend with live multi-sport ingestion running.
- Connect Player Portal and verify real-time score ticks and odds shifts for Cricket, Tennis, Basketball, and Football without refreshing.
- Place in-play bets and verify anti-courtsiding countdown and execution.
