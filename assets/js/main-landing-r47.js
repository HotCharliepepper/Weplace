/* WEPLACE R4.7: a voluntary, reversible editorial reveal.
   R4.5 remains the sole GSAP hero controller; no automatic scroll or image swap. */
(function () {
  'use strict';
  const host=document.querySelector('#changes .change-preview');
  const panel=document.getElementById('change-panel');
  const before=document.getElementById('change-before');
  const after=document.getElementById('change-after');
  const curtain=document.getElementById('r47-picture-curtain');
  const switchButton=document.getElementById('r47-photo-switch');
  const status=document.getElementById('r47-switch-status');
  if(!host||!panel||!before||!after||!curtain||!switchButton||!status)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=navigator.connection;
  const canStage=()=>!reduced.matches&&!connection?.saveData;
  let fadeTimer=0,hideTimer=0,changeSerial=0;

  function clearCurtain(){
    ++changeSerial;
    clearTimeout(fadeTimer);clearTimeout(hideTimer);
    curtain.classList.remove('is-leaving');
    curtain.hidden=true;
  }

  function updateSwitch(){
    const currentlyBefore=panel.dataset.storeState==='before';
    switchButton.innerHTML=currentlyBefore?'메뉴 먼저 보기 <span aria-hidden="true">↗</span>':'외관 다시 보기 <span aria-hidden="true">↗</span>';
    switchButton.setAttribute('aria-label',currentlyBefore?'메뉴 먼저 보기로 사진 비교 전환':'외관 먼저 보기로 사진 비교 전환');
  }

  function stage(next){
    if(!canStage()){clearCurtain();return;}
    clearTimeout(fadeTimer);clearTimeout(hideTimer);
    const mySerial=++changeSerial;
    curtain.hidden=false;
    curtain.classList.remove('is-leaving');
    // This short blackout is an editorial pause, never a simulated network progress bar.
    fadeTimer=window.setTimeout(()=>{
      if(mySerial!==changeSerial)return;
      curtain.classList.add('is-leaving');
      hideTimer=window.setTimeout(()=>{
        if(mySerial!==changeSerial)return;
        curtain.hidden=true;
        curtain.classList.remove('is-leaving');
      },270);
    },next==='after'?560:350);
  }

  function onChangeStart(next){
    if(panel.dataset.storeState===next)return;
    stage(next);
    queueMicrotask(()=>{
      updateSwitch();
      status.textContent=next==='after'
        ?'메뉴 사진을 먼저 보여주는 구성으로 바꿨습니다. 이 화면은 실제 예약이 아닌 구성 예시입니다.'
        :'외관 사진을 먼저 보여주는 이전 구성으로 돌아왔습니다.';
    });
  }

  // Capturing the actual tab interaction makes the dark frame precede the
  // existing R2 tab handler, which remains the only owner of photo and copy.
  for(const tab of [before,after]){
    tab.addEventListener('click',()=>onChangeStart(tab.dataset.change),true);
    tab.addEventListener('keydown',event=>{
      const keys=['ArrowLeft','ArrowRight','Home','End'];
      if(!keys.includes(event.key))return;
      const selected=tab===before?0:1;
      const next=event.key==='ArrowLeft'?1-selected:event.key==='ArrowRight'?1-selected:event.key==='Home'?0:1;
      if(next!==selected)onChangeStart(next===0?'before':'after');
    },true);
  }

  switchButton.addEventListener('click',()=>{
    const selected=panel.dataset.storeState==='before'?after:before;
    selected.click();
    // Focus stays with this replay button, avoiding a forced page movement.
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)clearCurtain();});
  connection?.addEventListener?.('change',()=>{if(connection.saveData)clearCurtain();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearCurtain();});
  window.addEventListener('pagehide',clearCurtain);
  updateSwitch();
  switchButton.hidden=false;
})();
