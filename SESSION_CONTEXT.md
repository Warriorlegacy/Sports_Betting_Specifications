# Sports Betting Exchange & Multi-Tier Control Desk - Session Context

**Date & Time**: August 20, 2026 (12:05 IST)  
**Workspace**: `d:\Sports_Betting_Specifications`  
**Git Commit**: `dff7527` (Main Branch)  
**Live Production Deployments**:
- **Player Portal (Vercel)**: [https://player-portal-kappa.vercel.app](https://player-portal-kappa.vercel.app)
- **Agent / Master Portal (Vercel)**: [https://agent-portal-one-omega.vercel.app](https://agent-portal-one-omega.vercel.app)
- **Backend API & WebSocket Engine (Render)**: [https://sports-exchange-backend-j1aj.onrender.com](https://sports-exchange-backend-j1aj.onrender.com)
- **Live Database**: PostgreSQL Cloud Instance with Double-Entry ACID Ledger & Schema Migrations
- **Codebase Knowledge Graph**: Initialized with 1,719 nodes & 3,520 edges (`codebase-memory-mcp`)

---

## 1. Credentials Matrix (Unique Per Role)

| Role | Username | Dedicated Password | Purpose & Capabilities |
| :--- | :--- | :--- | :--- |
| **Global Admin** | `admin` | `Admin@Nexus2026!` | Full platform control, settle markets, approve bank & UPI deposits, manage corporate accounts |
| **Super Master** | `supermaster_asia` | `SuperAsia#7788$` | Regional territory manager, create & credit Masters, monitor downline turnover |
| **Master** | `master_mumbai` | `MasterMum*9922#` | City/State operator, create & credit Agents, track sub-agent exposure |
| **Retail Agent** | `agent_vikram` | `AgentVikram@4411` | Retail shop agent, onboard Players, credit wallets, collect cash |
| **Punter / Player 1** | `player_rahul` | `RahulWin@2026` | Standard punter, trade exchange, play live casino & matka bazars |
| **Punter / Player 2** | `player_amit` | `AmitBet@7788` | Counter-party punter for P2P order matching & book testing |

---

## 2. Benchmark Feature Parity Accomplishments (Fairplay VIP, Rudra888 & Lotusrun365)

1. **9-Language Internationalization Engine (`i18nService.ts` & `LanguageModal.tsx`)**:
   - Comprehensive dictionary covering English 🇬🇧, Hindi 🇮🇳 (हिंदी), Kannada 🇮🇳 (ಕನ್ನಡ), Tamil 🇮🇳 (தமிழ்), Telugu 🇮🇳 (తెలుగు), Gujarati 🇮🇳 (ગુજરાતી), Marathi 🇮🇳 (मराठी), Urdu 🇵🇰 (اردو), Russian 🇷🇺 (Русский).
   - Reactive `useI18n()` hook dynamically translating all market tabs, bet slip, drawer, and headers with persistent localStorage preference.

2. **Multi-Market Trading Board (`MultiMarketBoard.tsx`)**:
   - Benchmarked against Rudra888.in `/multi-markets`. Punter can pin up to 6 live matches simultaneously to trade Back/Lay prices with real-time score tickers and quick odds execution.

3. **7-Category Indian Fancy & Session Betting Desk (`FancyBettingHub.tsx`)**:
   - Benchmarked against Lotusrun365.com 7 Fancy categories:
     - `SESSION`: Standard Over-by-Over runs (No / Yes with 100/100 or 90/100 rates).
     - `W/P`: Wicket / Player performance markets.
     - `ODD/EVEN`: Odd / Even runs per over.
     - `XTRA`: Extra runs (wides, no-balls).
     - `METER`: Run meter prediction bars.
     - `KHADDA`: Low-score / fall of wicket milestones.
     - `OVERS`: Over-by-over ball-by-ball micro runs.

4. **Bookmaker & Mini Bookmaker 100-Base 0% Commission Markets (`BookmakerMarketHub.tsx`)**:
   - Authentic 100-base rate presentation with zero commission rake, live liability projection, and instant bet slip insertion.

5. **6-Depth Price Ladder Mode (`MatchDetailHub.tsx`)**:
   - Toggle between Standard 2-Box and 6-Depth Ladder (`Back 3..1` vs `Lay 1..3`) showing full market depth liquidity and tick size spreads.

6. **Account Statement & P&L Export Engine (`exportService.ts` & `StatementExportModal.tsx`)**:
   - FairplayVIP parity: Official formatted PDF statement generator with print trigger and instant CSV/Excel spreadsheet exports.

7. **Google Authenticator TOTP 2FA Security (`TwoFactorModal.tsx`)**:
   - QR code provisioning, secret key generator, 6-digit TOTP validation, and 4 emergency backup codes.

8. **Promotional Lucky Spin Wheel (`SpinWheelModal.tsx`)**:
   - 8-segment daily prize wheel with deceleration physics, confetti celebration, 24-hour cooldown timer, and automatic wallet credit callback.

9. **Customizable Quick Stake Presets (`QuickStakeBar.tsx`)**:
   - 6 configurable quick stake preset buttons (+100, +500, +1000, +2500, +5000, +10000) with custom editor modal and localStorage memory.

---

## 2. Directory Structure & Key Files

```
d:\Sports_Betting_Specifications/
├── services/
│   ├── backend/                                  # Express, TypeScript, PostgreSQL, Socket.io
│   │   ├── src/
│   │   │   ├── config/index.ts                   # Environment & Third-party API keys
│   │   │   ├── db/
│   │   │   │   ├── pool.ts                       # PostgreSQL pool & ACID transactions
│   │   │   │   ├── schema.sql                    # DDL: users, markets, deposit_accounts, deposits, withdrawals, ledger
│   │   │   │   ├── init.ts                       # Auto-migration & seed data runner
│   │   │   │   └── ledger.ts                     # Double-entry ledger, liability calculation, atomic clearing
│   │   │   ├── modules/
│   │   │   │   ├── auth/authRoutes.ts            # Login, registration with ₹500 bonus
│   │   │   │   ├── hierarchy/hierarchyRoutes.ts  # Tree, roles spec, password reset, role update
│   │   │   │   ├── ledger/ledgerRoutes.ts        # Deposit/withdrawal queue & approval endpoints
│   │   │   │   ├── paymentMethods/paymentMethodRoutes.ts # Bank & UPI gateway CRUD
│   │   │   │   ├── bets/betRoutes.ts             # Bet placement, order matching, global records
│   │   │   │   └── markets/marketRoutes.ts       # Market creation, lock, settlement
│   │   │   ├── realtime/
│   │   │   │   ├── socketGateway.ts              # Real-time WebSocket rooms (user balance, ladder)
│   │   │   │   └── matchingEngineService.ts      # High-speed FIFO order matching engine
│   │   │   └── index.ts                          # Main Express app & route mounting
│   │   └── tests/
│   │       ├── e2e_betting_and_clearing.test.ts  # Complete betting, deposit, matching & clearing test
│   │       ├── exposure_calculation.test.ts      # Multi-runner liability & hedging tests
│   │       ├── hierarchy_isolation.test.ts       # 5-tier subtree isolation tests
│   │       └── double_spend_concurrency.test.ts  # Double-spend prevention & 2% commission tests
│   │
│   ├── agent-portal/                             # Admin & Risk Management Dashboard (React / Vite)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Header.tsx                    # Top navigation tabs, balance widget, roles matrix button
│   │       │   ├── BetRecordsDesk.tsx            # Live cross-user bet audit & KPI stream
│   │       │   ├── FinancialApprovalsDesk.tsx    # Deposit & Withdrawal approval queues
│   │       │   ├── PaymentAccountsManager.tsx    # Manage multiple Bank accounts & UPI QR codes
│   │       │   ├── HierarchyTree.tsx             # 5-Tier downline tree with credit & password actions
│   │       │   ├── RolesMatrixModal.tsx          # 5-Tier roles and powers specification modal
│   │       │   ├── CreateUserModal.tsx           # Auto-ID/password generator + WhatsApp card
│   │       │   ├── ResetPasswordModal.tsx        # Password reset desk
│   │       │   ├── MarketControls.tsx            # Market kill-switch & settlement controls
│   │       │   └── LedgerTable.tsx               # Double-entry ledger audit table
│   │       ├── services/api.ts                   # Typed API client
│   │       └── App.tsx                           # Master dashboard router & real-time socket alerts
│   │
│   └── player-portal/                            # Real Player Sports Betting Interface (React / Vite)
│       └── src/
│           ├── components/
│           │   ├── FairplayHeader.tsx            # Fairplay VIP styled top navigation & quicklinks
│           │   ├── FairplaySidebar.tsx           # Accordion navigation for all sports categories
│           │   ├── FairplayEventList.tsx         # Live match cards with In-Play indicators & Back/Lay odds
│           │   ├── MatchDetailHub.tsx            # Full Fairplay & Rudra888 in-play match view
│           │   ├── CashOutManager.tsx            # Dynamic Cash-Out terminal with partial percentage sliders
│           │   ├── InfoModal.tsx                 # Official Information, Rules, FAQ, Privacy, T&C Center
│           │   ├── CreditsModal.tsx              # Creator & Godfather Hall of Fame modal
│           │   ├── AppDownloadModal.tsx          # Android APK download modal & QR scanner
│           │   ├── FairplayBetSlip.tsx           # Back/Lay slip with liability & exposure preview
│           │   ├── FairplayFooter.tsx            # Footer with APK banner, payment methods, quicklinks
│           │   ├── MobileBottomNav.tsx           # Floating mobile bottom navigation bar
│           │   ├── CashierModal.tsx              # Dynamic Bank/UPI deposit, withdrawal & passbook
│           │   ├── LoginModal.tsx                # Password, OTP & public registration with ₹500 bonus
│           │   ├── MatkaHub.tsx                  # 23 Indian Worli Matka bazars hub
│           │   └── LiveCasinoHub.tsx             # Evolution & Ezugi live dealer casino lobby
│           ├── services/
│           │   ├── realSportsClient.ts           # Real sports telemetry & match data feeds
│           │   ├── fairplayFeedClient.ts         # Fairplay exchange feed integration
│           │   └── api.ts                        # Player API client
│           └── App.tsx                           # Player exchange main application
├── assets/
│   ├── NexusVIP_Domain_Selection_Portfolio.pdf   # 2-Page Executive Domain Portfolio PDF
│   └── screenshot (1).pdf                        # UI design reference & requirements
└── package.json                                  # Root workspace scripts
```

---

## 3. Production Deployments & Endpoints

| Service | Host / Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Player Exchange Portal** | Vercel (Production) | [https://player-portal-kappa.vercel.app](https://player-portal-kappa.vercel.app) | 🟢 Live |
| **Agent / Admin Portal** | Vercel (Production) | [https://agent-portal-one-omega.vercel.app](https://agent-portal-one-omega.vercel.app) | 🟢 Live |
| **Backend API & WebSocket** | Render (Production) | [https://sports-exchange-backend-jiaj.onrender.com](https://sports-exchange-backend-jiaj.onrender.com) | 🟢 Live |
| **Database** | PostgreSQL Cloud | Multi-region Pooler with ACID Isolation | 🟢 Active |

---

## 4. Dedicated Credentials per Role & User

| Role Tier | Username | Dedicated Password | Initial Balance | Powers & Capabilities |
|---|---|---|---|---|
| **Level 0: Global Admin** | `admin` | `Admin@Nexus2026!` | ₹10,000,000.00 | Full platform ownership, banking gateway manager, deposit/withdrawal clearing, global bet records, market settlement |
| **Level 1: Super Master** | `supermaster_asia` | `SuperAsia#7788$` | ₹500,000.00 | Regional agency manager, creates Masters, allocates credit |
| **Level 2: Master** | `master_mumbai` | `MasterMum*9922#` | ₹100,000.00 | City agency operator, creates retail Agents, allocates credit |
| **Level 3: Retail Agent** | `agent_vikram` | `AgentVikram@4411` | ₹25,000.00 | Local bookmaker, creates real Players, allocates credit |
| **Level 4: Player 1** | `player_rahul` | `RahulWin@2026` | ₹10,000.00 | Back/Lay bets, deposits via UPI/Bank, withdraws winnings |
| **Level 4: Player 2** | `player_amit` | `AmitBet@7788` | ₹10,000.00 | Back/Lay bets, hedging, cashouts |

---

## 5. Local Execution Commands

### Start Backend API (Port 5000)
```powershell
npm run dev:backend
```

### Start Admin Portal (Port 5173 / 3000)
```powershell
npm run dev:agent-portal
```

### Start Player Portal (Port 5174 / 3001)
```powershell
npm run dev:player-portal
```

### Run All Unit & Integration Tests (16 Tests)
```powershell
npm test
```

### Deploy Latest to Vercel (Player & Agent Portals)
```powershell
node deploy_vercel.js
```
