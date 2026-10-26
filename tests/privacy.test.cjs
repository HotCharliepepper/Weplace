/* Instrumented DOM privacy checks; external endpoints are never contacted. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const sentinel = 'PRIVATE_QA_SENTINEL_01000000000';

function instrument(folder, origin = 'https://withweplace.kr') {
  const dom = new JSDOM(fs.readFileSync(path.join(root, folder, 'index.html'), 'utf8'), {
    url: `${origin}/${folder}${folder ? '/' : ''}?industry=cafe&phone=${sentinel}&answers=${sentinel}#${sentinel}`,
    runScripts: 'outside-only'
  });
  const w = dom.window, calls = [];
  const capture = kind => (...args) => { calls.push({kind, args}); };
  w.fetch = capture('fetch');
  w.XMLHttpRequest.prototype.open = capture('xhr-open');
  w.XMLHttpRequest.prototype.send = capture('xhr-send');
  Object.defineProperty(w.navigator, 'sendBeacon', {value: capture('beacon')});
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async () => {}}});
  w.gtag = capture('gtag');
  w.Storage.prototype.setItem = capture('storage-set');
  w.Storage.prototype.removeItem = capture('storage-remove');
  w.Storage.prototype.clear = capture('storage-clear');
  Object.defineProperty(w.document, 'cookie', {get: () => '', set: capture('cookie-set')});
  w.console.log = capture('console-log');
  w.console.info = capture('console-info');
  w.console.warn = capture('console-warn');
  w.console.error = capture('console-error');
  w.open = capture('window-open');
  return {dom, w, d: w.document, calls};
}
function change(p, input, value = true) {
  const element = p.d.querySelector(input);
  if (element.type === 'radio' || element.type === 'checkbox') element.checked = value;
  else element.value = value;
  element.dispatchEvent(new p.w.Event('change', {bubbles: true}));
}

test('homepage preview collects no analytics or storage and never copies arbitrary URL data', async () => {
  const p = instrument('', 'https://deploy-preview.example.invalid');
  p.w.eval(fs.readFileSync(path.join(root, 'assets/js/site-metrics.js'), 'utf8'));
  p.w.eval(fs.readFileSync(path.join(root, 'assets/js/customer-discovery.js'), 'utf8'));
  for (const sector of ['dining', 'cafe', 'stay', 'beauty']) {
    p.d.querySelector(`[data-industry=${sector}]`).click();
    for (const purpose of ['0', '1']) {
      p.d.querySelector(`[data-purpose="${purpose}"]`).click();
      p.d.querySelector('[data-view=after]').click();
    }
  }
  p.d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.equal(p.w.WeplaceMetrics.enabled, false);
  assert.equal(p.w.WeplaceMetrics.expandedEventsApproved, false);
  assert.equal(p.d.querySelectorAll('script[src*="googletagmanager"]').length, 0);
  assert.equal(p.w.dataLayer, undefined);
  assert.deepEqual(p.calls, []);
  assert.doesNotMatch(p.d.getElementById('copyFallback').value, new RegExp(sentinel));
  for (const a of p.d.querySelectorAll('a[href]:not([href^="#"])')) assert.ok(!a.href.includes(sentinel), a.href);
  p.dom.window.close();
});

test('production analytics preserves the fixed ID but queues only safe existing events and sanitized metadata', () => {
  const p = instrument('');
  p.w.eval(fs.readFileSync(path.join(root, 'assets/js/site-metrics.js'), 'utf8'));
  assert.equal(p.w.WeplaceMetrics.enabled, true);
  assert.equal(p.w.WeplaceMetrics.expandedEventsApproved, false);
  assert.equal(p.d.querySelector('script[src*="googletagmanager"]').src, 'https://www.googletagmanager.com/gtag/js?id=G-H9B5F4HRDS');
  assert.equal(p.w.dataLayer.length, 3);
  const config = p.w.dataLayer[1][2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.page_location, 'https://withweplace.kr/');
  assert.equal(config.page_referrer, '');
  assert.equal(p.w.WeplaceMetrics.emit('weplace_experience_select', {industry: 'cafe', placement: 'experience', phone: sentinel, answers: sentinel, purpose: sentinel}), true);
  const payload = p.w.dataLayer.at(-1)[2];
  assert.deepEqual(Object.keys(payload).sort(), ['industry', 'page_location', 'page_referrer', 'placement', 'send_to']);
  assert.equal(payload.industry, 'cafe');
  const n = p.w.dataLayer.length;
  for (const event of ['weplace_industry_select', 'weplace_experience_complete', 'weplace_diagnosis_start', 'weplace_diagnosis_complete', 'weplace_meeting_interest_click', 'weplace_portal_entry_click', sentinel]) {
    assert.equal(p.w.WeplaceMetrics.emit(event, {industry: 'cafe'}), false, event);
  }
  assert.equal(p.w.dataLayer.length, n);
  p.w.WeplaceMetrics.emit('weplace_consult_click', {industry: sentinel, placement: sentinel});
  assert.equal(p.w.dataLayer.at(-1)[2].industry, undefined);
  assert.equal(p.w.dataLayer.at(-1)[2].placement, undefined);
  assert.doesNotMatch(JSON.stringify(p.w.dataLayer), new RegExp(sentinel));
  assert.deepEqual(p.calls, []);
  p.dom.window.close();
});

test('metrics accidental inclusion is inert on check, meeting and review routes', () => {
  for (const route of ['/check/', '/check/index.html', '/meeting/', '/review/audience.html', '/review/integration.html']) {
    const p = instrument('');
    p.dom.reconfigure({url: 'https://withweplace.kr' + route + '?phone=' + sentinel});
    p.w.eval(fs.readFileSync(path.join(root, 'assets/js/site-metrics.js'), 'utf8'));
    assert.equal(p.w.WeplaceMetrics.enabled, false, route);
    assert.equal(p.w.WeplaceMetrics.emit('weplace_consult_click', {placement: 'kakao_contact'}), false);
    assert.equal(p.w.dataLayer, undefined);
    assert.equal(p.d.querySelectorAll('script[src*="googletagmanager"]').length, 0);
    assert.deepEqual(p.calls, []);
    p.dom.window.close();
  }
});

test('six-answer check neither persists nor transmits during every choice, submit and edit', () => {
  const p = instrument('check');
  p.w.eval(fs.readFileSync(path.join(root, 'assets/js/store-check.js'), 'utf8'));
  assert.equal(p.d.querySelectorAll('input:checked').length, 0);
  for (const choice of ['yes', 'unknown', 'no', 'part']) {
    for (let i = 0; i < 6; i++) change(p, `input[name=q${i}][value=${choice}]`);
    p.d.getElementById('storeCheck').dispatchEvent(new p.w.Event('submit', {bubbles: true, cancelable: true}));
    p.d.getElementById('editAnswers').click();
  }
  assert.deepEqual(p.calls, []);
  assert.doesNotMatch(p.d.getElementById('resultText').value, new RegExp(sentinel));
  assert.equal(p.d.querySelectorAll('script[src*="google"],script[src*="analytics"]').length, 0);
  for (const a of p.d.querySelectorAll('a[href]:not([href^="#"])')) assert.ok(!a.href.includes(sentinel), a.href);
  p.dom.window.close();
  const fresh = instrument('check');
  fresh.w.eval(fs.readFileSync(path.join(root, 'assets/js/store-check.js'), 'utf8'));
  assert.equal(fresh.d.querySelectorAll('input:checked').length, 0);
  assert.equal(fresh.d.getElementById('result').hidden, true);
  fresh.dom.window.close();
});

test('meeting choices do not become CRM intake, an actual reservation, payment, or tracking', async () => {
  const p = instrument('meeting');
  p.w.eval(fs.readFileSync(path.join(root, 'assets/js/meeting.js'), 'utf8'));
  for (const input of p.d.querySelectorAll('input')) {
    input.checked = true;
    input.dispatchEvent(new p.w.Event('change', {bubbles: true}));
  }
  for (const value of ['dining', 'cafe', 'stay', 'beauty', 'other']) change(p, '#meetingIndustry', value);
  p.d.getElementById('copyMeeting').click();
  await new Promise(setImmediate);
  assert.deepEqual(p.calls, []);
  assert.doesNotMatch(p.d.getElementById('meetingSummary').value, new RegExp(sentinel));
  assert.equal(p.d.querySelectorAll('script[src*="google"],script[src*="analytics"]').length, 0);
  for (const a of p.d.querySelectorAll('a[href]:not([href^="#"])')) {
    assert.ok(!a.href.includes(sentinel), a.href);
    assert.doesNotMatch(a.href, /(?:payment|checkout|stripe|toss|kakaopay|paypal)/i);
  }
  p.dom.window.close();
  const fresh = instrument('meeting');
  fresh.w.eval(fs.readFileSync(path.join(root, 'assets/js/meeting.js'), 'utf8'));
  assert.equal(fresh.d.querySelectorAll('input:checked').length, 0);
  fresh.dom.window.close();
});

test('check and meeting direct Kakao links do not carry query data and prevent referrer transfer', () => {
  for (const folder of ['check', 'meeting']) {
    const p = instrument(folder);
    for (const a of p.d.querySelectorAll('a[href*="pf.kakao.com"]')) {
      const destination = new URL(a.href);
      assert.equal(destination.href, 'https://pf.kakao.com/_mxbexhX');
      if (a.target === '_blank') assert.ok(a.relList.contains('noreferrer'), `${folder}: ${a.outerHTML}`);
    }
    p.dom.window.close();
  }
});
