/* Weplace read-only GA4 interaction signals. Excludes names, phones and free text.
 * Site-wide GA4 G-H9B5F4HRDS is preserved; only new G-FVCYL26FTL gets these additional events. */
(()=>{'use strict';
const analyticsId='G-FVCYL26FTL';
function signal(name,params){
 if(typeof window.gtag!=='function')return;
 const clean={send_to:analyticsId,source_page:document.getElementById('campaign-hook-title')?'november_fast_r8':'weplace_home'};
 for(const [k,v] of Object.entries(params||{})){
  if(['content_type','focus_type','view_mode','source_area'].includes(k)&&typeof v==='string'&&/^[a-z0-9_-]{1,36}$/i.test(v))clean[k]=v;
 }
 window.gtag('event',name,clean);
}
const observed=new Set();
const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting&&entry.intersectionRatio>=.35&&!observed.has(entry.target)){
   observed.add(entry.target);signal(entry.target.id==='observed-records'?'evidence_view':'luwei_view',{content_type:entry.target.id==='observed-records'?'two_cases':'photo_order'});
 }
},{threshold:[0,.35,.6]}):null;
for(const element of document.querySelectorAll('#observed-records,#luwei-first-look'))observer?.observe(element);
document.addEventListener('click',event=>{
 const tgt=event.target.closest('a,button');if(!tgt)return;
 if(tgt.matches('[data-lw-action]'))signal('luwei_interaction',{view_mode:tgt.dataset.lwAction==='replay'?'replay':'skip',source_area:'inline'});
 if(tgt.matches('.wp-ev-action')||tgt.closest('.wp-ev-actions'))signal('evidence_cta_click',{source_area:'records'});
 if(tgt.matches('#more-weplace .nov-home-return-action'))signal('home_return_click',{source_area:'november_footer'});
});
})();