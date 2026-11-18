/* WEPLACE Card Depth R1: read-only rendered-card smoke test in Chromium. */
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.RV_BASE_URL||'http://127.0.0.1:4173';
const dir=path.resolve(process.env.CARD_QA_DIR||'docs/card-depth-r1/browser');
fs.mkdirSync(dir,{recursive:true});
const report={base,widths:[360,390,768,1440],checks:[],errors:[],writes:[]};
function check(name,pass,detail=''){report.checks.push({name,pass:Boolean(pass),detail});if(!pass)console.error('FAIL',name,detail);}
const targets=[
 {name:'directory',route:'/site.html',selector:'.card-grid > a.link-card',count:9,primary:'.card-grid > a.link-card.featured'},
 {name:'main',route:'/',selector:'#explore .explore-links > a',count:3,primary:'#explore .r46-role-grid > div'},
 {name:'unified',route:'/unified-r3-hero-polish-r3.html',selector:'#capabilities a.rf-proof-card',count:3,primary:'#capabilities a.rf-proof-card:first-child'}
];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RV_BROWSER_PATH?{executablePath:process.env.RV_BROWSER_PATH}:{})});
 const page=await browser.newPage();
 page.on('pageerror',e=>report.errors.push('JS '+e.message));
 page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))report.writes.push(req.method()+' '+req.url());});
 page.on('response',res=>{if(res.url().startsWith(base)&&res.status()>=400)report.errors.push('HTTP '+res.status()+' '+res.url());});
 try{
  for(const width of report.widths){
   await page.setViewportSize({width,height:width<=768?844:900});
   for(const t of targets){
    const response=await page.goto(base+t.route,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    check(width+' '+t.name+' page 200',response.status()===200);
    check(width+' '+t.name+' cards all present',await page.locator(t.selector).count()===t.count);
    check(width+' '+t.name+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const card=page.locator(t.selector).first();
    await card.scrollIntoViewIfNeeded();
    const design=await card.evaluate(el=>{
      const s=getComputedStyle(el),rect=el.getBoundingClientRect();
      return {shadow:s.boxShadow,radius:parseFloat(s.borderTopLeftRadius),border:s.borderTopWidth,width:rect.width,viewport:innerWidth,transform:s.transform};
    });
    check(width+' '+t.name+' card visibly elevated',design.shadow!=='none'&&design.radius>=15&&design.border!=='0px',design);
    check(width+' '+t.name+' first card fits viewport',design.width<=width,design);
    const cta=await card.getAttribute('href');
    check(width+' '+t.name+' card remains a real link',Boolean(cta&&cta.startsWith('/')),cta);
    if(t.name==='main'){
      const role=await page.locator(t.primary).first().evaluate(el=>({tag:el.tagName,shadow:getComputedStyle(el).boxShadow}));
      check(width+' informational card stays noninteractive',role.tag==='DIV'&&role.shadow!=='none',role);
    }
    if(t.name==='unified'){
      const cs=await page.locator(t.primary+' h3').evaluate(el=>getComputedStyle(el).color);
      check(width+' first capability heading is light',/^rgb\((?:2[3-5]\d,\s*){2}2[3-5]\d\)$/.test(cs),cs);
    }
    if(width===390||width===1440){
      const shot=t.name==='directory'?page.locator('.card-grid').first():t.name==='main'?page.locator('#explore .explore-links'):page.locator('#capabilities .rf-proof-grid');
      await shot.screenshot({path:path.join(dir,t.name+'-'+width+'.png'),animations:'disabled'});
    }
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/site.html',{waitUntil:'load'});
  const focused=await page.locator('.card-grid a.link-card').first().evaluate(el=>{el.focus();return {active:document.activeElement===el,outline:getComputedStyle(el).outlineStyle}});
  check('keyboard focus remains visible',focused.active&&focused.outline!=='none',focused);
  await page.emulateMedia({reducedMotion:'reduce'});
  const movement=await page.locator('.card-grid a.link-card').first().evaluate(el=>({duration:getComputedStyle(el).transitionDuration,transform:getComputedStyle(el).transform}));
  check('reduced-motion removes card transition',movement.duration==='0s',movement);
 }catch(e){report.errors.push(String(e.stack||e));}
 finally{await browser.close();}
 report.pass=report.checks.filter(c=>c.pass).length;report.fail=report.checks.filter(c=>!c.pass).length;
 fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));
 console.log('CARD DEPTH R1:',report.pass,'passed,',report.fail,'failed; errors',report.errors.length,'writes',report.writes.length);
 if(report.fail||report.errors.length||report.writes.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
