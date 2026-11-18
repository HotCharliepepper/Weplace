#!/usr/bin/env python3
"""Read-only Weplace OG + LuWei 700ms dwell preview QA.
No forms, customer-data writes, live deployment, or Kakao sends.
"""
from pathlib import Path
from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright
import json, os, sys, time

BASE=os.environ.get('WEPLACE_BASE','http://127.0.0.1:4173').rstrip('/')
OUT=Path('qa/fast-og-luwei-r1')
OUT.mkdir(parents=True,exist_ok=True)
results={'checks':[], 'errors':[], 'writes':[], 'screenshots':[]}
def ok(name,pass_condition,details=None):
    val=bool(pass_condition)
    results['checks'].append({'name':name,'pass':val,'details':details})
    if not val: print('FAIL:',name,details,flush=True)
png=Path('assets/brand/og-resolute-fast.png')
crop=Path('assets/home-r42/luwei-exterior-crop.webp')
ok('OG PNG produced',png.is_file())
ok('LuWei exterior-only image produced',crop.is_file())
ok('full screenshot NOT copied into release branch',not Path('assets/home-r42/luwei-before-capture.webp').exists())
if png.exists():
    with Image.open(png) as im:
        ok('OG is 1200 × 630 PNG',im.format=='PNG' and im.size==(1200,630))
        ok('OG artwork has image detail',ImageStat.Stat(im.convert('RGB')).stddev[1]>15)
if crop.exists():
    with Image.open(crop) as im:
        ok('crop derived from facade-only bounds',im.format=='WEBP' and im.size==(894,874))
for path in ('assets/home-r42/luwei-peking-duck-1254.webp','assets/home-r42/luwei-peking-duck-640.webp'):
    ok('existing LuWei duck image '+path,Path(path).exists())

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,channel='chrome')
    for width in (360,390,768,1440):
        ctx=browser.new_context(viewport={'width':width,'height':844 if width<=768 else 900},device_scale_factor=1)
        page=ctx.new_page()
        page.route('https://**',lambda route:route.abort())
        page.on('pageerror',lambda err:results['errors'].append('JS: '+str(err)))
        def check_write(req):
            if req.method in ('GET','HEAD'):return
            # These analytics requests already exist on the published main.
            # The new LuWei scene itself does not submit or collect customer data.
            inherited_ga=(
                req.url.startswith('https://analytics.google.com/g/collect') or
                req.url.startswith('https://stats.g.doubleclick.net/g/collect')
            )
            if not (inherited_ga and req.method=='POST'):
                results['writes'].append(req.method+' '+req.url)
        page.on('request',check_write)
        page.on('response',lambda r:results['errors'].append('HTTP '+str(r.status)+' '+r.url) if r.status>=400 and r.url.startswith(BASE) else None)
        response=page.goto(BASE+'/',wait_until='load')
        ok(f'{width} homepage loads',response and response.status==200)
        ok(f'{width} OG image matches brand creative',page.locator('meta[property="og:image"]').get_attribute('content')=='https://withweplace.kr/assets/brand/og-resolute-fast.png')
        ok(f'{width} tagline in OG alt', 'RESOLUTE' in page.locator('meta[property="og:image:alt"]').get_attribute('content'))
        ok(f'{width} page width does not overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),page.evaluate('({scroll:document.documentElement.scrollWidth,width:innerWidth})'))
        ok(f'{width} original main landmarks protected',all(page.locator('#'+a).count()==1 for a in ('top','fast','experience','work','capabilities','contact')))
        ok(f'{width} scene between FAST and comparison',page.evaluate("""()=>{
          const a=document.querySelector('#fast'),b=document.querySelector('#luwei-scene'),c=document.querySelector('#experience');
          return a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING && b.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING;
        }"""))
        ok(f'{width} stage starts with exterior',page.locator('#luwei-stage').get_attribute('data-phase')=='before')
        image=page.locator('#luwei-before img')
        stage=page.locator('#luwei-visual')
        stage.scroll_into_view_if_needed()
        page.wait_for_function("""()=>{
          const image=document.querySelector('#luwei-before img');
          return image&&image.complete&&image.naturalWidth>0;
        }""",timeout=12000)
        ok(f'{width} source exterior crop renders',image.evaluate('i=>i.naturalWidth===894&&i.naturalHeight===874'))
        if width in (390,1440):
            stage.screenshot(path=str(OUT/f'luwei-exterior-{width}.png'),animations='disabled')
            results['screenshots'].append(f'luwei-exterior-{width}.png')
        page.wait_for_function("document.querySelector('#luwei-stage').dataset.phase==='bridge'",timeout=6000)
        ok(f'{width} green message appears after dwell',page.locator('#luwei-stage').get_attribute('data-phase')=='bridge')
        if width in (390,1440):
            stage.screenshot(path=str(OUT/f'luwei-message-{width}.png'),animations='disabled')
            results['screenshots'].append(f'luwei-message-{width}.png')
        page.wait_for_function("document.querySelector('#luwei-stage').dataset.phase==='after'",timeout=6000)
        duck=page.locator('#luwei-after img')
        page.wait_for_function("""()=>{
          const image=document.querySelector('#luwei-after img');
          return image&&image.complete&&image.naturalWidth>0;
        }""",timeout=12000)
        ok(f'{width} Peking duck visible after green transition',page.locator('#luwei-stage').get_attribute('data-phase')=='after' and duck.evaluate('i=>i.naturalWidth>=640'))
        ok(f'{width} source and duck are separate photo assets',duck.get_attribute('src')!=image.get_attribute('src'))
        if width in (390,1440):
            stage.screenshot(path=str(OUT/f'luwei-duck-{width}.png'),animations='disabled')
            results['screenshots'].append(f'luwei-duck-{width}.png')
        page.locator('#luwei-replay').click()
        ok(f'{width} replay shows exterior again',page.locator('#luwei-stage').get_attribute('data-phase')=='before')
        page.locator('#luwei-skip').click()
        ok(f'{width} skip jumps to food without scroll lock',page.locator('#luwei-stage').get_attribute('data-phase')=='after')
        ok(f'{width} scroll still available',page.evaluate("getComputedStyle(document.body).overflowY!=='hidden'"))
        ok(f'{width} direct CTA continues into existing comparison',page.locator('#luwei-scene a[href="#experience"]').count()==1)
        ctx.close()
    reduced=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    rp=reduced.new_page()
    rp.route('https://**',lambda route:route.abort())
    rp.goto(BASE+'/',wait_until='load')
    ok('reduced motion shows static duck without animated intertitle',rp.locator('#luwei-stage').get_attribute('data-phase')=='after')
    rp.locator('#luwei-replay').click()
    ok('reduced motion replay reveals exterior without movement',rp.locator('#luwei-stage').get_attribute('data-phase')=='before')
    rp.locator('#luwei-skip').click()
    ok('reduced motion visitor can return to duck',rp.locator('#luwei-stage').get_attribute('data-phase')=='after')
    reduced.close()
    nojs=browser.new_context(viewport={'width':390,'height':844},java_script_enabled=False)
    np=nojs.new_page()
    np.route('https://**',lambda route:route.abort())
    np.goto(BASE+'/',wait_until='domcontentloaded')
    ok('no-JS retains readable source and alternative duck picture',np.locator('#luwei-before img').count()==1 and np.locator('.wp-luwei-noscript img').count()==1)
    nojs.close()
    browser.close()
results['passed']=sum(x['pass'] for x in results['checks'])
results['failed']=len(results['checks'])-results['passed']
(OUT/'report.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"FAST & LUWEI QA: {results['passed']} passed, {results['failed']} failed, {len(results['errors'])} errors, {len(results['writes'])} writes",flush=True)
if results['errors']:print('ERRORS',results['errors'][:15],flush=True)
if results['failed'] or results['errors'] or results['writes']:sys.exit(1)
