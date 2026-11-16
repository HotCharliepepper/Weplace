const {test:base,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/r4-spatial/r43-refinement/browser');
const test=base.extend({page:async({page,baseURL},use)=>{
 const writes=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url())});
 if(process.env.R43_LOCAL_FILES)await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==new URL(baseURL).origin)return r.abort();let p=decodeURIComponent(u.pathname);if(p.endsWith('/'))p+='index.html';let f=path.resolve(root,'dist','.'+p);if(!path.extname(f)&&fs.existsSync(f+'.html'))f+='.html';if(!f.startsWith(path.join(root,'dist')+path.sep)||!fs.existsSync(f))return r.fulfill({status:404,body:'Not found'});return r.fulfill({path:f});});
 await use(page);expect(writes).toEqual([]);
}});

test('all requested widths: complete hero planes, readable conditions, and available actions',async({page},info)=>{
 const report=[];await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of info.project.name==='desktop'?[1440,1280,768]:[430,390,360,320]){
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  for(let i=0;i<3;i++){
   await page.locator(`[data-scene-tab="${i}"]`).click();
   const bounds=await page.evaluate(()=>{const v=document.querySelector('.cinema-viewport').getBoundingClientRect();return [...document.querySelectorAll('.cinema-plane')].map(e=>{const b=e.getBoundingClientRect();return {left:b.left-v.left,right:v.right-b.right,top:b.top-v.top,bottom:v.bottom-b.bottom};})});
   expect(bounds.every(b=>Object.values(b).every(v=>v>=0)),`all three planes fit at ${width}, scene ${i}`).toBe(true);
  }
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,type:[...document.querySelectorAll('.hero-copy>.micro,.proof-foot p,.evidence-note,.scope-line')].map(n=>parseFloat(getComputedStyle(n).fontSize)),title:document.querySelector('h1').textContent}));
  expect(layout.overflow).toBeLessThanOrEqual(1);expect(layout.type.every(n=>n>=12)).toBe(true);report.push({width,...layout});
  await page.locator('#question').scrollIntoViewIfNeeded();
  for(const a of await page.locator('.question-actions>a,.question-actions>button').all()){const b=await a.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}
  await expect(page.locator('#afterglow-title')).toHaveText('우리 매장 첫 사진은,손님에게 무엇을알려주나요?');
  await page.goto('/review/question.html');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.getByRole('heading',{level:1})).toContainText('우리 매장 첫 사진은,');
 }
 fs.writeFileSync(path.join(out,info.project.name+'-widths.json'),JSON.stringify(report,null,2));
});

test('question download intent, dedicated page and browser Back retain the route',async({page},info)=>{
 await page.goto('/?scene=2#question');
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();const download=await pending;
 expect(download.suggestedFilename()).toBe('weplace-first-photo-question.jpg');// route.fulfill cannot complete Chromium download networking; actual saved bytes are verified on the live browser.
 expect(fs.statSync(path.join(root,'assets/brand/r42/og-question-r43.jpg')).size).toBeGreaterThan(10000);
 await page.getByRole('link',{name:'질문 카드만 열기'}).click();await expect(page).toHaveURL(/\/review\/question(?:\.html)?$/);
 await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/우리 매장 첫 사진/);
 await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',/실제 분석 결과가 아닙니다/);
 await page.screenshot({path:path.join(out,info.project.name+'-question.jpg'),quality:85,fullPage:true});
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
 fs.writeFileSync(path.join(out,info.project.name+'-axe-question.json'),JSON.stringify(result,null,2));expect(result.violations).toEqual([]);
});

test.describe('no JavaScript question',()=>{test.use({javaScriptEnabled:false});test('static question, image download and diagnosis link remain usable',async({page})=>{
 await page.goto('/review/question.html');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.locator('[data-share-copy]')).toBeHidden();
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();expect((await pending).suggestedFilename()).toMatch(/\.jpg$/);
 await page.getByRole('link',{name:'첫 화면 진단 안내 · 0원'}).click();await expect(page.locator('#diagnosis-price')).toHaveText('0원');
});});
