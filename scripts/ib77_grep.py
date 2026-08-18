import re, sys, glob

for pat in [r'__doPostBack\([^)]{0,80}\)', r'\.asmx/[A-Za-z]+', r'href="[a-zA-Z0-9?&=._-]+"',
            r'wizardnew[^"\' ]{0,80}', r'var urls[^;]{0,120}', r'\.getJSON\([^)]{0,100}\)']:
    print(f"===== {pat} =====")
    for f in glob.glob(".firecrawl/pages/*.html"):
        t = open(f, encoding="utf-8", errors="replace").read()
        hits = sorted(set(re.findall(pat, t)))
        if hits:
            print(f"-- {f.split('/')[-1]}")
            for h in hits[:25]:
                print("   ", h[:150])