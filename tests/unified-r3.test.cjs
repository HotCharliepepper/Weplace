const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('unified-r3.html','utf8'),src=fs.readFileSync('assets/js/unified-r3.js','utf8');
function setup(query=''){
 const dom=new JSDOM(html,{url:'https://preview.example/unified-r3.html'+query,runScripts:'outside-only'}),w=dom.window;
 w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
 w.eval(src.replace(/^import .*?;\n/,'').split('\nconst root =')[0]);return {w,d:w.document,close:()=>w.close()};
}
test('R3 has seven ordered scenes and a single page controller',()=>{
 const {d,close}=setup();assert.deepEqual([...d.querySelectorAll('main>section')].map(x=>x.id),['top','fast','experience','work','capabilities','evidence','contact']);assert.equal(d.querySelectorAll('h1').length,1);assert.equal(d.querySelectorAll('script[src*="resolute-fast"],script[src*="resolute-depth"]').length,0);assert.equal(d.querySelector('meta[name=robots]').content,'noindex,nofollow');close();
});
test('R3 chart geometry, zero baseline and exact amounts retain the approved source comparison',()=>{
 const {d,close}=setup();assert.equal(d.querySelector('.u-bar-before').getAttribute('height'),'163.4');assert.equal(d.querySelector('.u-bar-after').getAttribute('height'),'183.35');assert.equal((193/172*100-100).toFixed(1),'12.2');const text=d.querySelector('#evidence').textContent;for(const s of ['172,000,000','193,000,000','+21,000,000','분리되지'])assert.ok(text.includes(s));close();
});
test('all six comparison states update actual views and the diagnosis subject without GSAP',()=>{
 const {d,close}=setup();for(const focus of ['photo','route','booking'])for(const mode of ['before','after']){d.querySelector(`[data-focus="${focus}"]`).click();d.querySelector(`button[data-mode="${mode}"]`).click();assert.equal(d.querySelectorAll('[data-view]:not([hidden])').length,1);assert.equal(d.querySelector('[data-view]:not([hidden])').dataset.view,focus+'-'+mode);assert.equal(d.querySelector('#interest').value,focus);}close();
});
test('request includes selected question and action as literal text, not markup or a submission',()=>{
 const {w,d,close}=setup();d.querySelector('[data-focus="booking"]').click();d.querySelector('[data-open-request]').click();d.querySelector('#store').value='<img src=x onerror=alert(1)>';d.querySelector('#region').value='서울';const e=new w.Event('submit',{cancelable:true});d.querySelector('#request-form').dispatchEvent(e);assert.ok(e.defaultPrevented);assert.match(d.querySelector('#request-text').value,/<img src=x onerror=alert\(1\)>/);assert.match(d.querySelector('#request-text').value,/예약 전 무엇을/);assert.match(d.querySelector('#request-text').value,/인원·시간 선택/);assert.equal(d.querySelectorAll('#request-result img').length,0);assert.match(d.querySelector('#request-status').textContent,/전송하거나 접수하지/);close();
});
test('editing fields invalidates old prepared text and changed interest propagates back',()=>{
 const {w,d,close}=setup();d.querySelector('#store').value='모온';d.querySelector('#region').value='서울';d.querySelector('#request-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(d.querySelector('#request-result').hidden,false);d.querySelector('#interest').value='photo';d.querySelector('#interest').dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(d.querySelector('#request-result').hidden,true);assert.equal(d.querySelector('#request-text').value,'');assert.equal(d.querySelector('#stage').dataset.focus,'photo');close();
});
test('ad types are allowlisted and never interpret arbitrary text as HTML',()=>{
 for(const [key,focus] of [['dining','booking'],['stay','route'],['wellness','photo'],['local','route']]){const {d,close}=setup('?ad='+key);assert.equal(d.documentElement.dataset.uEntry,key);assert.equal(d.querySelector('#stage').dataset.focus,focus);close();}
 const {d,close}=setup('?ad=__proto__');assert.equal(d.documentElement.dataset.uEntry,'home');assert.equal(d.querySelector('#ad-context').hidden,true);close();
});
test('only four constrained campaign params transfer to local detail paths',()=>{
 const {d,close}=setup('?ad=stay&utm_source=kakao&utm_medium=message&utm_campaign=review&utm_content=stay&store=private&phone=secret&utm_term=private');const href=d.querySelector('a[href^="/industries/"]').href;assert.match(href,/utm_source=kakao/);assert.ok(!/phone|store|utm_term/.test(href));assert.equal(d.querySelector('[data-open-request]').href,'https://pf.kakao.com/_mxbexhX');close();
 const x=setup('?utm_content=%3Cscript%3E');assert.ok(!x.d.querySelector('a[href^="/industries/"]').href.includes('utm_content'));x.close();
});
test('customer assets exclude unapproved pricing, payments, analytics and persistence',()=>{
 const customer=html+src;assert.ok(!/토스|tosspayments|30~50|5~10|dataLayer|gtag\(|localStorage|sessionStorage|fetch\(|sendBeacon/.test(customer));assert.ok(!html.includes('0원 진단'));assert.ok(src.includes('IntersectionObserver'));assert.ok(!src.includes('entryTimer'));assert.ok(!/\bpin\s*:|\bsnap\s*:/.test(src));
});
