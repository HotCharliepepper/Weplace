import {createFastSignature} from './resolute-sonic-a.js';

/* Independent hero enhancement. The existing comparison, FLOW and request code is untouched. */
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
let timeline = null, didEnter = false, entryTimer = 0;
let context = null, voice = null, enabled = false, pending = false, generation = 0, playTicket = 0;
const slow = () => connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
const canMove = () => !!(gs && window.ScrollTrigger && root.dataset.rfMotion === 'on' && !reduced.matches && !slow());

function settle() {
  timeline?.kill(); timeline = null;
  if (gs) gs.set([body, near, far], {clearProps:'transform,opacity'});
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
    .to({}, {duration:.42}, .48);
}
function updateMotionControl() {
  replay.disabled = !canMove();
  replay.title = canMove() ? 'FAST의 짧은 모션을 한 번 재생합니다' : '움직임 줄이기 상태에서는 정적인 제목을 보여줍니다';
  if (!canMove()) settle();
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
sound.disabled = false;
sound.addEventListener('click', async () => {
  if (enabled || pending) {stopSound();return;}
  if (document.hidden) return;
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
  didEnter = true; clearTimeout(entryTimer);
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
  didEnter = true; clearTimeout(entryTimer); settle();
  if (enabled || pending || context) stopSound('탭을 나가 소리를 껐습니다.');
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();});
window.addEventListener('pagehide',leave);
soundState(); updateMotionControl();
// One silent entrance only. No scroll replay, hidden-tab replay, or re-enable replay.
function enter() {
  if (didEnter) return;
  didEnter = true; clearTimeout(entryTimer);
  const box = fast.getBoundingClientRect();
  if (box.bottom > 0 && box.top < innerHeight && !document.hidden) playMotion();
}
entryTimer = setTimeout(enter,800);
document.fonts?.ready.then(enter);
