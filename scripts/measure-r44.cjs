/* CPU/rendering lab, deliberately independent of network speed and CDN caching.
 * node scripts/measure-r44.cjs [optional baseline dist directory]
 */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'docs/r4-spatial/r44/browser');
const variants = [{ name:'after', dir:path.resolve(process.env.R44_LAB_DIST||path.join(root,'dist')) }];
if(process.argv[2])variants.unshift({name:'before',dir:path.resolve(process.argv[2])});

(async()=>{
  const browser=await chromium.launch(process.env.R44_CHROMIUM_PATH?{executablePath:process.env.R44_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']}:{});
  const report={browser:browser.version(),method:'Local dist files fulfilled through Playwright routing, fresh context, no network throttling. Mobile uses 4x CPU slowdown; 9s observation window. File bytes are uncompressed requested resources, not wire transfer. Not field Core Web Vitals or a Lighthouse score.',samples:[]};
  try{
    for(const variant of variants)for(const device of ['desktop','mobile'])for(let run=1;run<=3;run++){
      const context=await browser.newContext({viewport:{width:device==='desktop'?1440:390,height:device==='desktop'?1000:844},locale:'ko-KR'});
      const page=await context.newPage();const requested=new Set(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin!=='https://review.weplace.test')return r.abort();let p=decodeURIComponent(u.pathname);if(p.endsWith('/'))p+='index.html';const file=path.resolve(variant.dir,'.'+p);if(!file.startsWith(variant.dir+path.sep)||!fs.existsSync(file))return r.fulfill({status:404,body:'Not found'});requested.add(file);await r.fulfill({path:file});});
      const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:device==='mobile'?4:1});
      await page.addInitScript(()=>{
        window.__lab={lcp:0,cls:0,longTasks:[],lcpElement:null};
        new PerformanceObserver(list=>{for(const e of list.getEntries()){__lab.lcp=e.startTime;__lab.lcpElement=e.element?.tagName;}}).observe({type:'largest-contentful-paint',buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)__lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())__lab.longTasks.push(e.duration);}).observe({type:'longtask',buffered:true});
      });
      await page.goto('https://review.weplace.test/');await page.waitForTimeout(9000);
      const metrics=await page.evaluate(()=>({...__lab,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,videoCount:document.querySelectorAll('video').length,overflow:document.documentElement.scrollWidth>innerWidth}));
      report.samples.push({variant:variant.name,device,run,...metrics,requestedBytes:[...requested].reduce((n,f)=>n+fs.statSync(f).size,0),requestedResources:requested.size,errors});
      await context.close();
    }
  }finally{await browser.close();}
  const median=a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)];
  report.medians=variants.flatMap(v=>['desktop','mobile'].map(device=>{const a=report.samples.filter(s=>s.variant===v.name&&s.device===device);return{variant:v.name,device,lcpMs:median(a.map(s=>s.lcp)),fcpMs:median(a.map(s=>s.fcp)),cls:median(a.map(s=>s.cls)),longTaskBlockingMs:median(a.map(s=>s.longTasks.reduce((n,t)=>n+Math.max(0,t-50),0))),requestedBytes:median(a.map(s=>s.requestedBytes))};}));
  fs.writeFileSync(path.join(out,'render-lab.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({browser:report.browser,medians:report.medians},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
