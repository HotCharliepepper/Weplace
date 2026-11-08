'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const r2=fs.readFileSync('assets/js/main-landing-r2.js','utf8');
const r48=fs.readFileSync('assets/js/main-landing-r48.js','utf8');
const css=fs.readFileSync('assets/css/main-landing-r48.css','utf8');
function setup({url='http://127.0.0.1:4175/',reduced=false,decoded=true}={}) {
  const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  const calls={network:[],storage:[]};
  w.matchMedia=q=>({matches:q.includes('prefers-reduced-motion')?reduced:false,addEventListener(){}});
  w.fetch=(...args)=>{calls.network.push(args);throw Error('Unexpected request');};
  w.Storage.prototype.setItem=(...args)=>calls.storage.push(args);
  const photo=d.getElementById('sample-photo-image');
  Object.defineProperty(photo,'naturalWidth',{configurable:true,get:()=>decoded?640:0});
  Object.defineProperty(photo,'complete',{configurable:true,get:()=>decoded});
  photo.decode=()=>decoded?Promise.resolve():new Promise(()=>{});
  w.eval(r2);
  w.eval(r48);
  return {w,d,dom,calls,close(){dom.window.close();}};
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('R4.8 maintains factual comparison and preview-only experiment UI',()=>{
  const d=new JSDOM(html).window.document;
  assert.equal(d.querySelectorAll('script[src$="main-landing-r48.js"]').length,1);
  assert.equal(d.querySelectorAll('script[src$="main-landing-r47.js"]').length,0);
  assert.equal(d.getElementById('r48-wait-lab').hidden,true);
  assert.equal(d.getElementById('r48-photo-fallback').hidden,true);
  assert.equal(d.getElementById('change-panel').dataset.storeState,'before');
  assert.match(html,/사진 선택의 매출 효과를 뜻하지 않습니다/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('Reduced motion retains instant photos and functional buttons',async()=>{
  const c=setup({reduced:true});
  try{
    const button=c.d.getElementById('r47-photo-switch');
    assert.equal(button.hidden,false);
    button.click();
    await Promise.resolve();
    assert.equal(c.d.getElementById('change-panel').dataset.storeState,'after');
    assert.match(c.d.getElementById('sample-photo-image').src,/luwei-peking-duck-1254\.webp/);
    assert.equal(c.d.getElementById('r47-picture-curtain').hidden,true);
    button.click();
    await Promise.resolve();
    assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
    assert.deepEqual(c.calls.network,[]);
    assert.deepEqual(c.calls.storage,[]);
  } finally {c.close();}
});
test('First photo reveal has an editorial beat, repeated comparison is faster',async()=>{
  const c=setup();
  try{
    const button=c.d.getElementById('r47-photo-switch'),curtain=c.d.getElementById('r47-picture-curtain');
    button.click();
    assert.equal(curtain.hidden,false);
    assert.equal(curtain.dataset.beat,'first');
    await pause(280);
    assert.equal(curtain.hidden,false,'anticipation remains visible before default 680ms');
    await pause(690);
    assert.equal(curtain.hidden,true,'first reveal completes without an indefinite spinner');
    assert.equal(c.d.getElementById('change-panel').dataset.storeState,'after');
    button.click();
    await pause(350);
    assert.equal(curtain.hidden,true,'return comparison is short');
    button.click();
    assert.equal(curtain.dataset.beat,'repeat');
    await pause(360);
    assert.equal(curtain.hidden,true,'repeat reveal is not as slow as first reveal');
    assert.deepEqual(c.calls.network,[]);
  }finally{c.close();}
});
test('An actual late image shows an honest fallback after the max editorial hold',async()=>{
  const c=setup({decoded:false});
  try{
    c.d.getElementById('r47-photo-switch').click();
    assert.equal(c.d.getElementById('r47-picture-curtain').hidden,false);
    await pause(1430);
    assert.equal(c.d.getElementById('r47-picture-curtain').hidden,true);
    assert.equal(c.d.getElementById('r48-photo-fallback').hidden,false);
    assert.match(c.d.getElementById('r48-fallback-heading').textContent,/실제 사진을 불러오는 중/);
    c.d.getElementById('r48-fallback-back').click();
    assert.equal(c.d.getElementById('r48-photo-fallback').hidden,true);
    assert.equal(c.d.getElementById('change-panel').dataset.storeState,'before');
  }finally{c.close();}
});
test('Wait lab only appears on explicit preview URLs and never transmits a rating',async()=>{
  for(const [url,expected] of [
    ['https://withweplace.kr/?waitlab=1',false],
    ['https://deploy-preview-23--weplace.netlify.app/?waitlab=1',true],
    ['http://127.0.0.1:4175/?waitlab=1',true]]) {
    const c=setup({url,reduced:false});
    try{
      const lab=c.d.getElementById('r48-wait-lab');
      assert.equal(lab.hidden,!expected);
      if(expected) {
        const preset=c.d.getElementById('r48-wait-preset');
        preset.value='lingering';
        preset.dispatchEvent(new c.w.Event('change',{bubbles:true}));
        assert.match(c.d.getElementById('r48-lab-result').textContent,/900ms/);
        assert.equal(c.d.getElementById('r48-lab-feedback').hidden,true);
        if(url.includes('deploy-preview-')) {
          preset.value='brief';
          preset.dispatchEvent(new c.w.Event('change',{bubbles:true}));
          c.d.getElementById('r47-photo-switch').click();
          await pause(750);
          assert.equal(c.d.getElementById('r48-lab-feedback').hidden,false);
          c.d.querySelector('[data-perception="ready"]').click();
          assert.match(c.d.getElementById('r48-lab-result').textContent,/450ms.*기대 유지 1/);
          assert.equal(c.d.getElementById('r48-lab-feedback').hidden,true);
        }
      }
      assert.deepEqual(c.calls.network,[]);
      assert.deepEqual(c.calls.storage,[]);
    }finally{c.close();}
  }
});
