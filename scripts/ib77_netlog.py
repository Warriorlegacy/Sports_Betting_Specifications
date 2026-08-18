import json, sys

path = sys.argv[1] if len(sys.argv) > 1 else ".firecrawl/ib77-netlog.json"
net = json.load(open(path, encoding="utf-8"))
seen = set()
for e in net:
    key = (e["t"], e.get("method", ""), e["url"])
    if key in seen:
        continue
    seen.add(key)
    if e["t"] == "req":
        print(f"REQ  {e.get('method',''):6s} [{e.get('rt','')[:8]:8s}] {e['url'][:150]}")
    elif e["t"] == "resp":
        print(f"RESP      [{e['status']}] {e['url'][:150]}")
    else:
        print(f"CONSOLE [{e['type']}] {e['text'][:120]}")