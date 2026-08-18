import re, glob

for f in glob.glob(".firecrawl/pages/*.html"):
    t = open(f, encoding="utf-8", errors="replace").read()
    hits = sorted(set(re.findall(r'urls?[0-9]*\s*[:=]\s*["\'][^"\']{5,160}["\']', t)))
    funcs = sorted(set(re.findall(r"function\s+[A-Za-z0-9_]+", t)))
    if hits or funcs:
        print(f"== {f.split('/')[-1]}")
        for h in hits:
            print("  URL:", h[:170])
        for fn in funcs:
            if fn not in ("function __doPostBack",):
                print("  FN :", fn)