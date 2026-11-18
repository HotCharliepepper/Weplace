#!/usr/bin/env python3
"""Read-only Natural Korean copy + funnel regression QA for Nov FAST R5."""
from pathlib import Path
import json, os, re, sys, time
from playwright.sync_api import sync_playwright

ROOT = os.environ.get("NOVFAST_BASE", "http://127.0.0.1:4173").rstrip("/")
URL = ROOT + "/november-fast-a-r5.html"
OUT = Path("qa/november-fast-a-r5")
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
        check(f"{width} story order cold → reveal → FAST → choice → work → proof → inquiry",page.evaluate("""() => {
          const names=['top','reveal','fast','first-look','action-plan','proof','contact'];
          const items=names.map(id=>document.getElementById(id));
          return items.every(Boolean)&&items.every((el,i)=>i===0||items[i-1].compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
        }"""))
        check(f"{width} reverses anti-ad claim in same scene",
             "광고를 멈추라는 말은 아닙니다" in page.locator("#reversal").inner_text() and
             "다음에 무엇을 볼까요" in page.locator("#reversal").inner_text())
        check(f"{width} reversal isn't hidden behind opaque overlay",page.locator("#reversal").evaluate("""el=>{
          const s=getComputedStyle(el), b=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0
        }"""))
        check(f"{width} copy does not promise an unconfirmed offer",not any(term in page.locator("main").inner_text() for term in ("50% 할인","오늘만","무료 진단","매출 보장","무료 1장")) )
        check(f"{width} no invented speed promise or automatic send language",
              "30초 선택 문의" not in page.locator("main").inner_text() and
              "카카오톡으로 전달" not in page.locator("main").inner_text() and
              "채팅창에 붙여넣" in page.locator("#contact").inner_text())
        check(f"{width} welcome is conditional, not a claim about all visitors",
              "사진도 바꾸고 광고도 해보셨다면" in page.locator("#top").inner_text())
        check(f"{width} no implicit restaurant-only claim in photo simulation",
              "대표 메뉴" not in page.locator("#first-look").inner_text() and
              "좌석" not in page.locator("#first-look").inner_text() and
              "이곳에서는 무엇을 할 수 있을까요" in page.locator("#first-look").inner_text())
        check(f"{width} campaign preserves the intended negative hook and same-screen recovery",
              "광고, 하지 마세요." in page.locator("#campaign-hook-title").inner_text().replace("\\n", " ") or
              ("광고," in page.locator("#campaign-hook-title").inner_text() and "하지 마세요." in page.locator("#campaign-hook-title").inner_text()))
        check(f"{width} selected questions match the UI's actual example status",
              "가상 매장" in page.locator("#first-look").inner_text() and
              "정리 전 보기" in page.locator('#first-look button[data-mode="before"]').inner_text() and
              "정리 후 보기" in page.locator('#first-look button[data-mode="after"]').inner_text())

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
        check(f"{width} selection changes work-plan preview", 
              "찾아오는 길" in page.locator("#selected-topic").inner_text() and 
              "입구" in page.locator("#selected-question").inner_text() and
              "주차" in page.locator("#selected-action").inner_text())
        check(f"{width} information links open read-only existing pages",
              page.locator('#proof a[href="/flow-preview/"][target="_blank"]').count()==1 and
              page.locator('#proof a[href="/"][target="_blank"]').count()==1)
        check(f"{width} inquiry is after proof",
              page.evaluate("""() => {
                const a=document.getElementById('proof'),b=document.getElementById('contact');
                return !!(a&&b&&(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING));
              }"""))
        page.locator('[data-relationship="returning"]').click()
        check(f"{width} return customer option and carried topic",
              page.locator('[data-relationship="returning"]').get_attribute('aria-pressed')=='true' and
              "이전에 Weplace와 연락한 적이 있습니다." in page.locator("#prepared-message").input_value() and
              "찾아오는 길" in page.locator("#prepared-message").input_value())
        page.locator('[data-relationship="new"]').click()
        check(f"{width} new inquiry resets to first-time text",
              page.locator('[data-relationship="new"]').get_attribute('aria-pressed')=='true' and
              "이번에 처음 문의드립니다." in page.locator("#prepared-message").input_value())
        page.locator('[data-focus="booking"]').click()
        check(f"{width} booking resets before",page.locator("#mockup").get_attribute("data-mode")=="before")
        page.locator('button[data-mode="after"]').click()
        check(f"{width} booking updates message", "예약 안내" in page.locator("#prepared-message").input_value())
        check(f"{width} booking updates work-plan as well",
              "예약" in page.locator("#selected-topic").inner_text() and
              "확인 절차" in page.locator("#selected-action").inner_text())
        check(f"{width} intake industry, focus, concern, outcome rendered",
              page.locator('[data-industry]').count()==5 and
              page.locator('[data-intake-focus]').count()==3 and
              page.locator('[data-relationship]').count()==2 and
              page.locator('[data-request]').count()==3 and
              page.locator('[data-concern]').count()==3)
        check(f"{width} intake required gate initially off",
              page.locator("#copy-message").is_disabled() and
              page.locator("#copy-and-chat").get_attribute("aria-disabled")=="true")
        page.locator('[data-industry="restaurant"]').click()
        page.locator('[data-concern="terms"]').click()
        page.locator('[data-request="proposal"]').click()
        check(f"{width} all chip choices enable Kakao handoff",
              not page.locator("#copy-message").is_disabled() and
              page.locator("#copy-and-chat").get_attribute("aria-disabled")=="false" and
              page.locator("#intake-counter").inner_text()=="3 / 3")
        check(f"{width} three choices create zero-typing composed message",
              all(word in page.locator("#prepared-message").input_value()
                  for word in ["업종: 식당","살펴보고 싶은 화면: 예약 안내","예약 인원·시간","어떤 방향으로 정리할 수 있을지 궁금합니다."]))
        check(f"{width} outgoing message avoids internal contract disclaimers",
              "진단 제공 여부" not in page.locator("#prepared-message").input_value() and
              "매장명과 지역은 채팅에서" not in page.locator("#prepared-message").input_value() and
              "안녕하세요." in page.locator("#prepared-message").input_value())

        check(f"{width} action opens official Kakao channel, not fake auto submit",
              page.locator("#copy-and-chat").get_attribute("href")=="https://pf.kakao.com/_mxbexhX"
              and page.locator("#intake-preview summary").count()==1
              and page.locator("form").count()==0)
        # Changing subject must invalidate the old concern selection.
        page.locator('[data-intake-focus="route"]').click()
        check(f"{width} changing focus resets the dependent concern and disables submit",
              page.locator("#copy-message").is_disabled()
              and page.locator("#intake-counter").inner_text()=="2 / 3"
              and page.locator("#selected-topic").inner_text()=="찾아오는 길")
        page.locator('[data-concern="parking"]').click()
        check(f"{width} newly selected concern updates message, bridge and enables handoff",
              not page.locator("#copy-message").is_disabled()
              and "주차·대중교통" in page.locator("#prepared-message").input_value()
              and "출구" in page.locator("#selected-action").inner_text())
        page.locator('[data-industry="stay"]').click()
        page.locator('[data-intake-focus="photo"]').click()
        page.locator('[data-concern="menu"]').click()
        page.locator('[data-request="priority"]').click()
        check(f"{width} lodging photo selection never assumes restaurant menu or seats",
              "업종: 숙박" in page.locator("#prepared-message").input_value() and
              "서비스와 공간" in page.locator("#prepared-message").input_value() and
              "대표 메뉴" not in page.locator("#selected-action").inner_text() and
              "좌석" not in page.locator("#prepared-message").input_value())
        page.locator('[data-intake-focus="route"]').click()
        page.locator('[data-concern="parking"]').click()

        page.locator('[data-relationship="returning"]').click()
        check(f"{width} existing customer inquiry is reflected without typing",
              "이전에 Weplace와 연락한 적이 있습니다." in page.locator("#prepared-message").input_value()
              and page.locator('[data-relationship="returning"]').get_attribute("aria-pressed")=="true")
        page.locator('[data-relationship="new"]').click()
        # Test clipboard success without opening Kakao during CI.
        page.evaluate("""() => {
          Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:(value)=>{
            window.__novCopy=value;return Promise.resolve();
          }}});
        }""")
        page.locator("#copy-message").click()
        page.wait_for_timeout(60)
        check(f"{width} clipboard receives exact generated message",
              page.evaluate("window.__novCopy === document.querySelector('#prepared-message').value")
              and "복사했습니다" in page.locator("#copy-status").inner_text())

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
            fname=OUT / f"nov-fast-r5-{width}.png"
            page.screenshot(path=str(fname),full_page=True,animations="disabled")
            results["screenshots"].append(str(fname))
            # Dedicated first-screen screenshots expose the twist and Korean typography.
            page.evaluate("window.scrollTo(0,0)")
            page.wait_for_timeout(1450)
            top_fname=OUT / f"nov-r5-hook-{width}.png"
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
    check("no-JS readable provocation, inversion, work/proof and Kakao",page.locator("#campaign-hook-title").count()==1 and page.locator("#reversal").count()==1 and page.locator("#fast-title").count()==1 and page.locator("#proof").count()==1 and page.locator("#action-plan").count()==1 and page.locator("a.kakao-link").count()==1)
    nojs.close()
    browser.close()
results["passed"]=sum(item["passed"] for item in results["checks"])
results["failed"]=len(results["checks"])-results["passed"]
(OUT/"report.json").write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(f"NOV FAST R5: {results['passed']} passed, {results['failed']} failed, {len(results['errors'])} browser errors, {len(results['writes'])} writes",flush=True)
if results["errors"]:print("Browser errors:",results["errors"],flush=True)
if results["failed"] or results["errors"] or results["writes"]:sys.exit(1)
