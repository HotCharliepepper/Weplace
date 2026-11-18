#!/usr/bin/env python3
"""Chromium QA for November FAST R7: PR43-inspired visual comparison + slim funnel."""
from pathlib import Path
import json,os,sys
from playwright.sync_api import sync_playwright

BASE=os.environ.get("NOVFAST_BASE","http://127.0.0.1:4173").rstrip("/")
URL=BASE+"/november-fast-a-r7.html"
OUT=Path("qa/november-fast-a-r7")
OUT.mkdir(parents=True,exist_ok=True)
report={"url":URL,"checks":[],"errors":[],"writes":[],"screenshots":[]}
def check(name,yes,details=None):
    yes=bool(yes);report["checks"].append({"name":name,"ok":yes,"details":details})
    if not yes:print("FAIL",name,details,flush=True)
def active(page):
    a=page.locator("[data-r7-view]:visible")
    return a.count()==1 and a.first.get_attribute("data-r7-view")
def wizard_step(page,n):
    return page.locator("#nov-wizard").get_attribute("data-active-step")==str(n) and page.locator('[data-wizard-step]:visible').count()==1
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,channel="chrome")
    for width in (360,390,768,1440):
        ctx=browser.new_context(viewport={"width":width,"height":844 if width<900 else 900},device_scale_factor=1)
        page=ctx.new_page()
        page.on("pageerror",lambda error:report["errors"].append(str(error)))
        page.on("request",lambda request:report["writes"].append(request.method+" "+request.url) if request.method not in ("GET","HEAD") else None)
        page.on("response",lambda response:report["errors"].append(f"HTTP {response.status} {response.url}") if response.status>=400 and response.url.startswith(BASE) else None)
        res=page.goto(URL,wait_until="load")
        page.evaluate("document.fonts.ready")
        check(f"{width} page 200",res is not None and res.status==200)
        check(f"{width} no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),page.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})"))
        check(f"{width} one strong hook, FAST, large demo, action and inquiry",
              page.locator("#campaign-hook-title").count()==1 and
              page.locator("#fast-title").count()==1 and
              page.locator("#first-look").count()==1 and
              page.locator("#action-plan").count()==1 and
              page.locator("#contact").count()==1 and page.locator("h1").count()==1)
        check(f"{width} short conversion funnel has no extra tools hub",
              page.locator("#proof").count()==0 and page.locator("#reveal").count()==0 and
              page.locator('a[href="/flow-preview/"]').count()==0 and
              page.locator('a[href="/industries/"]').count()==0)
        check(f"{width} campaign supports photo-route-booking",page.locator("#first-look button[data-focus]").count()==3 and page.locator("[data-r7-view]").count()==6)
        check(f"{width} initial comparison is photo before",active(page)=="photo-before")
        photo=page.locator('[data-r7-view="photo-before"] img')
        photo.scroll_into_view_if_needed()
        page.wait_for_function("""() => {
          const image=document.querySelector('[data-r7-view="photo-before"] img');
          return image&&image.complete&&image.naturalWidth>0;
        }""",timeout=12000)
        check(f"{width} verified PR43 food image loads",photo.evaluate("(el)=>el.complete&&el.naturalWidth>0"))
        check(f"{width} mockup is left of explanation on desktop or above on mobile",
              page.evaluate("""() => {const a=document.querySelector('#r7-visual').getBoundingClientRect(),b=document.querySelector('#stage-inner').getBoundingClientRect();return innerWidth<=900 ? a.bottom<=b.top+3 : a.right<=b.left+3}"""))
        page.locator("#first-look button[data-mode='after']").click()
        check(f"{width} photo after is a two-image sequence",
              active(page)=="photo-after" and page.locator('[data-r7-view="photo-after"] img').count()==2)
        page.locator('[data-r7-view="photo-after"] img').first.scroll_into_view_if_needed()
        page.wait_for_function("""() => {
          const images=Array.from(document.querySelectorAll('[data-r7-view="photo-after"] img'));
          return images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0);
        }""",timeout=12000)
        check(f"{width} both PR43 food and room images load",
              page.locator('[data-r7-view="photo-after"]').evaluate("el=>Array.from(el.querySelectorAll('img')).every(img=>img.complete&&img.naturalWidth>0)"))
        check(f"{width} media references two distinct reusable existing assets",
              page.locator('[data-r7-view="photo-after"]').evaluate("el=>new Set(Array.from(el.querySelectorAll('img'),i=>i.getAttribute('src'))).size===2"))
        if width in (390,1440):
            page.locator("#first-look").screenshot(path=str(OUT/f"r7-photo-after-{width}.png"),animations="disabled")
            report["screenshots"].append(f"r7-photo-after-{width}.png")
        page.locator('#first-look button[data-focus="route"]').click()
        check(f"{width} route switching resets before",active(page)=="route-before")
        page.locator("#first-look button[data-mode='after']").click()
        check(f"{width} route becomes a clear three-stop map",active(page)=="route-after" and page.locator('[data-r7-view="route-after"] svg').count()==1 and page.locator('.r7-route-steps li').count()==3)
        if width in (390,1440):
            page.locator("#first-look").screenshot(path=str(OUT/f"r7-route-after-{width}.png"),animations="disabled")
            report["screenshots"].append(f"r7-route-after-{width}.png")
        page.locator('#first-look button[data-focus="booking"]').click()
        page.locator("#first-look button[data-mode='after']").click()
        check(f"{width} booking shows interaction without reservation",active(page)=="booking-after" and page.locator('[data-r7-guests]').count()==3 and page.locator('[data-r7-time]').count()==3 and "실제 예약" in page.locator('.r7-booking-note').inner_text())
        page.locator('[data-r7-guests="2"]').click()
        page.locator('[data-r7-time="19:30"]').click()
        check(f"{width} chosen booking details update within mock only",page.locator('#r7-booking-summary').inner_text()=="2명 · 19:30 선택 예시" and page.locator('[data-r7-time="19:30"]').get_attribute("aria-pressed")=="true")
        if width in (390,1440):
            page.locator("#first-look").screenshot(path=str(OUT/f"r7-booking-after-{width}.png"),animations="disabled")
            report["screenshots"].append(f"r7-booking-after-{width}.png")
        check(f"{width} selected topic affects consultation plan",page.locator("#selected-topic").inner_text()=="예약 안내" and "예약" in page.locator("#selected-question").inner_text())
        check(f"{width} inquiry is slide based",wizard_step(page,0) and page.locator("[data-wizard-step]").count()==6)
        page.locator('[data-relationship="returning"]').click()
        page.locator('[data-industry="restaurant"]').click()
        check(f"{width} wizard relationship and industry advance",wizard_step(page,2))
        page.locator('[data-intake-focus="booking"]').click()
        check(f"{width} booking choice advances to related concern",wizard_step(page,3))
        page.locator('[data-concern="terms"]').click()
        page.locator('[data-request="pricing"]').click()
        check(f"{width} inquiry completes without typing",wizard_step(page,5) and page.locator("#copy-and-chat").get_attribute("aria-disabled")=="false")
        check(f"{width} message carries booking question",all(x in page.locator("#prepared-message").input_value() for x in ("식당","예약 안내","예약 인원·시간","비용·일정")))
        check(f"{width} Kakao link is user's explicit send action",page.locator("#copy-and-chat").get_attribute("href")=="https://pf.kakao.com/_mxbexhX" and page.locator("form").count()==0)
        if width==390:
            page.locator("#contact").screenshot(path=str(OUT/"r7-slide-result-390.png"),animations="disabled")
            report["screenshots"].append("r7-slide-result-390.png")
        ctx.close()
    reduce=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
    pg=reduce.new_page();pg.goto(URL,wait_until="load")
    check("reduced motion preserves interactive comparison",pg.locator('#first-look button[data-focus="route"]').is_enabled())
    check("reduced motion disables FAST replay",pg.locator("#fast-replay").is_disabled())
    reduce.close()
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    pg=nojs.new_page();pg.goto(URL,wait_until="load")
    check("no JS preserves initial photo, comparison context and channel",
          pg.locator('[data-r7-view="photo-before"]:visible').count()==1 and
          pg.locator('a.kakao-link').get_attribute("href")=="https://pf.kakao.com/_mxbexhX")
    nojs.close()
    browser.close()
report["passed"]=sum(x["ok"] for x in report["checks"])
report["failed"]=len(report["checks"])-report["passed"]
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"NOV FAST R7: {report['passed']} passed, {report['failed']} failed, {len(report['errors'])} browser errors, {len(report['writes'])} writes",flush=True)
if report["errors"]:print("Errors",report["errors"],flush=True)
if report["failed"] or report["errors"] or report["writes"]:sys.exit(1)
