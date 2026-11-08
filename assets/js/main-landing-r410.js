/* WEPLACE R4.9 · arrival sequence.
   Purpose: when a visitor reaches LuWei #changes for the first time,
   let the REAL exterior settle briefly and then voluntarily show the same
   680ms editorial transition used by the accessible photo tabs.

   The screen feels momentarily held because the image stages its reveal,
   NOT because scrolling/navigation is blocked or a fake network loader runs.
   R2 remains sole owner of the image/ARIA. R48 remains sole owner of
   timing and media readiness. This module only initiates a single transition.
*/
(function () {
  'use strict';
  const host=document.querySelector('#changes .change-preview');
  const photoStage=host?.querySelector('.sample-photo');
  const panel=document.getElementById('change-panel');
  const after=document.getElementById('change-after');
  const before=document.getElementById('change-before');
  const switcher=document.getElementById('r47-photo-switch');
  const veil=document.getElementById('r410-stage-veil');
  if(!host||!photoStage||!panel||!after||!before||!switcher||!veil) return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection;
  const constrained=()=>Boolean(connection&&(connection.saveData||['slow-2g','2g','3g'].includes(connection.effectiveType)));
  // A genuinely reduced-motion user keeps the exterior static until choosing a tab.
  if(reduced.matches||constrained()||!('IntersectionObserver' in window))return;

  let scheduled=0,observer=null,autoStarted=false,manualChoice=false;
  const cancelScheduled=()=>{
    manualChoice=true;
    if(scheduled){clearTimeout(scheduled);scheduled=0;}
    veil.hidden=true;
    host.dataset.entryStory='interrupted';
    observer?.disconnect();
  };
  // Real mouse/touch or keyboard input must always override an entry animation.
  // The synthetic after.click() used by the entry is not a trusted input event.
  for(const control of [before,after,switcher]){
    control.addEventListener('pointerdown',cancelScheduled,{capture:true});
    control.addEventListener('keydown',cancelScheduled,{capture:true});
    control.addEventListener('click',event=>{if(event.isTrusted)cancelScheduled();},{capture:true});
  }

  const startOnce=()=>{
    if(autoStarted||manualChoice||reduced.matches||constrained()||document.hidden
       ||panel.dataset.storeState!=='before')return;
    autoStarted=true;
    host.dataset.entryStory='arrival';
    // 360ms keeps the actual exterior on screen long enough for a first glance.
    // A separate 680ms editorial dark beat + CSS fade is handled by R48.
    scheduled=window.setTimeout(()=>{
      scheduled=0;
      if(manualChoice||document.hidden||reduced.matches||constrained()
         ||panel.dataset.storeState!=='before')return;
      const rect=photoStage.getBoundingClientRect();
      // Do not flash a full-screen transition after a fast scroll past the card.
      if(rect.height>0 && (rect.bottom<window.innerHeight*.15 || rect.top>window.innerHeight*.88)){
        host.dataset.entryStory='skipped';
        return;
      }
      host.dataset.entryStory='revealing';
      veil.hidden=false;
      after.click();
      // No forced scroll, wheel prevention, viewport pin or artificial "loading %".
      // Restore the section's quiet state when the editorial beat completes.
      scheduled=window.setTimeout(()=>{
        scheduled=0;
        veil.hidden=true;
        if(!manualChoice)host.dataset.entryStory='settled';
      },1050);
    },360);
  };

  observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=0.58)){
      observer.disconnect();
      startOnce();
    }
  },{threshold:[0,0.58,1],rootMargin:'0px 0px -10% 0px'});
  observer.observe(photoStage);

  const abort=()=>{
    if(scheduled)clearTimeout(scheduled);
    scheduled=0;
    veil.hidden=true;
    host.dataset.entryStory='interrupted';
    observer?.disconnect();
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)abort();});
  window.addEventListener('pagehide',abort);
  reduced.addEventListener('change',()=>{if(reduced.matches)abort();});
  connection?.addEventListener?.('change',()=>{if(constrained())abort();});
})();
