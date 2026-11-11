import {createFastSignature} from './resolute-sonic-a.js';
/* R3: one page owner; reuse the existing 190ms sound generator only.
   UI state stays in memory. No writes, storage, tracking or submission endpoint. */
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
  const connection = navigator.connection;
  const slow = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
  const gs = window.gsap, st = window.ScrollTrigger;
  let manualOff = false, motion = null, modeTween = null, opener = null;
  const surfaces = {photo:'메뉴 사진을 보고, 함께 앉을 자리를 찾는 화면.',route:'주소를 본 뒤 입구와 주차를 찾는 화면.',booking:'방문 안내를 읽고 예약 방법을 찾는 화면.'};
  const allowed = () => !!(gs && st && !reduced.matches && !manualOff && !slow());
  function render(animate = true) {
    const subject = subjects[state.focus], copy = subject[state.mode];
    $('#stage').dataset.focus = state.focus; $('#stage').dataset.mode = state.mode;
    $$('button[data-focus]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.focus === state.focus)));
    $$('button[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
    $$('[data-view]').forEach(v => {v.hidden = v.dataset.view !== `${state.focus}-${state.mode}`;});
    $('#scene-visual').setAttribute('aria-label', `${subject.label} ${state.mode === 'before' ? '이전' : '정리 후'} 화면 예시`);
    $('#scene-kicker').textContent = subject.kicker;
    $('#scene-count').textContent = copy[0]; $('#scene-title').textContent = copy[1];
    $('#scene-description').textContent = copy[2]; $('#scene-bottom').textContent = copy[3];
    $('#sheet-topic').textContent = `${subject.label}을 먼저 살펴봅니다.`;
    $('#sheet-surface').textContent = surfaces[state.focus];
    $('#sheet-question').textContent = subject.question; $('#sheet-action').textContent = subject.action;
    $('#interest').value = state.focus;
    if (modeTween) { modeTween.kill(); gs.set($$('[data-view]'), {clearProps:'opacity'}); }
    if (animate && allowed()) modeTween = gs.fromTo($(`[data-view="${state.focus}-${state.mode}"]`), {opacity:.35}, {opacity:1,duration:.35,ease:'power2.out',clearProps:'opacity'});
  }
  $$('button[data-focus],button[data-mode]').forEach(b => {b.disabled = false;b.addEventListener('click', () => {
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
    toggle.setAttribute('aria-pressed', String(manualOff || reduced.matches || slow()));
    toggle.textContent = reduced.matches ? '기기 설정: 움직임 줄임' : slow() ? '데이터 절약: 움직임 줄임' : manualOff ? '움직임 켜기' : '움직임 줄이기';
    toggle.disabled = reduced.matches || slow();
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
      $$('.rf-word-row').forEach(row => {
        // Each row owns a longer viewport interval; the next row remains below it.
        gs.fromTo(row.querySelector('.rf-word'),{x:desktop?-36:-12,y:18,opacity:.38},{x:0,y:0,opacity:1,ease:'none',scrollTrigger:{trigger:row,start:'top 88%',end:'top 37%',scrub:.65}});
      });
    });
    document.fonts?.ready.then(() => {if (allowed()) st.refresh();});
  }
  $('#motion-toggle').addEventListener('click', () => {manualOff = !manualOff; configureMotion();});
  reduced.addEventListener('change', configureMotion);
  connection?.addEventListener?.('change', configureMotion);
  window.addEventListener('load', () => {if (allowed()) st.refresh();}, {once:true});
  const dialog = $('#request-dialog');
  $$('[data-open-request]').forEach(a => a.addEventListener('click', event => {
    event.preventDefault(); opener = a; $('#interest').value = state.focus; invalidate();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else {location.href = 'https://pf.kakao.com/_mxbexhX'; return;}
    $('#store').focus();
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {opener?.focus({preventScroll:true});});
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const stops = [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
    const first = stops[0], last = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
  });
  dialog.addEventListener('click', event => {if(event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();});
  // Rebuild rather than leaving an outdated store or interest in a prepared message.
  function invalidate() {$('#request-result').hidden = true; $('#request-text').value = ''; $('#request-status').textContent = '';}
  $('#request-fields').disabled = false;
  $('#interest').addEventListener('change', () => {if(subjects[$('#interest').value]) {state.focus = $('#interest').value; render(false);}});
  $('#request-form').addEventListener('input', invalidate);
  $('#request-form').addEventListener('change', invalidate);
  $('#request-form').addEventListener('submit', event => {
    event.preventDefault();
    const fields = [$('#store'), $('#region')];
    const empty = fields.find(f => !f.value.trim());
    if (empty) {empty.setCustomValidity('공백 대신 매장명 또는 지역을 적어주세요.'); empty.reportValidity(); empty.addEventListener('input', () => empty.setCustomValidity(''), {once:true}); return;}
    const subject = subjects[$('#interest').value];
    $('#request-text').value = `안녕하세요. Weplace에서 매장 첫 화면 예시를 살펴봤습니다.\n매장: ${$('#store').value.trim()}\n지역: ${$('#region').value.trim()}\n먼저 함께 볼 부분: ${subject.label}\n확인하고 싶은 질문: ${subject.question}\n먼저 정리할 내용: ${subject.action}\n첫 화면 진단의 범위와 가능한 일정을 안내받고 싶습니다.`;
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
  // Draft-only campaign context; preserve existing /go and ad-funnel contracts.
  const params = new URLSearchParams(location.search);
  const campaign = params.get('ad');
  const campaigns = {
    dining:['식당의 첫 화면','식사는 마음에 드는데, 예약은 왜 망설여질까요?','booking'],
    stay:['숙소의 첫 화면','머물고 싶은 숙소, 도착하는 길도 보이나요?','route'],
    wellness:['웰니스의 첫 화면','쉬고 싶은 마음이, 첫 방문으로 이어지려면?','photo'],
    local:['우리 동네의 첫 화면','찾아낸 우리 매장, 다음 행동도 보이나요?','route']
  };
  if(Object.hasOwn(campaigns,campaign)) {
    const [kicker,question,focus] = campaigns[campaign];
    $('#ad-context').hidden = false; $('#ad-kicker').textContent = kicker; $('#ad-question').textContent = question;
    state.focus = focus; document.documentElement.dataset.uEntry = campaign;
  } else document.documentElement.dataset.uEntry = 'home';
  // Only established campaign keys with the existing restricted ASCII value syntax pass on.
  const safe = new URLSearchParams();
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(key=>{const value=params.get(key);if(value && /^[a-zA-Z0-9_-]{1,80}$/.test(value))safe.set(key,value);});
  $$('a[href]').forEach(a=>{
    const raw=a.getAttribute('href'); if(!raw.startsWith('/') || raw.startsWith('//') || !safe.size) return;
    const url=new URL(raw,location.origin); safe.forEach((v,k)=>url.searchParams.set(k,v)); a.href=url.pathname+url.search+url.hash;
  });
  // No user-entered store or region is included in a URL or persistent event.
  $$('img').forEach(img=>{
    const failed=()=>{
      img.dataset.failed='true';
      const aperture=img.closest('.rf-aperture');
      if(aperture) aperture.dataset.imageState='error';
      else if(!img.closest('.rf-logo')) img.parentElement.classList.add('u-media-failed');
    };
    img.addEventListener('error',failed,{once:true});
    img.addEventListener('load',()=>{const aperture=img.closest('.rf-aperture');if(aperture)aperture.dataset.imageState='ready';},{once:true});
    if(img.complete && !img.naturalWidth) failed();
  });
  render(false); configureMotion();
})();

const root = document.documentElement;
const fast = document.querySelector('.rf-fast');
const body = fast?.querySelector('.rf-fast-body');
const near = fast?.querySelector('.rf-trail-left.near');
const far = fast?.querySelector('.rf-trail-left.far');
const replay = document.querySelector('#fast-replay');
const sound = document.querySelector('#fast-sound');
const status = document.querySelector('#fast-status');
const gs = window.gsap;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 800px)');
const connection = navigator.connection;
let timeline = null, didEnter = false, observer = null;
const velocity = document.querySelector('.rv-velocity-line');
const rays = [...document.querySelectorAll('.rv-ray')];
const flare = document.querySelector('.rv-flare');
let context = null, voice = null, enabled = false, pending = false, generation = 0, playTicket = 0;
const slow = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
const canMove = () => !!(gs && window.ScrollTrigger && root.dataset.rfMotion === 'on' && !reduced.matches && !slow());

function settle() {
  timeline?.kill(); timeline = null;
  if (gs) gs.set([body, near, far, velocity, ...rays, flare], {clearProps:'transform,opacity'});
  fast.classList.remove('is-fast-playing'); fast.dataset.fastState = 'settled';
}
function playMotion() {
  settle();
  if (!canMove() || document.hidden) return;
  const distance = mobile.matches ? 6 : 14;
  fast.classList.add('is-fast-playing'); fast.dataset.fastState = 'prepare';
  timeline = gs.timeline({onComplete:settle});
  timeline.to(body,{x:-distance*.35,scaleX:.988,duration:.12,ease:'power1.in'})
    .call(()=>{fast.dataset.fastState='accelerate';},null,.12)
    .to(body,{x:distance,scaleX:1.018,duration:.18,ease:'power3.in'},.12)
    .fromTo(near,{x:-distance*.3,opacity:0},{x:-distance*1.6,opacity:.22,duration:.16,ease:'power2.in'},.12)
    .fromTo(far,{x:-distance*.8,opacity:0},{x:-distance*3.4,opacity:.1,duration:.16,ease:'power2.in'},.14)
    .call(()=>{fast.dataset.fastState='settle';},null,.30)
    .to(body,{x:0,scaleX:1,duration:.18,ease:'power3.out'},.30)
    .to(near,{x:-distance*2.6,opacity:0,duration:.20,ease:'power2.out'},.28)
    .to(far,{x:-distance*4.3,opacity:0,duration:.18,ease:'power2.out'},.30)
    .call(()=>{fast.dataset.fastState='settled';fast.classList.remove('is-fast-playing');},null,.48)
    .fromTo(velocity,{scaleX:.12,x:-distance,opacity:0},{scaleX:1,x:0,opacity:.7,duration:.26,ease:'power3.in'},.12)
    .fromTo(flare,{x:-distance,opacity:.2},{x:0,opacity:.6,duration:.26,ease:'power2.out'},.12)
    .fromTo(rays,{x:-distance*3,scaleX:.12,opacity:0},{x:0,scaleX:1,opacity:.55,duration:.25,stagger:.035,ease:'power3.in'},.13)
    .to([velocity,...rays],{x:distance,opacity:0,duration:.25,ease:'power3.out'},.43)
    .to(flare,{opacity:.32,duration:.25},.43);
}
function updateMotionControl() {
  replay.disabled = !canMove();
  replay.title = canMove() ? 'FAST의 짧은 모션을 한 번 재생합니다' : '움직임 줄이기 상태에서는 정적인 제목을 보여줍니다';
  if (!canMove()) {settle();if(enabled || pending || context)stopSound('움직임 줄이기 상태로 소리를 껐습니다.');}
  sound.disabled = !canMove();
}
function soundState(message = '') {
  sound.setAttribute('aria-pressed', String(enabled));
  sound.setAttribute('aria-busy', String(pending));
  sound.querySelector('span').textContent = pending ? '사운드 취소' : enabled ? '사운드 끄기' : '사운드 켜기';
  root.dataset.fastSound = pending ? 'pending' : enabled ? 'on' : 'off';
  if (message) status.textContent = message;
}
function stopSound(message = '사운드를 껐습니다.') {
  generation++; playTicket++; pending = false; enabled = false;
  voice?.stop(); voice = null;
  const old = context; context = null;
  if (old && old.state !== 'closed') { try { Promise.resolve(old.close()).catch(()=>{}); } catch {} }
  soundState(message);
}
async function readyAudio(ctx, token) {
  let timeout;
  try {
    // Called synchronously by a click handler, before the first await.
    const resume = ctx.state === 'running' ? Promise.resolve() : ctx.resume();
    await Promise.race([resume, new Promise((_, reject) => {timeout = setTimeout(()=>reject(new Error('Audio blocked')),1200);})]);
    return token === generation && context === ctx && ctx.state === 'running' && !document.hidden;
  } finally { clearTimeout(timeout); }
}
async function playSound(delay = 0) {
  if (!enabled || !context || document.hidden) return;
  const ctx = context, token = generation, ticket = ++playTicket;
  voice?.stop(); voice = null;
  try {
    const ready = await readyAudio(ctx, token);
    if (ticket !== playTicket || token !== generation) return;
    if (!ready) {stopSound('소리를 재생할 수 없어 무음으로 유지합니다.');return;}
    const current = createFastSignature(ctx, delay); voice = current;
    current.done.then(() => {
      if (voice !== current) return;
      voice = null;
      // Keep the user's selection, release processing between explicit plays.
      if (context === ctx && ctx.state === 'running') { try { Promise.resolve(ctx.suspend()).catch(()=>{}); } catch {} }
    });
  } catch {
    if (token === generation) stopSound('소리를 재생할 수 없어 무음으로 유지합니다.');
  }
}
sound.disabled = !canMove();
sound.addEventListener('click', async () => {
  if (enabled || pending) {stopSound();return;}
  if (document.hidden || !canMove()) return;
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) {soundState('이 브라우저에서는 소리를 지원하지 않습니다.');return;}
  const token = ++generation;
  pending = true; soundState('소리를 준비하고 있습니다.');
  try {
    context = new Audio({latencyHint:'interactive'});
    if (!await readyAudio(context, token)) {
      if (token === generation) stopSound('소리를 재생할 수 없어 무음으로 유지합니다.');
      return;
    }
    pending = false; enabled = true;
    soundState('사운드 켜짐 · FAST 재생에서 함께 들립니다.');
    playSound();
  } catch {
    if (token === generation) stopSound('소리를 재생할 수 없어 무음으로 유지합니다.');
  }
});
replay.addEventListener('click', () => {
  didEnter = true; observer?.disconnect();
  if (document.hidden || !canMove()) return;
  playMotion();
  if (enabled) playSound(.12);
});
// Observe the existing manual/OS/data-saving control, rather than duplicating its state.
new MutationObserver(updateMotionControl).observe(root,{attributes:true,attributeFilter:['data-rf-motion']});
reduced.addEventListener('change',updateMotionControl);
mobile.addEventListener('change',settle);
connection?.addEventListener?.('change',updateMotionControl);
function leave() {
  didEnter = true; observer?.disconnect(); settle();
  if (enabled || pending || context) stopSound('탭을 나가 소리를 껐습니다.');
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();});
window.addEventListener('pagehide',leave);
soundState(); updateMotionControl();
// The hero is scene 02. Play only on its first actual viewport entry.
function enter() {
  if(didEnter || document.hidden) return;
  didEnter=true; observer?.disconnect();
  if(canMove()) playMotion();
}
if('IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))enter();},{threshold:.65});
  observer.observe(fast);
}
// Without IntersectionObserver the text stays settled; the replay remains available.
