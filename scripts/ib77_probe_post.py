import re, requests, urllib3, sys
urllib3.disable_warnings()
BASE = "https://indianbet77.live/OldVersion/dl/"
LOGIN = BASE + "index.aspx"

s = requests.Session()
s.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": LOGIN,
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
print("status:", r.status_code, "final:", r.url)
m = re.search(r"<pre[^>]*>(.*?)</pre>", r.text, re.S)
if m:
    txt = re.sub(r"<[^>]+>", "", m.group(1))
    print(txt[:5000])
else:
    print(r.text[:1500])