/* DOM/logic tests only. JSDOM does not establish rendered browser or responsive QA. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');

function page(name, query = '') {
  const dom = new JSDOM(fs.readFileSync(path.join(root, name, 'index.html'), 'utf8'), {
    url: `https://withweplace.kr/${name}/${query}`, runScripts: 'outside-only'
  });
  const w = dom.window;
  const copied = [], downloads = [], blobs = [], revoked = [];
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async text => copied.push(text)}});
  w.URL.createObjectURL = blob => { blobs.push(blob); return 'blob:test-download'; };
  w.URL.revokeObjectURL = url => revoked.push(url);
  w.HTMLAnchorElement.prototype.click = function() { downloads.push({href: this.href, name: this.download}); };
  w.setTimeout = callback => { callback(); return 1; };
  let prints = 0;
  w.print = () => { prints++; };
  const source = name === 'check' ? 'store-check.js' : 'meeting.js';
  w.eval(fs.readFileSync(path.join(root, 'assets/js', source), 'utf8'));
  return {dom, w, d: w.document, copied, downloads, blobs, revoked, get prints() { return prints; }};
}
function change(p, selector, value) {
  const element = p.d.querySelector(selector);
  assert.ok(element, selector);
  if (element.type === 'radio' || element.type === 'checkbox') element.checked = value ?? true;
  else element.value = value;
  element.dispatchEvent(new p.w.Event('change', {bubbles: true}));
  return element;
}
function answer(p, values, industry = 'dining') {
  change(p, '#industry', industry);
  values.forEach((value, i) => { if (value) change(p, `input[name=q${i}][value=${value}]`); });
}
function submit(p) { p.d.getElementById('storeCheck').dispatchEvent(new p.w.Event('submit', {bubbles: true, cancelable: true})); }

function home(query = '') {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'experience/index.html'), 'utf8'), {url: 'https://preview.example.invalid/' + query, runScripts: 'outside-only'});
  const w = dom.window, copied = [], downloads = [], revoked = [], scrolled = [];
  w.matchMedia = () => ({matches: true});
  w.HTMLElement.prototype.scrollIntoView = function(options) { scrolled.push({id: this.id, options}); };
  Object.defineProperty(w, 'isSecureContext', {value: true});
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async text => copied.push(text)}, configurable: true});
  w.URL.createObjectURL = () => 'blob:home-summary';
  w.URL.revokeObjectURL = url => revoked.push(url);
  w.HTMLAnchorElement.prototype.click = function() { downloads.push(this.download); };
  w.setTimeout = fn => { fn(); return 1; };
  w.eval(fs.readFileSync(path.join(root, 'assets/js/site-metrics.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'assets/js/customer-discovery.js'), 'utf8'));
  return {dom, w, d: w.document, copied, downloads, revoked, scrolled};
}

test('homepage starts unselected and covers four sectors × two purposes with different before/after examples', () => {
  const p = home(), questions = new Set();
  assert.equal(p.d.querySelectorAll('[data-industry]').length, 4);
  assert.equal(p.d.querySelectorAll('[data-industry][aria-pressed=true]').length, 0);
  assert.equal(p.d.getElementById('purposeGroup').disabled, true);
  assert.equal(p.d.getElementById('discoveryResult').hidden, true);
  for (const sector of ['dining', 'cafe', 'stay', 'beauty']) {
    p.d.querySelector(`[data-industry=${sector}]`).click();
    assert.equal(p.d.querySelectorAll('[data-purpose]').length, 2);
    for (const purpose of ['0', '1']) {
      p.d.querySelector(`[data-purpose="${purpose}"]`).click();
      questions.add(p.d.getElementById('customerQuestion').textContent);
      assert.equal(p.d.getElementById('discoveryResult').hidden, true);
      assert.equal(p.d.querySelector('[data-view=before]').getAttribute('aria-pressed'), 'true');
      assert.ok(p.d.querySelector('#exampleScreen .screen-before'));
      p.d.querySelector('[data-view=before]').click();
      const before = p.d.getElementById('exampleScreen').textContent;
      assert.equal(p.d.querySelectorAll('#exampleScreen .screen-row').length, 3);
      p.d.querySelector('[data-view=after]').click();
      assert.notEqual(p.d.getElementById('exampleScreen').textContent, before);
      assert.match(p.d.getElementById('exampleScreen').textContent, /예시 안내 화면/);
      assert.equal(p.d.getElementById('discoveryResult').hidden, false);
      for (const id of ['resultGood', 'resultCheck', 'resultNext']) assert.ok(p.d.getElementById(id).textContent.length > 15, id);
      for (const a of p.d.querySelectorAll('[data-diagnosis-link]')) assert.equal(a.getAttribute('href'), '/check/?industry=' + sector);
      for (const a of p.d.querySelectorAll('[data-meeting-link]')) assert.equal(a.getAttribute('href'), '/meeting/?industry=' + sector);
    }
  }
  assert.equal(questions.size, 8);
  p.dom.window.close();
});

test('findings and completion appear on after, once per scenario, within three core selections', () => {
  const p = home(), attempted = [];
  p.w.WeplaceMetrics = {emit: (event, params) => attempted.push({event, params})};
  p.d.querySelector('[data-industry=cafe]').click();
  p.d.querySelector('[data-purpose="0"]').click();
  assert.equal(p.d.getElementById('discoveryResult').hidden, true);
  assert.equal(attempted.filter(x => x.event === 'weplace_experience_complete').length, 0);
  p.d.querySelector('[data-view=after]').click();
  assert.equal(p.d.getElementById('discoveryResult').hidden, false);
  assert.equal(attempted.filter(x => x.event === 'weplace_experience_complete').length, 1);
  p.d.querySelector('[data-view=before]').click();
  assert.equal(p.d.getElementById('discoveryResult').hidden, true);
  p.d.querySelector('[data-view=after]').click(); p.d.querySelector('[data-view=after]').click();
  assert.equal(attempted.filter(x => x.event === 'weplace_experience_complete').length, 1);
  p.d.querySelector('[data-purpose="1"]').click(); p.d.querySelector('[data-view=after]').click();
  assert.equal(attempted.filter(x => x.event === 'weplace_experience_complete').length, 2);
  p.dom.window.close();
});

test('homepage reset clears purpose/view, copied fallback, result and outgoing industry context', () => {
  const p = home('?industry=cafe');
  p.d.querySelector('[data-purpose="1"]').click(); p.d.querySelector('[data-view=after]').click();
  p.d.getElementById('experienceReset').click();
  assert.equal(p.d.getElementById('purposeGroup').disabled, true);
  assert.equal(p.d.querySelectorAll('[data-purpose]').length, 0);
  assert.equal(p.d.querySelectorAll('[data-view]:disabled').length, 2);
  assert.equal(p.d.getElementById('discoveryResult').hidden, true);
  assert.equal(p.d.getElementById('copyFallback').hidden, true);
  assert.equal(p.d.getElementById('copyFallback').value, '');
  assert.equal(p.d.activeElement.dataset.industry, 'dining');
  for (const a of p.d.querySelectorAll('[data-diagnosis-link]')) assert.equal(a.getAttribute('href'), '/check/');
  p.dom.window.close();
});

test('homepage summaries are explicit exports with a usable clipboard fallback', async () => {
  const p = home('?industry=cafe');
  p.d.getElementById('copySummary').click(); assert.equal(p.copied.length, 0);
  p.d.querySelector('[data-purpose="0"]').click(); p.d.querySelector('[data-view=after]').click();
  assert.equal(p.copied.length, 0); assert.equal(p.downloads.length, 0);
  p.d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.match(p.copied[0], /업종: 카페/);
  assert.match(p.copied[0], /실제 매장 점검 결과 아님/);
  assert.match(p.copied[0], /상담 신청이 아닙니다/);
  assert.equal(p.d.getElementById('copyFallback').hidden, true);
  Object.defineProperty(p.w.navigator, 'clipboard', {value: undefined, configurable: true});
  p.d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.equal(p.d.getElementById('copyFallback').hidden, false);
  assert.equal(p.d.getElementById('copyFallback').value, p.copied[0]);
  assert.equal(p.d.activeElement.id, 'copyFallback');
  p.d.getElementById('downloadSummary').click();
  assert.equal(p.downloads[0], 'Weplace_Customer_View_cafe.txt');
  assert.equal(p.revoked[0], 'blob:home-summary');
  p.dom.window.close();
});

test('sector custom events focus the experience and honor reduced-motion preference; invalid sectors do nothing', () => {
  const p = home();
  p.d.dispatchEvent(new p.w.CustomEvent('weplace:industry', {detail: {industry: 'cafe'}}));
  assert.equal(p.d.querySelector('[data-industry=cafe]').getAttribute('aria-pressed'), 'true');
  assert.equal(p.d.activeElement.id, 'experienceTitle');
  assert.equal(p.scrolled[0].options.behavior, 'auto');
  p.d.dispatchEvent(new p.w.CustomEvent('weplace:industry', {detail: {industry: '__proto__'}}));
  assert.equal(p.scrolled.length, 1);
  assert.equal(p.d.querySelector('[data-industry=cafe]').getAttribute('aria-pressed'), 'true');
  p.dom.window.close();
});

test('mobile menu exposes state, Escape restores focus, nav/outside/desktop resize close it', () => {
  const p = home(), menu = p.d.getElementById('menuBtn');
  menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.getAttribute('aria-label'), '메뉴 닫기');
  p.d.dispatchEvent(new p.w.KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(p.d.activeElement, menu);
  menu.click(); p.d.getElementById('mainNav').querySelector('a').dispatchEvent(new p.w.MouseEvent('click', {bubbles: true}));
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  menu.click(); p.d.getElementById('experienceTitle').click(); assert.equal(menu.getAttribute('aria-expanded'), 'false');
  menu.click(); p.w.innerWidth = 1024; p.w.dispatchEvent(new p.w.Event('resize'));
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  p.dom.window.close();
});

test('check renders six labeled questions, four choices each, and updates progress', () => {
  const p = page('check');
  assert.equal(p.d.querySelectorAll('#questions fieldset').length, 6);
  assert.equal(p.d.querySelectorAll('#questions input[type=radio]').length, 24);
  for (const input of p.d.querySelectorAll('input,select,textarea')) assert.ok(input.labels.length, input.outerHTML);
  answer(p, ['yes', 'part', 'no', 'unknown', 'yes', 'yes']);
  assert.equal(p.d.getElementById('checkProgress').value, 6);
  assert.equal(p.d.getElementById('checkCount').textContent, '6 / 6개 답변');
  p.dom.window.close();
});

test('check blocks missing industry and first unanswered question with useful focus', () => {
  const p = page('check');
  submit(p);
  assert.match(p.d.getElementById('checkError').textContent, /업종/);
  assert.equal(p.d.activeElement.id, 'industry');
  answer(p, ['yes', 'yes']);
  submit(p);
  assert.match(p.d.getElementById('checkError').textContent, /3번 질문/);
  assert.equal(p.d.activeElement.name, 'q2');
  assert.equal(p.d.getElementById('result').hidden, true);
  p.dom.window.close();
});

test('unknown responses recommend verification without claiming an observed deficiency', () => {
  const p = page('check', '?industry=cafe');
  answer(p, Array(6).fill('unknown'), 'cafe');
  submit(p);
  assert.equal(p.d.getElementById('result').hidden, false);
  assert.match(p.d.getElementById('resultTitle').textContent, /확인할 매장/);
  assert.match(p.d.getElementById('resultReason').textContent, /부족하다고 단정하기보다/);
  assert.match(p.d.getElementById('resultText').value, /업종: 카페/);
  assert.match(p.d.getElementById('resultText').value, /실제 매장 조사나 성과 측정 결과는 아닙니다/);
  assert.equal(p.d.querySelectorAll('#resultActions li').length, 3);
  assert.equal(p.d.querySelectorAll('#resultAnswers li').length, 6);
  assert.equal(p.d.activeElement.id, 'resultTitle');
  p.dom.window.close();
});

test('all yes offers verification guidance and editing preserves current answers', () => {
  const p = page('check');
  answer(p, Array(6).fill('yes'));
  submit(p);
  assert.equal(p.d.getElementById('resultTitle').textContent, '기본 흐름을 갖춘 매장');
  assert.match(p.d.getElementById('resultPriority').textContent, /모든 채널/);
  p.d.getElementById('editAnswers').click();
  assert.equal(p.d.getElementById('questionSection').hidden, false);
  assert.equal(p.d.querySelectorAll('input:checked').length, 6);
  change(p, 'input[name=q5][value=no]');
  submit(p);
  assert.match(p.d.getElementById('resultTitle').textContent, /예약/);
  assert.match(p.d.getElementById('resultPriority').textContent, /직접 눌러/);
  p.dom.window.close();
});

test('priority uses explicit no before unknown or partial and shows a reported strength', () => {
  const p = page('check');
  answer(p, ['unknown', 'part', 'yes', 'no', 'yes', 'yes']);
  submit(p);
  assert.match(p.d.getElementById('resultReason').textContent, /우리 매장을 선택할 이유/);
  assert.match(p.d.getElementById('resultStrength').textContent, /리뷰에서 찾는 고객의 질문/);
  p.dom.window.close();
});

test('cafe is supported end to end; only a fixed industry token reaches meeting', () => {
  const p = page('check', '?industry=cafe&phone=secret-phone&answers=secret-answers');
  assert.equal(p.d.getElementById('industry').value, 'cafe');
  answer(p, Array(6).fill('part'), 'cafe');
  submit(p);
  for (const a of p.d.querySelectorAll('[data-meeting-link]')) assert.equal(a.getAttribute('href'), '/meeting/?industry=cafe');
  const m = page('meeting', '?industry=cafe&phone=secret-phone&answers=secret-answers');
  assert.equal(m.d.getElementById('meetingIndustry').value, 'cafe');
  assert.match(m.d.getElementById('meetingQuestions').textContent, /시그니처/);
  assert.equal(m.d.getElementById('meetingCheckLink').getAttribute('href'), '/check/?industry=cafe');
  assert.doesNotMatch(m.d.getElementById('meetingSummary').value, /secret-/);
  p.dom.window.close(); m.dom.window.close();
});

test('unknown/prototype industry tokens are rejected instead of becoming URL or HTML', () => {
  for (const token of ['constructor', '__proto__', '<img src=x onerror=alert(1)>']) {
    const p = page('check', '?industry=' + encodeURIComponent(token));
    assert.equal(p.d.getElementById('industry').value, '');
    submit(p);
    assert.equal(p.d.getElementById('result').hidden, true);
    const m = page('meeting', '?industry=' + encodeURIComponent(token));
    assert.equal(m.d.getElementById('meetingIndustry').value, 'other');
    assert.equal(m.d.getElementById('meetingCheckLink').getAttribute('href'), '/check/?industry=other');
    p.dom.window.close(); m.dom.window.close();
  }
});

test('diagnostic copy and download require a click and export the visible result only', async () => {
  const p = page('check');
  answer(p, Array(6).fill('part'), 'stay');
  submit(p);
  assert.equal(p.copied.length, 0); assert.equal(p.downloads.length, 0);
  p.d.getElementById('copyResult').click();
  await new Promise(setImmediate);
  assert.equal(p.copied[0], p.d.getElementById('resultText').value);
  p.d.getElementById('downloadResult').click();
  assert.equal(p.downloads[0].name, 'weplace-store-check.txt');
  assert.equal(p.blobs[0].type, 'text/plain;charset=utf-8');
  assert.equal(p.revoked[0], 'blob:test-download');
  p.dom.window.close();
});

test('meeting checks and next discussion are local preparation, with no booking/contract claim', async () => {
  const p = page('meeting', '?industry=beauty');
  assert.equal(p.d.querySelectorAll('input:checked').length, 0);
  change(p, '[data-review=current]');
  change(p, '[data-review=terms]');
  change(p, 'input[name=meetingDecision][value=proposal]');
  assert.match(p.d.getElementById('reviewCount').textContent, /2 \/ 6/);
  assert.match(p.d.getElementById('meetingSummary').value, /제안을 받고 싶습니다/);
  assert.match(p.d.getElementById('meetingSummary').value, /상담 접수·미팅 확정·계약·결제가 진행되지 않았습니다/);
  assert.equal(p.d.querySelectorAll('form').length, 0);
  change(p, '#meetingIndustry', 'cafe');
  assert.equal(p.d.querySelectorAll('[data-review]:checked').length, 0);
  p.d.getElementById('copyMeeting').click(); await new Promise(setImmediate);
  assert.equal(p.copied[0], p.d.getElementById('meetingSummary').value);
  assert.match(p.d.getElementById('meetingStatus').textContent, /아직 전송되지는 않았습니다/);
  p.d.getElementById('printMeeting').click(); assert.equal(p.prints, 1);
  assert.equal(p.d.querySelector('meta[name=robots]').content, 'noindex,nofollow');
  for (const input of p.d.querySelectorAll('input,select,textarea')) assert.ok(input.labels.length, input.outerHTML);
  p.dom.window.close();
});

function htmlFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    if (['.git', 'node_modules', 'dist'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

test('every repository inline classic script and JSON-LD block parses', () => {
  let scriptCount = 0, schemaCount = 0;
  for (const file of htmlFiles(root)) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'));
    for (const script of dom.window.document.querySelectorAll('script:not([src])')) {
      if (script.type === 'application/ld+json') { JSON.parse(script.textContent); schemaCount++; }
      else if (!script.type || /(?:java|ecma)script/.test(script.type)) { new vm.Script(script.textContent, {filename: file}); scriptCount++; }
    }
    dom.window.close();
  }
  assert.ok(scriptCount > 0); assert.ok(schemaCount > 0);
});

test('home and check canonical/OG match their intended public URLs and OG files exist locally', () => {
  for (const [file, url] of [['index.html', 'https://withweplace.kr/'], ['check/index.html', 'https://withweplace.kr/check/']]) {
    const dom = new JSDOM(fs.readFileSync(path.join(root, file), 'utf8'));
    const d = dom.window.document;
    assert.equal(d.querySelector('link[rel=canonical]').href, url);
    assert.equal(d.querySelector('meta[property="og:url"]').content, url);
    assert.ok(d.querySelector('meta[name=description]').content.length > 20);
    const image = new URL(d.querySelector('meta[property="og:image"]').content);
    assert.equal(image.origin, 'https://withweplace.kr');
    assert.ok(fs.existsSync(path.join(root, image.pathname)));
    const ids = Array.from(d.querySelectorAll('[id]'), el => el.id);
    assert.equal(new Set(ids).size, ids.length, `${file}: duplicate ID`);
    for (const a of d.querySelectorAll('a[href^="#"]')) {
      if (a.hash.length > 1) assert.ok(d.getElementById(a.hash.slice(1)), `${file}: ${a.hash}`);
    }
    dom.window.close();
  }
});
