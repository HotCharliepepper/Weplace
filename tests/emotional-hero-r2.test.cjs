const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const motion=fs.readFileSync('assets/js/emotional-hero-r2.js','utf8');
const funnel=fs.readFileSync('assets/js/hero-funnel-r2.js','utf8');
function env(query='',opts={}){
 const dom=new JSDOM(html,{url:'https://review.example/'+query,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 w.matchMedia=()=>({matches:!!opts.reduced,addEventListener(){}});
 Object.defineProperty(w.navigator,'hardwareConcurrency',{value:8});
 if(opts.connection)Object.defineProperty(w.navigator,'connection',{value:opts.connection});
 return dom;
}
test('missing GSAP, reduced motion and save-data remain readable with native CTA',()=>{
 for(const [opts,expected] of [[{},'static'],[{reduced:true},'reduced'],[{connection:{saveData:true}},'low-resource']]){
  const dom=env('',opts),w=dom.window;w.eval(motion);
  assert.equal(w.document.querySelector('[data-emotional-hero]').dataset.heroMotion,expected);
  assert.equal(w.document.querySelectorAll('[data-hero-reveal][style]').length,0);
  assert.equal(w.document.getElementById('hero-cta').getAttribute('href'),'#request');
  assert.equal(w.document.querySelectorAll('[data-hero-scene]').length,3);
  dom.window.close();
 }
});
test('campaign labels survive optional ad and return links, unrelated data never propagates',()=>{
 const dom=env('?utm_source=kakao&utm_medium=message&utm_campaign=autumn&code=123456&email=private@example.com&return_to=https://evil.example/');
 dom.window.eval(funnel);
 for(const a of dom.window.document.querySelectorAll('[data-hero-route]')){
  const u=new URL(a.href);assert.equal(u.searchParams.get('utm_source'),'kakao');
  assert.equal(u.searchParams.get('utm_campaign'),'autumn');
  for(const key of ['code','email','return_to'])assert.equal(u.searchParams.has(key),false);
  assert.ok(['https://review.example','https://invite.withweplace.kr'].includes(u.origin));
 }
 dom.window.close();
});
test('malformed campaign values fall back to safe static links',()=>{
 const dom=env('?utm_source=private%40example.com&utm_medium='+('x'.repeat(81)));
 dom.window.eval(funnel);
 const url=new URL(dom.window.document.querySelector('[data-hero-route="invite"]').href);
 assert.equal(url.searchParams.get('utm_source'),'weplace');assert.equal(url.searchParams.get('utm_medium'),'website');
 dom.window.close();
});
test('ad entry has a code-free diagnosis route and same-origin return',()=>{
 const dom=new JSDOM(fs.readFileSync('ad-message.html','utf8'));
 const d=dom.window.document;
 assert.equal(d.querySelector('[data-hero-route="diagnosis"]').getAttribute('href'),'/#request');
 assert.equal(d.querySelector('[data-hero-route="back"]').getAttribute('href'),'/#hero-share');
 assert.equal(d.querySelectorAll('form').length,0);
 dom.window.close();
});
