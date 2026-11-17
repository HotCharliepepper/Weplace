'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/main-landing-r49.css','utf8');
const r48=fs.readFileSync('assets/js/main-landing-r48.js','utf8');
const r2=fs.readFileSync('assets/js/main-landing-r2.js','utf8');
function document(){return new JSDOM(html).window.document;}
test('hero: new atmosphere sequence preserves direct diagnosis and separate LuWei evidence',()=>{
 const d=document(), intro=d.querySelector('#intro');
 assert.ok(intro.classList.contains('hero'));
 assert.equal(intro.querySelectorAll('img[src*="luwei-"]').length,0);
 assert.equal(intro.querySelectorAll('[data-hero-scene]').length,3);
 assert.equal(intro.querySelector('#hero-cta').getAttribute('href'),'#request');
 assert.match(intro.querySelector('.eh-images figcaption').textContent,/실제 고객 사례와 구분합니다/);
 assert.equal(d.querySelectorAll('h1').length,1);
});
test('LuWei source before-to-after remains a voluntary real-image comparison',()=>{
 const d=document();
 assert.equal(d.querySelector('#change-panel').dataset.storeState,'before');
 assert.match(d.querySelector('#sample-photo-image').getAttribute('src'),/luwei-before-capture\.webp$/);
 assert.match(d.querySelector('#r47-photo-switch').textContent,/메뉴 먼저 보기/);
 assert.ok(d.querySelector('[data-change=after]'));
 assert.ok(d.querySelector('details.static-comparison'));
 assert.match(d.querySelector('#changes .sample-caption').textContent,/매출 효과를 뜻하지 않습니다/);
});
test('680ms applies to first reveal regardless of mobile matchMedia',()=>{
 for(const isMobile of [false,true]){
  const dom=new JSDOM(html,{url:'https://preview.example.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  w.matchMedia=query=>({matches:query.includes('max-width')?isMobile:false,addEventListener(){}});
  w.eval(r2);
  w.eval(r48);
  try{
    d.getElementById('change-after').click();
    assert.equal(d.getElementById('change-panel').dataset.storeState,'after');
    assert.equal(d.getElementById('r47-picture-curtain').style.getPropertyValue('--r48-beat'),'680ms');
  }finally{w.dispatchEvent(new w.Event('pagehide'));dom.window.close();}
 }
});
test('visual code does not override R4.5 finite scene ownership',()=>{
 const d=document();
 assert.equal(d.querySelectorAll('script[src$="main-landing-r45.js"]').length,1);
 assert.equal(d.querySelectorAll('script[src$="main-landing-r48.js"]').length,1);
 assert.equal(d.querySelectorAll('script[src$="main-landing-r49.js"]').length,0);
 assert.equal(d.querySelectorAll('link[href$="main-landing-r49.css"]').length,1);
 assert.match(css,/@media\(max-width:639px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(css,/@keyframes.*spin/);
});
