'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const r2=fs.readFileSync('assets/js/main-landing-r2.js','utf8');
const r47=fs.readFileSync('assets/js/main-landing-r47.js','utf8');
const css=fs.readFileSync('assets/css/main-landing-r47.css','utf8');

test('new hero keeps atmosphere imagery distinct from actual evidence',()=>{
 assert.match(html,/data-emotional-hero/);
 assert.match(html,/분위기 참고 이미지/);
 assert.doesNotMatch(html,/class="r47-trajectory"/);
 assert.match(html,/main-landing-r45\.js/);
});
test('first arrival presents the actual exterior photograph and an accessible switch',()=>{
 const d=new JSDOM(html).window.document;
 const panel=d.getElementById('change-panel');
 assert.equal(panel.dataset.storeState,'before');
 assert.equal(d.getElementById('change-before').getAttribute('aria-selected'),'true');
 assert.equal(d.getElementById('change-after').getAttribute('aria-selected'),'false');
 assert.match(d.getElementById('sample-photo-image').getAttribute('src'),/luwei-before-capture\.webp$/);
 assert.match(d.getElementById('sample-photo-image').getAttribute('alt'),/외관/);
 assert.ok(d.getElementById('r47-photo-switch').hidden,'only present a control when JS is available');
 assert.ok(d.querySelector('details.static-comparison'),'no JS readers retain the comparison in text');
});
test('manual Before -> After -> Before uses original R2 tabs and creates no network traffic',async()=>{
 const dom=new JSDOM(html,{url:'https://preview.example.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 const requests=[];
 w.matchMedia=()=>({matches:true,addEventListener(){}});
 w.fetch=(...args)=>{requests.push(args);throw Error('Unexpected network request');};
 try{
   w.eval(r2);
   w.eval(r47);
   const btn=d.getElementById('r47-photo-switch');
   const panel=d.getElementById('change-panel');
   assert.equal(btn.hidden,false);
   btn.click();
   await new Promise(resolve=>setImmediate(resolve));
   assert.equal(panel.dataset.storeState,'after');
   assert.equal(d.getElementById('change-after').getAttribute('aria-selected'),'true');
   assert.match(d.getElementById('sample-photo-image').src,/luwei-peking-duck-1254\.webp$/);
   assert.equal(d.getElementById('r47-picture-curtain').hidden,true,'reduced motion must skip blackout');
   btn.click();
   await new Promise(resolve=>setImmediate(resolve));
   assert.equal(panel.dataset.storeState,'before');
   assert.match(d.getElementById('sample-photo-image').src,/luwei-before-capture\.webp$/);
   assert.deepEqual(requests,[]);
 }finally{dom.window.close();}
});
test('motion staging is manual, nonblocking, and exposes reduced-motion support',()=>{
 assert.match(r47,/tab\.addEventListener\('click'/);
 assert.match(r47,/switchButton\.addEventListener\('click'/);
 assert.match(r47,/prefers-reduced-motion: reduce/);
 assert.match(r47,/connection\?\.saveData/);
 assert.doesNotMatch(r47,/scrollIntoView|window\.scrollTo|location\.href|XMLHttpRequest|fetch\(/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.r47-picture-curtain\[hidden\]\{display:none!important\}/);
});
