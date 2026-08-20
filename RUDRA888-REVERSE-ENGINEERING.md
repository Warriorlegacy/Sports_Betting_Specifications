# Rudra888.in — Full Reverse Engineering Report

Reversed from live scrape (Firecrawl rendered HTML + raw bundle/CSS analysis), Aug 19 2026.

---

## 1. Executive Summary

Rudra888.in is **NOT a bespoke build**. It is a white-label skin of a shared, multi-tenant
**Betfair-style exchange** frontend produced by the vendor **MySportsFeed** (matching API domain
`api.mysportsfeed.io`). The exact same React codebase is deployed to **106+ brands** (King18,
HypexExch, ReddyAnna, Sky247, Lotus365, Amiri999, Fairplay369, etc.) — only the logo
(`/theme/{Brand}/title.png`) and domain change per brand.

- Frontend: **React 18 SPA built with Vite**, served from **CloudFront/S3**, fronted by **Cloudflare**
- Backend: separate multi-service API platform at `https://api.mysportsfeed.io/api/v1`
  (plus microservices: catalog, notification, reporting, space, scorecard, win)
- Real-time odds: **STOMP over WebSocket** (SockJS fallback) via `feed.mysportsfeed.io/hypex-ws`

---

## 2. Tech Stack (evidence-backed)

| Layer | Technology | Evidence |
|---|---|---|
| Framework | React **18.3.1** (client-side SPA) | `react-dom/client` `createRoot`; version string `18.3.1` in bundle |
| Build tool | **Vite** | Hashed `/assets/index-tE8Ig5mT.js`, `/assets/index-CWaHxjne.css`; Vite-style `parse5` comment |
| Styling | **Tailwind CSS** + custom CSS | `--tw-backdrop-*` CSS vars; utility classes (`w-full flex md:flex truncate snap-start`) |
| Icons | **Lucide React** | `lucide lucide-plus` classes |
| UI components | react-select, react-datepicker, react-toastify, slick-carousel | `css-7pg0cj-a11yText`, `react-datepicker__*`, `--toastify-*`, `font-family:slick` |
| State | **Redux Toolkit** + Redux | `redux-toolkit.js.org/Errors`, `REDUX_DEVTOOLS_EXTENSION_COMPOSE__` |
| HTTP | **Axios** | `AxiosError`, `AxiosHeaders` |
| Real-time | **@stomp/stompjs + SockJS** + native WebSocket | `stompClient`, `Stomp.over`, `SockJS`, `WEBSOCKET_URL`, `WEBSOCKET_URL_PUSH_NOTIFICATIONS` |
| Dates | Moment.js (+ moment-timezone), date-fns | `moment.tz.zoneExists`, date-fns doc link |
| Fonts | **Lato** (Google Fonts) + Roboto fallback | `<link>` in head; CSS `font-family:Lato` |
| Auth/3rd-party | Google OAuth (`accounts.google.com/gsi/client`), **Tawk.to** live chat, **Meta Pixel**, GA4 (`googletagmanager`), IP geolocation (`api.ipify.org`) | Head HTML + bundle |
| Hosting | CloudFront (S3 origin) + Cloudflare, HSTS, `x-amz-cf-pop: SIN3-P5` | Response headers |

Env/config vars in bundle: `WEBSOCKET_URL`, `WEBSOCKET_URL_PUSH_NOTIFICATIONS`, `VITE_*` build config.
Versioned libs seen: react 18.3.1, moment 2.30.1, etc.

### Backend microservices (bundled base URLs)
- `https://api.mysportsfeed.io/api/v1` — main API
- `https://catalog.*` — sports/market catalog
- `https://notification.*/push-notifications` — push notifications
- `https://reporting.*` — reports
- `https://space.*` — ? (space/avatar service)
- `https://scorewebapp.mysportsfeed.io/api/scorecard` + `https://api-genie.mysportsfeed.io/api/scorecard` — live scorecards
- `https://feed.mysportsfeed.io/hypex-ws` — STOMP realtime feed
- `https://win.mysportsfeed.io/` — bet settlement/win service
- `https://prod-cdn.*` — CDN

### Realtime topics (STOMP)
- `/topic/notifications/` — push alerts
- `/topic/rx_score/` — live score updates
- `/user/betting-currency`, `/user/referral-details`, `/user/admins` — user-scoped queues

### Branding / white-label mechanism
- 106 brand folders in the bundle: `theme/11cric247com/`, `theme/Rudra888In/`, `theme/Rudra888Com/`,
  `theme/Reddyanna234Com/`, `theme/Sky247Run/`, `theme/Amiri999Com/`, … each holding `title.png` + `favicon.png`
- Brand-specific Meta Pixel ID (e.g. `1060855083106772` for amiri999.com), gated by `hostname.includes(...)`
- Same UI, same routes, per-brand logo + colors applied at runtime.

---

## 3. SPA Route Map (React Router)

| Route | Page |
|---|---|
| `/home` | Home dashboard |
| `/multi-markets` | Multi-market board |
| `/exchange_sports` | Exchange landing |
| `/exchange_sports/:eventType` | Sport category (cricket, football, tennis, horserace, greyhound, politics, binary, kabaddi, tabletennis, inplay, top-matches) |
| `/exchange_sports/:eventType/:competition/:eventId/:eventInfo` | **Match page** (user's tennis URL) |
| `/exchange_sports/virtuals/...` | Virtual sports |
| `/sportsbook` | Sportsbook (fixed-odds) |
| `/casino`, `/casino/:provider`, `/casino?category=aviator\|slot games`, `/casino/mac88` | Casino lobby |
| `/binary` | Binary |
| `/greyhound`, `/account/*` (login, two-factor, otp, wallets, statement, my-bets), `/promotions`, `/game-rules` | Misc |

---

## 4. Homepage — UI Section Inventory (top to bottom)

1. **Utility bar**: live clock (GMT-04:00), search "search events", **Log In / Sign Up** buttons
2. **Header**: brand logo (`/theme/Rudra888In/title.png`), nav: **Home | Multi Markets**, hamburger
3. **Sports sidebar** (icon + label): Cricket, Sportsbook, Casino, Fantasy11 (NEW), Randora (NEW),
   Tennis, Football, Horse Racing, GreyHound, Basketball, Baseball, politics, Binary, kabaddi
4. **Sport tab strip**: Cricket · Football · Tennis · Horse Racing · Greyhound Racing · Sportsbook ·
   Casino · Aviator · Slot games · Binary · politics · Table Tennis · Basketball · Ice Hockey · Volleyball · kabaddi
5. **Game type tabs**: Popular | New Launch | Indian games | Roulette | AE Sexy | Slots | FANTASY & FUN
6. **Utility links**: Promotions · Game Rules · Change Language (English(EN))
7. **Sport sections** (per sport, with **InPlay | Live | Virtual | Premium** tabs):
   - **InPlay Cricket**: match cards e.g. *England vs Pakistan* — 3-way market showing
     back odds + matched volume (K) per runner + lay odds: `1.13/43546K | 28.00/33K | 10.50/191K` etc.
   - **Football**: ~25 matches with full 3-way (1X2) back/lay grid
   - **Tennis**: matchups with 2-way markets (e.g. Swiatek–Parry, Jodar–Cobolli)
   - **Table Tennis, Baseball, Binary** sections
8. **Casino Lobby** strip: Roulette / AE Sexy / Slots thumbnails
9. **Upcoming Events** section (Thursday/Friday fixtures, e.g. St. Lucia Kings vs Guyana Amazon Warriors)

### Match card anatomy (exchange-style)
`[Date/Time] [Team A] [Team B]` → row of price cells: **Back** (pink `#fd2954` in Betfair-blue convention is the
*lay* color on Betfair, but here pink = Back) and **Lay** (blue `#0495e3`) columns, each showing
price + live matched volume (e.g. `1.13 43546K`). Empty cell = no market.

---

## 5. Match (Tennis Exchange) Page — Section Inventory

1. **Breadcrumb**: `top matches > sports > tennis > previous`
2. **Match header**: `pernas, thiago agustin vs markovits, milan` + "Premium Market **MIN: 100 MAX: 100K**"
   (stake limits per market)
3. **Market accordion list** — each expandable, per-runner back/lay price+volume:
   - **Winner** (1.03 / 8.00)
   - **Game handicap** (±4.5)
   - **Set handicap** (±1.5)
   - **Total games** (under/over 19.5)
   - **Odd/even games**
   - **Correct score** (2:0, 2:1, 1:2, 0:2)
   - **2nd set – winner**, **2nd set – total games**
   - **Total sets** (over/under 2.5)
4. **Match stats widgets**: scoreboard, scorecards (live via `/topic/rx_score/`)
5. **Betslip panel** (bottom on mobile): tabs **Betslip | Open Bets | Edit Stakes**,
   "Place bet to see it here" empty state; stake input, odds entry, quick-bet buttons
6. Shared chrome: search, clock, login/signup, sidebar, sport tabs

---

## 6. Design System

### Colors (extracted from CSS)
| Role | Hex |
|---|---|
| Primary / Back odds | `#fd2954` (hot pink) — 53 uses |
| Hover/active pink | `#fd3e65`, `#fe839c`, `#fe7490`, `#fe6987` |
| Secondary / Lay odds | `#0495e3` (blue), hover `#096eaf`, light `#5cbaed` |
| Dark navy surfaces | `#33334f`, `#2c2c49`, `#30304d`, `#222241` |
| Text grays | `#adadb8`, `#c4c4cd`, `#727286`, `#4c4c65`, `#b9b9c2` |
| Border/light | `#f0f0f0`, `#e8e8eb` |
| Deep accents | `#a02148`, `#5a1a3e`, `#b7234b`, `#ce254e`, `#301739`, `#2C4F58` |

### Typography
- **Lato** (100–900) from Google Fonts for UI/headings
- Roboto / Helvetica Neue fallbacks; monospace stack for numbers

### Layout & components
- **Tailwind utility-first** classes; responsive `md:` breakpoints, mobile-first (match page is
  bottom-sheet betslip on mobile)
- Cards: rounded-md, white/light surfaces, hover `bg-[#eceaea]`
- Icons: Lucide (inline), brand SVGs inline in JSX, sidebar sport icons as `.svg` assets
- Carousels: slick; horizontal snap-scroll strips (`snap-start scrollbar-hide`)
- Odds buttons: pill/cell buttons, pink (back) & blue (lay), live volume tickers update via STOMP

---

## 7. Data & Realtime Flow

1. SPA boots → Axios GET catalog/events from `api.mysportsfeed.io/api/v1`
2. Opens STOMP connection to `feed.mysportsfeed.io/hypex-ws` (SockJS fallback)
3. Subscribes `/topic/rx_score/...` for live scores, `/topic/notifications/...` for pushes
4. Odds/liquidity streams update price cells in place (no page reload)
5. Bets placed via betslip → REST to wallet/orders → settlement via `win.mysportsfeed.io`

---

## 8. How to Rebuild an Equivalent Clone

Cheapest faithful path (not re-implementing from scratch):
1. **Scaffold**: Vite + React 18 + Tailwind + Redux Toolkit + react-router-dom + axios + @stomp/stompjs + sockjs-client + moment + react-toastify + react-select + react-datepicker + lucide-react + slick-carousel
2. **Theme layer**: replicate `/theme/{Brand}/` folder (title.png, favicon.png) and a theme JSON (colors: pink `#fd2954`, blue `#0495e3`, navy surfaces)
3. **Layout**: header (logo+clock+auth), sports sidebar, tab strip, event lists (home) — pure Tailwind
4. **Match page**: market accordions (winner/handicap/total/correct-score), back/lay price cells with volume, min/max stake limits, betslip bottom sheet (Betslip/Open Bets/Edit Stakes)
5. **Realtime**: STOMP topics `/topic/rx_score/`, notifications
6. **Backend**: your own exchange engine + REST catalog; keep the same route contract
   (`/exchange_sports/:eventType/:competition/:eventId/:eventInfo`)

Assets saved locally during this session: `.firecrawl/` (home/match rendered HTML, markdown, bundle JS, CSS, logo).

---

## 9. Caveats

- Login-gated areas (account, wallet, my-bets, bet placement, casino) not reverse-engineered —
  need credentials + an authenticated Firecrawl profile session.
- Backend logic (odds matching engine, settlement) is server-side; only API contracts are visible.
- Casino/game content is iframed third-party providers (Aviator, AE Sexy, Randora, Mac88).