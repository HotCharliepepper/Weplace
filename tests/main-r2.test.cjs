// DOM state, privacy and keyboard contracts. Rendered layout is separately browser-reviewed.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8'),source=fs.readFileSync('assets/js/main-landing-r2.js','utf8');
function setup({run=true,reduced=true,throwAnimate=false}={}){
 const dom=new JSDOM(html,{url:'https://preview.example.invalid/?phone=DO_NOT_FORWARD',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document,requests=[],writes=[],metrics=[],copied=[],animations=[];
 const media={matches:reduced,addEventListener:(_,fn)=>{media.change=fn}};
 w.matchMedia=q=>q.includes('reduced')?media:{matches:false,addEventListener(){}};
 w.fetch=(...a)=>{requests.push(a);throw Error('Unexpected network')};w.Storage.prototype.setItem=(...a)=>writes.push(a);
 w.WeplaceMetrics={emit:(...a)=>metrics.push(a)};
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>copied.push(t)},configurable:true});
 w.HTMLElement.prototype.animate=function(){if(throwAnimate)throw Error('Animation unavailable');let finish;const a={finished:new Promise(r=>finish=r),finish(){finish()},cancel(){finish()}};animations.push(a);return a;};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 if(run)w.eval(source);
 return {dom,w,d,requests,writes,metrics,copied,animations,media,close:()=>w.close()};
}
const click=(c,s)=>c.d.querySelector(s).click();
const submit=c=>{const e=new c.w.Event('submit',{bubbles:true,cancelable:true});c.d.querySelector('form').dispatchEvent(e);assert.equal(e.defaultPrevented,true)};
test('R2 retains truthful evidence, all legacy anchors, real routes, footer gate and metadata',()=>{
 const c=setup({run:false});try{
  for(const id of ['top','journey','working-industries','experience','how','field-notes','audit','faq','contact'])assert.ok(c.d.getElementById(id),id);
  for(const route of ['/experience/','/check/','/field-notes/','/flow-preview/','/my-store/','/client','/team','/enterprise/','/process/','/privacy/'])assert.ok(c.d.querySelector(`a[href="${route}"]`),route);
  assert.equal(c.d.querySelectorAll('h1').length,1);assert.equal(c.d.querySelector('link[rel=canonical]').href,'https://withweplace.kr/');
  assert.match(html,/172|1\.72/);assert.match(html,/1\.93/);assert.match(html,/877/);assert.match(html,/2,350/);
  assert.doesNotMatch(html,/15%|3주 만에|\/team\/crm/);assert.match(html,/WEPLACE_COMPANY_FOOTER/);
  assert.equal(c.d.querySelector('#request-fields').disabled,true);assert.equal(c.d.querySelectorAll('input[name],textarea[name]').length,0);
 }finally{c.close()}
});
test('three tab groups keep one selected control, panel label and keyboard focus',()=>{
 const c=setup();try{for(const group of ['[data-change]','[data-industry]','[data-flow]']){
  const tabs=[...c.d.querySelectorAll(group)],first=tabs[0];first.click();
  first.dispatchEvent(new c.w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
  assert.equal(tabs.filter(t=>t.getAttribute('aria-selected')==='true').length,1);assert.equal(c.d.activeElement,tabs.at(-1));
  assert.equal(c.d.getElementById(first.getAttribute('aria-controls')).getAttribute('aria-labelledby'),tabs.at(-1).id);
  tabs.at(-1).dispatchEvent(new c.w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));assert.equal(c.d.activeElement,first);
 }}finally{c.close()}
});
test('case filters expose only the selected category; dialog closes back to its opener',()=>{
 const c=setup();try{click(c,'[data-filter=wellness]');assert.equal(c.d.querySelector('[data-category=dining]').hidden,true);assert.equal(c.d.querySelector('[data-category=wellness]').hidden,false);
  click(c,'[data-case=b]');assert.equal(c.d.querySelector('dialog').open,true);assert.match(c.d.querySelector('#dialog-content').textContent,/2,350/);
  click(c,'#close-dialog');assert.equal(c.d.activeElement,c.d.querySelector('[data-case=b]'));
 }finally{c.close()}
});
test('manual request never transmits, persists or claims receipt; changes invalidate old text',async()=>{
 const c=setup();try{
  c.d.querySelector('#shop-url').value='https://example.invalid/QA_ONLY';submit(c);
  assert.match(c.d.querySelector('#form-status').textContent,/아직 전송되지/);assert.equal(c.d.querySelector('#request-result').hidden,false);
  click(c,'#copy-message');await new Promise(setImmediate);assert.match(c.copied[0],/QA_ONLY/);assert.doesNotMatch(c.copied[0],/DO_NOT_FORWARD/);
  c.d.querySelector('#shop-url').dispatchEvent(new c.w.Event('input'));assert.equal(c.d.querySelector('#request-result').hidden,true);
  click(c,'#no-link');c.d.querySelector('#shop-name').value='가상 검수 매장';c.d.querySelector('#shop-region').value='가상 지역';submit(c);
  assert.match(c.d.querySelector('#prepared-message').value,/가상 검수 매장/);assert.doesNotMatch(c.d.querySelector('#prepared-message').value,/QA_ONLY/);
  assert.deepEqual(c.requests,[]);assert.deepEqual(c.writes,[]);assert.deepEqual(c.metrics,[]);
 }finally{c.close()}
});
test('invalid links and blank alternative fields do not generate a request',()=>{
 const c=setup();try{
  c.d.querySelector('#shop-url').value='javascript:alert(1)';submit(c);assert.equal(c.d.querySelector('#request-result').hidden,true);
  click(c,'#no-link');c.d.querySelector('#shop-name').value='   ';submit(c);assert.equal(c.d.querySelector('#request-result').hidden,true);
 }finally{c.close()}
});
test('clipboard rejection leaves selectable text and no false copied or received success',async()=>{
 const c=setup();try{
  Object.defineProperty(c.w.navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}});c.d.querySelector('#shop-url').value='https://example.invalid';submit(c);click(c,'#copy-message');await new Promise(setImmediate);
  assert.match(c.d.querySelector('#form-status').textContent,/직접 복사/);assert.equal(c.d.activeElement.id,'prepared-message');assert.deepEqual(c.requests,[]);
 }finally{c.close()}
});
test('optional animation failure does not disable controls; reduced motion creates no animation',()=>{
 for(const opts of [{reduced:true},{reduced:false,throwAnimate:true}]){const c=setup(opts);try{assert.equal(c.d.querySelector('#request-fields').disabled,false);click(c,'[data-change=before]');assert.ok(c.d.querySelector('#change-panel.before'));assert.equal(c.animations.length,0)}finally{c.close()}}
});
test('Escape closes mobile navigation and returns focus to the menu trigger',()=>{
 const c=setup();try{c.d.querySelector('.mobile-menu').open=true;c.d.dispatchEvent(new c.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(c.d.querySelector('.mobile-menu').open,false);assert.equal(c.d.activeElement,c.d.querySelector('.mobile-menu summary'))}finally{c.close()}
});

test('industry detail calls to action retain the chosen sector at the preserved tool',()=>{
 for(const [file,sector] of [['restaurant/index.html','dining'],['dining.html','dining'],['cafe/index.html','cafe'],['beauty/index.html','beauty'],['esthetic/index.html','beauty'],['stay.html','stay'],['hospitality.html','stay']]){
  const d=new JSDOM(fs.readFileSync('industries/'+file,'utf8')).window.document;assert.ok(d.querySelector('a[href="/experience/?industry='+sector+'#experience"]'),file);assert.equal(d.querySelector('a[href^="/?industry="]'),null);
 }
});
