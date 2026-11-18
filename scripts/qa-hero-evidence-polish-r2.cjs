/* Draft-only browser QA. Source R3, production and customer data remain untouched. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve('test-results/hero-evidence-polish-r2');fs.mkdirSync(dir,{recursive:true});
const report={checks:[],errors:[],broken:[],writes:[]};
const check=(name,pass,detail='')=>{report.checks.push({name,pass:!!pass,detail});if(!pass)console.error('FAILED:',name,detail)};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',res=>{if(res.status()>=400)report.broken.push(res.status()+' '+res.url())});
 page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))report.writes.push(req.method()+' '+req.url())});
 try{
  for(const width of [360,390,430,768,1280,1440]){
   await page.setViewportSize({width,height:width<801?840:900});
   await page.goto('http://127.0.0.1:4173/unified-r3-hero-polish.html',{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   check(width+' eight sections',await page.locator('main>section').count()===8);
   check(width+' no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(width+' 2026 highlighted',await page.locator('[data-compare-year="2026"]').getAttribute('aria-pressed')==='true');
   check(width+' 2023 initially muted',await page.locator('[data-compare-year="2023"]').getAttribute('aria-pressed')==='false');
   check(width+' all 4 graph lines',await page.locator('.he-line').count()===4);
   check(width+' corrected exact values',await page.locator('.he-raw-values tbody tr').allTextContents().then(rows=>
     rows.some(t=>t.includes('2023')&&t.includes('1.60')) &&
     rows.some(t=>t.includes('2025')&&t.includes('1.70'))));
   check(width+' 04 palette',await page.locator('#work').evaluate(el=>getComputedStyle(el).backgroundImage.includes('linear-gradient')));
   await page.locator('[data-compare-year="2024"]').click();
   check(width+' overlay 2024 and 2026',await page.locator('.he-line.is-selected').count()===2);
   await page.locator('[data-compare-all]').click();
   check(width+' show all',await page.locator('.he-line.is-selected').count()===4);
   await page.locator('[data-compare-2026]').click();
   check(width+' reset 2026 only',await page.locator('.he-line.is-selected').evaluateAll(all=>all.length===1&&all[0].dataset.chartYear==='2026'));
   check(width+' native photo no zoom',await page.locator('.he-image-before').evaluate(img=>getComputedStyle(img).transform==='none'));
   check(width+' inviting menu action',await page.locator('[data-photo-peek]').isEnabled());
   await page.locator('[data-photo-peek]').click();
   await page.waitForFunction(()=>document.querySelector('[data-photo-stage]')?.dataset.phase==='after',null,{timeout:1700});
   check(width+' exterior-to-duck photo interaction',await page.locator('[data-photo-stage]').getAttribute('data-phase')==='after');
   await page.locator('.he-photo-controls button[data-photo-choice="before"]').click();
   check(width+' photo replay',await page.locator('[data-photo-stage]').getAttribute('data-phase')==='before');
   for(const topic of ['photo','route','booking']){
    await page.locator('button[data-focus="'+topic+'"]').click();
    await page.locator('button[data-mode="after"]').click();
    check(width+' preserved experience '+topic,await page.locator('[data-view="'+topic+'-after"]').isVisible());
   }
   await page.locator('#work .rf-word-row').first().scrollIntoViewIfNeeded();
   await page.waitForTimeout(125);
   check(width+' one word is in focus',await page.locator('#work .rf-word-row.is-word-active').count()===1);
   check(width+' full footer',await page.locator('footer.he-footer .he-footer-nav a').count()>=6);
   check(width+' footer main CTA',await page.locator('footer.he-footer a[href="#contact"]').count()===1);
   await page.locator('#fast').scrollIntoViewIfNeeded();
   check(width+' FAST still readable',await page.locator('#hero-title').isVisible());
   check(width+' FAST sound off',await page.locator('#fast-sound').getAttribute('aria-pressed')==='false');
   await page.locator('[data-open-request]').first().click();
   check(width+' inquiry dialog opens',await page.locator('#request-dialog').evaluate(el=>el.open));
   await page.keyboard.press('Escape');
   check(width+' inquiry dialog closes',await page.locator('#request-dialog').evaluate(el=>!el.open));
   if(width===390||width===1440){
    await page.locator('#hero-evidence').screenshot({path:path.join(dir,width+'-hero-evidence.png')});
    await page.locator('#work').screenshot({path:path.join(dir,width+'-work.png')});
    await page.screenshot({path:path.join(dir,width+'-full.png'),fullPage:true});
   }
  }
  await page.setViewportSize({width:390,height:840});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/unified-r3-hero-polish.html',{waitUntil:'load'});
  await page.locator('.he-photo-controls button[data-photo-choice="after"]').click();
  check('reduced motion instant photo change',await page.locator('[data-photo-stage]').getAttribute('data-phase')==='after');
  check('reduced motion controls remain available',await page.locator('[data-compare-year="2023"]').isEnabled());
  check('no script errors',report.errors.length===0,report.errors.join(' / '));
  check('no asset HTTP errors',report.broken.length===0,report.broken.join(' / '));
  check('no write requests',report.writes.length===0,report.writes.join(' / '));
  const result={...report,passed:report.checks.filter(c=>c.pass).length,failed:report.checks.filter(c=>!c.pass).length};
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(result,null,2));
  console.log('HERO EVIDENCE POLISH R2',result.passed,'passed',result.failed,'failed');
  if(result.failed)process.exitCode=1;
 } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});