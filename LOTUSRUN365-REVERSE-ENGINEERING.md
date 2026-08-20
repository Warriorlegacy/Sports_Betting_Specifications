# Lotusrun365.com — Reverse Engineering Report

Reversed from live scrape (Firecrawl rendered HTML/markdown + raw bundles/CSS), Aug 20 2026.
Evidence dumps in `.firecrawl/` (`lotus-run-home.json`, `lotus-match.json`, `lotus-main.js`, `lotus-styles.css`, `lotus-api.js`, raw HTML).

---

## 1. Verdict

Lotusrun365.com is a **third, distinct white-label exchange platform** — different vendor and
different stack from both Rudra888 (React/Vite/MySportsFeed) and FairplayVip (Vue/hurry2):

- **Angular SPA** (classic Angular CLI build: `runtime.*.js`, `polyfills.*.js`, `main.*.js`)
- **Bootstrap 4 + jQuery** admin-style shell (metisMenu, slimscroll, slicknav, owl.carousel, Swiper 9, FontAwesome)
- Backend API: **`api.datafairplay.in`** — the **DataFairPlay** exchange engine (a known Indian exchange backend vendor)
- Odds/feed data: **Betfair-style** feed (horse silks from `cdnbf.net` = Betfair CDN; premium odds via `premiumodds.cc`)
- Realtime: **Pusher** (`js.pusher.com`) + **SockJS** + native WebSocket
- Part of a larger white-label cluster: same code powers 100panel.com, reddypanel.com, rolexpanel.win (assets on speedcdn.io)

Like the other two, this is a proprietary SaaS template — **no OSS license**, licensed per-brand.

---

## 2. Tech Stack (evidence)

| Layer | Technology |
|---|---|
| Framework | **Angular** (AngularZone, AngularEvents, AngularTestability, RxJS) |
| Build | Angular CLI / webpack — runtime, polyfills, scripts, main chunks, hashed |
| Styling | **Bootstrap 4** (bootstrap.min.css + popper + jQuery), custom theme CSS, inline `background-color: rgb(3,76,111)` |
| UI plugins | metisMenu, jQuery slimscroll, slicknav, Owl Carousel, Swiper 9, FontAwesome, custom icon font (`apl-*` classes) |
| HTTP | Angular HttpClient |
| Realtime | **Pusher** (`js.pusher.com`), SockJS, native WebSocket (`webSocketUrl` config) |
| Forms/security | Google **reCAPTCHA** (`assets/js/api.js` = recaptcha loader) |
| Fonts | **Lato** (300/400/700 self-hosted @font-face) |
| Layout | Desktop-first (`body{min-width:992px}`) + separate mobile routes `/m/...` |
| Brand color | **Dark teal-navy `#034C6F`** (rgb 3,76,111) header/nav; Bootstrap palette elsewhere |

### Backend / data partners
- `https://api.datafairplay.in` — main exchange API
- `https://premiumodds.cc/score/...` — premium odds stream
- `https://content-cache.cdnbf.net/feeds_images/Horses/SilkColours/` — Betfair horse silks
- `https://speedcdn.io/assets/logos/` — shared logo CDN
- Sibling panels: `100panel.com`, `reddypanel.com`, `rolexpanel.win`
- Support: Telegram (lotus365officialai / lotus365servicee / Lotus365), WhatsApp wa.link links, Instagram (lotus365bookofficial___)

---

## 3. Route Map

| Route | Page |
|---|---|
| `/dashboard` | Desktop home |
| `/game-list/{sportId}` | Sport list (sport id: cricket=4, football=1, tennis=2, casino=99998, sportsbook=99991, horse=7, greyhound=4339, binary=99990, kabaddi=99994, politics=2378961, basketball=7522, baseball=7511, table-tennis=20, volleyball=998917, ice-hockey=7524, rugby=5, mma=26420387, darts=3503, futsal=29, genius=99989) |
| `/game-detail/{matchId}` | **Match page** (odds ladder + fancy markets) |
| `/sports-book/99991` | Fixed-odds sportsbook |
| `/multi-market` | Favourites / custom markets |
| `/signup`, `/dashboard`, `/m/...` | Auth + **mobile sub-site** (`/m/dashboard`, `/m/reports/account-statement`, `/m/reports/unsettled-bets`, `/m/change-password`, `/m/settings`) |

---

## 4. Homepage UI — Section Inventory

1. **Header bar**: logo, live clock (`Aug 20, 2026 11:28:57 +05:30`), Log in / Sign up
2. **Sports sidebar** (left): hierarchical `sport-menu__item` with `has-submenu` / `submenu-header` /
   `submenu` — 21 sports incl. Cricket, Football, Tennis, Casino, Sports book, Horse/Greyhound Racing,
   Other, Binary, Kabaddi, Politics, Basketball, Baseball, Table Tennis, Volleyball, Ice Hockey, Rugby,
   MMA, Darts, Futsal, Genius
3. **Sport content area** (`game-list`): grouped by competition → match lists with `add-pin` (favourite)
   + `event-name`; competitions: Caribbean Premier League, Test Matches, SRL (Simulated Reality League)
   virtual cricket (T20/PSL/BBL/IPL/SA20), County Championship, TNPL, UPPL, Kerala League, etc.
4. **Exchange games strip**: `exchangeGames-item` cards with sport images, `casino-item` casino tiles,
   `popularGames-item`, banner slider (`slider_banner__item_img`), promotions (`promotion-button__content`)
5. **Right-side menu**: `right-side-menu__item` (Favourites, My markets, account links)
6. **Mobile drawer**: `/m/...` links — Account Statement, Unsettled Bets, Change Password, Stake Setting, Rules

---

## 5. Match Page UI (game-detail) — the Exchange Core

1. **Breadcrumb**: Home › Cricket › [competition] › previous link
2. **Match header**: `England v Pakistan` + kickoff timestamp
3. **Match Odds market** — full **6-level price depth ladder** per runner:
   - England: `1.09/26.9k · 1.10/34.8k · 1.11/32.7k · 1.12/28.2k · 1.13/18.2k · 1.14/6.4k`
   - Class names: `odds` / `size` / `show-size` cells, `.back` / `.lay` / `.back2` (second-level), `selection-pnl`, `market-name`
   - Header shows **Min: - Max: 1** stake limits
4. **BOOKMAKER market**: 2-price bookmaker-style grid (`10/100k`, `13/100k`), `SUSPENDED` flags on dead runners, Min 100 / Max 100k
5. **MINI BOOKMAKER** market (Min 100 / Max 50k)
6. **Promo banners** between markets ("THE HIGHEST ODDS ALLOWED IN OUR EXCHANGE", "Advance Toss & Fancy Bets Started", "DUTCH GRAND PRIX – MARKET STARTED")
7. **FANCY markets** (Indian session betting) — tabs: `all | sessions | w/p market | odd/even | xtra market | meter | khadda | Over by Over`
   - Rows like: `30 Over Runs ENG — 130/132 — Min Bet: 100 Max Bet: 25k`
   - Classes: `fdo_one`, `fancy_data_odds`, `fancy_min_max_div`, `max-liability`
8. **Betslip**: odds ladder (`apl-icon-custom-ladder`), Back/Lay selection, stake entry, max liability display

---

## 6. Design System

| Token | Value | Use |
|---|---|---|
| Brand primary | `#034C6F` (rgb 3,76,111) | Header/nav background |
| Bootstrap 4 base | `#007bff` primary, `#28a745` success, `#dc3545` danger, `#ffc107` warning, `#17a2b8` info, `#343a40` dark | Forms, badges, buttons |
| Neutrals | `#212529`, `#6c757d`, `#f8f9fa`, `#dee2e6` | Text, muted, light surfaces |
| Font | **Lato** (300/400/700) | Global UI |
| Layout | Desktop-first (min 992px), responsive via Bootstrap grid; mobile lives under `/m/` | Two front-ends, one backend |
| Odds grid | price ladder columns (`.odds`/`.size`), Back vs Lay vs Back2 cell tiers | Exchange depth display |
| Icons | FontAwesome + custom `apl-icon-*` font | Menu, favourites, ladder |

---

## 7. Data / Realtime Flow

```
Angular SPA ── HttpClient ──> api.datafairplay.in  (events, odds, fancy, wallet, bets)
     └── Pusher + SockJS/WebSocket ──> live odds ladder & fancy updates (webSocketUrl)
     └── premiumodds.cc ──> premium odds feed
```
- Match ladders update in place (6-depth per side), SUSPENDED states toggle cells
- Fancy markets stream line movements (e.g., 130/132) with per-market min/max bet
- Horse silks pulled from Betfair CDN; SRL virtual cricket via simulated feeds

---

## 8. Key Differences vs Rudra888 / FairplayVip

| | Rudra888 | FairplayVip | Lotusrun365 |
|---|---|---|---|
| Framework | React 18 / Vite | Vue 2 / webpack | **Angular / webpack** |
| Styling | Tailwind | Bootstrap 5 | **Bootstrap 4 + jQuery** |
| Realtime | STOMP | Socket.IO | **Pusher + SockJS** |
| Backend | MySportsFeed | hurry2 | **DataFairPlay** |
| Odds UI | 2-col back/lay | 2-col back/lay | **6-level depth ladder** |
| Special markets | — | — | **Fancy/session betting** |
| Mobile | responsive | responsive + APK | **separate /m/ sub-app** |
| Languages | EN | 9 langs | EN |
| Theme | dark | light/dark | light, teal `#034C6F` |

---

## 9. How to Rebuild / Embed This Design

1. **Scaffold**: Angular CLI + Bootstrap 4 + RxJS + HttpClient + Pusher/SockJS client
2. **Theme**: set brand color `#034C6F`, Lato, Bootstrap grid; sidebar sport-menu with submenu tree
3. **Components**: Header(logo+clock+auth) → SportSidebar(hierarchical) → Competition groups → 
   MatchList(add-pin favourites) → **MatchPage** (6-level price ladders, Bookmaker + Mini Bookmaker grids,
   SUSPENDED states, min/max per market) → **Fancy market tabs** (sessions/w-p/odd-even/xtra/meter/khadda/over-by-over) → Betslip
4. **Mobile**: separate `/m/...` routes (dashboard, reports, settings) — cheaper than full responsive redesign
5. **Realtime**: Pusher channels per event; stream ladder + fancy lines
6. **Backend**: exchange engine (matching, settlement) + DataFairPlay-style API contract

---

## 10. Licensing

- **No OSS license** — Angular shell, custom CSS, `apl-*` icon font, and all assets are proprietary to the DataFairPlay / lotus365 operator cluster. Do **not** copy bundle files or assets.
- **Data**: feeds (premiumodds, Betfair silks, SRL virtual) are licensed; scraping violates ToS.
- **Legal embedding paths**: buy a white-label deal from DataFairPlay-style vendors (they provide backend + feed + brand skin), or **clean-room** your own Angular frontend from this spec (§9) with licensed feeds.
- India: no licensed online-betting regime — get local counsel before taking real money.