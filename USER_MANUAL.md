# 📖 Official User Manual & Operations Guide
## Ultra-High Performance Sports Exchange, Live TV & Gaming Portal

Welcome to the **Official User Manual** for your comprehensive Sports Betting Exchange, Cricket Fancy Terminal, Live TV Streaming, Indian Worli Matka Bazar, and Live Dealer Casino Platform.

---

## 📑 Table of Contents
1. [Platform Architecture & Core Overview](#1-platform-architecture--core-overview)
2. [Navigation & Interface Layout](#2-navigation--interface-layout)
3. [Sportsbook & In-Play Match Betting](#3-sportsbook--in-play-match-betting)
4. [P2P Betting Exchange (Betfair Back & Lay Ladder)](#4-p2p-betting-exchange-betfair-back--lay-ladder)
5. [Cricket Fancy & Session Betting](#5-cricket-fancy--session-betting)
6. [Live Match TV Broadcast & 3D Sportradar Center](#6-live-match-tv-broadcast--3d-sportradar-center)
7. [Same-Game Parlay (SGP) Builder](#7-same-game-parlay-sgp-builder)
8. [Indian Worli Matka Bazar (23 Live Bazars)](#8-indian-worli-matka-bazar-23-live-bazars)
9. [Live Dealer Casino & Indian Desi Games](#9-live-dealer-casino--indian-desi-games)
10. [Early Cash Out & Risk Management Terminal](#10-early-cash-out--risk-management-terminal)
11. [Cashier & Instant Auto-UTR UPI Banking](#11-cashier--instant-auto-utr-upi-banking)
12. [Theme Customizer & White-Label Controls](#12-theme-customizer--white-label-controls)

---

## 1. Platform Architecture & Core Overview

Your platform is built on an enterprise 9-microservice architecture delivering:
* **348+ Live In-Play Matches 24/7**: Cricket, Football, Tennis, Basketball, Baseball, Table Tennis, NFL, and Esports.
* **Sub-Second WebSocket Price Ticks**: Millisecond Back/Lay depth updates streamed directly via WebSocket (`wss://zplay1.in`).
* **Embedded High-Definition Live Match TV**: Live video streams (`vid.dreamcasino.live`) and 3D radar scoreboards (`scorecard.oddstrad.com`).
* **Indian Worli Matka Hub**: 23 active markets with authentic 9x–700x payout multipliers.
* **Live Dealer Casino**: Real HD live tables from Evolution and Ezugi (*Andar Bahar, Teen Patti, Lightning Roulette, Crazy Time*).
* **Instant Auto-UTR UPI Deposit**: Automated 12-digit UTR ledger matching in 5 seconds.

---

## 2. Navigation & Interface Layout

The top navigation header provides instant one-click switching across all core modules:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ [BRAND]   [Activity Sportsbook]  [Layers P2P Exchange]  [🎰 Matka]  [🎲 Live Casino]  [💰 Cash Out]  [📜 My Bets] │
│ ───────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│ 🏏 Cricket  ⚽ Football  🎾 Tennis  🏀 Basketball  ⚾ Baseball  🏓 Table Tennis  🏈 NFL  🎮 Esports   [₹ Balance]  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Top Navigation Modes:
* **Sportsbook**: Comprehensive multi-market sports book covering 348+ fixtures.
* **P2P Exchange**: Authentic Betfair-grade Back/Lay ladders with liquidity depth.
* **Matka Bazar**: 23 Indian Matka markets (Kalyan, Milan, Desawar, Sridevi, Rajdhani).
* **Live Casino**: Evolution & Ezugi live tables (Andar Bahar, Teen Patti, Roulette).
* **Cash Out**: Early settlement manager with automated threshold execution.
* **My Bets**: Active bets, settlement history, and open liability statements.

---

## 3. Sportsbook & In-Play Match Betting

### Browsing Fixtures
1. Use the **Sport Filter Bar** to select your sport (*Cricket, Football, Tennis, etc.*).
2. Use the **Date Strip** to view *Today's Matches*, *Tomorrow*, or *Upcoming*.
3. Click any match card to open the **Full Match Center & Market Hub**.

### Adding Selections to the Universal Bet Slip
1. Click any odds button (*Home, Draw, Away, Over/Under, Handicap*).
2. The selection appears immediately in the **Universal Bet Slip** on the right side.
3. Select your quick stake (₹100, ₹500, ₹1,000, ₹5,000, or custom amount).
4. Review your **Potential Win** calculation and click **Place Bet**.

---

## 4. P2P Betting Exchange (Betfair Back & Lay Ladder)

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

## 5. Cricket Fancy & Session Betting

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

## 6. Live Match TV Broadcast & 3D Sportradar Center

Watch live HD video streams directly inside the betting hub without leaving the page:

1. Click the **📺 Live TV & Radar** tab in any match hub.
2. **📺 Live TV Stream**: Direct CDN video stream with sub-second delay.
3. **📊 3D Sportradar Tracker**: Real-time interactive pitch visualizer showing ball location, possession attack phases, wagon wheels, and live stats.

---

## 7. Same-Game Parlay (SGP) Builder

Combine multiple markets from the same match into a single high-payout accumulator:
1. Click the **Sparkles Same-Game Parlay (SGP)** tab in the match hub.
2. Select your correlated legs (e.g. *Match Winner + Total Goals Over 2.5 + Player to Score*).
3. The automated correlation engine calculates the combined multiplier rate.
4. Enter your stake and place your combined SGP ticket.

---

## 8. Indian Worli Matka Bazar (23 Live Bazars)

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

### How to Place a Matka Bet:
1. Click **🎰 Matka Bazar** in the top navigation.
2. Select your desired market card (e.g., **KALYAN**).
3. Check the **Open & Close Bids** countdown timer.
4. Select **Single**, **Jodi**, or **Patti** and enter your chosen number.
5. Select your stake (₹100, ₹500, ₹1000, ₹5000) and click **Place Bid**.
6. Results are automatically declared with instant balance credit.

---

## 9. Live Dealer Casino & Indian Desi Games

Play 24/7 with real live interactive dealers in Hindi and English:
* **Super Andar Bahar Live** (Evolution)
* **Teen Patti 20-20 Live** (Ezugi)
* **Dragon Tiger Live** (Evolution)
* **Lightning Roulette (500x Multipliers)** (Evolution)
* **Crazy Time Game Show** (Evolution)
* **Namaste Hindi Roulette** (Ezugi)
* **Speed Baccarat VIP** (Pragmatic Play Live)
* **Infinite Blackjack** (Evolution)

### How to Play:
1. Click **🎲 Live Casino** in the top navigation.
2. Filter by *Indian Desi Games, Live Roulette, Cards, or Game Shows*.
3. Click **Launch Live Table** to join the live dealer room.

---

## 10. Early Cash Out & Risk Management Terminal

Lock in profits or minimize losses before the final whistle:
1. Navigate to the **💰 Cash Out** tab in the top navigation.
2. View your active bets with real-time dynamic cash out values computed by the in-play odds engine.
3. **Instant Cash Out**: Click **Cash Out ₹X,XXX** for immediate settlement.
4. **Auto-Cash Out**: Set a target threshold value; the system will automatically execute the cash out when the market reaches your target.

---

## 11. Cashier & Instant Auto-UTR UPI Banking

### Instant Deposit via UPI (GPay / PhonePe / Paytm / BHIM)
1. Click the **Deposit** button or **Cashier** icon in the header.
2. Select **UPI Instant Deposit** and choose your amount (e.g., ₹2,500).
3. Scan the dynamic **UPI QR Code** using any UPI app.
4. After payment, copy the **12-digit UPI UTR / Reference Number** from your payment receipt.
5. Paste the UTR into the verification box and click **Submit UTR**.
6. The automated matcher validates the transaction and **credits your balance in 5 seconds**!

### Crypto & Bank Withdrawals
1. Switch to the **Withdraw** tab in the Cashier.
2. Select **UPI / Bank IMPS** or **USDT (TRC20 / BEP20)**.
3. Enter your UPI ID, Bank details, or Crypto Wallet Address.
4. Enter the amount and click **Request Withdrawal**.

---

## 12. Theme Customizer & White-Label Controls

Customize the entire visual identity of your portal in real time:
1. Click the **Palette (Theme)** icon in the header.
2. Choose from curated design themes:
   * **Midnight Luxury** (Dark Navy & Emerald Accents)
   * **Cyberpunk Neon** (Deep Violet & Hot Pink Glow)
   * **Sleek Minimalist** (Warm Monochromatic Obsidian)
3. Customize your Brand Name, Logo, and Tagline instantly without code changes.

---

## 🌟 Support & System Health
* **Live System Status**: All 348+ exchange feeds, live WebSocket broadcasts, and payment gateways operate 24/7/365.
* **Production API Telemetry**: [https://sports-exchange-backend-j1aj.onrender.com/api/markets/live/telemetry](https://sports-exchange-backend-j1aj.onrender.com/api/markets/live/telemetry)
