/* Read-only browser QA for the isolated R3 comparison route. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.RV_BASE_URL||'http://127.0.0.1:4173';
const dir=path.resolve(process.env.RV_QA_DIR||'docs/hero-evidence-polish-r3/browser');
fs.mkdirSync(dir,{recursive:true});
const report={url:base+'/unified-r3-hero-polish-r3.html',widths:[360,390,430,768,1280,1440],checks:[],errors:[],broken:[],writes:[],layouts:[]};
const check=(name,pass,detail='')=>{report.checks.push({name,pass:!!pass,detail});if(!pass)console.error('FAILED:',name,typeof detail==='string'?detail:JSON.stringify(detail));};
function save(){
 const result={...report,passed:report.checks.filter(c=>c.pass).length,failed:report.checks.filter(c=>!c.pass).length};
 fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(result,null,2));
 console.log('HERO EVIDENCE POLISH R3:',result.passed,'passed,',result.failed,'failed');
 if(result.failed)process.exitCode=1;
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('response',res=>{if(res.status()>=400)report.broken.push(res.status()+' '+res.url());});
 page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))report.writes.push(req.method()+' '+req.url());});
 try{
  for(const width of report.widths){
   await page.setViewportSize({width,height:width<801?840:900});
   await page.goto(report.url,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   check(width+' page has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   check(width+' retains eight sections',await page.locator('main>section').count()===8);
   check(width+' only 2026 initially selected',await page.locator('[data-compare-year][aria-pressed="true"]').evaluateAll(els=>els.length===1&&els[0].dataset.compareYear==='2026'));
   const chart=page.locator('svg.he-overlaid-chart:visible,svg.he-mobile-chart:visible');
   check(width+' one responsive SVG is visible',await chart.count()===1);
   check(width+' visible graph contains four years',await chart.locator('.he-line').count()===4);
   const layout=await chart.evaluate(svg=>{
    const box=svg.getBoundingClientRect(),parent=svg.parentElement;
    const texts=[...svg.querySelectorAll('text')].filter(el=>getComputedStyle(el).display!=='none').map(el=>{
     const b=el.getBoundingClientRect();
     const matrix=el.getScreenCTM();
     return {text:el.textContent.trim(),left:b.left,right:b.right,top:b.top,bottom:b.bottom,size:parseFloat(getComputedStyle(el).fontSize)*Math.abs(matrix.a)};
    });
    return {left:box.left,right:box.right,width:box.width,parentWidth:parent.clientWidth,parentScrollWidth:parent.scrollWidth,texts};
   });
   report.layouts.push({width,chart:layout});
   check(width+' graph needs no horizontal swipe',layout.parentScrollWidth<=layout.parentWidth+1&&layout.left>=0&&layout.right<=width+1,layout);
   check(width+' all month labels fit', ['4월','5월','6월'].every(month=>layout.texts.some(t=>t.text===month&&t.left>=0&&t.right<=width)),layout.texts);
   check(width+' readable axis and data labels',layout.texts.every(t=>t.size>=10.5&&t.left>=layout.left-1&&t.right<=layout.right+1),layout.texts);
   const strokes=await chart.locator('.he-line').evaluateAll(lines=>lines.map(el=>({year:el.dataset.chartYear,opacity:parseFloat(getComputedStyle(el).opacity),width:parseFloat(getComputedStyle(el).strokeWidth)})));
   check(width+' default 2026 line has strongest emphasis',strokes.filter(s=>s.year!=='2026').every(s=>s.opacity<strokes.find(a=>a.year==='2026').opacity),strokes);
   for(const year of ['2023','2024','2025']){
    await page.locator('[data-compare-year="'+year+'"]').click();
    check(width+' can select '+year,await chart.locator('.he-line[data-chart-year="'+year+'"] ').evaluate(el=>el.classList.contains('is-selected')));
   }
   await page.locator('[data-compare-2026]').click();
   check(width+' 2026-only action synchronizes both graphs',await page.locator('svg.he-overlaid-chart,svg.he-mobile-chart').evaluateAll(graphs=>graphs.every(g=>{const lines=g.querySelectorAll('.he-line.is-selected');return lines.length===1&&lines[0].dataset.chartYear==='2026';})));
   await page.locator('[data-compare-all]').click();
   check(width+' all-years action selects four visible lines',await chart.locator('.he-line.is-selected').count()===4);
   await page.locator('[data-compare-2026]').click();
   await page.locator('[data-compare-year="2026"]').click();
   check(width+' last selected year cannot disappear',await chart.locator('.he-line.is-selected').count()===1);
   await page.locator('.he-raw-values summary').click();
   check(width+' raw values remain readable without page overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('.he-raw-values summary').click();
   await page.locator('#seasonality-overlay').screenshot({path:path.join(dir,width+'-chart.png')});
   check(width+' photo retains native scale',await page.locator('.he-image-before').evaluate(el=>getComputedStyle(el).transform==='none'));
   await page.locator('[data-photo-peek]').click();
   await page.waitForFunction(()=>document.querySelector('[data-photo-stage]').dataset.phase==='after');
   check(width+' menu photograph appears',await page.locator('.he-image-after').getAttribute('aria-hidden')==='false');
   await page.locator('[data-photo-choice="before"]').click();
   check(width+' exterior photograph returns',await page.locator('[data-photo-stage]').getAttribute('data-phase')==='before');
   for(const topic of ['photo','route','booking']){
    await page.locator('button[data-focus="'+topic+'"]').click();
    await page.locator('button[data-mode="after"]').click();
    check(width+' retained '+topic+' comparison',await page.locator('[data-view="'+topic+'-after"]').isVisible());
   }
   const wordPositions=[];
   for(let index=0;index<3;index++){
    const row=page.locator('#work .rf-word-row').nth(index);
    await row.evaluate(el=>{const b=el.getBoundingClientRect();window.scrollTo({top:scrollY+b.top+b.height*.5-innerHeight*.48,behavior:'instant'});});
    await page.waitForTimeout(1500);
    check(width+' phrase '+(index+1)+' owns the focus',await page.locator('#work .rf-word-row').evaluateAll((rows,i)=>rows.filter(r=>r.classList.contains('is-word-active')).length===1&&rows[i].classList.contains('is-word-active'),index));
    const position=await row.locator('.rf-word').evaluate(el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,opacity:parseFloat(getComputedStyle(el).opacity)};});
    wordPositions.push(position);
    check(width+' phrase '+(index+1)+' fits and is clear',position.left>=0&&position.right<=width&&position.opacity>.98,position);
   }
   check(width+' word starts progress diagonally',wordPositions[0].left<wordPositions[1].left&&wordPositions[1].left<wordPositions[2].left,wordPositions);
   if(width>=1280)check(width+' desktop starts near 15 30 45 percent',wordPositions.every((p,i)=>Math.abs(p.left/width-[.15,.30,.45][i])<.035),wordPositions);
   report.layouts[report.layouts.length-1].words=wordPositions;
   await page.locator('#work').screenshot({path:path.join(dir,width+'-work.png')});
   await page.locator('#fast').scrollIntoViewIfNeeded();
   check(width+' FAST stays silent by default',await page.locator('#fast-sound').getAttribute('aria-pressed')==='false');
   await page.locator('#fast-replay').click();
   check(width+' FAST starts on replay',await page.locator('.rf-fast').getAttribute('data-fast-state')!=='settled');
   await page.waitForTimeout(900);
   check(width+' FAST settles after replay',await page.locator('.rf-fast').getAttribute('data-fast-state')==='settled');
   await page.locator('[data-open-request]').first().click();
   check(width+' inquiry dialog opens',await page.locator('#request-dialog').evaluate(el=>el.open));
   await page.locator('#store').fill('검수용 매장');
   await page.locator('#region').fill('서울');
   await page.locator('#request-form button[type="submit"]').click();
   check(width+' inquiry prepares locally',await page.locator('#request-text').inputValue().then(text=>text.includes('검수용 매장')&&text.includes('서울')));
   check(width+' inquiry explains unsent status',await page.locator('#request-status').textContent().then(text=>text.includes('아직 전송하거나 접수하지 않았습니다')));
   await page.keyboard.press('Escape');
   check(width+' inquiry closes',await page.locator('#request-dialog').evaluate(el=>!el.open));
   const footer=page.locator('footer.he-footer');
   await footer.scrollIntoViewIfNeeded();
   const linkBoxes=await footer.locator('a').evaluateAll(links=>links.map(el=>{const r=el.getBoundingClientRect();return {text:el.textContent.trim(),href:el.getAttribute('href'),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}));
   check(width+' footer links are not clipped',linkBoxes.every(b=>b.width>0&&b.height>0&&b.left>=0&&b.right<=width),linkBoxes);
   const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
   check(width+' footer links do not overlap',linkBoxes.every((a,i)=>linkBoxes.every((b,j)=>i===j||!intersects(a,b))),linkBoxes);
   for(const href of ['/#cases','/#flow','/privacy/','/','/my-store/','#contact'])check(width+' retains footer '+href,linkBoxes.some(b=>b.href===href));
   await footer.locator('a[href="#contact"]').click();
   check(width+' footer inquiry link reaches contact',await page.evaluate(()=>location.hash==='#contact'));
   await page.locator('#contact').screenshot({path:path.join(dir,width+'-contact.png')});
   await footer.screenshot({path:path.join(dir,width+'-footer.png')});
   check(width+' end-of-flow has no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  for(const width of [360,1440]){
   await page.setViewportSize({width,height:900});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.goto(report.url,{waitUntil:'load'});
   await page.evaluate(()=>document.fonts.ready);
   check('reduced '+width+' FAST replay disabled',await page.locator('#fast-replay').isDisabled());
   check('reduced '+width+' sound disabled and off',await page.locator('#fast-sound').isDisabled()&&await page.locator('#fast-sound').getAttribute('aria-pressed')==='false');
   check('reduced '+width+' all words are static and legible',await page.locator('#work .rf-word').evaluateAll(els=>els.every(el=>getComputedStyle(el).transform==='none'&&parseFloat(getComputedStyle(el).opacity)===1)));
   await page.locator('[data-compare-all]').click();
   check('reduced '+width+' chart selection still works',await page.locator('svg.he-overlaid-chart:visible .he-line.is-selected,svg.he-mobile-chart:visible .he-line.is-selected').count()===4);
   await page.locator('[data-photo-choice="after"]').click();
   check('reduced '+width+' photograph changes immediately',await page.locator('[data-photo-stage]').getAttribute('data-phase')==='after');
   await page.locator('#work').screenshot({path:path.join(dir,width+'-work-reduced.png')});
  }
  const routeLinks=await page.locator('footer a[href^="/"]').evaluateAll(els=>[...new Set(els.map(el=>el.getAttribute('href')))]);
  for(const href of routeLinks){
   const url=new URL(href,base),response=await page.request.get(url.origin+url.pathname);
   check('footer route '+href+' resolves',response.ok(),response.status());
   if(url.hash){
    const html=await response.text();
    const id=url.hash.slice(1);
    check('footer anchor '+href+' exists',html.includes('id="'+id+'"')||html.includes("id='"+id+"'"));
   }
  }
  check('no JavaScript errors',report.errors.length===0,report.errors);
  check('no HTTP errors',report.broken.length===0,report.broken);
  check('no network writes',report.writes.length===0,report.writes);
 }catch(error){check('QA completed without interruption',false,error.stack);}
 finally{save();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
