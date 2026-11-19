#!/usr/bin/env python3
"""QA for isolated LuWei image-sequence preview. No production publish or data sent."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parent.parent
out=root/"qa"/"luwei-case-review"
out.mkdir(parents=True,exist_ok=True)
report={"checks":[],"errors":[]}
def check(cond,msg):
 if not cond: raise AssertionError(msg)
 report["checks"].append(msg)
html=(root/"cases/luwei-first-look/index.html").read_text(encoding="utf-8")
check('noindex,nofollow' in html,"Only preview page, not indexed")
check('luwei-exterior-crop.webp' in html and 'luwei-peking-duck-1254.webp' in html,"Both supplied image compositions referenced")
check('877회' not in html and '2,100만 원' not in html,"No unsupported sales effect attributed to photos")
check('매출이 상승했다는 뜻은 아닙니다' in html,"Explicit no-causality disclosure")
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,channel="chrome")
 for w,h in [(360,740),(390,844),(768,1024),(1440,900)]:
  context=b.new_context(viewport={"width":w,"height":h},reduced_motion="reduce")
  p=context.new_page()
  p.on("pageerror",lambda err:report["errors"].append(str(err)))
  p.on("response",lambda resp:report["errors"].append(f"{resp.status}: {resp.url}") if resp.status>=400 and resp.url.startswith("http://127.0.0.1:4173/") else None)
  res=p.goto("http://127.0.0.1:4173/cases/luwei-first-look/",wait_until="domcontentloaded")
  check(res.status==200,f"HTML 200 {w}")
  p.wait_for_timeout(240)
  check(p.locator("#luwei-title").is_visible(),f"Intro visible {w}")
  p.locator("#luwei-scene").scroll_into_view_if_needed()
  check(p.locator("#luwei-before img").count()==1 and p.locator("#luwei-after img").count()==1,f"Two sources {w}")
  p.locator("#luwei-skip").click()
  check(p.locator("#luwei-stage").get_attribute("data-phase")=="after",f"Skip displays duck {w}")
  p.locator("#luwei-visual").screenshot(path=str(out/f"luwei-duck-{w}.png"),animations="disabled")
  check(p.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")<=4,f"No width overflow {w}")
  context.close()
 static=b.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
 p=static.new_page();p.goto("http://127.0.0.1:4173/cases/luwei-first-look/",wait_until="domcontentloaded")
 check(p.locator("#luwei-before").count()==1,"Without JS initial still exists")
 static.close()
 b.close()
(out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"checks":len(report["checks"]),"errors":report["errors"]},ensure_ascii=False))
if report["errors"]: raise AssertionError(str(report["errors"]))
