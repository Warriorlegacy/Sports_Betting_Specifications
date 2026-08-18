# IndianBet77 (indianbet77.live) - Reverse Engineering Report

**Date:** 2026-08-18 | **Target:** https://indianbet77.live | **Type:** Betfair-style Betting Exchange - ASP.NET WebForms Dealer Panel ("OldVersion")

---

## 1. Executive Summary

indianbet77.live is a **Dealer (Master-Agent) panel** for a Betfair-style **Back/Lay betting exchange**, built on the classic **ASP.NET WebForms (.NET Framework 4.0.30319)** stack — the "OldVersion" generation of the common white-label **"Shiv Exchange"-family clone** (evidence: live-TV/TeenPatti iframe on `shivexch.com`, odds feed on `alldata.wizardnew.com`). No SPA, no REST microservices: the app is **server-rendered WebForms with postbacks + two legacy ASMX web services** (`AjaxSession.asmx`, `OddsService.asmx`) + one external public odds REST API.

The deployment is **dealer-only** — there is no client-facing (user) panel, no registration, no forgot-password on this domain. Client accounts are created by the dealer via `addusers.aspx`. Auth is **ASP.NET session cookie** with per-session event-validation MACs (scripted `requests`-based logins get HTTP 500; a real browser engine is required — verified via Playwright).

Fronted by **Cloudflare** (proxy + RUM beacon, datacenter IPs blocked, residential IPs pass), with **LuckyOrange** analytics (site-id `8c4526cb`).

---

## 2. Infrastructure & Hosting

| Layer | Value |
|---|---|
| Host | `https://indianbet77.live` (Cloudflare proxied) |
| Server headers | `Server: cloudflare`, `X-AspNet-Version: 4.0.30319`, `X-Powered-By: ASP.NET` |
| Runtime | ASP.NET WebForms, session cookie `ASP.NET_SessionId` (HttpOnly, SameSite=Lax), session regenerated on login |
| Dealer panel path | `/OldVersion/dl/` (`/OldVersion/` returns 403, directory listing off) |
| Dealer login | `/index.aspx` (root) — `/OldVersion/dl/index.aspx` 302-redirects to it |
| Asset versioning | `/css/bootwww.css?v=20260818084458` — timestamped, rebuilt per deploy |
| Analytics | `tools.luckyorange.com/core/lo.js?site-id=8c4526cb`, Cloudflare RUM `beacon.min.js` |
| Odds feed host | `https://alldata.wizardnew.com` (REST, **public, no auth**) |
| TeenPatti live TV | `https://shivexch.com/dia_tp_live_tv/{game}/` (iframe) |
| TeenPatti game assets | `http://65.0.200.145/` (bare IP `ASSET_PATH`) |
| APK | none found (`/app.apk`, `/Indianbet77.apk` → 404) |

---

## 3. Authentication & Session

- **Login page**: `/index.aspx` — WebForms postback form (`action="./index.aspx"`), fields `txt_phone` (username), `txt_password`, `remember` checkbox, submit `LinkButton1=Log In`.
- **Flow**: GET login → extract `__VIEWSTATE` / `__VIEWSTATEGENERATOR` / `__EVENTVALIDATION` → POST → session cookie regenerated → redirect to `/OldVersion/dl/dashboard.aspx`.
- **Anti-scripting quirk**: POSTing with a pure HTTP client (`requests`/curl) always yields **HTTP 500 "Invalid postback or callback argument"** at `TextBox.LoadPostData` — the event-validation MAC is bound to the server-rendered control tree and the clone throws on non-browser posts (deliberate scraper defence + possible load-balanced node machine-key drift). **Playwright/real browser engine succeeds**; headless Chromium from a residential IP passes Cloudflare.
- Post-login cookie: single `ASP.NET_SessionId`; no JWT, no API tokens. All page state is in `__VIEWSTATE` (server-side).
- No 2FA / OTP on the dealer panel; password change page (`change-password.aspx`) is a plain postback form.
- Session-dependent probes: `ChipSummary.aspx` → 302 to login when unauthenticated.

**Account under test**: user id `224428` (`hdnuid`), username `Karan`, agent `Myne3`, wallet `32000.00` INR, share `0`, max-stake 1,000,000 / min 100.

---

## 4. Page Inventory (19 pages, all titled "Dealer")

| Page | Function |
|---|---|
| `dashboard.aspx?eventType=0/1/2/4/9` | Home: match list w/ tabs **In Play / Soccer / Tennis / Cricket / My Markets**. Columns: Match, Bets, Liability, X1, X2, X3 (runner exposures), Fancy flag (`F`), Inplay flag; links to `MyBook.aspx?event={matchId}` |
| `Match.aspx?eventType=1/2/4` | Market management: match list per sport; per-match "Match Book" buttons |
| `Blockmarket.aspx` | Block/unblock markets per sport (Active toggle, DataTables) |
| `addusers.aspx` | Create client accounts: User Name, Name, Password, **Match Comm.**, **Rolling Comm.**; live username availability via `addusers.aspx/Checkuser` (ASP.NET AJAX page method) |
| `UsersList.aspx` | Client list (DataTables): Edit, Client/Distributor share (ss), Balance, Clients, Credit, Credit Limit, Liability, Match Comm., Session Comm., Password, Status, [Cash]+[P/L]; row actions: `btnLiability`, `dlname`, `lnkedit`, `LinkButton2`; search + group filter `rdogroup`; per-user config: BetDelay, BetLock, M.Com, MaxBet, MinBet, Profit, Exposure, Deposit Chips |
| `profile.aspx` | Per-sport commission profile: Sport, MatchCom, Min Bet, Max Bet, Delay, Profit |
| `AccountSummery.aspx` | Account statement (DataTables, From/To filter): Date, Balance, CR, DR, Ref ID, Type, User, UserType |
| `ChipStatement.aspx` | Chip statement (same columns as AccountSummery) |
| `ChipSummary.aspx` | Chip settlement: per-agent rows w/ Balance, Profit; actions `btn_settlement`, `btnhistory`, `btnCFC`, `lnkCashFromMdl`, `lnkCLIENTCOM`; Amount / Current Balance / Remark inputs |
| `ChipSummary` (Client report) | `UserPLReport.aspx` — client chip P/L report with DataTable drilldown (`GetInnerData`) |
| `ProfitLossNew.aspx` | Market P/L report, date range (Start Date / End Date), matrix of P/L per match |
| `MaxLimit.aspx` | **Edit Button**: 6 configurable quick-stake buttons (Button 1-6 Value) |
| `MyBook.aspx?event={matchId}` | Match book: Bookmaker odds (external feed), **Toss market** (Back/Lay), sessions/fancy book, book toggles `lnkOdssenable`, `lnkSessonenable`, `LBMBOddsEnable`; odds flash on change (yellow highlight) |
| `TossBook.aspx?event={matchId}` | Toss market book: Match, Bets, Date, Odds, Stake, Team, User, Profit/Loss, **Winner** column |
| `ClientProfitLoss.aspx?mid={matchId}` | Per-match client P/L (grand total) |
| `MatchBookTeenpatti.aspx?event={game}` | **Live TeenPatti game books** for `t20`, `oneday`, `poker`, `dt6` (Dragon Tiger), `lucky7eu` (Lucky 7), `aaa` (Amar Akbar Anthony): bet table (Label, Draw, Sr., BetType, Date, Odds, Stake, Team, User) + **live TV iframe** + auto-refresh `btnRefresh` |
| `change-password.aspx` | Password change (postback) |
| `logout.aspx` | Logout |

NotFound probes (404): Register, Registration, Sports, Result, MyBets, Bets, MarketBook, FancyBook, Casino, InPlay, SportsBook, News, Rules, Commission, Credit, AgentList, AccountStatement, MarketPL, LiveMarket, CasinoBook, Games, TeenPatti, login (root), forgot-password, signup. `/rules.aspx` returns 500 (exists, requires login/params). No `/OldVersion/ul/` or `/OldVersion/cl/` client panels exist on this domain.

---

## 5. API Surface

### 5.1 `AjaxSession.asmx` (root, GET, session-optional for News)

| Method | Params | Response |
|---|---|---|
| `News?type=DL` | type | **Public.** `[{"NewsId":7,"News_type":"ALL","Newstxt":"WELCOME TO INDIANBET77 PREMIUM WEBSITE. WRONG TRADING BETS ARE STRICTLY DELETED.","Status":true,"Date":"Oct 26 2025 3:50PM"}]` |
| `sget1?Id={EventId}&Mid={matchId}&uid={uid}` | event/match/user | Toss market: `{Table:[{EventId,Match,Team1,Team2,Status,BackPrice1,LayPrice1,BackSize1,LaySize1}], Table1:[{toss1,toss2}]}` (exposure per side) |
| `getDLBook?MatchID={id}&userid={uid}` | match/user | Dealer book: `{Table:[],Table1:[],Table2:[]}` (empty when no book) |
| `getDLTossBook?MatchID={id}&userid={uid}` | match/user | Toss book |
| `GetInnerData?uid={uid}` | user | **User P/L drilldown**: `{"Table":[{"C":0,"P":100,"SportName":"Cricket","Stack":134000.0,"DPL":-67755.00,"Commission":0.00}]}` |

### 5.2 `OddsService.asmx` (root, GET)

| Method | Params | Notes |
|---|---|---|
| `GetCasinoOdds?matchid={game}` | t20/oneday/poker/dt6/lucky7eu/aaa | TeenPatti odds; empty when game not running |
| `GetCasinoResultDetail?Gameid={game}&roundid={round}` | + roundid | Game round result |
| `GetResultDetail?marketid={m}&xpath={x}` | + xpath | Match result (XML xpath query) |
| `GetResultCDetail?marketid={m}&xpath={x}` | + xpath | Casino result (XML xpath query) |

Parameter names leak via 500 "Missing parameter" errors (useful for enumeration).

### 5.3 External odds feed (REST, **public, no auth**)

```
GET https://alldata.wizardnew.com/api/MatchOdds/GetOddslite/4/{marketId}/{eventId}
```
Betfair-style book: `{"market":[{"marketId":"1.261188085","inplay":"true","totalMatched":null,"priceStatus":"OPEN","events":[{"SelectionId":"11652731","LayPrice1":"2.52","LaySize1":"289.73","LayPrice2":"2.54","LaySize2":"14239.8",...,"BackPrice1":"2.5","BackSize1":"345.55",...}]}]}` — 3-depth Back/Lay prices+sizes, Betfair-style `SelectionId`, market ids like `1.261188085`.

### 5.4 Page methods (ASP.NET AJAX)

- `addusers.aspx/Checkuser` — username availability (POST JSON)

### 5.5 Real-time (stubbed, disabled)

SignalR hub present but gated behind `IsSignalRActiveMst = 0` in every page. Client-side wiring documented:
- `$.connection.hub.qs = {Name: hdnuid}`; `myhub.server.afterConnected()`
- `myhub.client.liveBetUpdate(message)` — `{Matchid, type: "session"|"odds"}` → triggers `GetSessionBook(sessionid)` / `GetBookdata()`
- `myhub.client.getactivesession(message)` — `{Marketid, SessList}` → fills `ActiveSession[]`
- `myhub.client.liveteepatti(message)` (TeenPatti page), `myhub.client.hello`

---

## 6. Data Model (Betfair-convention IDs)

- **Match ids**: internal (e.g. `13754`) ↔ **event ids** (feed, e.g. `35948041`, `35913614`, `35949851`) ↔ **market ids** (`1.261188085`, `1.260870239`, `1.261217780` — "1.x" Betfair format) ↔ **selection ids** (`11652731`, `11653069`).
- Market type codes `hidMType`: `1`, `2`, `3`, `5` (MyBook hides bookmaker/toss/fancy blocks for types 1/2/5; Match Odds vs Bookmaker vs Fancy).
- Stakes: min **100**, max **1,000,000** (INR) on toss markets; exchange odds with 3-level depth.
- Sample live matches (Cricket, eventType=4): Chepauk Super Gillies v Lyca Kovai Kings (inplay, fancy), Sri Lanka v India, East Delhi Riders v Central Delhi Kings (inplay, fancy).

---

## 7. TeenPatti / Live Games Module

- Games: **T20, OneDay, Poker, Dragon Tiger (dt6), Lucky 7 (lucky7eu), Amar Akbar Anthony (aaa)** — each a `MatchBookTeenpatti.aspx?event={game}` book.
- Live TV iframe: `https://shivexch.com/dia_tp_live_tv/{game}/` (class `sc-dUjcNx eLUYUT` — styled-components, React-based TV UI).
- Assets: `ASSET_PATH = 'http://65.0.200.145/'` (insecure HTTP game asset server).
- Odds/results via `OddsService.asmx` (5.2); bets are postbacks (page table: Label, Draw, Sr., BetType, Date, Odds, Stake, Team, User).

---

## 8. Security Observations

| Item | Status |
|---|---|
| Directory listing | Off (403 on `/OldVersion/`) |
| `web.config` | 404 (locked down) |
| WSDL/ScriptService docs | Disabled (`?WSDL` → 500 "Request format is unrecognized") |
| ASMX parameter leakage | 500 error pages expose full parameter names |
| `getDLBook` / `sget1` / `GetInnerData` | Respond **without auth cookies** (empty datasets — data not exposed, but endpoints are not 401-gated) |
| Scripted-login defence | Effective: event-validation 500 for non-browser POSTs |
| Cloudflare | Datacenter IPs blocked ("Sorry, you have been blocked"); residential passes |
| Session cookies | HttpOnly, SameSite=Lax; regenerated on login |
| Password storage | `UsersList.aspx` renders client passwords server-side (dealer visibility by design) |

---

## 9. Platform Fingerprint (vendor evidence)

- Classic **ASP.NET WebForms exchange clone**, "OldVersion" generation — same structural family as the widely-deployed **Shiv Exchange / BExchange-style** white-label clones:
  - `shivexch.com` hosts the dealer TeenPatti live-TV UI → vendor-adjacent host
  - `alldata.wizardnew.com` = odds data host for the dealer book
  - `AjaxSession.asmx` + `OddsService.asmx` + `bootwww.css?v={timestamp}` + `activetab.js`/`emty.js` + `MaxLimit.aspx`/`ChipSummary.aspx`/`TossBook.aspx` naming are the clone's signature
- Distinct from the modern SPA generation (`hurry2/zplay1` ClickBetExch, see REPORT-fairplayvip.md) but **shares the same market conventions** (Betfair-style `1.x` market ids, event ids in the 35.9M range).

---

## 10. Verified Live Probes

| Probe | Result |
|---|---|
| `GET /OldVersion/dl/index.aspx` | 302 → `/index.aspx` |
| `POST /index.aspx` (requests, valid viewstate) | 500 event-validation |
| Playwright login (headless Chromium) | **Success** → `/OldVersion/dl/dashboard.aspx` |
| `GET /AjaxSession.asmx/News?type=DL` | 200 public news JSON |
| `GET /AjaxSession.asmx/GetInnerData?uid=224428` | 200 user P/L JSON |
| `GET /AjaxSession.asmx/getDLBook?MatchID=13754&userid=224428` | 200 `{Table:[],Table1:[],Table2:[]}` |
| `GET /AjaxSession.asmx/getDLTossBook?MatchID=13754&userid=224428` | 200 empty tables |
| `GET /OddsService.asmx/GetCasinoOdds?matchid=t20` | 200 (empty when game off) |
| `GET alldata.wizardnew.com/api/MatchOdds/GetOddslite/4/1.261188085/35948041` | **200 public full odds book** |
| `GET /web.config`, `/OldVersion/web.config` | 404 |
| `/OldVersion/`, `/OldVersion/ul/`, `/OldVersion/cl/` | 403 / 404 / 404 |
| `GET /ChipSummary.aspx` (no session) | 302 → login |

---

## 11. Tech Stack Summary

- **Frontend**: ASP.NET WebForms server-rendered, jQuery 1.x + Bootstrap 3 + Font Awesome, DataTables (1.10.x) for reports, SignalR client (stubbed off), ASP.NET AJAX UpdatePanel (dashboard auto-refresh, 90s async timeout), modernizr.
- **Backend**: .NET Framework 4.0.30319, ASMX ScriptServices, session-based auth, per-request event validation.
- **Data feed**: external `wizardnew.com` REST odds API (Betfair-format), Betfair-style ids end-to-end.
- **Edge**: Cloudflare (proxy + RUM), LuckyOrange analytics.
- **TeenPatti TV**: `shivexch.com` iframe + `65.0.200.145` asset host.

---

## Appendix A - Evidence Files

- `.firecrawl/ib77-dashboard.html` — authenticated dashboard (Dealer, wallet 32000, 3 cricket markets)
- `.firecrawl/pages/*.html` — all 22 page captures (dashboard tabs, Match, MyBook, TossBook, Blockmarket, addusers, UsersList, profile, AccountSummery, ChipStatement, ChipSummary, ProfitLossNew, UserPLReport, MaxLimit, MatchBookTeenpatti t20, ClientProfitLoss, change-password)
- `.firecrawl/ib77-cookies.json` — post-login session cookies
- `.firecrawl/ib77-netlog*.json` — full network logs (requests/responses/console)
- `.firecrawl/ib77-odds.json` — public wizardnew odds feed sample
- `.firecrawl/ib77-news.json`, `ib77-dlbook.json`, `ib77-cookies.txt` — API samples
- `.firecrawl/ib77-wsdl.xml`, `ib77-login-response.html` — 500/error-page evidence
- `scripts/ib77_login.py`, `ib77_login_retry.py`, `ib77_browser_login.py`, `ib77_explore.py`, `ib77_explore2.py`, `ib77_probe_*.py`, `ib77_*.py` — full reproduction toolchain (credentials in `scripts/ib77_login*.py`, not in this report)