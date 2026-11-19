#!/usr/bin/env python3
"""QA section exposure: consent, no-PII events, mobile and campaign; no Google traffic."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"qa"/"section-signals-r1"
OUT.mkdir(parents=True,exist_ok=True)
B="http://127.0.0.1:4173"
checks=[];errors=[]
def ck(ok,msg):
 if not ok:raise AssertionError(msg)
 checks.append(msg)
source=(ROOT/"assets/js/weplace-section-signals-r1.js").read_text(encoding="utf-8")
analytics=(ROOT/"assets/js/weplace-consent-analytics-r1.js").read_text(encoding="utf-8")
ck("getState?.()==='accepted'" in source,"Section counter requires explicit opt-in")
ck("document.visibilityState==='visible'" in source and "document.hasFocus()" in source,"Only foreground visible time measured")
ck("innerHeight*.5" in source and "box.height*.5" in source,"Viewport section threshold")
ck("section_view" in analytics and "section_engaged" in analytics,"New GA4 events whitelisted")
ck("section_id" in analytics and "dwell_bucket" in analytics,"Custom dimension params allowlisted")
ck("G-FVCYL26FTL" in analytics and "G-H9B5F4HRDS" in analytics,"Existing streams intact")
ck("isNetlifyPreview" in source and "isNetlifyPreview" in analytics,"Preview traffic excluded")
for path in ("index.html","november-fast-a-r8.html"):
 txt=(ROOT/path).read_text(encoding="utf-8")
 ck(txt.count("weplace-section-signals-r1.js")==1,path+" installs tracker once")
 ck(txt.count("weplace-consent-analytics-r1.js")==1,path+" preserves one consent module")
 ck("wp-consent-panel" in txt,path+" preserves visitor choice")
with sync_playwright() as pw:
 browser=pw.chromium.launch(channel="chrome",headless=True)
 for width in (390,1440):
  context=browser.new_context(viewport={"width":width,"height":844},device_scale_factor=1)
  recorded=[]
  context.on("request",lambda request:recorded.append(request.url) if "googletagmanager.com/gtag/js" in request.url else None)
  context.route("https://www.googletagmanager.com/**",lambda route:route.fulfill(status=200,content_type="application/javascript",body="/* no network; GA tag mocked */"))
  page=context.new_page()
  page.on("pageerror",lambda e:errors.append("JS "+str(e)))
  resp=page.goto(B+"/index.html",wait_until="domcontentloaded")
  ck(resp.status==200,f"Homepage renders {width}")
  page.wait_for_timeout(1400)
  ck(not recorded,f"No external GA tag prior to consent {width}")
  ck(not page.evaluate("Boolean(window.dataLayer?.length)"),f"No GA events prior to consent {width}")
  page.locator('[data-wp-choose="accepted"]').click()
  ck(page.evaluate("window.wpAnalytics.getState()")=="accepted",f"Consent accepted {width}")
  page.bring_to_front()
  page.wait_for_function("""()=>Array.from(window.dataLayer||[]).some(x=>x[0]==='event'&&x[1]==='section_view'&&x[2].section_id==='top')""",timeout=9000)
  ck(True,f"Homepage section_view top after one second {width}")
  page.wait_for_function("""()=>Array.from(window.dataLayer||[]).some(x=>x[0]==='event'&&x[1]==='section_engaged'&&x[2].section_id==='top'&&x[2].dwell_bucket==='5s')""",timeout=12500)
  ck(True,f"Homepage 5s visible exposure recorded {width}")
  data=page.evaluate("""()=>Array.from(window.dataLayer||[]).filter(x=>x[0]==='event'&&['section_view','section_engaged'].includes(x[1])).map(x=>({name:x[1],params:x[2]}))""")
  ck(all(x["params"].get("send_to")=="G-FVCYL26FTL" for x in data),f"Section signals target new GA4 only {width}")
  ck(all(set(x["params"]).issubset({"send_to","section_id","page_type","dwell_bucket"}) for x in data),f"Section signals contain no text/PII {width}")
  ck(all(x["params"].get("page_type")=="home" for x in data),f"Homepage context correct {width}")
  campaign=context.new_page()
  campaign.on("pageerror",lambda e:errors.append("R8 JS "+str(e)))
  resp=campaign.goto(B+"/november-fast-a-r8.html",wait_until="domcontentloaded")
  ck(resp.status==200,f"R8 renders {width}")
  campaign.bring_to_front()
  campaign.wait_for_function("""()=>Array.from(window.dataLayer||[]).some(x=>x[0]==='event'&&x[1]==='section_view'&&x[2].page_type==='november_fast'&&x[2].section_id==='top')""",timeout=9000)
  ck(True,f"R8 section_view after opt-in inherited {width}")
  ck(campaign.locator("#nov-wizard").count()==1,f"R8 intake unchanged {width}")
  campaign.locator("#fast").scroll_into_view_if_needed()
  ck(campaign.locator("#fast").count()==1,f"R8 FAST intact {width}")
  context.close()
 denied=browser.new_context(viewport={"width":390,"height":844})
 requests=[]
 denied.on("request",lambda r:requests.append(r.url) if "googletagmanager.com" in r.url else None)
 rejected=denied.new_page()
 rejected.goto(B+"/november-fast-a-r8.html",wait_until="domcontentloaded")
 rejected.locator('[data-wp-choose="rejected"]').click()
 rejected.wait_for_timeout(1600)
 ck(not requests,"Opt-out never loads Google tag")
 ck(not rejected.evaluate("Array.from(window.dataLayer||[]).some(x=>x[0]==='event'&&x[1]==='section_view')"),"Opt-out never records section event")
 denied.close()
 browser.close()
report={"checks":len(checks),"errors":errors}
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
if errors:raise AssertionError(str(errors))
