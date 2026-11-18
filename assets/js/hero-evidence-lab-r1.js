/* WEPLACE Hero Evidence R1 — anonymous local interactions only.
   Original R3 controller remains in a dedicated hero-lab copy; no audio/music,
   cookies, analytics, storage, network writes, CRM or consent changes here. */
(function(){
  "use strict";
  const root=document.querySelector('.unified-r3.he-lab .he-evidence');
  if(!root)return;
  const years=['2023','2024','2025','2026'];
  const active=new Set(['2026']);
  const toggles=[...root.querySelectorAll('[data-compare-year]')];
  const status=root.querySelector('[data-compare-status]');
  const all=root.querySelector('[data-compare-all]');
  const only26=root.querySelector('[data-compare-2026]');
  function refresh(){
    const selected=years.filter(y=>active.has(y));
    toggles.forEach(button=>{
      button.setAttribute('aria-pressed',String(active.has(button.dataset.compareYear)));
    });
    root.querySelectorAll('[data-chart-year]').forEach(el=>{
      el.classList.toggle('is-selected',active.has(el.dataset.chartYear));
    });
    if(status)status.textContent=selected.length===4?
      '네 연도의 추이를 같은 축에서 겹쳐 보고 있습니다.':
      selected.length===1?selected[0]+'년 추이를 강조했습니다. 다른 연도를 누르면 함께 비교할 수 있습니다.':
      selected.join('년 · ')+'년을 강조해 비교하고 있습니다.';
  }
  toggles.forEach(button=>button.addEventListener('click',()=>{
    const year=button.dataset.compareYear;
    if(!years.includes(year))return;
    if(active.has(year)){if(active.size>1)active.delete(year)}
    else active.add(year);
    refresh();
  }));
  all?.addEventListener('click',()=>{years.forEach(y=>active.add(y));refresh();});
  only26?.addEventListener('click',()=>{active.clear();active.add('2026');refresh();});
  refresh();

  const stage=root.querySelector('[data-photo-stage]');
  const before=root.querySelector('[data-photo-choice="before"]');
  const after=root.querySelector('[data-photo-choice="after"]');
  const beforeImg=stage?.querySelector('.he-image-before');
  const afterImg=stage?.querySelector('.he-image-after');
  const photoStatus=root.querySelector('[data-photo-status]');
  if(!stage||!before||!after||!beforeImg||!afterImg)return;
  let current='before',generation=0,timeout=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function setState(next){
    current=next;stage.dataset.phase=next;
    before.setAttribute('aria-pressed',String(next==='before'));
    after.setAttribute('aria-pressed',String(next==='after'));
    beforeImg.setAttribute('aria-hidden',String(next!=='before'));
    afterImg.setAttribute('aria-hidden',String(next!=='after'));
    if(photoStatus)photoStatus.textContent=next==='before'?
      '기존 자료의 매장 외관 사진을 먼저 보여주고 있습니다.':
      '메뉴 사진을 먼저 보여주고 있습니다. 사진의 순서를 비교하는 예시이며 매출 효과를 뜻하지 않습니다.';
  }
  function choose(next){
    clearTimeout(timeout);
    const key=++generation;
    if(next==='before'||reduced.matches||document.documentElement.dataset.rfMotion==='off'){
      setState(next);return;
    }
    stage.dataset.phase='transition';
    if(photoStatus)photoStatus.textContent='같은 매장의 사진 순서를 바꿔보고 있습니다.';
    timeout=setTimeout(()=>{if(key===generation&&!document.hidden)setState(next)},470);
  }
  before.disabled=false;after.disabled=false;
  before.addEventListener('click',()=>choose('before'));
  after.addEventListener('click',()=>choose('after'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timeout);generation++;setState(current)}});
  window.addEventListener('pagehide',()=>{clearTimeout(timeout);generation++},{once:true});
  setState('before');
})();