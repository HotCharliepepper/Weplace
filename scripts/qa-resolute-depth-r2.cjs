/* Preview-only QA. Run with npm build and local dist server on 127.0.0.1:4173. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve('test-results/resolute-depth-r2');
fs.mkdirSync(out,{recursive:true});
const rows=[];
const check=(label,ok,detail='')=>{rows.push({label,passed:!!ok,detail});if(!ok)console.error('FAIL',label,detail)};
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage();
  const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
  try{
    for(const width of [360,390,430,768,1280,1440]){
      await page.setViewportSize({width,height:width<801?844:960});
      await page.goto('http://127.0.0.1:4173/resolute-depth.html',{waitUntil:'load'});
      await page.evaluate(()=>document.fonts.ready);
      check(width+' title',await page.locator('#hero-title').count()===1);
      check(width+' new hero',await page.locator('.rf-hero-art img[src="/img/weplace-hero-surface.jpg"]').count()===1);
      check(width+' image loaded',await page.locator('.rf-hero-art img').evaluate(img=>img.complete&&img.naturalWidth>0));
      check(width+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      check(width+' section backgrounds',await page.evaluate(()=>['#experience','#work','#contact'].every(id=>getComputedStyle(document.querySelector(id)).backgroundImage.includes('gradient'))));
      check(width+' orbit present',await page.locator('.rv-orbit').count()===2);
      check(width+' sound off',await page.locator('#fast-sound').getAttribute('aria-pressed')==='false');
      for(const focus of ['photo','route','booking']){
        await page.locator('button[data-focus="'+focus+'"]').click();
        check(width+' focus '+focus,await page.locator('button[data-focus="'+focus+'"]').getAttribute('aria-pressed')==='true');
      }
      await page.locator('button[data-mode="after"]').click();
      check(width+' after comparison',await page.locator('[data-view="booking-after"]').isVisible());
      check(width+' working inquiry',await page.locator('[data-open-request]').count()>0);
      await page.locator('[data-open-request]').first().click();
      check(width+' dialog opens',await page.locator('#request-dialog').evaluate(d=>d.open));
      await page.keyboard.press('Escape');
      check(width+' dialog closes',await page.locator('#request-dialog').evaluate(d=>!d.open));
      if(width===390||width===1440){
        await page.goto('http://127.0.0.1:4173/resolute-depth.html',{waitUntil:'load'});
        await page.screenshot({path:path.join(out,width+'-hero.png')});
        await page.screenshot({path:path.join(out,width+'-full.png'),fullPage:true});
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('http://127.0.0.1:4173/resolute-depth.html',{waitUntil:'load'});
    check('reduced motion rays remain hidden',await page.locator('.rv-ray').evaluateAll(rays=>rays.every(r=>getComputedStyle(r).opacity==='0')));
    check('reduced motion hero remains visible',await page.locator('#hero-title').isVisible());
    check('no scripted page errors',errors.length===0,errors.join(' / '));
    check('no write requests',writes.length===0,writes.join(' / '));
    const report={passed:rows.filter(r=>r.passed).length,failed:rows.filter(r=>!r.passed).length,results:rows,errors,writes};
    fs.writeFileSync(path.join(out,'qa.json'),JSON.stringify(report,null,2));
    console.log('Depth R2',report.passed,'passed;',report.failed,'failed');
    if(report.failed)process.exitCode=1;
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});