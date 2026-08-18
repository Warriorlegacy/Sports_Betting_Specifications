import json, time
from playwright.sync_api import sync_playwright

BASE = "https://indianbet77.live/OldVersion/dl/"
PAGES = [
    "TossBook.aspx?event=13754",
    "ClientProfitLoss.aspx?mid=13754",
    "Match.aspx?eventType=1",
    "Match.aspx?eventType=2",
]
netlog = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled", "--no-sandbox"])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        locale="en-US", viewport={"width": 1440, "height": 900})
    page = ctx.new_page()

    def on_request(req):
        if req.resource_type in ("document", "xhr", "fetch", "script"):
            netlog.append({"t": "req", "url": req.url, "method": req.method, "rt": req.resource_type,
                           "post": (req.post_data or "")[:300]})
    def on_response(resp):
        netlog.append({"t": "resp", "url": resp.url, "status": resp.status})
    page.on("request", on_request)
    page.on("response", on_response)

    page.goto("https://indianbet77.live/index.aspx", wait_until="domcontentloaded", timeout=60000)
    page.fill("#txt_phone", "Karan01")
    page.fill("#txt_password", "Rahul@8789")
    page.click("#LinkButton1")
    page.wait_for_url("**/dashboard.aspx*", timeout=45000)
    time.sleep(2)

    for pg in PAGES:
        try:
            page.goto(BASE + pg, wait_until="domcontentloaded", timeout=45000)
            time.sleep(2.5)
            html = page.content()
            fn = pg.split("?")[0] + "_" + (pg.split("?")[1] if "?" in pg else "main")
            open(f".firecrawl/pages/{fn}.html", "w", encoding="utf-8", errors="replace").write(html)
            print(f"OK {pg} -> {len(html)} bytes")
        except Exception as e:
            print(f"ERR {pg}: {str(e)[:100]}")

    open(".firecrawl/ib77-netlog3.json", "w", encoding="utf-8").write(json.dumps(netlog, indent=1))
    browser.close()