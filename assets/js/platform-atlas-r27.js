/* R2.7 — Preview on hover/focus; commit on click/touch/keyboard; existing R2.6 state is the source of truth. */
(()=>{
 'use strict';
 const boot=()=>{
  const root=document.getElementById('channel-journey'), atlas=document.getElementById('platform-atlas');
  if(!root||!atlas)return;
  const cards=[...atlas.querySelectorAll('button[data-atlas-channel]')], detail=atlas.querySelector('#tp-atlas-detail');
  const logo=atlas.querySelector('#tp-atlas-logo'), word=atlas.querySelector('#tp-atlas-word'), name=atlas.querySelector('#tp-atlas-channel'), phase=atlas.querySelector('#tp-atlas-phase'), desc=atlas.querySelector('#tp-atlas-description'), note=atlas.querySelector('#tp-atlas-note'), go=atlas.querySelector('#tp-atlas-go'), hops=[...atlas.querySelectorAll('[data-atlas-hop]')];
  if(cards.length!==8||hops.length!==3||!detail||!logo||!word||!name||!phase||!desc||!note||!go)return;
  const names={instagram:'Instagram',threads:'Threads',karrot:'당근',google:'Google 검색',naver:'네이버 플레이스',gbp:'Google Business Profile',catchtable:'캐치테이블',site:'홈페이지'};
  const routeMap={social:['instagram','naver','catchtable'],story:['threads','naver','site'],search:['google','gbp','site'],local:['karrot','naver','site']};
  const preferred={instagram:'social',threads:'story',karrot:'local',google:'search',naver:'social',gbp:'search',catchtable:'social',site:'search'};
  const content={
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
  if(routeControls.length!==4||stepControls.length!==3||routeControls.some(b=>b.disabled)||stepControls.some(b=>b.disabled))return;
  let preview=null,selected='instagram';
  const currentRoute=()=>Object.hasOwn(routeMap,root.dataset.route)?root.dataset.route:'social';
  const currentStep=()=>Math.max(0,Math.min(2,Number(root.dataset.step)||0));
  function locationFor(key){
   const r=currentRoute(), route=routeMap[r].includes(key)?r:preferred[key];
   return {route,step:routeMap[route].indexOf(key)};
  }
  function show(key){
   if(!Object.hasOwn(content,key))return;
   const item=content[key],path=locationFor(key);
   detail.dataset.atlasActive=key;
   cards.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.atlasChannel===selected));if(b.dataset.atlasChannel===preview)b.dataset.preview='true';else delete b.dataset.preview;});
   name.textContent=names[key];phase.textContent='0'+(path.step+1)+' / '+['발견','확인','선택'][path.step];desc.textContent=item.desc;
   word.textContent=names[key]; word.hidden=Boolean(item.image);logo.hidden=!item.image;
   if(item.image){if(logo.getAttribute('src')!==item.image)logo.src=item.image;logo.alt=item.owned?'WEPLACE 기존 브랜드 로고':names[key]+' 공식 브랜드 리소스 이미지';}
   note.textContent=item.owned?'Weplace의 자체 제작 영역입니다. 실제 제작 예시는 아래 홈페이지 데모에서 확인할 수 있습니다.':item.image?'해당 플랫폼을 설명하는 공식 원본 이미지입니다. 공식 제휴나 추천 관계를 나타내지 않습니다.':'서비스명을 설명 목적으로 표기했습니다. 공식 로고는 사용 조건 확인 후 적용합니다.';
   hops.forEach((hop,i)=>{hop.textContent=names[routeMap[path.route][i]];hop.classList.toggle('is-current',i===path.step);});
  }
  function sync(){selected=routeMap[currentRoute()][currentStep()];show(preview||selected);}
  function commit(key){if(!Object.hasOwn(content,key))return;const dest=locationFor(key);preview=null;const routeButton=routeControls.find(b=>b.dataset.tpRoute===dest.route);if(routeButton&&currentRoute()!==dest.route)routeButton.click();const step=stepControls.find(b=>Number(b.dataset.tpStep)===dest.step);if(step&&currentStep()!==dest.step)step.click();sync();}
  const canHover=matchMedia('(hover: hover) and (pointer: fine)');
  cards.forEach(card=>{
   const key=card.dataset.atlasChannel;card.disabled=false;
   card.addEventListener('pointerenter',()=>{if(canHover.matches){preview=key;show(key);}});
   card.addEventListener('pointerleave',()=>{if(canHover.matches&&preview===key){preview=null;sync();}});
   card.addEventListener('focus',()=>{preview=key;show(key);});
   card.addEventListener('blur',()=>{if(preview===key){preview=null;sync();}});
   card.addEventListener('click',()=>commit(key));
  });
  logo.addEventListener('error',()=>{logo.hidden=true;word.hidden=false;});
  go.addEventListener('click',()=>commit(preview||selected));
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-route','data-step']});
  sync();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();