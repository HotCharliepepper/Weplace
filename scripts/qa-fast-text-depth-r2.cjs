/* Playwright QA for isolated sunwind route. No production/CRM/network writes. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve('test-results/fast-text-depth-r2');
fs.mkdirSync(dir,{recursive:true});
const outcomes=[],errors=[],writes=[],broken=[];
function check(label,ok,detail=''){
  outcomes.push({label,pass:!!ok,detail});
  if(!ok)console.error('FAIL',label,detail);
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+req.url())});
 page.on('response',resp=>{if(resp.status()>=400)broken.push(resp.status()+' '+resp.url())});
 try {
  for(const width of [360,390,430,768,1280,1440]){
   await page.setViewportSize({width,height:width<801?844:920});
   await page.goto('http://127.0.0.1:4173/unified-r3-text-depth.html',{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   check(width+' valid title',await page.locator('#hero-title').count()===1);
   check(width+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(width+' light layer',await page.locator('.swd-sun').count()===1);
   check(width+' wind layers',await page.locator('.swd-wind').count()===4);
   check(width+' logo and sound',await page.locator('.rf-header .rf-logo img').count()===1&&await page.locator('#fast-sound').getAttribute('aria-pressed')==='false');
   check(width+' chart preserved',await page.locator('#chart-heading').count()===1);
   await page.locator('#fast').scrollIntoViewIfNeeded();
   await page.locator('#fast .rf-aperture img').evaluate(img=>img.decode().catch(()=>{}));
   check(width+' hero photo loads',await page.locator('#fast .rf-aperture img').evaluate(i=>i.complete&&i.naturalWidth>0));
   check(width+' live text still readable',await page.locator('#hero-title').isVisible());
   check(width+' heading not clipped',await page.locator('#hero-title').evaluate(el=>{
     const r=el.getBoundingClientRect(),hero=el.closest('.rf-hero').getBoundingClientRect();
     return r.left>=-2&&r.right<=innerWidth+3&&r.top>=hero.top-4&&r.bottom<=hero.bottom+4;
   }));
   check(width+' section depth exists',await page.evaluate(()=>{
     const ids=['#landing-title','#experience-title','#capabilities-title','#evidence-title','#contact-title'];
     return ids.every(sel=>getComputedStyle(document.querySelector(sel)).textShadow!=='none');
   }));
   check(width+' number remains legible text',await page.locator('.u-number').evaluate(el=>el.textContent.includes('2,100') && getComputedStyle(el).textShadow!=='none'));
   check(width+' three word depth levels',await page.locator('.rf-word-row .rf-word').evaluateAll(words=>words.length===3&&words.every(w=>getComputedStyle(w).textShadow!=='none')));
   if(width===390||width===1440){
     await page.locator('#fast').screenshot({path:path.join(dir,width+'-text-depth-hero.png')});
     await page.screenshot({path:path.join(dir,width+'-full.png'),fullPage:true});
   }
   for(const focus of ['photo','route','booking']){
     await page.locator('button[data-focus="'+focus+'"]').click();
     await page.locator('button[data-mode="after"]').click();
     check(width+' interaction '+focus,await page.locator('[data-view="'+focus+'-after"]').isVisible());
   }
   await page.locator('[data-open-request]').first().click();
   check(width+' inquiry dialog',await page.locator('#request-dialog').evaluate(el=>el.open));
   await page.keyboard.press('Escape');
   check(width+' return',await page.locator('#request-dialog').evaluate(el=>!el.open));
  }
  await page.setViewportSize({width:1440,height:920});
  await page.goto('http://127.0.0.1:4173/unified-r3-text-depth.html',{waitUntil:'load'});
  await page.locator('#fast').scrollIntoViewIfNeeded();
  await page.locator('#fast-replay').waitFor({state:'visible'});
  check('replay enabled',await page.locator('#fast-replay').isEnabled());
  await page.locator('#fast-replay').click();
  try {
   await page.waitForFunction(()=>document.querySelector('.swd-atmosphere')?.dataset.swdPlaying==='yes',undefined,{timeout:1400});
   check('wind responds to FAST acceleration',true);
  } catch(err) {check('wind responds to FAST acceleration',false,err.message)}
  await page.waitForTimeout(1150);
  check('wind stops after finite animation',await page.locator('.swd-atmosphere').getAttribute('data-swd-playing')===null);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/unified-r3-text-depth.html',{waitUntil:'load'});
  check('reduced motion disables wind playback',await page.evaluate(()=>getComputedStyle(document.querySelector('.swd-wind')).animationName==='none'));
  check('reduced motion text remains',await page.locator('#hero-title').isVisible());
  check('no page script errors',errors.length===0,errors.join('\n'));
  check('no HTTP errors',broken.length===0,broken.join('\n'));
  check('no write requests',writes.length===0,writes.join('\n'));
  const results={pass:outcomes.filter(x=>x.pass).length,fail:outcomes.filter(x=>!x.pass).length,checks:outcomes,errors,broken,writes};
  fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(results,null,2));
  console.log('FAST TEXT DEPTH R2',results.pass,'passed',results.fail,'failed');
  if(results.fail)process.exitCode=1;
 } finally {await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
