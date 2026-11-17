const { test: base, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const captures = path.join(root, 'docs/r4-spatial/r45/browser');
fs.mkdirSync(captures, { recursive: true });

// Optional local artifact fixture: no HTTP server or external request is created.
// Normal runs target the supplied preview URL. This fixture tests identical dist bytes.
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const writes = [];
    page.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url()); });
    if (process.env.R45_LOCAL_FILES) {
      await page.route('**/*', async route => {
        const u = new URL(route.request().url());
        if (u.origin !== new URL(baseURL).origin) return route.abort();
        let pathname = decodeURIComponent(u.pathname);
        if (pathname.endsWith('/')) pathname += 'index.html';
        const file = path.resolve(root, 'dist', '.' + pathname);
        if (!file.startsWith(path.join(root, 'dist') + path.sep)) return route.abort();
        if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'Not found' });
        return route.fulfill({ path: file });
      });
    }
    await use(page);
    expect(writes, 'No form, payment, DB or analytics writes during this review').toEqual([]);
  },
});

async function shot(page, testInfo, name, locator) {
  const file = path.join(captures, `${testInfo.project.name}-${name}.png`);
  await (locator || page).screenshot({ path: file, animations: 'disabled', ...(locator ? {} : { fullPage: false }) });
}
async function next(page) { await page.locator('.journey-step:not([hidden]) [data-next]').click(); }
async function audit(page, suffix, testInfo) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const result = await page.evaluate(async () => {
    const { violations, incomplete, passes } = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa','wcag22aa'] } });
    return { violations, incomplete: incomplete.map(r => ({ id: r.id, nodes: r.nodes.map(n=>n.target) })), passedRules: passes.length };
  });
  fs.writeFileSync(path.join(captures, `${testInfo.project.name}-axe-${suffix}.json`), JSON.stringify(result, null, 2));
  expect(result.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n=>n.target) }))).toEqual([]);
}

test('three hero states, keyboard tabs and available CTA', async ({ page }, info) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/?scene=0');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('매장은 그대로인데,');
  await expect(page.locator('#hero-cta')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.locator(`[data-scene-tab="${i}"]`).click();
    await expect(page.locator('#cinema')).toHaveAttribute('data-scene', String(i));
    await page.waitForFunction(() => !window.gsap?.isTweening('.hero-layer'));
    await page.evaluate(() => scrollTo(0,0));
    await page.evaluate(() => document.fonts.ready);
    await shot(page, info, `hero-${i}`);
    await shot(page, info, `scene-${i}`, page.locator('.hero-stage'));
  }
  await page.locator('#scene-tab-2').press('Home');
  await expect(page.locator('#scene-tab-0')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#scene-tab-1')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#scene-tab-2')).toHaveAttribute('aria-selected', 'true');
  await page.locator('#hero-cta').click();
  await expect(page).toHaveURL(/#request$/);
  await expect(page.locator('#shop-url')).toBeVisible();
  expect(errors).toEqual([]);
});

test('finite autoplay can pause and settles at scene 3', async ({ page }, info) => {
  test.skip(info.project.name==='mobile','Mobile intentionally uses a static poster.');
  await page.goto('/');
  await expect(page.locator('#scene-play')).toHaveAttribute('aria-pressed','true');
  await page.locator('#scene-play').click();
  const paused = await page.locator('#cinema').getAttribute('data-scene');
  await page.waitForTimeout(2400);
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene',paused);
  await page.locator('#scene-play').click();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2', { timeout: 9500 });
  await expect(page.locator('#scene-play')).toHaveAttribute('aria-pressed','false', {timeout:10000});
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2');
  expect(await page.evaluate(()=>!!gsap.getById('weplace-r45-hero'))).toBe(false);
  await page.locator('#scene-tab-2').focus();
  expect(await page.locator('.hero-depth').evaluate(n=>getComputedStyle(n).transform)).toBe('none');

});

test('reduced motion is static; scene selection remains available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#cinema')).toHaveAttribute('data-motion','reduced');
  await expect(page.locator('#scene-play')).toBeHidden();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2');
  await page.locator('#scene-tab-0').click();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','0');
  expect(await page.evaluate(() => gsap.isTweening('.hero-layer'))).toBe(false);
});

test('blocked GSAP keeps content, native links and tabs working', async ({ page }) => {
  await page.route('**/assets/vendor/gsap/**', r=>r.abort());
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#cinema')).toHaveAttribute('data-motion', /static|poster/);
  await expect(page.locator('#hero-cta')).toBeVisible();
  await page.locator('#scene-tab-1').click();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','1');
  expect(errors).toEqual([]);
});

test.describe('JavaScript disabled',()=>{
test.use({javaScriptEnabled:false});
test('no JavaScript retains claims, scope, CTA and full journey text', async ({ page }, info) => {
  await page.route('**/*.js', r=>r.abort());
  await page.goto('/');
  await expect(page.locator('#hero-cta')).toBeVisible();
  await expect(page.locator('.hero-scene-controls')).toBeHidden();
  await expect(page.locator('#diagnosis-price')).toHaveText('0원');
  await expect(page.locator('.hero-evidence')).toContainText('2,100만 원');
  await shot(page,info,'static-fallback');
  await page.goto('/review/journey.html');
  for(let i=0;i<5;i++) await expect(page.locator(`[data-step="${i}"]`)).toBeVisible();
  await expect(page.locator('#complete-demo')).toBeHidden();
});

});

test('existing tabs, case dialog, FLOW and diagnosis request remain local', async ({ page }) => {
  await page.goto('/?scene=2');
  await page.locator('#change-before').click();
  await expect(page.locator('#change-panel')).toHaveAttribute('data-store-state','before');
  await page.locator('#change-before').press('ArrowRight');
  await expect(page.locator('#change-after')).toHaveAttribute('aria-selected','true');
  await page.locator('#industry-lodging').click();
  await expect(page.locator('#industry-panel')).toHaveAttribute('aria-labelledby','industry-lodging');
  await page.locator('[data-case="b"]').click();
  await expect(page.locator('#case-dialog')).toBeVisible();
  await expect(page.locator('#case-dialog')).toContainText('2,350');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-case="b"]')).toBeFocused();
  await page.locator('#flow-review').click();
  await expect(page.locator('#flow-review')).toHaveAttribute('aria-selected','true');
  await page.locator('#shop-url').fill('https://example.com/demo-only');
  await page.locator('#request-form button[type=submit]').click();
  await expect(page.locator('#prepared-message')).toHaveValue(/example.com\/demo-only/);
  await expect(page.locator('#open-channel')).toHaveAttribute('href', 'https://pf.kakao.com/_mxbexhX');
  expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
});

test('free journey validates acknowledgement, completes, shares and restarts', async ({ page }, info) => {
  await page.goto('/review/journey.html?customer=PRIVATE#PRIVATE');
  await page.getByRole('radio', { name: /홈페이지/ }).check();
  await shot(page,info,'journey-diagnosis');
  await next(page);
  await expect(page.locator('#step-title-1')).toBeFocused();
  await shot(page,info,'journey-scope');
  await next(page);
  await expect(page.locator('#summary-price')).toHaveText('0원');
  await expect(page.locator('#summary-channel')).toHaveText('홈페이지');
  await page.locator('#complete-demo').click();
  await expect(page.locator('#order-error')).toContainText('확인해 주세요');
  await expect(page.locator('#demo-ack')).toBeFocused();
  await page.locator('#demo-ack').check();
  await shot(page,info,'journey-order');
  await page.locator('#complete-demo').click();
  await expect(page.locator('#step-title-3')).toBeFocused();
  await expect(page.locator('[data-step="3"]')).toContainText('접수된 것은 아닙니다');
  await shot(page,info,'journey-complete');
  await next(page);
  await expect(page.locator('#share-fallback')).not.toHaveValue(/PRIVATE|홈페이지|customer/);
  await shot(page,info,'journey-share');
  await page.locator('[data-step="4"] [data-back]').click();
  await page.locator('[data-restart]').click();
  await expect(page.getByRole('radio', { name: /네이버 플레이스/ })).toBeChecked();
  expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
});

test('detailed scope never exposes an unconfirmed price', async ({ page }) => {
  await page.goto('/review/journey.html');
  await next(page);
  await page.getByRole('radio', { name: /여러 채널 상세설계/ }).check();
  await next(page);
  await expect(page.locator('#summary-price')).toHaveText('범위와 비용 안내 후 결정');
  await expect(page.locator('#complete-demo')).toHaveText('모의 상담 요청 완료 ↗');
  await page.locator('#demo-ack').check();
  await page.locator('[data-step="2"] [data-back]').click();
  await page.getByRole('radio', { name: /첫 화면 진단/ }).check();
  await next(page);
  await expect(page.locator('#demo-ack')).not.toBeChecked();
  await expect(page.locator('#summary-price')).toHaveText('0원');
});

test('copy success and denied clipboard both preserve a useful safe share', async ({ page }) => {
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}}));
  await page.goto('/?scene=2&shop=PRIVATE#PRIVATE');
  await page.locator('[data-share-copy]').click();
  await expect(page.locator('.share-status')).toContainText('복사했습니다');
  expect(await page.evaluate(()=>window.__copied)).not.toMatch(/PRIVATE|scene|shop/);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied');}},configurable:true}));
  await page.locator('[data-share-copy]').click();
  await expect(page.locator('#share-fallback')).toBeFocused();
  await expect(page.locator('.share-status')).toContainText('선택했습니다');
});

test('WCAG automated checks on main and all five journey states', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/?scene=2');
  await audit(page,'home',info);
  await page.goto('/review/journey.html');
  for(let i=0;i<5;i++){
    await audit(page,`step-${i}`,info);
    if(i===2){await page.locator('#demo-ack').check();await page.locator('#complete-demo').click();}
    else if(i<4)await next(page);
  }
});

test('closing CTA remains visible against the dark panel and returns to diagnosis', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/?scene=2');
  const cta=page.locator('.afterglow .button');
  await cta.scrollIntoViewIfNeeded();
  const colors=await cta.evaluate(n=>{const s=getComputedStyle(n);return{s:s.color,b:s.backgroundColor};});
  expect(colors.s).not.toBe(colors.b);
  await shot(page,info,'closing',page.locator('.afterglow'));
  await cta.click();
  await expect(page).toHaveURL(/#request$/);
  await expect(page.locator('#shop-url')).toBeVisible();
});


test('all requested widths preserve type, poster, native links and the unchanged observation',async({page},info)=>{
 const report=[];
 for(const width of info.project.name==='desktop'?[1440,1280,1024,768]:[430,390,360,320]){
  await page.setViewportSize({width,height:900});await page.goto('/?scene=2');await page.evaluate(()=>document.fonts.ready);
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,cta:document.querySelector('#hero-cta').getBoundingClientRect().toJSON(),type:[...document.querySelectorAll('.hero-copy>.micro,.proof-foot p,.evidence-note,.scope-line')].map(n=>parseFloat(getComputedStyle(n).fontSize)),image:document.querySelector('#hero-photo').currentSrc,scene:document.querySelector('#cinema').dataset.motion}));
  expect(metrics.overflow).toBeLessThanOrEqual(1);expect(metrics.cta.bottom).toBeLessThan(900);expect(metrics.type.every(n=>n>=12)).toBe(true);
  expect(metrics.image).toMatch(/weplace-symbol\.svg$/);
  await expect(page.locator('.hero-evidence')).toContainText('2,100만 원');await expect(page.locator('.hero-evidence')).toContainText('+12.2%');
  await expect(page.locator('.hero-evidence')).toContainText('1.72억');await expect(page.locator('.hero-evidence')).toContainText('1.93억');
  await expect(page.locator('#hero-cta')).toHaveAttribute('href','#request');
  if(width<=1000){await expect(page.locator('#scene-play')).toBeHidden();expect(metrics.scene).toBe('poster');}
  for(let i=0;i<3;i++){
   await page.locator(`[data-scene-tab="${i}"]`).click();await page.waitForFunction(()=>!window.gsap?.isTweening('.hero-layer'));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  await page.locator('#question').scrollIntoViewIfNeeded();
  for(const a of await page.locator('.question-actions>a,.question-actions>button').all()){const b=await a.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}
  report.push({width,...metrics});
  for(const url of ['/review/journey.html','/review/question.html']){await page.goto(url);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 }
 fs.writeFileSync(path.join(captures,info.project.name+'-widths.json'),JSON.stringify(report,null,2));
});

test('image failure shows the real fallback, headline and CTA stay available',async({page})=>{
 await page.route('**/assets/brand/r42/weplace-symbol.svg',r=>r.fulfill({status:404,body:'image intentionally unavailable'}));
 await page.goto('/');await expect(page.locator('#cinema')).toHaveAttribute('data-motion','photo-fallback');
 await expect(page.locator('.hero-image-fallback')).toBeVisible();await expect(page.locator('.hero-depth')).toBeHidden();
 await expect(page.locator('#hero-title')).toBeVisible();await expect(page.locator('#hero-cta')).toBeVisible();
 await expect(page.locator('#scene-play')).toBeHidden();await page.locator('#scene-tab-1').click();
 await expect(page.locator('#scene-panel')).toContainText('손님이 다음에 확인할 질문');
 await page.locator('#hero-cta').click();await expect(page.locator('#shop-url')).toBeVisible();
});

test('delayed photo never delays title or CTA; no video is downloaded',async({page})=>{
 let release;const gate=new Promise(r=>release=r);await page.route('**/assets/brand/r42/weplace-symbol.svg',async r=>{await gate;await r.fallback();});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#hero-title')).toBeVisible();await expect(page.locator('#hero-cta')).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);expect(await page.locator('#hero-photo').evaluate(n=>n.complete)).toBe(false);
 }finally{release();}
 await page.locator('#hero-photo').evaluate(n=>n.decode());
});

test('mobile is static after eight seconds and reduced motion has no layer tween',async({page},info)=>{
 test.skip(info.project.name==='desktop','Desktop finite animation covered separately.');
 await page.goto('/');await expect(page.locator('#cinema')).toHaveAttribute('data-motion','poster');
 await page.waitForTimeout(8200);await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2');
 expect(await page.evaluate(()=>gsap.isTweening('.hero-layer'))).toBe(false);
 await page.mouse.move(250,650);expect(await page.locator('.hero-depth').evaluate(n=>getComputedStyle(n).transform)).toBe('none');
});

test('question download intent, dedicated page and browser Back retain the route',async({page},info)=>{
 await page.goto('/?scene=2#question');
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();const download=await pending;
 expect(download.suggestedFilename()).toBe('weplace-first-photo-question.jpg');// route.fulfill cannot complete Chromium download networking; actual saved bytes are verified on the live browser.
 expect(fs.statSync(path.join(root,'assets/brand/r42/og-question-r43.jpg')).size).toBeGreaterThan(10000);
 await page.getByRole('link',{name:'질문 카드만 열기'}).click();await expect(page).toHaveURL(/\/review\/question(?:\.html)?$/);
 await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/우리 매장 첫 사진/);
 await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',/실제 분석 결과가 아닙니다/);
 await page.screenshot({path:path.join(captures,info.project.name+'-question.jpg'),quality:85,fullPage:true});
 await page.goBack();await expect(page).toHaveURL(/#question$/);await expect(page.locator('#afterglow-title')).toBeVisible();
});

test('device sharing success, cancellation and unsupported fallback never include form data',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__shared=data}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}});});
 await page.goto('/?scene=2&shop=PRIVATE#PRIVATE');await page.locator('#shop-url').fill('https://example.com/PRIVATE');
 await page.locator('[data-share-native]').click();
 const shared=await page.evaluate(()=>window.__shared);expect(shared.url).toMatch(/\/review\/question$/);expect(JSON.stringify(shared)).not.toMatch(/PRIVATE|scene|shop/);
 await expect(page.locator('.share-status')).toContainText('공유 창을 닫았습니다');
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError')}}));
 await page.locator('[data-share-native]').click();await expect(page.locator('.share-status')).toContainText('공유를 취소');expect(await page.evaluate(()=>window.__copied)).toBeUndefined();
 await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:undefined}));
 await page.locator('[data-share-native]').click();await expect(page.locator('.share-status')).toContainText('복사했습니다');
 expect(await page.evaluate(()=>window.__copied)).not.toMatch(/PRIVATE|scene|shop/);
});

test('journey browser Back/Forward restores the prior step and keeps simulation explicit',async({page})=>{
 await page.goto('/review/journey.html');await page.locator('[data-step="0"] [data-next]').click();await page.locator('[data-step="1"] [data-next]').click();
 await page.goBack();await expect(page.locator('#step-title-1')).toBeVisible();await expect(page.locator('#step-title-1')).toBeFocused();
 await page.goForward();await expect(page.locator('#step-title-2')).toBeVisible();await expect(page.locator('#order-boundary')).toContainText('모의 주문입니다');
 await page.locator('#demo-ack').check();await page.locator('#complete-demo').click();await expect(page.locator('[data-step="3"]')).toContainText('접수된 것은 아닙니다');
 await page.goBack();await expect(page.locator('#step-title-2')).toBeFocused();
});

test('mobile menu keyboard and primary CTA navigation',async({page},info)=>{
 await page.goto('/?scene=2');
 if(info.project.name==='mobile'){
  const menu=page.locator('.mobile-menu');await menu.locator('summary').press('Enter');await expect(menu).toHaveAttribute('open','');
  await page.keyboard.press('Escape');await expect(menu).not.toHaveAttribute('open','');await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').press('Enter');await menu.getByRole('link',{name:'바꾸는 일'}).click();await expect(page).toHaveURL(/#changes$/);await expect(menu).not.toHaveAttribute('open','');
 }
 await page.locator('#hero-cta').click();await expect(page).toHaveURL(/#request$/);await expect(page.locator('#diagnosis-scope')).toHaveText('매장 1곳 · 공개 채널 1개 · 직접 써볼 개선안 1개');
});

test('delayed and failed photos never block the question or diagnosis CTA',async({page})=>{
 await page.route('**/assets/home-r42/*.webp',async r=>{await new Promise(resolve=>setTimeout(resolve,1200));await r.abort();});
 await page.goto('/?scene=2');await expect(page.locator('#hero-cta')).toBeVisible();
 await page.locator('#change-before').click();await page.locator('#change-after').click();
 await expect(page.locator('#sample-photo-image')).toHaveAttribute('alt',/베이징덕/);
 await page.locator('#hero-cta').click();await expect(page.locator('#shop-url')).toBeVisible();
 expect(await page.locator('video').count()).toBe(0);
});

test('question page has no automatic accessibility violations',async({page},info)=>{
 await page.goto('/review/question.html');await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const result=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return{violations:r.violations,incomplete:r.incomplete.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)}))}});
 fs.writeFileSync(path.join(captures,info.project.name+'-axe-question.json'),JSON.stringify(result,null,2));expect(result.violations).toEqual([]);
});

test.describe('no JavaScript question',()=>{test.use({javaScriptEnabled:false});test('static question, image download and diagnosis link remain usable',async({page})=>{
 await page.goto('/review/question.html');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.locator('[data-share-copy]')).toBeHidden();
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();expect((await pending).suggestedFilename()).toMatch(/\.jpg$/);
 await page.getByRole('link',{name:'첫 화면 진단 안내 · 0원'}).click();await expect(page.locator('#diagnosis-price')).toHaveText('0원');
});});


test('hero labels remain readable without overlay cards',async({page})=>{
 await page.goto('/?scene=2');await expect(page.locator('.hero-info,.hero-next')).toHaveCount(0);
 await expect(page.locator('.path-labels')).toContainText('예약 방법 확인');
 expect(await page.locator('.path-depth').getAttribute('data-motion-owner')).toBe('r45-hero');
 expect(await page.locator('script[src$="main-landing-r44.js"]').count()).toBe(0);
});

test('five stay criteria have keyboard focus, persistent sample status and no hotel assets',async({page},info)=>{
 await page.goto('/?scene=2');await page.locator('#stay-tab-0').click();
 for(let i=0;i<5;i++){
  await expect(page.locator('#stay-tab-'+i)).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#stay-panel-'+i)).toBeVisible();
  await expect(page.locator('.example-tag')).toContainText('실제 호텔 사진이나 적용 사례가 아닙니다');
  await expect(page.locator('.stay-panel:visible')).toHaveCount(1);
  if(i<4)await page.keyboard.press('ArrowRight');
 }
 await page.keyboard.press('Home');await expect(page.locator('#stay-tab-0')).toBeFocused();
 await page.keyboard.press('End');await expect(page.locator('#stay-tab-4')).toBeFocused();
 await expect(page.locator('#open-work img')).toHaveCount(0);
 expect(await page.locator('#open-work').innerText()).not.toMatch(/아르보|ARVO|예약 증가|매출 증가/);
 await shot(page,info,'open-work',page.locator('#open-work'));
 await page.locator('#open-work a').click();await expect(page).toHaveURL(/#request$/);
});

test('diagnosis sheet gives exactly one improvement on one channel',async({page},info)=>{
 await page.goto('/?scene=2');const sheet=page.locator('.diagnosis-preview');
 await expect(sheet).toContainText('제작 예시 · 실제 진단 결과 아님');
 await expect(sheet.locator('li')).toHaveCount(4);
 await expect(sheet).toContainText('바로 쓸 개선안 1개');await expect(sheet).toContainText('공개 채널 1개');
 await expect(sheet).toContainText('첫 사진을 대표 메뉴 사진으로 바꿔보세요.');
 expect(await sheet.innerText()).not.toMatch(/30만|선착순|잔여|할인/);
 await shot(page,info,'diagnosis-sheet',sheet);await sheet.locator('a').click();await expect(page).toHaveURL(/#request$/);
});

for(const mode of ['saveData','3g'])test(mode+' connection chooses a static scene',async({page})=>{
 await page.addInitScript(mode=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:mode==='saveData',effectiveType:mode==='3g'?'3g':'4g',addEventListener(){}}}),mode);
 await page.goto('/');await expect(page.locator('#cinema')).toHaveAttribute('data-motion','data-saving');
 await expect(page.locator('#scene-play')).toBeHidden();expect(await page.evaluate(()=>!!gsap.getById('weplace-r45-hero'))).toBe(false);
 await page.locator('#scene-tab-0').click();await expect(page.locator('#hero-cta')).toBeVisible();
});

test('lifecycle events settle animation without replay; keyboard focus stops movement',async({page},info)=>{
 await page.goto('/');if(info.project.name==='desktop'){
  await page.locator('#scene-tab-1').focus();await expect(page.locator('#cinema')).toHaveAttribute('data-playing','false');
  await page.locator('#scene-play').click();await expect(page.locator('#cinema')).toHaveAttribute('data-playing','true');
 }
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
 await expect(page.locator('#cinema')).toHaveAttribute('data-playing','false');
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2');
 expect(await page.evaluate(()=>!!gsap.getById('weplace-r45-hero'))).toBe(false);
 if(info.project.name==='desktop'){
  await page.locator('#scene-play').click();await page.locator('#process').scrollIntoViewIfNeeded();
  await expect(page.locator('#cinema')).toHaveAttribute('data-playing','false');
 }
});

test('200 percent desktop reflow and mobile visual zoom preserve controls',async({page},info)=>{
 await page.goto('/?scene=2');
 if(info.project.name==='desktop')await page.addStyleTag({content:'html{zoom:2}'});
 else {const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});expect(await page.evaluate(()=>visualViewport.scale)).toBe(2);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
 await page.locator('#stay-tab-4').focus();await page.keyboard.press('Enter');await expect(page.locator('#stay-panel-4')).toBeVisible();
 await page.locator('#hero-cta').focus();await page.keyboard.press('Enter');await expect(page.locator('#shop-url')).toBeVisible();
});

test.describe('static new content',()=>{test.use({javaScriptEnabled:false});test('all stay explanations and the one-page example survive without JS',async({page})=>{
 await page.goto('/');await expect(page.locator('.stay-tabs')).toBeHidden();
 for(let i=0;i<5;i++)await expect(page.locator('#stay-panel-'+i)).toBeVisible();
 await expect(page.locator('.diagnosis-sheet')).toContainText('제작 예시 · 실제 진단 결과 아님');
 await page.locator('.diagnosis-preview a').click();await expect(page).toHaveURL(/#request$/);
});});


// R4.10 cinematic entrance: a scroll-linked perception beat, not scroll locking.
test('R4.10 arriving at the LuWei photo plays one 680ms dark reveal and restores manual comparison',async({page})=>{
 await page.goto('/?scene=2');
 const photo=page.locator('#changes .sample-photo');
 await photo.scrollIntoViewIfNeeded();
 const veil=page.locator('#r410-stage-veil');
 await expect(veil).toBeVisible({timeout:2500});
 await expect(page.locator('#change-after')).toHaveAttribute('aria-selected','true',{timeout:2500});
 await expect(veil).toBeHidden({timeout:4000});
 await expect(page.locator('#r47-picture-curtain')).toBeHidden({timeout:4000});
 await expect(page.locator('#sample-photo-image')).toHaveAttribute('src',/luwei-peking-duck-1254\.webp/);
 await page.locator('#change-before').click();
 await expect(page.locator('#sample-photo-image')).toHaveAttribute('src',/luwei-before-capture\.webp/);
 await page.evaluate(()=>scrollTo(0,0));
 await photo.scrollIntoViewIfNeeded();
 await page.waitForTimeout(350);
 await expect(page.locator('#change-panel')).toHaveAttribute('data-store-state','before');
 await expect(veil).toBeHidden();
});
test('R4.10 reduced motion skips the entry hold but keeps user-triggered reveal',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/?scene=2');
 await page.locator('#changes .sample-photo').scrollIntoViewIfNeeded();
 await page.waitForTimeout(960);
 await expect(page.locator('#change-panel')).toHaveAttribute('data-store-state','before');
 await expect(page.locator('#r410-stage-veil')).toBeHidden();
 await page.locator('#r47-photo-switch').click();
 await expect(page.locator('#change-panel')).toHaveAttribute('data-store-state','after');
 await expect(page.locator('#r410-stage-veil')).toBeHidden();
});


test('R4.11 visitor journey connects discovery, comparison, judgment and visit without invented numbers', async ({page})=>{
  await page.goto('/?scene=2');
  await page.locator('#decision-path').scrollIntoViewIfNeeded();
  const stage=page.locator('#r411-stage');
  const tabs=stage.locator('[data-r411-tab]');
  const panels=stage.locator('.r411-step-panel');
  await expect(tabs).toHaveCount(4);
  await expect(panels.filter({visible:true})).toHaveCount(1);
  await expect(stage.locator('#r411-panel-0')).toContainText('대표 음식 · 공간 · 첫 사진');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
  await expect(stage.locator('#r411-panel-1')).toContainText('현재 메뉴 · 이용 인원 · 주차');
  await page.keyboard.press('End');
  await expect(tabs.nth(3)).toBeFocused();
  await expect(stage.locator('#r411-panel-3')).toContainText('최신 주소 · 현장 안내 · 변경 기록');
  await tabs.nth(2).click();
  await expect(stage.locator('#r411-panel-2')).toContainText('운영 조건 · FAQ · 공식 문의 경로');
  await expect(page.locator('#decision-path .r411-proof-steps')).toContainText('유효 문의');
  await expect(page.locator('#decision-path .r411-proof-steps')).toContainText('예약 확정');
  await expect(page.locator('#decision-path .r411-proof-steps')).toContainText('실제 방문');
  await expect(page.locator('#decision-path .r411-section-foot a')).toHaveAttribute('href','#request');
});
test.describe('R4.11 JavaScript-free visitor path',()=>{
  test.use({javaScriptEnabled:false});
  test('all four decision stages are readable and no dead controls are shown',async({page})=>{
    await page.goto('/?scene=2');
    const section=page.locator('#decision-path');
    await expect(section.locator('.r411-step-tabs')).toBeHidden();
    for(let i=0;i<4;i++){
      await expect(section.locator('#r411-panel-'+i)).toBeVisible();
    }
    await expect(section.locator('.r411-section-foot')).toContainText('구성 예시');
    await expect(section.locator('a[href="#request"]')).toHaveCount(2);
  });
});
