import json, sys, time
from playwright.sync_api import sync_playwright

BASE = "https://indianbet77.live/OldVersion/dl/"
URL = BASE + "index.aspx"
OUT = ".firecrawl/ib77-netlog.json"

netlog = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=[
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
    ])
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        locale="en-US",
        viewport={"width": 1440, "height": 900},
    )
    page = ctx.new_page()

    def on_request(req):
        if req.resource_type in ("document", "xhr", "fetch", "script", "stylesheet", "image"):
            netlog.append({"t": "req", "url": req.url, "method": req.method, "rt": req.resource_type,
                           "post": (req.post_data or "")[:400]})

    def on_response(resp):
        netlog.append({"t": "resp", "url": resp.url, "status": resp.status})

    def on_console(msg):
        if msg.type in ("error", "warning"):
            netlog.append({"t": "console", "type": msg.type, "text": msg.text[:300]})

    page.on("request", on_request)
    page.on("response", on_response)
    page.on("console", on_console)

    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    time.sleep(3)
    print("page title:", page.title())

    page.fill("#txt_phone", "Karan01")
    page.fill("#txt_password", "Rahul@8789")
    page.click("#LinkButton1")
    try:
        page.wait_for_url("**/dashboard.aspx*", timeout=45000)
        print("LOGIN OK ->", page.url)
    except Exception:
        print("no dashboard redirect; url:", page.url)
    time.sleep(4)

    html = page.content()
    open(".firecrawl/ib77-dashboard.html", "w", encoding="utf-8", errors="replace").write(html)
    cookies = ctx.cookies()
    open(".firecrawl/ib77-cookies.json", "w").write(json.dumps(cookies, indent=1))
    open(OUT, "w", encoding="utf-8").write(json.dumps(netlog, indent=1))
    print("saved dashboard html:", len(html), "bytes | cookies:", len(cookies), "| netlog:", len(netlog))
    browser.close()