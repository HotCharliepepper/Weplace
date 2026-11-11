/* Chromium integration QA; controlled media/audio failures are test fixtures only. */
const {chromium} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const out = path.resolve('test-results/fast-motion-a');
const origin = process.env.FAST_A_ORIGIN || 'http://127.0.0.1:4173';
fs.mkdirSync(out,{recursive:true});
const checks=[]; const errors=[],writes=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});if(!pass)console.error('FAIL',name,detail||'');};
const sleep=(p,ms=300)=>p.waitForTimeout(ms);
async function ready(p){await p.goto(origin+'/resolute.html');await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.documentElement.dataset.fastSound==='off');await sleep(p,1000);}
function audioAudit(){
  const Original=window.AudioContext;const report=window.__soundQA={created:0,starts:0,stops:0,contexts:[]};
  if(!Original)return;
  window.AudioContext=new Proxy(Original,{construct(C,args){const ctx=new C(...args);report.created++;report.contexts.push(ctx);
    const create=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const o=create();const start=o.start.bind(o),stop=o.stop.bind(o);o.start=(...a)=>{report.starts++;return start(...a)};o.stop=(...a)=>{report.stops++;return stop(...a)};return o;};return ctx;}});
}
function hiddenFixture(){window.__qaHidden=false;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__qaHidden});}
function blockedAudio(mode){
  const qa=window.__blockedQA={created:0,closed:0,starts:0};
  if(mode==='missing'){window.AudioContext=undefined;window.webkitAudioContext=undefined;return;}
  window.AudioContext=class {
    constructor(){qa.created++;this.state='suspended';if(mode==='constructor')throw new DOMException('blocked','NotAllowedError');}
    resume(){if(mode==='reject')return Promise.reject(new DOMException('blocked','NotAllowedError'));if(mode==='resolved-suspended')return Promise.resolve();return new Promise(resolve=>{window.__resolveAudio=()=>{this.state='running';resolve();}});}
    close(){qa.closed++;this.state='closed';return Promise.resolve();}
    createOscillator(){qa.starts++;throw new Error('Blocked audio must never schedule a source');}
  };
}
async function frames(p){return p.evaluate(()=>new Promise(resolve=>{
  const values=[];const t=performance.now();function tick(now){const el=document.querySelector('.rf-fast-body'),near=document.querySelector('.rf-trail-left.near');const m=new DOMMatrix(getComputedStyle(el).transform);values.push({ms:now-t,x:m.m41,scale:m.a,trail:Number(getComputedStyle(near).opacity),trailX:new DOMMatrix(getComputedStyle(near).transform).m41,phase:document.querySelector('.rf-fast').dataset.fastState});if(now-t<1100)requestAnimationFrame(tick);else resolve(values);}requestAnimationFrame(tick);
}));}
function writeWav(file,samples,rate){const data=Buffer.alloc(44+samples.length*2);data.write('RIFF',0);data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(rate,24);data.writeUInt32LE(rate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(samples.length*2,40);samples.forEach((s,i)=>data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,s))*32767),44+i*2));fs.writeFileSync(file,data);}
async function perf(browser){
 const samples=[];
 for(const width of [390,1440])for(let run=0;run<3;run++)for(const variant of (run%2?['A','baseline']:['baseline','A'])){
  const c=await browser.newContext({viewport:{width,height:width===390?844:1000}});const p=await c.newPage();const cdp=await c.newCDPSession(p);
  await cdp.send('Performance.enable');await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:width===390?4:1});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1250000,uploadThroughput:625000});
  await p.addInitScript(()=>{
   window.__perf={lcp:0,cls:0,longTasks:0,longTaskMs:0};
   new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__perf.lcp=e.startTime)).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__perf.cls+=e.value;})).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>list.getEntries().forEach(e=>{window.__perf.longTasks++;window.__perf.longTaskMs+=e.duration;})).observe({type:'longtask',buffered:true});
  });
  const res=await p.goto(origin+(variant==='A'?'/resolute.html':'/review/fast-a-baseline.html'));
  if(!res.ok())throw new Error('Performance baseline missing');
  await p.evaluate(()=>document.fonts.ready);await sleep(p,1300);
  const data=await p.evaluate(()=>({...window.__perf,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.encodedBodySize,duration:r.duration}))}));
  const metrics=(await cdp.send('Performance.getMetrics')).metrics;const metric=n=>metrics.find(m=>m.name===n)?.value;
  samples.push({width,run,variant,...data,scriptMs:metric('ScriptDuration')*1000,taskMs:metric('TaskDuration')*1000,heapBytes:metric('JSHeapUsedSize')});await c.close();
 }
 const med=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)];const summary=[];
 for(const width of [390,1440])for(const variant of ['baseline','A']){const s=samples.filter(x=>x.width===width&&x.variant===variant);summary.push({width,variant,...Object.fromEntries(['fcp','lcp','cls','scriptMs','taskMs','heapBytes','longTasks','longTaskMs'].map(k=>[k,med(s.map(x=>x[k]))]))});}
 return {conditions:'Chromium, cold cache, 80ms latency / 10Mbps download, mobile 4x CPU / desktop 1x; 3 alternating pairs per viewport; CI lab results, not real-user Web Vitals.',summary,samples};
}
(async()=>{
const browser=await chromium.launch({headless:true});let performanceResult=null;
try{
 const c=await browser.newContext({permissions:['clipboard-read','clipboard-write']});await c.addInitScript(audioAudit);await c.addInitScript(hiddenFixture);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push({method:r.method(),url:r.url()});});
 for(const width of [360,390,430,768,1280,1440]){
  await p.setViewportSize({width,height:width<=768?844:1000});await ready(p);
  check(`${width} silent entry`,await p.evaluate(()=>__soundQA.created===0&&__soundQA.starts===0&&document.querySelector('#fast-sound').getAttribute('aria-pressed')==='false'));
  check(`${width} one semantic title`,await p.getByRole('heading',{level:1,name:'RESOLUTE IT FAST.',exact:true}).count()===1);
  check(`${width} decorative text hidden`,await p.locator('.rf-fast-depth[aria-hidden=true],.rf-fast .rf-trail[aria-hidden=true]').count()===4);
  check(`${width} one baseline and height`,await p.locator('.rf-fast-face>span').evaluateAll(es=>{const r=es.map(e=>e.getBoundingClientRect());return r.every(x=>Math.abs(x.top-r[0].top)<.1&&Math.abs(x.height-r[0].height)<.1)}));
  check(`${width} stroke taper`,await p.locator('.rf-fast-face>span').evaluateAll(es=>{const w=es.map(e=>parseFloat(getComputedStyle(e).webkitTextStrokeWidth));return w.every((x,i)=>i===0||x<w[i-1]);}));
  check(`${width} layout and controls`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll('.rf-fast-tools button')].every(b=>b.getBoundingClientRect().height>=44)));
  check(`${width} no blur`,await p.locator('.rf-fast .rf-trail').evaluateAll(es=>es.every(e=>getComputedStyle(e).filter==='none')));
  await p.screenshot({path:path.join(out,`WEPLACE_FAST_A_${width}_Hero.png`)});
  await p.locator('#fast-replay').click();const motion=await frames(p);fs.writeFileSync(path.join(out,`motion-${width}.json`),JSON.stringify(motion,null,2));
  check(`${width} accelerates right`,motion.some(f=>f.x>(width<=800?3:7)),motion.reduce((m,f)=>Math.max(m,f.x),0));
  check(`${width} trail remains left`,motion.some(f=>f.trail>.08&&f.trailX<0));
  check(`${width} settles and releases layer hints`,await p.evaluate(()=>document.querySelector('.rf-fast').dataset.fastState==='settled'&&getComputedStyle(document.querySelector('.rf-fast-body')).transform==='none'&&!document.querySelector('.rf-fast').classList.contains('is-fast-playing')));
  check(`${width} replay stays silent`,await p.evaluate(()=>__soundQA.created===0));
 }
 await p.setViewportSize({width:1440,height:1000});await ready(p);
 await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const a11y=await p.evaluate(()=>axe.run('#top',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 fs.writeFileSync(path.join(out,'axe-hero.json'),JSON.stringify({violations:a11y.violations,incomplete:a11y.incomplete},null,2));check('hero automated accessibility',a11y.violations.length===0,a11y.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
 await p.locator('#fast-sound').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>document.documentElement.dataset.fastSound==='on');await sleep(p,350);
 check('sound opt-in schedules only two tones',await p.evaluate(()=>__soundQA.created===1&&__soundQA.starts===2));
 check('audio processing suspends while idle',await p.evaluate(()=>__soundQA.contexts[0].state==='suspended'));
 await p.locator('#fast-replay').click();await sleep(p,500);check('explicit replay with sound',await p.evaluate(()=>__soundQA.starts===4));
 await p.locator('#fast-replay').click();await p.locator('#fast-replay').click();await sleep(p,500);
 check('rapid replay leaves no active output',await p.evaluate(()=>__soundQA.contexts[0].state==='suspended'));
 await p.locator('#fast-sound').click();check('sound off closes context',await p.evaluate(()=>document.querySelector('#fast-sound').getAttribute('aria-pressed')==='false'&&__soundQA.contexts[0].state==='closed'));
 const starts=await p.evaluate(()=>__soundQA.starts);await p.locator('#fast-replay').click();await sleep(p,500);check('off replay is silent',await p.evaluate(n=>__soundQA.starts===n,starts));
 await p.locator('#fast-sound').click();await p.waitForFunction(()=>document.documentElement.dataset.fastSound==='on');await p.evaluate(()=>{__qaHidden=true;document.dispatchEvent(new Event('visibilitychange'));});
 check('background fixture stops audio and motion',await p.evaluate(()=>document.documentElement.dataset.fastSound==='off'&&__soundQA.contexts.at(-1).state==='closed'&&document.querySelector('.rf-fast').dataset.fastState==='settled'));
 const hiddenStarts=await p.evaluate(()=>__soundQA.starts);await p.locator('#fast-sound').click();check('hidden document cannot start audio',await p.evaluate(n=>__soundQA.starts===n,hiddenStarts));await p.evaluate(()=>{__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await sleep(p,300);check('return remains silent',await p.evaluate(()=>document.documentElement.dataset.fastSound==='off'));
 await p.locator('#fast-replay').click();await p.emulateMedia({reducedMotion:'reduce'});await sleep(p,60);check('live reduced cancels FAST',await p.evaluate(()=>document.querySelector('.rf-fast').dataset.fastState==='settled'&&getComputedStyle(document.querySelector('.rf-fast-body')).transform==='none'));
 check('reduced replay disabled',await p.locator('#fast-replay').isDisabled());
 for(const width of [390,1440]){await p.setViewportSize({width,height:width===390?844:1000});await ready(p);check(`${width} reduced entry static`,await p.evaluate(()=>document.querySelector('.rf-fast').dataset.fastState==='settled'&&__soundQA.created===0&&ScrollTrigger.getAll().length===0));await p.locator('button[data-mode="after"]').click();await p.screenshot({path:path.join(out,`WEPLACE_FAST_A_${width}_Full_Reduced.png`),fullPage:true});}
 await p.emulateMedia({reducedMotion:'no-preference'});await ready(p);await p.locator('#motion-toggle').click();check('manual off cancels FAST',await p.locator('#fast-replay').isDisabled());await p.locator('#motion-toggle').click();check('manual on restores replay without autoplay',await p.locator('#fast-replay').isEnabled()&&await p.locator('.rf-fast').getAttribute('data-fast-state')==='settled');
 await p.route('**/assets/vendor/gsap/**',r=>r.abort());await ready(p);check('missing GSAP static usable',await p.locator('#fast-replay').isDisabled()&&await p.locator('h1').isVisible());await p.locator('button[data-mode="after"]').click();check('missing GSAP comparison works',await p.locator('[data-view="route-after"]').isVisible());await p.unroute('**/assets/vendor/gsap/**');
 await p.route('**/*.woff*',r=>r.abort());await ready(p);check('missing font remains readable and contained',await p.locator('h1').isVisible()&&await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.unroute('**/*.woff*');
 check('no JS exceptions',errors.length===0,errors);check('no UI writes',writes.length===0,writes);await c.close();
 for(const mode of ['missing','constructor','reject','resolved-suspended','timeout','cancel-late']){
  const c=await browser.newContext();await c.addInitScript(blockedAudio,mode);const p=await c.newPage();await ready(p);await p.locator('#fast-sound').click();
  if(mode==='cancel-late'){await p.locator('#fast-sound').click();await p.evaluate(()=>window.__resolveAudio?.());}
  await p.waitForFunction(()=>document.documentElement.dataset.fastSound==='off');
  check(`audio ${mode}: mute fallback`,await p.locator('#fast-sound').getAttribute('aria-pressed')==='false'&&await p.evaluate(()=>__blockedQA.starts===0));
  check(`audio ${mode}: honest status`,!(await p.locator('#fast-status').textContent()).includes('사운드 켜짐'));
  await p.locator('button[data-mode="after"]').click();check(`audio ${mode}: comparison unaffected`,await p.locator('[data-view="route-after"]').isVisible());await c.close();
 }
 for(const kind of ['saveData','2g']){const c=await browser.newContext();await c.addInitScript(k=>Object.defineProperty(navigator,'connection',{value:{saveData:k==='saveData',effectiveType:k==='2g'?'2g':'4g',addEventListener(){}}}),kind);const p=await c.newPage();await ready(p);check(`${kind} static fallback`,await p.locator('#fast-replay').isDisabled()&&await p.locator('h1').isVisible());await c.close();}
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();await fallback.goto(origin+'/resolute.html');check('JS disabled title and request fallback',await fallback.locator('h1').isVisible()&&await fallback.locator('[data-open-request]').getAttribute('href')==='/#request');await nojs.close();
 const audioContext=await browser.newContext();const ap=await audioContext.newPage();await ap.goto(origin+'/resolute.html');const rendered=await ap.evaluate(async()=>{const {createFastSignature}=await import('/assets/js/resolute-sonic-a.js');const c=new OfflineAudioContext(1,12000,48000);createFastSignature(c);const b=await c.startRendering();return Array.from(b.getChannelData(0));});const peak=Math.max(...rendered.map(Math.abs)),last=rendered.findLastIndex(v=>Math.abs(v)>1e-6)/48000;check('rendered sound stays short and quiet',peak<.05&&last<=.19&&last>=.12,{peak,duration:last});writeWav(path.join(out,'WEPLACE_FAST_A_Sonic_QA.wav'),rendered,48000);await audioContext.close();
 performanceResult=await perf(browser);fs.writeFileSync(path.join(out,'performance.json'),JSON.stringify(performanceResult,null,2));
 check('A lab CLS within 0.1',performanceResult.samples.filter(s=>s.variant==='A').every(s=>s.cls<=.1));
 const assets=['assets/css/resolute-fast-motion-a.css','assets/js/resolute-fast-motion-a.js','assets/js/resolute-sonic-a.js','assets/resolute-fast-motion-a/fonts/WeplaceMotionA.woff2'].map(file=>{const b=fs.readFileSync(file);return {file,bytes:b.length,gzipBytes:zlib.gzipSync(b).length};});fs.writeFileSync(path.join(out,'asset-cost.json'),JSON.stringify(assets,null,2));
}catch(e){check('unhandled QA error',false,e.stack);}
finally{await browser.close();const r={passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,checks,completedAt:new Date().toISOString(),scope:'Chromium viewport/media emulation. Audio blocking and visibility are explicit fixtures. Offline audio rendering measures the signal; actual speakers, Safari and Kakao in-app are unverified.'};fs.writeFileSync(path.join(out,'qa-results.json'),JSON.stringify(r,null,2));console.log(JSON.stringify({passed:r.passed,failed:r.failed}));if(performanceResult)console.log(JSON.stringify(performanceResult.summary));if(r.failed)process.exitCode=1;}
})();
