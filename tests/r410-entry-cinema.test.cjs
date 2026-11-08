'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const r2=fs.readFileSync('assets/js/main-landing-r2.js','utf8');
const r48=fs.readFileSync('assets/js/main-landing-r48.js','utf8');
const r410=fs.readFileSync('assets/js/main-landing-r410.js','utf8');
const css=fs.readFileSync('assets/css/main-landing-r49.css','utf8');
const pause=ms=>new Promise(r=>setTimeout(r,ms));

function setup({reduced=false,saveData=false}={}){
 const dom=new JSDOM(html,{url:'https://preview.example.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 const calls={network:[],storage:[],observers:[]};
 w.matchMedia=query=>({matches:query.includes('prefers-reduced-motion')&&reduced,addEventListener(){}});
 Object.defineProperty(w.navigator,'connection',{configurable:true,value:{saveData,effectiveType:'4g',addEventListener(){}}});
 w.fetch=(...args)=>{calls.network.push(args);throw Error('Unexpected network call')};
 w.Storage.prototype.setItem=(...args)=>calls.storage.push(args);
 Object.defineProperty(d.getElementById('sample-photo-image'),'complete',{configurable:true,get:()=>true});
 Object.defineProperty(d.getElementById('sample-photo-image'),'naturalWidth',{configurable:true,get:()=>640});
 d.getElementById('sample-photo-image').decode=()=>Promise.resolve();
 w.IntersectionObserver=class {
  constructor(callback,config){this.callback=callback;this.config=config;this.disconnected=false;calls.observers.push(this);}
  observe(node){this.target=node;}
  disconnect(){this.disconnected=true;}
  fire(ratio){this.callback([{target:this.target,isIntersecting:ratio>0,intersectionRatio:ratio}],this);}
 };
 w.eval(r2);
 w.eval(r48);
 w.eval(r410);
 return {w,d,calls,close(){w.dispatchEvent(new w.Event('pagehide'));dom.window.close();}};
}

test('initial exterior and honest cinematic overlay stay accessible before JS',()=>{
 const d=new JSDOM(html).window.document;
 assert.equal(d.getElementById('change-panel').dataset.storeState,'before');
 assert.match(d.getElementById('sample-photo-image').src,/luwei-before-capture\.webp$/);
 assert.equal(d.getElementById('r410-stage-veil').hidden,true);
 assert.equal(d.getElementById('r410-stage-veil').getAttribute('aria-hidden'),'true');
 assert.equal(d.querySelectorAll('script[src$="main-landing-r410.js"]').length,1);
 assert.match(css,/\.r410-stage-veil\[hidden\]/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('scroll arrival: one auto exterior -> dark -> menu and no scroll lock',async()=>{
 const c=setup();
 try{
  const observer=c.calls.observers.find(x=>x.target?.classList.contains('sample-photo'));
  assert.ok(observer,'the scroll-entry observer must own the source photo stage');
  assert.equal(observer.target.classList.contains('sample-photo'),true);
  observer.fire(.72);
  assert.equal(observer.disconnected,true);
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
  await pause(180);
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'after');
  assert.equal(c.d.getElementById('r410-stage-veil').hidden,false);
  assert.equal(c.d.getElementById('r47-picture-curtain').style.getPropertyValue('--r48-beat'),'680ms');
  await pause(1100);
  assert.equal(c.d.getElementById('r410-stage-veil').hidden,true);
  assert.equal(c.d.getElementById('r47-picture-curtain').hidden,true);
  c.d.getElementById('change-before').click();
  await pause(345);
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
  observer.fire(.95);
  await pause(210);
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before','one-shot entry cannot replay');
  assert.deepEqual(c.calls.network,[]);
  assert.deepEqual(c.calls.storage,[]);
  assert.doesNotMatch(r410,/preventDefault\(|scrollTo\(|scrollIntoView\(|overflow\s*=|window\.location/);
 } finally{c.close();}
});
test('manual pointer interaction cancels pending scroll-entry story',async()=>{
 const c=setup();
 try{
  const observer=c.calls.observers.find(x=>x.target?.classList.contains('sample-photo'));
  assert.ok(observer);
  observer.fire(.75);
  c.d.getElementById('change-after').dispatchEvent(new c.w.Event('pointerdown',{bubbles:true}));
  await pause(225);
  assert.equal(c.d.getElementById('r410-stage-veil').hidden,true);
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
  c.d.getElementById('change-after').click();
  assert.equal(c.d.getElementById('change-panel').dataset.storeState,'after');
 }finally{c.close();}
});
test('reduced motion and Save Data never schedule automatic image switching',async()=>{
 for(const config of [{reduced:true},{saveData:true}]){
  const c=setup(config);
  try{
   assert.equal(c.calls.observers.some(x=>x.target?.classList.contains('sample-photo')),false);
   await pause(180);
   assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
   assert.equal(c.d.getElementById('r410-stage-veil').hidden,true);
  }finally{c.close();}
 }
});
