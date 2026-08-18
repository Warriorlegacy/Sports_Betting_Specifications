import re, glob

for f in glob.glob(".firecrawl/pages/UsersList*"):
    t = open(f, encoding="utf-8", errors="replace").read()
    rows = re.findall(r"<tr[^>]*id=\"[^\"]*Rpt[^\"]*\"[^>]*>(.*?)</tr>", t, re.S)
    print(f"{f}: {len(rows)} rows")
    for r in rows[:8]:
        cells = re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)
        clean = [re.sub(r"<[^>]+>", " ", c).strip().replace("  ", " ") for c in cells]
        line = " | ".join(c[:38] for c in clean)
        print("   ", line[:320])

print()
for f in glob.glob(".firecrawl/pages/*.html"):
    t = open(f, encoding="utf-8", errors="replace").read().lower()
    for kw in ("youtube", "dailymotion", "scorecard", "livetv", "stream", "video", "tv/"):
        if kw in t:
            i = t.find(kw)
            print(f"{f.split(chr(92))[-1]} [{kw}]: ...{t[max(0,i-60):i+80].strip()[:150]}")
            break