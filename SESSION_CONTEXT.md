# Sports Betting Exchange & Multi-Tier Control Desk - Session Context

**Date & Time**: August 20, 2026 (evening session)
**Workspace**: `d:\Sports_Betting_Specifications`
**Git Commit**: `dff7527` (Main Branch) + reverse-engineering & real data specifications
**Live Production Deployments**:
- **Player Portal (Vercel)**: [https://player-portal-kappa.vercel.app](https://player-portal-kappa.vercel.app)
- **Agent / Master Portal (Vercel)**: [https://agent-portal-one-omega.vercel.app](https://agent-portal-one-omega.vercel.app)
- **Backend API & WebSocket Engine (Render)**: [https://sports-exchange-backend-j1aj.onrender.com](https://sports-exchange-backend-j1aj.onrender.com)
- **Live Database**: PostgreSQL Cloud Instance with Double-Entry ACID Ledger & Schema Migrations
- **Codebase Knowledge Graph**: Initialized with 1,719 nodes & 3,520 edges (`codebase-memory-mcp`)

---

## 0. 4-Platform Reverse Engineering Deliverables & Benchmark Matrix

| Feature / Dimension | **FairplayVIP (fairplayvip.in)** | **Allpanel7 / Diam9 (iceexchange.com)** | **Rudra888.in (MySportsFeed)** | **Lotusrun365 (DataFairPlay)** | **Our Nexus VIP Portal Status** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Theme / Palette** | Orange `#f36c21`, Charcoal `#1e1e1e`, Light mode | Dark Green `#0C2013` + Gold `#BB973B` + Red `#DE191E` | Navy `#222241`, Pink `#fd2954`, Blue `#0495e3` | Teal `#034C6F` + Slate `#1A2D3A` | **Multi-Theme Engine**: Fairplay default + 1-click theme presets |
| **Odds Presentation** | Betfair Light Blue `#a5d9fe` & Light Pink `#f8d0ce` | 6-depth ladder (.show-size .back/.lay) | Hot Pink (Back) & Cyan Blue (Lay) | 6-level price ladder | **6-Level Depth Ladder** + 2-Box Toggle with live tick animation |
| **Languages** | **9 Languages** (EN, HI, KN, TA, TE, GU, MR, UR, RU) | 7 Languages (EN, HI, TA, TE, KN, MR, GU) | English only | English only | **9 Languages Active** (`i18nService.ts` & `LanguageModal.tsx`) |
| **Realtime Engine** | Socket.IO (`zplay1.in`) | Firebase RTDB (`t20-score-290608`) + SSE | STOMP/SockJS (`hypex-ws`) | Pusher / SockJS | **Socket.io + HTTP polling with real data diffing** |
| **Special Markets** | Bookmaker, Fancies, Up/Down, 10-Min | Player Battle, Grey Gaming, Casino Streams | Winner, Handicap, Over/Under, Odd/Even | **7 Fancy Categories** (Session, W/P, Odd/Even, Xtra, Meter, Khadda, Overs) | **7-Category Fancy Hub** + **Bookmaker 100-Base 0% Commission Hub** |
| **Multi-Market Trading** | standard | standard | **Multi-Market Board** (pin up to 6 matches) | standard | **Active** (`MultiMarketBoard.tsx`) |
| **Matka / Worli** | 22+ live Bazars (`zplay1.in/api/v1/worli/public/matches`) | standard | — | — | **23 Live Bazars Active** (`MatkaHub.tsx`) |
| **Casino Lobby** | Evolution, Ezugi, Live Card, Dream Casino | Ace Casino, Live Casino, Slots | Roulette, AE Sexy, Slots, Mac88 | Live Casino | **Evolution, Ezugi & Live Card Lobby Active** (`LiveCasinoHub.tsx`) |
| **Payments / OCR** | Manual UPI/Bank + Proof upload + Auto-UTR | **Tesseract.js OCR** of UPI transaction screenshots | Web gateway | Web gateway | **Dynamic Bank/UPI Desk** + Slip Proof upload |
| **Statement Export** | **jsPDF (PDF) + SheetJS (Excel/CSV)** | jsPDF + SheetJS | Web statement table | Web statement table | **Active** (`exportService.ts` & `StatementExportModal.tsx`) |
| **Security / 2FA** | **Google Authenticator TOTP** | OTP Login | 2FA / Tawk.to | reCAPTCHA | **Google TOTP 2FA Active** (`TwoFactorModal.tsx`) |

---

## 0.1 Real Data Pipeline & Feed Architecture

1. **Live Exchange Feeds**:
   - Matches & Betfair Back/Lay Odds: `https://central.zplay1.in/pb/api/v1/events/matches/all` and `/inplay`
   - Worli Matka Bazars: `https://zplay1.in/api/v1/worli/public/matches` and `/all/markets`
   - Real Sports Telemetry: ESPN scoreboard APIs for International Cricket, Premier League, La Liga, Serie A, Champions League, NBA, WNBA, MLB, ATP Tennis.
2. **Zero Mock Fallbacks**:
   - `mockSportsbookData.ts` contains empty arrays. All displayed matches, odds, runners, and liquidity come from live feeds or backend PostgreSQL ledger.
   - Demo-user auto-login is removed. All punter actions authenticate against the real PostgreSQL backend.

---

## 0.2 OTP Verification Service — Mobile SMS & WhatsApp Delivery 100% Active

**Status in Workspace:**
- **SMS & WhatsApp Mobile Dispatch Engine**: Active via `smsService.ts` and `authRoutes.ts`:
  - `POST /api/auth/send-otp`: Generates 6-digit OTP code, saves in DB/memory, and dispatches to user's phone via **SMS Gateway** (Fast2SMS / 2Factor.in / Twilio) or **WhatsApp OTP** (WhatsApp Direct Message link / webhook).
  - `POST /api/auth/verify-otp` & `POST /api/auth/login-with-otp`: Validates OTP code, marks OTP used, automatically logs in or auto-registers player account (`player_XXXXXXXXXX`), and issues signed 7-day JWT token.
- **Frontend 3-Tab Login Terminal (`LoginModal.tsx`)**:
  - Tab 1: **OTP Login (SMS & WhatsApp Delivery)**:
    - 10-Digit mobile number input with `+91 🇮🇳` country badge.
    - Delivery channel selection: 📱 **SMS Message** or 💬 **WhatsApp OTP**.
    - 1-Click **"Open Code in WhatsApp"** button for direct mobile app receipt.
    - 6-Digit individual numeric input boxes with auto-advance and paste support.
    - 60-Second live resend countdown timer with dual Resend SMS / Resend WhatsApp options.
  - Tab 2: **Password Login** — Standard username & password login.
  - Tab 3: **Register** — Player self-onboarding.
- **TOTP (Google Authenticator 2FA)**: Built-in via `TwoFactorModal.tsx` for offline 2FA.

**Free & Low-Cost OTP Options for Production Gateways:**

| Provider / Option | Free Tier Allowance | Ongoing Cost | Delivery Channel | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **1. Built-in OTP Engine + Google Auth** | **100% Free Forever** | ₹0.00 | Web / Offline TOTP | **Zero-cost default** — Active in workspace. |
| **2. Firebase Phone Auth (Spark Free)** | **10,000 verifications / mo** | ~₹1.00 / SMS after free tier | SMS (Google Identity) | **Best free SMS option** — invisible reCAPTCHA, Google scale. |
| **3. MSG91** | Free trial credits on signup | SMS ~₹0.18/SMS; **WhatsApp ~₹0.25-0.35/OTP** | SMS & WhatsApp | **Highest Indian conversion** — WhatsApp OTP with 99%+ open rates. |
| **4. Fast2SMS** | ₹50 free trial credits (~100-200 SMS) | ₹0.15 - ₹0.20 per SMS | SMS (Quick SMS Route) | Simple REST API, minimal registration friction. |
| **5. OTPLESS** | Free trial period | Low per-auth cost | WhatsApp 1-Tap / Voice OTP | Frictionless 1-tap WhatsApp login. |
| **6. Resend / Brevo (Email OTP)** | **Resend: 3,000 emails/mo Free**; **Brevo: 300 emails/day Free** | ₹0.00 | Email | **Zero-cost alternative** for email verification. |

---

## 1. Credentials Matrix (Unique Per Role)

| Role | Username | Dedicated Password | Initial Balance | Purpose & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Global Admin** | `admin` | `Admin@Nexus2026!` | ₹10,000,000.00 | Full platform control, settle markets, approve bank & UPI deposits, manage corporate accounts |
| **Super Master** | `supermaster_asia` | `SuperAsia#7788$` | ₹500,000.00 | Regional territory manager, create & credit Masters, monitor downline turnover |
| **Master** | `master_mumbai` | `MasterMum*9922#` | ₹100,000.00 | City agency operator, create & credit Agents, track sub-agent exposure |
| **Retail Agent** | `agent_vikram` | `AgentVikram@4411` | ₹25,000.00 | Retail shop agent, onboard Players, credit wallets, collect cash |
| **Punter / Player 1** | `player_rahul` | `RahulWin@2026` | ₹10,000.00 | Standard punter, trade exchange, play live casino & matka bazars |
| **Punter / Player 2** | `player_amit` | `AmitBet@7788` | ₹10,000.00 | Counter-party punter for P2P order matching & book testing |

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
│   │   │   │   ├── auth/authRoutes.ts            # Login, registration (password-only, no bonus)
│   │   │   │   ├── hierarchy/hierarchyRoutes.ts  # Tree, roles spec, password reset, role update
│   │   │   │   ├── ledger/ledgerRoutes.ts        # Deposit/withdrawal queue & approval endpoints
│   │   │   │   ├── paymentMethods/paymentMethodRoutes.ts # Bank & UPI gateway CRUD
│   │   │   │   ├── bets/betRoutes.ts             # Bet placement, order matching, global records
│   │   │   │   └── markets/marketRoutes.ts       # Market creation, lock, settlement
│   │   │   └── index.ts                          # Main Express app & route mounting
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
│           │   ├── FairplayHeader.tsx            # Top navigation & user drawer
│           │   ├── FairplaySidebar.tsx           # Accordion navigation for all sports categories
│           │   ├── FairplayEventList.tsx         # Live match cards with In-Play indicators & Back/Lay odds
│           │   ├── MatchDetailHub.tsx            # In-play match view with 6-depth ladder & accordions
│           │   ├── MultiMarketBoard.tsx          # 6-match pinned multi-market board (Rudra888 parity)
│           │   ├── FancyBettingHub.tsx           # 7-Category Indian Fancy desk (Lotusrun365 parity)
│           │   ├── BookmakerMarketHub.tsx        # 100-Base 0% commission Bookmaker desk
│           │   ├── CashOutManager.tsx            # Dynamic Cash-Out terminal with partial sliders
│           │   ├── InfoModal.tsx                 # Official Rules, FAQ, Privacy, T&C Center
│           │   ├── FairplayBetSlip.tsx           # Back/Lay slip with liability & exposure preview
│           │   ├── CashierModal.tsx              # Dynamic Bank/UPI deposit, withdrawal & passbook
│           │   ├── LoginModal.tsx                # Password & public registration
│           │   ├── MatkaHub.tsx                  # 23 Indian Worli Matka bazars hub
│           │   ├── LiveCasinoHub.tsx             # Evolution & Ezugi live dealer casino lobby
│           │   └── TwoFactorModal.tsx            # Google Authenticator TOTP 2FA
│           ├── services/
│           │   ├── realSportsClient.ts           # Real sports telemetry & ESPN scoreboards
│           │   ├── fairplayFeedClient.ts         # Live Fairplay/ZPlay exchange & Matka feed
│           │   ├── i18nService.ts                # 9-language translation engine
│           │   ├── exportService.ts              # PDF/Excel statement export
│           │   └── api.ts                        # Player backend API client
│           └── App.tsx                           # Main Player Portal Application
```

---

## 3. Local Execution Commands

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
