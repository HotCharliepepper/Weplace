const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const original=fs.readFileSync('unified-r3-text-depth.html','utf8');
const html=fs.readFileSync('unified-r3-evidence.html','utf8');
const style=fs.readFileSync('assets/css/evidence-inflow-seasonality-r1.css','utf8');
const dom=new JSDOM(html),d=dom.window.document;

test('new evidence route is isolated; original review, all seven sections and noindex preserved',()=>{
 assert.equal((d.querySelectorAll('main>section')).length,7);
 assert.deepEqual([...d.querySelectorAll('main>section')].map(s=>s.id),['top','fast','experience','work','capabilities','evidence','contact']);
 assert.ok(original.includes('rf-proof-card rf-proof-case'));
 assert.ok(!original.includes('evi-inflow-card'));
 assert.ok(!original.includes('evidence-inflow-seasonality-r1.css'));
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(html,/<body class="rv-vision unified-r3 swd-study tdp-study evi-study">/);
});
test('05 card is truthful 168% numeric comparison and links to 06 details',()=>{
 const card=d.querySelector('a.evi-inflow-card');
 assert.ok(card);
 assert.equal(card.getAttribute('href'),'#inflow-evidence');
 assert.ok(d.querySelector('#inflow-evidence'));
 assert.match(card.textContent,/\+168\s*%/);
 assert.match(card.textContent,/877회/);
 assert.match(card.textContent,/2,350회/);
 assert.match(html,/2026\.05/);assert.match(html,/2026\.08/);
 assert.ok(Math.abs((2350-877)/877*100-168)<.05);
 assert.match(d.querySelector('#inflow-evidence').textContent,/1,473회/);
 assert.match(d.querySelector('#inflow-evidence').textContent,/CTR·방문 고객 수가 아닙니다/);
});
test('06 preserves 2024/2025 negatives, 2026 positive and clearly flags unresolved data',()=>{
 for(const y of [2023,2024,2025,2026]){
   const card=d.querySelector('#year-title-'+y);
   assert.ok(card,'year '+y);
   assert.ok(card.closest('.evi-year').querySelector('svg[role="img"]'));
 }
 assert.match(d.querySelector('.evi-season').textContent,/2023년 6월은 비워두고/);
 assert.match(d.querySelector('.evi-season').textContent,/2025년 6월은 두 가능한 값/);
 assert.match(d.querySelector('.evi-year.is-2026').textContent,/\+12\.2%/);
 assert.ok((1.94-1.96)/1.96*100<0);
 assert.ok((1.7-2.02)/2.02*100<0&&(1.6-2.02)/2.02*100<0);
 assert.match(html,/2025년 6월 1\.60억/);
 assert.match(html,/2025년 6월 1\.70억/);
 assert.match(html,/0부터 시작하지 않는 선형 추이/);
 assert.match(d.querySelector('#evidence').textContent,/매출 변화와 Weplace 개별 작업 기여도는 다른 주장/);
});
test('scope, accessibility and business restrictions are unchanged',()=>{
 assert.match(style,/@media\(max-width:580px\)/);
 assert.match(style,/@media\(forced-colors:active\)/);
 for(const topic of ['photo','route','booking'])assert.ok(d.querySelector('button[data-focus="'+topic+'"]'));
 assert.ok(d.querySelector('#request-dialog'));
 assert.ok(d.querySelector('a[href="/#flow"]'));
 assert.ok(d.querySelector('#hero-title'));
 assert.match(html,/id="sheet-title"/);
 assert.doesNotMatch(html,/tossPayments|paymentWidget|gtag\s*\(/i);
 dom.window.close();
});