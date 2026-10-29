// Run with node --test; jsdom 26.x is a test dependency, never shipped to browsers.
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = readFileSync(path.join(root, 'assets/js/industry-folders.js'), 'utf8');
const NOW = Date.parse('2026-10-18T17:03:21.000Z'); // 2026-10-19 in Seoul.
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const row = overrides => ({industry: '요식업', count: 0, managedCount: 2, capacity: 5, remaining: 3,
  capacityReviewedAt: '2026-10-18T08:00:00.000Z', activeUntil: '2026-10-31', updates: [], ...overrides});
const payload = rows => ({industries: rows, updatedAt: '2026-10-18T08:00:00.000Z'});
async function setup(data, options = {}) {
  const dom = new JSDOM('<main><section id="experience"></section><weplace-industries></weplace-industries></main>', {
    url: options.url || 'https://withweplace.kr/experience/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  let now = options.now || NOW;
  const RealDate = Date;
  dom.window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  const timeouts = new Map(), intervals = new Map(), requests = [];
  let timerId = 0;
  dom.window.setTimeout = (fn, ms) => { timeouts.set(++timerId, {fn, ms}); return timerId; };
  dom.window.clearTimeout = id => timeouts.delete(id);
  dom.window.setInterval = (fn, ms) => { intervals.set(++timerId, {fn, ms}); return timerId; };
  dom.window.clearInterval = id => intervals.delete(id);
  dom.window.AbortController = globalThis.AbortController;
  dom.window.fetch = options.fetch || (async (url, init) => { requests.push({url, init}); return {ok: true, json: async () => data}; });
  dom.window.eval(source);
  await flush();
  return {dom, doc: dom.window.document, widget: dom.window.document.querySelector('weplace-industries'), requests, timeouts, intervals,
    setNow: value => { now = value; }, close: () => dom.window.close()};
}

test('four sectors and distinct local illustrations stay present for empty, partial and unknown feeds', async () => {
  for (const rows of [[], [row()], [row({industry: 'UNREVIEWED INDUSTRY', privatePhone: 'secret'})]]) {
    const ctx = await setup(payload(rows));
    try {
      assert.deepEqual([...ctx.doc.querySelectorAll('h3')].map(n => n.textContent), ['요식업','카페','숙박','뷰티']);
      assert.equal(ctx.doc.querySelectorAll('.wp-folder-question').length, 4);
      const images = [...ctx.doc.querySelectorAll('.wp-folder-image img')].map(n => n.getAttribute('src'));
      assert.equal(new Set(images).size, 4);
      images.forEach(src => assert.ok(existsSync(path.join(root, src))));
      assert.doesNotMatch(ctx.doc.body.textContent, /UNREVIEWED|secret|관리 현황 확인 중/);
      assert.equal(ctx.doc.querySelectorAll('.wp-folder-image figcaption').length, 4);
    } finally { ctx.close(); }
  }
});

test('anonymous GET uses original proxy, omit credentials and no-store; raw unexpected fields never render', async () => {
  const ctx = await setup(payload([row({phone:'PRIVATE_PHONE', approvalNote:'PRIVATE_NOTE', accountId:'PRIVATE_ID'})]));
  try {
    assert.equal(ctx.requests[0].url, '/api/weplace-industries');
    assert.equal(ctx.requests[0].init.method, 'GET');
    assert.equal(ctx.requests[0].init.credentials, 'omit');
    assert.equal(ctx.requests[0].init.cache, 'no-store');
    assert.equal(ctx.requests[0].init.body, undefined);
    assert.match(ctx.doc.body.textContent, /현재 관리 2곳/);
    assert.match(ctx.doc.body.textContent, /관리 한도 5곳 · 잔여 3곳/);
    assert.doesNotMatch(ctx.doc.body.textContent, /PRIVATE_/);
    assert.equal(ctx.doc.querySelector('summary .wp-folder-metrics'), null);
  } finally { ctx.close(); }
});

test('approval metadata is required and expired, malformed or inconsistent numbers fail closed', async () => {
  const invalid = [
    {activeUntil:'2026-10-18'}, {activeUntil:'2026-02-30'}, {activeUntil:null},
    {capacityReviewedAt:null}, {capacityReviewedAt:'not-a-date'},
    {capacityReviewedAt:'2026-02-30T00:00:00.000Z'}, {capacityReviewedAt:'2026-10-20T00:00:00.000Z'},
    {managedCount:-1}, {managedCount:'2'}, {managedCount:1.5}, {capacity:1001},
    {remaining:4}, {remaining:-1}, {remaining:null}, {capacity:null}, {managedCount:Number.MAX_SAFE_INTEGER+1}
  ];
  const ctx = await setup(payload([]));
  try {
    for (const bad of invalid) {
      ctx.widget.render(payload([row(bad)]));
      assert.equal(ctx.doc.querySelector('.wp-folder-metrics'), null, JSON.stringify(bad));
      assert.equal(ctx.doc.querySelectorAll('.wp-folder').length, 4);
    }
  } finally { ctx.close(); }
});

test('null capacity and zero remaining remain distinct; over-capacity cannot imply availability', async () => {
  const ctx = await setup(payload([row({capacity:null,remaining:null})]));
  try {
    assert.match(ctx.widget.textContent, /현재 관리 2곳/);
    assert.doesNotMatch(ctx.widget.textContent, /잔여|관리 한도/);
    ctx.widget.render(payload([row({capacity:2,remaining:0})]));
    assert.match(ctx.widget.textContent, /잔여 0곳/);
    assert.match(ctx.widget.textContent, /신규 착수 일정은 상담으로 확인/);
    ctx.widget.render(payload([row({managedCount:8,capacity:5,remaining:0})]));
    assert.match(ctx.widget.textContent, /현재 관리 8곳/);
    assert.match(ctx.widget.textContent, /잔여 0곳/);
  } finally { ctx.close(); }
});

test('duplicate known sector records are ambiguous and show no metrics or records', async () => {
  const ctx = await setup(payload([row(),row({managedCount:1,remaining:4})]));
  try { assert.equal(ctx.doc.querySelector('.wp-folder-metrics'), null); assert.equal(ctx.doc.querySelectorAll('.wp-folder').length,4); }
  finally { ctx.close(); }
});

test('approved description projection stays plain text and keeps independent approval from capacity', async () => {
  const ctx = await setup(payload([row({managedCount:null,capacity:null,remaining:null,capacityReviewedAt:null,activeUntil:null,count:1,
    updates:[{summary:'<img src=x onerror=alert(1)>',updatedAt:'2026-10-18T08:00:00.000Z',privateNote:'PRIVATE_UPDATE'}]})]));
  try {
    assert.equal(ctx.doc.querySelectorAll('.wp-folder-update').length,1);
    assert.match(ctx.widget.textContent, /<img src=x onerror=alert\(1\)>/);
    assert.equal(ctx.doc.querySelector('[onerror]'),null);
    assert.doesNotMatch(ctx.widget.textContent,/PRIVATE_UPDATE/);
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
    for (const bad of [{count:0,updates:[{summary:'bad',updatedAt:'2026-10-18T08:00:00.000Z'}]}, {count:1,updates:[{summary:'bad',updatedAt:'bad'}]}, {count:1,updates:[{summary:{html:'bad'},updatedAt:'2026-10-18T08:00:00.000Z'}]}]) {
      ctx.widget.render(payload([row(bad)]));
      assert.equal(ctx.doc.querySelector('.wp-folder-update'),null);
    }
  } finally { ctx.close(); }
});

test('refresh preserves open sector and keyboard focus; failed read removes previous public metrics', async () => {
  const ctx = await setup(payload([row()]));
  try {
    ctx.doc.querySelector('[data-industry="dining"]').open = true;
    ctx.doc.querySelector('[data-focus="start-dining"]').focus();
    await ctx.widget.load();
    assert.equal(ctx.doc.querySelector('[data-industry="dining"]').open,true);
    assert.equal(ctx.doc.activeElement.dataset.focus,'start-dining');
    ctx.dom.window.fetch = async () => { throw Error('offline'); };
    await ctx.widget.load();
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
    assert.equal(ctx.doc.querySelector('[data-industry="dining"]').open,true);
    assert.equal(ctx.doc.activeElement.dataset.focus,'start-dining');
    assert.match(ctx.widget.textContent,/공개 기록을 불러오지 못했습니다/);
    assert.ok(ctx.doc.querySelector('.wp-folder-retry'));
  } finally { ctx.close(); }
});

test('malformed, non-OK and invalid JSON responses all fail closed', async () => {
  const ctx = await setup(payload([row()]));
  try {
    for (const response of [{ok:true,json:async()=>({industries:'wrong'})},{ok:false,json:async()=>payload([row()])},{ok:true,json:async()=>{throw Error('invalid json');}}]) {
      ctx.widget.render(payload([row()]));
      ctx.dom.window.fetch=async()=>response;
      await ctx.widget.load();
      assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
      assert.equal(ctx.doc.querySelectorAll('.wp-folder').length,4);
      assert.ok(ctx.doc.querySelector('.wp-folder-retry'));
    }
  } finally { ctx.close(); }
});

test('unanswered refresh and background tabs cannot retain a stale public-data lease', async () => {
  const ctx = await setup(payload([row()]));
  try {
    assert.equal(ctx.intervals.values().next().value.ms,60000);
    const lease=[...ctx.timeouts.values()].find(timer=>timer.ms===60000);
    assert.ok(lease);
    ctx.dom.window.fetch=()=>new Promise(()=>{});
    void ctx.widget.load();
    lease.fn();
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
    ctx.widget.render(payload([row()]));
    Object.defineProperty(ctx.doc,'hidden',{configurable:true,value:true});
    [...ctx.intervals.values()][0].fn();
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
  } finally { ctx.close(); }
});

test('Seoul midnight removes approved counts before the ordinary minute refresh', async () => {
  const midnight=Date.parse('2026-10-19T15:00:00.000Z');
  const ctx=await setup(payload([row({activeUntil:'2026-10-19'})]),{now:midnight-1000});
  try {
    const lease=[...ctx.timeouts.values()].find(timer=>timer.ms===1000);
    assert.ok(lease);
    ctx.setNow(midnight);
    lease.fn();
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
    ctx.widget.render(payload([row({activeUntil:'2026-10-19'})]));
    assert.equal(ctx.doc.querySelector('.wp-folder-metrics'),null);
  } finally { ctx.close(); }
});

test('a delayed older response cannot overwrite the current response', async () => {
  let first;
  const ctx=await setup(null,{fetch:()=>new Promise(resolve=>{first=resolve;})});
  try {
    ctx.dom.window.fetch=async()=>({ok:true,json:async()=>payload([row({managedCount:4,remaining:1})])});
    await ctx.widget.load();
    first({ok:true,json:async()=>payload([row()])});
    await flush();
    assert.match(ctx.widget.textContent,/현재 관리 4곳/);
    assert.doesNotMatch(ctx.widget.textContent,/현재 관리 2곳/);
  } finally { ctx.close(); }
});

test('home sector link emits the allowlisted event and optional metric; no personal data is stored', async () => {
  const ctx=await setup(payload([]));
  try {
    const events=[],metrics=[];
    ctx.doc.addEventListener('weplace:industry',event=>events.push(event.detail));
    ctx.dom.window.WeplaceMetrics={emit:(name,detail)=>metrics.push({name,detail})};
    const start=ctx.doc.querySelector('[data-focus="start-cafe"]');
    assert.equal(start.getAttribute('href'),'/experience/#experience');
    start.click();
    assert.equal(events[0].industry,'cafe');
    assert.deepEqual(Object.keys(events[0]),['industry']);
    assert.equal(metrics[0].name,'industry_experience_start');
    assert.equal(metrics[0].detail.industry,'cafe');
    assert.equal(ctx.dom.window.location.hash,'#experience');
    assert.equal(ctx.dom.window.localStorage.length,0);
    assert.equal(ctx.dom.window.sessionStorage.length,0);
    assert.equal(ctx.doc.cookie,'');
    ctx.dom.window.WeplaceMetrics={emit:()=>{throw Error('disabled');}};
    assert.doesNotThrow(()=>start.click());
  } finally {ctx.close();}
});

test('non-home sectors use explicit public query links; modified clicks do not hijack navigation', async () => {
  const ctx=await setup(payload([]),{url:'https://withweplace.kr/industries/stay.html'});
  try {
    assert.equal(ctx.doc.querySelector('[data-focus="start-stay"]').getAttribute('href'),'/experience/?industry=stay#experience');
    let called=false;
    ctx.doc.addEventListener('weplace:industry',()=>{called=true;});
    const event=new ctx.dom.window.MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true});
    ctx.doc.querySelector('[data-focus="start-stay"]').dispatchEvent(event);
    assert.equal(called,false);
    assert.equal(event.defaultPrevented,false);
  } finally {ctx.close();}
});

test('portal help has no collection or automatic login; actual client/team paths stay intact', () => {
  const html=readFileSync(path.join(root,'my-store/index.html'),'utf8');
  const dom=new JSDOM(html,{url:'https://withweplace.kr/my-store/'});
  try {
    assert.equal(dom.window.document.querySelector('form,input,textarea,script'),null);
    assert.ok(dom.window.document.querySelector('a[href="/client"]'));
    assert.ok(dom.window.document.querySelector('a[href="/team"]'));
    assert.match(dom.window.document.body.textContent,/연결 코드는 24시간/);
    assert.match(dom.window.document.body.textContent,/전에 보이던 매장이 사라졌어요/);
    assert.match(dom.window.document.body.textContent,/로그인이 풀렸거나/);
    assert.match(dom.window.document.body.textContent,/자동 생성되지는 않습니다/);
    const redirects=readFileSync(path.join(root,'_redirects'),'utf8');
    assert.match(redirects,/^\/client\s+https:\/\/flow\.withweplace\.kr\/client\s+302/m);
    assert.match(redirects,/^\/team\s+https:\/\/flow\.withweplace\.kr\/\s+302/m);
  } finally {dom.window.close();}
});
