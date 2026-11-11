/* Review-only harness: same-origin iframe viewport QA. No customer data or submissions. */
(function(){
 const $=s=>document.querySelector(s),frame=$('#frame');let results=[],loadId=0;
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const p=new URLSearchParams(location.search);if(p.get('width'))$('#width').value=p.get('width');if(p.get('entry'))$('#entry').value=p.get('entry');
 function record(name,pass,detail=''){results.push({name,pass,detail});$('#results').textContent=JSON.stringify(results,null,2);$('#status').textContent=`${results.filter(r=>r.pass).length} passed / ${results.filter(r=>!r.pass).length} failed`;}
 function targetURL(){const u=new URL('/ad-funnel.html',location.origin);if($('#entry').value!=='home')u.searchParams.set('ad',$('#entry').value);u.searchParams.set('utm_source','qa');u.searchParams.set('utm_campaign','r2a_review');if($('#section').value)u.hash=$('#section').value;return u;}
 async function load(){const id=++loadId;frame.width=$('#width').value;frame.height=+frame.width>700?1000:844;const url=targetURL();frame.removeAttribute('srcdoc');const mode=$('#mode').value;
  if(mode==='normal') frame.src=url.href;
  else {let html=await fetch(url.pathname).then(r=>r.text());if(id!==loadId)return;
   if(mode==='fallback')html=html.replace(/<script defer src="\/assets\/vendor\/gsap\/[^"<>]+"><\/script>/g,'');
   const init=`document.documentElement.dataset.afEntry=${JSON.stringify($('#entry').value==='home'?'home':'ad')};document.documentElement.dataset.afCampaign=${JSON.stringify($('#entry').value==='home'?'local':$('#entry').value)};`;
   const reduced=`const original=window.matchMedia.bind(window);window.matchMedia=q=>{const m=original(q);if(q.includes('prefers-reduced-motion'))Object.defineProperty(m,'matches',{value:true});return m;};`;
   const slow=`Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'3g',addEventListener(){}}});`;
   html=html.replace('<script src="/assets/js/ad-funnel-entry-r2a.js"></script>','<script>'+init+(mode==='reduced'?reduced:mode==='slow'?slow:'')+'<\/script>');frame.srcdoc=html;
  }
 }
 frame.addEventListener('load',async()=>{await frame.contentDocument?.fonts?.ready;const d=frame.contentDocument;$('#status').textContent=`${frame.width} × ${frame.height} / ${$('#entry').value} / ${$('#mode').value}`;const h=$('#section').value;if(h)d.getElementById(h)?.scrollIntoView();});
 ['#width','#entry','#mode'].forEach(id=>$(id).addEventListener('change',load));$('#refresh').addEventListener('click',load);
 $('#section').addEventListener('change',()=>{const d=frame.contentDocument,s=$('#section').value; if(s)d.getElementById(s)?.scrollIntoView();else frame.contentWindow.scrollTo(0,0);});
 $('#run').addEventListener('click',async()=>{results=[];const w=frame.contentWindow,d=w.document,click=s=>d.querySelector(s).click();const get=s=>d.querySelector(s);
  for(const focus of ['route','booking','photo']){click(`[data-focus="${focus}"]`);record('scene '+focus,get('#focus-scene').dataset.currentFocus===focus && !get(`[data-scene="${focus}"]`).hidden && get('#meeting-note').value.includes(({photo:'사진',route:'찾아오는 길',booking:'예약'})[focus]));}
  click('[data-focus="booking"]');click('[data-guests="6"]');click('[data-time="19:30"]');record('booking example changes',get('#booking-status').textContent.includes('6인 · 19:30'));
  click('[data-compare="clear"]');record('compare changes layout',!get('[data-compare-layer="clear"]').hidden && get('[data-compare-layer="scattered"]').hidden);click('[data-compare="scattered"]');
  get('#diagnosis-form').requestSubmit();record('empty validation',!get('#form-error').hidden && d.activeElement.id==='store-name');
  for(const [id,value] of [['store-name','검수용 가상 매장'],['store-region','가상 지역']]){get('#'+id).value=value;get('#'+id).dispatchEvent(new w.Event('input',{bubbles:true}));}
  get('#diagnosis-form').requestSubmit();record('preview is not intake',!get('#form-result').hidden && get('#result-summary').textContent.includes('접수가 진행된 것은 아닙니다'));
  click('[data-form-focus="route"]');record('all choices synchronized',get('[data-focus="route"]').getAttribute('aria-pressed')==='true' && get('#report-question').textContent.includes('차는'));
  click('[data-meeting="visit"]');record('request includes actual selection',get('#meeting-note').value.includes('찾아오는 길') && get('#meeting-note').value.includes('매장 방문') && get('#meeting-note').value.includes('검수용 가상 매장'));
  record('no payment surface',!d.body.innerText.match(/토스|결제|할인|쿠폰/));record('no tracking storage',w.localStorage.length===0 && w.sessionStorage.length===0);
  await pause(650);record('no horizontal overflow',d.documentElement.scrollWidth<=w.innerWidth,`${d.documentElement.scrollWidth}/${w.innerWidth}`);record('no missing image',[...d.images].filter(i=>i.complete && i.offsetParent!==null).every(i=>i.naturalWidth>0));
  record('all section text visible',[...d.querySelectorAll('[data-af-reveal]')].every(n=>+w.getComputedStyle(n).opacity>0));
  record('touch controls >=44',[...d.querySelectorAll('button')].filter(n=>n.getClientRects().length).every(n=>n.getBoundingClientRect().height>=44));
  record('no submitted request',!w.performance.getEntriesByType('resource').some(e=>/api\/|netlify\/functions|toss|analytics|collect/.test(e.name)));
  if($('#mode').value!=='normal')record('motion disabled for fixture',!w.ScrollTrigger || w.ScrollTrigger.getAll().length===0);
  get('#experience').scrollIntoView();
 });
 $('#geometry').addEventListener('click',async()=>{results=[];const w=frame.contentWindow,d=w.document;for(const focus of ['photo','route','booking']){d.querySelector(`[data-focus="${focus}"]`).click();for(const id of ['experience','contrast','diagnosis','meeting']){d.getElementById(id).scrollIntoView();await pause(120);record(`${frame.width}/${focus}/${id}`,d.documentElement.scrollWidth<=w.innerWidth);}}d.getElementById('experience').scrollIntoView();});
 $('#download').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({width:frame.width,entry:$('#entry').value,mode:$('#mode').value,results},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`r2a-${frame.width}-${$('#entry').value}-${$('#mode').value}.json`;a.click();URL.revokeObjectURL(a.href);});
 load();
})();
