#!/usr/bin/env python3
"""Weplace PR36 recreated charts + LuWei scene + GA4 dataLayer QA.
This checks dry-run event generation, NOT GA4 ingestion or client publication rights.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, math
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"qa"/"pr36-ga4-luwei"
OUT.mkdir(parents=True,exist_ok=True)
report={"checks":[],"errors":[],"http":[],"screenshots":[]}
def ck(cond,msg):
    if not cond: raise AssertionError(msg)
    report["checks"].append(msg)
base="http://127.0.0.1:4173"
data={2023:[1.70,1.79,1.60],2024:[1.66,1.96,1.94],2025:[1.91,2.02,1.70],2026:[1.74,1.72,1.93]}
ck(round((2350-877)/877*100)==168,"+168% detailed inflow calculation")
ck(193000000-172000000==21000000,"+21,000,000 won sales delta")
ck(round((193-172)/172*100,1)==12.2,"+12.2% revenue rate")
for year,values in data.items():
    ck(len(values)==3 and all(1.5<=n<=2.1 for n in values),f"{year} provided original annual values")
for path in ("index.html","november-fast-a-r8.html"):
    html=(ROOT/path).read_text(encoding="utf-8")
    ck(html.count('class="wp-pr36-combo"')==2,path+" has both PR36 combo charts")
    ck(html.count('class="wp-ev-year-mini')==4,path+" has four 3-month year charts")
    ck(html.count('id="observed-records"')==1,path+" has one evidence section")
    ck(html.count('id="luwei-first-look"')==1,path+" has one LuWei scene")
    ck("G-FVCYL26FTL" in html,path+" has new GA4 stream ID")
    ck("사진·길·예약" in html,path+" retains the original customer journey")
    for year,values in data.items():
        ck(f"{year}년" in html,path+f" labels {year}")
        for v in values:ck(f"{v:.2f}" in html,path+f" includes {v:.2f} reference value")
    ck("원본 관리자 화면·매출 원장 및 외부 공개 권한은 최종 대조가 필요합니다" in html,path+" qualifies source")
ck("G-H9B5F4HRDS" in (ROOT/"index.html").read_text(encoding="utf-8"),"Existing homepage GA4 ID preserved")
ck((ROOT/"cases/luwei-first-look/index.html").is_file(),"LuWei source case page preserved")
for path in ("assets/home-r42/luwei-exterior-crop.webp","assets/home-r42/luwei-peking-duck-640.webp","assets/home-r42/luwei-peking-duck-1254.webp"):
    ck((ROOT/path).is_file(),"LuWei supplied source exists "+path)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,channel="chrome")
 for w,h in ((360,740),(390,844),(768,1024),(1440,900)):
  ctx=b.new_context(viewport={"width":w,"height":h},device_scale_factor=1,reduced_motion="reduce")
  for typ,path in (("main","/index.html"),("nov","/november-fast-a-r8.html")):
   page=ctx.new_page()
   page.route("**/googletagmanager.com/**",lambda route:route.abort())
   page.route("**/google-analytics.com/**",lambda route:route.abort())
   page.on("pageerror",lambda e:report["errors"].append(str(e)))
   page.on("response",lambda r:report["http"].append((r.status,r.url)) if r.status>=400 and r.url.startswith(base) else None)
   resp=page.goto(base+path,wait_until="domcontentloaded")
   ck(resp and resp.status==200,f"{typ} HTTP 200 at {w}")
   page.locator("#observed-records").scroll_into_view_if_needed()
   ck(page.locator(".wp-pr36-combo").count()==2,f"{typ} two SVG bar-line charts at {w}")
   ck(page.locator(".wp-ev-year-mini svg").count()==4,f"{typ} four year charts at {w}")
   ck(page.locator("#observed-records .wp-pr36-line").count()==2,f"{typ} two trend overlays at {w}")
   ov=page.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
   ck(ov<=4,f"{typ} no horizontal overflow {w}: {ov}")
   page.locator("#observed-records").screenshot(path=str(OUT/f"{typ}-chart-{w}.png"),animations="disabled")
   report["screenshots"].append(f"{typ}-chart-{w}.png")
   lw=page.locator("#luwei-first-look")
   lw.scroll_into_view_if_needed()
   lw.locator('[data-lw-action="skip"]').click()
   ck(lw.locator(".wp-lw-screen").get_attribute("data-phase")=="after",f"{typ} duck image after skip {w}")
   lw.screenshot(path=str(OUT/f"{typ}-luwei-{w}.png"),animations="disabled")
   report["screenshots"].append(f"{typ}-luwei-{w}.png")
   configured=page.evaluate("Array.from(window.dataLayer||[]).some(a=>a[0]==='config'&&a[1]==='G-FVCYL26FTL')")
   ck(configured,f"{typ} GA4 config queued {w}")
   if typ=="main":
      existing=page.evaluate("Array.from(window.dataLayer||[]).some(a=>a[0]==='config'&&a[1]==='G-H9B5F4HRDS')")
      ck(existing,f"Main legacy GA4 queued {w}")
   else:
      ck(page.locator("#nov-wizard").count()==1,f"R8 wizard preserved {w}")
   page.close()
  ctx.close()
 nojs=b.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
 p=nojs.new_page();p.goto(base+"/november-fast-a-r8.html",wait_until="domcontentloaded")
 ck(p.locator("#observed-records .wp-pr36-combo").count()==2,"No-JS static chart fallback")
 ck(p.locator("#luwei-first-look .wp-lw-frame--after").count()==1,"No-JS food image fallback")
 nojs.close()
 b.close()
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"checks":len(report["checks"]),"errors":report["errors"],"bad_http":report["http"],"screenshots":len(report["screenshots"])},ensure_ascii=False))
if report["errors"] or report["http"]:raise AssertionError(str(report))
