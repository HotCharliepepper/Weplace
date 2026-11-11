/* R2-A: anonymous, in-memory UI only. No form endpoint, analytics or persistence. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  if (!$('#focus-scene')) return;
  const params = new URLSearchParams(location.search);
  const entry = document.documentElement.dataset.afEntry;
  const campaign = document.documentElement.dataset.afCampaign;
  const campaigns = {
    dining: {kicker:'식당의 첫 화면', opening:'식사는 마음에 드는데,', question:'예약은 왜 망설여질까요?', description:'매장을 찾고 나서도, 손님은 한 번 더 확인합니다.', image:'/img/ind-dining.jpg', alt:'따뜻한 조명 아래 식사 자리가 준비된 공간', details:['함께 앉을 자리','가는 길과 주차','편안한 예약']},
    stay: {kicker:'숙소의 첫 화면', opening:'머물고 싶은 숙소,', question:'도착하는 길도 보이나요?', description:'객실이 마음에 들었다면, 도착해서 문을 여는 순간도 궁금해집니다.', image:'/img/ind-stay.jpg', alt:'노을빛이 들어오는 숙소의 휴식 공간 참고 이미지', details:['머물 방의 모습','도착과 체크인','편안한 하루']},
    wellness: {kicker:'웰니스의 첫 화면', opening:'쉬고 싶은 마음이,', question:'첫 방문으로 이어지려면?', description:'처음 가는 곳에서도, 어떤 공간에서 어떻게 맞이할지 알 수 있도록.', image:'/img/ind-spa.jpg', alt:'차분한 조명과 정돈된 관리 공간 참고 이미지', details:['편안한 관리 공간','입구와 첫 안내','나에게 맞는 시간']},
    local: {kicker:'우리 동네의 첫 화면', opening:'찾아낸 우리 매장,', question:'다음 행동도 보이나요?', description:'좋은 발견이 방문으로 이어지도록. 손님이 다시 확인하는 화면을 살펴봅니다.', image:'/img/weplace-hero-surface.jpg', alt:'자연광이 비치는 매장 입구 참고 이미지', details:['우리 매장의 모습','찾아오는 방법','문의와 방문']}
  };
  const subjects = {
    photo: {label:'사진', person:'사진을 먼저 보는 손님', title:'“우리 네 명이\n편하게 앉을 수 있을까?”', description:'음식이 마음에 들었다면, 다음에는 함께 앉을 자리가 궁금해집니다. 좌석과 공간이 보이는 한 장을 더해봅니다.', surface:'대표 메뉴 다음에 좌석과 공간이 보이는지 살펴봅니다.', order:'좌석 사진 고르기 → 이용 인원 안내 → 예약 화면 연결', offer:'사진에서 확인이 필요한 부분을 찾았다면, 대표사진의 순서와 공간 안내부터 정리합니다.', deliverables:['대표사진 순서','좌석 안내','예약 연결'], beforeTitle:'“자리 사진은 어디에 있지?”', before:'메뉴는 보이지만, 함께 앉을 자리는 다른 탭에서 다시 찾아야 합니다.', afterTitle:'“우리 넷이 앉을 자리도 보이네.”', after:'메뉴와 좌석을 함께 보여주면, 방문할 모습을 한 화면에서 그려볼 수 있습니다.'},
    route: {label:'찾아오는 길', person:'길을 먼저 확인하는 손님', title:'“이 문으로 들어가면 될까?\n차는 어디에 세우지?”', description:'주소를 알아도 입구 앞에서 다시 멈출 수 있습니다. 실제 입구의 모습과 주차 위치를 함께 안내해봅니다.', surface:'주소와 함께 입구 사진·주차 안내를 찾을 수 있는지 살펴봅니다.', order:'입구 사진 고르기 → 주차 위치 표시 → 지도 안내 연결', offer:'길 안내에서 확인이 필요한 부분을 찾았다면, 입구 사진과 주차 정보를 한 흐름으로 정리합니다.', deliverables:['입구 사진','주차 안내','지도 연결'], beforeTitle:'“주차 안내는 어느 탭에 있지?”', before:'주소를 확인한 뒤에도 입구와 주차 안내를 찾아 다른 화면으로 이동해야 합니다.', afterTitle:'“입구와 주차 위치까지 알겠네.”', after:'가는 길과 마지막 도착 지점을 함께 보여주면, 처음 방문할 때 다시 확인할 일을 줄일 수 있습니다.'},
    booking: {label:'예약', person:'예약을 먼저 확인하는 손님', title:'“몇 명이, 몇 시에\n갈 수 있을까?”', description:'가고 싶은 마음이 들었을 때, 인원과 시간을 바로 고를 수 있도록. 다음 행동을 가까이 놓아봅니다.', surface:'예약 방법과 인원·시간 선택이 한눈에 보이는지 살펴봅니다.', order:'예약 방법 안내 → 인원·시간 확인 → 신청 전 확인사항', offer:'예약에서 확인이 필요한 부분을 찾았다면, 인원·시간 선택과 신청 전 안내를 정리합니다.', deliverables:['예약 방법','인원·시간 안내','예약 전 FAQ'], beforeTitle:'“예약은 어디에서 하지?”', before:'예약 방법을 찾기 위해 소식과 소개를 다시 읽으면, 다음 행동까지 거리가 생깁니다.', afterTitle:'“인원과 시간을 확인하면 되겠네.”', after:'방문 정보 가까이에 예약 방법을 놓으면, 무엇을 먼저 해야 할지 쉽게 알 수 있습니다.'}
  };
  const state = {focus:'photo', compare:'scattered', meeting:'online', guests:'4', time:'18:00', store:'', region:'', previewed:false};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gs = window.gsap, st = window.ScrollTrigger;
  const events = [];
  const team = params.get('team') === '1';
  let motion = null, canAnimate = false;
  const animated = new Set();
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const safeUtms = new URLSearchParams();
  utmKeys.forEach(key => {const v=params.get(key); if(v && /^[a-zA-Z0-9_-]{1,80}$/.test(v)) safeUtms.set(key,v);});
  function log(event, value='') { if(!team) return; events.push({event,value}); $('#team-events').textContent=events.slice(-12).map(x=>x.event+(x.value?' / '+x.value:'')).join('\n'); }
  function reveal(node, seconds=.42) {
    if(!canAnimate || !node) return;
    gs.killTweensOf(node); animated.add(node);
    gs.fromTo(node,{opacity:.28},{opacity:1,duration:seconds,ease:'power2.out',clearProps:'opacity'});
  }
  function updateMeeting() {
    const subject=subjects[state.focus];
    $('#meeting-lead').textContent=`대표님이 먼저 고른 ${subject.label}부터 확인하겠습니다.`;
    $('#meeting-note').value=`안녕하세요. Weplace에서 매장 첫 화면 예시를 살펴봤습니다.\n매장: ${state.store || '(매장명)'} / 지역: ${state.region || '(지역)'}\n먼저 함께 확인하고 싶은 부분: ${subject.label}\n희망 방식: ${state.meeting==='online'?'온라인 화면 공유':'매장 방문 (가능 지역과 조건 협의)'}\n현재 화면을 함께 보며 0원 진단의 범위와 가능한 일정을 안내받고 싶습니다.`;
    $('#meeting-help').textContent=state.meeting==='online'?'우리 매장의 현재 화면을 펼쳐놓고, 손님이 궁금해할 부분부터 이야기합니다.':'실제 입구와 공간을 함께 보며 확인합니다. 방문 가능 지역과 진행 조건은 일정 요청 후 협의합니다.';
    $('#copy-status').textContent='복사한 문구는 원하시는 대화창에서 직접 보내주세요.';
  }
  function updateReport() {
    const subject=subjects[state.focus];
    $('#report-meta').textContent=(state.previewed?`${state.region} · ${state.store}`:'가상 매장 모온')+` / ${subject.label} 중심의 구성 예시`;
    $('#report-surface').textContent=subject.surface;
    $('#report-question').textContent=subject.title.replace('\n',' ');
    $('#report-order').textContent=subject.order;
    $('#offer-description').textContent=subject.offer;
    ['#offer-one','#offer-two','#offer-three'].forEach((id,i)=>$(id).textContent=subject.deliverables[i]);
    if(state.previewed) $('#result-summary').textContent=`${state.region} · ${state.store} / ${subject.label}. 입력과 선택만 반영한 구성 예시이며, 실제 매장 분석이나 접수가 진행된 것은 아닙니다.`;
  }
  function updateCompare(mode, animate=true) {
    state.compare=mode;
    $$('[data-compare]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.compare===mode)));
    $$('[data-compare-layer]').forEach(layer=>layer.hidden=layer.dataset.compareLayer!==mode);
    const subject=subjects[state.focus], clear=mode==='clear';
    $('#compare-title').textContent=clear?subject.afterTitle:subject.beforeTitle;
    $('#compare-description').textContent=clear?subject.after:subject.before;
    if(animate) reveal($(`[data-compare-layer="${mode}"]`),.48);
  }
  function setFocus(key, animate=true) {
    if(!subjects[key]) return;
    state.focus=key;
    const subject=subjects[key];
    $$('[data-focus],[data-form-focus]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.focus || b.dataset.formFocus)===key)));
    $$('[data-scene]').forEach(scene=>scene.hidden=scene.dataset.scene!==key);
    $('#focus-scene').dataset.currentFocus=key;
    $('#focus-label').textContent=subject.person;
    $('#focus-title').textContent=subject.title;
    $('#focus-title').style.whiteSpace='pre-line';
    $('#focus-description').textContent=subject.description;
    updateCompare(state.compare,false); updateReport(); updateMeeting();
    if(animate) reveal($(`[data-scene="${key}"]`));
  }
  if(entry==='ad') {
    const c=campaigns[campaign];
    $('#ad-kicker').textContent=`WEPLACE / ${c.kicker}`;
    $('#ad-opening').textContent=c.opening; $('#ad-question').textContent=c.question;
    $('#ad-description').textContent=c.description;
    $('#ad-image').src=c.image; $('#ad-image').alt=c.alt;
    ['#ad-detail-one','#ad-detail-two','#ad-detail-three'].forEach((id,i)=>$(id).textContent=c.details[i]);
    document.title=`${c.opening} ${c.question} — Weplace`;
  } else {
    const script=document.createElement('script'); script.src='/assets/js/emotional-hero-r2.js'; document.body.append(script);
  }
  $$('[data-af-home], [data-hero-route]').forEach(a=>{
    const url=new URL(a.getAttribute('href'),location.href);
    if(url.origin!==location.origin && url.origin!=='https://invite.withweplace.kr') return;
    for(const [key,value] of safeUtms) url.searchParams.set(key,value);
    a.href=url.href;
  });
  $$('[data-focus]').forEach(b=>b.addEventListener('click',()=>{setFocus(b.dataset.focus);log('interest_selected',state.focus);}));
  $$('[data-form-focus]').forEach(b=>b.addEventListener('click',()=>{setFocus(b.dataset.formFocus);log('diagnosis_focus_selected',state.focus);}));
  $$('[data-compare]').forEach(b=>b.addEventListener('click',()=>{updateCompare(b.dataset.compare);log('compare_view',state.compare);}));
  $$('[data-guests],[data-time]').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.guests) state.guests=b.dataset.guests; else state.time=b.dataset.time;
    $$('[data-guests]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.guests===state.guests)));
    $$('[data-time]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.time===state.time)));
    $('#booking-status').textContent=`${state.guests}인 · ${state.time} 선택 / 예약 화면 예시`;
  }));
  $('#diagnosis-form').addEventListener('submit',event=>{
    event.preventDefault();
    const fields=[$('#store-name'),$('#store-region')];
    fields.forEach(f=>f.removeAttribute('aria-invalid'));
    const empty=fields.find(f=>!f.value.trim());
    if(empty){empty.setAttribute('aria-invalid','true');$('#form-error').hidden=false;$('#form-error').textContent=empty.id==='store-name'?'매장명을 입력해 주세요. 가상 이름도 괜찮습니다.':'지역을 입력해 주세요. 예: 서울 영등포';empty.focus();return;}
    state.store=fields[0].value.trim().slice(0,60); state.region=fields[1].value.trim().slice(0,60); state.previewed=true;
    $('#form-error').hidden=true; $('#form-result').hidden=false;
    updateReport(); updateMeeting(); reveal($('.af-report'),.5);log('diagnosis_preview',state.focus);
  });
  // Never leave an old store/region in the request if a visitor edits the fields.
  ['#store-name','#store-region'].forEach(id=>$(id).addEventListener('input',()=>{
    $(id).removeAttribute('aria-invalid');
    state.store=$('#store-name').value.trim().slice(0,60); state.region=$('#store-region').value.trim().slice(0,60);
    state.previewed=false; $('#form-result').hidden=true;updateReport();updateMeeting();
  }));
  $$('[data-meeting]').forEach(b=>b.addEventListener('click',()=>{
    state.meeting=b.dataset.meeting;
    $$('[data-meeting]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    updateMeeting();log('meeting_preference',state.meeting);
  }));
  $('#copy-note').addEventListener('click',async()=>{
    const text=$('#meeting-note').value;
    try {if(!navigator.clipboard?.writeText) throw new Error('unavailable'); await navigator.clipboard.writeText(text); $('#copy-status').textContent='요청문을 복사했습니다. 아직 전송되거나 일정이 확정된 것은 아닙니다.';log('meeting_copy','copied');}
    catch(_){$('#meeting-note').focus();$('#meeting-note').select();$('#copy-status').textContent='자동 복사가 제한되어 문구를 선택했습니다. 길게 누르거나 Ctrl/Cmd+C로 복사해 주세요.';log('meeting_copy','manual');}
  });
  // Native anchors retain campaign/UTM and browser history. Focus follows only an explicit navigation.
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
    const target=$(a.getAttribute('href'));
    if(!target) return;
    const heading=target.querySelector('h1,h2') || target;
    heading.setAttribute('tabindex','-1');requestAnimationFrame(()=>heading.focus({preventScroll:true}));
    if(a.id==='continue-ad') log('ad_continue','experience');
  }));
  function settle() {
    if(motion){motion.revert();motion=null;}
    if(gs) animated.forEach(node=>{gs.killTweensOf(node);gs.set(node,{clearProps:'opacity,transform'});});
    animated.clear();canAnimate=false;
  }
  function mountMotion() {
    settle();
    if(!gs?.matchMedia || !st?.create) return;
    if(navigator.connection?.saveData || /^(slow-2g|2g|3g)$/.test(navigator.connection?.effectiveType || '')) return;
    try {
      gs.registerPlugin(st);motion=gs.matchMedia();
      motion.add({desktop:'(min-width:701px)',mobile:'(max-width:700px)',reduce:'(prefers-reduced-motion:reduce)'},context=>{
        canAnimate=!context.conditions.reduce;
        if(!canAnimate) return;
        $$('[data-af-reveal]').forEach(node=>{
          // Keep everything readable until the actual reveal starts; no pre-hidden page.
          st.create({trigger:node,start:'top 92%',once:true,onEnter:()=>{
            if(!canAnimate || document.hidden) return;
            animated.add(node);gs.fromTo(node,{opacity:.4,y:context.conditions.mobile?8:14},{opacity:1,y:0,duration:.65,ease:'power2.out',clearProps:'opacity,transform'});
          }});
        });
        if(entry==='ad' && !location.hash && scrollY<100){
          const lines=[$('#ad-opening'),$('#ad-question')];lines.forEach(n=>animated.add(n));
          gs.fromTo(lines,{opacity:.35,y:10},{opacity:1,y:0,duration:.62,stagger:.19,ease:'power2.out',clearProps:'opacity,transform'});
        }
        return ()=>{canAnimate=false;animated.forEach(node=>{gs.killTweensOf(node);gs.set(node,{clearProps:'opacity,transform'});});animated.clear();};
      });
      document.fonts?.ready.then(()=>st.refresh());
    }catch(_){settle();}
  }
  $$('img').forEach(img=>{
    const fail=()=>img.closest('figure,.af-scene-media')?.classList.add('image-failed');
    img.addEventListener('error',fail);
    if(img.complete && !img.naturalWidth) fail();
  });
  document.addEventListener('visibilitychange',()=>document.hidden?settle():mountMotion());
  window.addEventListener('pagehide',settle);
  window.addEventListener('pageshow',event=>{if(event.persisted) mountMotion();});
  if(team){$('#team-panel').hidden=false;$('#team-entry').textContent=`entry: ${entry} / campaign: ${campaign} / ${safeUtms}`;log('entry',campaign);}
  setFocus('photo',false);mountMotion();
})();
