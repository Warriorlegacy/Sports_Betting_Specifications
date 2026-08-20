# Allpanel7.com — Reverse Engineering Report

Reversed from live scrape (Firecrawl rendered HTML/markdown + raw HTML + bundles + CSS), Aug 20 2026.
Evidence dumps in `.firecrawl/`: `allpanel7-home.json`, `allpanel-home-rendered.html`, `allpanel-home.md`,
`raw-allpanel.html`, `allpanel-main.js` (5.2 MB), `allpanel-score.css`, `allpanel-ds.css`, `allpanel-wl.css`, `allpanel-style.css`, `allpanel-styles.css`.

---

## 1. Verdict

Allpanel7.com is a **fourth, distinct white-label exchange platform** — the **ICE Exchange** platform
("iceexchange"). It is an **Angular + Bootstrap 3 + jQuery** app, themed **"skyexchange"** (dark green + gold),
with its own API (`api.iceexchange.com`), its own realtime layer (**Firebase Realtime DB**), and its own
operator cluster (sibling brands: world777, diamond, lotusbook247). The `?code=vij03` query param is an
**affiliate/referral code** baked into the requested URL.

No OSS license anywhere — proprietary white-label SaaS template, same licensing model as the other three
sites (MySportsFeed / hurry2 / DataFairPlay).

---

## 2. Tech Stack (evidence)

| Layer | Technology |
|---|---|
| Framework | **Angular** (Angular CLI dual build: `runtime-es2015` + `polyfills-es2015` + `main-es2015`, with es5 `nomodule` fallbacks) |
| Styling | **Bootstrap 3.3.7** + **jQuery 3.2.1** + jQueryUI 1.8/1.10 (drag-and-drop for "trading event" reordering) + daterangepicker + moment |
| Fonts | **Work Sans** (Google) + **Roboto / Noto / Helvetica** (`font-family:"Roboto","Noto","Helvetica Neue",...`) |
| Icons | FontAwesome 4.7 + FontAwesome 5.7 |
| State/HTTP | Angular HttpClient + **CryptoJS AES** (API config obfuscated/encrypted in bundle — `_0x165427['a']['url']`) |
| Realtime | **Firebase Realtime Database** (`t20-score-290608.firebaseio.com`, `firebase.initializeApp`) + Firebase Firestore — scores/odds sync |
| Video | **hls.js** + **T20RTCPlayer** (T20 iPhone WebRTC player, `real-game.live`, `165.22.118.145/VIDEOAPI/streaminfo.php`) for live casino/live-game streams |
| OCR/img | **Tesseract.js** OCR (reads payment transaction screenshots) + **browser-image-compression** (upload shrink) |
| Export | **jsPDF + SheetJS + jszip** (account statements / reports) |
| Storage | AWS SDK (S3 upload — assets on `assets.iceexchange.com`) |
| Chat | **Chaport** (`app.chaport.com`) + **voiso** support WebSocket (`wss://cc-ams05.voiso.com/webchat`) |
| Scanners | **html5-qrcode** (QR code deposit/scanning) |
| Third-party widgets | **SportRadar** live-score widgets (`widgets.sir.sportradar.com`, client key `020d534eac2800ca94e178bc9d3f060e`) |
| Licensing seal | **Anjouan Gaming** seal (`anjouangaming.org/anj-seal.js`) |
| Mobile | **Android APK** download (from `assets.iceexchange.com/prod/apk/...`) |
| Theme | `html[data-theme="dark"]`, `body.web.skyexchange` — **dark green + gold**; in-app "Select Theme" switcher (3 themes) |
| Languages | 7: English, Hindi, Tamil, Telugu, Kannada, Marathi, Gujarati |

### Backend / services (evidence from bundle)
- `https://api.iceexchange.com/` — main exchange API
- `https://admin.iceexchange.com/version.json` — operator admin panel
- `https://api.iceexch.co.uk/api/versions/1/images/extract/tx` — OCR of transaction (UPI/payment) screenshots
- `https://d2x2n30jb83o2t.cloudfront.net/` — brand API CDN (CloudFront)
- `https://d2gx52pf2lj8be.cloudfront.net/api/cricket/latest` + `/api/soccer/recent-incidents` — live scoreboard feeds
- `https://a9.thebetmarket.com/api/bfrateScoreborad` — **Betfair-rate** scoreboard (Indian "Betfair rate" odds source)
- `https://t20-score-290608.firebaseio.com` — Firebase RTDB realtime scores/odds
- `http://165.22.118.145/VIDEOAPI/streaminfo.php` — casino/live-game video streams (DigitalOcean)
- `https://app.chaport.com/javascripts/insert.js` — live chat
- WhatsApp signup: `wa.link/icex1`; APK: `https://s3.ap-south-1.amazonaws.com/assets.iceexchange.com/prod/apk/20230815/Allpanel7.apk`
- Brand family: skyexchange theme; sibling brands world777, diamond, lotusbook247 referenced in source

---

## 3. Route / UI Inventory

### Homepage
1. **Header**: logo, live clock, language dropdown (7 langs), Signup, LOGIN, **"Login With Demo"** (one-click demo account)
2. **Sports nav**: CRICKET, SOCCER, TENNIS, KABADDI, Sports Book, **Ace Casino, Live Casino, E-sports, Virtual Sports, Slots, Special Market, Games** (Player Battle), Snooker, Baseball, Basketball, Handball, Volleyball, Table Tennis, Ice Hockey, Futsal, Badminton
3. **In-play strip**: `in-play-heading`, `inPlayFilter gamesTabRow`, live matches (`event-nameinplay`), greyhound "Grey Gaming", England v Pakistan, TNPL, CPL
4. **Market tables**: `market-listing-table apl-table` with `.show-size.back`/`.lay` odds cells (prices inline, e.g. 1.05) — same exchange ladder pattern as the other platforms
5. **Modals**: "1 point in live casino = 100 coins", "Balance must be more than 100", Main/Wallet balance transfer (bonus wallet), **Exposure Details** table, **Select Theme** switcher, Bonus T&C (rolling 10x etc.), **Player Battle** rules, **Multiple Account & Bet Limit Rule** acceptance, Change Password, OTP login, Signup (mobile number, country code +91, WhatsApp signup)
6. **Footer/marketing**: "Get Your ID Here", 1-to-1 customer support, 24/7 instant withdrawal, APK download, Anjouan Gaming seal

### Payment / verification flow (notable)
- Deposit/withdraw via **UPI/QR** — `html5-qrcode` scanner + upload payment screenshot → **Tesseract OCR extracts tx details** (`/api/versions/1/images/extract/tx`) → admin verifies

---

## 4. Design System

| Token | Value | Use |
|---|---|---|
| Primary gold | `#BB973B` / `rgba(187,151,59,.12)` | `--main-color` (buttons, accents, active states) |
| Bright gold | `#EAB50E` | highlights |
| Antique gold | `#a88835`, `#a78810`, `#987f33`, `#75672b` | secondary golds, borders |
| Red | `#DE191E`, `#9f1b1b`, `#ac182e` | warnings / lay highlights / errors |
| Dark greens | `#0C2013`, `#233529`, `#1D3024`, `#212e18`, `#213327`, `#38483d` | surfaces, header, body |
| Sage/neutral | `#959e98`, `#b0b7b2`, `#dee0de` | muted text, borders |
| Text | `#000000`, `#ffffff` | base text |
| Font | Work Sans (headings) + Roboto/Noto (app) | Global UI |
| Theme flag | `html[data-theme="dark"]`, `body.web.skyexchange` | brand skin |

Odds cells inherit exchange colors (`.back`/`.lay` via runtime theme CSS — `--main-color` is injected at runtime by the theme switcher, not present in static CSS).

---

## 5. Realtime / Data Flow

```
Angular SPA ── HttpClient ──> api.iceexchange.com  (auth, wallet, bets, markets)
              ──> d2x2n30jb83o2t.cloudfront.net   (brand API CDN)
              ──> Firebase RTDB t20-score-290608  (live scores/odds sync)
              ──> d2gx52pf2lj8be.cloudfront.net   (cricket/soccer scoreboards)
              ──> a9.thebetmarket.com             (Betfair-rate odds)
              ──> api.iceexch.co.uk               (OCR of payment screenshots)
              ──> VIDEOAPI/streaminfo.php         (casino/live-game HLS/WebRTC streams)
              ──> SportRadar widgets              (match widgets)
              ──> voiso / Chaport                 (support chat)
```
- Odds updates ride Firebase Realtime DB (bundles its own WebSocket/long-poll transport) + HTTP polling.
- Requests encrypted via **CryptoJS AES**; config in bundle is hex-obfuscated (`_0x…` strings).

---

## 6. Key Differences vs the other three

| | Rudra888 | FairplayVip | Lotusrun365 | **Allpanel7** |
|---|---|---|---|---|
| Framework | React 18 | Vue 2 | Angular | **Angular (es5+es2015 dual)** |
| Styling | Tailwind | Bootstrap 5 | Bootstrap 4 | **Bootstrap 3 + jQuery UI** |
| Realtime | STOMP | Socket.IO | Pusher/SockJS | **Firebase RTDB** |
| Backend | MySportsFeed | hurry2 | DataFairPlay | **ICE Exchange (iceexchange.com)** |
| Theme | dark pink/blue | light/dark orange | light teal | **dark green + gold** |
| Langs | EN | 9 | EN | **7 (incl. 5 Indic)** |
| Payments | web | web | web | **QR + OCR-verified UPI screenshots** |
| Extras | — | 2FA, APK | fancy markets, /m/ app | **demo login, Player Battle skill game, theme switcher, SportRadar widgets, casino streams, Anjouan seal, Tesseract OCR** |
| Mobile | responsive | responsive+APK | /m/ sub-app | **responsive + APK** |

---

## 7. How to Rebuild / Embed This Design

1. **Scaffold**: Angular CLI (dual-build for older phones), Bootstrap 3 + jQuery 3 + jQueryUI (drag-drop trading list), FontAwesome 4/5, Work Sans + Roboto
2. **Theme**: `html[data-theme="dark"]`, green/gold palette (§4), theme-switcher component injecting `--main-color`
3. **Components**: Header(clock, 7-lang dropdown, demo login) → sport nav (22 sports incl. Ace/Live Casino, E-sports, Virtual, Slots, Special, Games) → in-play strip → `market-listing-table` exchange ladders (.back/.lay/.show-size) → Exposure + Transfer + Bonus modals → Betslip
4. **Features to replicate**: OTP login, demo login, WhatsApp signup, APK download, QR+OCR payment flow, statement export (jsPDF/SheetJS), Player Battle game, SportRadar widget embedding
5. **Realtime**: Firebase RTDB (or any live-sync service) per event for odds/scores
6. **Backend**: exchange engine + ICE-exchange-style API contract

---

## 8. Licensing

- **No OSS license** — Angular shell, theme CSS, icon fonts, and assets are proprietary to ICE Exchange / the Allpanel7 operator. Do not copy bundle files or assets.
- **Data**: SportRadar widgets are keyed to this client ID (`020d…060e`) — cannot reuse on another domain; odds/score feeds (thebetmarket, Firebase) are licensed services.
- **Legal embedding paths**: buy a white-label deal from ICE Exchange-style vendors (they supply backend + feeds + skin + SportRadar keys), or **clean-room** your own Angular frontend from this spec (§7) with licensed feeds/widgets.
- Anjouan Gaming seal implies offshore licensing (Anjouan) — verify validity and get local counsel; India has no licensed online-betting regime.

---

## 9. API Layer (reverse-engineered from bundle + live probes)

### Stack
**Spring Boot** (Jackson envelope `{status, code, data, timestamp}`) on **MariaDB** (`org.mariadb.jdbc` — leaked in a 500 stack trace from `/exchange/v1/dashboard/loadPlayerMenu`). Multi-tenant: every request must carry `Tenant-ID: 20210224` (== `whitelableId` from fontlayout.json) or API returns 400/403. A **WAF** rejects non-browser User-Agents (403) — use a real Chrome UA + `Origin`/`Referer` matching the site.

### Request headers (required)
```
Tenant-ID: 20210224
x-timeZone: Asia/Kolkata     (some endpoints)
Origin: https://allpanel7.com
Referer: https://allpanel7.com/
User-Agent: <real Chrome UA> (WAF-gated)
```

### Crypto (only some responses; envelope `data` is a base64 string when encrypted)
- CryptoJS AES, **OpenSSL salted format** (`U2FsdGVkX18…`): passphrase `9d86d31e72b9538eeecf5d26e3e9de06` (bundle var `finavalValue`), EVP_BytesToKey MD5, AES-256-CBC, PKCS7. Round-trip verified with `C:\Users\Piyush\AppData\Local\Temp\opencode\ice-aes.js` (`node ice-aes.js enc|dec <text>`).
- Some endpoints use a second scheme: base64 `key` + `iv` in `CryptoJS.AES.decrypt(data, key, {iv, mode:CBC, padding:Pkcs7})` (e.g. getencustomeslip).

### Endpoint dictionary (from bundle string scan)
```
api/auth/signin, signup, loginWithOtp, otpValidation, verifyCode, checkExistence,
      forgetPass, clickCount, getUrlDetails, affiliateSignup
exchange/v1/dashboard/loadPlayerMenu, inPlay, getSiteProfile      (+ v2 variants)
exchange/v1/menu-master/loadMenu, listCompetitions, listEvents, listMarketCatalogue,
      createFancyMarket, getFancyMarkets, getIndianCasinoMarkets, updateCasinoMarket,
      updateCasinoRunner, createFancyRunner, updateFancyRunner
exchange/v1/user-operations/registerUser, getDownlineList, getDownlineListv2,
      getMasterDownline, getUserAccountDetails, updateBankingDetails
exchange/v1/owner-operations/getUnsettleEvents, getAllOpenEvents, getAccountsReport,
      getDepositCountR…, settleFancyBetsRequest, getTraderList, getFancyMarketsHistory
exchange/v1/admin-operations/activeAffCampStatus, createAffCampaign, createCampaign, settleFancyBets
exchange/v1/bet-operations…, payment-ops…, accounts/getPlAccountStmnt, getPlCasinoBets
ace/init, poker/gameInit                       (casino games)
extr/v1/dashboard/getFancyRunners              (fancy runners)
exsr/v1/sports/getMarketWithOdds               (SportRadar odds)
exchange/v1/sse/consume-market-list, consume-score-list   (SSE realtime)
```
`sourceType` param variants: `custom | betfair | satsp | t20 | ICE | ICESR`. Auth endpoints live under `/api/…`; data endpoints under `/exchange/v1|v2/…`. `exchange/v1/dashboard/loadPlayerMenu` requires an auth token (500s with MariaDB stack trace otherwise).

### Verified live captures (Aug 20 2026, allpanel7.com)
- `GET /exchange/v2/dashboard/getSiteProfile?domain=allpanel7.com` → `{"status":"OK","code":200,"data":{"sportsbook":true,"premium":true,"bankVerify":true,"usdEnabled":false,"boxing":true,"greyGaming":true,"eventBet":true,"logiFuture":true}}` — plaintext (no AES).
- `GET /exchange/v2/dashboard/inPlay?domain=allpanel7.com` → 130 KB OK (saved `C:\Users\Piyush\AppData\Local\Temp\opencode\inplay-enc.json`). Model:
  ```
  children[] → sport nodes → markets[]
  market: { id, marketId "1.x", eventId, eventName, marketTime,
            minStake, maxStake, maxMktStake, totalMatched,
            inPlay, status: "OPEN", suspended, ballRunning,
            fancyCategory, competitionName,
            fancyIcon, bookMakerIcon, tvIcon, premiumIcon,
            eventPosition, orderPxDelay,
            runners: [{ selectionId, runnerName, rnrStatus,
                        btb[], btl[]  // {pr, sz, lv} price/size/liquidity }] }
  ```
- `GET /exchange/v1/dashboard/loadPlayerMenu?domain=allpanel7.com` → 500 (auth required; confirmed MariaDB backend).
- `GET /exchange/v1/sse/consume-market-list` (SSE) → empty 200 on silent probe; needs exact query params.
- Sibling domains (diam9.com etc.) share the same bundle build `main-es2015.303deec43052c5ba2146.js` and the same whitelabelId `20210224` — per-domain behavior comes from `getSiteProfile` / fontlayout.json, not a different build.

---

## 10. Diam9.com — same platform (see DIAM9-REVERSE-ENGINEERING.md)