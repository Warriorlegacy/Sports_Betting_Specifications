# Sports Betting Exchange & Multi-Tier Control Desk - Session Context

**Date & Time**: August 18, 2026  
**Workspace**: `d:\Sports_Betting_Specifications`  
**Repository State**: All modules compiled with 0 errors, 16/16 test suites passing.

---

## 1. Executive Summary & Accomplishments

In this session, we completed the enterprise development, real-time integration, and automated verification of the **Sports Betting Exchange Platform** across backend, agent portal, and player portal.

### Key Milestones Completed:
1. **Live Multi-User Bet Records Desk (`BetRecordsDesk.tsx`)**:
   - Real-time cross-user bet audit stream with multi-criteria filters (username, sport, bet type BACK/LAY, status).
   - KPI aggregate stat cards: Turnover Volume (₹), Worst-Case Liability Exposure (₹), Settled P&L (₹), Matched vs. Unmatched order counts.
2. **Deposit Accounts & Banking Gateway Manager (`PaymentAccountsManager.tsx`)**:
   - Admin CRUD management for multiple Corporate Bank Accounts (IMPS/NEFT/RTGS), UPI VPAs (`nexusvip.pay@icici`), dynamic QR codes, and Crypto (USDT TRC-20) wallets.
   - Dynamic active/primary status toggling with instant synchronization in the Player Cashier.
3. **Financial Approvals & Settlement Clearing Desk (`FinancialApprovalsDesk.tsx`)**:
   - **Deposit Queue**: View player UTR submissions, 1-click Approve (atomic wallet credit + double-entry ledger entry) and Reject (audit reason).
   - **Withdrawal Queue**: View player payout requests with bank/UPI destination details, 1-click Approve with Bank RRN/IMPS reference, and Reject with automatic wallet refund.
4. **5-Tier Role & Authority Matrix (`RolesMatrixModal.tsx`)**:
   - Formally specifies responsibilities, powers, and credit allocation limits across all 5 tiers (`ADMIN` L0, `SUPER_MASTER` L1, `MASTER` L2, `AGENT` L3, `USER` L4).
5. **ID & Strong Password Generation Engine (`CreateUserModal.tsx` & `ResetPasswordModal.tsx`)**:
   - 1-click random formatted ID generation (e.g. `SM_19201`, `MST_48291`, `AGT_77192`, `PLR_99210`).
   - 1-click secure random password generator.
   - 1-click "Copy WhatsApp Credentials Card" for instant client onboarding.
   - Password reset modal for parent agencies and administrators.
6. **Public Player Portal & Dynamic Cashier (`CashierModal.tsx` & `LoginModal.tsx`)**:
   - Dynamic Cashier fetching active bank accounts and UPI IDs from backend API.
   - Public player registration (`POST /api/auth/register`) with automatic ₹500 welcome credit and instant JWT session creation.
   - Live passbook transaction history.

---

## 2. Directory Structure & Key Files

```
d:\Sports_Betting_Specifications/
├── services/
│   ├── backend/                        # Express, TypeScript, PostgreSQL, Socket.io
│   │   ├── src/
│   │   │   ├── config/index.ts         # Environment & Third-party API keys
│   │   │   ├── db/
│   │   │   │   ├── pool.ts             # PostgreSQL pool & ACID transactions (SELECT ... FOR UPDATE)
│   │   │   │   ├── schema.sql          # Complete DDL: users, markets, deposit_accounts, deposits, withdrawals, ledger
│   │   │   │   ├── init.ts             # Auto-migration & seed data runner
│   │   │   │   └── ledger.ts           # Double-entry ledger, worst-case liability calculation, atomic deposits & withdrawals
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
│   │   │   └── index.ts                # Main Express app & route mounting
│   │   └── tests/
│   │       ├── e2e_betting_and_clearing.test.ts  # Complete betting, deposit, matching & clearing test
│   │       ├── exposure_calculation.test.ts      # Multi-runner liability & hedging tests
│   │       ├── hierarchy_isolation.test.ts       # 5-tier subtree isolation tests
│   │       └── double_spend_concurrency.test.ts  # Double-spend prevention & 2% commission tests
│   │
│   ├── agent-portal/                   # Admin & Risk Management Dashboard (React / Vite)
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
│   └── player-portal/                  # Real Player Sports Betting Interface (React / Vite)
│       └── src/
│           ├── components/
│           │   ├── CashierModal.tsx              # Dynamic Bank/UPI deposit, withdrawal & passbook
│           │   ├── LoginModal.tsx                # Password, OTP & public registration with ₹500 bonus
│           │   ├── BetSlip.tsx                   # Back/Lay slip with liability & exposure preview
│           │   └── MarketDetail.tsx              # Real-time exchange ladder order book
│           ├── services/api.ts                   # Player API client
│           └── App.tsx                           # Player exchange app
└── package.json                        # Root workspace scripts
```

---

## 3. Seed Users & Default Credentials for Testing

| Role Tier | Username | Default Password | Initial Balance | Powers & Capabilities |
|---|---|---|---|---|
| **Level 0: Global Admin** | `admin` | `password123` | ₹10,000,000.00 | Full platform ownership, banking gateway manager, deposit/withdrawal clearing, global bet records, market settlement |
| **Level 1: Super Master** | `supermaster_asia` | `password123` | ₹500,000.00 | Regional agency manager, creates Masters, allocates credit |
| **Level 2: Master** | `master_mumbai` | `password123` | ₹100,000.00 | City agency operator, creates retail Agents, allocates credit |
| **Level 3: Retail Agent** | `agent_vikram` | `password123` | ₹25,000.00 | Local bookmaker, creates real Players, allocates credit |
| **Level 4: Player** | `player_rahul` | `password123` | ₹10,000.00 | Back/Lay bets, deposits via UPI/Bank, withdraws winnings |
| **Level 4: Player 2** | `player_amit` | `password123` | ₹10,000.00 | Back/Lay bets, hedging, cashouts |

---

## 4. How to Run Locally

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

---

## 5. Next Steps for Upcoming Session

1. **Provide Supabase Cloud PostgreSQL URI**:
   - User will create a free database at [supabase.com](https://supabase.com) and provide the `DATABASE_URL` (e.g., `postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`).
   - Add `DATABASE_URL` to `services/backend/.env`.
2. **Execute Live Cloud Deployment**:
   - Backend API -> Deploy on Render / Railway / AWS.
   - Player Portal -> Deploy on Vercel / Cloudflare Pages / Netlify.
   - Agent Portal -> Deploy on Vercel / Cloudflare Pages / Netlify.
3. **Custom Domain Setup**:
   - Connect primary domain for Player Portal (e.g. `yourbrand.com`).
   - Connect subdomain for Admin Portal (e.g. `admin.yourbrand.com`).
4. **Live Production Smoke Test**:
   - Verify real player registration, live UPI QR deposit, admin approval, live betting, matching, and withdrawal on the live domain.
