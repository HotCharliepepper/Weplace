/* Read-only Chromium smoke QA for the three new Weplace public routes. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.RV_BASE_URL || 'http://127.0.0.1:4173';
const out = path.resolve('docs/full-site-launch/browser');
fs.mkdirSync(out,{recursive:true});
const routes = ['/site.html','/essay.html','/webtoon/'];
const widths = [360,390,768,1440];
const result={base,routes,widths,checks:[],errors:[],unexpectedWrites:[]};
const check = (name,pass,detail='')=> {
 result.checks.push({name,pass:Boolean(pass),detail});
 if(!pass)console.error('FAIL:',name,detail);
};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage();
 page.on('pageerror',err=>result.errors.push(err.message));
 page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))result.unexpectedWrites.push(req.method()+' '+req.url());});
 page.on('response',res=>{
  if(res.url().startsWith(base)&&res.status()>=400)result.errors.push(res.status()+' '+res.url());
 });
 try {
  for(const route of routes){
   for(const width of widths){
    await page.setViewportSize({width,height:width<=768?840:900});
    const resp=await page.goto(base+route,{waitUntil:'load'});
    check(route+' '+width+' responds 200',resp.status()===200);
    check(route+' '+width+' has single H1',await page.locator('main h1').count()===1);
    check(route+' '+width+' has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
    check(route+' '+width+' keeps diagnostic access',await page.locator('a[href="/check/"]').count()>0);
    check(route+' '+width+' keeps privacy access',await page.locator('a[href="/privacy/"]').count()>0);
    check(route+' '+width+' shared business footer renders',await page.locator('#site-footer.company-footer').count()===1);
    if(route==='/webtoon/'){
      check('webtoon '+width+' seven panels',await page.locator('.comic-panels figure img').count()===7);
      const first=page.locator('.comic-panels figure img').first();
      await first.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{const img=document.querySelector('.comic-panels figure img');return img&&img.complete},{timeout:12000});
      check('webtoon '+width+' first illustration decodes',await first.evaluate(img=>img.naturalWidth>0));
    }
    if(width===360||width===1440){
      await page.screenshot({path:path.join(out,route.replace(/\\W/g,'-').replace(/[^a-z0-9-]/gi,'-')+'-'+width+'.png'),fullPage:true,animations:'disabled'});
    }
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/site.html',{waitUntil:'load'});
  await page.locator('.mobile-quick-links summary').click();
  check('mobile directory opens navigation',await page.locator('.mobile-quick-links').getAttribute('open')==='');
  await page.locator('.mobile-quick-links nav a[href="/essay.html"]').click();
  check('mobile site menu opens essay',new URL(page.url()).pathname==='/essay.html');
  await page.locator('.mobile-quick-links summary').click();
  await page.locator('.mobile-quick-links nav a[href="/webtoon/"]').click();
  check('mobile editorial menu opens comic',new URL(page.url()).pathname==='/webtoon/');
  await page.locator('.site-nav a[href="/"]').click();
  check('editorial menu returns home',new URL(page.url()).pathname==='/');
 } catch(err){
  result.errors.push(String(err.stack||err));
 } finally {await browser.close();}
 result.passed=result.checks.filter(x=>x.pass).length;
 result.failed=result.checks.filter(x=>!x.pass).length;
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
 console.log('FULL SITE NAVIGATION:',result.passed,'passed,',result.failed,'failed, runtime errors:',result.errors.length,'writes:',result.unexpectedWrites.length);
 if(result.failed||result.errors.length||result.unexpectedWrites.length)process.exitCode=1;
})().catch(err=>{console.error(err);process.exitCode=1;});
