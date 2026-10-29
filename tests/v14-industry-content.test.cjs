/* Static source checks: no JavaScript is run to produce the industry material. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const text=node=>node?.textContent.trim().replace(/\s+/g,' ');
const page=file=>new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://withweplace.kr/'+file});

test('four static industry cards lead to distinct matching questions, illustrations and next actions without JavaScript',()=>{
  const index=page('industries/index.html'),d=index.window.document;
  try {
    const cards=[...d.querySelectorAll('.sector[data-sector]')];
    assert.equal(cards.length,4);
    for(const selector of ['h2','img','.text-link']){
      const values=cards.map(card=>selector==='img'?card.querySelector(selector)?.getAttribute('src'):text(card.querySelector(selector)));
      assert.ok(values.every(Boolean)); assert.equal(new Set(values).size,4,selector+' must identify four different situations.');
    }
    for(const card of cards){
      const industry=card.dataset.sector,cta=card.querySelector('.text-link');
      assert.equal(cta.closest('details'),null);
      assert.equal(card.querySelectorAll('.sector-evidence > li').length,2);
      const url=new URL(cta.href); let file=url.pathname.slice(1);
      if(file.endsWith('/'))file+='index.html';
      const detail=page(file),dd=detail.window.document;
      try {
        assert.equal(text(dd.querySelector('h1')),text(card.querySelector('h2')));
        assert.equal(dd.querySelector('.hero-visual img').getAttribute('src'),card.querySelector('img').getAttribute('src'));
        assert.equal(dd.querySelectorAll('#work .pair-checklist > article.item').length,2);
        const evidence=[...dd.querySelectorAll('#work .pair-checklist h3')].map(text);
        assert.deepEqual(evidence,[...card.querySelectorAll('.sector-evidence > li')].map(text));
        for(const href of ['/experience/?industry='+industry+'#experience','/check/?industry='+industry,'/privacy/']){
          const link=dd.querySelector('a[href="'+href+'"]');assert.ok(link,file+': '+href);assert.equal(link.closest('details'),null);
        }
        for(const disclosure of dd.querySelectorAll('details')){
          assert.equal(disclosure.firstElementChild.tagName,'SUMMARY');assert.ok(text(disclosure.firstElementChild));
          assert.equal(disclosure.querySelector('summary a,summary button,summary input'),null);
        }
        const comparisons=[...dd.querySelectorAll('.comparison-detail .comparison > div')];
        assert.equal(comparisons.length,2);
        comparisons.forEach(comparison=>assert.equal(comparison.querySelectorAll('ul > li').length,3));
        assert.notEqual(text(comparisons[0]),text(comparisons[1]));
        assert.match(text(dd.querySelector('.hero-visual figcaption')),/그림|예시/);
        assert.ok(text(dd.querySelector('#diagnosis .notice')));
        assert.equal(dd.querySelector('#diagnosis .notice').closest('details'),null);
      } finally {detail.window.close();}
    }
  } finally {index.window.close();}
});

