/* WEPLACE Section Signals R1
 * Aggregate foreground exposure milestones, never cursor/keystrokes.
 * Only uses existing consent-gated wpAnalytics.track; no own network/cookies.
 * section_view = at least 1 sec of on-screen visibility
 * section_engaged = 5s or 15s cumulative visible foreground time (not proven reading)
 */
(()=>{'use strict';
 const isPreview=/(^|\.)netlify\.app$/.test(location.hostname);
 if(isPreview)return;
 const isCampaign=location.pathname.startsWith('/november-fast');
 const pageType=isCampaign?'november_fast':'home';
 const ids=isCampaign?
   ['top','fast','observed-records','luwei-scene','first-look','beyond-the-ad','action-plan','contact','more-weplace']:
   ['top','fast','observed-records','search-surfaces','luwei-scene','experience','work','capabilities','evidence','contact'];
 const sections=ids.map(id=>{
   const el=document.getElementById(id);
   return el?{el,id:id.replaceAll('-','_'),ms:0,seen:false,five:false,fifteen:false}:null;
 }).filter(Boolean);
 if(!sections.length)return;
 const analytics=()=>window.wpAnalytics;
 const allowed=()=>document.visibilityState==='visible'&&document.hasFocus()&&analytics()?.getState?.()==='accepted';
 let last=performance.now();
 function visibleEnough(el){
   const box=el.getBoundingClientRect();
   if(box.height<=0||box.width<=0||box.bottom<=0||box.top>=innerHeight)return false;
   const y=Math.max(0,Math.min(box.bottom,innerHeight)-Math.max(box.top,0));
   return y>=Math.min(innerHeight*.5,box.height*.5);
 }
 function signal(name,section,bucket){
   const params={section_id:section.id,page_type:pageType};
   if(bucket)params.dwell_bucket=bucket;
   return analytics()?.track?.(name,params)===true;
 }
 function tick(){
   const now=performance.now(),delta=Math.min(1000,Math.max(0,now-last));last=now;
   if(!allowed())return;
   for(const section of sections){
     if(!visibleEnough(section.el))continue;
     section.ms+=delta;
     if(section.ms>=1000&&!section.seen)section.seen=signal('section_view',section);
     if(section.ms>=5000&&!section.five)section.five=signal('section_engaged',section,'5s');
     if(section.ms>=15000&&!section.fifteen)section.fifteen=signal('section_engaged',section,'15s');
   }
 }
 const reset=()=>{last=performance.now()};
 document.addEventListener('visibilitychange',reset,{passive:true});
 window.addEventListener('focus',reset,{passive:true});
 window.addEventListener('blur',reset,{passive:true});
 window.addEventListener('pageshow',reset,{passive:true});
 window.setInterval(tick,500);
})();