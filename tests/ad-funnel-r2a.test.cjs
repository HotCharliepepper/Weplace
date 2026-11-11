const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
function setup(query='?ad=dining'){
 const dom=new JSDOM(fs.readFileSync('ad-funnel.html','utf8'),{url:'https://review.example/ad-funnel.html'+query,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,requests=[];
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.fetch=(...args)=>{requests.push(args);return Promise.reject(new Error('unexpected request'));};
 w.eval(fs.readFileSync('assets/js/ad-funnel-entry-r2a.js','utf8'));w.eval(fs.readFileSync('assets/js/ad-funnel-r2a.js','utf8'));
 return {w,d,requests,click:s=>d.querySelector(s).click(),close:()=>w.close()};
}
test('R2-A campaign promise changes image and title; invalid campaigns use the original story',()=>{
 const images=new Set();for(const ad of ['dining','stay','wellness','local']){const c=setup('?ad='+ad);assert.equal(c.d.documentElement.dataset.afEntry,'ad');assert.ok(c.d.querySelector('#ad-question').textContent.endsWith('?'));images.add(c.d.querySelector('#ad-image').src);c.close();}assert.equal(images.size,4);
 const c=setup('?ad=unknown');assert.equal(c.d.documentElement.dataset.afEntry,'home');assert.ok(c.d.querySelector('[data-emotional-hero]'));c.close();
});
test('R2-A selected visual, comparison, diagnosis and meeting share one state even without GSAP',()=>{
 const c=setup();c.click('[data-focus="route"]');assert.equal(c.d.querySelector('[data-scene="route"]').hidden,false);assert.equal(c.d.querySelector('[data-scene="photo"]').hidden,true);assert.match(c.d.querySelector('#report-question').textContent,/차는/);assert.match(c.d.querySelector('#meeting-note').value,/찾아오는 길/);
 c.click('[data-compare="clear"]');assert.equal(c.d.querySelector('[data-compare-layer="clear"]').hidden,false);assert.equal(c.d.querySelector('[data-compare-layer="scattered"]').hidden,true);
 c.click('[data-form-focus="booking"]');assert.equal(c.d.querySelector('[data-focus="booking"]').getAttribute('aria-pressed'),'true');c.click('[data-guests="6"]');c.click('[data-time="19:30"]');assert.match(c.d.querySelector('#booking-status').textContent,/6인 · 19:30/);c.close();
});
test('R2-A rejects blank fields, renders user text safely, resets stale report and never submits',()=>{
 const c=setup(),form=c.d.querySelector('#diagnosis-form'),submit=()=>form.dispatchEvent(new c.w.Event('submit',{bubbles:true,cancelable:true}));submit();assert.equal(c.d.activeElement.id,'store-name');assert.equal(c.d.querySelector('#form-error').hidden,false);
 c.d.querySelector('#store-name').value='<img src=x onerror=alert(1)>';c.d.querySelector('#store-region').value='가상 지역';submit();assert.equal(c.d.querySelector('#form-result').hidden,false);assert.equal(c.d.querySelector('#report-meta img'),null);assert.match(c.d.querySelector('#result-summary').textContent,/실제 매장 분석이나 접수가 진행된 것은 아닙니다/);
 c.d.querySelector('#store-name').value='두 번째 매장';c.d.querySelector('#store-name').dispatchEvent(new c.w.Event('input',{bubbles:true}));assert.equal(c.d.querySelector('#form-result').hidden,true);assert.match(c.d.querySelector('#meeting-note').value,/두 번째 매장/);assert.equal(c.requests.length,0);assert.equal(c.w.localStorage.length,0);assert.equal(c.w.sessionStorage.length,0);assert.doesNotMatch(c.d.body.textContent,/토스|결제|할인|쿠폰/);c.close();
});
test('R2-A carries only safe UTM labels to existing home and leaves review controls hidden',()=>{
 const c=setup('?ad=dining&utm_source=instagram&utm_campaign=r2a&email=private%40example.com&utm_term=%3Cscript%3E');const u=new URL(c.d.querySelector('[data-af-home]').href);assert.equal(u.searchParams.get('utm_source'),'instagram');assert.equal(u.searchParams.get('utm_campaign'),'r2a');assert.equal(u.searchParams.has('email'),false);assert.equal(u.searchParams.has('utm_term'),false);assert.equal(c.d.querySelector('#team-panel').hidden,true);c.close();
});
