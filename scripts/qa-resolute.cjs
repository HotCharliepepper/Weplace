/* Run after npm run build, with dist served at 127.0.0.1:4173. No live APIs. */
const {chromium} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve('test-results/resolute');
fs.mkdirSync(out,{recursive:true});
const checks=[];const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});if(!pass)console.error('FAIL',name,detail||'');};
const pause = page => page.waitForTimeout(420);
(async()=>{
 const browser = await chromium.launch({headless:true});
 const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page = await context.newPage();const errors=[], writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push({url:r.url(),method:r.method()});});
 try {
  for(const width of [360,390,430,768,1280,1440]) {
   await page.setViewportSize({width,height:width<800?844:1000});
   await page.goto('http://127.0.0.1:4173/resolute.html');await page.evaluate(()=>document.fonts.ready);
   check(`${width}: GSAP`,await page.evaluate(()=>!!window.gsap&&ScrollTrigger.getAll().length===5));
   check(`${width}: overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width===390||width===1440)await page.screenshot({path:path.join(out,`WEPLACE_Resolute_${width===390?'Mobile':'Desktop'}_Hero.png`)});
   for(const topic of ['photo','route','booking']) {
    await page.locator(`button[data-focus="${topic}"]`).click();
    for(const mode of ['before','after']) {
     await page.locator(`button[data-mode="${mode}"]`).click();await pause(page);
     check(`${width}: ${topic}/${mode}`,await page.locator(`[data-view="${topic}-${mode}"]`).isVisible());
     check(`${width}: ${topic}/${mode} overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     if(topic==='route'&&width===1440)await page.locator('.rf-stage').screenshot({path:path.join(out,`WEPLACE_Resolute_Arrival_${mode}.png`)});
     if(topic==='route'&&width===390&&mode==='after')await page.locator('.rf-stage').screenshot({path:path.join(out,'WEPLACE_Resolute_Mobile_Arrival.png')});
    }
   }
   await page.locator('[data-guests="6"]').click();await page.locator('[data-time="19:30"]').click();
   check(`${width}: booking selection`,await page.locator('#booking-summary').textContent()==='6명 · 19:30 선택 예시');
   check(`${width}: images`,await page.locator('img:visible').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
   check(`${width}: target sizes`,await page.locator('.rf-choices button,.rf-modes button,.rf-booking-options button').evaluateAll(bs=>bs.filter(b=>b.getBoundingClientRect().width>0).every(b=>b.getBoundingClientRect().height>=43.5)));
   await page.locator('[data-open-request]').click();
   check(`${width}: modal focus`,await page.evaluate(()=>document.activeElement.id==='store'));
   check(`${width}: selected interest`,await page.locator('#interest').inputValue()==='booking');
   await page.keyboard.press('Escape');
   check(`${width}: modal close / focus return`,await page.evaluate(()=>!document.querySelector('dialog').open&&document.activeElement.matches('[data-open-request]')));
  }
  await page.locator('button[data-focus="route"]').click();await page.locator('[data-open-request]').click();
  await page.locator('#store').fill('검수용 가상 매장');await page.locator('#region').fill('검수용 지역');
  await page.locator('#request-form button[type=submit]').click();
  check('request includes selection', (await page.locator('#request-text').inputValue()).includes('찾아오는 길'));
  check('request explicitly unsubmitted',(await page.locator('#request-status').textContent()).includes('아직 전송하거나 접수하지 않았습니다'));
  await page.locator('#copy-request').click();
  check('clipboard actual copy', (await page.evaluate(()=>navigator.clipboard.readText())).includes('검수용 가상 매장'));
  await page.locator('#store').fill('수정한 가상 매장');
  check('editing invalidates prepared request',await page.locator('#request-result').isHidden());
  for(let i=0;i<14;i++){await page.keyboard.press('Tab');check(`modal focus containment ${i}`,await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)));}
  await page.keyboard.press('Escape');
  await page.locator('button[data-focus="photo"]').click();await page.locator('[data-open-request]').click();
  check('reopened dialog discards stale topic',await page.locator('#request-result').isHidden() && await page.locator('#interest').inputValue()==='photo');
  await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await pause(page);
  check('live reduced-motion removes triggers',await page.evaluate(()=>ScrollTrigger.getAll().length===0));
  check('live reduced-motion restores text',await page.locator('.rf-word').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).transform==='none')));
  for(const width of [390,1440]) {
   await page.setViewportSize({width,height:width===390?844:1000});await page.goto('http://127.0.0.1:4173/resolute.html');await page.evaluate(()=>document.fonts.ready);
   check(`${width}: reduced-motion initial`,await page.evaluate(()=>document.documentElement.dataset.rfMotion==='off'&&ScrollTrigger.getAll().length===0));
   await page.locator('button[data-mode="after"]').click();check(`${width}: reduced-motion controls`,await page.locator('[data-view="route-after"]').isVisible());
   await page.screenshot({path:path.join(out,`WEPLACE_Resolute_${width===390?'Mobile':'Desktop'}_Full.png`),fullPage:true});
  }
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4173/resolute.html');
  await page.locator('#motion-toggle').click();check('manual motion off',await page.evaluate(()=>ScrollTrigger.getAll().length===0));
  await page.locator('#motion-toggle').click();check('manual motion on',await page.evaluate(()=>ScrollTrigger.getAll().length===5));
  const scales=[];
  for(const progress of [0,.3,.7,1]){await page.evaluate(p=>{const end=document.querySelector('.rf-hero').offsetHeight-innerHeight*.1;scrollTo(0,end*p);},progress);await page.waitForTimeout(700);scales.push(await page.locator('.rf-aperture').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a));}
  check('expand / contract / expand',scales[1]>scales[0]&&scales[2]<scales[1]&&scales[3]>scales[2],scales);
  check('no pinned scroll',await page.locator('.pin-spacer').count()===0);
  await page.route('**/assets/vendor/gsap/**',r=>r.abort());await page.reload();
  check('GSAP failure readable',await page.locator('.rf-word').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')));
  await page.locator('button[data-mode="after"]').click();check('GSAP failure usable',await page.locator('[data-view="route-after"]').isVisible());
  await page.unroute('**/assets/vendor/gsap/**');
  const fallbackContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await fallbackContext.newPage();
  await fallback.goto('http://127.0.0.1:4173/resolute.html');
  check('no JS primary CTA fallback',await fallback.locator('[data-open-request]').getAttribute('href')==='/#request');
  check('no JS content remains',await fallback.locator('h1').isVisible()&&await fallback.locator('[data-view="route-before"]').isVisible());
  await fallbackContext.close();
  check('no writes during UI interaction',writes.length===0,writes);
  check('no page JS errors',errors.length===0,errors);
 }catch(e){check('unhandled browser test error',false,e.stack);}
 finally{await browser.close();const report={passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,completedAt:new Date().toISOString(),scope:'Chromium viewport and media emulation; no real device, Safari, Kakao or live request verified.'};fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;}
})();
