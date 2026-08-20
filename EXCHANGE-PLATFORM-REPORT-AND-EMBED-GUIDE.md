# Exchange Platform Reverse-Engineering — 4 White-Label Betting Exchanges

**Full design/tech report + embed guide + licensing analysis**
Reversed from live Firecrawl renders, raw HTML, JS bundles and CSS (Aug 19, 2026). Evidence dumps in `.firecrawl/`.

---

## 1. The Four Platforms — Different Vendors, Same Business Model

| | **Rudra888.in** | **FairplayVip.in** | **Lotusrun365.com** | **Allpanel7.com** |
|---|---|---|
| Vendor / origin | **MySportsFeed** white-label (`api.mysportsfeed.io`) | **hurry2.com** white-label (template `fairplayexch`, assets on `click22frnt.hurry2.com`) | **DataFairPlay** white-label (`api.datafairplay.in`; panels 100panel/reddypanel/rolexpanel) | **ICE Exchange** white-label (`api.iceexchange.com`, theme `skyexchange`) |
| Framework | **React 18.3.1** SPA | **Vue 2** SPA (Vuex, Vuelidate) | **Angular** SPA (RxJS) | **Angular** SPA (es5 + es2015 dual build) |
| Build | Vite (hashed `/assets/index-*.js`) | webpack (`/assets/index-*.js`) | Angular CLI webpack (runtime/polyfills/main chunks) | Angular CLI (runtime/polyfills/main, es5+es2015) |
| Styling | Tailwind CSS + custom CSS | Bootstrap 5 tokens (`--bo-*`) + custom CSS | **Bootstrap 4 + jQuery** + custom CSS | **Bootstrap 3 + jQuery + jQueryUI** (drag-drop) + custom CSS |
| Icons | Lucide | FontAwesome |
| Realtime | **STOMP/SockJS** WebSocket | **Socket.IO** | **Pusher + SockJS/WebSocket** | **Firebase Realtime DB** + HTTP polling |
| HTTP | Axios | Axios | Angular HttpClient | Angular HttpClient + **CryptoJS AES-encrypted config** |
| Dates | Moment + date-fns | Moment + dayjs | Moment | Moment + daterangepicker |
| Extras | react-select, react-datepicker, react-toastify, slick | jspdf + SheetJS (statement export), Google 2FA | metisMenu/slimscroll/slicknav, Owl Carousel, Swiper 9, **reCAPTCHA**, `apl-*` icon font | **T20RTCPlayer WebRTC casino streams, hls.js, html5-qrcode, Tesseract.js OCR (UPI screenshots), jsPDF/SheetJS, SportRadar widgets, demo login, Player Battle game, theme switcher, Anjouan Gaming seal, APK** |
| Languages | English only | **9 langs**: English, Hindi, Kannada, Tamil, Telugu, Gujrati, Marathi, Urdu, Russian | English only | **7 langs**: English, Hindi, Tamil, Telugu, Kannada, Marathi, Gujarati |
| Theme | Dark only | **Light/Dark toggle** | Light, **teal-navy `#034C6F`** | **Dark green + gold** (`data-theme="dark"`, `skyexchange`) |
| Brand color | **Pink `#fd2954`** (back), **Blue `#0495e3`** (lay) | **Orange `#f36c21`**; back `#a5d9fe`, lay `#f8d0ce` (Betfair colors) | Bootstrap default; **6-level odds ladders** + fancy markets | **Gold `#BB973B`/`#EAB50E`**, dark greens `#0C2013`/`#233529`, red `#DE191E` |
| Hosting | CloudFront/S3 + Cloudflare | Cloudflare + hurry2 asset CDN | speedcdn.io CDN + Cloudflare | CloudFront + Firebase + S3 (`assets.iceexchange.com`) |
| White-label scale | 106 brands in bundle (King18, ReddyAnna, Sky247, Lotus365, Amiri999…) | Template reused across hurry2's network (ClickBetExch brands…) | lotus365/DataFairPlay cluster (100panel, reddypanel, rolexpanel…) | ICE Exchange cluster (world777, diamond, lotusbook247…) |
| Special markets | standard | standard | **Indian Fancy/session betting** (sessions, w-p, odd/even, xtra, meter, khadda, over-by-over) |
| Mobile | responsive | responsive + APK | **separate `/m/` sub-app** | responsive + **APK** (QR/OTP + WhatsApp signup) |
| Same market data | Both carry the same SportRadar/Betfair-style feeds (identical England v Pakistan match, `Min:100` limits) | ditto | ditto | ditto |

**Bottom line:** the two sites are competitors selling the *same* Betfair-style exchange product;
each vendor ships a nearly identical UI pattern set (sports sidebar → inplay dashboard → event
detail with back/lay price grid → betslip) implemented on different stacks.

---

## 2. Tech Stack Spec (per site, evidence-based)

### 2.1 Rudra888.in (React)
- React 18.3.1, react-dom client `createRoot`, React Router
- Redux Toolkit (+ devtools compose), Axios
- @stomp/stompjs + SockJS; topics: `/topic/notifications/`, `/topic/rx_score/` (live scores),
  `/user/betting-currency`, `/user/referral-details`, `/user/admins`
- Tailwind (utility classes in DOM: `w-full flex md:flex truncate snap-start scrollbar-hide`),
  custom CSS (~178 KB)
- Libraries: react-select, react-datepicker, react-toastify, slick-carousel, moment, date-fns, lucide-react
- Fonts: Lato (100–900) + Roboto fallback; monospace for numbers
- Tracking: Meta Pixel (brand-gated), GA4, Tawk.to chat, Google OAuth (`gsi/client`), api.ipify.org geo-check
- Env vars in bundle: `WEBSOCKET_URL`, `WEBSOCKET_URL_PUSH_NOTIFICATIONS`, `VITE_*`

### 2.2 FairplayVip.in (Vue)
- Vue 2 + Vuex + Vuelidate + Vue Router, webpack build
- Socket.IO realtime, Axios
- Bootstrap-5-derived design tokens (`--bo-primary`, `--bo-gray-*`, `--background-gradient`,
  `--active-market-gradient-clr`) + 1 MB custom CSS
- FontAwesome icons; Lato + Roboto fonts
- jspdf (PDF), SheetJS/xlsx (Excel) for statements; Google Authenticator 2FA assets
- App: downloadable APK (`assets3.hurry2.com/site_apk/4516fairplayvip.apk`); WhatsApp link `wa.me/+919038629155`
- API host: `click21.hurry2.com` (JSON API, CORS open)

---

## 3. Design System — Exact Tokens to Replicate

### 3.1 Rudra888 palette (dark exchange, Betfair-style)
| Token | Hex | Use |
|---|---|---|
| Primary / back price | `#fd2954` | Odds cells, CTAs, active nav |
| Back hover | `#fd3e65`, `#fe839c`, `#fe7490`, `#fe6987` | Hover/active back |
| Secondary / lay price | `#0495e3` | Lay odds cells |
| Lay hover | `#096eaf`, `#5cbaed` | Hover/active lay |
| Surface navy | `#33334f`, `#2c2c49`, `#30304d`, `#222241` | Header, cards, panels |
| Text grays | `#adadb8`, `#c4c4cd`, `#727286`, `#4c4c65`, `#b9b9c2` | Body/secondary text |
| Accents | `#a02148`, `#b7234b`, `#ce254e`, `#301739`, `#5a1a3e` | Badges, borders, gradients |
| Border/light | `#f0f0f0`, `#e8e8eb` | Dividers, input borders |

### 3.2 FairplayVip palette (light/dark + Betfair odds convention)
| Token | Hex | Use |
|---|---|---|
| Brand primary | `#f36c21`, `#f26c20`, `#fa7b04` | CTAs, active states, accents |
| **Back price** | `#a5d9fe` (light blue) | Back cells (Betfair convention) |
| **Lay price** | `#f8d0ce` (light pink) | Lay cells |
| Win / loss | `#4caf50` green / `#de3f4b` red | P&L, win/loss icons |
| Dark theme | `#121212`, `#1e1e1e`, `#272727`, `#323232`, `#353535`, `#3d3d3d`, `#404040`, `#4c4c4c` | Dark-mode surfaces |
| Bootstrap base | `#0d6efd` primary, `#198754` success, `#dc3545` danger, `#ffc107` warning, `#0dcaf0` info | Forms, badges |
| Neutrals | `#f8f9fa`, `#e9ecef`, `#dee2e6`, `#dadada`, `#6c757d`, `#212529` | Light surfaces/text |

### 3.3 Typography & radius
- **Rudra888**: Lato 100–900; small dense odds type (13–14px), monospace numbers; cards `rounded-md` (6px), pills/rounded buttons.
- **FairplayVip**: Lato + Roboto; 13px price text on cells; `border-radius 10px` cards, accordion sections; sticky bottom betslip.

---

## 4. UI Blueprint — Section by Section (identical pattern on both sites)

### 4.1 Home / Inplay Dashboard
1. **Top utility strip**: live clock (GMT offset), search box, Log In / Sign Up
2. **Header**: logo (`/theme/{Brand}/title.png` style), nav links (Home, Multi Markets), refresh, menu drawer
3. **Sports sidebar** (14–26 sports): Cricket, Soccer, Tennis, Horse Racing, Greyhound, Kabaddi, Politics, Binary, Table Tennis, Basketball, Baseball, Ice Hockey, Volleyball, Esports, MMA, Snooker, plus games (Casino, Aviator, Slot, Matka, Live Card, Fantasy)
4. **Tab strip**: InPlay | Live | Virtual | Premium (per-sport filters)
5. **Event cards grid** — the core pattern:
   - Row: `[Time] [Team A vs Team B] [Min/Max stake]`
   - Price grid: **Back cells** (pink/blue) + **Lay cells** (blue/pink), each showing `price` + matched volume (`1.13 43546K`)
   - Empty cells = suspended market; auto-update via socket (no reload)
6. **Casino lobby strip** (Roulette / AE Sexy / Slots), **Upcoming Events**, Promotions, Game Rules

### 4.2 Match / Event Detail Page (the user's tennis URL)
1. **Breadcrumb**: `top matches > sports > tennis > [competition]`
2. **Match header**: `player1 vs player2`, status, **Premium Market MIN/MAX** stake limits
3. **Market accordion list** — expandable sections, per-runner back/lay grid:
   - Winner, Game handicap, Set handicap, Total games, Odd/Even, Correct score, 2nd-set markets, Total sets
4. **Live score widget** (pushed via `/topic/rx_score/` / Socket.IO)
5. **Betslip bottom sheet**: tabs **Betslip | Open Bets | Edit Stakes**; stake input, odds entry, quick-bet; empty state "Place bet to see it here"; **One-Click Bet** mode (Fairplay), "Click Bet Value Min/Max" modal
6. **Open bets / settled bets / P&L / statements** pages with PDF/Excel export (Fairplay)

### 4.3 Shared modals & micro-UX (Fairplay, worth copying)
- Light/Dark toggle, language picker (9 langs), exit-confirm modal, APK install guide, 2FA setup (QR + codes), bonus rules, display-name edit, referral/affiliate dashboard.

---

## 5. Data / Realtime Architecture to Replicate

```
Browser SPA ── Axios ──> REST API (events, markets, wallet, bets)
     │                    (Rudra888: api.mysportsfeed.io/api/v1 · Fairplay: click21.hurry2.com/api)
     └── WebSocket ──> odds/score stream
          Rudra888: STOMP via feed.mysportsfeed.io/hypex-ws
                     topics: /topic/rx_score/{matchId}, /topic/notifications/
          Fairplay: Socket.IO rooms per sport/event
```
- Odds update in place (price cell flash on change), volume ticks, suspended-market handling
- Bet placement → server validation (min/max per market) → open bets list update
- Geo/IP gating via ipify (region blocks)

---

## 6. How to Embed / Rebuild This Design on Your Website

### Option A — Legit white-label license (fastest, "exact" design)
Both vendors sell exactly this: contact **hurry2.com** (Fairplay template) or **MySportsFeed**
(Rudra888 platform) and buy a white-label package: they host the whole stack (frontend + exchange
engine + feeds + casino), you supply brand name/domain/logo. This is the only way to get the
*exact* design legally — you license their proprietary code, never copy it.

### Option B — Clean-room clone from this spec (own code, safe)
Build your own React/Vue app implementing the *pattern* (not their code/assets):
1. **Scaffold**: Vite + React 18 + Tailwind + Redux Toolkit + router + axios + STOMP or Socket.IO
2. **Tokens**: apply §3 palettes; dark navy surfaces + pink/blue (Rudra style) or orange + Betfair blue/pink (Fairplay style)
3. **Components** (in order): Header(logo+clock+auth) → SportsSidebar → TabStrip → EventCardGrid
   (back/lay price cells + volume) → EventDetail (breadcrumb, market accordions, min/max limits)
   → BetslipSheet (Betslip/Open Bets/Edit Stakes) → modals (language, dark-mode, exit)
4. **Realtime**: subscribe per-match topics; flash price deltas; suspend on zero liquidity
5. **Backend**: own exchange engine (orders, matching, settlement) + REST contract matching §5
6. **i18n**: 9-language locale files (Hindi/Tamil/Telugu/…) if you want Fairplay parity

> Legal note on "embedding": copying their minified JS, CSS, logos, or asset files into your site
> is **copyright infringement** (no OSS license anywhere in either bundle). Reimplementing the
> layout ideas in your own code is standard industry practice — Betfair's blue/pink odds
> convention itself is a functional pattern used by dozens of exchanges.

---

## 7. Licensing Analysis

| Item | Owner | Can you copy? |
|---|---|---|
| Minified JS/CSS bundles | MySportsFeed (Rudra888), hurry2 (Fairplay) — proprietary, no license header | **No** |
| Theme assets (logos, SVGs, webp images) | Brand owners / vendors | **No** (trademark + copyright) |
| Brand names ("Rudra888", "Fairplay") | Operators / Fairplay Group (trademarked) | **No** |
| Layout pattern, odds-cell convention, UX flow | Functional/generic industry pattern | **Yes** (clean-room) |
| Odds/event data | SportRadar feeds via vendor API — ToS-bound | **No** (scraping violates ToS) |
| Open-source deps inside bundles (React, Vue, Tailwind, Bootstrap, moment…) | MIT/etc. | Yes, with their licenses |

**Practical answers:**
- "License to embed the exact design" → you buy it from the vendors (white-label contract), or you
  build your own; there is no free license to their templates.
- White-label deals typically include: domain setup, brand theming (colors/logo), feed access,
  casino/crash/slot integrations, APK builds, and ongoing revenue share — negotiate directly.
- If you self-build: keep your code original, don't reuse their assets or API endpoints; use
  licensed feeds (Sportradar/Genius/LSports) for data.

**Regulatory one-liner:** online sports betting/gambling has no licensing regime in India and
both sites operate in a gray area; if your website takes real-money bets, get local counsel
before launch — the UI is the easy part.

---

## 8. Deliverables saved this session (`.firecrawl/`)
- `rudra888-home.json` / `rudra888-match.json` — Firecrawl markdown+HTML of both pages
- `home-rendered.html`, `match-rendered.html`, `fairplay-home-rendered.html` — rendered DOM
- `index-tE8Ig5mT.js` (2.4 MB), `index.css` — Rudra888 bundle + styles
- `fairplay-index.js` (3.1 MB), `fairplay-index.css` (1 MB) — Fairplay bundle + styles
- `raw-home.html`, `raw-fairplay.html`, `logo.png`, `home.md`, `match.md`, `fairplay-home.md`
- `lotusrun-home.json` / `lotus-match.json` — Lotusrun365 Firecrawl pages; `lotus-main.js`, `lotus-styles.css`, `lotus-api.js` (recaptcha), raw HTML
- `allpanel7-home.json` — Allpanel7 Firecrawl page; `allpanel-home-rendered.html`, `allpanel-home.md`, `raw-allpanel.html`, `allpanel-main.js` (5.2 MB), `allpanel-score.css` / `allpanel-ds.css` / `allpanel-wl.css` / `allpanel-style.css` / `allpanel-styles.css`
- `LOTUSRUN365-REVERSE-ENGINEERING.md` — dedicated Lotusrun365 (Angular/DataFairPlay) report
- `ALLPANEL7-REVERSE-ENGINEERING.md` — dedicated Allpanel7 (Angular/ICE Exchange) report
- `RUDRA888-REVERSE-ENGINEERING.md` — prior single-site report