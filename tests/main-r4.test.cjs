// R4 integration contracts. JSDOM simulates media/layout only for lifecycle tests;
// rendered geometry, real frame timing and accessibility remain browser checks.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const sources = {
  legacy: fs.readFileSync('assets/js/main-landing-r2.js', 'utf8'),
  demo: fs.readFileSync('assets/js/spatial-demo.js', 'utf8'),
  motion: fs.readFileSync('assets/js/main-landing-r4.js', 'utf8'),
  gsap: fs.readFileSync('assets/vendor/gsap/gsap.min.js', 'utf8'),
  scroll: fs.readFileSync('assets/vendor/gsap/ScrollTrigger.min.js', 'utf8')
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function setup({ run = true, vendor = true, width = 1440, reduced = false } = {}) {
  const errors = [], network = [], writes = [], waapi = [], media = new Map(), listeners = new Map();
  const console = new VirtualConsole(); console.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { url: 'https://preview.example.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console });
  const w = dom.window, d = w.document;
  const mediaState = { width, reduced };
  Object.defineProperty(w, 'innerWidth', { get: () => mediaState.width, configurable: true });
  Object.defineProperty(w, 'innerHeight', { value: 900, configurable: true });
  w.scrollTo = () => {};
  w.fetch = (...args) => { network.push(args); throw Error('Unexpected network access'); };
  w.Storage.prototype.setItem = (...args) => writes.push(args);
  w.navigator.sendBeacon = (...args) => { network.push(args); return false; };
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
  const matches = query => {
    if (query.includes('prefers-reduced-motion')) return mediaState.reduced;
    if (/hover|pointer/.test(query)) return false;
    const min = /min-width:\s*(\d+)px/.exec(query), max = /max-width:\s*(\d+)px/.exec(query);
    return Boolean(min || max) && (!min || mediaState.width >= Number(min[1])) && (!max || mediaState.width <= Number(max[1]));
  };
  w.matchMedia = query => {
    if (!media.has(query)) {
      const callbacks = new Set();
      media.set(query, { media: query, matches: matches(query), callbacks, addEventListener: (_name, fn) => callbacks.add(fn), removeEventListener: (_name, fn) => callbacks.delete(fn), addListener: fn => callbacks.add(fn), removeListener: fn => callbacks.delete(fn) });
    }
    return media.get(query);
  };
  w.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true }]); }
    unobserve() {} disconnect() {}
  };
  w.HTMLElement.prototype.animate = function () {
    waapi.push(this);
    let finish;
    return { finished: new Promise(resolve => { finish = resolve; }), finish() { finish(); }, cancel() { finish(); } };
  };
  // Give the actual GSAP/ScrollTrigger code deterministic non-zero boxes. These
  // are not used as evidence of real responsive layout or paint performance.
  w.HTMLElement.prototype.getBoundingClientRect = function () { return { x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 300, width: 600, height: 300, toJSON() { return this; } }; };
  w.SVGElement.prototype.getTotalLength = () => 300;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  const add = d.addEventListener.bind(d), remove = d.removeEventListener.bind(d);
  d.addEventListener = (type, listener, options) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(listener); add(type, listener, options); };
  d.removeEventListener = (type, listener, options) => { listeners.get(type)?.delete(listener); remove(type, listener, options); };
  if (run) {
    if (vendor) { w.eval(sources.gsap); w.eval(sources.scroll); }
    w.eval(sources.legacy); w.eval(sources.demo); w.eval(sources.motion);
  }
  const setMedia = async next => {
    Object.assign(mediaState, next);
    const changed = [];
    for (const item of media.values()) {
      const value = matches(item.media);
      if (value !== item.matches) { item.matches = value; changed.push(item); }
    }
    // Browser MediaQueryLists all reflect the new viewport before change events.
    for (const item of changed) for (const callback of [...item.callbacks]) callback({ matches: item.matches, media: item.media });
    await delay(45);
  };
  const close = () => {
    w.dispatchEvent(new w.Event('pagehide'));
    w.ScrollTrigger?.killAll(); w.gsap?.globalTimeline.clear(); w.gsap?.ticker.sleep();
    dom.window.close();
  };
  return { w, d, errors, network, writes, waapi, listeners, setMedia, close };
}
const click = (ctx, selector) => { const node = ctx.d.querySelector(selector); assert.ok(node, selector); node.click(); return node; };
const ownedAnimations = ctx => ctx.waapi.filter(element => element.closest('[data-motion-owner="gsap"]'));
const r4Timelines = ctx => ctx.w.gsap.globalTimeline.getChildren(true, true, true).filter(animation => /^weplace-r4-/.test(animation.vars.id || ''));
const sendReduced = (ctx, reduced) => ctx.w.dispatchEvent(new ctx.w.MessageEvent('message', { source: ctx.w.parent, data: { type: 'weplace-motion', reduced } }));

test('R4 preserves complete protected legal, routing, build, BI and original-media bytes', () => {
  const baseline = JSON.parse(fs.readFileSync('docs/r4-spatial/protected-baseline.json', 'utf8'));
  for (const item of baseline.protected_files) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.path)).digest('hex'), item.sha256, item.path);
  }
});

test('the observed charts keep a zero baseline and linear scales matching the disclosed source values', () => {
  const ctx = setup({ run: false });
  try {
    const cases = [
      ['#intro .chart', [1.72, 1.93], 95],
      ['[data-category="dining"] .chart', [1.72, 1.93], 95],
      ['[data-category="wellness"] .chart', [877, 1137, 2002, 2350], .076]
    ];
    for (const [selector, values, scale] of cases) {
      const chart = ctx.d.querySelector(selector), bars = [...chart.querySelectorAll('rect.bar-before,rect.bar-after')];
      assert.equal(bars.length, values.length);
      bars.forEach((bar, i) => { const y = Number(bar.getAttribute('y')), height = Number(bar.getAttribute('height')); assert.ok(Math.abs(y + height - 230) < .00001); assert.ok(Math.abs(height - values[i] * scale) < .00001); });
      assert.match(chart.textContent, /0/);
    }
    assert.match(ctx.d.querySelector('.proof-foot').textContent, /매출 기여도는 분리되지/);
    assert.match(ctx.d.querySelector('.evidence-note').textContent, /방문객 수·예약 수·매출과 다른 지표/);
    assert.doesNotMatch(ctx.d.body.textContent, /30만원 상당|선착순 \d|3주 만에|매출 15%/);
  } finally { ctx.close(); }
});

test('without any JavaScript, every Store C answer and the full FLOW role explanation exists as accessible HTML', () => {
  const ctx = setup({ run: false });
  try {
    const answers = [...ctx.d.querySelectorAll('[data-store-answer]')];
    assert.equal(answers.length, 3);
    assert.ok(answers.every(answer => !answer.hidden && answer.textContent.trim().length > 20));
    const comparison = ctx.d.querySelector('details.static-comparison');
    assert.match(comparison.textContent, /정리 전/); assert.match(comparison.textContent, /정리 후/);
    assert.equal(ctx.d.querySelectorAll('[data-flow-layer]').length, 3);
    assert.match(ctx.d.querySelector('.flow-static-states').textContent, /검수/);
    assert.match(ctx.d.querySelector('.flow-static-states').textContent, /대표/);
    const summary = ctx.d.getElementById('sample-cta');
    assert.equal(summary.tagName, 'SUMMARY'); assert.equal(summary.parentElement.tagName, 'DETAILS');
    assert.match(ctx.d.querySelector('.store-booking-plane').textContent, /실제 예약 불가/);
    assert.equal(ctx.d.getElementById('request-fields').disabled, true);
    assert.ok(ctx.d.querySelector('.manual-contact a[href="https://pf.kakao.com/_mxbexhX"]'));
  } finally { ctx.close(); }
});

test('missing GSAP leaves functional questions, tabs, source evidence and manual request preparation intact', () => {
  const ctx = setup({ vendor: false });
  try {
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'static');
    click(ctx, '[data-change="before"]'); assert.equal(ctx.d.getElementById('change-panel').dataset.storeState, 'before');
    click(ctx, '[data-change="after"]'); click(ctx, '[data-store-question="terms"]');
    assert.equal(ctx.d.querySelectorAll('[data-store-question][aria-pressed="true"]').length, 1);
    assert.equal(ctx.d.getElementById('store-answer-terms').hidden, false);
    click(ctx, '[data-flow="review"]'); assert.match(ctx.d.getElementById('flow-task-title').textContent, /대표님/);
    ctx.d.getElementById('shop-url').value = 'https://example.invalid/R4_QA_ONLY';
    ctx.d.getElementById('request-form').dispatchEvent(new ctx.w.Event('submit', { bubbles: true, cancelable: true }));
    assert.match(ctx.d.getElementById('form-status').textContent, /아직 전송되지/);
    assert.deepEqual(ctx.network, []); assert.deepEqual(ctx.writes, []); assert.deepEqual(ownedAnimations(ctx), []);
    assert.deepEqual(ctx.errors, []);
  } finally { ctx.close(); }
});

test('question keyboard selection exposes one complete answer and resets an open explanation on Before/After change', () => {
  const ctx = setup({ vendor: false });
  try {
    const first = ctx.d.querySelector('[data-store-question="care"]');
    first.focus(); first.dispatchEvent(new ctx.w.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    assert.equal(ctx.d.activeElement.dataset.storeQuestion, 'booking');
    assert.equal(ctx.d.querySelectorAll('[data-store-answer]:not([hidden])').length, 1);
    assert.equal(ctx.d.getElementById('store-answer-booking').hidden, false);
    const disclosure = ctx.d.querySelector('.store-booking-explainer'); disclosure.open = true;
    click(ctx, '[data-change="before"]');
    assert.equal(disclosure.open, false);
    click(ctx, '[data-change="after"]');
    assert.equal(ctx.d.querySelector('[data-store-question][aria-pressed="true"]').dataset.storeQuestion, 'care');
    assert.deepEqual(ctx.network, []); assert.deepEqual(ctx.writes, []);
  } finally { ctx.close(); }
});

test('real GSAP owns the signature layers without any overlapping legacy WAAPI animation', () => {
  const ctx = setup();
  try {
    assert.equal(ctx.w.gsap.version, '3.13.0');
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'desktop');
    click(ctx, '[data-change="before"]'); click(ctx, '[data-flow="review"]');
    assert.deepEqual(ownedAnimations(ctx), []);
    assert.ok(ctx.waapi.length > 0, 'the unowned supporting sections still use their existing motion');
    assert.equal(ctx.d.querySelector('h1').getAttribute('style'), null);
    assert.deepEqual(ctx.network, []); assert.deepEqual(ctx.writes, []); assert.deepEqual(ctx.errors, []);
  } finally { ctx.close(); }
});

test('100 rapid switches reuse timelines and listeners while content, selected controls and focus stay current', () => {
  const ctx = setup();
  try {
    const initial = r4Timelines(ctx).length;
    assert.ok(initial >= 2);
    const listenerCount = ctx.listeners.get('weplace:tabchange')?.size;
    const questionListenerCount = ctx.listeners.get('weplace:storequestion')?.size;
    for (let i = 0; i < 100; i++) { click(ctx, `[data-change="${i % 2 ? 'after' : 'before'}"]`); click(ctx, `[data-flow="${['work', 'review', 'next'][i % 3]}"]`); click(ctx, `[data-store-question="${['care', 'terms', 'booking'][i % 3]}"]`); }
    assert.equal(r4Timelines(ctx).length, initial);
    assert.equal(ctx.listeners.get('weplace:tabchange')?.size, listenerCount);
    assert.equal(ctx.listeners.get('weplace:storequestion')?.size, questionListenerCount);
    assert.equal(ctx.d.querySelector('[data-change][aria-selected="true"]').dataset.change, 'after');
    assert.equal(ctx.d.querySelector('[data-flow][aria-selected="true"]').dataset.flow, 'work');
    const last = ctx.d.querySelector('[data-flow="next"]');
    last.dispatchEvent(new ctx.w.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    assert.equal(ctx.d.activeElement.id, 'flow-work');
    assert.equal(ctx.d.getElementById('flow-panel').getAttribute('aria-labelledby'), 'flow-work');
    assert.deepEqual(ownedAnimations(ctx), []);
  } finally { ctx.close(); }
});

test('native reduced motion creates no R4 timeline and preserves all control behavior', () => {
  const ctx = setup({ reduced: true });
  try {
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'reduced');
    assert.equal(r4Timelines(ctx).length, 0); assert.equal(ctx.waapi.length, 0);
    click(ctx, '[data-flow="next"]'); click(ctx, '[data-change="before"]');
    assert.equal(ctx.d.querySelector('.flow-board').dataset.flowState, 'next');
    assert.equal(ctx.d.getElementById('change-panel').dataset.storeState, 'before');
    assert.equal(ctx.d.getElementById('request-fields').disabled, false);
  } finally { ctx.close(); }
});

test('media changes and bfcache lifecycle clean up GSAP without resetting the selected user state', async () => {
  const ctx = setup();
  try {
    click(ctx, '[data-flow="review"]'); click(ctx, '[data-change="before"]');
    await ctx.setMedia({ width: 390 });
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'mobile');
    assert.equal(ctx.d.querySelector('.flow-board').dataset.flowState, 'review');
    assert.equal(ctx.d.getElementById('change-panel').dataset.storeState, 'before');
    assert.equal(ctx.listeners.get('weplace:tabchange')?.size, 1);
    await ctx.setMedia({ reduced: true });
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'reduced'); assert.equal(r4Timelines(ctx).length, 0);
    await ctx.setMedia({ reduced: false, width: 1440 });
    assert.equal(ctx.d.documentElement.dataset.r4Motion, 'desktop');
    sendReduced(ctx, true); assert.equal(r4Timelines(ctx).length, 0);
    assert.equal(ctx.listeners.get('weplace:tabchange')?.size, 0);
    assert.equal(ctx.listeners.get('weplace:storequestion')?.size, 0);
    sendReduced(ctx, false); assert.equal(ctx.listeners.get('weplace:tabchange')?.size, 1);
    ctx.w.dispatchEvent(new ctx.w.Event('pagehide')); assert.equal(r4Timelines(ctx).length, 0);
    assert.equal(ctx.listeners.get('weplace:storequestion')?.size, 0);
    const show = new ctx.w.Event('pageshow'); Object.defineProperty(show, 'persisted', { value: true }); ctx.w.dispatchEvent(show);
    assert.equal(ctx.listeners.get('weplace:tabchange')?.size, 1);
    assert.equal(ctx.listeners.get('weplace:storequestion')?.size, 1);
    assert.equal(ctx.d.querySelector('.flow-board').dataset.flowState, 'review');
    assert.equal(ctx.d.getElementById('change-panel').dataset.storeState, 'before');
    assert.deepEqual(ownedAnimations(ctx), []); assert.deepEqual(ctx.errors, []);
  } finally { ctx.close(); }
});
