import re, glob, sys

for f in glob.glob(".firecrawl/pages/Match.aspx*"):
    t = open(f, encoding="utf-8", errors="replace").read()
    print(f"#### {f}")
    btns = sorted(set(re.findall(r'id="[^"]*(?:btn|lnk|Btn|Lnk)[^"]*"', t)))
    for b in btns[:50]:
        print("  ", b)
    print("  -- submit values --")
    for v in sorted(set(re.findall(r'type="submit"[^>]*value="([^"]*)"', t))):
        print("  ", v)