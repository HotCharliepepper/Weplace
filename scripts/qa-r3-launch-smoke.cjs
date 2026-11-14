// Review-only smoke: optional first-look photos must not cause 404 network requests.
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const output=path.resolve('test-results/unified-r3/preflight-firstlook.json');
const base='http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const requested=[],networkErrors=[],pageErrors=[];
 page.on('request',req=>{if(req.url().includes('/assets/first-look/photos/'))requested.push(req.url())});
 page.on('response',res=>{if(res.status()>=400 && res.url().includes('first-look'))networkErrors.push(res.status()+' '+res.url())});
 page.on('pageerror',err=>pageErrors.push(err.message));
 const checks=[];
 function expect(name,ok){checks.push({name,pass:!!ok});if(!ok)console.error('FAILED',name);}
 try{
  await page.goto(base+'/',{waitUntil:'networkidle'});
  const active=page.locator('#wpfl-experience [data-wpfl-app]');
  expect('First Look app present',await active.count()===1 && !(await active.evaluate(e=>e.hidden)));
  const buttons=page.locator('#wpfl-experience [data-wpfl-choice]');
  expect('two choice buttons',await buttons.count()===2);
  for(let index=0;index<4;index++){
    await buttons.first().click();
    const next=page.locator('#wpfl-experience [data-wpfl-next]');
    await next.click();
  }
  expect('four-step result shown',await page.locator('#wpfl-experience [data-wpfl-result]').isVisible());
  expect('no optional photo network request',requested.length===0);
  expect('no first-look network error',networkErrors.length===0);
  expect('no JS page errors',pageErrors.length===0);
  expect('no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const report={checkedAt:new Date().toISOString(),passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,checks,requested,networkErrors,pageErrors};
  fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));
  console.log('R3 prelaunch First Look '+report.passed+'/'+checks.length+' passed');
  if(report.failed)process.exitCode=1;
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});