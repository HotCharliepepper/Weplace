/* WEPLACE R4.12: Progressive First Look on the public homepage.
 * No storage, identity data, cross-site requests or analytics. This is
 * a small, local illustration-based counterpart to the invite app.
 */
(function () {
  'use strict';
  const root=document.getElementById('wpfl-experience');
  if(!root)return;
  const app=root.querySelector('[data-wpfl-app]');
  const fallback=root.querySelector('[data-wpfl-fallback]');
  if(!app || !fallback)return;

  const rounds=[
    {id:'recognize',name:'식재료 구분',question:'어느 쪽이 고추일까요?',
      hint:'이름을 보지 않고 형태를 먼저 살펴보세요.',
      answer:'A는 고추, B는 오크라입니다. 고추의 비교적 매끈한 표면과 오크라의 세로 골·별 모양 단면을 확인해 보세요.',
      alts:['왼쪽 초록 식재료의 굽은 형태와 매끈한 표면을 보여주는 시각 예시','오른쪽 초록 식재료의 세로 골과 단면을 보여주는 시각 예시']},
    {id:'warmth',name:'온도감',question:'어느 쪽에서 따뜻함이 더 느껴지나요?',
      hint:'같은 요리를 바탕으로 김의 유무를 달리한 연출입니다.',
      answer:'A는 김을 더해 온도감을 표현했습니다. 김이 있다고 더 맛있다는 뜻은 아닙니다. 실제 제공되는 음식의 상태에 맞는 사진이 중요합니다.',
      alts:['같은 요리 위에 피어오르는 김을 시각적으로 덧입힌 예시','같은 요리에서 김을 제외한 표현 예시']},
    {id:'sheen',name:'윤기',question:'어느 쪽이 더 먹음직스럽나요?',
      hint:'음식의 구성은 같고 표면의 빛 반사를 다르게 표현했습니다.',
      answer:'A는 윤기와 하이라이트를 강조했습니다. 윤기는 신선도나 맛의 보증이 아니므로 실제 메뉴와 동떨어지지 않도록 확인합니다.',
      alts:['표면의 윤기와 빛 반사가 강조된 같은 요리의 그래픽','표면의 반사를 절제한 같은 요리의 그래픽']},
    {id:'plate',name:'접시와 구도',question:'어느 접시에 눈길이 더 가나요?',
      hint:'서로 다른 접시와 음식 배치의 인상을 비교합니다.',
      answer:'A는 강한 색 대비, B는 차분한 보색과 여백을 사용했습니다. 사진 소재와 배치도 달라 접시만의 효과를 측정한 비교는 아닙니다.',
      alts:['패턴과 대비가 강한 접시에 놓인 같은 요리의 그래픽','차분한 색과 여백이 있는 접시에 놓인 같은 요리의 그래픽']}
  ];
  const $=(selector)=>root.querySelector(selector);
  const heading=$('[data-wpfl-heading]'),hint=$('[data-wpfl-hint]'),
    counter=$('[data-wpfl-counter]'),progress=$('[data-wpfl-progress]'),
    panels=Array.from(root.querySelectorAll('[data-wpfl-choice]')),
    answerText=$('[data-wpfl-answer]'),reveal=$('[data-wpfl-reveal]'),
    next=$('[data-wpfl-next]'),skip=$('[data-wpfl-skip]'),
    result=$('[data-wpfl-result]'),resultTitle=$('[data-wpfl-result-title]'),
    resultLead=$('[data-wpfl-result-lead]'),resultList=$('[data-wpfl-result-list]'),
    restart=$('[data-wpfl-restart]');
  if(!heading||!hint||!counter||!progress||panels.length!==2||!answerText||!reveal||!next||!skip||!result||!resultTitle||!resultLead||!resultList||!restart)return;
  let step=0;
  let chosen=[null,null,null,null];
  let photoSequence=0;
  // The photo pack is optional and not bundled in this repository. A missing pack
  // should not create 404 requests for real visitors. Enable only after all
  // reviewed WebP files are included in the deployed build and rights verified.
  const photoPackEnabled=root.dataset.wpflPhotoPack==='ready';
  let photoPackState=photoPackEnabled?'unknown':'disabled';
  // The optional local AI-photo pack can be supplied later. Keep the
  // illustration visible unless the browser decodes an existing same-origin
  // WebP file; a missing photo never breaks the four-step experience.
  function useVerifiedPhoto(button,round,side,sequence){
    if(typeof Image==='undefined'||photoPackState==='missing'||photoPackState==='disabled')return;
    const filename=round.id+'-'+side+'.webp';
    const url='/assets/first-look/photos/'+filename;
    const probe=new Image();
    probe.decoding='async';
    probe.onload=function(){
      photoPackState='ready';
      if(step!==sequence.step || photoSequence!==sequence.generation)return;
      const img=button.querySelector('img');
      const visual=button.querySelector('[data-wpfl-visual]');
      if(!img||!visual)return;
      img.src=url;
      img.alt=round.alts[side==='a'?0:1]+' · AI 제작 실사풍 비교 이미지';
      visual.classList.add('is-photo');
    };
    probe.onerror=function(){ photoPackState='missing'; /* preserve SVG fallback */ };
    probe.src=url;
  }
  const setHidden=(el,hidden)=>{el.hidden=hidden;};
  const escId=(id)=>String(id).replace(/[^a-z0-9_-]/gi,'');
  function showStep(){
    const round=rounds[step];
    const sequence={step,generation:++photoSequence};
    counter.textContent=String(step+1).padStart(2,'0')+' / 04 · '+round.name;
    heading.textContent=round.question;
    hint.textContent=round.hint;
    progress.value=step+1;
    progress.setAttribute('aria-valuetext',round.name+' · '+(step+1)+'단계 중 4단계');
    panels.forEach((button,i)=>{
      const side=i===0?'a':'b';
      button.setAttribute('aria-pressed',chosen[step]===side?'true':'false');
      button.classList.toggle('is-chosen',chosen[step]===side);
      const visual=button.querySelector('[data-wpfl-visual]');
      if(visual) visual.className='wpfl-visual wpfl-visual--'+escId(round.id)+' wpfl-visual--'+side;
      const img=button.querySelector('img');
      if(img){
        img.src=round.id==='recognize'?'/assets/first-look/okra-pepper.svg':'/assets/first-look/sensory-dish.svg';
        img.alt=round.alts[i];
      }
      useVerifiedPhoto(button,round,side,sequence);
    });
    answerText.textContent=round.answer;
    setHidden(reveal,!chosen[step]);
    next.textContent=step===rounds.length-1?'우리 매장 점검 결과 보기 ↗':'다음 장면 보기 ↗';
    setHidden(result,true);
    setHidden(app,false);
  }
  function choose(value){
    if(value!=='a' && value!=='b' && value!=='skip')return;
    chosen[step]=value;
    panels.forEach(button=>{
      const isChosen=value===button.dataset.wpflChoice;
      button.setAttribute('aria-pressed',isChosen?'true':'false');
      button.classList.toggle('is-chosen',isChosen);
    });
    setHidden(reveal,false);
    answerText.textContent=rounds[step].answer;
    reveal.scrollIntoView({behavior:'auto',block:'nearest'});
  }
  function complete(){
    setHidden(app,true);
    setHidden(result,false);
    const sensory=chosen.slice(1).filter(v=>v==='a'||v==='b');
    const vivid=sensory.filter(v=>v==='a').length;
    const isVivid=sensory.length>0 && vivid/sensory.length>=.6;
    let title,lead,items;
    if(!sensory.length){
      title='첫 사진을 함께 살펴볼 차례입니다.';
      lead='이번에는 표현을 직접 고르기보다 차이를 확인했습니다. 현재 매장 사진부터 점검해 보세요.';
      items=['대표 사진이 실제 매장 모습과 같은가요?','메뉴·공간·이용 조건을 쉽게 찾을 수 있나요?','문의·예약 방법이 바로 이어지나요?'];
    }else if(isVivid){
      title='선명한 질감의 사진을 조금 더 골랐습니다.';
      lead='이번 선택에선 음식의 온도감과 윤기, 강한 대비가 눈길을 끌었습니다.';
      items=['사진 속 음식의 색과 윤기는 실제 메뉴와 맞나요?','한눈에 대표 메뉴가 보이나요?','가격·좌석·예약 안내가 사진 다음에 이어지나요?'];
    }else{
      title='차분한 표현의 사진을 조금 더 골랐습니다.';
      lead='이번 선택에선 정돈된 표현과 음식이 눈에 들어오는 구도가 편하게 느껴졌을 수 있습니다.';
      items=['대표 사진의 주제가 한눈에 읽히나요?','음식과 공간의 실제 크기·색감이 정확한가요?','방문 전에 필요한 조건이 뒤따라 있나요?'];
    }
    resultTitle.textContent=title;
    resultLead.textContent=lead;
    resultList.replaceChildren();
    items.forEach(item=>{
      const li=document.createElement('li');
      li.textContent=item;
      resultList.append(li);
    });
    const focus=result.querySelector('[data-wpfl-focus]');
    if(focus && typeof focus.focus==='function')focus.focus({preventScroll:false});
  }
  panels.forEach(button=>{
    button.addEventListener('click',()=>choose(button.dataset.wpflChoice));
  });
  skip.addEventListener('click',()=>choose('skip'));
  next.addEventListener('click',()=>{
    if(!chosen[step])return;
    if(step===rounds.length-1){complete();return;}
    step++;
    showStep();
    heading.focus({preventScroll:false});
  });
  restart.addEventListener('click',()=>{
    step=0;
    chosen=[null,null,null,null];
    showStep();
    heading.focus({preventScroll:false});
  });
  fallback.hidden=true;
  app.hidden=false;
  showStep();
})();