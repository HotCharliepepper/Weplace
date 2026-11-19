#!/usr/bin/env python3
"""WEPLACE BF → Home / Place detail inflow UI regression.
No live customer data is read, no production URL is changed, and no messages are sent.
Run against the checked-out branch via local static server at :4173.
"""
from pathlib import Path
import json
import math
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"qa"/"bf-home-r1"
OUT.mkdir(parents=True,exist_ok=True)
BASE="http://127.0.0.1:4173"
result={"checks":[],"screenshots":[],"js_errors":[],"broken_local_responses":[]}

def check(value,description):
    if not value:
        raise AssertionError(description)
    result["checks"].append(description)

home=(ROOT/"index.html").read_text(encoding="utf-8")
nov=(ROOT/"november-fast-a-r8.html").read_text(encoding="utf-8")
check(home.count('id="landing-title"')==1,"Homepage keeps one hero H1")
check("+168%" in home and "877회" in home and "2,350회" in home,"Main hero has 168%, 877 and 2350")
check(abs((2350-877)/877*100 - 168)<.1,"Metric rounds to +168%")
check("2026년 5월" in home and "2026년 8월" in home,"Both measurement months explicit")
check('id="place-evidence"' in home,"Metric details has anchor")
check("실제 방문객 수·매출·문의 전환율이 아닙니다" in home,"Impact disclaimer distinguishes metrics")
check('href="#place-evidence"' in home,"Metric anchor present")
check('href="/field-notes/"' in home and 'href="/my-store/"' in home,"Footer preserves customer and notes routes")
check('>개인정보 문의</a>' in home,"Email link honestly labeled personal-data inquiry")
check('id="more-weplace"' in nov,"R8 has dedicated final homepage bridge")
check('class="nov-home-return-action" href="/"' in nov,"R8 strong homepage CTA uses correct path")
check(nov.index('id="more-weplace"')>nov.index('id="contact"'),"Homepage bridge appears after R8 inquiry")
check('id="nov-wizard"' in nov and 'id="first-look"' in nov,"R8 quiz and comparison are preserved")
check('href="https://pf.kakao.com/_mxbexhX"' in nov,"Manual Kakao link is still present")
check("G-FVCYL26FTL" not in nov,"Unverified GA4 stream remains excluded")
for route in ("field-notes/index.html","flow-preview/index.html","industries/index.html","my-store/index.html"):
    check((ROOT/route).is_file(),"Actual footer destination file exists: "+route)

with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    for width,height in ((360,720),(390,844),(768,1024),(1440,900)):
        context=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1,reduced_motion="reduce")
        home_page=context.new_page()
        home_page.on("pageerror",lambda e, w=width:result["js_errors"].append({"width":w,"error":str(e)}))
        home_page.on("response",lambda response,w=width:result["broken_local_responses"].append({"width":w,"url":response.url,"status":response.status}) if response.status>=400 and response.url.startswith(BASE) else None)
        resp=home_page.goto(BASE+"/index.html",wait_until="domcontentloaded",timeout=30000)
        check(resp is not None and resp.status==200,f"Home renders HTTP 200 at {width}")
        home_page.wait_for_timeout(400)
        check(home_page.locator("#landing-title").is_visible(),f"Home H1 visible at {width}")
        check("+168%" in home_page.locator("#landing-title").inner_text(),f"Impact hook visible at {width}")
        overflow=home_page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(overflow<=4,f"Home has no document horizontal overflow at {width} (overflow={overflow})")
        home_page.screenshot(path=str(OUT/f"home-{width}.png"),full_page=False,animations="disabled")
        result["screenshots"].append(f"home-{width}.png")
        home_page.locator('a[href="#place-evidence"]').first.click()
        check(home_page.locator("#place-evidence").is_visible(),f"Impact details clickable at {width}")
        home_page.locator("#place-evidence").screenshot(path=str(OUT/f"evidence-{width}.png"),animations="disabled")
        result["screenshots"].append(f"evidence-{width}.png")
        nov_page=context.new_page()
        nov_page.on("pageerror",lambda e,w=width:result["js_errors"].append({"width":w,"error":str(e)}))
        nr=nov_page.goto(BASE+"/november-fast-a-r8.html",wait_until="domcontentloaded",timeout=30000)
        check(nr is not None and nr.status==200,f"R8 renders HTTP 200 at {width}")
        nov_page.wait_for_timeout(350)
        over=nov_page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check(over<=4,f"R8 no document horizontal overflow at {width} (overflow={over})")
        check(nov_page.locator("#nov-wizard").count()==1,f"R8 wizard preserved at {width}")
        for key in ("photo","route","booking"):
            button=nov_page.locator(f'#first-look button[data-focus="{key}"]')
            button.click()
            check(button.get_attribute("aria-pressed")=="true",f"R8 {key} choice works at {width}")
        return_cta=nov_page.locator("#more-weplace .nov-home-return-action")
        return_cta.scroll_into_view_if_needed()
        check(return_cta.is_visible(),f"R8 homepage CTA visible at {width}")
        nov_page.locator("#more-weplace").screenshot(path=str(OUT/f"return-{width}.png"),animations="disabled")
        result["screenshots"].append(f"return-{width}.png")
        return_cta.click()
        check(nov_page.url.rstrip("/")==BASE,f"Return CTA opens homepage at {width}")
        context.close()
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False,reduced_motion="reduce")
    p=nojs.new_page()
    p.goto(BASE+"/november-fast-a-r8.html",wait_until="domcontentloaded")
    check(p.locator("#more-weplace .nov-home-return-action").count()==1,"R8 homepage CTA exists without JavaScript")
    nojs.close()
    browser.close()
(OUT/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"checks":len(result["checks"]),"screenshots":len(result["screenshots"]),"js_errors":result["js_errors"],"broken_local_responses":result["broken_local_responses"][:12]},ensure_ascii=False,indent=2))
if result["js_errors"]:
    raise AssertionError("Detected browser JavaScript exceptions")
if result["broken_local_responses"]:
    raise AssertionError("Broken local resources: "+str(result["broken_local_responses"][:6]))
