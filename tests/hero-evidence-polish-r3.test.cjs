const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=name=>fs.readFileSync(name,'utf8');
const original=new JSDOM(read('unified-r3-hero-polish.html')).window.document;
const html=read('unified-r3-hero-polish-r3.html');
const doc=new JSDOM(html).window.document;
const values={2023:[1.70,1.79,1.60],2024:[1.66,1.96,1.94],2025:[1.91,2.02,1.70],2026:[1.74,1.72,1.93]};
const compact=text=>text.replace(/\s+/g,'').trim();

test('R3 is an opt-in draft and retains all eight sections and original controllers',()=>{
 assert.deepEqual([...doc.querySelectorAll('main>section')].map(el=>el.id),[...original.querySelectorAll('main>section')].map(el=>el.id));
 assert.equal(doc.querySelectorAll('h1').length,1);
 assert.match(doc.querySelector('meta[name="robots"]').content,/noindex/);
 for(const src of ['hero-evidence-polish-r2.js','hero-evidence-lab-r1.js','unified-r3-hero-lab.js'])assert.ok(doc.querySelector('script[src$="'+src+'"]'),src);
 for(const id of ['top','fast','experience','capabilities','evidence'])assert.equal(doc.getElementById(id).outerHTML,original.getElementById(id).outerHTML,id+' remains unchanged');
});

test('all original revenue values, rates and source boundaries remain intact',()=>{
 assert.equal(doc.querySelector('.he-raw-values').outerHTML,original.querySelector('.he-raw-values').outerHTML);
 const rows=[...doc.querySelectorAll('.he-raw-values tbody tr')];
 for(const row of rows){
  const cells=[...row.children].map(el=>el.textContent.trim());
  const year=cells.shift(),actual=cells.slice(0,3).map(Number);
  assert.deepEqual(actual,values[year]);
  const rate=((actual[2]-actual[1])/actual[1]*100).toFixed(1);
  assert.equal(cells[3].replace('−','-').replace('+','').replace('%',''),rate);
 }
 assert.match(doc.querySelector('#hero-evidence').textContent,/877회/);
 assert.match(doc.querySelector('#hero-evidence').textContent,/2,350회/);
 assert.match(doc.querySelector('.he-graph-foot').textContent,/웰니스 B.*플레이스 유입/);
 assert.match(doc.querySelector('.he-graph-foot').textContent,/음식점 A.*매출/);
 assert.match(doc.querySelector('.he-graph-foot').textContent,/원장 및 공개 허가/);
 assert.match(doc.querySelector('#hero-evidence').textContent,/Weplace 작업만의 효과를 뜻하지는 않습니다/);
});

test('both SVG coordinate systems plot the same twelve values on one common linear axis',()=>{
 const graphs=[...doc.querySelectorAll('svg.he-overlaid-chart,svg.he-mobile-chart')];
 assert.equal(graphs.length,2);
 for(const graph of graphs){
  assert.equal(graph.getAttribute('role'),'img');
  assert.ok(graph.querySelector('title'));
  assert.ok(graph.querySelector('desc'));
  const lines=[...graph.querySelectorAll('.he-line')];
  assert.equal(lines.length,4);
  const coordinates=Object.fromEntries(lines.map(line=>[line.dataset.chartYear,line.getAttribute('points').trim().split(/\s+/).map(pair=>pair.split(',').map(Number))]));
  const first=coordinates['2023'];
  const scale=(first[1][1]-first[0][1])/(values['2023'][1]-values['2023'][0]);
  const offset=first[0][1]-values['2023'][0]*scale;
  assert.ok(scale<0,'larger values are higher');
  for(const [year,points] of Object.entries(coordinates)){
   assert.equal(points.length,3);
   points.forEach(([x,y],i)=>{
    assert.equal(x,first[i][0],'shared month positions');
    assert.ok(Math.abs(y-(offset+values[year][i]*scale))<.06,'exact linear plot '+year+' month '+i);
   });
  }
  for(const month of ['4월','5월','6월'])assert.ok([...graph.querySelectorAll('text')].some(el=>el.textContent.trim()===month));
  assert.equal(graph.querySelectorAll('.he-line.is-selected').length,1);
  assert.equal(graph.querySelector('.he-line.is-selected').dataset.chartYear,'2026');
 }
 assert.doesNotMatch(doc.querySelector('.he-chart-scroll').getAttribute('aria-label')||'',/스크롤/);
});

test('CX question names the customer screen and preserves the invitation and inquiry contract',()=>{
 assert.equal(compact(doc.querySelector('#contact-title').textContent),'손님은우리매장의어느화면에서멈출까요?');
 assert.ok(compact(doc.querySelector('#contact').textContent).includes('한화면을함께보고,먼저바꿀한가지를찾습니다.'));
 assert.equal(doc.querySelector('#request-dialog').outerHTML,original.querySelector('#request-dialog').outerHTML);
});

test('all footer links, logo and word semantics are preserved',()=>{
 const links=d=>[...d.querySelectorAll('footer a')].map(el=>({href:el.getAttribute('href'),text:compact(el.textContent)}));
 assert.deepEqual(links(doc),links(original));
 const logo=doc.querySelector('footer img[alt="Weplace"]');
 assert.equal(logo.getAttribute('src'),'/assets/brand/r42/weplace-logo-dark.svg');
 assert.ok(fs.existsSync(logo.getAttribute('src').slice(1)),'existing inverse brand asset resolves');
 assert.equal(logo.getAttribute('width'),'160');
 assert.equal(logo.getAttribute('height'),'37');
 assert.deepEqual([...doc.querySelectorAll('#work .rf-word')].map(el=>el.textContent),['보여주고,','정리하고,','실행합니다.']);
 assert.equal(doc.querySelector('#fast-sound').getAttribute('aria-pressed'),'false');
});
