import re, glob, sys

files = sys.argv[1:] if len(sys.argv) > 1 else glob.glob(".firecrawl/pages/MyBook*")
for f in files:
    t = open(f, encoding="utf-8", errors="replace").read()
    blocks = re.findall(r"<script[^>]*>(.*?)</script>", t, re.S)
    print(f"########## {f} ({len(blocks)} script blocks)")
    for i, b in enumerate(blocks):
        b = b.strip()
        if not b or b.startswith("//<![CDATA["):
            continue
        if any(k in b for k in ("asmx", "getJSON", "ajax", "urls", "getDL", "sget", "wizard", "hub.", "signalr", "OddsService")):
            print(f"--- block {i} ---")
            print(b[:6000])
            print()