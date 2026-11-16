// Source-only assertions: real browser & iOS/Kakao QA remain separate gates.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const hero=read('resolute-depth.html');
const base=read('resolute.html');
const css=read('assets/css/resolute-depth-r2.css');
const js=read('assets/js/resolute-depth-r2.js');
test('R2 depth study is a new route and retains the working R1/A source untouched',()=>{
  assert.match(hero,/<body class="rv-vision">/);
  assert.match(hero,/RESOLUTE IT FAST/);
  assert.match(hero,/assets\/css\/resolute-fast-motion-a\.css/);
  assert.match(hero,/assets\/js\/resolute-fast-motion-a\.js/);
  assert.ok(base.includes('/assets/hero-r2/room.webp'));
});
test('hero photograph is changed without claiming it is customer proof',()=>{
  assert.match(hero,/rf-hero-art"><div class="rf-aperture">[\s\S]*\/img\/weplace-hero-surface\.jpg/);
  assert.match(hero,/참고 이미지 · 실제 고객 사례가 아닙니다/);
  assert.ok(fs.existsSync(path.join(root,'img/weplace-hero-surface.jpg')));
});
test('optical speed and sectional depth remain CSS/GSAP enhancements only',()=>{
  assert.match(hero,/rv-art-field/);
  assert.match(hero,/rv-velocity-line/);
  assert.match(hero,/rv-keyword/);
  assert.match(hero,/resolute-depth-r2\.css/);
  assert.match(hero,/resolute-depth-r2\.js/);
  assert.match(css,/\.rf-experience[\s\S]*linear-gradient/);
  assert.match(css,/\.rf-work[\s\S]*linear-gradient/);
  assert.match(css,/\.rf-contact[\s\S]*linear-gradient/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(js,/AudioContext|fetch\(|localStorage|sessionStorage|XMLHttpRequest/);
  assert.doesNotMatch(hero,/tossPayments|paymentWidget|checkout\(/i);
  assert.doesNotThrow(()=>new Function(js));
});
test('original choices, proof and request anchors survive the compressed layout',()=>{
  for(const anchor of ['experience','work','contact','request-dialog']) assert.match(hero,new RegExp('id="'+anchor+'"'));
  for(const route of ['/\\#cases','/\\#flow','/\\#process','/\\#request']) assert.ok(hero.includes(route.replace('\\','')) || hero.includes(route));
  for(const selected of ['photo','route','booking']) assert.match(hero,new RegExp('data-focus="'+selected+'"'));
});