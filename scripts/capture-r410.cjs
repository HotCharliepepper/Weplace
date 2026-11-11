/* R4.10 read-only visual capture of automatic cinematic entrance.
   R410_BASE_URL=http://127.0.0.1:4176 node scripts/capture-r410.cjs
   Does not submit requests or deploy changes.
 */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('@playwright/test');
(async()=>{
 const base=process.env.R410_BASE_URL||'http://127.0.0.1:4176';
 const dir=path.resolve(__dirname,'../docs/r4-spatial/r410/browser');
 fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({headless:true});
 const report=[];
 try{
  for(const spec of [{name:'desktop-1440',width:1440,height:1000},{name:'mobile-390',width:390,height:900},{name:'mobile-320',width:320,height:900}]){
   const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},reducedMotion:'no-preference'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/?scene=2',{waitUntil:'load'});
   const hero=await page.locator('#hero-photo').getAttribute('src');
   if(hero!=='/assets/brand/r42/weplace-symbol.svg')throw Error('Stale local dist: rebuild the R4.9 review before capturing. Found '+hero);
   await page.locator('#changes .sample-photo').scrollIntoViewIfNeeded();
   const overlay=page.locator('#r410-stage-veil');
   await overlay.waitFor({state:'visible',timeout:3000});
   await page.screenshot({path:path.join(dir,spec.name+'-dark-scene.png'),animations:'allow'});
   await overlay.waitFor({state:'hidden',timeout:4000});
   await page.locator('#r47-picture-curtain').waitFor({state:'hidden',timeout:4000});
   await page.locator('#changes .change-preview').screenshot({path:path.join(dir,spec.name+'-menu-revealed.png'),animations:'disabled'});
   const state=await page.evaluate(()=>({
    selected:document.querySelector('#change-panel')?.dataset.storeState,
    image:document.querySelector('#sample-photo-image')?.getAttribute('src'),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    heroPhoto:document.querySelector('#hero-photo')?.getAttribute('src'),
    popup:document.querySelector('#r410-stage-veil')?.hidden
   }));
   report.push({...spec,state,errors});
   console.log(spec.name,JSON.stringify({selected:state.selected,overflow:state.overflow,errors:errors.length}));
   await context.close();
  }
  fs.writeFileSync(path.join(dir,'capture-summary.json'),JSON.stringify(report,null,2));
  if(report.some(x=>x.errors.length||x.state.overflow>1||x.state.selected!=='after'||!x.state.popup||!x.state.image?.includes('luwei-peking-duck')))process.exitCode=1;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
