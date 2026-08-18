import re, requests, urllib3, time
urllib3.disable_warnings()
LOGIN = "https://indianbet77.live/OldVersion/dl/index.aspx"

def try_login():
    s = requests.Session()
    s.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": LOGIN,
        "Connection": "keep-alive",
    })
    r = s.get(LOGIN, verify=False, timeout=30)
    def f(n):
        m = re.search(r'name="' + n + r'"\s+(?:id="' + n + r'"\s+)?value="([^"]*)"', r.text)
        return m.group(1) if m else ""
    data = {
        "__EVENTTARGET": "", "__EVENTARGUMENT": "",
        "__VIEWSTATE": f("__VIEWSTATE"),
        "__VIEWSTATEGENERATOR": f("__VIEWSTATEGENERATOR"),
        "__EVENTVALIDATION": f("__EVENTVALIDATION"),
        "txt_phone": "Karan01", "txt_password": "Rahul@8789",
        "LinkButton1": "Log In",
    }
    r = s.post(LOGIN, data=data, verify=False, timeout=30, allow_redirects=True)
    return s, r

for i in range(8):
    s, r = try_login()
    tag = "DASH!" if "dashboard" in r.url else ("LOGIN" if "txt_phone" in r.text else "OTHER")
    print(f"try {i}: {r.status_code} final={r.url[:60]} [{tag}] session={s.cookies.get('ASP.NET_SessionId','')[:24]}")
    if tag == "DASH!":
        open(".firecrawl/ib77-dashboard.html", "w", encoding="utf-8", errors="replace").write(r.text)
        open(".firecrawl/ib77-cookies.txt", "w").write(str(dict(s.cookies)))
        print("SAVED dashboard + cookies")
        break
    time.sleep(1)