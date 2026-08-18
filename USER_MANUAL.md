# 📖 Official User Manual & Operations Guide
## Ultra-High Performance Sports Exchange, Live TV & Gaming Portal

Welcome to the **Official User Manual & Operations Guide** for your comprehensive Sports Betting Exchange, Cricket Fancy Terminal, Live TV Streaming, Indian Worli Matka Bazar, and Live Dealer Casino Platform.

---

## 👨‍💻 Creator & Platform Engineering Credits

* **Solo Creator & Architect**: **Piyush Raj Singh**
* **Title**: Godfather & Solo Lead Architect of Signhify AI & Sports Betting Exchange Platform
* **Engineering Motto**: *"Type less. Signhify everything."*
* **Portfolio & Repositories**:
  * **AI Engineering Studio**: [Signhify AI Platform](https://signhify.lovable.app)
  * **LinkedIn**: [Piyush Raj Singh](https://linkedin.com/in/piyushraj-singh)
  * **Instagram**: [@piyushrajsingh.golu](https://www.instagram.com/piyushrajsingh.golu?igsh=eHFnNnhwZjJyYmo2&utm_source=qr)
  * **GitHub**: [Warriorlegacy](https://github.com/Warriorlegacy)

---

## 📑 Table of Contents
1. [Platform Architecture & Core Overview](#1-platform-architecture--core-overview)
2. [Navigation & Interface Layout](#2-navigation--interface-layout)
3. [Live Broadcast News & Announcement Ticker](#3-live-broadcast-news--announcement-ticker)
4. [Sportsbook & In-Play Match Betting](#4-sportsbook--in-play-match-betting)
5. [P2P Betting Exchange (Betfair Back & Lay Ladder)](#5-p2p-betting-exchange-betfair-back--lay-ladder)
6. [Cricket Coin Toss Winner Market](#6-cricket-coin-toss-winner-market)
7. [Cricket Fancy & Session Betting](#7-cricket-fancy--session-betting)
8. [6-Button Configurable Quick Stakes Customizer](#8-6-button-configurable-quick-stakes-customizer)
9. [Live Match TV Broadcast & 3D Sportradar Center](#9-live-match-tv-broadcast--3d-sportradar-center)
10. [Same-Game Parlay (SGP) Builder](#10-same-game-parlay-sgp-builder)
11. [Indian Worli Matka Bazar (23 Live Bazars)](#11-indian-worli-matka-bazar-23-live-bazars)
12. [Indian Live Card Games & Live Dealer Casino](#12-indian-live-card-games--live-dealer-casino)
13. [Early Cash Out & Risk Management Terminal](#13-early-cash-out--risk-management-terminal)
14. [Cashier & Proof of Payment Upload System](#14-cashier--proof-of-payment-upload-system)
15. [Agent & Dealer Administration Panel](#15-agent--dealer-administration-panel)
16. [Theme Customizer & White-Label Controls](#16-theme-customizer--white-label-controls)
17. [Production Deployment & Infrastructure Matrix](#17-production-deployment--infrastructure-matrix)

---

## 1. Platform Architecture & Core Overview

Your platform is built on an enterprise 9-microservice architecture delivering:
* **348+ Live In-Play Matches 24/7**: Cricket, Football, Tennis, Basketball, Baseball, Table Tennis, NFL, and Esports.
* **Sub-Second WebSocket Price Ticks**: Millisecond Back/Lay depth updates streamed directly via WebSocket (`wss://zplay1.in` / Socket.io).
* **Live Broadcast Flash Ticker**: Auto-scrolling real-time alert ribbon across both player and dealer portals.
* **Cricket Coin Toss Winner Markets**: Dedicated Back & Lay markets for pre-match coin toss outcomes.
* **Configurable 6 Quick Stake Buttons**: Customizable stake buttons (`MaxLimit.aspx` standard) with persistent local storage.
* **Embedded High-Definition Live Match TV**: Live video streams (`vid.dreamcasino.live`) and 3D radar scoreboards (`scorecard.oddstrad.com`).
* **Indian Worli Matka Hub**: 23 active markets with authentic 9x–700x payout multipliers.
* **Comprehensive Indian Live Card Games Suite**: Real interactive tables for *Teen Patti 20-20, Teen Patti One Day, Dragon Tiger 6, Lucky 7 (7 Up 7 Down), Amar Akbar Anthony, and 20-20 Live Poker*.
* **Cashier with Screenshot Dropzone & Inspector Lightbox**: Direct payment screenshot proof uploads with instant admin inspection.

---

## 2. Navigation & Interface Layout

The top navigation header provides instant one-click switching across all core modules:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ [BRAND]   [Activity Sportsbook]  [Layers P2P Exchange]  [🎰 Matka]  [🎲 Live Casino]  [💰 Cash Out]  [📜 My Bets] │
│ ───────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│ 📢 [FLASH] LIVE CRICKET TOSS & BOOKMAKER MARKETS ARE LIVE • ZERO COMMISSION OVERHANG • INSTANT UPI SETTLEMENTS    │
│ ───────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│ 🏏 Cricket  ⚽ Football  🎾 Tennis  🏀 Basketball  ⚾ Baseball  🏓 Table Tennis  🏈 NFL  🎮 Esports   [₹ Balance]  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Top Navigation Modes:
* **Sportsbook**: Comprehensive multi-market sports book covering 348+ fixtures.
* **P2P Exchange**: Authentic Betfair-grade Back/Lay ladders with liquidity depth.
* **Matka Bazar**: 23 Indian Matka markets (Kalyan, Milan, Desawar, Sridevi, Rajdhani).
* **Live Casino**: Evolution, Ezugi, and Indian live card tables.
* **Cash Out**: Early settlement manager with automated threshold execution.
* **My Bets**: Active bets, settlement history, and open liability statements.

---

## 3. Live Broadcast News & Announcement Ticker

The platform features a real-time broadcast ribbon positioned right below the header:

* **Real-Time Marquee**: Automatically cycles through platform announcements, settlement notices, match delays, and casino launches.
* **Audience Filtering**:
  * `ALL`: Public broadcasts shown to all users.
  * `PLAYER`: Player-specific deposit bonuses, tournament odds, and game releases.
  * `DL`: Dealer/Agent notices regarding credit limits, commission policies, and banking UTR checks.
* **Interactive Controls**: Hovering over the ticker pauses the auto-rotation to allow easy reading.
* **Admin Publishing**: Admins can post instant announcements via `POST /api/news`.

---

## 4. Sportsbook & In-Play Match Betting

### Browsing Fixtures
1. Use the **Sport Filter Bar** to select your sport (*Cricket, Football, Tennis, etc.*).
2. Use the **Date Strip** to view *Today's Matches*, *Tomorrow*, or *Upcoming*.
3. Click any match card to open the **Full Match Center & Market Hub**.

### Adding Selections to the Universal Bet Slip
1. Click any odds button (*Home, Draw, Away, Over/Under, Handicap*).
2. The selection appears immediately in the **Universal Bet Slip** on the right side.
3. Select your quick stake button or type a custom amount.
4. Review your **Potential Profit** and **Total Liability** calculation and click **Place Bet**.

---

## 5. P2P Betting Exchange (Betfair Back & Lay Ladder)

The P2P Exchange allows users to bet against other players with zero house edge:

```
                  ┌──────────────────────┬──────────────────────┐
                  │      BACK (BLUE)     │      LAY (PINK)      │
                  │   Betting FOR a Win  │ Betting AGAINST Win  │
┌─────────────────┼──────────┬───────────┼──────────┬───────────┤
│ Runner 1 (Home) │   1.95   │  ₹85,000  │   1.97   │  ₹42,000  │
│ Runner 2 (Away) │   2.05   │  ₹34,000  │   2.08   │  ₹61,000  │
└─────────────────┴──────────┴───────────┴──────────┴───────────┘
```

### How Back & Lay Work:
* **Back (Blue Button)**: You are betting that the team **WILL WIN**.
  * *Example*: Backing Mumbai Indians at `2.00` for ₹1,000 ➔ If Mumbai wins, Profit = ₹1,000.
* **Lay (Pink Button)**: You are acting as the bookmaker, betting that the team **WILL NOT WIN**.
  * *Example*: Laying Mumbai Indians at `2.10` for ₹1,000 ➔ Liability = ₹1,100. If Mumbai loses, Profit = ₹1,000.

### Position Matrix & Net Exposure:
The **Position Matrix** automatically computes your live Profit/Loss scenario across every possible match outcome in real time so you can manage liability and green-book your profits before match conclusion.

---

## 6. Cricket Coin Toss Winner Market

Adapted directly from Indian exchange platforms (`TossBook.aspx` / `sget1`):
1. Open any Cricket match in the **Match Detail Hub**.
2. Click the **🪙 Toss Winner** category tab.
3. Choose either **Team 1 to win Coin Toss** or **Team 2 to win Coin Toss** with Back & Lay odds.
4. Toss markets settle immediately upon the official coin toss announcement before the 1st ball is bowled.

---

## 7. Cricket Fancy & Session Betting

Cricket Fancy betting is the most popular in-play betting mode in India:

```
┌──────────────────────────────────────────────┬──────────────┬──────────────┬────────────┐
│ FANCY MARKET NAME                            │   NO (LAY)   │  YES (BACK)  │  MAX BET   │
├──────────────────────────────────────────────┼──────────────┼──────────────┼────────────┤
│ 6 Overs Session India                        │   48  (100)  │   50  (100)  │  ₹50,000   │
│ 10 Overs Session India                       │   82   (95)  │   85  (105)  │  ₹50,000   │
│ 20 Overs Total Innings Runs                  │  174  (100)  │  178  (100)  │  ₹1,00,000 │
│ Fall of 1st Wicket India                     │   24  (110)  │   26   (90)  │  ₹25,000   │
│ Total Match 6s in Match                      │   12  (100)  │   14  (100)  │  ₹50,000   │
└──────────────────────────────────────────────┴──────────────┴──────────────┴────────────┘
```

### How to Place Fancy Bets:
1. Open any Cricket match and select the **⚡ Cricket Fancy & Sessions** tab.
2. Click **NO (Red button)** if you believe the outcome will be **lower** than the line.
3. Click **YES (Blue button)** if you believe the outcome will be **equal or higher** than the line.
4. The ticket adds to your bet slip with instant payout calculations.

---

## 8. 6-Button Configurable Quick Stakes Customizer

To enable rapid 1-click bet placement during volatile in-play odds shifts:
1. In the Bet Slip or Live Casino stake bar, click the **Sliders (Edit Values)** button.
2. The **Quick Stake Customizer Modal** opens.
3. Configure your 6 custom button values (Button 1 through Button 6).
4. Or choose from 1-click presets:
   * **Low Stakes**: ₹50, ₹100, ₹250, ₹500, ₹1,000, ₹2,500
   * **Standard**: ₹100, ₹500, ₹1,000, ₹2,500, ₹5,000, ₹10,000
   * **High Roller VIP**: ₹1,000, ₹5,000, ₹10,000, ₹25,000, ₹50,000, ₹1,00,000
5. Click **Save Quick Stakes**. Your customized buttons are instantly saved in local storage and active across all betting slips.

---

## 9. Live Match TV Broadcast & 3D Sportradar Center

Watch live HD video streams directly inside the betting hub without leaving the page:
1. Click the **📺 Live TV & Radar** tab in any match hub.
2. **📺 Live TV Stream**: Direct CDN video stream with sub-second delay.
3. **📊 3D Sportradar Tracker**: Real-time interactive pitch visualizer showing ball location, possession attack phases, wagon wheels, and live stats.

---

## 10. Same-Game Parlay (SGP) Builder

Combine multiple markets from the same match into a single high-payout accumulator:
1. Click the **Sparkles Same-Game Parlay (SGP)** tab in the match hub.
2. Select your correlated legs (e.g. *Match Winner + Total Goals Over 2.5 + Player to Score*).
3. The automated correlation engine calculates the combined multiplier rate.
4. Enter your stake and place your combined SGP ticket.

---

## 11. Indian Worli Matka Bazar (23 Live Bazars)

Access 23 live Indian Matka markets (*Kalyan, Milan Day/Night, Madhur, Desawar, Sridevi, Rajdhani, Time Bazar*):

```
┌─────────────────┬───────────────────────────────────────────┬───────────────────────────────────────────┐
│ BET TYPE        │ DESCRIPTION                               │ PAYOUT MULTIPLIER                         │
├─────────────────┼───────────────────────────────────────────┼───────────────────────────────────────────┤
│ Single Digit    │ Pick single number from 0 to 9            │ 1 : 9x (Bet ₹100 ➔ Win ₹900)             │
│ Jodi            │ Pick 2-digit combination from 00 to 99    │ 1 : 90x (Bet ₹100 ➔ Win ₹9,000)          │
│ Single Patti    │ 3 unique digits Pana (e.g. 123, 456)      │ 1 : 140x (Bet ₹100 ➔ Win ₹14,000)        │
│ Double Patti    │ 2 identical digits Pana (e.g. 112, 448)   │ 1 : 280x (Bet ₹100 ➔ Win ₹28,000)        │
│ Triple Patti    │ 3 identical digits Pana (e.g. 111, 777)   │ 1 : 700x (Bet ₹100 ➔ Win ₹70,000)        │
└─────────────────┴───────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 12. Indian Live Card Games & Live Dealer Casino

The platform hosts an authentic suite of 6 Indian Live Exchange Card Games:

1. **Teen Patti 20-20 (`t20`)**:
   * Player A vs Player B 3-card showdown.
   * Side Bets: Pair Plus A (3.5x), Pair Plus B (3.5x), 6 Card Bonus (100x).
2. **Teen Patti One Day (`oneday`)**:
   * Back and Lay match odds with floating bookmaker prices.
3. **Dragon Tiger 6 (`dt6`)**:
   * Highest single card wins.
   * Odds: Dragon (1.98), Tiger (1.98), Tie (9.00), Suited Tie (50.00).
4. **Lucky 7 (7 Up 7 Down) (`lucky7eu`)**:
   * Low (1–6 @ 2.0x), Exact 7 (11x), High (8–12 @ 2.0x).
5. **Amar Akbar Anthony (`aaa`)**:
   * Amar (Low 1–6 @ 2.0x), Akbar (Mid 7–10 @ 3.0x), Anthony (Picture Cards J/Q/K @ 4.0x).
6. **20-20 Live Poker (`poker`)**:
   * Heads-up Texas Hold'em shootout with live river card showdown.
7. **Super Andar Bahar Live**:
   * Desi favorite: Match the Joker card on Andar (1.95) or Bahar (2.00) with up to 4000x multipliers.
8. **Namaste Hindi Lightning Roulette**:
   * Hindi-speaking live dealers with 500x Lucky Number Lightning strikes on every spin.

---

## 13. Early Cash Out & Risk Management Terminal

Lock in profits or minimize losses before the final whistle:
1. Navigate to the **💰 Cash Out** tab in the top navigation.
2. View your active bets with real-time dynamic cash out values computed by the in-play odds engine.
3. **Instant Cash Out**: Click **Cash Out ₹X,XXX** for immediate settlement.
4. **Auto-Cash Out**: Set a target threshold value; the system will automatically execute the cash out when the market reaches your target.

---

## 14. Cashier & Proof of Payment Upload System

### Submitting Deposits with Screenshot Proof
1. Click **Deposit** in the header.
2. Select your payment method (UPI QR, Bank IMPS, or USDT).
3. Transfer the amount using your banking app (GPay, PhonePe, Paytm).
4. Enter the **12-digit UPI UTR / Reference Number**.
5. **Screenshot Dropzone**: Click or drag & drop your payment receipt / screenshot.
   * Instant thumbnail preview with file size verification.
   * Click the remove icon if you wish to re-upload.
6. Click **Submit Deposit Request**.
7. In the **Passbook / History** tab, click **[Proof]** next to any deposit to inspect your uploaded payment screenshot in full-screen Lightbox mode.

---

## 15. Agent & Dealer Administration Panel

Agents and Admins manage downline hierarchies and financial approvals via the **Agent Portal**:

1. **Hierarchy Tree**: Visual downline tree explorer with real-time credit allocation and lock/unlock controls.
2. **Financial Approvals Desk**:
   * View all incoming player deposits with UTR, amount, and timestamp.
   * **Payment Proof Column**: Click **View Proof** or inspect the thumbnail.
   * **Approval Lightbox**: Full-resolution modal displaying user ID, amount, UTR, and high-resolution receipt before 1-click **Approve** or **Reject**.
3. **Payment Accounts Manager**:
   * Add and activate company UPI IDs, Bank Accounts, and QR code assets for player deposit routing.
4. **Dealer Broadcast Ticker**:
   * Instant marquee displaying dealer settlement notices and critical risk alerts.

---

## 16. Theme Customizer & White-Label Controls

Customize the entire visual identity of your portal in real time:
1. Click the **Palette (Theme)** icon in the header.
2. Choose from curated design themes:
   * **Fairplay VIP Gold** (Black & Vivid Sunset Orange `#f36c21`)
   * **Midnight Luxury** (Dark Navy & Emerald Accents)
   * **Cyberpunk Neon** (Deep Violet & Hot Pink Glow)
   * **Sleek Minimalist** (Warm Monochromatic Obsidian)
3. Customize your Brand Name, Logo, and Tagline instantly without code changes.

---

## 17. Production Deployment & Infrastructure Matrix

| Service | Hosting Platform | Production URL |
|---|---|---|
| **Player Portal (PWA)** | Vercel Edge CDN | [Live Player Portal](https://sports-exchange-player-portal.vercel.app) |
| **Agent / Admin Portal** | Vercel Edge CDN | [Live Agent Portal](https://sports-exchange-agent-portal.vercel.app) |
| **Backend REST API** | Render Cloud | [Backend Healthcheck](https://sports-exchange-backend-j1aj.onrender.com/health) |
| **PostgreSQL Database** | Supabase Cloud | `mqxzzmwufakzaphujhtc.supabase.co` |
| **WebSocket Stream** | Socket.io / ZPlay | `wss://sports-exchange-backend-j1aj.onrender.com` |
| **GitHub Repository** | GitHub | [Warriorlegacy/Sports_Betting_Specifications](https://github.com/Warriorlegacy/Sports_Betting_Specifications) |

---

*Architected and Engineered by **Piyush Raj Singh** • 2026*
