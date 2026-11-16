/* R4.9 visual QA capture. Read-only: never submits forms or writes to live APIs.
 * Use local build: R49_BASE_URL=http://127.0.0.1:4176 node scripts/capture-r49.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

(async () => {
  const base = process.env.R49_BASE_URL || 'http://127.0.0.1:4176';
  const output = path.resolve(__dirname, '../docs/r4-spatial/r49/browser');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  try {
    for (const size of [
      { label:'desktop-1440', width:1440, height:1000 },
      { label:'mobile-390', width:390, height:900 },
      { label:'mobile-320', width:320, height:900 }
    ]) {
      const context = await browser.newContext({
        viewport: {width:size.width,height:size.height},
        deviceScaleFactor:1,
        reducedMotion:'reduce'
      });
      const page = await context.newPage();
      const failures = [];
      page.on('pageerror',e=>failures.push(e.message));
      await page.goto(base + '/?scene=2', { waitUntil:'load' });
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('#intro .hero-grid').screenshot({
        path:path.join(output,size.label+'-hero.png'),animations:'disabled'
      });
      const initial = await page.evaluate(()=>({
        heroSource:document.querySelector('#hero-photo')?.getAttribute('src'),
        h1:document.querySelector('#hero-title')?.innerText,
        ctaVisible:document.querySelector('#hero-cta')?.getBoundingClientRect().height > 0,
        hasRisingPath:!!document.querySelector('.r47-momentum-route .r47-trajectory'),
        scrollOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
      }));
      await page.locator('#changes').scrollIntoViewIfNeeded();
      await page.locator('#change-before').click();
      await page.locator('#changes .change-preview').screenshot({
        path:path.join(output,size.label+'-exterior.png'),animations:'disabled'
      });
      await page.locator('#r47-photo-switch').click();
      await page.locator('#r47-picture-curtain').waitFor({state:'hidden',timeout:5000});
      await page.locator('#changes .change-preview').screenshot({
        path:path.join(output,size.label+'-menu.png'),animations:'disabled'
      });
      const final = await page.evaluate(()=>({
        state:document.querySelector('#change-panel')?.dataset.storeState,
        source:document.querySelector('#sample-photo-image')?.getAttribute('src'),
        scrollOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        fallbackVisible:!document.getElementById('r48-photo-fallback')?.hidden
      }));
      rows.push({ ...size, initial, final, failures });
      await context.close();
    }
    fs.writeFileSync(path.join(output,'capture-summary.json'),JSON.stringify(rows,null,2));
    for(const x of rows) console.log(x.label+': '+JSON.stringify({hero:x.initial.heroSource,overflow:x.final.scrollOverflow,reveal:x.final.state,errors:x.failures.length}));
    if(rows.some(x=>x.failures.length||x.initial.scrollOverflow>1||x.final.scrollOverflow>1||x.final.fallbackVisible||x.final.state!=='after'||x.initial.heroSource!=='/assets/brand/r42/weplace-symbol.svg')) process.exitCode=1;
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
