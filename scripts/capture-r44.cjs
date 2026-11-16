// Exact built bytes, no dev server. Use the live Netlify URL for network verification.
const { chromium }=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/r4-spatial/r44/browser');
async function serve(page,dir){await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!=='https://review.weplace.test')return route.abort();let p=decodeURIComponent(u.pathname);if(p.endsWith('/'))p+='index.html';let f=path.resolve(dir,'.'+p);if(!path.extname(f)&&fs.existsSync(f+'.html'))f+='.html';if(!f.startsWith(dir+path.sep)||!fs.existsSync(f))return route.fulfill({status:404,body:'Not found'});return route.fulfill({path:f});});}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.R44_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']});
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:900},deviceScaleFactor:1,isMobile:width<640,hasTouch:width<640});
  const page=await context.newPage();await serve(page,path.resolve(process.env.R44_CAPTURE_DIST||path.join(root,'dist')));await page.goto('https://review.weplace.test/?scene=2');await page.evaluate(()=>document.fonts.ready);await page.locator(process.env.R44_CAPTURE_DIST?'#sample-photo-image':'#hero-photo').evaluate(el=>el.decode());
  await page.screenshot({path:path.join(out,`${process.env.R44_CAPTURE_LABEL||'after'}-${width}-hero.jpg`),quality:90});
  await page.locator('#question').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${process.env.R44_CAPTURE_LABEL||'after'}-${width}-full.jpg`),quality:80,fullPage:true});
  if(width===1440&&!process.env.R44_CAPTURE_DIST){for(let i=0;i<3;i++){await page.locator(`[data-scene-tab="${i}"]`).click();await page.waitForFunction(()=>!gsap.isTweening('.hero-layer'));await page.locator('.hero-stage').screenshot({path:path.join(out,`storyboard-${i}.jpg`),quality:90});}}
  await context.close();
 }
 await browser.close();
})();
