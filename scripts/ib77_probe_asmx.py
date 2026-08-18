import json, requests, urllib3
urllib3.disable_warnings()
ck = {c["name"]: c["value"] for c in json.load(open(".firecrawl/ib77-cookies.json"))}
H = {"User-Agent": "Mozilla/5.0", "Cookie": "; ".join(f"{k}={v}" for k, v in ck.items())}

tests = [
    ("sget1", "https://indianbet77.live/AjaxSession.asmx/sget1?Id=35948041&Mid=13754&uid=224428"),
    ("getDLBook", "https://indianbet77.live/AjaxSession.asmx/getDLBook?MatchID=13754&userid=224428"),
    ("getDLTossBook", "https://indianbet77.live/AjaxSession.asmx/getDLTossBook?MatchID=13754"),
    ("GetInnerData", "https://indianbet77.live/AjaxSession.asmx/GetInnerData?uid=224428"),
    ("GetCasinoOdds", "https://indianbet77.live/OddsService.asmx/GetCasinoOdds?matchid=t20"),
]
for name, url in tests:
    try:
        r = requests.get(url, headers=H, verify=False, timeout=15)
        body = r.text[:400].replace("\n", " ")
        print(f"{name:14s} {r.status_code} {body}")
    except Exception as e:
        print(f"{name:14s} ERR {str(e)[:80]}")
    print()