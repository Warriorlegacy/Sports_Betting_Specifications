import re, glob

targets = ["AccountSummery", "UsersList", "ProfitLossNew", "ChipStatement", "ChipSummary", "MaxLimit", "addusers", "profile", "Blockmarket", "TossBook", "ClientProfitLoss", "MatchBookTeenpatti"]
for f in glob.glob(".firecrawl/pages/*.html"):
    if not any(t in f for t in targets):
        continue
    t = open(f, encoding="utf-8", errors="replace").read()
    print(f"#### {f.split('/')[-1]}")
    th = sorted(set(re.findall(r"<th[^>]*>(.*?)</th>", t, re.S)))
    th = [re.sub(r"<[^>]+>", "", x).strip() for x in th]
    th = [x for x in th if x]
    if th:
        print("   TH:", " | ".join(th[:25]))
    flds = sorted(set(re.findall(r'<input[^>]*placeholder="([^"]+)"', t)))
    if flds:
        print("   INPUTS:", " | ".join(flds[:20]))
    lbls = sorted(set(re.findall(r"<label[^>]*>(.*?)</label>", t, re.S)))
    lbls = [re.sub(r"<[^>]+>", "", x).strip() for x in lbls]
    lbls = [x for x in lbls if x and len(x) < 50]
    if lbls:
        print("   LABELS:", " | ".join(lbls[:20]))
    print()