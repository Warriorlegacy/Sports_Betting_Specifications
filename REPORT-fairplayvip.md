# FairplayVIP (fairplayvip.in) - Reverse Engineering Report

**Date:** 2026-08-17 | **Target:** https://www.fairplayvip.in | **Type:** Sports Betting Exchange + Matka + Fantasy + Casino SPA

---

## 1. Executive Summary

fairplayvip.in is a **white-label betting exchange** (Betfair-style Back/Lay) built on the **ClickBetExch / hurry2.com** platform ("hurry2" is the SaaS vendor; the codebase itself brands announcements as "ClickBetExch"). It runs as a Vue 3 SPA (no SSR) served from Amazon S3 via CloudFront, backed by **9 separate microservice APIs** plus a Socket.io websocket feed. Operator per T&Cs: **Win Ventures NV (Curacao)**.

It is one of **two active domains** on the same site record (the other is `fastplay.me`).

---

## 2. Infrastructure & Hosting

| Layer | Value |
|---|---|
| Frontend host | `https://www.fairplayvip.in` (S3 origin, CloudFront CDN) |
| Asset CDN | `https://click22frnt.hurry2.com/templates/fairplayexch/assets/` |
| Static assets (logos, apk, payment images) | `https://assets3.hurry2.com` (S3) |
| App bundle | `assets/index-Gfg5Ol3s.js` (3,131,505 bytes) |
| Framework | Vue 3 + Vue Router + Vuex/Pinia, axios (XSRF-enabled), socket.io-client, moment, SheetJS, jsPDF |
| SEO | No SSR; robots.txt/sitemap.xml return the same HTML shell; `__SSR_SEO__` hook exists for static SEO pages |
| Site settings API | `GET https://click21.hurry2.com/api/site-settings?domain=www.fairplayvip.in` (public, no auth) |
| Version check | `GET https://click21.hurry2.com/api/site-status-version?domain=...` -> `version: 21991`, maintenance flag |

### Site config highlights (from `api/site-settings`)
- `template_name: "fairplay"`, `business_type: 2`, `version: 21991`, `login_option: 1`
- Bonuses: **5% welcome bonus on register, 3% bonus on every deposit**
- APK: `https://assets3.hurry2.com/site_apk/4516fairplayvip.apk` (200 OK)
- Languages (9): English, Hindi, Kannada, Tamil, Telugu, Gujrati, Marathi, Urdu, Russian (JSON translation files `language/en1782844769.json` etc.)
- Country: India only (`IN`, +91)
- Support: WhatsApp **+919038629155**
- Branding: primary `#f04c44`, header `#054146` (admin-injectable CSS - per-whitelabel theming)
- Announcement banner mentions **ClickBetExch** -> vendor identity
- Sub-domains: `fairplayvip.in` (id 487), `fastplay.me` (id 1279)
- Features: `trade_bet: 1`, `back_only: 0`, `turbo_cashout: 1`, `affiliate_phone: 0`

---

## 3. API Architecture (9 services)

All services use axios with base URLs; response interceptor maps HTTP errors (422 -> validation details).

| Service | Base URL | Open (no auth) endpoints |
|---|---|---|
| **user** | `https://click21.hurry2.com` | `/api/site-settings`, `/api/site-status-version`, `/api/site-rules` |
| **sports** | `https://central.zplay1.in/pb/api/` | `v1/sports/management/getSport`, `v1/events/matches/:sport_id`, `v1/events/matches/all`, `v1/events/matches/inplay`, `v1/events/matchDetails/:event_id`, `v1/events/findByIds`, `v1/events/count`, `v1/events/sports/all/?day=today|tomorrow|after_tomorrow|upcoming`, `v1/events/completed-events`, `v1/events/market-matches/:id?type=ten_minute_market|up_down_market`, `v1/events/matches/inplay/pool`, `v1/worli/public/matches`, `v1/worli/public/matches/:id/all/markets`, `v1/public/racing/countrywise/matches/:sportId`, `v1/public/racing/race-markets/all/:eventId` |
| **race** | `https://central.zplay1.in/api/` | `v1/public/racing/countrywise/matches/:sportId` |
| **fantasy** | `https://zplay1.in/` | `/api/v1/worli/public/matches` (alias), rest auth-gated |
| **pool** | `https://pool-main.zplay1.in` | `GET /` -> `{"msg":"ok"}`; `/api/*` auth-gated (401) |
| **bonus** | `https://bonus.zplay1.in` | auth-gated |
| **notification** | `https://new-notification.zplay1.in` | auth-gated |
| **wallet** | `https://api.transaction1.live/api/v1` | auth-gated (401 `{"message":"Token Not Found"}`) |
| **chat** | `https://api.allchats.in` | custom chat app (HTML app at root) |

**Socket.io**: `https://zplay1.in` with `transports:["websocket"]`. Client emits `"sub"` (event_id or market_id) / `"leave"`; server pushes Laravel-broadcast events:
- `App\Events\SportsBroadcastData`
- `App\Events\MarketBroadcastData`
- `App\Events\BroadcastBookmaker`
- `App\Events\BroadcastFancy`

---

## 4. Sports Betting (Exchange)

- **Back/Lay exchange** with in-play trading: `trade_bet: 1`, `accept_any_odds: 1`, `back_only: 0`, `bet_delay: 6`, min stake 100 (INR), `odd_limit: "3"`.
- **Sports (24)** via `v1/sports/management/getSport`: cricket (rank 1), tennis (4), soccer (3), horse-racing, greyhound-racing, baseball, basketball, ice-hockey, American football, volleyball, handball, snooker, table tennis, esports, MMA, gaelic games, Australian Rules, kabaddi + custom: FIFA CUP WINNER, WINNER CUP, ELECTION (2 variants), KABADDI.
- **Market types**: Match Odds + sorted markets, Bookmaker markets, Fancies (premium fancies), Up/Down markets, 10-Minute markets, pools, exclusive markets.
- **Match details** return `matchOddData[]` with markets `{mid:"-1.261181735", st:"OPEN", runners:[{sid, s:"ACTIVE", ex:{b:[{p:1.7,s:"153.00"}], l:[]}}]}` - Betfair-style book/lay.
- **Scorecards / live TV**:
  - `https://scorecard.oddstrad.com/get-scorecard-iframe/{sportId}/{eventId}/{sportsradar_id}` (manual scorecard fallback)
  - Live TV: `https://vid.dreamcasino.live/GetAPI.html?MatchID={eventId}`
  - Tennis 10-min market UI: `https://tenminui-prod.unicon.live/{market_id}&runnerid={sid}`
  - Data provider: **Sportsradar** (`sportsradar_id`, `sport_radar_sport_id`)
- **Sportsbook (fixed odds)**: `get-sap-sportsbook-url` (SAP sportsbook integration; auth-gated).

---

## 5. Matka / Worli

Public, unauthenticated:
- `GET https://zplay1.in/api/v1/worli/public/matches` -> all markets (22+ live: DESAWAR, KALYAN, MADHUR DAY/NIGHT, MILAN DAY/NIGHT, TIME BAZAR, MAIN BAZAR, GALI, GAZIABAD, KARNATAKA DAY, SRIDEVI, RAJA, PRABHAT, KALYAN NIGHT, RAJDHANI NIGHT, etc.)
- `GET .../v1/worli/public/matches/:id/all/markets` -> market detail with rates/stakes:
  - `single` (rate 9, stake 5000), `jodi` (90, 2000), `single patti` (140, 2000), `double patti` (280, 1000), `triple patti` (700, 500)
- Fields: `open_bids`/`close_bids`, suspend flags, `closed_date`/`closed_day`, `yesterdayResults`/`todayResults`, `category_name`: MATKA MARKET / DELHI MARKET
- User-side (auth): `api/get-matka-single-bets/:id`, `api/save-worli-matka-bet`

---

## 6. Casino & Games

- **Live Casino**: Evolution Gaming, Ezugi, Live Card, Poker (`api/get-live-poker-url/:game_code`), Dream Casino (`api/dreamcasino/load-game/:game_code/:sm_id`), Universe Casino (`api/universe/`)
- **Slots**: PlaySon, Spribe (crash games like Aviator), custom games, Lotus casino menu path
- `api/get-casino-games` (auth); `api/load-third-party-url` for 3rd-party game launches
- Pages: `/games/evolution`, `/games/live-casino`, `/games/live-card`, `/games/slot-games`

---

## 7. Cricket Fight (Fantasy)

- Teams: **min 1, max 6 players**; team bet + player bets (`add-my-team`, `update-my-teamname`, `reset-my-team`, `get-my-contests`, `get-match-teams-and-bet-details`, `place-bet`, `cancel-bet`, `get-matches-list`, `get-remembered-matches`)
- Routes: `/cricket-fight/:id`, `/cricket-fight/:id/place-bet`, `/cricket-fight/my-contests`

---

## 8. Auth & Account

- **Login**: password (`api/user-login`), OTP (`api/send-otp`, `api/login-with-otp`, `api/send-otp-phone`, `api/update-phone`), **demo login** (`api/demo-user`), WhatsApp contact
- **Registration**: `api/registration` (or "Get your ready-made ID from whatsapp")
- **2FA**: TOTP-style - `/api/get-2fa-code`, `/api/enable-2fa`, `/api/edit-2fa`, `/api/disable-2fa`, `/api/set-2fa-disable-code`, `/api/user-2fa-login`, `/api/update-2fa-device`, `/api/check-2fa-status`; Google Authenticator setup flow
- Password reset: `api/reset-forgot-password`, `api/change-my-password`
- Session: `api/auth-refresh`, `api/logout`, cookies, `activity-logs`

---

## 9. Wallet / Payments

- Wallet service `api.transaction1.live/api/v1`: `client/config`, `client/client-account-transaction`, `client/update-txn-password`, `client/transaction-password/send-otp`, `client/transaction-password/verify-otp`, `client/cancel-transaction-request/:transactionId`, `TWO_FA_VERIFY`, `client/client-withdrawal-request`
- **Deposit**: UPI + Bank transfer with manual proof upload. Helpers: `WWW.upitobank.net` (UPI->Bank) and `www.banktobank.info` (Bank->Bank)
- **Payment gateway iframes**: `api/get-payment-getway-iframe-url` (wallet) and `api/get-payment-getway-token` (user) - token-based gateway launch
- **Auto-UTR**: `api/user/get-auto-utr` & `api/wallet/get-auto-utr` (auto UPI transaction reference)
- **Withdrawals**: `client/client-withdrawal-request`, OTP-protected (`client/transaction-password/*`), 2FA verify
- Wallet switch: `api/wallet-switch` (main wallet vs pool wallet)
- Bank/QR assets: `manageids/banks/`, `bank-account-qrcode/`, `payment-methods/` on assets3.hurry2.com

---

## 10. Reports & Statements

- `api/get-statements`, `api/get-statements-info`
- `api/get-user-pl-info`, `api/get-profit-loss-detail`, `api/get-user-match-statements`, `api/get-user-pl-statements`
- `api/get-my-bets`, `api/get-open-bets`, `api/my-markets`, `api/open-bets-event-listing`
- `api/get-all-event-book-and-fancy-exposures-by-event-id`, `api/get-event-book-and-fancy-exposures-by-event-id/:matchId`, `api/get-fancy-book`, `api/get-market-analys-data`
- Cashout: `api/cashout` (turbo_cashout enabled)

---

## 11. Bonus / Promotions / Affiliates

- Spin wheel: `/api/spin-wheels/user-wheel-info`, `/api/spin-wheels/spin`, `/api/spin-wheels/get-wheel-logs`
- Bonus service (`bonus.zplay1.in`): `v1/get-bonus-log`, `v1/get-bonus-log-details`, `v1/get-user-locked-bonus`, `v1/get-locked-earn-bonus`
- User-side: `api/user-bonus-statement/:bonusType`, `api/redeem-user-bonus`, `api/claim-bonus`, `api/change-user-bonus`
- **Affiliate**: `api/get-affiliate-dashboard`, `api/add-user`, `api/get-affiliate-registered-users-count`, `api/get-referred-users`, `api/get-affiliate-profit-loss-events`, page `/affiliate/dashboard`
- **Pools**: `api/get-pools`, `api/pool-leader-board`, `api/pool-bets`, `api/pool-winners`, `api/pool-result`, `api/pool-participant-list`, `api/join-pool`

---

## 12. Notifications & Chat

- Notification service: auth-gated; `api/subscribe-notification` with `{deviceData, domainName}` (web push)
- Chat: `https://api.allchats.in` custom chat app; user service: `api/fetch-user-messages/:id`, `api/send-message`, `api/editMessage`

---

## 13. Legal & Compliance

- **Operator:** Win Ventures NV, Curacao (per Terms & Conditions)
- Pages: `/terms-and-conditions`, `/static/TERM_CONDITIONS`, `/static/PRIVACY_POLICY`, `/static/ABOUT_US`, `/responsible-gambling` (self-assessment, deposit limits, take-a-break, activity statement, identity checks), `/rules-regulations` (general + up/down market rules)
- Site rules API: `api/get-site-rules` -> types: `General`, `UpdownMarket`
- India-only; 2FA + txn-password for withdrawals; activity logs

---

## 14. Sitemap (30 URLs)

`/`, `/matka`, `/markets`, `/favourites`, `/faqs`, `/login`, `/soccer-betting`, `/cricket-fight`, `/affiliate/dashboard`, `/games/evolution`, `/games/live-casino`, `/games/live-card`, `/games/slot-games`, `/responsible-gambling`, `/static/PRIVACY_POLICY`, `/static/ABOUT_US`, `/sign-up`, `/reset-password`, `/sports-book`, `/rules-regulations`, `/completed-events`, `/sports/soccer/1`, `/sports/tennis/2`, `/sports/cricket/4`, `/sports/baseball/7511`, `/sports/volleyball/998917`, `/racing-category/HORSE_RACE`, `/online-cricket-betting`, `/terms-and-conditions`, `/fairplayvip.in`

SEO landing pages: `/soccer-betting`, `/online-cricket-betting`.

---

## 15. Verified Live Probes (unauthenticated, 200 OK)

| Endpoint | Result |
|---|---|
| `central.zplay1.in/pb/api/v1/sports/management/getSport` | 24 sports w/ icons, ranks |
| `central.zplay1.in/pb/api/v1/events/matches/all` | live matches w/ market_id, sportsradar ids |
| `central.zplay1.in/pb/api/v1/events/matchDetails/35947380` | full market/runner/odds data (tennis) |
| `central.zplay1.in/pb/api/v1/events/matches/inplay` | in-play list |
| `central.zplay1.in/pb/api/v1/events/sports/all/?day=today` | today's sports (today/tomorrow/after_tomorrow/upcoming) |
| `central.zplay1.in/pb/api/v1/events/completed-events?sport_id=4&from=...&to=...` | completed events |
| `zplay1.in/api/v1/worli/public/matches` | 22 Matka markets w/ rates/stakes |
| `zplay1.in/api/v1/worli/public/matches/1/all/markets` | market detail |
| `central.zplay1.in/api/v1/public/racing/countrywise/matches/7` | horse racing by country/venue (AU -> Ballarat...) |
| `click21.hurry2.com/api/site-settings?domain=www.fairplayvip.in` | full site config |

Auth-required (401/404 without token): wallet `client/*`, pool `api/*`, bonus `v1/*`, fantasy `place-bet`, notification APIs.

---

## 16. Tech Stack Summary

- Frontend: Vue 3 SPA, ~40 lazy-loaded chunks (Login, SignUp, Sports, PlaceBet, MatchDetails, MatkaDetails, CricketFight, SpinWheel, ProfitLoss, ReferEarn, Reports, Bets, CompletedEvents, StakeSettings, TwoFaPageHeader, AndroidBanner, UsersList, ...)
- Backend: Laravel (event classes `App\Events\*`), token auth ("Token has been expired")
- Real-time: socket.io websocket -> Laravel broadcasts
- Payments: tokenized gateway iframe + manual UPI/bank with proof upload + auto-UTR
- White-label vendor: **hurry2.com / ClickBetExch** (assets3.hurry2.com, click22frnt.hurry2.com)
- Live TV: vid.dreamcasino.live; Scorecards: oddstrad.com; 10-min tennis UI: unicon.live; Odds: Sportsradar

---

## Appendix A - Full API Path Map (from bundle)

**user** (`click21.hurry2.com`): `api/site-settings`, `api/user-info`, `api/auth-refresh`, `api/user-login`, `api/demo-user`, `api/logout`, `api/favorite-list`, `api/get-event-book-and-fancy-exposures-by-event-id/:matchId`, `api/save-bet`, `api/cashout`, `api/get-fancy-book`, `api/make-event-favorite`, `api/change-stake-values`, `api/get-payment-getway-iframe-url`, `api/get-casino-games`, `api/get-my-markets/:sport_type`, `api/load-third-party-url`, `api/get-site-rules`, `api/wallet-switch`, `api/send-otp`, `api/send-otp-phone`, `api/update-phone`, `api/login-with-otp`, `api/get-user-info`, `api/registration`, `api/reset-forgot-password`, `api/change-my-password`, `api/site-status-version`, `api/get-matka-single-bets/:id`, `api/save-worli-matka-bet`, `api/get-statements`, `api/get-statements-info`, `api/update-display-name`, `api/open-bets-event-listing`, `api/get-user-pl-info`, `api/get-profit-loss-detail`, `api/get-user-match-statements`, `api/get-user-pl-statements`, `api/get-live-poker-url/:game_code`, `api/dreamcasino/load-game/:game_code/:sm_id`, `api/universe/`, `api/fetch-user-messages/:id`, `api/send-message`, `api/editMessage`, `api/get-all-event-book-and-fancy-exposures-by-event-id`, `api/get-market-analys-data`, `api/get-my-bets`, `/api/activity-logs`, `api/my-markets`, `api/get-open-bets`, `api/searching-event/:searchKey`, `api/change-user-bonus`, `api/user-bonus-statement/:bonusType`, `api/redeem-user-bonus`, `api/get-referred-users`, `api/claim-bonus`, `api/join-pool`, `api/get-affiliate-dashboard`, `api/get-affiliate-profit-loss-events`, `api/add-user`, `api/get-affiliate-registered-users-count`, `api/get-payment-getway-token`, `api/get-id/wallet-withdraw`, `api/wallet/get-auto-utr`, `/api/get-2fa-code`, `/api/enable-2fa`, `/api/edit-2fa`, `/api/disable-2fa`, `/api/set-2fa-disable-code`, `/api/user-2fa-login`, `/api/update-2fa-device`, `/api/check-2fa-status`, `/api/spin-wheels/user-wheel-info`, `/api/spin-wheels/spin`, `/api/spin-wheels/get-wheel-logs`, `/api/user/get-auto-utr`

**sports** (`central.zplay1.in/pb/api/`): `v1/events/matches/:sport_id`, `v1/sports/management/getSport`, `v1/events/matches/all`, `v1/events/matchDetails/:event_id`, `v1/events/findByIds`, `v1/events/count`, `v1/events/matches/inplay`, `v1/events/sports/all`, `v1/events/matches/inplay/pool`, `v1/events/completed-events`, `v1/events/completed-events-details/:sportId`, `v1/events/market-matches/:id`, `/get-sap-sportsbook-url`, `/v1/worli/public/matches`, `/v1/worli/public/matches/:id/all/markets`

**fantasy** (`zplay1.in/`): `/get-matches-list`, `/get-match-bet-details`, `/get-match-teams-and-bet-details`, `/place-bet`, `/cancel-bet`, `/get-my-contests`, `/get-my-stakes`, `/get-remembered-matches`, `/add-match-reminder`, `/remove-match-reminder`, `/add-my-team`, `/reset-my-team`, `/update-my-stakes`, `/update-my-teamname`, `/get-setup-data`

**pool** (`pool-main.zplay1.in`): `api/get-pools`, `api/pool-leader-board`, `api/user-info`, `api/get-fancy-book`, `api/get-event-book-and-fancy-exposures-by-event-id/:matchId`, `api/get-all-event-book-and-fancy-exposures-by-event-id/:matchId`, `api/pool-bets`, `api/pool-winners`, `api/pool-result`, `api/pool-participant-list`

**bonus** (`bonus.zplay1.in`): `api/v1/get-bonus-log`, `api/v1/get-bonus-log-details`, `api/v1/get-user-locked-bonus`, `api/v1/get-locked-earn-bonus`

**race** (`central.zplay1.in/api/`): `v1/public/racing/countrywise/matches/:sportId`, `v1/public/racing/race-markets/all/:eventId`

**wallet** (`api.transaction1.live/api/v1`): `client/config`, `client/update-txn-password`, `client/client-account-transaction`, `client/transaction-password/send-otp`, `client/transaction-password/verify-otp`, `client/cancel-transaction-request/:transactionId`, `client/client-withdrawal-request`, `client/*` (withdrawal/2FA paths)

**chat** (`api.allchats.in`): custom chat app root; user-side message APIs above.

---

## Appendix B - Evidence Files

- `.firecrawl/app-bundle.js` - full 3.1MB app bundle
- `.firecrawl/chunk-*.js` - 9 route chunks downloaded
- `.firecrawl/site-settings.json` - full site config dump
- `.firecrawl/fairplayvip-map.json` - 30-URL sitemap
- `.firecrawl/p-*.md` - per-page Firecrawl scrapes
