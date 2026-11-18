#!/usr/bin/env python3
"""Read-only Natural Korean public-page quality gate. No user data or deployment."""
from pathlib import Path
from html.parser import HTMLParser
import json, os, re, shutil, subprocess, tempfile, sys
from playwright.sync_api import sync_playwright

FILES=[
 "index.html","november-fast-a-r6.html","industries/index.html",
 "industries/beauty/index.html","industries/esthetic/index.html",
 "industries/restaurant/index.html","industries/cafe/index.html",
 "industries/dining.html","industries/hospitality.html","industries/stay.html",
 "problems/index.html","problems/google-business-profile/index.html",
 "start/index.html","check/index.html","my-store/index.html"
]
ROOT=Path(".")
BASE=os.environ.get("WEPLACE_REVIEW_BASE","http://127.0.0.1:4173").rstrip("/")
OUT=Path("qa/public-copy-natural-20261118")
OUT.mkdir(parents=True,exist_ok=True)
report={"files":FILES,"checks":[],"errors":[],"screenshots":[],"known_preexisting":[]}
def test(name,ok,detail=None):
    report["checks"].append({"name":name,"pass":bool(ok),"detail":detail})
    if not ok:print("FAIL",name,detail,flush=True)

class Info(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.headings=[];self.links=[];self.ids=set();self.styles=0;self.scripts=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="h1":self.headings.append(a)
        if "id" in a:self.ids.add(a["id"])
        if tag=="a" and "href" in a:self.links.append(a["href"])
        if tag=="style":self.styles+=1
        if tag=="script":self.scripts+=1

for p in FILES:
    content=(ROOT/p).read_text(encoding="utf-8")
    info=Info();info.feed(content)
    test(p+": exists with one H1",len(info.headings)==1)
    test(p+": has a real title",bool(re.search(r"<title>[^<]{6,}</title>",content)))
    test(p+": no obsolete 2025 tourist number","1,740만" not in content)
    if p=="november-fast-a-r6.html":
        test("campaign: 5-step slide and result",content.count("data-wizard-step=")==6)
        test("campaign: neither direct Kakao autosend nor Sheets upload","fetch(" not in content and "navigator.sendBeacon" not in content and "noindex,nofollow" in content)
    if p=="industries/index.html":
        test("industry hub: live cafe & stay links",'/industries/cafe/' in info.links and '/industries/stay.html' in info.links)
        test("industry hub: unpublished paths are not clickable",all(x not in info.links for x in ['/industries/massage/','/industries/clinic/','/industries/stay/']))
    if p=="index.html":
        test("main: published campaign link is discoverable",'/november-fast/' in info.links)
        test("main: PR43 unified root sections preserved",all(x in info.ids for x in ('top','fast','experience','work','capabilities','evidence','contact')))
    if p=="industries/beauty/index.html":
        test("beauty: never link to missing massage page",'/industries/massage/' not in info.links)
    # Inline examples in HTML comments can mention a literal <script> tag; they are not executable.
    # Remove HTML comments only for script extraction, not for page/DOM assertions.
    uncommented=re.sub(r'<!--[\s\S]*?-->','',content)
    for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>',uncommented,re.I):
        attrs,body=m.groups()
        if 'src=' in attrs:continue
        typ=re.search(r'\btype=["\']([^"\']+)["\']',attrs)
        if typ and 'ld+json' in typ.group(1):
            try:json.loads(body)
            except Exception as e:report['errors'].append(p+": JSON-LD "+str(e))
        elif not typ or typ.group(1) in ("text/javascript","module"):
            if not body.strip():continue
            with tempfile.NamedTemporaryFile(mode="w",suffix=".js",encoding="utf-8",delete=False) as tmp:
                tmp.write(body); name=tmp.name
            try:
                proc=subprocess.run(["node","--check",name],capture_output=True,text=True,timeout=15)
                if proc.returncode:report["errors"].append(p+": JavaScript syntax "+proc.stderr[:280])
            finally:os.remove(name)

with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,channel="chrome")
    paths=["/","/november-fast-a-r6.html","/industries/","/industries/restaurant/","/industries/cafe/","/industries/stay.html","/industries/beauty/","/problems/","/problems/google-business-profile/","/start/","/check/","/my-store/"]
    for width in (390,1440):
        ctx=browser.new_context(viewport={"width":width,"height":844 if width<900 else 900},reduced_motion="reduce")
        page=ctx.new_page()
        # The static test server is purposely isolated from external analytics and assets.
        page.route("https://**",lambda route:route.abort())
        for route in paths:
            caught=[]
            def onerror(e):caught.append(str(e))
            page.on("pageerror",onerror)
            try:
                res=page.goto(BASE+route,wait_until="domcontentloaded",timeout=15000)
                test(str(width)+route+" HTTP 200",res is not None and res.status==200)
                test(str(width)+route+" no horizontal overflow",page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),page.evaluate("({view:innerWidth,scroll:document.documentElement.scrollWidth})"))
                test(str(width)+route+" single H1",page.locator("h1").count()==1)
            except Exception as e:
                report["errors"].append(str(width)+route+": "+str(e)[:220])
            finally:
                page.remove_listener("pageerror",onerror)
            if caught:report["errors"].append(str(width)+route+": "+repr(caught[:2]))
        page.goto(BASE+"/november-fast-a-r6.html",wait_until="domcontentloaded")
        page.locator('[data-relationship="new"]').click()
        page.locator('[data-industry="restaurant"]').click()
        page.locator('[data-intake-focus="route"]').click()
        page.locator('[data-concern="parking"]').click()
        page.locator('[data-request="pricing"]').click()
        test(str(width)+" campaign still finishes at summary",page.locator("#nov-wizard").get_attribute("data-active-step")=="5")
        test(str(width)+" campaign complete message has correct topic",all(x in page.locator("#prepared-message").input_value() for x in ("식당","찾아오는 길","주차","비용·일정")))
        test(str(width)+" campaign exposes official Kakao channel",page.locator("#copy-and-chat").get_attribute("href")=="https://pf.kakao.com/_mxbexhX")
        if width==390:
            page.screenshot(path=str(OUT/"campaign-390.png"),animations="disabled")
            report["screenshots"].append("campaign-390.png")
            page.goto(BASE+"/",wait_until="domcontentloaded")
            page.screenshot(path=str(OUT/"home-390.png"),animations="disabled")
            report["screenshots"].append("home-390.png")
        ctx.close()
    browser.close()

report["passed"]=sum(x["pass"] for x in report["checks"])
report["failed"]=sum(not x["pass"] for x in report["checks"])
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print("WEPLACE PUBLIC COPY:",report["passed"],"passed",report["failed"],"failed",len(report["errors"]),"errors")
for error in report["errors"][:25]:print("ERROR:",error)
if report["failed"] or report["errors"]:sys.exit(1)
