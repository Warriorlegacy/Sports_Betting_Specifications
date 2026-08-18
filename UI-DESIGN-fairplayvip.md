# fairplayvip.in — UI Design Specification (for exact replica)

Source: live scrape of https://www.fairplayvip.in + CSS bundle `https://click22frnt.hurry2.com/templates/fairplayexch/assets/index-DNsRGLSx.css` (saved: `.firecrawl/app.css`, 1,005,238 bytes) + screenshot `.firecrawl/assets/home.png`.

## 1. Tech stack

- **Framework**: React + TypeScript (Vite build). CSS assets: `index-DNsRGLSx.css` + 9 route chunks (`chunk-*.js`). Main bundle `app-bundle.js` (3.1MB).
- **CSS**: Bootstrap 5 base (`--bs-*` vars) + custom `bo-*` design tokens. Icons: Font Awesome 6 Free (woff2/ttf, 400/900 weights) + bootstrap-icons.
- **Fonts**: `Lato` / `Lato Hairline` / fallback `Helvetica, Arial, sans-serif` (Bootstrap default stack).
- **Theming**: dark mode default; light mode via `:root.light` class; toggle buttons switch `dark-mode-BmqJVb2n.svg` / `light-mode-DgcBPrMx.svg`.
- **Backend (API)**: 9 services (see REPORT-fairplayvip.md Appendix A). CDN: `click22frnt.hurry2.com/templates/fairplayexch/assets/` (front assets), `assets3.hurry2.com` (logo, APK).

## 2. Color system

### Core tokens (`:root`)
| Token | Value |
|---|---|
| `--bo-primary` | `#f36c21` (brand orange) |
| `--bo-red` | `#FF4148` |
| `--bo-green` / `--bo-secondary` | `#27AE60` / `#4caf50` |
| `--bo-black` | `#212121` |
| `--bo-white` | `#ffffff` |
| `--bo-warning` | `#ffc107` |
| `--bo-danger` | `var(--bo-red)` |
| `--primary-color` | `#000` (dark mode text) |
| `--bo-body-bg-rgb` | `238,238,238` |

### FA theme tokens
`--fa-primary-color:#0094de`, `--fa-text-color:#00223C`, `--fa-grey-color:#ADADAD`, `--fa-disable-bg-color:#DFDFDF`, `--fa-secondary-color:var(--bo-primary)`.

### Light mode (`:root.light`)
`--bo-white:#000; --body-bg:#fff; --light-bg:#ccc; --white-text:#fff; --dark-text:#000; --light-dark-text:#272727; --light-gray-text:#404040`.

### Admin-injected override (site CSS)
`--primary_clr:#f04c44; --seclight_bg:#0a626a; --header_clr:#054146; --login_button_color:#ed172f; --login_bkg_color:#054146`.

### Gradients
- Active market: `linear-gradient(90deg,#135C63 0%,#107A85 50%,#135C63 100%)` (teal)
- Red variant: `linear-gradient(90deg,#C7332A 0%,#E05048 37%,#9E1421 100%)`
- Header accent: `linear-gradient(90deg,#f36c21 0%,rgba(248,172,26,.03) 110%)`

### Most-used colors (frequency in CSS)
`#fff`(1123), `#000`(504), `#f36c21`(172), `#ccc`(98), `#1e1e1e`(83), `#333`(82), `#dadada`(61), `#272727`(52), `#4caf50`(45), `#f26c20`(44), `#212529`, `#6c757d`, `#eee`, `#0d6efd`, `#323232`, `#f8f9fa`, `#ffc107`, `#dc3545`, `#353535`, `#dee2e6`, `#198754`, `#ff5252`, `#e9ecef`.

## 3. Typography

- Base: Bootstrap default (`font-family:var(--bs-body-font-family)`).
- Size distribution: 14px (393 uses), 12px (266), 13px (230), 16px (167), 11px (101) — dense sportsbook UI.
- Login/primary buttons: uppercase, weight 700.

## 4. Layout (desktop)

1. **Header** — logo (`assets3.hurry2.com/site_logo/fairplayvip8252.png`), Register button, dark/light toggle, links (Market / About / Privacy / FAQs / T&C), language selector, "Download App", WhatsApp icon. Mobile: hamburger.
2. **User menu (logged out → Register/Login modal)** — logged-in sidebar menu: One Click Bet, Display name, Wallet Amount "Inclusive bonus 0.00", Net Exposure, Deposit / Withdraw / Welcome Bonus, Play With Bonus, Refer and Earn, 2FA, Affiliate, Favorites, Open Bets, Settled Bets, Completed Events, Statements, Betting P&L, My Transactions, My Wallet, Stake Settings, Notification, Add Mobile Number, Reset Password, Rules & Regulations, Connect WhatsApp, Logout.
3. **Main nav tabs** — inplay, Fantasy Pro, Sportbook, Live Casino, Crash Games (icons: `inplay.a7c4dae-*.webp`, `fantasybookicon.225b8cb-*.webp`, `sportbook_icon-*.svg`, `casino-BnBk6FL5.webp`, `crash-img-d4T8ANqx.webp`).
4. **Left sidebar (sports list)** — cricket, soccer, tennis, baseball, basketball, + "All Sports"; icons `assets/sports-*.png` (16 sports PNGs); LIVE / VIRTUAL tabs; per-sport counts.
5. **Event list** — event cards: match title (link to `/sports-event-detail/{event_id}`), hotspot icon (`hotspot-CjAKvLKa.webp`), 6 odds columns (3 back + 3 lay, blue/red/pink), date & time, `Min : 100 [min-max-icon-BIsl0oNE.svg] Max : 100000`.
6. **Footer** — download-app banner ("DOWNLOAD THE APP" → `/4516fairplayvip.apk`), payment method icons (UPI, GPay, Paytm, PhonePe, Bitcoin, Ethereum, Tether, PayPal, Rupee), social (WhatsApp `whatsapp-DAYLN6oX.webp`), copyright.

## 5. Key components

| Component | Style |
|---|---|
| `.login-btn` | bg `var(--bo-primary)`, white text, radius 30px, padding 10px 25px, uppercase 700 |
| `.login-btn1` | full-width, radius 5px, `--bo-primary` bg; `.demo-login-btn` variant green `#4caf50` |
| `.register-btn` | same family, 6px 12px, 13px |
| `.header-sec` / `.header-nav` | flex, space-between, align-end |
| `.bet-slip-tabs-sec` | bg `#272727`, radius 5px, padding 10px 0 |
| Bet-slip tabs | uppercase 11px 500; active: `color:var(--bo-primary)` + 2px bottom border |
| Back/Lay odds | 3+3 column grid (blue `#0d6efd`-family back, pink/red `#dc3545`-family lay) |
| Active market | teal gradient `#135C63→#107A85` |
| `.light` overrides | text `#000`, body `#fff` |

## 6. Asset inventory (all in `.firecrawl/assets/`)

Downloaded: `fairplayvip8252.png` (logo, 36.7KB), `home.png` (full-page screenshot), `hotspot-CjAKvLKa.webp`, `min-max-icon-BIsl0oNE.svg`, `dark-mode-BmqJVb2n.svg`, `light-mode-DgcBPrMx.svg`, `sports-{cricket,soccer,tennis,baseball,basketball,no}-*.png`, `inplay.a7c4dae-*.webp`, `sportbook_icon-CaAh8qoq.svg`, `casino-BnBk6FL5.webp`, `crash-img-d4T8ANqx.webp`, `whatsapp-DAYLN6oX.webp`, `upcoming-BjzesQyb.webp`, `virtual-DN0Kn2Ku.webp`, `live-card.c981209-*.webp`, `fantasybookicon.225b8cb-*.webp`.

Remaining referenced assets (full list in `.firecrawl/fairplayvip.in.md`): `about-us-icons-ZvEYXeJC.webp`, `affiliate-Myuz2yd-.svg`, `bet-soft-Y9Iqs48R.webp`, `bitcoin-C_J2HZrD.webp`, `blog-icon-new-Bw1Tf0b3.webp`, `casino-live-CM-wC5zs.webp`, `chatbot-icon-DwYTiwrV.svg`, `completed-events-icon-3Arz6eXm.svg`, `cricket-DQt4hqpq.webp`, `download-app-xGpE8edG.webp`, `election_icon-CpUMjIYd.png`, `ethereum-cYvWBUCB.webp`, `evolution_img-ybv5aonK.png`, `faqs-B5NL0HY-.webp`, `favorites-C_gfrvJH.webp`, `fifa_cup-Bg_B0u7G.png`, `gold-pot-B7mS4MfM.webp`, `gpay-Cr2DNozE.webp`, `inplay_icon12-C-AzeerO.webp`, `inplayico.40798d4-AajJC3tM.webp`, `kabaddi_icon-BcnsHPmM.png`, `live-cards-DYPFYvZ8.webp`, `live-casino.761f895-BNzi9kZU.webp`, `market-BBtpt5fr.webp`, `menu-icon-2fa-BQZoQb6K.svg`, `microgaming-wBAzRr4K.webp`, `more_icon-CY7hsN93.svg`, `more_icon_light-B0WVj5zW.svg`, `paypal-Ch4mDE0y.webp`, `paytm-D2MVaJKW.webp`, `privacy-policy-BglyuZF_.webp`, `promot-DiiIi1ve.gif`, `referal_icon-ByiGe1GL.png`, `reset_password-BE95Lq8X.webp`, `rubgy-DEIFbicF.webp`, `rules-wD3-dUmU.webp`, `rupi-DsFXNfD-.webp`, `settings-B4ppVq3H.webp`, `settled-icon-BL7KnRW8.svg`, `Slot-game-C7XW7c9F.webp`, `slot-games.ccf3217-BhEA8a54.webp`, `soccer.9f718cc-CuG5LU6J.webp`, `sportbook_icon_light-p5rFJEKF.svg`, `sportexch_icon-5KliwU5u.svg`, `sportexch_icon_light--Ua2fVTP.svg`, `sports-{american-football,australian-rules,esports,gaelic-football,greyhound-racing,handball,ice-hockey,mixed-martial-arts,snooker,volleyball}-*.png`, `statements-icon-ZiF5b8Er.svg`, `tennis.fc30791-tQO0tAGr.webp`, `tether-CMAqZP0L.webp`, `transactions-DJDD5huZ.webp`, `update-phone-8vKpgrrx.svg`, `upi-DbPF5oog.webp`, `user-wallet-icon-CTOHSvqj.webp`, `whatsapp-QsJUDxbC.png`, `whatsapp1-BhO52h3Q.png`, `winner_cup-BBlE921h.png`, `world-BcbIijKx.webp`.

All URLs share prefix: `https://click22frnt.hurry2.com/templates/fairplayexch/assets/{name}` (logo + APK on `assets3.hurry2.com`).

## 7. Rebuild recipe

1. Use `.firecrawl/app.css` verbatim as the stylesheet (drop-in); keep the `:root` tokens + `:root.light` overrides.
2. Copy assets above into `public/assets/` (or serve from same path).
3. Recreate layout sections per §4 with the component classes in §5.
4. Wire real odds data via the verified API endpoints (REPORT-fairplayvip.md Appendix A).
5. Match breakpoints: sidebar collapses under `768px` (mobile hamburger + bottom nav per bootstrap-responsive CSS in app.css).