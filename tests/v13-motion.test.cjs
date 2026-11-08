// Motion is a presentation layer; these tests exercise cancellation, fallback,
// keyboard state and refresh races. Browser layout is reviewed separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
function setup(options = {}) {
  const dom = new JSDOM(read('experience/index.html'), {url: 'https://preview.example.invalid/', runScripts: 'outside-only', pretendToBeVisual: true});
  const w = dom.window, d = w.document, animations = [], events = [], writes = [], requests = [];
  const media = {matches: !!options.reduce, addEventListener: (_, fn) => { media.change = fn; }};
  w.matchMedia = () => media;
  w.CSS = {supports: () => true};
  if (options.connection) Object.defineProperty(w.navigator, 'connection', {value: options.connection});
  if (!options.noAnimate) w.Element.prototype.animate = function (frames, timing) {
    if (options.throwAnimate) throw new Error('Synthetic unsupported animation');
    const animation = {node: this, frames, timing, cancelled: false, cancel() { this.cancelled = true; this.oncancel?.(); }};
    animations.push(animation); return animation;
  };
  w.fetch = (...args) => { requests.push(args); throw new Error('No request allowed'); };
  w.Storage.prototype.setItem = (...args) => writes.push(args);
  w.WeplaceMetrics = {emit: (...args) => events.push(args)};
  w.eval(read('assets/js/experience-motion.js'));
  w.eval(read('assets/js/customer-discovery.js'));
  const click = selector => d.querySelector(selector).click();
  const key = (selector, key) => d.querySelector(selector).dispatchEvent(new w.KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
  const choose = (industry = 'dining', purpose = '0') => { click('button[data-industry="' + industry + '"]'); click('[data-purpose="' + purpose + '"]'); };
  return {dom,w,d,animations,events,writes,requests,media,click,key,choose,close:()=>dom.window.close()};
}

test('rapid before/after changes cancel obsolete frames, keep the last choice and complete once', () => {
  const c = setup(); try {
    c.choose();
    for (const view of ['after','before','after','before','after']) c.click('[data-view="'+view+'"]');
    const wipes = c.animations.filter(a => a.node.className.startsWith('screen-'));
    assert.equal(wipes.length, 5);
    assert.ok(wipes.slice(0,-1).every(a => a.cancelled));
    assert.equal(wipes.at(-1).cancelled, false);
    assert.equal(c.d.querySelector('[data-view="after"]').getAttribute('aria-pressed'), 'true');
    assert.equal(c.d.getElementById('discoveryResult').hidden, false);
    assert.match(c.d.getElementById('comparisonStatus').textContent, /정리 후 예시/);
    assert.equal(c.events.filter(e=>e[0]==='weplace_experience_complete').length, 1);
    c.click('[data-view="after"]'); assert.equal(c.animations.length, 6, 'Repeated active choice must not replay motion.');
    assert.ok(c.animations.every(a=>a.timing.duration<=480 && a.timing.fill==='none'));
    assert.deepEqual(c.writes, []); assert.deepEqual(c.requests, []);
  } finally { c.close(); }
});

test('changing context mid-animation invalidates the old screen, memo and completion meaning', () => {
  const c=setup(); try {
    c.choose(); c.click('[data-view="after"]');
    const old=c.animations.at(-1);
    c.click('button[data-industry="beauty"]');
    assert.equal(old.cancelled,true);
    assert.equal(c.d.getElementById('discoveryResult').hidden,true);
    assert.equal(c.d.getElementById('copyFallback').value,'');
    assert.equal(c.d.querySelectorAll('[data-view]:disabled').length,2);
    c.click('[data-purpose="1"]');
    assert.match(c.d.getElementById('exampleScreen').textContent,/서비스/);
    assert.equal(c.d.querySelector('[data-view="before"]').getAttribute('aria-pressed'),'true');
    assert.equal(c.d.getElementById('exampleScreen').style.minHeight,'');
    assert.equal(c.events.filter(e=>e[0]==='weplace_experience_complete').length,1);
  } finally {c.close();}
});

test('system reduced motion skips animation and a live preference change cancels in-flight motion', () => {
  for (const initial of [true,false]) {
    const c=setup({reduce:initial}); try {
      c.choose();c.click('[data-view="after"]');
      if(initial)assert.equal(c.animations.length,0);else assert.ok(c.animations.length>0);
      c.media.matches=true;c.media.change();
      assert.equal(c.d.documentElement.dataset.motion,'reduced');
      assert.ok(c.animations.every(a=>a.cancelled));
      assert.equal(c.d.querySelector('[data-motion-toggle]').disabled,true);
      const count=c.animations.length;
      c.click('#makingTab-work');c.click('[data-view="before"]');
      assert.equal(c.animations.length,count);
      assert.equal(c.d.getElementById('making-work').hidden,false);
      assert.equal(c.d.querySelector('[data-view="before"]').getAttribute('aria-pressed'),'true');
    } finally {c.close();}
  }
});

test('manual motion reduction is memory-only, cancels active frames and leaves tabs usable', () => {
  const c=setup();try {
    c.choose();c.click('[data-view="after"]');c.click('[data-motion-toggle]');
    assert.ok(c.animations.every(a=>a.cancelled));
    assert.equal(c.w.WeplaceMotion.isReduced(),true);
    const count=c.animations.length;c.click('#makingTab-place');c.click('[data-view="before"]');
    assert.equal(c.animations.length,count);
    assert.equal(c.d.getElementById('making-place').hidden,false);
    c.click('[data-motion-toggle]');c.click('[data-view="after"]');
    assert.equal(c.w.WeplaceMotion.isReduced(),false);assert.ok(c.animations.length>count);
    assert.deepEqual(c.writes,[]);assert.deepEqual(c.requests,[]);
  } finally {c.close();}
});

test('save-data and slow-connection hints select an immediate readable fallback', () => {
  for(const connection of [{saveData:true,effectiveType:'4g'},{effectiveType:'2g'},{effectiveType:'slow-2g'}]) {
    const c=setup({connection});try {
      c.choose();c.click('[data-view="after"]');c.click('#makingTab-work');
      assert.equal(c.animations.length,0);assert.equal(c.d.documentElement.dataset.motion,'reduced');
      assert.equal(c.d.getElementById('making-work').hidden,false);assert.equal(c.d.getElementById('discoveryResult').hidden,false);
    } finally {c.close();}
  }
});

test('missing or failed animation support cannot break core choices or story panels', () => {
  for(const options of [{noAnimate:true},{throwAnimate:true}]) {
    const c=setup(options);try {
      c.choose('cafe','1');c.click('[data-view="after"]');c.click('#makingTab-place');
      assert.equal(c.d.getElementById('discoveryResult').hidden,false);
      assert.equal(c.d.querySelector('#makingTab-place').getAttribute('aria-selected'),'true');
      assert.match(c.d.getElementById('resultNext').textContent,/대표 메뉴/);
    } finally {c.close();}
  }
});

test('keyboard story tabs expose exactly one selected panel and comparison arrows retain button focus', () => {
  const c=setup();try {
    for(const [selector,key,id] of [['#makingTab-before','ArrowLeft','work'],['#makingTab-work','Home','before'],['#makingTab-before','ArrowRight','place'],['#makingTab-place','End','work']]) {
      c.key(selector,key);
      assert.equal(c.d.activeElement.id,'makingTab-'+id);
      assert.equal(c.d.querySelectorAll('[role=tab][aria-selected=true]').length,1);
      assert.equal(c.d.querySelectorAll('[role=tab][tabindex="0"]').length,1);
      assert.deepEqual([...c.d.querySelectorAll('[role=tabpanel]')].filter(p=>!p.hidden).map(p=>p.id),['making-'+id]);
      assert.equal(c.d.getElementById('making-'+id).getAttribute('aria-labelledby'),'makingTab-'+id);
    }
    c.choose();c.key('[data-view="before"]','ArrowRight');
    assert.equal(c.d.activeElement.dataset.view,'after');assert.equal(c.d.getElementById('discoveryResult').hidden,false);
    c.key('[data-view="after"]','Home');assert.equal(c.d.activeElement.dataset.view,'before');
    c.click('#experienceReset');assert.equal(c.d.querySelectorAll('[data-view]:disabled').length,2);
  } finally {c.close();}
});

test('without JavaScript the three scenes and policy/meeting links remain in the readable document', () => {
  const dom=new JSDOM(read('experience/index.html'));try {
    const d=dom.window.document;
    assert.equal(d.getElementById('makingTabs').hidden,true);
    assert.equal(d.querySelectorAll('[data-making-panel]').length,3);
    assert.ok([...d.querySelectorAll('[data-making-panel]')].every(p=>!p.hidden&&!p.hasAttribute('aria-hidden')));
    assert.ok(d.querySelector('a[href="/privacy/"]'));
    assert.ok(d.querySelector('a[href="/meeting/"]'));
    assert.match(d.querySelector('#experience noscript').textContent,/업종별 고객 질문/);
  } finally {dom.window.close();}
});

test('minute refresh does not replay a folder opening and preserves the focused control', async () => {
  const dom=new JSDOM('<weplace-industries></weplace-industries>',{url:'https://preview.example.invalid/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document,plays=[];
  w.fetch=async()=>({ok:true,json:async()=>({industries:[]})});
  w.WeplaceMotion={play:(...args)=>plays.push(args),cancel:()=>{}};
  try {
    w.eval(read('assets/js/industry-folders.js'));await flush();
    const widget=d.querySelector('weplace-industries');
    widget.querySelector('summary').click();await flush();
    assert.equal(plays.length,1);
    widget.querySelector('[data-focus="start-dining"]').focus();
    widget.render({industries:[]});await flush();
    assert.equal(plays.length,1);
    assert.equal(widget.querySelector('details').open,true);
    assert.equal(d.activeElement.dataset.focus,'start-dining');
    widget.render(null,true);await flush();assert.equal(plays.length,1);
  } finally {dom.window.close();}
});
