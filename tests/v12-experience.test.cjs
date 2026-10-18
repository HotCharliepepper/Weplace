/* v1.2 regression checks for state invalidation and release boundaries.
 * Layout assertions belong to real-browser review, not JSDOM. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');

test('changing industry invalidates the prior result and export instead of carrying a stale customer situation', async () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'https://deploy-preview.example.invalid/?industry=cafe&contact=PRIVATE_FIXTURE_ONLY', runScripts: 'outside-only'
  });
  const w = dom.window, d = w.document, copied = [], requests = [], writes = [];
  Object.defineProperty(w, 'isSecureContext', {value: true});
  Object.defineProperty(w.navigator, 'clipboard', {value: {writeText: async value => copied.push(value)}});
  w.fetch = (...args) => { requests.push(args); throw new Error('Network unavailable in this test'); };
  w.Storage.prototype.setItem = (...args) => writes.push(args);
  w.eval(fs.readFileSync(path.join(root, 'assets/js/site-metrics.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(root, 'assets/js/customer-discovery.js'), 'utf8'));
  d.querySelector('[data-purpose="1"]').click();
  d.querySelector('[data-view="after"]').click();
  d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.equal(copied.length, 1); assert.match(copied[0], /업종: 카페/);
  d.querySelector('[data-industry="stay"]').click();
  assert.equal(d.getElementById('discoveryResult').hidden, true);
  assert.equal(d.querySelectorAll('[data-purpose][aria-pressed="true"]').length, 0);
  assert.equal(d.querySelectorAll('[data-view]:disabled').length, 2);
  d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.equal(copied.length, 1, 'A stale result must not be copied after its context changes.');
  d.querySelector('[data-purpose="0"]').click();
  assert.equal(d.getElementById('discoveryResult').hidden, true);
  d.querySelector('[data-view="after"]').click();
  d.getElementById('copySummary').click(); await new Promise(setImmediate);
  assert.equal(copied.length, 2); assert.match(copied[1], /업종: 숙박/);
  assert.doesNotMatch(copied[1], /업종: 카페|PRIVATE_FIXTURE_ONLY/);
  assert.deepEqual(requests, []); assert.deepEqual(writes, []);
  assert.equal(w.WeplaceMetrics.enabled, false);
  for (const a of d.querySelectorAll('[data-diagnosis-link], [data-meeting-link]')) {
    assert.equal(new URL(a.href).search, '?industry=stay');
  }
  dom.window.close();
});

test('existing FLOW staff/client paths and public proxy contracts remain exact', () => {
  const routes = new Map(fs.readFileSync(path.join(root, '_redirects'), 'utf8').split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => { const [source, target, code] = line.trim().split(/\s+/); return [source, [target, code]]; }));
  const expected = {
    '/team': ['https://flow.withweplace.kr/', '302'],
    '/team/*': ['https://flow.withweplace.kr/:splat', '302'],
    '/client': ['https://flow.withweplace.kr/client', '302'],
    '/client/*': ['https://flow.withweplace.kr/client/:splat', '302'],
    '/api/weplace-industries': ['https://weplace-flow-mino-review.netlify.app/.netlify/functions/public-industries', '200!'],
    '/api/weplace-journal': ['https://weplace-flow-mino-review.netlify.app/.netlify/functions/public-journal', '200!']
  };
  for (const [source, destination] of Object.entries(expected)) assert.deepEqual(routes.get(source), destination, source);
});

test('homepage presents the new work scene as an example and does not publish the unapproved named case', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const dom = new JSDOM(html), d = dom.window.document;
  assert.doesNotMatch(html, /설마중|seolmajung/i);
  assert.match(d.getElementById('what-we-make').textContent, /가상.*예시/);
  assert.match(d.getElementById('what-we-make').textContent, /실제 고객의 제작·납품 사례가 아닌/);
  assert.equal(d.querySelector('.hero-actions a').getAttribute('href'), '#experience');
  assert.ok(d.getElementById('experience'), 'The tool must remain directly reachable from the first CTA.');
  assert.doesNotMatch(d.getElementById('exampleScreen').textContent, /왼쪽에서/);
  assert.equal(d.querySelectorAll('a[href*="/cases/seolmajung"]').length, 0);
  dom.window.close();
});

test('current company and privacy configuration cannot pass the production approval gate', async () => {
  const {companyReleaseIssues, company, privacyRelease} = await import(pathToFileURL(path.join(root, 'scripts/company-info.mjs')).href);
  const issues = companyReleaseIssues(company, privacyRelease);
  assert.ok(issues.length > 0);
  assert.equal(company.releaseApproved, false);
  assert.equal(privacyRelease.releaseApproved, false);
});

test('release gate rejects omissions, non-boolean approval and invalid approval dates', async () => {
  const {companyReleaseIssues, company, privacyRelease} = await import(pathToFileURL(path.join(root, 'scripts/company-info.mjs')).href);
  const data = structuredClone(company), policy = structuredClone(privacyRelease);
  Object.assign(data, {publicationState: 'approved', releaseApproved: true, approvedBy: 'SYNTHETIC_REVIEWER', approvedAt: '2026-10-19T00:00:00.000Z'});
  for (const field of Object.values(data.fields)) Object.assign(field, {value: field.value || 'SYNTHETIC_EVIDENCE_ONLY', status: 'confirmed', evidence: 'SYNTHETIC_EVIDENCE_ONLY'});
  Object.assign(policy, {publicationState: 'approved', releaseApproved: true, effectiveDate: '2026-10-19', approvedBy: 'SYNTHETIC_REVIEWER', approvedAt: '2026-10-19T00:00:00.000Z'});
  for (const key of Object.keys(policy.verified)) policy.verified[key] = true;
  // The synthetic approved control proves failures below are caused by the mutation.
  assert.deepEqual(companyReleaseIssues(data, policy), []);
  for (const key of Object.keys(company.fields)) {
    const changed = structuredClone(data); delete changed.fields[key];
    assert.ok(companyReleaseIssues(changed, policy).length > 0, `Missing company field: ${key}`);
  }
  for (const key of Object.keys(privacyRelease.verified)) {
    const changed = structuredClone(policy); delete changed.verified[key];
    assert.ok(companyReleaseIssues(data, changed).length > 0, `Missing privacy check: ${key}`);
  }
  assert.ok(companyReleaseIssues({...data, fields: {}}, policy).length > 0);
  assert.ok(companyReleaseIssues(data, {...policy, verified: {}}).length > 0);
  for (const changed of [{...data, releaseApproved: 'true'}, {...data, approvedAt: 'not-a-date'}]) {
    assert.ok(companyReleaseIssues(changed, policy).length > 0);
  }
  for (const changed of [{...policy, releaseApproved: 'true'}, {...policy, effectiveDate: '2026-02-31'}, {...policy, approvedAt: 'not-a-date'}]) {
    assert.ok(companyReleaseIssues(data, changed).length > 0);
  }
});

test('build blocks an unapproved production artifact and excludes internal evidence from a noindex review artifact', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'weplace-release-review-'));
  try {
    for (const folder of ['scripts', 'config', 'privacy', 'docs', 'internal-review', 'tests']) fs.mkdirSync(path.join(fixtureRoot, folder));
    for (const file of ['build-site.mjs', 'company-info.mjs']) fs.copyFileSync(path.join(root, 'scripts', file), path.join(fixtureRoot, 'scripts', file));
    for (const file of ['company-info.json', 'privacy-release.json']) fs.copyFileSync(path.join(root, 'config', file), path.join(fixtureRoot, 'config', file));
    fs.writeFileSync(path.join(fixtureRoot, 'index.html'), '<!doctype html><html><head><title>Synthetic review</title></head><body>PUBLIC_FIXTURE</body></html>');
    fs.writeFileSync(path.join(fixtureRoot, 'privacy/index.html'), '<!doctype html><html><head><title>Draft review</title></head><body data-policy-draft="true">Draft only</body></html>');
    fs.writeFileSync(path.join(fixtureRoot, '_headers'), '/privacy/*\n  X-Robots-Tag: noindex, nofollow\n');
    fs.writeFileSync(path.join(fixtureRoot, '_redirects'), '/client https://flow.withweplace.kr/client 302\n');
    fs.writeFileSync(path.join(fixtureRoot, 'docs/case-evidence.md'), '설마중 · SYNTHETIC_UNAPPROVED_EVIDENCE');
    fs.writeFileSync(path.join(fixtureRoot, 'internal-review/case.html'), '<p>SYNTHETIC_PRIVATE_REVIEW_TOKEN</p>');
    fs.writeFileSync(path.join(fixtureRoot, 'tests/private.test.cjs'), 'SYNTHETIC_TEST_ONLY_TOKEN');
    const production = spawnSync(process.execPath, ['scripts/build-site.mjs'], {cwd: fixtureRoot, env: {...process.env, CONTEXT: 'production'}, encoding: 'utf8'});
    assert.notEqual(production.status, 0);
    assert.match(production.stderr, /Production release blocked/);
    assert.equal(fs.existsSync(path.join(fixtureRoot, 'dist')), false, 'Reject before producing a deployable artifact.');
    const approvedCompany = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'config/company-info.json'), 'utf8'));
    Object.assign(approvedCompany, {publicationState: 'approved', releaseApproved: true, approvedBy: 'SYNTHETIC_REVIEWER', approvedAt: '2026-10-19T00:00:00.000Z'});
    for (const field of Object.values(approvedCompany.fields)) Object.assign(field, {value: field.value || 'SYNTHETIC_EVIDENCE_ONLY', status: 'confirmed', evidence: 'SYNTHETIC_EVIDENCE_ONLY'});
    const approvedPolicy = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'config/privacy-release.json'), 'utf8'));
    Object.assign(approvedPolicy, {publicationState: 'approved', releaseApproved: true, effectiveDate: '2026-10-19', approvedBy: 'SYNTHETIC_REVIEWER', approvedAt: '2026-10-19T00:00:00.000Z'});
    for (const key of Object.keys(approvedPolicy.verified)) approvedPolicy.verified[key] = true;
    fs.writeFileSync(path.join(fixtureRoot, 'config/company-info.json'), JSON.stringify(approvedCompany));
    fs.writeFileSync(path.join(fixtureRoot, 'config/privacy-release.json'), JSON.stringify(approvedPolicy));
    for (const markup of ["<main DATA-POLICY-STATE = 'approved' data-policy-draft = 'true'>Draft</main>", '<main>Unclassified</main>']) {
      fs.writeFileSync(path.join(fixtureRoot, 'privacy/index.html'), '<html><head><title>Review</title></head><body>' + markup + '</body></html>');
      const held = spawnSync(process.execPath, ['scripts/build-site.mjs'], {cwd: fixtureRoot, env: {...process.env, CONTEXT: 'production'}, encoding: 'utf8'});
      assert.notEqual(held.status, 0); assert.match(held.stderr, /Privacy HTML/);
      assert.equal(fs.existsSync(path.join(fixtureRoot, 'dist')), false);
    }
    const preview = spawnSync(process.execPath, ['scripts/build-site.mjs'], {cwd: fixtureRoot, env: {...process.env, CONTEXT: 'deploy-preview'}, encoding: 'utf8'});
    assert.equal(preview.status, 0, preview.stderr);
    for (const folder of ['scripts', 'config', 'docs', 'tests', 'internal-review']) assert.equal(fs.existsSync(path.join(fixtureRoot, 'dist', folder)), false, folder);
    for (const file of ['index.html', 'privacy/index.html']) {
      const output = fs.readFileSync(path.join(fixtureRoot, 'dist', file), 'utf8');
      assert.match(output, /name="robots" content="noindex, nofollow"/);
      assert.doesNotMatch(output, /설마중|SYNTHETIC_(?:UNAPPROVED|PRIVATE|TEST_ONLY)/);
    }
    assert.match(fs.readFileSync(path.join(fixtureRoot, 'dist/_headers'), 'utf8'), /\/\*\s+X-Robots-Tag: noindex, nofollow/);
    assert.doesNotMatch(fs.readFileSync(path.join(fixtureRoot, '_headers'), 'utf8'), /^\/\*/m);
  } finally { fs.rmSync(fixtureRoot, {recursive: true, force: true}); }
});
