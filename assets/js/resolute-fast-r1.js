/* Review-only, in-memory UI. No requests, analytics, storage or submission endpoint. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  if (!$('#stage')) return;
  const subjects = {
    photo: {label:'사진', kicker:'PHOTO / 01', before:['메뉴만 보이는 화면','어디에\n앉는 걸까?','요리 사진은 충분해도, 함께 앉을 공간은 다시 찾아야 합니다.','대표 메뉴만 먼저 확인'], after:['메뉴와 공간이 나란히','메뉴 다음에\n자리까지.','먹고 싶은 마음 다음에는, 누구와 어디에 앉을지가 궁금해집니다. 필요한 사진을 가까이 놓습니다.','대표 메뉴 → 함께 앉을 공간'], question:'함께 앉을 공간도 보일까요?', action:'메뉴 다음에 좌석과 공간 사진을.'},
    route: {label:'찾아오는 길', kicker:'ARRIVAL / 02', before:['흩어진 안내','주소는 아는데,\n입구는 어디지?','주소, 출구, 주차가 서로 다른 곳에 있습니다. 도착하기 전에도 화면을 오가며 다시 확인합니다.','주소 · 소개 · 소식, 따로 확인'], after:['한 화면에 연결한 도착 안내','출구에서\n입구까지.','어느 출구에서 나와, 어디로 꺾고, 어떤 문으로 들어갈지. 마지막 도착 지점과 주차 안내까지 함께 보여줍니다.','출구 → 골목 → 입구 · 주차'], question:'입구와 주차 위치가 함께 보일까요?', action:'출구·입구·주차를 한 화면에.'},
    booking: {label:'예약', kicker:'BOOKING / 03', before:['예약 방법을 다시 찾는 화면','예약은\n어디에서 하지?','방문하고 싶은 마음이 들어도, 인원과 시간을 확인하려면 소개와 소식을 다시 찾아야 합니다.','방문 안내 → 다른 탭에서 재확인'], after:['다음 행동이 보이는 화면','인원과 시간을\n바로 확인하게.','방문 정보 가까이에 인원·시간 선택과 예약 전 안내를 놓습니다. 다음에 무엇을 해야 할지 보이도록.','인원 → 희망 시간 → 확인할 내용'], question:'예약 전 무엇을 확인해야 할까요?', action:'인원·시간 선택 옆에 예약 방법을.'}
  };
  const state = {focus:'route', mode:'before', guests:'4', time:'18:00'};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const slow = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  const gs = window.gsap, st = window.ScrollTrigger;
  let manualOff = false, motion = null, modeTween = null, opener = null;
  const allowed = () => !!(gs && st && !reduced.matches && !manualOff && !slow);
  function render(animate = true) {
    const subject = subjects[state.focus], copy = subject[state.mode];
    $('#stage').dataset.focus = state.focus; $('#stage').dataset.mode = state.mode;
    $$('[data-focus]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.focus === state.focus)));
    $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
    $$('[data-view]').forEach(v => {v.hidden = v.dataset.view !== `${state.focus}-${state.mode}`;});
    $('#scene-visual').setAttribute('aria-label', `${subject.label} ${state.mode === 'before' ? '이전' : '정리 후'} 화면 예시`);
    $('#scene-kicker').textContent = subject.kicker;
    $('#scene-count').textContent = copy[0]; $('#scene-title').textContent = copy[1];
    $('#scene-description').textContent = copy[2]; $('#scene-bottom').textContent = copy[3];
    $('#sheet-question').textContent = subject.question; $('#sheet-action').textContent = subject.action;
    $('#interest').value = state.focus;
    if (modeTween) { modeTween.kill(); gs.set($$('[data-view]'), {clearProps:'opacity'}); }
    if (animate && allowed()) modeTween = gs.fromTo($(`[data-view="${state.focus}-${state.mode}"]`), {opacity:.35}, {opacity:1,duration:.35,ease:'power2.out',clearProps:'opacity'});
  }
  $$('[data-focus],[data-mode]').forEach(b => {b.disabled = false;b.addEventListener('click', () => {
    if (b.dataset.focus) state.focus = b.dataset.focus; else state.mode = b.dataset.mode;
    render();
  });});
  $$('[data-guests],[data-time]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.guests) state.guests = b.dataset.guests; else state.time = b.dataset.time;
    $$('[data-guests]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.guests === state.guests)));
    $$('[data-time]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.time === state.time)));
    $('#booking-summary').textContent = `${state.guests}명 · ${state.time} 선택 예시`;
  }));
  // Each phrase follows its own position in normal document flow. No pin, snap or scroll lock.
  function configureMotion() {
    motion?.revert(); motion = null;
    if (modeTween) {modeTween.kill(); modeTween = null; gs.set($$('[data-view]'), {clearProps:'opacity'});}
    document.documentElement.dataset.rfMotion = allowed() ? 'on' : 'off';
    const toggle = $('#motion-toggle'); toggle.hidden = !(gs && st);
    toggle.setAttribute('aria-pressed', String(manualOff || reduced.matches || slow));
    toggle.textContent = reduced.matches ? '기기 설정: 움직임 줄임' : slow ? '데이터 절약: 움직임 줄임' : manualOff ? '움직임 켜기' : '움직임 줄이기';
    toggle.disabled = reduced.matches || slow;
    if (!allowed()) return;
    gs.registerPlugin(st);
    motion = gs.matchMedia();
    motion.add({desktop:'(min-width: 801px)', mobile:'(max-width: 800px)', motionOK:'(prefers-reduced-motion: no-preference)'}, context => {
      if (!context.conditions.motionOK) return;
      const desktop = context.conditions.desktop;
      gs.timeline({scrollTrigger:{trigger:'.rf-hero',start:'top top',end:'bottom 10%',scrub:.5}})
        .to('.rf-aperture',{scale:desktop?1.035:1.014,borderRadius:desktop?'110px 110px 18px 18px':'18px',duration:.3,ease:'none'})
        .to('.rf-aperture',{scale:desktop?.96:.985,duration:.4,ease:'none'})
        .to('.rf-aperture',{scale:1,duration:.3,ease:'none'});
      gs.fromTo('.rf-stage-shell',{scale:desktop?.975:.99},{scale:1,ease:'none',scrollTrigger:{trigger:'#experience',start:'top 85%',end:'top 10%',scrub:.4}});
      $$('.rf-word-row').forEach(row => {
        gs.fromTo(row.querySelector('.rf-word'),{x:desktop?-42:-16,y:desktop?24:12,opacity:.2},{x:0,y:0,opacity:1,ease:'none',scrollTrigger:{trigger:row,start:'top 88%',end:'top 58%',scrub:.25}});
      });
    });
    document.fonts?.ready.then(() => {if (allowed()) st.refresh();});
  }
  $('#motion-toggle').addEventListener('click', () => {manualOff = !manualOff; configureMotion();});
  reduced.addEventListener('change', configureMotion);
  window.addEventListener('load', () => {if (allowed()) st.refresh();}, {once:true});
  const dialog = $('#request-dialog');
  $$('[data-open-request]').forEach(a => a.addEventListener('click', event => {
    event.preventDefault(); opener = a; $('#interest').value = state.focus;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else {location.href = '/#request'; return;}
    $('#store').focus();
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {opener?.focus({preventScroll:true});});
  dialog.addEventListener('click', event => {if(event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();});
  // Rebuild rather than leaving an outdated store or interest in a prepared message.
  function invalidate() {$('#request-result').hidden = true; $('#request-text').value = ''; $('#request-status').textContent = '';}
  $('#request-form').addEventListener('input', invalidate);
  $('#request-form').addEventListener('change', invalidate);
  $('#request-form').addEventListener('submit', event => {
    event.preventDefault();
    const fields = [$('#store'), $('#region')];
    const empty = fields.find(f => !f.value.trim());
    if (empty) {empty.setCustomValidity('공백 대신 매장명 또는 지역을 적어주세요.'); empty.reportValidity(); empty.addEventListener('input', () => empty.setCustomValidity(''), {once:true}); return;}
    const subject = subjects[$('#interest').value];
    $('#request-text').value = `안녕하세요. Weplace에서 매장 첫 화면 예시를 살펴봤습니다.\n매장: ${$('#store').value.trim()}\n지역: ${$('#region').value.trim()}\n먼저 함께 볼 부분: ${subject.label}\n현재 화면을 함께 보며 0원 진단의 범위와 가능한 미팅 일정을 안내받고 싶습니다.`;
    $('#request-result').hidden = false;
    $('#request-status').textContent = '문의할 내용을 준비했습니다. 아직 전송하거나 접수하지 않았습니다.';
    $('#request-text').focus();
  });
  $('#copy-request').addEventListener('click', async () => {
    const text = $('#request-text').value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $('#request-status').textContent = '내용을 복사했습니다. 카카오 채널에서 직접 보내주세요. 아직 접수되지 않았습니다.';
    } catch {
      $('#request-text').focus(); $('#request-text').select();
      $('#request-status').textContent = '자동 복사가 되지 않아 내용을 선택했습니다. 직접 복사한 뒤 전달해 주세요.';
    }
  });
  render(false); configureMotion();
})();
