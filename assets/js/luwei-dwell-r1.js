/* WEPLACE · LUWEI FIRST LOOK Dwell R1
   Visual storytelling only. It never locks scrolling, measures conversions, or sends data.
   A 700ms sustained in-view pause reveals a brief green intertitle, then the Peking duck.
*/
(()=>{'use strict';
 const section=document.getElementById('luwei-scene');
 const stage=document.getElementById('luwei-stage');
 const visual=document.getElementById('luwei-visual');
 const replay=document.getElementById('luwei-replay');
 const skip=document.getElementById('luwei-skip');
 const status=document.getElementById('luwei-phase-description');
 const frames={before:document.getElementById('luwei-before'),bridge:document.getElementById('luwei-bridge'),after:document.getElementById('luwei-after')};
 if(!section||!stage||!visual||!replay||!skip||!status||Object.values(frames).some(x=>!x))return;
 const motionQuery=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const saveData=Boolean(navigator.connection?.saveData);
 const motionAllowed=()=>!(motionQuery?.matches||saveData);
 let dwellTimer=0,bridgeTimer=0,played=false,observing=true;
 const messages={
   before:'먼저 보이는 외관 사진을 살펴보세요.',
   bridge:'같은 매장에서도 첫 번째로 보여주는 사진을 다르게 구성할 수 있습니다.',
   after:'베이징덕이 먼저 보입니다. 어떤 음식을 하는 곳인지 바로 알 수 있습니다.'
 };
 function clearTimers(){window.clearTimeout(dwellTimer);window.clearTimeout(bridgeTimer);dwellTimer=0;bridgeTimer=0;}
 function show(phase){
   if(!frames[phase])return;
   stage.dataset.phase=phase;
   Object.entries(frames).forEach(([name,el])=>{
     const hidden=name!==phase;
     el.setAttribute('aria-hidden',String(hidden));
     if('inert' in el)el.inert=hidden;
   });
   status.textContent=messages[phase];
   stage.dataset.played=phase==='after'?'true':'false';
 }
 function finish(){
   clearTimers();played=true;show('after');
 }
 function play(){
   clearTimers();played=false;
   if(!motionAllowed()){finish();return;}
   show('before');
   dwellTimer=window.setTimeout(()=>{
     show('bridge');
     bridgeTimer=window.setTimeout(()=>finish(),950);
   },700);
 }
 skip.addEventListener('click',()=>finish());
 replay.addEventListener('click',()=>play());
 if(motionQuery?.addEventListener)motionQuery.addEventListener('change',()=>{
   if(!motionAllowed())finish();
 });
 document.addEventListener('visibilitychange',()=>{
   if(document.hidden){clearTimers();if(stage.dataset.phase==='bridge')finish();}
 });
 show('before');
 if(!motionAllowed()){finish();return;}
 if(!('IntersectionObserver' in window)){return;}
 const observer=new IntersectionObserver(entries=>{
   const enough=entries.some(e=>e.target===visual&&e.isIntersecting&&e.intersectionRatio>=.60);
   if(enough&&!played&&observing&&!dwellTimer&&stage.dataset.phase==='before'){
      observing=false;
      play();
   }else if(!enough&&stage.dataset.phase==='before'&&dwellTimer){
      clearTimers();
      observing=true;
   }
 },{threshold:[0,.25,.60,.85]});
 observer.observe(visual);
})();