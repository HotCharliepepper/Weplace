#!/usr/bin/env python3
"""Browser QA for November FAST R6: one-question wizard, back navigation and inquiry handoff."""
from pathlib import Path
import json, os, sys
from playwright.sync_api import sync_playwright

BASE=os.environ.get("NOVFAST_BASE","http://127.0.0.1:4173").rstrip("/")
URL=BASE+"/november-fast-a-r6.html"
OUT=Path("qa/november-fast-a-r6")
OUT.mkdir(parents=True,exist_ok=True)
report={"url":URL,"checks":[],"browser_errors":[],"writes":[],"screenshots":[]}
def check(label,ok,detail=None):
    report["checks"].append({"name":label,"passed":bool(ok),"detail":detail})
    if not ok: print("FAIL:",label,detail,flush=True)
def active_step(page):
    value=page.locator("#nov-wizard").get_attribute("data-active-step")
    return int(value) if value is not None else -1
def stage_ok(page,n):
    return active_step(page)==n and page.locator('[data-wizard-step]:visible').count()==1 and page.locator(f'[data-wizard-step="{n}"]:visible').count()==1

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,channel="chrome")
    for width in (360,390,768,1440):
        context=browser.new_context(viewport={"width":width,"height":844 if width<900 else 900},device_scale_factor=1)
        page=context.new_page()
        page.on("pageerror",lambda e:report["browser_errors"].append(str(e)))
        page.on("response",lambda response:report["browser_errors"].append(f"HTTP {response.status}: {response.url}") if response.status>=400 and response.url.startswith(BASE) else None)
        page.on("request",lambda req:report["writes"].append(req.method+" "+req.url) if req.method not in ("GET","HEAD") else None)
        response=page.goto(URL,wait_until="load")
        page.evaluate("document.fonts.ready")
        check(f"{width} HTTP 200",response is not None and response.status==200)
        check(f"{width} only R6 page added to original flow",
              page.locator("h1#campaign-hook-title").count()==1 and
              all(page.locator("#"+section).count()==1 for section in ("top","reveal","fast","first-look","action-plan","proof","contact")))
        check(f"{width} no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"))
        check(f"{width} 5 question stages plus summary",page.locator("[data-wizard-step]").count()==6)
        check(f"{width} initial stage only",stage_ok(page,0))
        check(f"{width} initial progress and disabled back",page.locator("#nov-wizard-progress-label").inner_text()=="질문 1 / 5" and page.locator("#nov-wizard-back").is_disabled())
        check(f"{width} question legends use 1–5 rather than outdated zero index",
              page.locator('[data-wizard-step="0"] legend span').first.inner_text()=="01" and
              all(page.locator(f'[data-wizard-step="{k}"] legend span').first.inner_text()==str(k+1).zfill(2) for k in range(5)))
        check(f"{width} no unapproved claims",not any(word in page.locator("main").inner_text() for word in ("무료 1장","매출 보장","30초 선택 문의","자동 접수 완료")))
        page.locator('[data-relationship="returning"]').click()
        check(f"{width} relationship click auto-advances",stage_ok(page,1))
        page.locator("#nov-wizard-back").click()
        check(f"{width} back restores previous answer",stage_ok(page,0) and page.locator('[data-relationship="returning"]').get_attribute("aria-pressed")=="true")
        page.locator("#nov-wizard-next").click()
        check(f"{width} optional next restores chosen answer",stage_ok(page,1))
        page.locator('[data-industry="cafe"]').click()
        check(f"{width} industry advances",stage_ok(page,2))
        page.locator('[data-intake-focus="route"]').click()
        check(f"{width} focus advances",stage_ok(page,3) and page.locator("#selected-topic").inner_text()=="찾아오는 길")
        page.locator('[data-concern="parking"]').click()
        check(f"{width} concern advances",stage_ok(page,4))
        page.locator('[data-request="pricing"]').click()
        check(f"{width} request advances to result",stage_ok(page,5))
        check(f"{width} result is complete and Kakao is user-triggered",
              page.locator("#intake-counter").inner_text()=="3 / 3" and
              page.locator("#copy-and-chat").get_attribute("aria-disabled")=="false" and
              page.locator("#copy-and-chat").get_attribute("href")=="https://pf.kakao.com/_mxbexhX" and
              page.locator("#nov-wizard-progress-label").inner_text()=="선택 완료 · 문의 내용 확인")
        check(f"{width} completion wording replaces question helper",
              "문의 내용이 준비됐습니다." in page.locator(".nov-intake-head h3").inner_text() and
              "카카오톡에서 보내주세요" in page.locator("#nov-wizard-progress-hint").inner_text() and
              "다음 질문" not in page.locator("#nov-wizard-progress-hint").inner_text())

        value=page.locator("#prepared-message").input_value()
        check(f"{width} assembled text preserves all selected answers",
              all(x in value for x in ("업종: 카페","찾아오는 길","주차·대중교통","비용·일정","이전에 Weplace와 연락한 적이 있습니다.")),value[:420])
        page.locator("#nov-wizard-back").click()
        check(f"{width} summary back returns to question 5 with selection",stage_ok(page,4) and page.locator('[data-request="pricing"]').get_attribute("aria-pressed")=="true")
        page.locator("#nov-wizard-back").click()
        check(f"{width} earlier concern selection is retained",stage_ok(page,3) and page.locator('[data-concern="parking"]').get_attribute("aria-pressed")=="true")
        page.locator("#nov-wizard-back").click()
        check(f"{width} back navigates to focus",stage_ok(page,2))
        page.locator('[data-intake-focus="booking"]').click()
        check(f"{width} changed focus invalidates dependent concern",stage_ok(page,3) and page.locator("#nov-wizard-next").is_disabled() and page.locator("#intake-counter").inner_text()=="2 / 3")
        page.locator('[data-concern="terms"]').click()
        check(f"{width} new concern auto-advances",stage_ok(page,4))
        page.locator("#nov-wizard-next").click()
        final_message=page.locator("#prepared-message").input_value()
        check(f"{width} final message uses new concern with no stale answer",stage_ok(page,5) and "예약 안내" in final_message and "예약 인원·시간" in final_message and "주차·대중교통" not in final_message)
        page.evaluate("""() => {
          Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:(txt)=>{window.__copiedWizard=txt;return Promise.resolve()}}});
        }""")
        page.locator("#copy-message").click()
        page.wait_for_timeout(75)
        check(f"{width} copy button matches generated text without sending",
              page.evaluate("window.__copiedWizard===document.querySelector('#prepared-message').value") and
              "복사했습니다" in page.locator("#copy-status").inner_text() and
              page.locator("form").count()==0)
        if width in (390,1440):
            page.screenshot(path=str(OUT/f"nov-r6-wizard-result-{width}.png"),animations="disabled")
            report["screenshots"].append(f"nov-r6-wizard-result-{width}.png")
            page.locator("#nov-wizard-back").click()
            page.locator("#nov-wizard-back").click()
            page.locator("#nov-wizard-back").click()
            page.screenshot(path=str(OUT/f"nov-r6-wizard-question-{width}.png"),animations="disabled")
            report["screenshots"].append(f"nov-r6-wizard-question-{width}.png")
        context.close()
    reduced=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
    page=reduced.new_page();page.goto(URL)
    check("reduced motion wizard displays static stage",stage_ok(page,0) and page.locator("#nov-wizard").evaluate("el=>getComputedStyle(el.querySelector('.is-active')).animationName==='none'"))
    page.locator('[data-relationship="new"]').click()
    check("reduced motion still advances",stage_ok(page,1))
    reduced.close()
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    page=nojs.new_page();page.goto(URL)
    check("no JS keeps stacked fallback and direct channel URL",
          page.locator("#nov-wizard").get_attribute("class").find("is-ready")==-1 and
          page.locator("[data-wizard-step]:visible").count()==6 and
          page.locator("a.kakao-link").get_attribute("href")=="https://pf.kakao.com/_mxbexhX")
    nojs.close()
    browser.close()
report["passed"]=sum(x["passed"] for x in report["checks"])
report["failed"]=len(report["checks"])-report["passed"]
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(f"NOV FAST R6 WIZARD: {report['passed']} passed, {report['failed']} failed, {len(report['browser_errors'])} errors, {len(report['writes'])} writes",flush=True)
if report["browser_errors"]:print("ERROR DETAILS",report["browser_errors"],flush=True)
if report["failed"] or report["browser_errors"] or report["writes"]:sys.exit(1)
