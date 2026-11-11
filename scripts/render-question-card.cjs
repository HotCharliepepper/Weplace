/* Reproducible 1200×630 artwork from editable HTML and the existing brand assets. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch(process.env.R43_CHROMIUM_PATH?{executablePath:process.env.R43_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']}:{});
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.route('https://artwork.weplace.test/**',route=>{const file=path.join(root,new URL(route.request().url()).pathname);return fs.existsSync(file)?route.fulfill({path:file}):route.abort();});
 await page.setContent(`<!doctype html><html lang="ko"><head><base href="https://artwork.weplace.test/"><link rel="stylesheet" href="/assets/css/main-landing-r2.css"><link rel="stylesheet" href="/assets/css/r43-font-supplement.css"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#F5F0E9;color:#20352d;padding:58px 72px;display:flex;flex-direction:column;border:18px solid #285448}.label{display:flex;align-items:center;gap:12px;color:#285448;font-size:18px}.dot{width:9px;height:9px;border-radius:50%;background:#B69B64}h1{font-size:62px;line-height:1.36;letter-spacing:-.04em;font-weight:600;margin:34px 0 0}h1 span{display:block}.foot{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #d8cfc3;padding-top:22px;margin-top:auto}.foot img{width:195px;height:auto}.foot p{font-size:18px;line-height:1.65;margin:0;color:#6B665F}</style></head><body class="home-r43"><div class="label"><span class="dot"></span>매장을 함께 보는 질문 01</div><h1><span>우리 매장 첫 사진은,</span><span>손님에게 무엇을 알려주나요?</span></h1><div class="foot"><img src="/assets/brand/r42/weplace-logo-light.svg" alt="Weplace,"><p>살펴볼 질문입니다.<br>실제 분석 결과가 아닙니다.</p></div></body></html>`);
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(root,'assets/brand/r42/og-question-r43.jpg'),type:'jpeg',quality:94});
 await browser.close();console.log('Question card: 1200×630 JPG');
})().catch(e=>{console.error(e);process.exit(1)});
