# 🌐 Session Context & Deployment Status

**Last Updated:** 2026-08-14T16:02:49+05:30  
**Project:** Enterprise Multi-Tier Sports Betting Exchange & Sportsbook Platform  
**Repository:** [Warriorlegacy/Sports_Betting_Specifications](https://github.com/Warriorlegacy/Sports_Betting_Specifications) (Branch: `main`)

---

## 🚀 Live Production Deployments

| Component | Platform | Live URL / Endpoint | Dashboard / Management |
| :--- | :--- | :--- | :--- |
| **Backend API & WebSockets** | Render (Node.js) | `https://sports-exchange-backend-j1aj.onrender.com` | [Render Dashboard](https://dashboard.render.com/web/srv-d9v95km417fc73cedmdg) |
| **Player Portal (Sportsbook)** | Vercel (React Vite) | `https://player-portal-kappa.vercel.app` | [Vercel Project](https://vercel.com/piyushs-projects-1495f171/player-portal) |
| **Agent & Admin Portal** | Vercel (React Vite) | `https://agent-portal-one-omega.vercel.app` | [Vercel Project](https://vercel.com/piyushs-projects-1495f171/agent-portal) |
| **Relational Database** | Neon.tech (PostgreSQL 16) | `ep-rapid-frost-axygvdc9-pooler.c-4.us-east-2.aws.neon.tech` | [Neon Console](https://console.neon.tech) |
| **In-Memory Cache / PubSub** | Upstash (Redis 7) | `mint-dinosaur-126655.upstash.io:6379` | [Upstash Console](https://console.upstash.com) |

---

## 🔐 Credentials & Environment Variables

### Neon PostgreSQL 16
```env
DATABASE_URL=postgresql://neondb_owner:npg_8iWGCAF4cKDV@ep-rapid-frost-axygvdc9-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Upstash Redis 7
```env
REDIS_URL=rediss://default:gQAAAAAAAe6_AAIgcDE1YmZhNGExMmZiMGU0NjZmODJmMGRhOWQ2MTU3NDNiNg@mint-dinosaur-126655.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://mint-dinosaur-126655.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAe6_AAIgcDE1YmZhNGExMmZiMGU0NjZmODJmMGRhOWQ2MTU3NDNiNg
```

### Render Management
```env
RENDER_SERVICE_ID=srv-d9v95km417fc73cedmdg
RENDER_API_KEY=rnd_09x1C0VulSvph8tXNHdZY2g87KJN
```

---

## 🏟️ Real Live Data Architecture (ESPN Free API — No Key Required)

### Current Status: ✅ LIVE (53 real matches serving as of 2026-08-14T10:42Z)

The backend fetches real match data from ESPN's public scoreboard APIs every **45 seconds** across **15 sport endpoints**.

| Sport | League | ESPN Endpoint |
| :--- | :--- | :--- |
| ⚽ Football | Premier League | `soccer/eng.1/scoreboard` |
| ⚽ Football | La Liga | `soccer/esp.1/scoreboard` |
| ⚽ Football | Serie A | `soccer/ita.1/scoreboard` |
| ⚽ Football | Bundesliga | `soccer/ger.1/scoreboard` |
| ⚽ Football | Ligue 1 | `soccer/fra.1/scoreboard` |
| ⚽ Football | UEFA Champions League | `soccer/uefa.champions/scoreboard` |
| ⚽ Football | MLS | `soccer/usa.1/scoreboard` |
| 🏀 Basketball | NBA | `basketball/nba/scoreboard` |
| 🏀 Basketball | WNBA | `basketball/wnba/scoreboard` |
| 🏀 Basketball | NCAA Basketball | `basketball/mens-college-basketball/scoreboard` |
| ⚾ Baseball | MLB | `baseball/mlb/scoreboard` |
| 🏈 American Football | NFL | `football/nfl/scoreboard` |
| 🏒 Ice Hockey | NHL | `hockey/nhl/scoreboard` |
| 🎾 Tennis | ATP World Tour | `tennis/atp/scoreboard` |
| 🎾 Tennis | WTA Tour | `tennis/wta/scoreboard` |

### Data Flow
```
ESPN Scoreboard API (every 45s)
     ↓
RealSportsFeedService.ts (backend)
     ↓ upserts to PostgreSQL markets table
     ↓ seeds matching engine odds
     ↓ broadcasts via Socket.io WebSocket
     ↓
GET /api/markets/live/telemetry → { telemetry: [...], liveMatches: [...], count: N }
     ↓
Player Portal App.tsx (fetches on load + every 30s polling)
     ↓
SportsbookHome.tsx (date-filtered match list)
```

### API Response Format
```json
{
  "telemetry": [ ...LiveMatchTelemetry[] ],
  "liveMatches": [ ...LiveMatchTelemetry[] ],
  "count": 57,
  "timestamp": 1723625000000
}
```

---

## 🎯 Live In-Play Simulated Matches (Internal Engine Only)

These 4 premium simulated in-play matches run **internally** for liquidity and matching engine purposes only. They are **NOT** exposed through the public telemetry API anymore.

| Market ID | Event | Sport | Status |
| :--- | :--- | :--- | :--- |
| `MKT_IND_AUS_T20` | India vs Australia - 2nd T20 International | Cricket | IN_PLAY (internal) |
| `MKT_ARS_CHE_PL` | Arsenal vs Chelsea - Premier League Derby | Football | IN_PLAY (internal) |
| `MKT_ALC_SIN_WIM` | Carlos Alcaraz vs Jannik Sinner - Wimbledon Final | Tennis | IN_PLAY (internal) |
| `MKT_LAL_BOS_NBA` | Los Angeles Lakers vs Boston Celtics - NBA Showcase | Basketball | IN_PLAY (internal) |

These have **full ball-by-ball / point-by-point adapters** with real-time odds shifts. They feed the matching engine order book but are no longer returned by `GET /api/markets/live/telemetry`.

**Change made:** `LiveFeedManager.getAllLiveMatches()` and `getMatchTelemetry()` no longer fall back to simulator data when real feeds return zero matches. Frontend now shows an accurate empty state instead of mock fixtures.

---

## 🔌 Phase 4: Third-Party API Provider Integration (COMPLETE ✅)

### 4-Tier Failover Chain

```
Tier 1: The-Odds-API  ──► Real odds + scores (40+ sports, circuit breaker)
  ↓ fails (3 consecutive errors → circuit open, re-probe in 5 min)
Tier 2: Sportmonks   ──► Football specialist (700+ leagues, live stats)
  ↓ fails
Tier 3: CricAPI      ──► Cricket specialist (ball-by-ball, scorecards)
  ↓ fails
Tier 4: ESPN Free API ──► Always available (15 endpoints, no key)
  ↓ always running in parallel
Tier 5: Simulator    ──► 4 premium in-play matches (offline fallback)
```

**Merging Strategy:** All tiers run in parallel. Lower tier number = higher priority. When the same match exists in multiple tiers (by marketId), the highest-priority provider's data wins.

### Provider Files

| File | Provider | Key Env Var |
| :--- | :--- | :--- |
| `providers/TheOddsApiProvider.ts` | The-Odds-API (Tier 1) | `ODDS_API_KEY` |
| `providers/SportmonksProvider.ts` | Sportmonks (Tier 2) | `SPORTMONKS_API_KEY` |
| `providers/CricApiProvider.ts` | CricAPI (Tier 3) | `CRICAPI_KEY` |
| `providers/IExternalProvider.ts` | Interface contract | — |
| `FailoverFeedOrchestrator.ts` | Orchestrator + circuit breaker | — |

### Circuit Breaker Behavior
- **3 consecutive failures** → circuit opens, provider skipped
- **After 5 minutes** → auto re-probe (circuit half-open)
- **On success** → circuit fully closed, failure count reset
- **Stale cache** → returned during circuit-open period (no data loss)

### Admin API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/markets/providers/status` | Health dashboard for all 5 tiers |
| `POST` | `/api/markets/providers/sync` | Force sync all providers now |
| `POST` | `/api/markets/providers/test` | Test specific provider (body: `{provider: "odds"}`) |
| `POST` | `/api/markets/telemetry/ingest` | Webhook push ingestion from any provider |

### Webhook Ingest Format
```bash
POST /api/markets/telemetry/ingest
X-Webhook-Secret: <WEBHOOK_SECRET env var>
Content-Type: application/json

{
  "marketId": "MKT_CUSTOM_001",
  "eventName": "India vs England - 1st ODI",
  "sport": "CRICKET",
  "homeTeam": "India",
  "awayTeam": "England",
  "inPlay": true,
  "status": "IN_PLAY",
  "summaryScore": "India 245/6 (42.3 ov)"
}
```

### To Enable Premium Providers
Add to Render environment variables:
```env
ODDS_API_KEY=<from https://the-odds-api.com>
SPORTMONKS_API_KEY=<from https://sportmonks.com>
CRICAPI_KEY=<from https://cricapi.com>
```
When keys are absent, those tiers are gracefully skipped — ESPN + Simulator always run.


### How It Works
1. **Activity Tracking:**
   - Express middleware tracks the timestamp of all incoming HTTP requests (`/api/bets`, `/api/markets`, `/api/auth`, `/api/ledger`, etc.).
   - Socket.io gateway tracks all active connected WebSocket connections and room subscriptions.
2. **Inactivity Cron Loop:**
   - Runs background evaluation every 15 seconds inside the backend process.
   - When `connectedSockets === 0` and `idleDuration >= 60,000 ms (1 minute)`:
     - Automatically pauses background odds feed simulator & CPU timers.
     - Calls Render REST API: `POST https://api.render.com/v1/services/srv-d9v95km417fc73cedmdg/suspend` with `Authorization: Bearer rnd_09x1C0VulSvph8tXNHdZY2g87KJN`.
     - Logs suspension transition.
3. **Resume / Wake Up:**
   - Any HTTP request, API call, or wake endpoint (`POST /api/inactivity/wake`) automatically resets the activity timer and restarts liquidity simulators.
   - If suspended on Render, calling `POST https://api.render.com/v1/services/srv-d9v95km417fc73cedmdg/resume` wakes the service.
4. **Standalone Cron Script (optional):**
   - Path: `scripts/render_inactivity_cron.js`
   - Run command: `node scripts/render_inactivity_cron.js`
   - Can be scheduled via Render Cron Jobs or external cron for redundancy.
5. **Current Status:** ✅ Configured and running. Health check shows `renderAutoSleepConfigured: true`.
6. **Auto-Sleep Behavior:** After 60 seconds of zero activity and no connected WebSocket clients, the backend calls Render's suspend API. Any incoming HTTP request automatically resumes the service.

---

## 🔧 Recent Changes (2026-08-14)

### Mock Data Removed from Public API
- **Issue:** The application was displaying hardcoded mock matches (India vs Australia T20, Arsenal vs Chelsea, etc.) when real ESPN feeds returned zero matches.
- **Fix:** `LiveFeedManager.getAllLiveMatches()` and `getMatchTelemetry()` no longer fall back to simulator data. The public telemetry API now returns only real matches or an empty array.
- **Impact:** Frontend correctly shows "No Matches Found" when no real data is available, instead of fabricated fixtures.

### Production Deployment
- Backend deployed to Render: `https://sports-exchange-backend-j1aj.onrender.com`
- Deploy ID: `dep-d9vf1rdbedkc73bknsb0` (status: live)
- Service ID: `srv-d9v95km417fc73cedmdg`
- render.yaml blueprint configured with all required env vars

---

## 🧪 Pre-Seeded Quick Login Accounts

All accounts share the default password: **`password123`**

| Role / Tier | Username | Default Credit | Description |
| :--- | :--- | :--- | :--- |
| **L0 Global Admin** | `admin` | 10,000,000 PTS | System Owner with full governance, risk controls & audit logs |
| **L1 Super Master** | `supermaster_asia` | 500,000 PTS | Regional Operator for Asia downline |
| **L2 Master** | `master_mumbai` | 100,000 PTS | City Agency Manager |
| **L3 Agent** | `agent_vikram` | 25,000 PTS | Direct Retail Betting Agent |
| **L4 Trader / Player** | `player_rahul` | 10,000 PTS | Pre-funded user for in-play betting & parlay building |
| **L4 Trader / Player** | `player_amit` | 10,000 PTS | Pre-funded user for multi-market trading |

---

## 🏏 Multi-Sport Live In-Play Ingestion & Telemetry Architecture

### Supported Sports Adapters
1. **Cricket (`CricketFeedAdapter`):**
   - Ball-by-ball simulation, current over & ball tracking.
   - Batsman scores, balls faced, strike rate, bowler figures (overs, runs, wickets, economy).
   - In-play run rate (CRR) & Required Run Rate (RRR) calculation.
   - Automatic market suspension triggers on wickets, reviews, and innings break.
2. **Tennis (`TennisFeedAdapter`):**
   - Point-by-point tracking (0, 15, 30, 40, Adv, Game).
   - Serving player indicator, aces, double faults, break point alerts.
   - Sets history, tie-break scoring, and match momentum estimation.
3. **Basketball (`BasketballFeedAdapter`):**
   - 4-quarter + Overtime clock management with 24-second shot clock countdown.
   - Points in paint, 3-pointers made/attempted, team fouls, and free throws.
   - Live spread and totals recalculation.
4. **Football (`FootballFeedAdapter`):**
   - Live minute tracking (1H, HT, 2H, ET), goals, corner counts, yellow/red cards.
   - Dangerous attacks, possession % shifts, and VAR check market freeze.

### Real-Time Telemetry Endpoints
- **Live Match Telemetry Stream:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets/live/telemetry`
- **Single Market Telemetry:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets/telemetry/:marketId`
- **Force Real-Feed Sync:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/markets/real-feed/sync`
- **Real-Feed Status:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets/real-feed/status`
- **External Webhook Ingestion:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/markets/telemetry/ingest`
- **Socket.io Event Subscriptions:**
  - `subscribe:telemetry` -> Emits `match:telemetry` and `match:global_telemetry` (<50ms updates)
  - `subscribe:market` -> Emits `ladder:update` and `market:status`

---

## 📅 Global Fixtures Calendar & Date-Filtered Navigation

### Features
1. **Interactive Date Bar:**
   - Real-time tab indicators: `LIVE NOW`, `ALL DATES`, `Today`, `Tomorrow`, and upcoming daily pills.
   - Dynamic match count badges per date tab.
2. **Status Segmented Filters:**
   - `All`, `Live Now (In-Play)`, `Upcoming`, and `Settled / Results`.
3. **Instant Search & League Grouping:**
   - Multi-field search (team, league, country, or tournament name).
   - Accordion grouping by Championship with flag and country badges.
4. **Worldwide Sport Coverage:**
   - 🏏 Cricket (ICC, The Hundred, CPL, Bilateral tours)
   - ⚽ Football (Premier League, La Liga, Champions League, Bundesliga, Ligue 1, MLS)
   - 🎾 Tennis (ATP Masters 1000, WTA 1000, Grand Slams)
   - 🏀 Basketball (NBA, WNBA, NCAA)
   - ⚾ Baseball (MLB)
   - 🏈 American Football (NFL)
   - 🏒 Ice Hockey (NHL)
   - 🎮 Esports (League of Legends LCK, CS2 Major)

---

## 💸 Live Betting System (Bet Placement Flow)

### API Endpoint
`POST /api/bets` (requires JWT auth token)

### Request Body
```json
{
  "marketId": "MKT_REAL_FOOTBALL_401580969",
  "selectionId": 1,
  "type": "BACK",
  "price": 1.95,
  "stake": 100
}
```

### Response
```json
{
  "message": "Bet placed successfully",
  "bet": { "id": "...", "status": "UNMATCHED" },
  "availableCredit": 9900,
  "exposure": 1600,
  "trades": []
}
```

### Live Betting Flow (Frontend)
1. User sees real match from ESPN feed on `SportsbookHome.tsx`
2. Clicks match → opens `MatchDetailHub.tsx` with in-play scoreboard
3. Clicks BACK/LAY on a selection → adds to `EnhancedBetSlip.tsx`
4. Enters stake → clicks "Place Bet"
5. `api.bets.placeBet()` POSTs to backend
6. Backend atomically locks exposure in PostgreSQL, submits to matching engine
7. Socket.io broadcasts balance update & order book update
8. Bet appears in "My Bets" tab with real-time status

---

## 🛠️ Verification & Health Check Endpoints

- **Backend Health Check:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/health`
- **Live Matches Telemetry:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets/live/telemetry`
- **Force ESPN Sync:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/markets/real-feed/sync`
- **Inactivity Sleep Status:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/inactivity/status`
- **Wake Server Endpoint:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/inactivity/wake`
- **Live Markets List:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets`

---

## 📦 Key Backend Services (services/backend/src/)

| File/Module | Purpose |
| :--- | :--- |
| `index.ts` | Express app boot, starts LiveFeedManager + OddsFeedSimulator |
| `sportsFeeds/RealSportsFeedService.ts` | Polls 15 ESPN endpoints every 45s, upserts to PostgreSQL |
| `sportsFeeds/LiveFeedManager.ts` | Manages all feeds (real + simulated), provides getAllLiveMatches() |
| `sportsFeeds/adapters/CricketFeedAdapter.ts` | Ball-by-ball cricket telemetry simulation |
| `sportsFeeds/adapters/TennisFeedAdapter.ts` | Point-by-point tennis telemetry simulation |
| `sportsFeeds/adapters/BasketballFeedAdapter.ts` | Quarter/clock basketball telemetry |
| `sportsFeeds/adapters/FootballFeedAdapter.ts` | Minute/event football telemetry |
| `modules/markets/marketRoutes.ts` | Market CRUD + telemetry API routes |
| `modules/bets/betRoutes.ts` | Atomic bet placement, cancel, exposure |
| `realtime/socketGateway.ts` | Socket.io WebSocket event broadcasting |
| `realtime/matchingEngineService.ts` | P2P order book matching engine |
| `db/ledger.ts` | Atomic double-entry PostgreSQL ledger |

## 📦 Key Frontend Services (services/player-portal/src/)

| File | Purpose |
| :--- | :--- |
| `App.tsx` | Root state, live polling every 30s, Socket.io real-time, bet slip |
| `services/api.ts` | All backend HTTP calls |
| `services/mockSportsbookData.ts` | Fallback mock data (used when backend offline) |
| `services/sportsbookEngine.ts` | 2.2s client-side simulation tick |
| `components/SportsbookHome.tsx` | Date-filtered match list with league accordions |
| `components/SportsbookHeader.tsx` | Sport category filter tabs |
| `components/MatchDetailHub.tsx` | Full match detail with scoreboard & visualizer |
| `components/EnhancedBetSlip.tsx` | Bet slip with stake entry, BACK/LAY |
| `components/MarketLadder.tsx` | P2P exchange ladder view |
