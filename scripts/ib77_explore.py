import json, time
from playwright.sync_api import sync_playwright

BASE = "https://indianbet77.live/OldVersion/dl/"
LOGIN = "https://indianbet77.live/index.aspx"
PAGES = [
    "dashboard.aspx", "dashboard.aspx?eventType=0", "dashboard.aspx?eventType=4",
    "dashboard.aspx?eventType=1", "dashboard.aspx?eventType=2", "dashboard.aspx?eventType=9",
    "Match.aspx?eventType=4", "Blockmarket.aspx", "addusers.aspx", "UsersList.aspx",
    "profile.aspx", "AccountSummery.aspx", "ChipStatement.aspx", "ProfitLossNew.aspx",
    "ChipSummary.aspx", "UserPLReport.aspx", "MaxLimit.aspx",
    "MatchBookTeenpatti.aspx?event=t20", "MyBook.aspx?event=13754",
    "change-password.aspx",
]

GUESSES = [
    "Register.aspx", "Registration.aspx", "Sports.aspx", "SportsList.aspx",
    "Result.aspx", "Results.aspx", "MyBets.aspx", "Bets.aspx", "MarketBook.aspx",
    "FancyBook.aspx", "Casino.aspx", "InPlay.aspx", "SportsBook.aspx",
    "News.aspx", "Rule.aspx", "Rules.aspx", "Commission.aspx", "Credit.aspx",
    "Club.aspx", "Index.aspx", "index.aspx", "AgentList.aspx", "userprofile.aspx",
    "AccountStatement.aspx", "AccountSummary.aspx", "MarketPL.aspx", "PLLive.aspx",
    "LiveMarket.aspx", "CasinoBook.aspx", "Games.aspx", "TeenPatti.aspx",
]
ASMX = [
    "AjaxSession.asmx", "Ajax.asmx", "Master.asmx", "Market.asmx", "Service.asmx",
    "WebService.asmx", "DealerService.asmx", "UserService.asmx", "BetService.asmx",
    "Casino.asmx", "Report.asmx", "Rpt.asmx", "AjaxService.asmx", "DataService.asmx",
    "Account.asmx", "Admin.asmx", "MobileService.asmx", "api.asmx", "Handler.ashx",
]

result = {}
netlog = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled", "--no-sandbox"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        locale="en-US", viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    def on_request(req):
        if req.resource_type in ("document", "xhr", "fetch", "script"):
            netlog.append({"t": "req", "url": req.url, "method": req.method,
                           "rt": req.resource_type, "post": (req.post_data or "")[:300]})
    def on_response(resp):
        netlog.append({"t": "resp", "url": resp.url, "status": resp.status})
    page.on("request", on_request)
    page.on("response", on_response)

    page.goto(LOGIN, wait_until="domcontentloaded", timeout=60000)
    page.fill("#txt_phone", "Karan01")
    page.fill("#txt_password", "Rahul@8789")
    page.click("#LinkButton1")
    page.wait_for_url("**/dashboard.aspx*", timeout=45000)
    time.sleep(2)

    netlog.append({"t": "marker", "url": "LOGGED IN"})

    for pg in PAGES:
        url = BASE + pg
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            time.sleep(2)
            html = page.content()
            title = page.title()
            result[pg] = {"url": page.url, "title": title, "len": len(html)}
            open(f".firecrawl/pages/{pg.split('?')[0]}_{pg.split('?')[1] if '?' in pg else 'main'}.html",
                 "w", encoding="utf-8", errors="replace").write(html)
        except Exception as e:
            result[pg] = {"error": str(e)[:120]}

    cookies = ctx.cookies()
    open(".firecrawl/ib77-cookies.json", "w").write(json.dumps(cookies))
    open(".firecrawl/ib77-netlog2.json", "w", encoding="utf-8").write(json.dumps(netlog, indent=1))

    req = ctx.request
    hdr = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36"}
    cstr = "; ".join(f"{c['name']}={c['value']}" for c in cookies)
    hdr["Cookie"] = cstr

    probe = {}
    for g in GUESSES:
        try:
            r = req.get(BASE + g, headers=hdr, timeout=15000)
            probe["dl/" + g] = r.status
        except Exception:
            probe["dl/" + g] = "ERR"
    for a in ASMX:
        try:
            r = req.get(BASE + a, headers=hdr, timeout=15000)
            probe["dl/" + a] = r.status
        except Exception:
            probe["dl/" + a] = "ERR"
    result["_probes"] = probe
    open(".firecrawl/ib77-pages.json", "w", encoding="utf-8").write(json.dumps(result, indent=1))
    print(json.dumps(result, indent=1)[:4000])
    browser.close()