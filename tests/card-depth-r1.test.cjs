const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
const document=p=>new JSDOM(read(p)).window.document;
const css=read('assets/css/card-depth-r1.css');

test('the shared depth treatment is opt-in and only used by intended public pages',()=>{
 for(const file of ['index.html','site.html','unified-r3-hero-polish-r3.html'])
   assert.equal(document(file).querySelectorAll('link[href="/assets/css/card-depth-r1.css"]').length,1,file);
 for(const file of ['essay.html','webtoon/index.html','check/index.html'])
   assert.equal(document(file).querySelectorAll('link[href="/assets/css/card-depth-r1.css"]').length,0,file);
 assert.ok(document('site.html').body.classList.contains('weplace-site-guide'));
 assert.match(css,/\.weplace-site-guide \.card-grid > a\.link-card/);
 assert.match(css,/\.home-r46 #explore \.explore-links > a/);
 assert.match(css,/\.unified-r3 #capabilities a\.rf-proof-card/);
});

test('destination labels and underlying navigation paths stay unchanged',()=>{
 const d=document('site.html');
 const hrefs=[...d.querySelectorAll('.card-grid > a.link-card')].map(x=>x.getAttribute('href'));
 assert.equal(hrefs.length,9);
 assert.deepEqual(hrefs,['/unified-r3-hero-polish-r3.html','/check/','/industries/','/essay.html','/webtoon/','/field-notes/','/flow-preview/','/my-store/','/enterprise/']);
 assert.equal(d.querySelectorAll('.card-grid > a.featured').length,1);
 assert.equal(document('index.html').querySelectorAll('#explore .explore-links > a').length,3);
 assert.equal(document('index.html').querySelectorAll('#explore .r46-role-grid > div').length,2);
 assert.equal(document('unified-r3-hero-polish-r3.html').querySelectorAll('#capabilities a.rf-proof-card').length,3);
});

test('contrast, mobile, focus, reduced motion and no fake interactive elements',()=>{
 for(const required of ['@media(max-width:640px)','@media (prefers-reduced-motion:reduce)','@media (hover:hover) and (pointer:fine)',':focus-visible','border-radius: 21px','box-shadow:','linear-gradient(155deg'])assert.ok(css.includes(required),required);
 assert.match(css,/Explanatory roles are not links/);
 assert.doesNotMatch(css,/cursor\s*:\s*pointer/);
 assert.doesNotMatch(css,/\.u-chart-card\s*\{|\.u-ledger\s*\{|\.rf-diagnosis-sheet\s*\{/);
 const p=document('unified-r3-hero-polish-r3.html');
 assert.ok(p.querySelector('#hero-evidence'));
 assert.ok(p.querySelector('#contact a[href^="https://pf.kakao.com/"]'));
 assert.equal(p.querySelectorAll('h1').length,1);
});

test('optional First Look photo pack is disabled unless actual media is approved and present',()=>{
 const code=read('assets/js/first-look-bridge-r412.js');
 assert.match(code,/root\.dataset\.wpflPhotoPack==='ready'/);
 assert.match(code,/photoPackState=photoPackEnabled\?'unknown':'disabled'/);
 assert.match(code,/photoPackState==='disabled'/);
 assert.ok(!document('index.html').getElementById('wpfl-experience')?.dataset.wpflPhotoPack,
   'the site must not claim its unshipped photo pack is ready');
});
