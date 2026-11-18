/* RESOLUTE / DEPTH R2: visual-only layer on top of FAST A.
   All customer controls and opt-in sound remain owned by existing scripts. */
(function(){
  'use strict';
  const host=document.body;
  if(!host.classList.contains('rv-vision'))return;
  const gs=window.gsap;
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection;
  const canMove=()=>!!(gs&&window.ScrollTrigger&&
    root.dataset.rfMotion!=='off'&&!reduced.matches&&!document.hidden&&
    !connection?.saveData&&!/(^|-)2g$/.test(connection?.effectiveType||''));
  const hero=document.querySelector('.rf-hero');
  const velocity=host.querySelector('.rv-velocity-line');
  const rays=[...host.querySelectorAll('.rv-ray')];
  const orbit=[...host.querySelectorAll('.rv-orbit')];
  const flare=host.querySelector('.rv-flare');
  const replay=document.querySelector('#fast-replay');
  let current=null,entered=false,mm=null;
  function clean(){
    current?.kill();current=null;
    if(gs)gs.set([velocity,...rays,...orbit,flare],{clearProps:'transform,opacity'});
    if(velocity)velocity.style.opacity='0';
    rays.forEach(r=>r.style.opacity='0');
  }
  function travel(){
    clean();
    if(!canMove()||!hero)return;
    const bounds=hero.getBoundingClientRect();
    if(bounds.bottom<=0||bounds.top>=innerHeight)return;
    const mobile=matchMedia('(max-width:800px)').matches;
    const d=mobile?14:33;
    current=gs.timeline({onComplete:clean});
    current.fromTo(orbit,{x:-d*.45,opacity:.22},{x:0,opacity:.58,duration:.67,ease:'power3.out'},.09);
    current.fromTo(flare,{x:-d,opacity:0},{x:0,opacity:.68,duration:.42,ease:'power3.out'},.13);
    current.fromTo(velocity,{scaleX:.12,x:-d,opacity:0},{scaleX:1,x:0,opacity:.85,duration:.26,ease:'power3.in'},.13);
    rays.forEach((ray,i)=>{
      current.fromTo(ray,{x:-d*(1.6+i*.6),scaleX:.12,opacity:0},
        {x:0,scaleX:1,opacity:.56-i*.10,duration:.28,ease:'power3.in'},.15+i*.048);
    });
    current.to([velocity,...rays],{x:mobile?10:28,opacity:0,duration:.25,ease:'power3.out'},.43);
    current.to(flare,{opacity:.23,duration:.38,ease:'power2.out'},.48);
    current.to(orbit,{opacity:(i)=>i===0?.62:.32,duration:.30},.50);
  }
  const enter=()=>{
    if(entered)return;entered=true;
    if(canMove())travel();
  };
  document.fonts?.ready.then(()=>setTimeout(enter,150)).catch(enter);
  window.addEventListener('load',()=>setTimeout(enter,800),{once:true});
  replay?.addEventListener('click',()=>{
    if(canMove())travel();
  });
  const maybeStop=()=>{if(!canMove())clean();};
  reduced.addEventListener('change',maybeStop);
  connection?.addEventListener?.('change',maybeStop);
  new MutationObserver(maybeStop).observe(root,{attributes:true,attributeFilter:['data-rf-motion']});
  document.addEventListener('visibilitychange',maybeStop);
  window.addEventListener('pagehide',clean);
  // Headline hierarchy: one calm reveal per section, no extra blocking scroll.
  if(gs?.matchMedia&&window.ScrollTrigger){
    gs.registerPlugin(window.ScrollTrigger);
    mm=gs.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      if(!canMove())return;
      const triggers=[];
      ['#experience-title','#contact-title'].forEach((id)=>{
        const target=document.querySelector(id);
        if(!target)return;
        const trigger=window.ScrollTrigger.create({
          trigger:target,start:'top 90%',once:true,
          onEnter:()=>{if(canMove())gs.fromTo(target,{y:12,opacity:.83},{y:0,opacity:1,duration:.58,ease:'power2.out',clearProps:'transform,opacity'});}
        });
        triggers.push(trigger);
      });
      return()=>triggers.forEach(t=>t.kill());
    });
  }
})();