/* Native disclosure and public-data refresh invariants; no rendered layout claims. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/industry-folders.js'), 'utf8');
const now = Date.parse('2026-10-18T17:03:21.000Z');
const approved = {industries: [{industry:'요식업', count:1, managedCount:2, capacity:5, remaining:3,
  capacityReviewedAt:'2026-10-18T08:00:00.000Z', activeUntil:'2026-10-31',
  updates:[{summary:'SYNTHETIC_PUBLIC_DESCRIPTION', updatedAt:'2026-10-18T08:00:00.000Z'}]}]};
async function setup() {
  const dom = new JSDOM('<main><section id="experience"></section><weplace-industries></weplace-industries></main>',
    {url:'https://deploy-preview.example.invalid/experience/', runScripts:'outside-only', pretendToBeVisual:true});
  const w=dom.window, d=w.document, intervals=[], timeouts=new Map(); let timer=0;
  const RealDate=Date;
  w.Date=class extends RealDate { constructor(...args){super(...(args.length?args:[now]));} static now(){return now;} };
  w.AbortController=globalThis.AbortController;
  w.setTimeout=(fn,ms)=>{timeouts.set(++timer,{fn,ms});return timer;};
  w.clearTimeout=id=>timeouts.delete(id);
  w.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 1;}; w.clearInterval=()=>{};
  w.fetch=async()=>({ok:true,json:async()=>approved});
  w.eval(source); await new Promise(setImmediate);
  return {dom,w,d,widget:d.querySelector('weplace-industries'),timeouts};
}

test('each industry offers a direct next step outside native optional disclosures', async()=>{
  const p=await setup();
  try {
    const cards=[...p.d.querySelectorAll('.wp-folder-card')];
    assert.equal(cards.length,4);
    const questions=new Set(), targets=new Set();
    for(const card of cards){
      const details=card.querySelector('details.wp-folder');
      assert.ok(details && details.firstElementChild.tagName==='SUMMARY');
      assert.equal(details.open,false);
      assert.equal(card.querySelectorAll('.wp-folder-evidence > li').length,2);
      const cta=card.querySelector('.wp-folder-links > a');
      assert.ok(cta && !cta.closest('details'),'The next action must remain visible when all detail sections are closed.');
      assert.ok(cta.textContent.trim().length>5);
      questions.add(card.querySelector('.wp-folder-question').textContent.trim());
      targets.add(cta.textContent.trim());
      for(const nested of card.querySelectorAll('details.wp-folder-extra')){
        assert.equal(nested.firstElementChild.tagName,'SUMMARY');
        assert.ok(nested.firstElementChild.textContent.trim());
        assert.equal(nested.querySelector('summary button, summary a, summary input'),null,'A native summary must not wrap competing controls.');
      }
    }
    assert.equal(questions.size,4); assert.equal(targets.size,4);
    assert.equal(p.d.querySelectorAll('.wp-folders-intro').length,1);
  } finally {p.dom.window.close();}
});

test('nested industry disclosures and keyboard focus survive a successful public refresh', async()=>{
  const p=await setup();
  try {
    const selectors=['details[data-industry="dining"]','details[data-disclosure="scope-dining"]','details[data-disclosure="public-dining"]'];
    selectors.forEach(selector=>p.d.querySelector(selector).open=true);
    p.d.querySelector('[data-focus="scope-dining"]').focus();
    await p.widget.load();
    selectors.forEach(selector=>assert.equal(p.d.querySelector(selector).open,true,selector));
    assert.equal(p.d.activeElement.dataset.focus,'scope-dining');
    p.d.querySelector('[data-focus="records-dining"]').focus();
    await p.widget.load();
    assert.equal(p.d.activeElement.dataset.focus,'records-dining');
    assert.equal(p.d.querySelectorAll('.wp-folder-metrics').length,1);
  } finally {p.dom.window.close();}
});

test('removed public controls return focus to their industry while expired metrics stay hidden', async()=>{
  for(const focusKey of ['public-dining','records-dining']){
    const p=await setup();
    try {
      p.d.querySelector('details[data-industry="dining"]').open=true;
      p.d.querySelector('details[data-disclosure="scope-dining"]').open=true;
      p.d.querySelector('details[data-disclosure="public-dining"]').open=true;
      p.d.querySelector(`[data-focus="${focusKey}"]`).focus();
      const lease=[...p.timeouts.values()].find(timer=>timer.ms===60000);
      assert.ok(lease); lease.fn();
      assert.equal(p.d.querySelector('.wp-folder-metrics'),null);
      assert.equal(p.d.querySelector('.wp-folder-public'),null);
      assert.doesNotMatch(p.widget.textContent,/SYNTHETIC_PUBLIC_DESCRIPTION/);
      assert.equal(p.d.querySelector('details[data-industry="dining"]').open,true);
      assert.equal(p.d.querySelector('details[data-disclosure="scope-dining"]').open,true);
      assert.equal(p.d.activeElement.dataset.focus,'folder-dining','Removed record controls must not drop keyboard focus to the document body.');
      p.w.fetch=async()=>{throw Error('offline');};
      await p.widget.load();
      assert.equal(p.d.activeElement.dataset.focus,'folder-dining');
      assert.ok(p.d.querySelector('.wp-folder-retry'));
    } finally {p.dom.window.close();}
  }
});
