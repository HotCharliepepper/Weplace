const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('unified-r3-hero-polish.html','utf8');
const old=fs.readFileSync('unified-r3-hero-lab.html','utf8');
const css=fs.readFileSync('assets/css/hero-evidence-polish-r2.css','utf8');
const js=fs.readFileSync('assets/js/hero-evidence-polish-r2.js','utf8');
const doc=new JSDOM(html,{url:'https://review.example/unified-r3-hero-polish.html',runScripts:'outside-only'}).window.document;

test('standalone route preserves all original sections and their semantics',()=>{
 assert.ok(!old.includes('he-polish'));
 assert.deepEqual([...doc.querySelectorAll('main>section')].map(x=>x.id),
  ['top','fast','hero-evidence','experience','work','capabilities','evidence','contact']);
 assert.equal(doc.querySelectorAll('h1').length,1);
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/hero-evidence-polish-r2\.css/);
 assert.match(html,/hero-evidence-polish-r2\.js/);
 for(const id of ['chart-heading','hero-title','experience-title','work-title','capabilities-title','evidence-title','contact-title','request-dialog']){
   assert.ok(doc.querySelector('#'+id),id);
 }
});
test('evidence remains exact and independent',()=>{
 assert.match(doc.querySelector('#hero-evidence').textContent,/\+168/);
 assert.match(doc.querySelector('#hero-evidence').textContent,/877회/);
 assert.match(doc.querySelector('#hero-evidence').textContent,/2,350회/);
 assert.equal(doc.querySelectorAll('.he-line').length,4);
 const text=doc.querySelector('.he-raw-values').textContent;
 for(const number of ['2023','1.60','2025','1.70','2026','1.93'])assert.ok(text.includes(number));
});
test('native photo sharpness replaces zoomed low-resolution presentation',()=>{
 assert.match(css,/\.he-photo-stage img\.he-image-before\s*\{\s*transform:none!important/);
 assert.match(css,/\.he-photo-stage img\.he-image-after\s*\{\s*transform:none!important/);
 assert.match(html,/luwei-before-capture\.webp/);
 assert.match(html,/luwei-peking-duck-1254\.webp/);
 const button=doc.querySelector('[data-photo-peek]');
 assert.ok(button);assert.equal(button.disabled,true);
 assert.match(button.textContent,/메뉴도 한번 볼까요/);
 assert.match(js,/peek\.disabled=false/);
 assert.match(doc.querySelector('[data-photo-choice="after"]').textContent,/메뉴도 한번 볼까요/);
});
test('04 has separate per-row scroll focus without scroll lock',()=>{
 assert.equal(doc.querySelectorAll('#work .rf-word-row').length,3);
 assert.match(css,/\.rf-word-row\s*\{\s*min-height:clamp\(360px,62svh,650px\)/);
 assert.match(js,/is-word-active/);
 assert.match(js,/requestAnimationFrame/);
 assert.match(js,/prefers-reduced-motion/);
 assert.doesNotMatch(js,/scrollTo|preventDefault|gtag|fetch\(|AudioContext|sendBeacon|localStorage|sessionStorage/);
});
test('real footer with meaningful links, original consultation paths kept',()=>{
 const footer=doc.querySelector('footer.he-footer');
 assert.ok(footer);
 for(const url of ['#hero-evidence','#experience','#contact','/#cases','/#flow','/privacy/','/']){
  assert.ok(footer.querySelector('a[href="'+url+'"]'),url);
 }
 assert.ok(footer.querySelector('img[alt="Weplace"]'));
 assert.equal(doc.querySelector('#fast-sound').getAttribute('aria-pressed'),'false');
 assert.ok(doc.querySelector('[data-open-request]'));
 assert.doesNotMatch(html,/tossPayments|paymentWidget/i);
});
