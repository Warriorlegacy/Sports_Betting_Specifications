import re, requests, urllib3
urllib3.disable_warnings()
BASE = "https://indianbet77.live/OldVersion/dl/"
LOGIN = BASE + "index.aspx"

def attempt(label, extra_fields, target=None, with_ref=True):
    s = requests.Session()
    s.headers.update({"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language":"en-US,en;q=0.9"})
    if with_ref:
        s.headers["Referer"] = LOGIN
    r = s.get(LOGIN, verify=False, timeout=30)
    def field(n):
        m = re.search(r'name="'+n+r'"\s+(?:id="'+n+r'"\s+)?value="([^"]*)"', r.text)
        return m.group(1) if m else ""
    data = {"__EVENTTARGET": target or "", "__EVENTARGUMENT":"",
        "__VIEWSTATE":field("__VIEWSTATE"), "__VIEWSTATEGENERATOR":field("__VIEWSTATEGENERATOR"),
        "__EVENTVALIDATION":field("__EVENTVALIDATION"),
        "txt_phone":"Karan01","txt_password":"Rahul@8789","LinkButton1":"Log In"}
    data.update(extra_fields)
    r = s.post(LOGIN, data=data, verify=False, timeout=30, allow_redirects=True)
    tag = "DASH!" if "dashboard" in r.url else ("LOGIN" if "txt_phone" in r.text else "OTHER")
    print(f"{label:50s} -> {r.status_code} final={r.url[:70]} [{tag}]")
    return s, r

attempt("target=LinkButton1, no remember", {}, target="LinkButton1")
attempt("no target, no remember", {})
attempt("target=LinkButton1, remember=on", {"remember":"on"}, target="LinkButton1")