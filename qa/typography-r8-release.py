#!/usr/bin/env python3
"""Public-safe Weplace typography and November R8 homepage bridge smoke QA."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
BASE="http://127.0.0.1:4173"
root=Path(__file__).resolve().parent.parent
out=root/"qa"/"typography-r8-release"
out.mkdir(parents=True,exist_ok=True)
home=(root/"index.html").read_text(encoding="utf-8")
r8=(root/"november-fast-a-r8.html").read_text(encoding="utf-8")
css=(root/"assets/css/weplace-type-release-r1.css").read_text(encoding="utf-8")
checks=[]; faults=[]; bad_http=[]
def ok(value,description):
    if not value: raise AssertionError(description)
    checks.append(description)
ok("웰니스 B" in home and "음식점 A" in home and "2,350회" in home and "2,100" in home and "외부 공개 권한은 최종 대조가 필요합니다" in home,"Requested observed data remains separated and source limits are visible")
ok('href="#experience"' in home and 'id="fast"' in home,"Original public homepage comparison retained")
ok(home.count('id="landing-title"')==1,"One home H1")
ok(home.count('class="wp-type-question"')==2,"Home H1 uses two semantic break groups")
ok('>개인정보 문의</a>' in home,"Footer mail link has correct type label")
ok('>FLOW 미리보기</a>' in home,"Footer preserves preview semantics")
ok('>작업 기록·사례</a>' in home,"Client case label matches site function")
ok('id="more-weplace"' in r8 and r8.index('id="more-weplace"')>r8.index('id="nov-wizard"'),"R8 homepage bridge follows existing inquiry wizard")
ok('Weplace 홈페이지에서 이어 보기' in r8,"R8 CTA has clear copy")
ok('href="/" aria-label="Weplace 본 홈페이지로 이동"' in r8,"R8 homepage destination is the root")
ok('G-FVCYL26FTL' not in r8,"Unverified GA4 tag excluded")
ok('prefers-reduced-motion' in css and 'prefers-reduced-motion' in r8,"Reduced motion treatment retained")
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    for width,height in [(320,680),(360,740),(390,844),(768,1024),(1440,900)]:
        ctx=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=1,reduced_motion="reduce")
        p=ctx.new_page()
        p.on("pageerror",lambda err,w=width:faults.append((w,str(err))))
        p.on("response",lambda res,w=width:bad_http.append((w,res.status,res.url)) if res.status>=400 and res.url.startswith(BASE) else None)
        resp=p.goto(BASE+"/index.html",wait_until="domcontentloaded",timeout=30000)
        ok(resp and resp.status==200,f"Homepage 200 at {width}")
        p.wait_for_timeout(300)
        ok(p.locator("#landing-title").is_visible(),f"Homepage hero readable at {width}")
        overflow=p.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
        ok(overflow<=4,f"Homepage no horizontal overflow at {width} ({overflow})")
        display=p.locator(".wp-type-question").first.evaluate("(el)=>getComputedStyle(el).display")
        ok(display==("block" if width<=600 else "inline"),f"Responsive headline at {width}: {display}")
        p.locator("#landing-title").screenshot(path=str(out/f"home-type-{width}.png"),animations="disabled")
        footer=p.locator(".he-footer").first
        footer.scroll_into_view_if_needed()
        footer.screenshot(path=str(out/f"footer-{width}.png"),animations="disabled")
        for href in ["/field-notes/","/flow-preview/","/industries/","/my-store/"]:
            ok(footer.locator(f'a[href="{href}"]').count()>=1,f"Footer {href} exists at {width}")
        n=ctx.new_page()
        n.on("pageerror",lambda err,w=width:faults.append((w,str(err))))
        r=n.goto(BASE+"/november-fast-a-r8.html",wait_until="domcontentloaded",timeout=30000)
        ok(r and r.status==200,f"R8 200 at {width}")
        ok(n.locator("#nov-wizard").count()==1,f"R8 inquiry preserved at {width}")
        for key in ("photo","route","booking"):
            opt=n.locator(f'#first-look button[data-focus="{key}"]')
            opt.click()
            ok(opt.get_attribute("aria-pressed")=="true",f"R8 {key} choice at {width}")
        over=n.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
        ok(over<=4,f"R8 no horizontal overflow at {width} ({over})")
        section=n.locator("#more-weplace")
        section.scroll_into_view_if_needed()
        ok(section.is_visible(),f"R8 home return visible at {width}")
        section.screenshot(path=str(out/f"nov-return-{width}.png"),animations="disabled")
        action=section.locator(".nov-home-return-action")
        ok(action.is_visible(),f"R8 return CTA reachable at {width}")
        action.click()
        ok(n.url.rstrip("/")==BASE,f"R8 CTA takes user to homepage at {width}")
        ctx.close()
    nojs=browser.new_context(viewport={"width":360,"height":740},java_script_enabled=False)
    np=nojs.new_page()
    np.goto(BASE+"/november-fast-a-r8.html",wait_until="domcontentloaded")
    ok(np.locator('#more-weplace a[href="/"]').count()==1,"Bridge link works without JS")
    nojs.close()
    browser.close()
report={"checks":len(checks),"faults":faults,"bad_http":bad_http,"screenshots":len(list(out.glob("*.png")))}
(out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps(report,ensure_ascii=False))
if faults or bad_http: raise AssertionError(str(report))
