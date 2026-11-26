/* WEPLACE R2.4 — film -> 3-choice First Look -> existing deep experience/contact.
   UI-only except existing consent-gated, whitelisted GA4 events.
   All mock screens and business details are fictional. */
(() => {
  'use strict';
  const init = () => {
    const root = document.getElementById('owner-firstlook');
    if (!root) return;
    const qs = s => root.querySelector(s);
    const qsa = s => [...root.querySelectorAll(s)];
    const allowed = new Set(['photo', 'route', 'booking']);
    const subjects = {
      photo: {
        label:'사진', eyebrow:'PHOTO / 01',
        before:{title:'맛있어 보이는데,\n어디에 앉을까요?',description:'메뉴 사진은 마음에 듭니다. 함께 앉을 공간은 어디서 확인할까요?'},
        after:{title:'메뉴 다음에는,\n머물 공간도.',description:'같은 매장 정보라도 사진을 보여주는 순서를 바꾸면 다음 질문에 답하기 쉬워집니다.'}
      },
      route: {
        label:'찾아오는 길',eyebrow:'ARRIVAL / 02',
        before:{title:'주소는 알겠는데,\n입구는 어디죠?',description:'주소를 찾은 다음 출구, 입구, 주차를 다시 확인해야 할 수 있습니다.'},
        after:{title:'출구에서 입구까지,\n한 흐름으로.',description:'도착 직전 필요한 정보를 같은 화면에서 확인하도록 순서를 정리합니다.'}
      },
      booking: {
        label:'예약',eyebrow:'BOOKING / 03',
        before:{title:'사진은 좋은데,\n예약은 어디 있죠?',description:'방문하고 싶어도 예약 방법을 찾기 어려우면 다른 탭을 확인해야 합니다.'},
        after:{title:'예약 전에 필요한 답,\n가까운 곳에.',description:'인원·시간을 확인한 다음 예약 방법을 쉽게 찾도록 정보의 위치를 바꿉니다.'}
      }
    };
    const state = {focus:'booking',mode:'before'};
    const focusButtons = qsa('button[data-wpfl-focus]');
    const modeButtons = qsa('button[data-wpfl-mode]');
    const views = qsa('[data-wpfl-view]');
    const question = qs('#wp-fl-question');
    const desc = qs('#wp-fl-desc');
    const topic = qs('#wp-fl-topic');
    const headline = qs('#wp-fl-demo-state');
    const next = qs('#wp-fl-next');
    const contact = qs('[data-wpfl-contact]');
    const detail = qs('[data-wpfl-detail]');
    if (!question || !desc || !topic || !headline || !next || !contact || !detail || !focusButtons.length || !views.length) return;
    function track(event,extra){
      // The existing analytics gate checks consent and entirely suppresses Preview sends.
      window.wpAnalytics?.track?.(event,{page_type:'home',entry_point:'owner_focus',focus_type:state.focus,...extra});
    }
    function render(){
      const data = subjects[state.focus];
      const content = data[state.mode];
      root.dataset.focus = state.focus;
      root.dataset.mode = state.mode;
      focusButtons.forEach(b=>{
        const current = b.dataset.wpflFocus === state.focus;
        b.setAttribute('aria-pressed',String(current));
      });
      modeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wpflMode === state.mode)));
      views.forEach(v=>{
        const show = v.dataset.wpflView === state.focus+'-'+state.mode;
        v.hidden = !show;
      });
      topic.textContent = data.eyebrow;
      question.textContent = content.title;
      desc.textContent = content.description;
      headline.textContent = data.label + ' · ' + (state.mode==='before' ? '정리 전' : '정리 후');
      next.textContent = state.mode === 'before' ? '정리 후 화면 보기 →' : '정리 전 다시 보기 ↶';
      contact.textContent = data.label + ' 화면 진단 문의 ↗';
      detail.setAttribute('aria-label',data.label+' 선택을 유지하고 상세 화면 비교로 이동');
      contact.setAttribute('aria-label',data.label+' 선택을 유지하고 첫 화면 진단 문의 준비');
    }
    function setFocus(value){
      if(!allowed.has(value))return;
      state.focus=value;
      state.mode='before'; // always compare from the same starting condition
      render();
      track('firstlook_select');
    }
    function setMode(value){
      if(value!=='before'&&value!=='after')return;
      if(value===state.mode)return;
      state.mode=value;
      render();
      track('firstlook_compare',{compare_mode:value});
    }
    function syncExisting(){
      // Do not alter the original R3 engine; use its public control click semantics.
      const legacy = document.querySelector('#experience .rf-choices button[data-focus="'+state.focus+'"]');
      if(!legacy || legacy.disabled)return false;
      legacy.click();
      const modeButton = document.querySelector('#experience button[data-mode="'+state.mode+'"]');
      if(modeButton && !modeButton.disabled)modeButton.click();
      return true;
    }
    focusButtons.forEach(b=>{
      b.disabled=false;
      b.addEventListener('click',()=>setFocus(b.dataset.wpflFocus));
    });
    modeButtons.forEach(b=>{
      b.disabled=false;
      b.addEventListener('click',()=>setMode(b.dataset.wpflMode));
    });
    next.disabled=false;
    next.addEventListener('click',()=>setMode(state.mode==='before'?'after':'before'));
    detail.addEventListener('click',syncExisting);
    contact.addEventListener('click',e=>{
      const synced=syncExisting();
      const existing=document.querySelector('#contact [data-open-request]');
      const dialog=document.getElementById('request-dialog');
      // Existing dialog only prepares a message. It does not submit customer data.
      if(synced && existing && typeof dialog?.showModal==='function'){
        e.preventDefault();
        existing.click();
      } // without the original engine, keep native #contact fallback
    });
    const video=document.querySelector('#owner-focus video');
    const nudge=document.querySelector('#owner-focus [data-wpfl-nudge]');
    video?.addEventListener('ended',()=>{
      if(!nudge)return;
      nudge.classList.add('wp-fl-nudge-ready');
      const span=nudge.querySelector('span');
      if(span)span.textContent='영상이 끝났습니다. 예약 화면을 직접 비교해 보세요.';
    });
    render(); // initial reservation-before is deliberate; not a user event
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();