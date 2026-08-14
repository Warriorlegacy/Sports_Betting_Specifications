# ENTERPRISE MULTI-TIER SPORTS BETTING EXCHANGE SPECIFICATION

## Architectural Blueprint, Implementation Roadmap, Cost Analysis & Autonomous Prompt Payload

---

## 1. Executive Product Requirement Description (PRD)

### 1.1 System Architecture Overview

This platform is a high-concurrency, peer-to-peer (P2P) sports betting exchange structured around a 5-Tier Hierarchical Credit Network. Unlike traditional fixed-odds sportsbooks where the house carries directional risk, a sports exchange acts as a neutral market facilitator. Operators earn revenue strictly through configurable commission rakes (2% to 5%) on net winning market positions.

### 1.2 Functional 5-Tier Hierarchy Matrix

Data visibility and administrative authority are strictly bounded by a non-cyclic parent-child tree structure:

| Tier Level | Role | Administrative Scope & System Rights | Credit & Risk Authority |
| --- | --- | --- | --- |
| Level 0 | Global Admin | Platform-wide management, odds stream controls, event locks, global commission rates. | Mints initial operational credit, assigns limits to Level 1 Super Masters. |
| Level 1 | Super Master | Regional branch oversight, management and suspension of Level 2 Masters. | Allocates credit lines down to Level 2 Masters within assigned branch bounds. |
| Level 2 | Master | Local agency group management, onboarding and monitoring of Level 3 Agents. | Allocates credit lines to Level 3 Agents based on parent allocation. |
| Level 3 | Agent | Direct retail account creation, manual deposit/withdrawal logging, password resets. | Provisions active credit/chips to Level 4 Players; manages off-platform cash. |
| Level 4 | Player / User | Client trading interface access, live Back/Lay order execution, market statements. | Places bets bounded strictly by available credit and worst-case liability locks. |

---

## 2. Core Market Feature Matrix

| Feature Module | Functional Requirement | Technical Implementation |
| --- | --- | --- |
| Ladder Order Book | Real-time Back (Blue) and Lay (Pink) market depth display. | Socket.io + Redis Pub/Sub pushing state updates in <50ms. |
| Atomic Exposure Lock | Real-time worst-case liability calculation prior to order acceptance. | PostgreSQL SERIALIZABLE transactions with FOR UPDATE row locks. |
| In-Play Suspension | Automated order book freezing during critical match events. | Emergency kill-switch emitting global Redis pub/sub market lock events. |
| Liquidity Seeding (ABLP) | Automated Bookie Liquidity Pools bridging external market feeds. | Betfair / Betradar API adapters filling unmatched limit order volumes. |
| Telegram PWA SDK | Native web application execution directly within Telegram client chats. | Telegram WebApp JS SDK wrapper with biometric auth integration. |

---

## 3. Technical Requirement Description & Database Schema

### 3.1 PostgreSQL 16 Double-Entry Ledger Schema

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_enum AS ENUM ('ADMIN', 'SUPER_MASTER', 'MASTER', 'AGENT', 'USER');
CREATE TYPE bet_type_enum AS ENUM ('BACK', 'LAY');
CREATE TYPE bet_status_enum AS ENUM ('MATCHED', 'UNMATCHED', 'SETTLED', 'CANCELLED', 'SUSPENDED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (credit_limit >= 0),
    available_credit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    exposure NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (exposure >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_parent_hierarchy CHECK (
        (role = 'ADMIN' AND parent_id IS NULL) OR 
        (role != 'ADMIN' AND parent_id IS NOT NULL)
    )
);

CREATE TABLE markets (
    id VARCHAR(100) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    market_type VARCHAR(50) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    in_play BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    market_id VARCHAR(100) NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
    selection_id INT NOT NULL,
    type bet_type_enum NOT NULL,
    price NUMERIC(8, 2) NOT NULL CHECK (price > 1.00),
    stake NUMERIC(15, 2) NOT NULL CHECK (stake > 0.00),
    liability NUMERIC(15, 2) NOT NULL CHECK (liability >= 0.00),
    status bet_status_enum NOT NULL DEFAULT 'UNMATCHED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0.00),
    transaction_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_bets_market_selection ON bets(market_id, selection_id);
```

---

## 4. Cost Breakdown Matrix

| Budget Category | Provider / Source | Estimated Initial (CapEx) | Estimated Monthly (OpEx) |
| --- | --- | --- | --- |
| AI Autonomous Development | OpenCode / Cursor / API Credits | $200 – $500 | $0 – $100 |
| Commercial Feeds (Odds/Scores) | Betfair API / LSports / Betradar | $2,000 – $5,000 | $2,000 – $7,000 |
| Cloud Infrastructure & Security | AWS (EKS, Aurora PostgreSQL) + Cloudflare | $500 | $1,500 – $4,500 |
| Gaming License & Legal | Curacao / Anjouan Licensing | $18,000 – $35,000 | $2,000 – $4,000 |
| Identity Verification (KYC) | Sumsub / Onfido Integrations | $1,000 | $0.50 per verification |
| TOTAL ESTIMATED BUDGET | — | $21,700 – $42,000 | $5,500 – $15,600 / mo |

---

## 5. Implementation Roadmap

1. Phase 1: Tooling & Container Setup (Days 1–2) — Initialize git repository with TurboRepo workspace layout and boot local PostgreSQL 16 and Redis 7 services via Docker Compose.
2. Phase 2: Database Ledger & Auth Execution (Days 3–5) — Run DDL migrations, seed default Admin accounts, and implement Express auth middleware with sub-tree hierarchy CTE queries.
3. Phase 3: High-Frequency Engine & WebSockets (Days 6–9) — Build Go in-memory Back/Lay order matching engine service and Node.js Socket.io gateway adapter wired to Redis Pub/Sub channels.
4. Phase 4: Frontend Application Build (Days 10–14) — Build React/Vite Admin & Agent dashboard with credit management controls and Next.js PWA mobile trading UI with Back/Lay ladder controls.
5. Phase 5: Testing & Deployment (Days 15–18) — Execute Jest stress tests simulating concurrent bet requests and deploy production containers to Kubernetes behind Cloudflare WAF.
