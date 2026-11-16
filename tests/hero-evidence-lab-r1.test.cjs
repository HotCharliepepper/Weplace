const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const original=fs.readFileSync('unified-r3-evidence.html','utf8');
const html=fs.readFileSync('unified-r3-hero-lab.html','utf8');
const css=fs.readFileSync('assets/css/hero-evidence-lab-r1.css','utf8');
const js=fs.readFileSync('assets/js/hero-evidence-lab-r1.js','utf8');
const sourceController=fs.readFileSync('assets/js/unified-r3.js','utf8');
const controller=fs.readFileSync('assets/js/unified-r3-hero-lab.js','utf8');
const dom=new JSDOM(html,{url:'https://preview.example/unified-r3-hero-lab.html',runScripts:'outside-only'});
const d=dom.window.document;
test('opt-in lab leaves original R3 evidence untouched and adds hero evidence before experience',()=>{
 const ids=[...d.querySelectorAll('main>section')].map(x=>x.id);
 assert.deepEqual(ids,['top','fast','hero-evidence','experience','work','capabilities','evidence','contact']);
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/class="rv-vision unified-r3 swd-study tdp-study evi-study he-lab"/);
 assert.ok(!original.includes('he-evidence'));
 assert.match(html,/hero-evidence-lab-r1.css/);
 assert.match(html,/hero-evidence-lab-r1.js/);
 assert.equal(d.querySelectorAll('#he-evidence-title').length,1);
 assert.equal(d.querySelectorAll('h1').length,1);
});
test('4-year matrix is exact, source-corrected and accessible',()=>{
 const table=d.querySelector('.he-raw-values table');
 assert.ok(table);
 const rows=[...table.querySelectorAll('tbody>tr')].map(x=>x.textContent.replace(/\s+/g,' ').trim());
 for(const year of ['2023','2024','2025','2026'])assert.ok(rows.some(x=>x.includes(year)));
 assert.ok(rows.find(x=>x.includes('2023')).includes('1.60'));
 assert.ok(rows.find(x=>x.includes('2025')).includes('1.70'));
 assert.ok(rows.find(x=>x.includes('2026')).includes('+12.2%'));
 const graph=d.querySelector('svg.he-overlaid-chart');
 assert.equal(graph.querySelectorAll('.he-line').length,4);
 assert.equal(graph.querySelectorAll('.he-graph-dot').length,12);
 assert.equal(graph.querySelectorAll('.he-line.is-selected').length,1);
 assert.equal(graph.querySelector('.he-line.is-selected').dataset.chartYear,'2026');
 assert.equal(d.querySelectorAll('[data-compare-year]').length,4);
 assert.match(graph.querySelector('desc').textContent,/2023년 1\.70,1\.79,1\.60억/);
 assert.match(graph.querySelector('desc').textContent,/2025년 1\.91,2\.02,1\.70억/);
 assert.equal((1.60-1.79)/1.79<0,true);
 assert.equal((1.94-1.96)/1.96<0,true);
 assert.equal((1.70-2.02)/2.02<0,true);
 assert.equal((1.93-1.72)/1.72>0,true);
 assert.match(html,/원본 장부 확인 전 제공 수치/);
 assert.match(html,/Weplace 작업만의 효과를 뜻하지는 않습니다/);
});
test('original cases, actual picture asset and opt-in audio retained',()=>{
 const required=['#chart-heading','#fast','#experience','#work','#capabilities','#evidence','#contact','#request-dialog'];
 for(const selector of required)assert.ok(d.querySelector(selector),selector);
 for(const name of ['photo','route','booking'])assert.ok(d.querySelector('button[data-focus="'+name+'"]'));
 for(const path of ['assets/home-r42/luwei-before-capture.webp','assets/home-r42/luwei-peking-duck-1254.webp']){
  assert.ok(fs.existsSync(path),path);
 }
 assert.equal(d.querySelectorAll('[data-photo-choice]').length,2);
 assert.equal(d.querySelector('#fast-sound').getAttribute('aria-pressed'),'false');
 assert.match(html,/사진 순서가 매출 상승을 일으켰다는 뜻은 아닙니다/);
 assert.match(html,/href="\/#flow"/);
 assert.match(html,/Weplace 작업만의 효과를 뜻하지는 않습니다/);
});
test('04 animation is slower only in isolated controller and remains accessible',()=>{
 const from="start:'top 88%',end:'top 37%',scrub:.65";
 const to="start:'top 93%',end:'bottom 22%',scrub:1.25";
 assert.ok(sourceController.includes(from));
 assert.ok(controller.includes(to));
 assert.equal(controller.replace(to,from).replace('Hero Lab 04: increase scroll distance for calmer word reveals.','Each phrase follows its own position in normal document flow.'),sourceController);
 assert.match(controller,/prefers-reduced-motion/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.doesNotMatch(js,/gtag\s*\(|fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|AudioContext|new Audio/);
 assert.doesNotThrow(()=>new Function(js));
 assert.doesNotMatch(html,/tossPayments|paymentWidget/);
});
// JSDOM remains active until the node:test callbacks finish.