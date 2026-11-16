/* Hero Polish R2 — optional optical interaction only.
 * Existing Evidence Lab owns the photo state. This module only offers a clear,
 * reversible next action on the image itself; no tracking, storage or requests.
 */
(function(){
  "use strict";
  const page=document.querySelector('body.unified-r3.he-lab.he-polish');
  const stage=page?.querySelector('#photo-sequence [data-photo-stage]');
  const prompt=stage?.querySelector('[data-photo-prompt]');
  const text=prompt?.querySelector('[data-photo-prompt-title]');
  const action=prompt?.querySelector('[data-photo-prompt-action]');
  const kicker=prompt?.querySelector('[data-photo-prompt-kicker]');
  const after=page?.querySelector('#photo-sequence [data-photo-choice="after"]');
  const before=page?.querySelector('#photo-sequence [data-photo-choice="before"]');
  if(!stage||!prompt||!text||!action||!kicker||!after||!before)return;
  const render=()=>{
    const phase=stage.dataset.phase;
    const transition=phase==='transition';
    prompt.setAttribute('aria-busy',String(transition));
    if(transition){
      kicker.textContent='PHOTO / CHANGE';
      text.textContent='같은 매장의 다른 첫인상을 살펴보는 중입니다.';
      action.textContent='사진 전환 중';
    }else if(phase==='after'){
      kicker.textContent='PHOTO / SECOND LOOK';
      text.textContent='어떤 장면이 먼저 보이면 좋을까요?';
      action.textContent='차량이 보이는 외관 다시 보기';
    }else {
      kicker.textContent='PHOTO / FIRST LOOK';
      text.textContent='차량 뒤에는 어떤 메뉴가 기다릴까요?';
      action.textContent='베이징덕 사진 먼저 보기';
    }
  };
  prompt.addEventListener('click',()=>{
    if(stage.dataset.phase==='transition')return;
    const target=stage.dataset.phase==='after'?before:after;
    if(!target.disabled)target.click();
  });
  new MutationObserver(render).observe(stage,{attributes:true,attributeFilter:['data-phase']});
  render();
})();