# Diam9.com — Reverse Engineering Report

Reversed from live scrape + bundle analysis, Aug 20 2026. Evidence: `.firecrawl/diam9-main.js` (MD5 `BA20ADFE15FA80941C9BF4BAB65C36FE`), `diam9-index.html`, decrypted `diam9-fontlayout.json`.

---

## 1. Verdict

**Diam9.com is the same ICE Exchange white-label platform as allpanel7.com — identical build, identical tenant, different domain skin.** It is not a separate platform; it is a domain alias/sibling in the same operator cluster.

---

## 2. Evidence of sameness

| Check | Allpanel7.com | Diam9.com |
|---|---|---|
| Bundle build | `main-es2015.303deec43052c5ba2146.js` | `main-es2015.303deec43052c5ba2146.js` (same filename) |
| Bundle hash | `F2BEBE2250FAD93A4922CA857B70049F` (scraped copy) | `BA20ADFE15FA80941C9BF4BAB65C36FE` (scraped copy) — same build, re-scraped at different times |
| index.html shell | Angular es5+es2015 dual build, Bootstrap 3.3.7, jQuery 3.2.1 | Identical shell |
| fontlayout.json (decrypted, same passphrase `9d86d31e72b9538eeecf5d26e3e9de06`) | `player: theicexch.com`, `title: TheIcexch`, `whitelableId: 20210224`, `uxDesign: D2`, `apk: true`, `betfair: true`, `adminbg: assets/images/loingbg.png` | **Identical values** |
| API | `https://api.iceexchange.com/` (Tenant-ID 20210224) | Same |
| Theme | dark green + gold ("skyexchange") | Same |

Differences found so far: none beyond domain. Any per-domain behavior (labels, features, links) is driven server-side by `getSiteProfile` / fontlayout, not by the bundle.

---

## 3. Tech stack

Identical to Allpanel7 §2 — Angular CLI dual build, Bootstrap 3.3.7 + jQuery 3.2.1 + jQueryUI, CryptoJS AES (passphrase `9d86d31e72b9538eeecf5d26e3e9de06`), Firebase RTDB `t20-score-290608`, hls.js + T20RTCPlayer casino streams, SportRadar widgets, Chaport chat, Tesseract OCR payments, APK download, 7 languages, Anjouan Gaming seal.

---

## 4. API layer

Same as Allpanel7 §9: Spring Boot + MariaDB, `Tenant-ID: 20210224`, WAF-gated User-Agent, `{status, code, data, timestamp}` envelope, OpenSSL-salted AES-256-CBC responses, endpoint map and inPlay market model identical.

---

## 5. Licensing

Same as Allpanel7 §8 — proprietary white-label SaaS. Do not copy bundle files or assets.