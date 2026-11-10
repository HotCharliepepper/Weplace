'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const script=fs.readFileSync('assets/js/main-landing-r411.js','utf8');
const css=fs.readFileSync('assets/css/main-landing-r411.css','utf8');

test('R4.11: public journey directly follows changes and precedes discovery',()=>{
 const d=new JSDOM(html).window.document;
 const main=d.querySelector('main');
 const sections=[...main.querySelectorAll(':scope > section')];
 const ids=sections.map(x=>x.id);
 assert.ok(ids.indexOf('changes')>=0);
 assert.equal(ids.indexOf('decision-path'),ids.indexOf('changes')+1);
 assert.equal(ids.indexOf('discovery'),ids.indexOf('decision-path')+1);
 assert.equal(d.querySelectorAll('script[src="/assets/js/main-landing-r411.js"]').length,1);
 assert.equal(d.querySelectorAll('link[href="/assets/css/main-landing-r411.css"]').length,1);
});
test('R4.11: four honest stages remain readable without JavaScript',()=>{
 const d=new JSDOM(html).window.document;
 const stage=d.getElementById('r411-stage');
 assert.ok(stage);
 assert.equal(stage.querySelector('.r411-step-tabs').hidden,true);
 const panels=[...stage.querySelectorAll('.r411-step-panel')];
 assert.equal(panels.length,4);
 assert.deepEqual(panels.map(x=>x.id),['r411-panel-0','r411-panel-1','r411-panel-2','r411-panel-3']);
 assert.ok(panels.every(x=>!x.hidden && x.textContent.length>100));
 assert.deepEqual([...stage.querySelectorAll('[data-r411-tab]')].map(x=>x.textContent.trim().replace(/\s+/g,' ')),['01발견','02비교','03판단','04방문']);
 assert.match(stage.textContent,/예약/);
 assert.match(d.querySelector('#decision-path').textContent,/실제 고객 조사나 성과 측정 결과가 아닙니다/);
});
test('R4.11: keyboard, controls and labels reflect one selected step',()=>{
 const dom=new JSDOM(html,{url:'https://preview.example.invalid/',pretendToBeVisual:true,runScripts:'outside-only'});
 try{
  const {window:w}=dom;
  const d=w.document;
  const stage=d.getElementById('r411-stage');
  w.eval(script);
  const nav=stage.querySelector('.r411-step-tabs');
  const tabs=[...stage.querySelectorAll('[data-r411-tab]')];
  const panels=[...stage.querySelectorAll('.r411-step-panel')];
  assert.equal(nav.hidden,false);
  assert.deepEqual(tabs.map(x=>x.getAttribute('aria-selected')),['true','false','false','false']);
  tabs[0].dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
  assert.equal(stage.dataset.currentStep,'1');
  assert.equal(d.activeElement,tabs[1]);
  assert.equal(panels[0].hidden,true);
  assert.equal(panels[1].hidden,false);
  tabs[1].dispatchEvent(new w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
  assert.equal(stage.dataset.currentStep,'3');
  assert.equal(d.activeElement,tabs[3]);
  assert.equal(panels.filter(x=>!x.hidden).length,1);
  tabs[3].dispatchEvent(new w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
  assert.equal(stage.dataset.currentStep,'0');
  assert.equal(d.activeElement,tabs[0]);
  tabs[2].click();
  assert.equal(stage.dataset.currentStep,'2');
  assert.equal(tabs[2].getAttribute('aria-selected'),'true');
  assert.equal(panels[2].hidden,false);
 }finally{dom.window.close();}
});
test('R4.11: same facts across channels, distinct inquiry-confirmation-visit metrics',()=>{
 const d=new JSDOM(html).window.document;
 const section=d.getElementById('decision-path');
 const channels=[...section.querySelectorAll('.r411-channels b')].map(x=>x.textContent.trim());
 assert.deepEqual(channels,['홈페이지','네이버','Google','현장']);
 const stages=[...section.querySelectorAll('.r411-proof-steps li b')].map(x=>x.textContent.trim());
 assert.deepEqual(stages,['유효 문의','예약 확정','실제 방문']);
 assert.match(section.textContent,/담당자, 확인일, 반영 채널/);
 assert.match(section.textContent,/기준값이 없는 항목은 성과로 표시하지 않습니다/);
 assert.doesNotMatch(section.textContent,/설마중|앰앤|무화잠|계약 확정|성과 보장/);
 assert.doesNotMatch(script,/fetch\s*\(|sendBeacon\s*\(|localStorage|sessionStorage|XMLHttpRequest/);
 assert.match(css,/@media\(max-width:639px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
