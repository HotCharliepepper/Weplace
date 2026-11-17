const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');

const htmlPath=['site.html','essay.html','webtoon/index.html'];
const read=p=>fs.readFileSync(p,'utf8');
const doc=p=>new JSDOM(read(p),{url:'https://withweplace.kr/'+p}).window.document;

test('new public entry pages have visible content, useful entry paths and shared legal footer',()=>{
  for(const path of htmlPath){
    const d=doc(path);
    assert.ok(d.querySelector('main#content'),'content landmark on '+path);
    assert.equal(d.querySelectorAll('h1').length,1,path+' single H1');
    assert.ok(d.querySelector('meta[name=description]')?.content.length>40,path+' description');
    assert.ok(d.querySelector('a[href="/check/"]'),path+' diagnosis path');
    assert.ok(d.querySelector('a[href="/privacy/"]'),path+' policy path');
    assert.ok(d.querySelector('a[href="/"]'),path+' return home');
    assert.ok(read(path).includes('<!-- WEPLACE_COMPANY_FOOTER -->'),path+' shared footer source marker');
    assert.ok(read(path).includes('<!-- /WEPLACE_COMPANY_FOOTER -->'),path+' shared footer end marker');
    assert.ok(read(path).includes('/assets/css/company-info.css'),path+' shared CSS');
    assert.equal(d.querySelectorAll('form').length,0,path+' no new data collection');
  }
});

test('site directory links to the actual canonical public pages',()=>{
 const d=doc('site.html');
 const required=['/','/unified-r3-hero-polish-r3.html','/check/','/industries/','/essay.html','/webtoon/','/field-notes/','/flow-preview/','/my-store/','/enterprise/'];
 for(const href of required)assert.ok(d.querySelector('a[href="'+href+'"]'),href);
 assert.match(d.body.textContent,/성과 수치는 비교 자료/);
 assert.ok(!d.querySelector('a[href^="/rhythm"]'),'unimplemented paid rhythm funnel not exposed');
});

test('published comic uses exactly the original seven licensed-review asset paths',()=>{
 const d=doc('webtoon/index.html');
 const cuts=[...d.querySelectorAll('.comic-panels figure img')];
 assert.equal(cuts.length,7);
 cuts.forEach((img,index)=>{
   const expected='/webtoon/episode-01/cut-'+String(index+1).padStart(2,'0')+'.jpg';
   assert.equal(img.getAttribute('src'),expected);
   assert.ok(fs.existsSync(expected.slice(1)),expected+' tracked asset exists');
   assert.ok(img.getAttribute('alt'),expected+' has alt');
 });
});

test('main and unified header entry paths retain contact and legacy operations',()=>{
 const home=doc('index.html'),unified=doc('unified-r3-hero-polish-r3.html');
 assert.ok(home.querySelector('.desktop-nav a[href="/site.html"]'));
 assert.ok(home.querySelector('.mobile-menu a[href="/site.html"]'));
 assert.ok(home.querySelector('.mobile-menu a[href="/essay.html"]'));
 assert.ok(home.querySelector('.mobile-menu a[href="/webtoon/"]'));
 assert.ok(home.querySelector('.header-actions a[href="/my-store/"]'));
 assert.ok(unified.querySelector('.rf-header a.rf-site-link[href="/site.html"]'));
 assert.ok(unified.querySelector('.rf-header a[href="#contact"]'));
 assert.ok(unified.querySelector('#contact a[href^="https://pf.kakao.com/"]'));
});
