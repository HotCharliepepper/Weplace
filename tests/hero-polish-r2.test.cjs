const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('unified-r3-hero-polish.html','utf8');
const prior=fs.readFileSync('unified-r3-hero-lab.html','utf8');
const css=fs.readFileSync('assets/css/hero-polish-r2.css','utf8');
const js=fs.readFileSync('assets/js/hero-polish-r2.js','utf8');
const controller=fs.readFileSync('assets/js/unified-r3-hero-polish.js','utf8');
const oldController=fs.readFileSync('assets/js/unified-r3-hero-lab.js','utf8');
const d=new JSDOM(html,{url:'https://preview.example/unified-r3-hero-polish.html',runScripts:'outside-only'}).window.document;
test('new review-only page extends without modifying existing PR37 source',()=>{
  assert.ok(!prior.includes('he-polish'));
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.deepEqual([...d.querySelectorAll('main>section')].map(x=>x.id),
    ['top','fast','hero-evidence','experience','work','capabilities','evidence','contact']);
  for(const id of ['hero-title','he-evidence-title','work-title','contact-title','request-dialog'])assert.ok(d.getElementById(id),id);
  assert.equal(d.querySelectorAll('h1').length,1);
  assert.ok(d.querySelector('link[href="/assets/css/hero-polish-r2.css"]'));
});
test('no raster enlargement and a reversible curiosity CTA on the actual place screenshot',()=>{
  assert.match(css,/\.he-photo-stage img\.he-image-before\s*\{[\s\S]*?transform:none!important/);
  assert.match(css,/\.he-photo-stage img\.he-image-after\s*\{[\s\S]*?transform:none/);
  const stage=d.querySelector('[data-photo-stage]');
  assert.ok(stage);
  assert.ok(stage.querySelector('img.he-image-before').src.includes('luwei-before-capture.webp'));
  assert.ok(stage.querySelector('img.he-image-after').src.includes('luwei-peking-duck-1254.webp'));
  const c=stage.querySelector('button[data-photo-prompt]');
  assert.ok(c);
  assert.match(c.textContent,/차량 뒤에는 어떤 메뉴가 기다릴까요\?/);
  assert.match(c.textContent,/베이징덕 사진 먼저 보기/);
  assert.match(js,/data-photo-choice="after"/);
  assert.match(js,/data-photo-choice="before"/);
  assert.doesNotMatch(js,/fetch\(|sendBeacon|gtag\s*\(|new Audio|localStorage|sessionStorage/);
});
test('three word scenes take one scroll band each, without pinning or layout scale blur',()=>{
  assert.equal(d.querySelectorAll('.rf-word-row').length,3);
  assert.match(css,/\.rf-word-row\s*\{[\s\S]*?min-height:clamp\(430px,65svh,710px\)/);
  assert.match(css,/@media\(max-width:800px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(controller,/scrub:1\.38/);
  assert.match(controller,/start:'top 83%',end:'top 25%'/);
  assert.match(oldController,/start:'top 93%',end:'bottom 22%'/);
  assert.doesNotMatch(controller,/pin:\s*true|scroll-snap-type|scrollTo\s*\(/);
});
test('real footer has branded conclusion and preserves all important links',()=>{
  const footer=d.querySelector('footer.rf-footer.he-footer');
  assert.ok(footer);
  assert.match(footer.textContent,/좋은 공간이/);
  const hrefs=[...footer.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  for(const required of ['#top','#experience','#hero-evidence','#work','#contact','/start/','/check/','/meeting/','/flow-preview/','/my-store/','/privacy/','/']){
    assert.ok(hrefs.includes(required),'footer '+required);
  }
  assert.ok(!footer.textContent.includes('145-88-03119'),'unverified legal number not exposed');
});
test('evidence separation, no payment/tracking and original sound remain',()=>{
  assert.match(html,/WELLNESS B · PLACE INFLOW/);
  assert.match(html,/음식점 A · 6월/);
  assert.match(html,/2023년 1\.70,1\.79,1\.60억/);
  assert.match(html,/2025년 1\.91,2\.02,1\.70억/);
  assert.match(html,/id="fast-sound" aria-pressed="false"/);
  for(const name of ['photo','route','booking'])assert.ok(d.querySelector('button[data-focus="'+name+'"]'));
  assert.match(html,/사진 배열의 차이를 보여주는 예시/);
  assert.doesNotMatch(html,/tossPayments|paymentWidget|purchase_success/);
  assert.ok(!html.includes('G-FVCYL26FTL'));
});