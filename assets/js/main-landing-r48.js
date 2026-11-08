/* WEPLACE R4.8: research-informed anticipation test, not a universal boredom threshold.
 * First voluntary reveal: meaningful visual beat < 1s; repeats: short response.
 * Do not pretend a network load is happening. If an image actually is late, say so.
 * The existing R2 tab handler remains the sole owner of photograph and text swaps.
 */
(function () {
  'use strict';
  const host = document.querySelector('#changes .change-preview');
  const panel = document.getElementById('change-panel');
  const before = document.getElementById('change-before');
  const after = document.getElementById('change-after');
  const photo = document.getElementById('sample-photo-image');
  const curtain = document.getElementById('r47-picture-curtain');
  const button = document.getElementById('r47-photo-switch');
  const status = document.getElementById('r47-switch-status');
  const fallback = document.getElementById('r48-photo-fallback');
  const fallbackHeading = document.getElementById('r48-fallback-heading');
  const fallbackCopy = document.getElementById('r48-fallback-copy');
  const back = document.getElementById('r48-fallback-back');
  const lab = document.getElementById('r48-wait-lab');
  const preset = document.getElementById('r48-wait-preset');
  const labResult = document.getElementById('r48-lab-result');
  const labFeedback = document.getElementById('r48-lab-feedback');
  if (![host,panel,before,after,photo,curtain,button,status,fallback,
         fallbackHeading,fallbackCopy,back,lab,preset,labResult,labFeedback].every(Boolean)) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
  const origin = location.hostname;
  const isPreview = origin === 'localhost' || origin === '127.0.0.1'
    || /^deploy-preview-\d+--weplace\.netlify\.app$/.test(origin);
  const showLab = isPreview && new URLSearchParams(location.search).get('waitlab') === '1';
  const choices = { brief: 450, balanced: 680, lingering: 900 };
  const FADE = 170;
  const MAX_ASSET_WAIT = 1250; // Real image delay cap; not an invented progress percentage.
  let playedFirst = false, serial = 0, timers = [], releaseImageWatch = null;
  let labOverride = null, lastShownDuration = null, sceneStarted = 0, currentMin = 0, holdExpired = false;
  const observations = Object.create(null);

  function schedule(fn, delay) {
    const id=window.setTimeout(fn,delay);
    timers.push(id);
    return id;
  }
  function cancel() {
    serial++;
    timers.forEach(id=>window.clearTimeout(id));
    timers=[];
    if (releaseImageWatch) { releaseImageWatch(); releaseImageWatch=null; }
    curtain.classList.remove('is-leaving');
    curtain.hidden = true;
    fallback.hidden = true;
    holdExpired=false;
  }
  function canAnimate() {
    const net=connection && (connection.saveData || ['slow-2g','2g','3g'].includes(connection.effectiveType));
    return !reduced.matches && !net && !document.hidden;
  }
  function updateButton() {
    const showMenu = panel.dataset.storeState === 'before';
    button.innerHTML = showMenu
      ? '메뉴 먼저 보기 <span aria-hidden="true">↗</span>'
      : '외관 다시 보기 <span aria-hidden="true">↗</span>';
    button.setAttribute('aria-label', showMenu
      ? '메뉴 먼저 보기로 사진 비교 전환'
      : '외관 먼저 보기로 사진 비교 전환');
  }
  function setLabResult(message) {
    if (showLab) labResult.textContent=message;
  }
  function showAssetFallback(isError) {
    curtain.hidden = true;
    curtain.classList.remove('is-leaving');
    fallback.hidden = false;
    fallbackHeading.textContent = isError ? '사진을 불러오지 못했습니다.' : '실제 사진을 불러오는 중입니다.';
    fallbackCopy.textContent = isError
      ? '원본 사진을 유지하며 다시 비교할 수 있습니다.'
      : '연출을 더 기다리게 하지 않고, 이미지 상태를 알려드립니다.';
    status.textContent = isError
      ? '메뉴 사진을 불러오지 못했습니다. 외관으로 돌아갈 수 있습니다.'
      : '메뉴 사진이 아직 도착하지 않았습니다. 외관으로 돌아갈 수 있습니다.';
    setLabResult(isError ? '이미지 오류 · 연출을 생략하고 안내 표시' : '실제 이미지 지연 · 연출 종료 후 사실대로 안내');
  }

  function begin(next) {
    if (panel.dataset.storeState === next) return;
    cancel();
    if (showLab) { labFeedback.hidden=true; lastShownDuration=null; }
    const id = serial;
    const first = next === 'after' && !playedFirst;
    const duration = first
      ? labOverride !== null ? labOverride : 680
      : next === 'before' ? 120 : 150;
    currentMin=duration;
    sceneStarted=performance.now();
    status.textContent = next === 'after' ? '메뉴 먼저 보기로 전환하고 있습니다.' : '외관 먼저 보기로 전환하고 있습니다.';

    if (!canAnimate()) {
      if (next === 'after') playedFirst=true;
      queueMicrotask(updateButton);
      return;
    }
    curtain.hidden=false;
    curtain.classList.remove('is-leaving');
    curtain.dataset.beat = first ? 'first' : 'repeat';
    curtain.style.setProperty('--r48-beat',duration+'ms');
    host.style.setProperty('--r410-hold',duration+'ms');
    host.dataset.waitPhase='anticipation';

    let minDone=false, ready=false, closed=false, watchdogExpired=false;
    function finish() {
      if(id !== serial || closed || !minDone || !ready) return;
      closed=true;
      fallback.hidden=true;
      curtain.classList.add('is-leaving');
      host.dataset.waitPhase='reveal';
      if(next==='after') playedFirst=true;
      if (showLab) {
        labFeedback.hidden = next !== 'after';
        if (next === 'after') lastShownDuration = duration;
      }
      status.textContent=next==='after'
        ? '메뉴 사진을 먼저 보여주는 구성입니다. 실제 예약 화면은 아닙니다.'
        : '외관 사진을 먼저 보여주는 이전 구성입니다.';
      const elapsed=Math.round(performance.now()-sceneStarted);
      setLabResult('설정 '+duration+'ms · 실제 공개 시작 '+elapsed+'ms · 이미지 준비 상태 반영');
      schedule(()=>{
        if(id !== serial) return;
        curtain.hidden=true;
        curtain.classList.remove('is-leaving');
        host.dataset.waitPhase='complete';
      },FADE);
    }
    function loaded() {
      if(id !== serial) return;
      ready=true;
      if(watchdogExpired) {
        minDone=true;
        fallback.hidden=true;
      }
      finish();
    }
    function imageError() {
      if(id !== serial) return;
      timers.forEach(x=>window.clearTimeout(x));
      timers=[];
      closed=true;
      showAssetFallback(true);
    }
    schedule(()=>{minDone=true;finish();},duration);
    schedule(()=>{
      if(id !== serial || ready || closed) return;
      watchdogExpired=true;
      showAssetFallback(false);
    },Math.max(MAX_ASSET_WAIT,duration+100));

    // Executed after the existing R2 click/keyboard selection has assigned src.
    queueMicrotask(()=>{
      if(id!==serial)return;
      updateButton();
      const onLoad=()=>loaded(), onError=()=>imageError();
      photo.addEventListener('load',onLoad);
      photo.addEventListener('error',onError);
      releaseImageWatch=()=>{
        photo.removeEventListener('load',onLoad);
        photo.removeEventListener('error',onError);
      };
      if(photo.complete && photo.naturalWidth>0) loaded();
      else if(typeof photo.decode === 'function') {
        photo.decode().then(loaded).catch(()=>{
          if(id!==serial)return;
          if(photo.complete && !photo.naturalWidth) imageError();
          // Some browsers reject decode when the srcset candidate changes.
          // Otherwise let load/error or the honest deadline decide.
        });
      }
    });
  }

  for(const tab of [before,after]) {
    tab.addEventListener('click',()=>begin(tab.dataset.change),true);
    tab.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      const i=tab===before?0:1;
      const target=e.key==='Home'?0:e.key==='End'?1:1-i;
      if(target!==i)begin(target===0?'before':'after');
    },true);
  }
  button.addEventListener('click',()=>{
    (panel.dataset.storeState==='before'?after:before).click();
  });
  back.addEventListener('click',()=>{
    before.click();
    // An error state should never trap the visitor behind a decorative layer.
    cancel();
  });
  reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});
  connection?.addEventListener?.('change',()=>{if(!canAnimate())cancel();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  window.addEventListener('pagehide',cancel);

  if(showLab){
    lab.hidden=false;
    labOverride=choices[preset.value]??680;
    labFeedback.hidden=true;
    preset.addEventListener('change',()=>{
      labOverride=choices[preset.value]??680;
      lastShownDuration=null;
      labFeedback.hidden=true;
      playedFirst=false; // Allows the first reveal to be compared again after reversing.
      setLabResult('실험값 '+labOverride+'ms 선택 · 외관 화면으로 돌아간 뒤 다시 공개해 보세요.');
    });
    labFeedback.querySelectorAll('button[data-perception]').forEach(b=>b.addEventListener('click',()=>{
      const kind=b.dataset.perception;
      if(!['fast','ready','slow'].includes(kind) || lastShownDuration===null) return;
      const entry=observations[lastShownDuration]??{fast:0,ready:0,slow:0};
      entry[kind]++;
      observations[lastShownDuration]=entry;
      labFeedback.hidden=true;
      setLabResult(lastShownDuration+'ms 실험의 이번 브라우저 기록: 너무 빠름 '+entry.fast+' / 기대 유지 '+entry.ready+' / 느림 '+entry.slow+' · 사용자 연구 결과가 아닙니다.');
    }));
  }
  updateButton();
  button.hidden=false;
})();
