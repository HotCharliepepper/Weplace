/* FAST Sunwind R1 — decorative-only enhancement for the PR #32 study.
 * The verified unified-r3 controller owns FAST motion, sound, scroll and inquiries.
 * No analytics, storage, network request, video playback or audio changes here.
 */
(function () {
  'use strict';
  const hero=document.querySelector('.unified-r3.swd-study #fast');
  const fast=hero?.querySelector('.rf-fast');
  const atmosphere=hero?.querySelector('.swd-atmosphere');
  const title=hero?.querySelector('#hero-title');
  if(!hero||!fast||!atmosphere||!title)return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.documentElement;
  const network=navigator.connection;
  let raf=0,stopTimer=0,lastState='',disposed=false;

  const permitted=()=>!disposed && !document.hidden && !reduced.matches &&
    root.dataset.rfMotion==='on' && !network?.saveData &&
    !/(^|-)2g$/.test(network?.effectiveType||'');

  function clearPlay(){
    if(raf)cancelAnimationFrame(raf);
    if(stopTimer)clearTimeout(stopTimer);
    raf=0; stopTimer=0;
    atmosphere.removeAttribute('data-swd-playing');
    title.removeAttribute('data-swd-playing');
  }
  function playOnce(){
    clearPlay();
    if(!permitted())return;
    // Force a fresh finite CSS keyframe sequence only after existing FAST begins.
    raf=requestAnimationFrame(()=>{
      if(!permitted())return;
      atmosphere.setAttribute('data-swd-playing','yes');
      title.setAttribute('data-swd-playing','yes');
      stopTimer=window.setTimeout(clearPlay,1100);
    });
  }
  const fastObserver=new MutationObserver(()=>{
    const next=fast.dataset.fastState||'';
    if(next===lastState)return;
    lastState=next;
    if(next==='accelerate')playOnce();
    if(!permitted())clearPlay();
  });
  fastObserver.observe(fast,{attributes:true,attributeFilter:['data-fast-state']});

  const rootObserver=new MutationObserver(()=>{if(!permitted())clearPlay()});
  rootObserver.observe(root,{attributes:true,attributeFilter:['data-rf-motion']});
  const stopIfNeeded=()=>{if(!permitted())clearPlay()};
  const onVisibility=()=>{if(document.hidden)clearPlay()};
  const destroy=()=>{
    disposed=true;clearPlay();
    fastObserver.disconnect();rootObserver.disconnect();
  };
  reduced.addEventListener('change',stopIfNeeded);
  network?.addEventListener?.('change',stopIfNeeded);
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('pagehide',destroy,{once:true});
  // If FAST started before this script registered, reflect its current state.
  lastState=fast.dataset.fastState||'';
  if(lastState==='accelerate')playOnce();
})();
