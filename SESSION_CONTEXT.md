# Sports Betting Exchange & Multi-Tier Control Desk - Session Context

**Date & Time**: August 19, 2026 (23:45 IST)  
**Workspace**: `d:\Sports_Betting_Specifications`  
**Git Commit**: `3c169da` (Main Branch)  
**Live Production Deployments**:
- **Player Portal (Vercel)**: [https://player-portal-kappa.vercel.app](https://player-portal-kappa.vercel.app)
- **Agent / Master Portal (Vercel)**: [https://agent-portal-one-omega.vercel.app](https://agent-portal-one-omega.vercel.app)
- **Backend API & WebSocket Engine (Render)**: [https://sports-exchange-backend-jiaj.onrender.com](https://sports-exchange-backend-jiaj.onrender.com)
- **Live Database**: PostgreSQL Cloud Instance with Double-Entry ACID Ledger & Schema Migrations

---

## 1. Executive Summary & Full Accomplishments

In this session, we completed the end-to-end development, reverse-engineering, dynamic financial mathematics, live deployment, and UI styling for the **NexusVIP Sports Betting Exchange and Live Casino Platform**.

### Key Milestones Completed:

1. **Fairplay VIP & Rudra888 Match Detail View (`MatchDetailHub.tsx`)**:
   - **Header & Navigation**: `< In Play` back button, breadcrumb trail, `Open Bets` badge, TV/Stream toggle, stats toggle, share button, and `Live stream ∨` dropdown.
   - **Hero Scoreboard Banner**: Authentic Tennis matrix (`Czech Republic` 🇨🇿 vs `India` 🇮🇳), `Set 1 | Game 6`, tennis server ball `🎾`, large `40 : 30` point score, and collapsible `Best of 3` breakdown table (`1 - 4` games).
   - **Market Tabs**: Gradient orange tabs (`MAIN MARKET`, `BOOKMAKER`, `FANCY / SESSION`, `COIN TOSS`, `PREMIUM MARKET`, `ALL MARKETS`).
   - **⭐ MATCH ODDS Card**:
     - Orange header bar with `⭐ MATCH ODDS` and dynamic `CASHOUT` badge / live valuation offer.
     - Sky Blue `BACK` (`#a5d9fe`) and Pink `LAY` (`#f8d0ce`) odds boxes with real-time volume tickers (`259K`, `169K`).
     - **Live Runner P&L**: Real-time projected P&L under runners (`+7800.00` in green, `-5000.00` in red) dynamically calculated from active bet positions.
     - `Min: 100 ⬍ Max: 25,000` with Betfair Exchange Liquidity badge.
   - **"WHO WILL WIN THE MATCH?" 2-Way Card**: Side-by-side selection buttons (`2.46 / 259k` vs `1.60 / 330k`).
   - **Collapsible Sub-Market Accordions**: `WINNER ∧`, `GAME HANDICAP ∧`, `TOTAL GAMES (O/U) ∧`.
   - **Floating Mini Games FAB 🎲**: Floating action button matching Rudra888 for quick casino launch.

2. **Dynamic In-Play Cash-Out Engine & Interactive Modal (`CashOutManager.tsx` & `MatchDetailHub.tsx`)**:
   - **Exchange Cash-Out Formula**:
     $$\text{Cash Out Payout} = \text{Original Stake} \times \left( \frac{\text{Placed Odds}}{\text{Current Live Odds}} \right)$$
     $$\text{Net Profit / Loss} = \text{Payout} - \text{Stake}$$
   - **Real-Time Dynamic Valuation**: Button automatically computes live offer across all user positions. If no open bets, displays gold `CASHOUT` badge with informative tooltip.
   - **Partial Cash-Out Slider Modal**: Range slider (10% to 100%) and quick presets (25%, 50%, 75%, 100%) allowing punters to cash out custom fractional amounts to lock in profit or mitigate risk before match conclusion.

3. **Information & Compliance Center (`InfoModal.tsx`)**:
   - Resolved all dead quicklinks in the **Header Mini-Bar** and **Footer**:
     - **About Us** (`ABOUT`): NexusVIP Exchange overview, sub-second execution engine, 256-bit SSL encryption, live casino tables, and creator attribution.
     - **Rules & Regulations** (`RULES`): Back & Lay rules, 2% winning rake, Cricket Fancy/Session rules, Tennis retirement rules, and 23 Indian Worli Matka payouts.
     - **FAQ** (`FAQ`): Interactive accordion covering deposits, 5-second withdrawals, cash-out, rain rules, and Provably Fair casino verification.
     - **Terms & Conditions** (`TERMS`): Eligibility (18+), KYC, matched bet finality, anti-bot, and liability rules.
     - **Privacy Policy** (`PRIVACY`): Data protection, zero third-party disclosure, and encrypted transaction storage.
     - **Responsible Gaming** (`RESPONSIBLE`): 18+ policy, self-exclusion, and deposit/stake limits.

4. **Multi-User Live Bet Records Desk & Admin Controls (`BetRecordsDesk.tsx` & `FinancialApprovalsDesk.tsx`)**:
   - Real-time cross-user bet audit stream with multi-criteria filters.
   - KPI aggregate stat cards: Turnover Volume (₹), Worst-Case Liability Exposure (₹), Settled P&L (₹), Matched vs. Unmatched order counts.
   - 1-click Deposit UTR Approval and Withdrawal Payout clearing desk.
   - Corporate Banking Gateway Manager (Bank IMPS/NEFT, UPI QR VPAs, USDT TRC-20).

5. **Creator & Godfather Attribution**:
   - Official attribution modal and footer ribbon honoring **Piyush Raj Singh** (Solo Creator & Godfather) and Signhify AI Studio.

6. **Domain Portfolio & Documentation**:
   - 15 premium brand names with exact registrar links, marketing slogans, and a 2-page executive PDF (`NexusVIP_Domain_Selection_Portfolio.pdf`) deployed on the live CDN.

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
