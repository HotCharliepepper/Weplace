// Launch preflight regression: no production or privacy settings are changed here.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const firstLook=read('assets/js/first-look-bridge-r412.js');
const main=read('index.html');
const r3=read('unified-r3.html');
const build=read('scripts/build-site.mjs');
const company=JSON.parse(read('config/company-info.json'));
const privacy=JSON.parse(read('config/privacy-release.json'));

test('First Look uses SVG safely until verified optional photographs are declared ready',()=>{
  assert.match(firstLook,/root\.dataset\.wpflPhotoPack==='ready'/);
  assert.match(firstLook,/photoPackEnabled\?'unknown':'disabled'/);
  assert.match(firstLook,/photoPackState==='disabled'/);
  for(const svg of ['assets/first-look/okra-pepper.svg','assets/first-look/sensory-dish.svg']){
    assert.ok(fs.existsSync(svg),svg);
  }
  assert.doesNotMatch(main,/data-wpfl-photo-pack="ready"/);
});

test('Unified R3 remains opt-in preview; main still contains old deep-link anchors',()=>{
  assert.match(r3,/name="robots" content="noindex,nofollow"/);
  assert.match(r3,/id="top"/);
  for(const id of ['changes','cases','flow','request','process'])assert.match(main,new RegExp('id="'+id+'"'));
  for(const route of ['/#changes','/#cases','/#flow','/#process','/#request'])assert.ok(r3.includes(route),route);
});

test('Production gate remains enforced: no fictitious approvals or prices',()=>{
  assert.match(build,/if \(production && issues\.length\) throw new Error/);
  assert.equal(company.releaseApproved,false);
  assert.equal(privacy.releaseApproved,false);
  assert.equal(privacy.publicationState,'draft');
  assert.doesNotMatch(r3,/\b(?:300,000|500,000|50,000|100,000)\s*원\b|tossPayments|paymentWidget/i);
});