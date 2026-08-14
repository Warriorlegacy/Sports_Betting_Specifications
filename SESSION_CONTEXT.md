# 🌐 Session Context & Deployment Status

**Last Updated:** 2026-08-14  
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

## 🌙 1-Minute Inactivity Sleep & Auto-Suspend Specification

### How It Works
1. **Activity Tracking:**
   - Express middleware tracks the timestamp of all incoming HTTP requests (`/api/bets`, `/api/markets`, `/api/auth`, `/api/ledger`, etc.).
   - Socket.io gateway tracks all active connected WebSocket connections and room subscriptions.
2. **Inactivity Cron Loop:**
   - Runs background evaluation every 15 seconds.
   - When `connectedSockets === 0` and `idleDuration >= 60,000 ms (1 minute)`:
     - Automatically pauses background odds feed simulator & CPU timers.
     - Calls Render REST API: `POST https://api.render.com/v1/services/srv-d9v95km417fc73cedmdg/suspend` with `Authorization: Bearer rnd_09x1C0VulSvph8tXNHdZY2g87KJN`.
     - Logs suspension transition.
3. **Resume / Wake Up:**
   - Any HTTP request, API call, or wake endpoint (`POST /api/inactivity/wake`) automatically resets the activity timer and restarts liquidity simulators.
   - If suspended on Render, calling `POST https://api.render.com/v1/services/srv-d9v95km417fc73cedmdg/resume` wakes the service.
4. **Standalone Cron Script:**
   - Path: `scripts/render_inactivity_cron.js`
   - Run command: `node scripts/render_inactivity_cron.js`

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
- **External Webhook Ingestion:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/markets/telemetry/ingest`
- **Socket.io Event Subscriptions:**
  - `subscribe:telemetry` -> Emits `match:telemetry` and `match:global_telemetry` (<50ms updates)
  - `subscribe:market` -> Emits `ladder:update` and `market:status`

---

## 🛠️ Verification & Health Check Endpoints

- **Backend Health Check:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/health`
- **Live Matches Telemetry:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets/live/telemetry`
- **Inactivity Sleep Status:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/inactivity/status`
- **Wake Server Endpoint:** `POST https://sports-exchange-backend-j1aj.onrender.com/api/inactivity/wake`
- **Live Markets List:** `GET https://sports-exchange-backend-j1aj.onrender.com/api/markets`

