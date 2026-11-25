/* R2.6 — customer journey, not actual platform integration, ranking or reservations.
 * No storage, outbound tracking, automatic scroll, or network requests.
 * Platform names are text labels, not partnership logos. */
(()=>{
 'use strict';
 const boot=()=>{
   const root=document.getElementById('channel-journey');
   if(!root)return;
   const $=s=>root.querySelector(s), $$=s=>Array.from(root.querySelectorAll(s));
   const routes={
    social:{
     name:'사진을 보고 관심을 가진 손님',
     nodes:[
      {brand:'instagram',label:'Instagram',stage:'발견',question:'사진을 보니, 가보고 싶어집니다.',why:'공간과 음식 사진에서 처음 관심이 생깁니다. 하지만 위치와 예약 방법은 아직 알아봐야 합니다.',work:'공간·메뉴의 표현과 실제 매장 정보를 맞추고, 다음에 확인할 경로를 설계합니다.',summary:'먹고 싶은 한 접시, 함께 앉고 싶은 공간.',facts:['공간과 메뉴 사진','매장명: 모온 · 가상 매장','방문 정보는 다음 화면에서 확인'],next:'후기와 위치 확인하기',pic:'room'},
      {brand:'naver',label:'네이버 플레이스',stage:'확인',question:'가보고 싶다면, 이제 실제 정보를 확인합니다.',why:'손님은 후기, 위치, 영업 안내를 비교합니다. 앞에서 본 매장과 같은 곳인지 알아보기 쉬워야 합니다.',work:'대표 사진과 매장명, 위치·영업 안내를 원본과 대조해 정리합니다.',summary:'관심이 생긴 매장의 기본 정보와 후기 영역.',facts:['매장명 · 위치 확인','대표 사진 · 후기 영역','예약 방법을 찾는 경로'],next:'예약 안내 확인하기',pic:'memory'},
      {brand:'catchtable',label:'캐치테이블',stage:'선택',question:'가고 싶은 마음 다음에, 예약할 방법이 필요합니다.',why:'식당에 따라 예약 플랫폼에서 인원, 희망 시간, 이용 조건을 확인할 수 있습니다.',work:'실제 예약 채널이 있는 경우 매장 정보와 예약 안내가 일치하는지 점검합니다. 운영 여부는 협의합니다.',summary:'예약을 결정하기 전에 확인해야 할 정보.',facts:['희망 인원 · 날짜 · 시간','이용 조건 및 예약 방식','실제 예약 가능 여부는 해당 매장에서 확인'],next:'이 경로 체험 마치기',pic:'room'}
     ]},
    story:{
     name:'이야기를 읽고 관심을 가진 손님',
     nodes:[
      {brand:'threads',label:'Threads',stage:'발견',question:'한 문장이 매장을 기억하게 할 수 있습니다.',why:'매장 이야기나 메뉴에 관한 게시물을 읽은 손님은 사진과 실제 위치가 궁금해질 수 있습니다.',work:'브랜드 이야기와 확인된 운영 사실이 어긋나지 않도록 콘텐츠 방향을 정합니다. 수행 범위는 협의합니다.',summary:'매일 준비하는 음식과 매장의 이야기를 읽는 화면.',facts:['매장 이야기 · 게시물 예시','일관된 매장명','다음 검색에 필요한 정보'],next:'매장 정보 확인하기',pic:'memory'},
      {brand:'naver',label:'네이버 플레이스',stage:'확인',question:'읽었던 이야기와 실제 매장이 이어집니다.',why:'검색 화면에서 메뉴와 사진, 위치를 대조하며 방문할 수 있는 곳인지 확인합니다.',work:'대표 사진과 설명, 위치·영업 정보를 같은 기준에서 정리합니다.',summary:'이야기에서 검색으로 넘어온 손님의 확인 화면.',facts:['같은 매장명','메뉴 및 위치 안내','후기와 방문 전 질문'],next:'홈페이지에서 자세히 보기',pic:'memory'},
      {brand:'site',label:'매장 홈페이지',stage:'선택',question:'방문 전에 필요한 답이 한 곳에 있으면?',why:'공간, 메뉴, 예약 및 FAQ를 다시 찾아 헤매지 않도록 공식 안내를 확인합니다.',work:'매장에 맞춘 홈페이지를 직접 설계하고 검색·지도·예약 안내와 연결합니다.',summary:'사진과 이용 안내를 한곳에서 읽는 제작 예시.',facts:['메뉴 · 공간','입구 · 주차 · 영업 안내','예약 방법 · 자주 묻는 질문'],next:'이 경로 체험 마치기',pic:'room'}
     ]},
    search:{
     name:'Google에서 검색한 손님',
     nodes:[
      {brand:'google',label:'Google 검색',stage:'발견',question:'어떤 매장이 있는지 검색부터 합니다.',why:'손님은 원하는 음식, 지역 또는 여행 중 필요한 장소를 검색할 수 있습니다.',work:'홈페이지의 정확한 매장명과 실제 운영정보, 검색이 이해할 수 있는 문장을 정리합니다.',summary:'지역과 음식으로 매장을 탐색하는 가상 검색 화면.',facts:['지역 · 메뉴를 검색','매장 이름과 소개','지도 또는 홈페이지 확인'],next:'지도와 영업 정보 확인하기',pic:'memory'},
      {brand:'gbp',label:'Google 지도 · GBP',stage:'확인',question:'지금 갈 수 있는 매장인지 확인합니다.',why:'지도에서 위치, 영업시간, 사진을 살펴봅니다. 다른 언어의 고객에게도 기본 정보가 정확해야 합니다.',work:'Google Business Profile의 상호·영업 정보·사진·위치를 매장 원본과 대조합니다.',summary:'Google Business Profile에서 확인하는 정보 예시.',facts:['위치 · 입구','영업시간 · 휴무','매장 사진 · 공식 안내 링크'],next:'이용 안내 확인하기',pic:'room'},
      {brand:'site',label:'매장 홈페이지',stage:'선택',question:'필요한 정보가 명확하면 다음 행동을 정하기 쉽습니다.',why:'손님은 실제 이용 조건, 메뉴·가격, 예약 방법을 확인해 방문 여부를 판단합니다.',work:'확인된 정보를 홈페이지에 정리하고, 필요한 경우 승인된 다국어 안내와 연결합니다.',summary:'공식 홈페이지에서 이용 전 질문에 답하는 화면.',facts:['메뉴 · 이용 안내','언어별 안내는 협의 후 제공','예약 및 방문 방법 확인'],next:'이 경로 체험 마치기',pic:'room'}
     ]},
    local:{
     name:'동네에서 매장을 찾는 손님',
     nodes:[
      {brand:'karrot',label:'당근',stage:'발견',question:'가까운 곳의 새로운 매장을 발견합니다.',why:'지역 소식과 사업장 소개에서 관심이 생길 수 있습니다. 실제 위치와 운영 정보는 다시 확인합니다.',work:'지역 고객에게 필요한 소개와 운영 사실을 검토하고 연결 경로를 정합니다. 운영 범위는 협의합니다.',summary:'동네 생활 속에서 매장을 발견하는 가상 소개.',facts:['지역 소식 · 매장 소개','동네에서 찾는 위치','방문 전 확인할 질문'],next:'지도와 매장 정보 확인하기',pic:'room'},
      {brand:'naver',label:'네이버 플레이스',stage:'확인',question:'가깝다는 사실만으로 결정하지는 않습니다.',why:'메뉴와 후기, 길찾기와 주차를 확인해 실제로 찾아가기 편한지 살펴봅니다.',work:'대표 사진·위치·방문 안내·실제 예약 정보를 확인하여 정리합니다.',summary:'지역에서 발견한 매장을 검색한 화면.',facts:['주소 · 입구','주차 · 영업 안내','대표 메뉴와 사진'],next:'공식 이용 안내 보기',pic:'memory'},
      {brand:'site',label:'매장 홈페이지',stage:'선택',question:'가까운 매장이, 가기 쉬운 매장이 되도록.',why:'필요한 안내를 확인한 손님은 방문하거나 문의할지 스스로 결정할 수 있습니다.',work:'공식 홈페이지와 확인된 채널을 연결하고, 실제 고객 화면에서 점검합니다.',summary:'방문 전 필요한 정보를 한곳에서 확인하는 예시.',facts:['메뉴와 공간','찾아오는 길과 FAQ','예약·문의 방법'],next:'이 경로 체험 마치기',pic:'room'}
     ]}
   };
   const state={route:'social',step:0,complete:false};
   const routeButtons=$$('[data-tp-route]'), nodes=$$('[data-tp-step]'), nexts=$$('[data-tp-next]'), back=$('[data-tp-back]');
   const question=$('#tp-question'), explain=$('#tp-explain'), work=$('#tp-work'), progress=$('#tp-progress'), platform=$('#tp-platform'), summary=$('#tp-summary'), facts=$$('[data-tp-fact]'), image=$('#tp-photo'), complete=$('#tp-complete');
   if(routeButtons.length!==4||nodes.length!==3||!back||!question||!explain||!work||!progress||!platform||!summary||facts.length!==3||!image||!complete||nexts.length!==2)return;
   const pics={room:{src:'/assets/hero-r2/room.webp',alt:'가상 매장 모온의 실내를 표현한 참고 사진'},memory:{src:'/assets/hero-r2/memory.webp',alt:'가상 매장 모온의 음식과 식사 자리를 표현한 참고 사진'}};
   const render=()=>{
    const r=routes[state.route], n=r.nodes[state.step], selected=pics[n.pic];
    root.dataset.route=state.route; root.dataset.step=String(state.step); root.dataset.complete=String(state.complete);
    routeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tpRoute===state.route)));
    nodes.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===state.step));b.querySelector('small').textContent=(i+1)+' / '+r.nodes[i].stage;b.querySelector('b').textContent=r.nodes[i].label;});
    progress.textContent='0'+(state.step+1)+' / 03 · '+n.stage;
    question.textContent=n.question; explain.textContent=n.why;work.textContent=n.work;
    platform.textContent=n.label;platform.dataset.brand=n.brand;summary.textContent=n.summary;
    facts.forEach((el,i)=>{el.textContent=n.facts[i];});
    if(image.getAttribute('src')!==selected.src)image.src=selected.src;
    image.alt=selected.alt;
    back.disabled=state.step===0;
    const label=state.complete?'이 경로 처음부터 ↶':n.next+(state.step<2?' →':'');
    nexts.forEach(b=>{b.disabled=false;b.textContent=label;});
    complete.hidden=!state.complete;
   };
   function selectRoute(v){if(!Object.prototype.hasOwnProperty.call(routes,v))return;state.route=v;state.step=0;state.complete=false;render();}
   function selectStep(i){if(!Number.isInteger(i)||i<0||i>2)return;state.step=i;state.complete=false;render();}
   routeButtons.forEach(b=>{b.disabled=false;b.addEventListener('click',()=>selectRoute(b.dataset.tpRoute));});
   nodes.forEach((b,i)=>{b.disabled=false;b.addEventListener('click',()=>selectStep(i));});
   nexts.forEach(b=>b.addEventListener('click',()=>{if(state.complete){selectStep(0);return;}if(state.step<2){selectStep(state.step+1);return;}state.complete=true;render();}));
   back.addEventListener('click',()=>selectStep(Math.max(0,state.step-1)));
   render();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();