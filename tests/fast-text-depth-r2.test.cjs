const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const get=p=>fs.readFileSync(p,'utf8');
const base=get('unified-r3-sunwind.html');
const sample=get('unified-r3-text-depth.html');
const css=get('assets/css/fast-text-depth-r2.css');
test('opt-in route preserves R3 Sunwind and all real functional sections',()=>{
  assert.match(sample,/<body class="rv-vision unified-r3 swd-study tdp-study">/);
  assert.match(sample,/name="robots" content="noindex,nofollow"/);
  assert.match(sample,/fast-text-depth-r2\.css/);
  assert.ok(!base.includes('fast-text-depth-r2.css'));
  for(const id of ['landing-title','hero-title','experience-title','work-title','capabilities-title','evidence-title','contact-title','stage','request-dialog']) {
    assert.match(sample,new RegExp('id="'+id+'"'));
  }
  for(const token of ['data-focus="photo"','data-focus="route"','data-focus="booking"','id="fast-sound"']) assert.ok(sample.includes(token),token);
});
test('text effects are spatial hierarchy only, preserving numbers and sound ownership',()=>{
  assert.match(sample,/1\.72억/);
  assert.match(sample,/1\.93억/);
  assert.match(sample,/2,100/);
  for(const token of ['#landing-title','#experience-title','#capabilities-title','#evidence-title','#contact-title','.u-number','.rf-word-row:nth-child(3)'])assert.ok(css.includes(token),token);
  assert.match(css,/@media\(max-width:800px\)/);
  assert.match(css,/@media\(forced-colors:active\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(css,/animation\s*:|mix-blend-mode|filter\s*:\s*blur|position\s*:\s*fixed/);
  assert.doesNotMatch(sample,/paymentWidget|tossPayments/i);
});