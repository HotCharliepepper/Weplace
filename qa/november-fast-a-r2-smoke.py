#!/usr/bin/env python3
"""Read-only Chromium QA for Nov FAST campaign R1; does not send external messages."""
from pathlib import Path
import json, os, re, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.environ.get("NOVFAST_BASE", "http://127.0.0.1:4173").rstrip("/")
URL = ROOT + "/november-fast-a-r2.html"
OUT = Path("qa/november-fast-a-r2")
OUT.mkdir(parents=True, exist_ok=True)
results = {"source":URL,"checks":[],"errors":[],"writes":[],"screenshots":[]}
def check(name, passed, detail=None):
    results["checks"].append({"name":name,"passed":bool(passed),"detail":detail})
    if not passed: print("FAIL:", name, detail,flush=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,channel='chrome')  # system Chrome preinstalled on GitHub hosted Ubuntu runners
    for width in (360,390,768,1440):
        context=browser.new_context(viewport={"width":width,"height":840 if width<900 else 900},device_scale_factor=1,reduced_motion="no-preference")
        page=context.new_page()
        page.on("pageerror", lambda e: results["errors"].append(str(e)))
        page.on("request", lambda r: results["writes"].append(r.method+" "+r.url) if r.method not in ("GET","HEAD") else None)
        page.on("response",lambda r: results["errors"].append("HTTP "+str(r.status)+" "+r.url) if r.status>=400 and r.url.startswith(ROOT) else None)
        resp=page.goto(URL,wait_until="load")
        # Lettering is central to the campaign; screenshots must use real Korean glyphs.
        page.evaluate("document.fonts.ready")
        check(f"{width} Korean webfont loaded",page.evaluate('document.fonts.check(\'16px "Noto Sans KR"\', "광고를 해보셨다면")'))
        check(f"{width} HTTP 200",resp is not None and resp.status==200)
        check(f"{width} cold hook H1 / warm reveal H2 / FAST H2",page.locator("h1#campaign-hook-title").count()==1 and page.locator("h2#landing-title").count()==1 and page.locator("h2#fast-title").count()==1)
        check(f"{width} one H1 only",page.locator("h1").count()==1)
        check(f"{width} story order cold → reveal → FAST → choice → inquiry",page.evaluate("""() => {
          const names=['top','reveal','fast','first-look','contact'];
          const items=names.map(id=>document.getElementById(id));
          return items.every(Boolean)&&items.every((el,i)=>i===0||items[i-1].compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
        }"""))
        check(f"{width} reverses anti-ad claim in same scene",
             "광고를 멈추자는 뜻은 아닙니다" in page.locator("#reversal").inner_text() and
             "다음에 보는" in page.locator("#reversal").inner_text())
        check(f"{width} reversal isn't hidden behind opaque overlay",page.locator("#reversal").evaluate("""el=>{
          const s=getComputedStyle(el), b=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0
        }"""))
        check(f"{width} copy does not promise an unconfirmed offer",not any(term in page.locator("main").inner_text() for term in ("50% 할인","오늘만","무료 진단","매출 보장","무료 1장")) )
        check(f"{width} responsive overflow",page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"),page.evaluate("({scroll:document.documentElement.scrollWidth,inner:innerWidth})"))
        check(f"{width} three choices",page.locator("[data-focus]").count()==3)
        check(f"{width} FAST face has opaque forest contrast",
              page.locator(".nov-fast-face").evaluate("""el=>{
                const s=getComputedStyle(el);
                const fill=s.webkitTextFillColor||s.color;
                return fill==='rgb(24, 62, 49)' && s.opacity==='1';
              }"""))
        check(f"{width} safe review meta",page.locator('meta[name="robots"]').get_attribute("content")=="noindex,nofollow")
        check(f"{width} transparent benefit", "가상 매장" in page.locator("body").inner_text() and "무료로 진단" not in page.locator("body").inner_text())
        check(f"{width} no auto contact payload",page.locator("form").count()==0 and page.locator("a.kakao-link").get_attribute("href")=="https://pf.kakao.com/_mxbexhX")
        # Mutate the same original A demo interaction, no network.
        page.locator('[data-focus="route"]').click()
        check(f"{width} route choice updates title", "입구" in page.locator("#stage-title").inner_text())
        page.locator('button[data-mode="after"]').click()
        check(f"{width} after mockup",page.locator("#mockup").get_attribute("data-mode")=="after" and "출구" in page.locator("#mock-title").inner_text())
        check(f"{width} selected choice reaches message", "찾아오는 길" in page.locator("#prepared-message").input_value())
        page.locator('[data-focus="booking"]').click()
        check(f"{width} booking resets before",page.locator("#mockup").get_attribute("data-mode")=="before")
        page.locator('button[data-mode="after"]').click()
        check(f"{width} booking updates message", "예약 안내" in page.locator("#prepared-message").input_value())
        # FAST stays live text, finite optional replay.
        page.locator("#fast-title").scroll_into_view_if_needed()
        page.wait_for_timeout(850)
        button=page.locator("#fast-replay")
        check(f"{width} FAST replay available",button.is_enabled())
        button.click()
        check(f"{width} replay feedback", "가속" in page.locator("#fast-status").inner_text())
        page.wait_for_timeout(800)
        check(f"{width} settles after single animation", "정착 완료" in page.locator("#fast-status").inner_text() and "is-fast-playing" not in (page.locator("#fast").get_attribute("class") or ""))
        if width in (390,1440):
            fname=OUT / f"nov-fast-r2-{width}.png"
            page.screenshot(path=str(fname),full_page=True,animations="disabled")
            results["screenshots"].append(str(fname))
            # Dedicated first-screen screenshots expose the twist and Korean typography.
            page.evaluate("window.scrollTo(0,0)")
            page.wait_for_timeout(1450)
            top_fname=OUT / f"nov-r2-hook-{width}.png"
            page.screenshot(path=str(top_fname),full_page=False,animations="disabled")
            results["screenshots"].append(str(top_fname))
        context.close()
    # Honor motion preferences without disabling content or CTAs.
    reduced=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
    page=reduced.new_page();page.goto(URL,wait_until="load")
    page.locator("#fast-title").scroll_into_view_if_needed();page.wait_for_timeout(800)
    check("reduced motion makes replay inert",page.locator("#fast-replay").is_disabled() and "is-fast-playing" not in (page.locator("#fast").get_attribute("class") or ""))
    check("reduced motion leaves comparison interactive",page.locator('[data-focus="photo"]').is_enabled())
    reduced.close()
    # HTML without JS remains understandable and links directly to the Kakao channel.
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    page=nojs.new_page();page.goto(URL)
    check("no-JS readable provocation, inversion, FAST and Kakao",page.locator("#campaign-hook-title").count()==1 and page.locator("#reversal").count()==1 and page.locator("#fast-title").count()==1 and page.locator("a.kakao-link").count()==1)
    nojs.close()
    browser.close()
results["passed"]=sum(item["passed"] for item in results["checks"])
results["failed"]=len(results["checks"])-results["passed"]
(OUT/"report.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(f"NOV FAST R2: {results['passed']} passed, {results['failed']} failed, {len(results['errors'])} browser errors, {len(results['writes'])} writes",flush=True)
if results["errors"]:print("Browser errors:",results["errors"],flush=True)
if results["failed"] or results["errors"] or results["writes"]:sys.exit(1)
