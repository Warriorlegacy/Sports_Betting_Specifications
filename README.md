# 🏆 Enterprise Multi-Tier Sports Betting Exchange Platform

An enterprise-grade, high-concurrency Peer-to-Peer (P2P) sports betting exchange built with a **5-Tier Hierarchical Credit Ledger**, **PostgreSQL SERIALIZABLE Atomic Exposure Locks**, **Sub-50ms Socket.io Real-Time Ladder Order Book**, and an in-memory **FIFO Back/Lay Matching Engine**.

---

## 🌟 System Architecture Highlights

1. **5-Level Credit Hierarchy**:
   - **Level 0 (Global Admin)**: Platform oversight, initial operational credit minting, market creation & settlement.
   - **Level 1 (Super Master)**: Regional branch operations & credit distribution down to Level 2 Masters.
   - **Level 2 (Master)**: Local agency management & credit allocation down to Level 3 Agents.
   - **Level 3 (Agent)**: Retail cashier desk, player onboarding, and player wallet credit management.
   - **Level 4 (Player / Trader)**: P2P Back & Lay ladder trading, position management, and live cash out.

2. **Non-Cyclic Double-Entry Ledger**:
   - No external fiat gateways. All transactions flow through an internal double-entry ledger with recursive CTE subtree isolation (`WITH RECURSIVE downline AS ...`).

3. **Atomic Exposure & Liability Locks**:
   - Back bets lock `Liability = Stake`.
   - Lay bets lock `Liability = Stake * (Price - 1)`.
   - Multi-runner positions calculate the true worst-case net outcome before debiting `available_credit` under PostgreSQL `SELECT ... FOR UPDATE` row locks.

4. **Real-Time Order Book & Engine**:
   - Betfair-standard 3-tier Back (Blue) and Lay (Pink) depth ladder.
   - Sub-50ms state updates powered by Socket.io and Redis.
   - In-memory price-time priority FIFO order matching engine with price-improvement execution.
   - Emergency kill-switch for instant market freeze during critical in-play match events.

---

## 📂 Project Repository Structure

```
d:/Sports_Betting_Specifications/
├── sports_exchange_specification.md  # Core product & technical specification
├── docker-compose.yml                # Multi-service production orchestration
├── services/
│   ├── backend/                      # Node.js + Express + TypeScript API & WebSocket Server
│   │   ├── src/
│   │   │   ├── config/               # Application configuration
│   │   │   ├── db/                   # PostgreSQL pool, schema.sql, seed.sql, atomic ledger
│   │   │   ├── middleware/           # JWT & Subtree Recursive CTE RBAC
│   │   │   ├── modules/              # Auth, Hierarchy, Ledger, Markets, Bets, Reports
│   │   │   ├── realtime/             # Socket.io gateway & Matching Engine bridge
│   │   │   ├── simulator/            # Mock Betfair Odds Streamer & Liquidity Provider
│   │   │   └── index.ts              # Server bootstrapper
│   │   └── tests/                    # Jest concurrency and exposure test suite
│   │
│   ├── matching-engine/              # High-frequency FIFO Order Matching Service
│   │   ├── src/
│   │   │   ├── orderbook.ts          # Back & Lay bids/asks priority queues
│   │   │   └── engine.ts             # Matching coordinator
│   │   └── tests/                    # Matching and price-improvement tests
│   │
│   ├── agent-portal/                 # React + Vite + Tailwind CSS Agent & Admin Dashboard
│   │   ├── src/
│   │   │   ├── components/           # Tree explorer, Credit modal, Market controls, Ledger
│   │   │   └── App.tsx               # Dashboard root with quick-switch role login
│   │
│   └── player-portal/                # React + Vite PWA Betfair-Style Trading Terminal
│       ├── src/
│       │   ├── components/           # 3-tier Ladder Order Book, Bet Slip, Position Matrix, My Bets
│       │   └── App.tsx               # Trading terminal root
```

---

## 🔑 Seed Accounts & Credentials

All seeded accounts use password: `password123`

| Role | Username | Initial Credit | Administrative Scope |
| --- | --- | --- | --- |
| **Level 0: Global Admin** | `admin` | 10,000,000 | Platform root, odds stream controls, event settlement |
| **Level 1: Super Master** | `supermaster_asia` | 500,000 | Asia Regional Branch |
| **Level 2: Master** | `master_mumbai` | 100,000 | Mumbai Agency Group |
| **Level 3: Agent** | `agent_vikram` | 25,000 | Retail Agency Desk |
| **Level 4: Player** | `player_rahul` | 10,000 | Retail Trader |
| **Level 4: Player** | `player_amit` | 10,000 | Retail Trader |

---

## 🚀 Quick Start with Docker Compose

To spin up the complete platform (PostgreSQL 16, Redis 7, Backend API, Matching Engine, Agent Portal, Player Portal):

```bash
docker-compose up --build -d
```

### Access Ports:
- **Agent & Admin Portal**: `http://localhost:3000`
- **Player Trading Terminal**: `http://localhost:3001`
- **Backend API & WebSockets**: `http://localhost:5000`
- **PostgreSQL 16**: `localhost:5432`
- **Redis 7**: `localhost:6379`

---

## 🧪 Running Automated Tests

### 1. Backend Integration Tests (Exposure, Double-Spend & Subtree RBAC):
```bash
cd services/backend
npm install
npm test
```

### 2. Matching Engine Unit Tests (FIFO Matching & Depth Calculation):
```bash
cd services/matching-engine
npm install
npm test
```

---

## 📡 Core API Endpoints

- `POST /api/auth/login` — JWT user authentication
- `GET /api/auth/me` — Current user profile & live credit balances
- `GET /api/hierarchy/tree` — Recursive subtree downline explorer
- `POST /api/hierarchy/users` — Provision new subordinate account with role validation
- `POST /api/ledger/allocate` — Downline credit allocation
- `POST /api/ledger/recall` — Subordinate credit recall
- `GET /api/ledger/history` — Double-entry transaction statements
- `GET /api/markets` — Active sports markets with live runner selections
- `POST /api/markets/:id/lock` — Emergency suspension kill-switch
- `POST /api/markets/:id/settle` — Settle event, payout winners & deduct 2% commission
- `POST /api/bets` — Atomically place Back/Lay limit order with liability lock
- `POST /api/bets/:id/cancel` — Cancel unmatched bet & refund exposure lock
- `GET /api/bets/market/:id/exposure` — Live multi-runner position P&L matrix
