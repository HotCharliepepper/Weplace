/* WEPLACE Polish R2: isolated UI attention and action prompts only.
   The existing hero-lab controller owns FAST, chart state, audio and requests. */
(() => {
  'use strict';
  const page=document.querySelector('.unified-r3.he-lab.he-polish');
  if (!page) return;
  const stage=page.querySelector('[data-photo-stage]');
  const peek=page.querySelector('[data-photo-peek]');
  const showMenu=page.querySelector('[data-photo-choice="after"]');
  if (stage && peek && showMenu) {
    peek.addEventListener('click',() => showMenu.click());
    peek.disabled=false;
  }

  const work=page.querySelector('#work');
  const rows=work?[...work.querySelectorAll('.rf-word-row')]:[];
  if (!rows.length) return;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection;
  const root=document.documentElement;
  let raf=0;

  const canFocus=()=> !reduced.matches && root.dataset.rfMotion!=='off' &&
    !connection?.saveData && !/(^|-)2g$/.test(connection?.effectiveType||'');

  const reset=()=>{
    work.classList.remove('he-focus-ready');
    rows.forEach(r=>r.classList.remove('is-word-active'));
  };

  function update(){
    raf=0;
    if(!canFocus()){reset();return;}
    const box=work.getBoundingClientRect();
    if(box.bottom<=0 || box.top>=innerHeight){return;}
    let best=0,distance=Infinity;
    const center=innerHeight*.48;
    rows.forEach((row,i)=>{
      const r=row.getBoundingClientRect();
      const c=r.top+r.height*.5;
      const diff=Math.abs(c-center);
      if(diff<distance){best=i;distance=diff;}
    });
    work.classList.add('he-focus-ready');
    rows.forEach((row,i)=>row.classList.toggle('is-word-active',i===best));
  }
  const queue=()=>{
    if(raf)return;
    raf=requestAnimationFrame(update);
  };
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);
  connection?.addEventListener?.('change',queue);
  new MutationObserver(queue).observe(root,{attributes:true,attributeFilter:['data-rf-motion']});
  window.addEventListener('pagehide',()=>{
    window.removeEventListener('scroll',queue);
    window.removeEventListener('resize',queue);
    if(raf)cancelAnimationFrame(raf);
  },{once:true});
  queue();
})();