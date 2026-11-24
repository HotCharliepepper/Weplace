/* R2.9 — Fixed signal board. Preview on hover/focus, commit on tap/click; existing R2.6 state remains the source of truth. */
(()=>{
 'use strict';
 const boot=()=>{
  const root=document.getElementById('channel-journey'), atlas=document.getElementById('platform-atlas');
  if(!root||!atlas)return;
  const cards=[...atlas.querySelectorAll('button[data-atlas-channel]')], detail=atlas.querySelector('#tp-atlas-detail');
  const logo=atlas.querySelector('#tp-atlas-logo'), word=atlas.querySelector('#tp-atlas-word'), name=atlas.querySelector('#tp-atlas-channel'), phase=atlas.querySelector('#tp-atlas-phase'), desc=atlas.querySelector('#tp-atlas-description'), note=atlas.querySelector('#tp-atlas-note'), go=atlas.querySelector('#tp-atlas-go'), hops=[...atlas.querySelectorAll('[data-atlas-hop]')];
  if(cards.length!==10||hops.length!==3||!detail||!logo||!word||!name||!phase||!desc||!note||!go)return;
  const names={instagram:'Instagram',threads:'Threads',karrot:'당근',google:'Google 검색',naver:'네이버 플레이스',gbp:'Google Business Profile',catchtable:'캐치테이블',site:'홈페이지',ai:'AI 검색',inquiry:'예약·문의'};
  const routeMap={social:['instagram','naver','catchtable'],story:['threads','naver','site'],search:['google','gbp','site'],local:['karrot','naver','site'],ai:['ai','naver','site'],direct:['ai','naver','inquiry']};
  const preferred={instagram:'social',threads:'story',karrot:'local',google:'search',naver:'social',gbp:'search',catchtable:'social',site:'search',ai:'ai',inquiry:'direct'};
  const content={
   ai:{desc:'자연어로 매장을 찾고, 관련 출처에서 실제 위치와 영업 정보, 예약 방법을 다시 확인할 수 있습니다.',isAI:true},
   inquiry:{desc:'확인된 이용 조건을 보고 매장이 제공하는 예약이나 문의 방법을 선택합니다. 이 화면에서 실제로 신청하지 않습니다.'},
   instagram:{desc:'공간과 메뉴를 보고 관심을 가진 손님은 사진만으로 알 수 없는 후기와 위치를 확인합니다.',image:'/assets/brand/platforms-r27/instagram-official.png'},
   threads:{desc:'매장 이야기를 읽고 관심이 생기면, 검색으로 사진과 운영 정보를 다시 살펴볼 수 있습니다.',image:'/assets/brand/platforms-r27/threads-official.png'},
   karrot:{desc:'가까운 매장을 발견한 손님은 위치와 영업 여부, 방문 전에 필요한 안내를 확인할 수 있습니다.'},
   google:{desc:'원하는 지역과 메뉴를 검색해 후보를 찾고, 지도와 매장의 공식 안내로 이동할 수 있습니다.'},
   naver:{desc:'대표 사진과 후기, 위치, 예약 방법을 살펴보며 방문할 곳을 판단합니다.'},
   gbp:{desc:'Google Business Profile의 위치·영업시간·사진은 검색과 지도에서 고객이 확인하는 정보입니다.'},
   catchtable:{desc:'예약 서비스를 이용하는 매장이라면 방문 전에 인원, 시간, 이용 조건과 예약 방법을 살펴볼 수 있습니다.'},
   site:{desc:'메뉴와 공간, 이용 안내, 자주 묻는 질문을 한곳에 모아 매장의 공식 안내로 연결합니다.',image:'/assets/brand/r42/weplace-logo-dark.svg',owned:true}
  };
  const routeControls=[...root.querySelectorAll('button[data-tp-route]')], stepControls=[...root.querySelectorAll('button[data-tp-step]')];
  if(routeControls.length!==6||stepControls.length!==3||routeControls.some(b=>b.disabled)||stepControls.some(b=>b.disabled))return;
  let preview=null,selected='ai';
  const status=atlas.querySelector('#tp-signal-status'), aiSymbol=atlas.querySelector('.tp-atlas-ai-symbol');let lastSignal='',pulse='a',displayPath=routeMap.ai;
  const map=atlas.querySelector('#tp-signal-map'),svg=atlas.querySelector('#tp-connection-svg'),muted=atlas.querySelector('#tp-connections-muted'),active=atlas.querySelector('#tp-connections-active');
  const ns='http://www.w3.org/2000/svg';
  const edges=[...new Map(Object.values(routeMap).flatMap(v=>[[v[0],v[1]],[v[1],v[2]]]).map(pair=>[pair.join(':'),pair])).values()];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  function drawPaths(pulseNow=false){
   if(!map||!svg||!muted||!active)return;
   const box=map.getBoundingClientRect();if(!box.width||!box.height)return;
   svg.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
   const vertical=matchMedia('(max-width: 900px)').matches;
   const getRect=id=>cards.find(c=>c.dataset.atlasChannel===id)?.getBoundingClientRect();
   function curve(pair){
    const a=getRect(pair[0]),b=getRect(pair[1]);if(!a||!b)return null;
    if(vertical){const x1=a.left+a.width/2-box.left,y1=a.bottom-box.top,x2=b.left+b.width/2-box.left,y2=b.top-box.top;
     const middle=(y1+y2)/2;return {d:'M '+x1+' '+y1+' C '+x1+' '+middle+' '+x2+' '+middle+' '+x2+' '+y2,x:x2,y:y2};}
    const x1=a.right-box.left,y1=a.top+a.height/2-box.top,x2=b.left-box.left,y2=b.top+b.height/2-box.top,middle=(x1+x2)/2;
    return {d:'M '+x1+' '+y1+' C '+middle+' '+y1+' '+middle+' '+y2+' '+x2+' '+y2,x:x2,y:y2};
   }
   function path(group,d,cls){const el=document.createElementNS(ns,'path');el.setAttribute('d',d);el.setAttribute('class',cls);group.append(el);return el;}
   muted.replaceChildren();active.replaceChildren();
   edges.forEach(pair=>{const v=curve(pair);if(v)path(muted,v.d,'tp-wire-muted');});
   [[displayPath[0],displayPath[1]],[displayPath[1],displayPath[2]]].forEach((pair,i)=>{const v=curve(pair);if(!v)return;path(active,v.d,'tp-wire-halo');path(active,v.d,'tp-wire-live');
    if(pulseNow&&!reduce.matches){const spark=path(active,v.d,'tp-wire-pulse');spark.setAttribute('pathLength','100');spark.style.animationDelay=(i*.28)+'s';}
    const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',v.x);dot.setAttribute('cy',v.y);dot.setAttribute('r','3.4');dot.setAttribute('class','tp-wire-dot');active.append(dot);
   });
  }
  function schedule(pulseNow){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>drawPaths(pulseNow));}
  if(map&&'ResizeObserver' in window)new ResizeObserver(()=>schedule(false)).observe(map);
  window.addEventListener('resize',()=>schedule(false),{passive:true});
  document.fonts?.ready.then(()=>schedule(false));
  const currentRoute=()=>Object.hasOwn(routeMap,root.dataset.route)?root.dataset.route:'ai';
  const currentStep=()=>Math.max(0,Math.min(2,Number(root.dataset.step)||0));
  function locationFor(key){
   const r=currentRoute(), route=routeMap[r].includes(key)?r:preferred[key];
   return {route,step:routeMap[route].indexOf(key)};
  }
  function show(key){
   if(!Object.hasOwn(content,key))return;
   const item=content[key],path=locationFor(key);
   detail.dataset.atlasActive=key;
   const visiblePath=routeMap[path.route];displayPath=visiblePath;
   cards.forEach(b=>{const id=b.dataset.atlasChannel;b.setAttribute('aria-pressed',String(id===selected));if(id===preview)b.dataset.preview='true';else delete b.dataset.preview;
    if(visiblePath.includes(id))b.dataset.onPath='true';else delete b.dataset.onPath;
    if(id===key)b.dataset.signalFocus='true';else delete b.dataset.signalFocus;});
   if(status)status.textContent=(preview&&preview!==selected?'경로 미리보기 · ':'선택한 경로 · ')+visiblePath.map(id=>names[id]).join(' → ');
   const signature=path.route+':'+key+':'+Boolean(preview);
   const changed=Boolean(lastSignal&&signature!==lastSignal);if(changed){pulse=pulse==='a'?'b':'a';atlas.dataset.signalPulse=pulse;}
   lastSignal=signature;schedule(changed);
   name.textContent=names[key];phase.textContent='0'+(path.step+1)+' / '+['발견','확인','선택'][path.step];desc.textContent=item.desc;
   word.textContent=names[key]; word.hidden=Boolean(item.image||item.isAI);logo.hidden=!item.image;if(aiSymbol)aiSymbol.hidden=!item.isAI;
   if(item.image){if(logo.getAttribute('src')!==item.image)logo.src=item.image;logo.alt=item.owned?'WEPLACE 기존 브랜드 로고':names[key]+' 공식 브랜드 리소스 이미지';}
   note.textContent=item.isAI?'가상 AI 검색 경로입니다. AI 답변·인용·노출은 보장되지 않습니다.':item.owned?'Weplace의 자체 제작 영역입니다. 실제 제작 예시는 아래 홈페이지 데모에서 확인할 수 있습니다.':item.image?'해당 플랫폼을 설명하는 공식 원본 이미지입니다. 공식 제휴나 추천 관계를 나타내지 않습니다.':'서비스명을 설명 목적으로 표기했습니다. 공식 로고는 사용 조건 확인 후 적용합니다.';
   hops.forEach((hop,i)=>{hop.textContent=names[routeMap[path.route][i]];hop.classList.toggle('is-current',i===path.step);});
  }
  function sync(){selected=routeMap[currentRoute()][currentStep()];show(preview||selected);}
  function commit(key){if(!Object.hasOwn(content,key))return;const dest=locationFor(key);preview=null;const routeButton=routeControls.find(b=>b.dataset.tpRoute===dest.route);if(routeButton&&currentRoute()!==dest.route)routeButton.click();const step=stepControls.find(b=>Number(b.dataset.tpStep)===dest.step);if(step&&currentStep()!==dest.step)step.click();sync();}
  const canHover=matchMedia('(hover: hover) and (pointer: fine)');
  cards.forEach(card=>{
   const key=card.dataset.atlasChannel;card.disabled=false;
   card.addEventListener('pointerenter',()=>{if(canHover.matches){preview=key;show(key);}});
   card.addEventListener('pointerleave',()=>{if(canHover.matches&&preview===key){preview=null;sync();}});
   card.addEventListener('focus',()=>{if(card.matches(':focus-visible')){preview=key;show(key);}});
   card.addEventListener('blur',()=>{if(preview===key){preview=null;sync();}});
   card.addEventListener('click',()=>commit(key));
  });
  logo.addEventListener('error',()=>{if(!logo.hidden){logo.hidden=true;word.hidden=false;}});
  go.addEventListener('click',()=>commit(preview||selected));
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-route','data-step']});
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();