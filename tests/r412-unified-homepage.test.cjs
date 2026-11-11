const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=(path)=>fs.readFileSync(path,'utf8');
const page=read('index.html');
const css=read('assets/css/first-look-bridge-r412.css');
const js=read('assets/js/first-look-bridge-r412.js');
const company=JSON.parse(read('config/company-info.json'));
const privacy=JSON.parse(read('config/privacy-release.json'));
const buildScript=read('scripts/build-site.mjs');

test('Emotional Hero R2 precedes the preserved R4.12 evidence',()=>{
  assert.match(page,/data-emotional-hero/);
  assert.match(page,/광고 기획사/);
  assert.match(page,/실제 고객 사례와 구분합니다/);
  assert.ok(page.indexOf('id="hero-share"') < page.indexOf('id="hero-chart-title"'));
});

test('real monthly sales bar and connecting line remain separate from symbolic hero',()=>{
  assert.match(page,/id="hero-chart-title"/);
  assert.match(page,/1\.72억/);
  assert.match(page,/1\.93억/);
  assert.match(page,/매출 기여도는 분리되지 않았습니다/);
  assert.match(page,/class="chart-line"/);
});

test('one accessible First Look experience is inserted between hero and customer case',()=>{
  assert.equal((page.match(/id="first-look"/g)||[]).length,1);
  assert.ok(page.indexOf('id="intro"')<page.indexOf('id="first-look"'));
  assert.ok(page.indexOf('id="first-look"')<page.indexOf('id="changes"'));
  assert.match(page,/data-wpfl-fallback/);
  assert.match(page,/data-wpfl-app hidden/);
  assert.match(page,/data-wpfl-choice="a"/);
  assert.match(page,/data-wpfl-choice="b"/);
  assert.match(page,/data-wpfl-result/);
  assert.match(page,/href="#first-look"/);
  assert.match(page,/href="#request"/);
});

test('First Look food art, script and CSS exist and are included in the static site',()=>{
  assert.match(page,/assets\/css\/first-look-bridge-r412\.css/);
  assert.match(page,/assets\/js\/first-look-bridge-r412\.js/);
  for(const path of ['assets/first-look/okra-pepper.svg','assets/first-look/sensory-dish.svg']) {
    assert.ok(fs.existsSync(path),path);
    assert.match(read(path),/<svg/);
  }
  new vm.Script(js,{filename:'first-look-bridge-r412.js'});
  assert.match(js,/rounds=\[/);
  assert.match(js,/function useVerifiedPhoto/);
  assert.match(js,/assets\/first-look\/photos/);
  assert.match(css,/\.wpfl-visual\.is-photo img/);
  for(const id of ['recognize','warmth','sheen','plate'])assert.match(js,new RegExp("id:'"+id+"'"));
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css,/\[hidden\]\{display:none!important\}/);
});

test('first look is local and anonymous without touching CRM, auth, GA4 or persistence',()=>{
  assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|IndexedDB|gtag\s*\(|dataLayer|document\.cookie|WebSocket/);
  assert.match(page,/id="flow"/);
  assert.match(page,/href="\/my-store\/"/);
  assert.match(page,/id="request"/);
  assert.match(page,/실제 고객 실험/);
  assert.match(page,/매출 성과를 예측하지 않습니다/);
});

test('review previews stay noindex while release-eligible production root does not carry a permanent noindex tag',()=>{
  assert.doesNotMatch(page,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(buildScript,/if\s*\(!production\)\s*\{/);
  assert.match(buildScript,/noindex, nofollow/);
  assert.match(buildScript,/if\s*\(production && issues\.length\) throw new Error/);
});

test('company and privacy approval gates remain untouched and blocking',()=>{
  assert.equal(company.releaseApproved,false);
  assert.equal(privacy.releaseApproved,false);
  assert.equal(privacy.publicationState,'draft');
  assert.equal(company.publicationState,'review');
});
