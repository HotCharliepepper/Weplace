/* Static language-pair and new-service data boundaries, independent of copy wording. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const origin='https://withweplace.kr';
const routes=['/global/','/global/international-visitors-korea/','/global/korean-visitors-overseas/'];
function page(route){
  return new JSDOM(fs.readFileSync(path.join(root,route,'index.html'),'utf8'),{url:origin+route});
}
const clean=node=>node?.textContent.trim().replace(/\s+/g,' ');

test('global service pages form three real reciprocal Korean/English pairs with consistent metadata',()=>{
  const titles=new Set(),descriptions=new Set();
  for(const ko of routes){
    const en='/en'+ko;
    for(const [route,language,other] of [[ko,'ko',en],[en,'en',ko]]){
      const dom=page(route),d=dom.window.document;
      try {
        assert.match(d.documentElement.lang,new RegExp('^'+language+'(?:-|$)'));
        assert.equal(d.querySelectorAll('h1').length,1);
        const canonical=d.querySelectorAll('link[rel="canonical"]');
        assert.equal(canonical.length,1); assert.equal(canonical[0].href,origin+route);
        assert.equal(d.querySelector('meta[property="og:url"]').content,canonical[0].href);
        const alternates=new Map([...d.querySelectorAll('link[rel="alternate"][hreflang]')].map(a=>[a.hreflang,a.href]));
        assert.equal(alternates.size,3);
        assert.equal(alternates.get('ko'),origin+ko);
        assert.equal(alternates.get('en'),origin+en);
        assert.equal(alternates.get('x-default'),origin+ko);
        assert.equal(d.querySelector('a[hreflang="'+(language==='ko'?'en':'ko')+'"]')?.href,origin+other);
        assert.match(d.querySelector('meta[property="og:locale"]').content,new RegExp('^'+language+'_'));
        assert.match(d.querySelector('meta[property="og:locale:alternate"]').content,new RegExp('^'+(language==='ko'?'en':'ko')+'_'));
        assert.ok(clean(d.querySelector('title')).length>15);
        assert.ok(d.querySelector('meta[name="description"]').content.length>35);
        titles.add(clean(d.querySelector('title'))); descriptions.add(d.querySelector('meta[name="description"]').content);
        const ld=[...d.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{
          const value=JSON.parse(s.textContent);return value['@graph']||[value];
        });
        const web=ld.find(node=>node['@type']==='WebPage');
        assert.ok(web); assert.equal(web.url,origin+route);
        assert.match(web.inLanguage,new RegExp('^'+language+'(?:-|$)'));
        assert.equal(ld.some(node=>node['@type']==='LocalBusiness'),false,'A global service page cannot imply a local overseas business location.');
      } finally {dom.window.close();}
    }
  }
  assert.equal(titles.size,6,'Each service/language needs its own title.');
  assert.equal(descriptions.size,6,'Each service/language needs its own description.');
});

test('global review pages expose contact and policy without collecting, tracking or advertising unapproved prices',()=>{
  for(const route of routes.flatMap(route=>[route,'/en'+route])){
    const dom=page(route),d=dom.window.document;
    try {
      assert.equal(d.querySelector('form,input,textarea,select,iframe'),null);
      assert.equal(d.querySelector('script:not([type="application/ld+json"])'),null,'No executable global script or analytics is needed for these static review pages.');
      assert.equal(d.querySelector('[onclick],[onload],[onchange]'),null);
      assert.equal(d.querySelector('meta[http-equiv="refresh" i]'),null);
      const robots=d.querySelector('meta[name="robots"]')?.content;
      assert.match(robots,/\bnoindex\b/); assert.match(robots,/\bnofollow\b/);
      for(const href of ['/meeting/','/privacy/']){
        const link=d.querySelector('a[href="'+href+'"]');
        assert.ok(link,route+': '+href); assert.equal(link.closest('details'),null);
      }
      for(const link of d.querySelectorAll('a[href]')){
        assert.equal(link.closest('summary'),null,'A disclosure label must not contain a competing link.');
        const href=link.getAttribute('href');
        if(/^\/|^https?:/.test(href)) assert.equal(new URL(href,origin).search,'','Service/country/contact data must not become query payloads.');
        if(href.startsWith('mailto:')) assert.equal(new URL(href).search,'');
      }
      for(const details of d.querySelectorAll('details')){
        assert.equal(details.firstElementChild.tagName,'SUMMARY'); assert.ok(clean(details.firstElementChild));
      }
      const structured=[...d.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
      const visit=value=>{
        if(!value||typeof value!=='object')return;
        for(const [key,item] of Object.entries(value)){
          assert.ok(!['offers','price','priceCurrency','aggregateRating','reviewRating'].includes(key),key+' requires separate evidence/approval.');
          visit(item);
        }
      };
      structured.forEach(visit);
      assert.doesNotMatch(d.body.textContent,/(?:₩|KRW)\s*[\d,]+|(?:50|100|150)\s*만\s*원|설마중|seolmajung/i);
      assert.equal(d.querySelector('canvas,.market-bars,.price-card'),null);
    } finally {dom.window.close();}
  }
});

test('global sitemap and homepage directions point only to implemented matching pages',()=>{
  const xml=new JSDOM(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),{contentType:'application/xml'});
  const home=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:origin});
  try {
    const locations=[...xml.window.document.querySelectorAll('url > loc')].map(clean);
    for(const route of routes.flatMap(route=>[route,'/en'+route])){
      assert.equal(locations.filter(url=>url===origin+route).length,1,route);
      assert.ok(fs.existsSync(path.join(root,route,'index.html')));
    }
    assert.equal(locations.includes(origin+'/en/'),false,'The PR #5 root translation is not part of this patch.');
    const directions=home.window.document.getElementById('global-directions');
    assert.ok(directions);
    for(const route of routes.slice(1)) assert.ok(directions.querySelector('a[href="'+route+'"]'));
    assert.equal(directions.querySelector('form,input,textarea,select'),null);
  } finally {xml.window.close();home.window.close();}
});
