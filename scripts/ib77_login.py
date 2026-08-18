import re
import requests
import sys
import urllib3

urllib3.disable_warnings()

BASE = "https://indianbet77.live/OldVersion/dl/"
LOGIN_URL = BASE + "index.aspx"
DASH_URL = BASE + "dashboard.aspx"
USER = "Karan01"
PASS = "Rahul@8789"

s = requests.Session()
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
})

r = s.get(LOGIN_URL, verify=False, timeout=30)
print(f"GET {LOGIN_URL} -> {r.status_code} ({len(r.content)} bytes)")
print("cookies after GET:", {k: v[:20] for k, v in s.cookies.get_dict().items()})
if r.status_code != 200:
    print(r.text[:1000])
    sys.exit(1)

def field(name):
    m = re.search(r'name="' + name + r'"\s+id="' + name + r'"\s+value="([^"]*)"', r.text)
    if not m:
        m = re.search(r'name="' + name + r'"\s+value="([^"]*)"', r.text)
    return m.group(1) if m else ""

vs = field("__VIEWSTATE")
vsg = field("__VIEWSTATEGENERATOR")
ev = field("__EVENTVALIDATION")
print("VIEWSTATE len:", len(vs), "| VSG:", vsg, "| EVENTVALIDATION len:", len(ev))

data = {
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": vs,
    "__VIEWSTATEGENERATOR": vsg,
    "__EVENTVALIDATION": ev,
    "txt_phone": USER,
    "txt_password": PASS,
    "remember": "on",
    "LinkButton1": "Log In",
}
r = s.post(LOGIN_URL, data=data, verify=False, timeout=30, allow_redirects=True)
print(f"POST {LOGIN_URL} -> {r.status_code} ({len(r.content)} bytes)")
print("final URL:", r.url)
print("cookies after POST:", {k: v[:30] for k, v in s.cookies.get_dict().items()})
open(".firecrawl/ib77-login-response.html", "w", encoding="utf-8", errors="replace").write(r.text)

if "Log In" in r.text and "txt_phone" in r.text:
    print("!! still on login page - check for error message")
    m = re.search(r'class="alert[^"]*"[^>]*>(.*?)</div>', r.text, re.S)
    if m:
        print("alert:", m.group(1).strip())
elif r.url.endswith("dashboard.aspx") or "dashboard" in r.url:
    print("!! LOGIN SUCCESS -> dashboard")

r = s.get(DASH_URL, verify=False, timeout=30)
print(f"GET {DASH_URL} -> {r.status_code} ({len(r.content)} bytes)")
open(".firecrawl/ib77-dashboard.html", "w", encoding="utf-8", errors="replace").write(r.text)
m = re.search(r'<title>(.*?)</title>', r.text, re.S)
print("dashboard title:", m.group(1).strip() if m else "?")