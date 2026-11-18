#!/usr/bin/env python3
"""Read-only Chrome smoke QA for the PR #43-inspired Weplace unified root.
Inspect front-end actions without sending inquiries or modifying production.
"""
import json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get("WEPLACE_BASE","http://127.0.0.1:4173").rstrip("/")
OUT=Path("qa/unified-main-safe-r1")
OUT.mkdir(parents=True,exist_ok=True)
result={"url":BASE+"/","checks":[],"errors":[],"writes":[],"legacy_analytics_posts":[],"captures":[]}
def check(name,ok,detail=None):
    item={"name":name,"pass":bool(ok)}
    if detail is not None:item["detail"]=detail
    result["checks"].append(item)
    if not ok:print("FAIL",name,detail,flush=True)
def current_stage(page):
    return page.locator("#stage").get_attribute("data-focus")+"-"+page.locator("#stage").get_attribute("data-mode")
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    for width in (360,390,768,1440):
        ctx=browser.new_context(viewport={"width":width,"height":844 if width<900 else 900},device_scale_factor=1)
        page=ctx.new_page()
        page.route("https://**",lambda route:route.abort())
        page.on("pageerror",lambda e: result["errors"].append(str(e)))
        # Keep the exact GA4 configuration already on main. Distinguish its known
        # pageview/scroll beacons from NEW inquiry/CRM/POST submissions.
        def audit_request(request):
            if request.method in ("GET","HEAD"):return
            known_ga=(
                request.url.startswith("https://analytics.google.com/g/collect") or
                request.url.startswith("https://stats.g.doubleclick.net/g/collect")
            )
            if known_ga and request.method=="POST":
                result["legacy_analytics_posts"].append(request.url)
                body=request.post_data or ""
                if "테스트 매장" in body or "서울 영등포" in body:
                    result["writes"].append("GA contains filled inquiry text")
            else:
                result["writes"].append(request.method+" "+request.url)
        page.on("request",audit_request)
        page.on("response",lambda r: result["errors"].append("HTTP "+str(r.status)+" "+r.url) if r.status>=400 and r.url.startswith(BASE) else None)
        response=page.goto(BASE+"/",wait_until="load")
        check(f"{width} main served",response.status==200)
        check(f"{width} one primary headline",page.locator("h1#landing-title").count()==1 and page.locator("h1").count()==1)
        check(f"{width} PR43 visual sections",all(page.locator("#"+a).count()==1 for a in ["top","fast","experience","work","capabilities","evidence","contact"]))
        check(f"{width} legacy homepage replaced",page.locator(".unified-r3 #fast").count()==1 and page.locator(".story-hero").count()==0)
        check(f"{width} no old unverified customer numbers",not any(x in page.locator("body").inner_text() for x in ["2,100만 원","2,350회","+168%","+12.2%","음식점 A","웰니스 B"]))
        check(f"{width} real text instead of simulated revenue chart",page.locator(".wp-home-story .wp-story-flow li").count()==3)
        check(f"{width} no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),page.evaluate("({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth})"))
        check(f"{width} all required brand assets present",page.locator(".rf-logo img").count()==1 and page.locator(".rf-logo img").evaluate("img=>img.complete&&img.naturalWidth>0"))
        check(f"{width} PR43 GSAP and source module loaded",page.evaluate("Boolean(window.gsap&&window.ScrollTrigger)"))
        page.locator("#fast").scroll_into_view_if_needed()
        check(f"{width} cinematic FAST heading present",page.locator("#fast #hero-title").count()==1 and "RESOLUTE" in page.locator("#fast").inner_text())
        page.locator("#experience").scroll_into_view_if_needed()
        page.wait_for_function("""()=>Array.from(document.querySelectorAll('button[data-focus]')).every(b=>!b.disabled)""",timeout=12000)
        check(f"{width} all three example choices enabled",page.locator('button[data-focus]:enabled').count()==3)
        page.locator('button[data-focus="photo"]').click()
        check(f"{width} photo focus updates",current_stage(page)=="photo-before")
        page.locator('button[data-mode="after"]').click()
        check(f"{width} photo before/after changes",current_stage(page)=="photo-after" and page.locator('[data-view="photo-after"]:visible').count()==1)
        photos=page.locator('[data-view="photo-after"] img')
        photos.first.scroll_into_view_if_needed()
        page.wait_for_function("""()=>Array.from(document.querySelectorAll('[data-view="photo-after"] img')).every(i=>i.complete&&i.naturalWidth>0)""",timeout=12000)
        check(f"{width} food and space image files load",photos.count()==2)
        page.locator('button[data-focus="route"]').click()
        check(f"{width} route focus works",page.locator("#stage").get_attribute("data-focus")=="route")
        page.locator('button[data-mode="after"]').click()
        check(f"{width} route SVG and direction markers",page.locator('[data-view="route-after"] svg').count()==1 and page.locator('[data-view="route-after"]:visible').count()==1)
        page.locator('button[data-focus="booking"]').click()
        page.locator('button[data-mode="after"]').click()
        check(f"{width} booking display enabled",page.locator('[data-view="booking-after"]:visible').count()==1)
        page.locator('button[data-guests="2"]').click()
        page.locator('button[data-time="19:30"]').click()
        check(f"{width} booking example selections update",page.locator("#booking-summary").inner_text().strip()=="2명 · 19:30 선택 예시")
        check(f"{width} booking selection does not submit",page.locator('[data-view="booking-after"] form').count()==0 and "실제 예약" in page.locator(".rf-booking-note").inner_text())
        page.locator("#contact").scroll_into_view_if_needed()
        opener=page.locator("#contact [data-open-request]")
        check(f"{width} contact opens choice dialog",opener.count()==1)
        opener.click()
        check(f"{width} dialog is visible",page.locator("#request-dialog").evaluate("e=>e.open"))
        page.locator("#store").fill("테스트 매장")
        page.locator("#region").fill("서울 영등포")
        page.locator('#interest').select_option("booking")
        page.locator('#request-form button[type="submit"]').click()
        inquiry=page.locator("#request-text").input_value()
        check(f"{width} local inquiry text created",all(x in inquiry for x in ["테스트 매장","영등포","예약"]))
        check(f"{width} inquiry is not automatically sent",page.locator("#request-status").inner_text().find("아직 전송")>=0)
        check(f"{width} Kakao channel still user-triggered",page.locator('#request-result a[href^="https://pf.kakao.com/"]').count()==1)
        page.locator("#close-dialog").click()
        check(f"{width} dialog can be dismissed",not page.locator("#request-dialog").evaluate("e=>e.open"))
        if width in (390,1440):
            page.locator("#top").screenshot(path=str(OUT/f"unified-home-hero-{width}.png"),animations="disabled")
            page.locator("#fast").screenshot(path=str(OUT/f"unified-home-fast-{width}.png"),animations="disabled")
            page.locator("#experience").screenshot(path=str(OUT/f"unified-home-experience-{width}.png"),animations="disabled")
            result["captures"] += [f"unified-home-hero-{width}.png",f"unified-home-fast-{width}.png",f"unified-home-experience-{width}.png"]
        ctx.close()
    reduced=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
    pg=reduced.new_page()
    pg.route("https://**",lambda route:route.abort())
    pg.goto(BASE+"/",wait_until="load")
    check("reduced motion keeps FAST and interactive choice",pg.locator("#fast").count()==1 and pg.locator('button[data-focus="photo"]').is_enabled())
    reduced.close()
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    pg=nojs.new_page()
    pg.route("https://**",lambda route:route.abort())
    pg.goto(BASE+"/",wait_until="load")
    check("no-JS content and Kakao fallback",pg.locator("#landing-title").count()==1 and pg.locator('#contact a[href^="https://pf.kakao.com/"]').count()>=1)
    nojs.close()
    for path in ("/flow-preview/","/my-store/","/check/","/industries/"):
        page=browser.new_page()
        response=page.goto(BASE+path,wait_until="domcontentloaded")
        check("protected operational route "+path,response is not None and response.status==200)
        page.close()
    browser.close()
result["passed"]=sum(x["pass"] for x in result["checks"])
result["failed"]=len(result["checks"])-result["passed"]
(OUT/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"WEPLACE UNIFIED MAIN QA: {result['passed']} passed, {result['failed']} failed, {len(result['errors'])} browser/HTTP errors, {len(result['writes'])} unexpected writes, {len(result['legacy_analytics_posts'])} inherited GA beacons",flush=True)
if result["errors"]:print("ERROR DETAILS",result["errors"][:20],flush=True)
if result["failed"] or result["errors"] or result["writes"]:sys.exit(1)
