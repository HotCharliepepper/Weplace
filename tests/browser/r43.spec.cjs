const { test: base, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const captures = path.join(root, 'docs/r4-spatial/r43-refinement/browser');
fs.mkdirSync(captures, { recursive: true });

// Optional local artifact fixture: no HTTP server or external request is created.
// Normal runs target the supplied preview URL. This fixture tests identical dist bytes.
const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const writes = [];
    page.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url()); });
    if (process.env.R43_LOCAL_FILES) {
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('손님이 선택할');
  await expect(page.locator('#hero-cta')).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.locator(`[data-scene-tab="${i}"]`).click();
    await expect(page.locator('#cinema')).toHaveAttribute('data-scene', String(i));
    await page.waitForFunction(() => !window.gsap?.isTweening('.cinema-plane'));
    await page.evaluate(() => scrollTo(0,0));
    await page.evaluate(() => document.fonts.ready);
    await shot(page, info, `hero-${i}`);
    await shot(page, info, `scene-${i}`, page.locator('.cinema-viewport'));
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

test('finite autoplay can pause and settles at scene 3', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#scene-play')).toHaveAttribute('aria-pressed','true');
  await page.locator('#scene-play').click();
  const paused = await page.locator('#cinema').getAttribute('data-scene');
  await page.waitForTimeout(2400);
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene',paused);
  await page.locator('#scene-play').click();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2', { timeout: 7000 });
  await expect(page.locator('#scene-play')).toHaveAttribute('aria-pressed','false');
});

test('reduced motion is static; scene selection remains available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#cinema')).toHaveAttribute('data-motion','reduced');
  await expect(page.locator('#scene-play')).toBeHidden();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','2');
  await page.locator('#scene-tab-0').click();
  await expect(page.locator('#cinema')).toHaveAttribute('data-scene','0');
  expect(await page.evaluate(() => gsap.isTweening('.cinema-plane'))).toBe(false);
});

test('blocked GSAP keeps content, native links and tabs working', async ({ page }) => {
  await page.route('**/assets/vendor/gsap/**', r=>r.abort());
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#cinema')).toHaveAttribute('data-motion','static');
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
  await expect(page.locator('.cinema-controls')).toBeHidden();
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

test('no horizontal overflow at narrow, tablet and desktop widths', async ({ page }, info) => {
  for(const width of (info.project.name==='desktop'?[768,1024,1440]:[320,390])){
    await page.setViewportSize({width,height:900});
    for(const route of ['/?scene=2','/review/journey.html']){
      await page.goto(route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} at ${width}`).toBe(true);
    }
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
