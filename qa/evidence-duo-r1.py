#!/usr/bin/env python3
"""QA for source-labelled evidence cards; preview only until disclosure permission is confirmed."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parent.parent
out=root/"qa"/"evidence-duo-r1"
out.mkdir(parents=True,exist_ok=True)
MAIN=(root/"index.html").read_text(encoding="utf-8")
NOV=(root/"november-fast-a-r8.html").read_text(encoding="utf-8")
checks=[];issues=[]
def check(cond,label):
 if not cond:raise AssertionError(label)
 checks.append(label)
check((2350-877)==1473 and round((2350-877)/877*100)==168,"Place inflow arithmetic exact")
check(193000000-172000000==21000000 and round((193000000-172000000)/172000000*100,1)==12.2,"Restaurant revenue arithmetic exact")
for src,name in [(MAIN,"home"),(NOV,"R8")]:
 check(src.count('class="wp-evidence-duo"')==1,f"Evidence section unique on {name}")
 check('웰니스 B' in src and '음식점 A' in src,f"Independent source labels on {name}")
 check('877회' in src and '2,350회' in src,f"Correct detailed inflow in {name}")
 check('1억 7,200만 원' in src and '1억 9,300만 원' in src,f"Correct monthly revenue in {name}")
 check('단독으로 만들었다고 단정할 수 없습니다' in src,f"No causality claim in {name}")
 check('원본 관리자 화면·매출 원장 및 외부 공개 권한은 최종 대조가 필요합니다' in src,f"Evidence status qualified on {name}")
check('id="nov-wizard"' in NOV and 'id="more-weplace"' in NOV,"Inquiry and return CTA preserved")
check('aria-label="RESOLUTE V IT FAST.' not in NOV,"Removed V not reintroduced")
check('id="request-dialog"' in MAIN and 'id="experience"' in MAIN,"Home preserved")
check(MAIN.count('id="landing-title"')==1 and NOV.count('id="campaign-hook-title"')==1,"Original heading hierarchy preserved")
check('evidence-duo-r1.css' in MAIN and 'evidence-duo-r1.css' in NOV,"Shared CSS applied")

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,channel="chrome")
 for w,h in [(360,740),(390,844),(768,1024),(1440,900)]:
  ctx=browser.new_context(viewport={"width":w,"height":h},device_scale_factor=1,reduced_motion="reduce")
  for page_name,url in [("home","/index.html"),("nov","/november-fast-a-r8.html")]:
   page=ctx.new_page()
   page.on("pageerror",lambda e:issues.append(str(e)))
   page.on("response",lambda resp: issues.append(f"HTTP {resp.status}: {resp.url}") if resp.status>=400 and resp.url.startswith("http://127.0.0.1:4173/") else None)
   response=page.goto("http://127.0.0.1:4173"+url,wait_until="domcontentloaded")
   check(response and response.status==200,f"{page_name} HTTP 200 at {w}")
   page.locator("#observed-records").scroll_into_view_if_needed()
   check(page.locator(".wp-ev-card").count()==2,f"{page_name} has exactly two cards at {w}")
   overflow=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
   check(overflow<=4,f"{page_name} no horizontal scrolling at {w}")
   cards=page.locator("#observed-records")
   cards.screenshot(path=str(out/f"{page_name}-evidence-{w}.png"),animations="disabled",timeout=30000)
   if page_name=="home":
    check(page.locator("#landing-title").inner_text().count("+168%")==1,f"Hero +168 at {w}")
   else:
    check(page.locator('#first-look button[data-focus="photo"]').count()==1,f"Old R8 comparison intact at {w}")
   page.close()
  ctx.close()
 nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
 p=nojs.new_page();p.goto("http://127.0.0.1:4173/november-fast-a-r8.html",wait_until="domcontentloaded")
 check(p.locator("#observed-records .wp-ev-card").count()==2,"Evidence charts have a static no-JS representation")
 nojs.close()
 browser.close()
report={"checks":len(checks),"issues":issues}
(out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
if issues:raise AssertionError(str(issues))
