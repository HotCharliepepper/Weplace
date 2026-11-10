/* R4.11 — client-agnostic customer journey adapted from research review.
   Progressive enhancement only: with JavaScript disabled all four panels remain
   readable. No network/storage/analytics calls, invented business results or
   dependency on the R4.10 scroll-based reveal. */
(function(){
  'use strict';
  const host=document.getElementById('r411-stage');
  if(!host)return;
  const nav=host.querySelector('.r411-step-tabs');
  const tabs=[...host.querySelectorAll('[data-r411-tab]')];
  const panels=[...host.querySelectorAll('.r411-step-panel')];
  if(!nav||tabs.length!==4||panels.length!==4)return;

  function choose(index,focus){
    if(index<0||index>=tabs.length)return;
    host.dataset.currentStep=String(index);
    tabs.forEach((tab,i)=>{
      const active=i===index;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      panels[i].hidden=!active;
    });
    if(focus)tabs[index].focus();
  }

  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>choose(i,false));
    tab.addEventListener('keydown',event=>{
      const key=event.key;
      const next=key==='ArrowRight'?(i+1)%tabs.length
        :key==='ArrowLeft'?(i+tabs.length-1)%tabs.length
        :key==='Home'?0
        :key==='End'?tabs.length-1
        :null;
      if(next===null)return;
      event.preventDefault();
      choose(next,true);
    });
  });
  nav.hidden=false;
  choose(0,false);
})();
