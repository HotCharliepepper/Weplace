#!/usr/bin/env python3
"""PR36 combo bar-line × LuWei reveal × opt-in GA4 QA; review environment only."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"qa"/"pr36-combo-ga4-r1"
OUT.mkdir(parents=True,exist_ok=True)
BASE="http://127.0.0.1:4173"
issues=[];checks=[]
def check(test,description):
    if not test: raise AssertionError(description)
    checks.append(description)
def monitor(page):
    page.on("pageerror",lambda exc:issues.append("JS: "+str(exc)))
    page.on("response",lambda resp:issues.append(f"HTTP {resp.status}: {resp.url}") if resp.status>=400 and resp.url.startswith(BASE) else None)
def page_load(page,path):
    response=page.goto(BASE+path,wait_until="domcontentloaded",timeout=30000)
    check(response and response.status==200,path+" HTTP 200")
    page.wait_for_timeout(330)
def mock_tag(route):
    route.fulfill(status=200,content_type="application/javascript",body="/* consent QA: blocked external GA transmission */")
for path in ("index.html","november-fast-a-r8.html"):
    markup=(ROOT/path).read_text(encoding="utf-8")
    check('id="wp-combo-inflow"' in markup and 'id="wp-combo-sales"' in markup,path+" has 2 combined SVG charts")
    check('id="luwei-scene"' in markup and 'id="luwei-skip"' in markup,path+" has photo sequence")
    check('id="wp-consent-panel"' in markup,path+" has opt-in panel")
    for year in range(2023,2027):
        check(f'<th scope="row">{year}</th>' in markup,f"{path} includes {year} source table")
check(2350-877==1473 and round((2350-877)/877*100)==168,"Wellness detailed inflow arithmetic")
check(193000000-172000000==21000000,"Restaurant revenue delta 21 million KRW")
years={2023:[1.70,1.79,1.60],2024:[1.66,1.96,1.94],2025:[1.91,2.02,1.70],2026:[1.74,1.72,1.93]}
for year,values in years.items():
    for v in values:
        check(f'<td>{v:.2f}</td>' in (ROOT/"index.html").read_text(encoding="utf-8"),f"source table contains {year} value {v:.2f}")
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    for width,height in ((320,680),(360,740),(390,844),(768,1024),(1440,900)):
        context=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1,reduced_motion="reduce")
        context.route("https://www.googletagmanager.com/**",mock_tag)
        for name,path in (("home","/index.html"),("campaign","/november-fast-a-r8.html")):
            page=context.new_page()
            monitor(page)
            page_load(page,path)
            if page.locator("#wp-consent-panel").is_visible():
                page.locator('[data-wp-choose="rejected"]').click()
            check(page.locator("#observed-records .wp-ev-card").count()==2,f"{name} two metric cards at {width}")
            check(page.locator("#observed-records .wp-combo-svg").count()==2,f"{name} SVG pair at {width}")
            check(page.locator("#observed-records .wp-combo-line").count()==2,f"{name} real connector line at {width}")
            page.locator('#observed-records [data-combo-year="2023"]').click()
            check("2023년" in page.locator("#wp-sales-title").inner_text(),f"{name} year changes at {width}")
            check("−1,900" in page.locator("#wp-combo-delta").inner_text(),f"{name} 2023 delta correct at {width}")
            check("1.60억" in (page.locator("#wp-combo-sales").text_content() or ""),f"{name} 2023 June exact at {width}")
            page.locator('#observed-records [data-combo-year="2026"]').click()
            check("+2,100" in page.locator("#wp-combo-delta").inner_text(),f"{name} 2026 delta at {width}")
            page.locator("#observed-records").screenshot(path=str(OUT/f"{name}-combo-{width}.png"),animations="disabled")
            stage=page.locator("#luwei-stage")
            stage.scroll_into_view_if_needed()
            page.locator("#luwei-skip").click()
            check(stage.get_attribute("data-phase")=="after",f"{name} LuWei duck skip at {width}")
            img=page.locator("#luwei-after img")
            img.scroll_into_view_if_needed()
            check(img.evaluate("(node)=>node.complete && node.naturalWidth > 0"),f"{name} LuWei image load at {width}")
            if width in (390,1440):page.locator("#luwei-visual").screenshot(path=str(OUT/f"{name}-luwei-{width}.png"),animations="disabled")
            over=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
            check(over<=4,f"{name} no horizontal overflow at {width}: {over}")
            if name=="campaign":
                button=page.locator('#first-look button[data-focus="booking"]')
                button.click()
                check(button.get_attribute("aria-pressed")=="true",f"R8 booking selection at {width}")
                check(page.locator("#nov-wizard").count()==1,f"R8 inquiry wizard survives at {width}")
            else:
                check(page.locator("#request-dialog").count()==1,f"home request dialog survives at {width}")
            page.close()
        context.close()
    # A new browser context has no analytics consent stored; no Google tag before opt-in.
    ctx=browser.new_context(viewport={"width":390,"height":844})
    requests=[]
    ctx.on("request",lambda request:requests.append(request.url) if "googletagmanager.com/gtag/js" in request.url else None)
    ctx.route("https://www.googletagmanager.com/**",mock_tag)
    page=ctx.new_page();monitor(page);page_load(page,"/index.html")
    check(page.locator("#wp-consent-panel").is_visible(),"Consent choice visible on first visit")
    check(not requests,"No GA tag request before consent")
    check(page.evaluate("typeof window.gtag==='undefined'"),"No GA gtag object before consent")
    page.locator('[data-wp-choose="accepted"]').click()
    page.wait_for_timeout(150)
    check(len(requests)==1,"User acceptance causes exactly one gtag script request")
    dl=page.evaluate("Array.from(window.dataLayer||[], x => Array.from(x))")
    configs=[x[1] for x in dl if x[0]=="config"]
    check(configs==["G-H9B5F4HRDS","G-FVCYL26FTL"],"Home config includes legacy and new GA4 once")
    check(page.evaluate("window.wpAnalytics.getState()")=="accepted","GA4 records opt-in locally")
    page.evaluate("window.wpAnalytics.track('evidence_year_select',{year_selected:'2025',store_name:'private-test-name'})")
    ev=page.evaluate("Array.from(window.dataLayer||[], x => Array.from(x)).filter(x=>x[0]==='event').slice(-1)[0]")
    check(ev and ev[1]=="evidence_year_select","Year selection event recorded after opt-in")
    check("store_name" not in ev[2] and ev[2]["year_selected"]=="2025","Event contains no store name/free text")
    cpage=ctx.new_page();monitor(cpage);page_load(cpage,"/november-fast-a-r8.html")
    check(cpage.locator("#wp-consent-panel").is_hidden(),"Consent persists to campaign")
    cdl=cpage.evaluate("Array.from(window.dataLayer||[], x => Array.from(x))")
    check([x[1] for x in cdl if x[0]=="config"]==["G-FVCYL26FTL"],"Campaign only configured against new ID")
    cpage.locator('#first-look button[data-focus="route"]').click()
    evs=cpage.evaluate("Array.from(window.dataLayer||[], x=>Array.from(x)).filter(x=>x[0]==='event').map(x=>x[1])")
    check("firstlook_select" in evs,"R8 firstlook_select event sent after consent")
    ctx.close()
    decline=browser.new_context(viewport={"width":390,"height":844})
    declined=[]
    decline.on("request",lambda req:declined.append(req.url) if "googletagmanager.com/gtag/js" in req.url else None)
    decline.route("https://www.googletagmanager.com/**",mock_tag)
    p=decline.new_page();page_load(p,"/november-fast-a-r8.html")
    p.locator('[data-wp-choose="rejected"]').click()
    check(not declined,"Reject: no GA script request")
    check(p.locator("#wp-consent-panel").is_hidden(),"Reject hides notice without blocking site")
    check(p.locator("#first-look button[data-focus='photo']").count()==1,"Consent rejection preserves comparison")
    decline.close()
    nojs=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    page=nojs.new_page();page_load(page,"/november-fast-a-r8.html")
    check(page.locator("#observed-records .wp-combo-svg").count()==2,"No-JS static combo charts present")
    check(page.locator("#luwei-before img").count()==1,"No-JS photo source present")
    nojs.close()
    browser.close()
report={"checks":len(checks),"issues":issues,"screenshots":len(list(OUT.glob("*.png")))}
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
if issues: raise AssertionError("Browser/HTTP issues: "+str(issues))
