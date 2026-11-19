#!/usr/bin/env python3
"""Minimal GA4 release QA: consent boundary + baseline operational paths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"qa"/"ga4-release"
OUT.mkdir(parents=True,exist_ok=True)
BASE="http://127.0.0.1:4173"
checks=[];errors=[]
def ok(v,n):
 if not v:raise AssertionError(n)
 checks.append(n)
def mock(route):
 route.fulfill(status=200,body="/* Google tag mocked; no real network collection */",content_type="application/javascript")
for filename in ("index.html","november-fast-a-r8.html"):
 html=(ROOT/filename).read_text(encoding="utf-8")
 ok("weplace-consent-analytics-r1.js" in html,f"{filename} consent loader inserted")
 ok(html.count('id="wp-consent-panel"')==1,f"{filename} exactly one consent panel")
 ok("G-FVCYL26FTL" not in html,f"{filename} GA4 not inserted as duplicate inline snippet")
 ok('id="observed-records"' not in html and "luwei-scene" not in html,f"{filename} contains no unapproved metrics/photos")
ok((ROOT/"analytics-info/index.html").exists(),"Analytics info page present")
with sync_playwright() as pw:
 b=pw.chromium.launch(channel="chrome",headless=True)
 for width,height in [(360,740),(390,844),(1440,900)]:
  ctx=b.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
  requests=[]
  ctx.on("request",lambda req:requests.append(req.url) if "googletagmanager.com/gtag/js" in req.url else None)
  ctx.route("https://www.googletagmanager.com/**",mock)
  for name,path in [("home","/index.html"),("R8","/november-fast-a-r8.html")]:
   page=ctx.new_page()
   page.on("pageerror",lambda err:errors.append(str(err)))
   response=page.goto(BASE+path,wait_until="domcontentloaded")
   ok(response.status==200,f"{name} returns 200 at {width}")
   page.wait_for_timeout(250)
   if name=="home":
    ok(page.locator("#landing-title").is_visible(),f"Home H1 visible at {width}")
    ok(page.locator("#request-dialog").count()==1,f"Home inquiry intact {width}")
   else:
    ok(page.locator("#nov-wizard").count()==1,f"R8 inquiry intact {width}")
    ok(page.locator("#first-look").count()==1,f"R8 comparison intact {width}")
   over=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
   ok(over<=4,f"{name} no horizontal overflow at {width}")
   if name=="home" and width==390:page.locator("#wp-consent-panel").screenshot(path=str(OUT/"consent-mobile-390.png"))
   if name=="home":
    ok(page.locator("#wp-consent-panel").is_visible(),f"Opt-in banner visible {width}")
    ok(not requests,f"No Google script before opt-in {width}")
    page.locator('[data-wp-choose="rejected"]').click()
    ok(not requests,f"Declined Google scripts at {width}")
   else:
    ok(page.locator("#wp-consent-panel").is_hidden(),f"Decline persists between pages {width}")
   page.close()
  ctx.close()
 ctx=b.new_context(viewport={"width":390,"height":844})
 requests=[]
 ctx.on("request",lambda req:requests.append(req.url) if "googletagmanager.com/gtag/js" in req.url else None)
 ctx.route("https://www.googletagmanager.com/**",mock)
 home=ctx.new_page();home.goto(BASE+"/index.html",wait_until="domcontentloaded")
 home.locator('[data-wp-choose="accepted"]').click()
 home.wait_for_timeout(130)
 ok(len(requests)==1,"Consent triggers one gtag resource fetch")
 conf=home.evaluate("Array.from(window.dataLayer||[],a=>Array.from(a)).filter(v=>v[0]==='config').map(v=>v[1])")
 ok(conf==["G-H9B5F4HRDS","G-FVCYL26FTL"],"Homepage both legacy and requested GA4")
 home.evaluate("window.wpAnalytics.track('evidence_year_select',{year_selected:'2025',store_name:'PRIVATE'})")
 ev=home.evaluate("Array.from(window.dataLayer||[],a=>Array.from(a)).filter(v=>v[0]==='event').slice(-1)[0]")
 ok(ev[1]=="evidence_year_select" and ev[2]["year_selected"]=="2025" and "store_name" not in ev[2],"Event whitelist strips unapproved store data")
 campaign=ctx.new_page();campaign.goto(BASE+"/november-fast-a-r8.html",wait_until="domcontentloaded")
 conf2=campaign.evaluate("Array.from(window.dataLayer||[],a=>Array.from(a)).filter(v=>v[0]==='config').map(v=>v[1])")
 ok(conf2==["G-FVCYL26FTL"],"Campaign config only new stream")
 campaign.locator('#first-look button[data-focus="route"]').click()
 names=campaign.evaluate("Array.from(window.dataLayer||[],a=>Array.from(a)).filter(v=>v[0]==='event').map(v=>v[1])")
 ok("firstlook_select" in names,"R8 firstlook selection event after user consent")
 ctx.close()
 # Denied even after opening settings should never load without pressing accept.
 b.close()
report={"checks":len(checks),"errors":errors}
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
if errors:raise AssertionError(errors)
