const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
const current=read('unified-r3.html');
const study=read('unified-r3-sunwind.html');
const css=read('assets/css/fast-sunwind-r1.css');
const js=read('assets/js/fast-sunwind-r1.js');

test('Sunwind route is opt-in and retains exactly one semantic FAST headline',()=>{
 assert.match(study,/<body class="rv-vision unified-r3 swd-study">/);
 assert.match(study,/name="robots" content="noindex,nofollow"/);
 assert.equal((study.match(/id="hero-title"/g)||[]).length,1);
 assert.match(study,/id="hero-title" class="rf-title" aria-label="RESOLUTE IT FAST\."/);
 assert.match(study,/id="fast"/);
 assert.match(study,/id="contact"/);
 assert.match(study,/id="stage"/);
 assert.ok(!current.includes('fast-sunwind-r1.css'));
});
test('Light box, vector-type and wind graphics are decorative, not raster text',()=>{
 assert.match(study,/class="swd-atmosphere" aria-hidden="true"/);
 assert.match(study,/class="swd-title-lens" aria-hidden="true"/);
 assert.match(study,/class="swd-title-sweep" aria-hidden="true"/);
 assert.match(study,/assets\/css\/fast-sunwind-r1.css/);
 assert.match(study,/assets\/js\/fast-sunwind-r1.js/);
 assert.match(css,/\.swd-study \.rf-title-top/);
 assert.match(css,/\.swd-study \.rf-fast-depth/);
 assert.match(css,/radial-gradient/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
});
test('Existing photo, chart, selection, original sound and customer routes remain',()=>{
 for(const p of ['/img/weplace-hero-surface.jpg','/assets/js/unified-r3.js','/#cases','/#flow','/my-store/'])assert.ok(study.includes(p),p);
 assert.match(study,/id="chart-heading"/);
 for(const f of ['photo','route','booking'])assert.match(study,new RegExp('data-focus="'+f+'"'));
 assert.match(study,/id="fast-sound"/);
 assert.match(study,/id="request-dialog"/);
 assert.doesNotMatch(study,/tossPayments|paymentWidget|fetch\(/i);
 assert.doesNotMatch(js,/fetch\s*\(|localStorage|sessionStorage|AudioContext|sendBeacon|gtag\s*\(/);
 assert.doesNotThrow(()=>new Function(js));
});
