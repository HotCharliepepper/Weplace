/* Product counts and comparison facts follow the live controls, not invented metrics. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const text=node=>node.textContent.trim().replace(/\s+/g,' ');
function home(){
  const dom=new JSDOM(read('index.html'),{url:'https://deploy-preview.example.invalid/',runScripts:'outside-only'});
  const w=dom.window,d=w.document,requests=[],writes=[];
  w.matchMedia=()=>({matches:true});
  w.fetch=(...args)=>{requests.push(args);throw Error('No requests are needed for an illustrative experience.');};
  w.Storage.prototype.setItem=(...args)=>writes.push(args);
  w.eval(read('assets/js/site-metrics.js'));
  w.eval(read('assets/js/customer-discovery.js'));
  return {dom,w,d,requests,writes};
}
const count=(d,key)=>Number.parseInt(d.querySelector('[data-function-count="'+key+'"]').textContent,10);

test('published 4/8/6 counts equal the available industries, unique situations and diagnostic questions',()=>{
  const p=home();
  const check=new JSDOM(read('check/index.html'),{url:'https://deploy-preview.example.invalid/check/',runScripts:'outside-only'});
  try {
    const choices=[...p.d.querySelectorAll('#experience button[data-industry]')],situations=new Set();
    assert.equal(count(p.d,'industries'),choices.length);
    for(const button of choices){
      button.click();
      for(const purpose of p.d.querySelectorAll('[data-purpose]')){
        purpose.click(); situations.add(text(p.d.getElementById('customerQuestion')));
      }
    }
    assert.equal(count(p.d,'situations'),situations.size);
    check.window.eval(read('assets/js/store-check.js'));
    assert.equal(count(p.d,'questions'),check.window.document.querySelectorAll('#questions fieldset').length);
    assert.equal(p.d.querySelectorAll('#experience-route > li').length,3);
    assert.ok(p.d.getElementById('experience-route').getAttribute('aria-label'));
    assert.deepEqual(p.requests,[]);assert.deepEqual(p.writes,[]);
  } finally {p.dom.window.close();check.window.close();}
});

test('optional comparison table matches both rendered states across all eight situations and clears on context changes',()=>{
  const p=home();
  const rows=()=>[...p.d.querySelectorAll('#exampleScreen .screen-row')].map(row=>[text(row.querySelector('dt')),text(row.querySelector('dd'))]);
  const table=()=>[...p.d.querySelectorAll('#comparisonTableBody tr')].map(row=>[...row.children].map(text));
  try {
    const disclosure=p.d.getElementById('comparisonDetails');
    assert.equal(disclosure.tagName,'DETAILS');assert.equal(disclosure.firstElementChild.tagName,'SUMMARY');
    assert.equal(disclosure.hidden,true);assert.equal(disclosure.open,false);
    for(const industry of p.d.querySelectorAll('#experience button[data-industry]')){
      industry.click();
      assert.equal(disclosure.hidden,true);assert.equal(disclosure.open,false);assert.deepEqual(table(),[]);
      for(const purpose of p.d.querySelectorAll('[data-purpose]')){
        purpose.click();
        assert.equal(disclosure.hidden,false);assert.equal(disclosure.open,false);
        const before=rows(); disclosure.open=true;
        p.d.querySelector('[data-view="after"]').click();
        const after=rows();
        assert.equal(disclosure.open,true,'Changing the preview state must respect the reader\'s open comparison.');
        assert.equal(before.length,3);assert.equal(after.length,3);
        assert.deepEqual(before.map(row=>row[0]),after.map(row=>row[0]),'Both views must compare the same fields.');
        assert.deepEqual(table(),before.map((row,i)=>[row[0],row[1],after[i][1]]));
        assert.equal(p.d.querySelectorAll('#comparisonTableBody th[scope="row"]').length,3);
        assert.equal(disclosure.querySelectorAll('thead th[scope="col"]').length,3);
        const snapshot=table();
        p.d.querySelector('[data-view="before"]').click();
        assert.equal(disclosure.open,true);assert.deepEqual(table(),snapshot);
      }
    }
    p.d.getElementById('experienceReset').click();
    assert.equal(disclosure.hidden,true);assert.equal(disclosure.open,false);assert.deepEqual(table(),[]);
    assert.equal(p.d.getElementById('discoveryResult').hidden,true);
    assert.deepEqual(p.requests,[]);assert.deepEqual(p.writes,[]);
  } finally {p.dom.window.close();}
});

test('initial homepage offers all four static industry routes when enhancement or its public API is unavailable',()=>{
  const dom=new JSDOM(read('index.html'),{url:'https://withweplace.kr/'}),d=dom.window.document;
  try {
    const links=[...d.querySelectorAll('weplace-industries .industry-static-fallback a[data-industry-guide]')];
    assert.equal(links.length,4);
    assert.deepEqual(links.map(link=>link.dataset.industryGuide).sort(),['beauty','cafe','dining','stay']);
    for(const link of links){
      assert.ok(text(link));assert.equal(link.closest('[hidden],details'),null);
      let file=new URL(link.href).pathname.slice(1);if(file.endsWith('/'))file+='index.html';
      assert.ok(fs.existsSync(path.join(root,file)),file);
    }
    assert.ok(d.querySelector('a[href="/privacy/"]'));
  } finally {dom.window.close();}
});
