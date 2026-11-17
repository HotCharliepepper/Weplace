// R4.2-specific regressions: photograph state, truthful examples, web brand and
// preview share-image origins. These DOM/byte checks do not measure rendering.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const source = fs.readFileSync('assets/js/main-landing-r2.js', 'utf8');
const questions = fs.readFileSync('assets/js/spatial-demo.js', 'utf8');

function setup(run = true) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, { url: 'https://preview.example.invalid/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole });
  const w = dom.window, d = w.document;
  w.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion'), addEventListener() {} });
  if (run) { w.eval(source); w.eval(questions); }
  return { w, d, errors, close: () => w.close() };
}

function localFile(url) {
  const p = new URL(url, 'https://preview.example.invalid/').pathname.slice(1);
  assert.ok(p && !p.includes('..'));
  assert.ok(fs.statSync(p).isFile(), p);
  assert.ok(fs.statSync(p).size > 0, p);
  return p;
}

test('R4.2 keyboard switching replaces the photograph, alt and responsive candidates together', () => {
  const c = setup();
  try {
    // R4.7 intentionally starts on the real exterior crop; explicitly enter
    // the menu state to retain the historical After → Before → After contract.
    c.d.getElementById('change-after').click();
    const photo = c.d.getElementById('sample-photo-image');
    const original = { src: photo.getAttribute('src'), srcset: photo.getAttribute('srcset'), alt: photo.alt, width: photo.width, height: photo.height };
    assert.match(original.alt, /베이징덕/);
    assert.match(original.srcset, /640w.*1254w/);
    for (let cycle = 0; cycle < 4; cycle++) {
      c.d.getElementById('change-after').dispatchEvent(new c.w.KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
      assert.equal(c.d.activeElement.id, 'change-before');
      assert.equal(c.d.getElementById('change-panel').getAttribute('aria-labelledby'), 'change-before');
      assert.notEqual(photo.getAttribute('src'), original.src);
      assert.equal(photo.hasAttribute('srcset'), false, 'An old responsive duck candidate must not override the car source.');
      assert.match(photo.alt, /차량.*외관/);
      localFile(photo.src);
      c.d.getElementById('change-before').dispatchEvent(new c.w.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
      assert.deepEqual({ src: photo.getAttribute('src'), srcset: photo.getAttribute('srcset'), alt: photo.alt, width: photo.width, height: photo.height }, original);
      assert.equal(c.d.activeElement.id, 'change-after');
      assert.equal(c.d.getElementById('change-panel').getAttribute('aria-labelledby'), 'change-after');
    }
    for (const candidate of original.srcset.split(',')) localFile(candidate.trim().split(/\s+/)[0]);
    assert.deepEqual(c.errors, []);
  } finally { c.close(); }
});

test('food comparison and all question states never restore the previous wellness copy', () => {
  const c = setup();
  try {
    const section = c.d.getElementById('changes');
    const forbidden = /마사지|관리 베드|관리 선택|관리 내용|무슨 관리|내게 맞는 관리|편안한 휴식/;
    for (const state of ['before', 'after', 'before', 'after']) {
      c.d.querySelector(`[data-change="${state}"]`).click();
      for (const question of section.querySelectorAll('[data-store-question]')) {
        question.click();
        const selected = section.querySelectorAll('[data-store-question][aria-pressed="true"]');
        assert.equal(selected.length, 1);
        assert.equal(selected[0], question);
        assert.doesNotMatch(section.textContent, forbidden);
      }
    }
    assert.deepEqual([...section.querySelectorAll('[data-store-question]')].map(button => button.textContent.trim()), ['대표 메뉴', '식사 자리', '예약 안내']);
    c.d.querySelector('[data-flow="next"]').click();
    c.d.querySelector('[data-flow="work"]').click();
    assert.match(c.d.getElementById('flow-task-copy').textContent, /메뉴 사진/);
    assert.doesNotMatch(c.d.getElementById('flow-task-copy').textContent, /관리 안내/);
    assert.deepEqual(c.errors, []);
  } finally { c.close(); }
});

test('provided restaurant photos remain distinct from simulated booking and revenue evidence without JavaScript', () => {
  const c = setup(false);
  try {
    const section = c.d.getElementById('changes');
    assert.match(section.querySelector('.preview-top').textContent, /루위.*사진 선택 비교/);
    assert.match(section.querySelector('.sample-caption').textContent, /기존 제공 자료/);
    assert.match(section.querySelector('.sample-caption').textContent, /안내와 버튼은 화면 구성 예시/);
    assert.match(section.querySelector('.sample-caption').textContent, /매출 효과를 뜻하지/);
    assert.match(section.querySelector('.booking-instructions').textContent, /실제 루위의 예약 조건을 안내하는 화면은 아닙니다/);
    assert.equal(section.querySelectorAll('.store-booking-plane a, .store-booking-plane form, .store-booking-plane button[type="submit"]').length, 0);
    assert.equal(section.querySelector('#sample-cta').tagName, 'SUMMARY');
    assert.ok([...section.querySelectorAll('[data-store-answer]')].every(answer => !answer.hidden));
    assert.doesNotMatch(section.textContent, /4\.6[56]|5,413|22:00|발렛|예약 완료|예약이 확정/);
    assert.equal(c.d.getElementById('diagnosis-price').textContent, '0원');
    assert.match(c.d.getElementById('diagnosis-scope').textContent, /매장 1곳.*공개 채널 1개.*개선안 1개/);
  } finally { c.close(); }
});

test('header, shared footer and favicon assets expose one local, self-contained web brand', () => {
  const c = setup(false);
  try {
    const header = c.d.querySelector('.site-header .wordmark');
    const footer = c.d.querySelector('.company-heading .w-brand');
    for (const link of [header, footer]) {
      assert.match(link.getAttribute('aria-label'), /Weplace/);
      const file = localFile(link.querySelector('img').src);
      const svg = new JSDOM(fs.readFileSync(file, 'utf8'), { contentType: 'image/svg+xml' });
      try {
        assert.ok(svg.window.document.querySelector('path'));
        assert.equal(svg.window.document.querySelectorAll('script, text, image, foreignObject').length, 0);
      } finally { svg.window.close(); }
    }
    for (const icon of c.d.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')) localFile(icon.href);
    for (const [file, expected] of [['favicon-32.png', 32], ['favicon-96.png', 96], ['apple-touch-icon.png', 180]]) {
      const bytes = fs.readFileSync(file);
      assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
      assert.equal(bytes.readUInt32BE(16), expected);
      assert.equal(bytes.readUInt32BE(20), expected);
    }
    const ico = fs.readFileSync('favicon.ico');
    assert.equal(ico.readUInt16LE(2), 1);
    const sizes = [];
    for (let i = 0; i < ico.readUInt16LE(4); i++) sizes.push(ico[6 + i * 16] || 256);
    assert.deepEqual(sizes.sort((a, b) => a - b), [16, 32, 48]);
  } finally { c.close(); }
});

test('review builds use the review origin only for the new share image, preserving canonical identity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weplace-r42-og-'));
  try {
    for (const folder of ['scripts', 'config', 'privacy']) fs.mkdirSync(path.join(root, folder));
    for (const file of ['scripts/build-site.mjs', 'scripts/company-info.mjs', 'config/company-info.json', 'config/privacy-release.json', 'privacy/index.html']) fs.copyFileSync(file, path.join(root, file));
    const productionImage = 'https://withweplace.kr/assets/brand/r42/og-weplace-r42.jpg';
    fs.writeFileSync(path.join(root, 'index.html'), `<!doctype html><html lang="ko"><head><link rel="canonical" href="https://withweplace.kr/"><meta property="og:url" content="https://withweplace.kr/"><meta property="og:image" content="${productionImage}"></head><body></body></html>`);
    for (const [prime, deploy, expected] of [
      ['https://deploy-preview-42--weplace.netlify.app', 'https://snapshot--weplace.netlify.app', 'https://deploy-preview-42--weplace.netlify.app/assets/brand/r42/og-weplace-r42.jpg'],
      ['', 'https://snapshot--weplace.netlify.app', 'https://snapshot--weplace.netlify.app/assets/brand/r42/og-weplace-r42.jpg'],
      ['https://weplace.netlify.app.attacker.invalid', 'http://snapshot--weplace.netlify.app', productionImage]
    ]) {
      const result = spawnSync(process.execPath, ['scripts/build-site.mjs'], { cwd: root, encoding: 'utf8', env: { ...process.env, CONTEXT: 'deploy-preview', DEPLOY_PRIME_URL: prime, DEPLOY_URL: deploy } });
      assert.equal(result.status, 0, result.stderr);
      const dom = new JSDOM(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'));
      try {
        const doc = dom.window.document;
        assert.equal(doc.querySelector('meta[property="og:image"]').content, expected);
        assert.equal(doc.querySelector('link[rel="canonical"]').href, 'https://withweplace.kr/');
        assert.equal(doc.querySelector('meta[property="og:url"]').content, 'https://withweplace.kr/');
        assert.match(doc.querySelector('meta[name="robots"]').content, /noindex/);
      } finally { dom.window.close(); }
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
