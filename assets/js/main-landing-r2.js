(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('canvas') === '1') document.documentElement.classList.add('review-canvas');
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 639px)');
  let reviewReduced = false;
  const activeAnimations = new Set();
  const reduced = () => reducedQuery.matches || reviewReduced;
  function animate(element, frames, options) {
    if (!element || reduced() || !element.animate) return null;
    try {
      const animation = element.animate(frames, { easing: 'cubic-bezier(.22,1,.36,1)', fill: 'none', ...options });
      activeAnimations.add(animation);
      animation.finished.then(() => activeAnimations.delete(animation)).catch(() => activeAnimations.delete(animation));
      return animation;
    } catch (_) { return null; /* Decorative motion must never disable the form or tabs. */ }
  }
  function settle() {
    activeAnimations.forEach(animation => { try { animation.finish(); } catch (_) { animation.cancel(); } });
    activeAnimations.clear();
  }
  function enter(element, chart) {
    animate(element, [{ transform: `translateY(${mobileQuery.matches ? 4 : 8}px)`, opacity: .88 }, { transform: 'translateY(0)', opacity: 1 }], { duration: mobileQuery.matches ? 240 : 400 });
    if (chart && !reduced()) element.querySelectorAll('.chart-line').forEach(path => {
      if (!path.getTotalLength) return;
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length} ${length}`;
      const a = animate(path, [{ strokeDashoffset: String(length) }, { strokeDashoffset: '0' }], { duration: mobileQuery.matches ? 320 : 560, easing: 'ease-out' });
      const clear = () => { path.style.removeProperty('stroke-dasharray'); path.style.removeProperty('stroke-dashoffset'); };
      if (a) a.finished.then(clear).catch(clear); else clear();
    });
  }
  const revealed = new WeakSet();
  let revealObserver;
  function initReveals() {
    if (revealObserver) revealObserver.disconnect();
    if (reduced() || !('IntersectionObserver' in window)) return;
    const inset = Math.round(window.innerHeight * (mobileQuery.matches ? .10 : .15));
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      revealed.add(entry.target);
      enter(entry.target, entry.target.dataset.reveal === 'chart');
    }), { threshold: 0, rootMargin: `0px 0px -${inset}px 0px` });
    document.querySelectorAll('[data-reveal]:not([data-reveal="hero"])').forEach(element => { if (!revealed.has(element)) revealObserver.observe(element); });
  }
  initReveals();
  enter(document.querySelector('[data-reveal="hero"]'), true);
  reducedQuery.addEventListener('change', () => { if (reduced()) settle(); initReveals(); });
  window.addEventListener('message', event => {
    if (event.source !== window.parent || !event.data || event.data.type !== 'weplace-motion') return;
    reviewReduced = Boolean(event.data.reduced);
    document.documentElement.dataset.reviewReduced = String(reviewReduced);
    if (reduced()) settle();
    initReveals();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  window.addEventListener('pageshow', event => { if (event.persisted) settle(); });
  let resizeFrame = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(initReveals); }, { passive: true });

  function installTabs(selector, onChange) {
    const tabs = Array.from(document.querySelectorAll(selector));
    function select(tab, focus) {
      tabs.forEach(item => { const current = item === tab; item.setAttribute('aria-selected', String(current)); item.tabIndex = current ? 0 : -1; });
      if (focus) tab.focus();
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.setAttribute('aria-labelledby', tab.id);
      onChange(tab, panel);
      animate(panel, [{ opacity: .88 }, { opacity: 1 }], { duration: mobileQuery.matches ? 120 : 140, easing: 'ease-out' });
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
      });
    });
  }
  installTabs('[data-change]', (tab, panel) => {
    const before = tab.dataset.change === 'before';
    panel.classList.toggle('before', before);
    panel.classList.toggle('after', !before);
    document.getElementById('sample-kicker').textContent = before ? '공간 소개' : '관리 선택 안내';
    document.getElementById('sample-title').innerHTML = before ? '편안한 휴식이<br>필요할 때.' : '내게 맞는 관리,<br>먼저 확인하세요.';
    document.getElementById('sample-facts').innerHTML = before ? '<span>공간 사진</span><span>분위기 소개</span>' : '<span>관리 내용</span><span>시간 · 가격</span><span>예약 방법</span>';
    document.getElementById('sample-cta').innerHTML = before ? '더 알아보기 <b aria-hidden="true">↗</b>' : '예약하기 <b aria-hidden="true">↗</b>';
  });
  const industries = {
    dining: { question: '6명이 조용히 식사할 곳,<br>주차도 가능할까요?', fields: [['공간과 인원', '좌석 구성과 이용 인원을 사진·문장으로'], ['방문 조건', '주차·영업시간·예약 조건을 실제 운영 기준으로'], ['다음 행동', '메뉴 확인에서 예약까지 연결되는 경로로']] },
    wellness: { question: '처음 받는 관리인데,<br>어떤 걸 골라야 할까요?', fields: [['관리의 차이', '관리 내용과 대상, 소요 시간을 쉬운 설명으로'], ['선택 조건', '확인된 가격과 이용 준비사항을 같은 위치에'], ['다음 행동', '관리 비교에서 문의·예약까지 연결되는 경로로']] },
    lodging: { question: '아이와 함께 묵을 곳,<br>객실은 어떤 모습인가요?', fields: [['머무는 공간', '객실 구성과 침구, 시설을 실제 사진으로'], ['이용 조건', '입실·퇴실과 주차, 인원 조건을 운영 기준으로'], ['다음 행동', '객실 선택과 이용 조건 확인 후 예약으로']] },
    fitness: { question: '처음 시작하는데,<br>레슨을 받아도 괜찮을까요?', fields: [['이용할 시설', '실제 시설과 장비, 공간을 사진·설명으로'], ['맞는 대상', '레슨 대상과 진행 방식, 첫 방문 순서로'], ['다음 행동', '상담·체험 조건을 확인하고 신청하는 경로로']] }
  };
  installTabs('[data-industry]', tab => {
    const data = industries[tab.dataset.industry];
    document.getElementById('search-question').innerHTML = data.question;
    document.getElementById('answer-fields').innerHTML = data.fields.map(pair => `<div><b>${pair[0]}</b><span>${pair[1]}</span></div>`).join('');
  });
  const flowStates = {
    work: { title: '첫 사진과 예약 안내를 정리합니다.', copy: '공간 사진을 먼저 배치하고, 관리 안내 아래에 예약 버튼을 놓습니다.', rows: [['이번 결과물', '사진 순서 · 안내 문구 · 버튼 배치'], ['확인할 기준', '운영 정보 일치 · 연결 경로'], ['다음 단계', '내부 검수 후 대표님께 공유']], note: '완료 표시와 별도로 결과물을 확인합니다.' },
    review: { title: '대표님이 보실 결과물을 모읍니다.', copy: '수정 전후와 확인할 내용을 함께 보고, 승인 또는 수정 의견을 남기는 흐름입니다.', rows: [['함께 볼 자료', '화면 비교 · 적용 위치 · 확인 항목'], ['대표님 확인', '운영 정보가 실제와 맞는지'], ['수정 의견', '추가 요청을 다음 작업에 반영']], note: '내부 검수와 대표님의 확인을 나누는 운영 구성 예시입니다.' },
    next: { title: '다음에 확인할 일을 남깁니다.', copy: '기록 가능한 유입·문의·예약을 살펴보고, 더 바꿀 부분과 유지할 부분을 정합니다.', rows: [['이번 변경', '무엇을 언제 바꿨는지'], ['살펴볼 자료', '기록 가능한 지표와 대표님 의견'], ['이어갈 일', '다음 수정 · 재확인 일정']], note: '공개 범위가 확인된 기록만 사례로 소개합니다.' }
  };
  installTabs('[data-flow]', tab => {
    const data = flowStates[tab.dataset.flow];
    document.getElementById('flow-task-title').textContent = data.title;
    document.getElementById('flow-task-copy').textContent = data.copy;
    document.getElementById('flow-task-rows').innerHTML = data.rows.map(pair => `<div><span>${pair[0]}</span><strong>${pair[1]}</strong></div>`).join('');
    document.querySelector('#flow-note p').textContent = data.note;
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let count = 0;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-category]').forEach(card => { const show = selected === 'all' || card.dataset.category === selected; card.hidden = !show; if (show) count++; });
    document.getElementById('case-filter-status').textContent = `사례 ${count}개`;
  }));
  const dialog = document.getElementById('case-dialog');
  let dialogTrigger;
  const details = {
    a: '<h2 id="dialog-title">음식점 A의 매출 기록</h2><p>2026년 5월과 6월의 월매출을 비교했습니다. 업장명은 공개하지 않습니다.</p><div class="dialog-metric">+12.2%<span>172,000,000원 → 193,000,000원 · 차이 21,000,000원</span></div><div class="table-scroll"><table><caption>확인된 연도별 원자료 · 단위 억 원</caption><thead><tr><th scope="col">연도</th><th scope="col">4월</th><th scope="col">5월</th><th scope="col">6월</th></tr></thead><tbody><tr><th scope="row">2024</th><td>1.66</td><td>1.96</td><td>1.94</td></tr><tr><th scope="row">2025</th><td>1.91</td><td>2.02</td><td>1.70</td></tr><tr><th scope="row">2026</th><td>1.74</td><td>1.72</td><td>1.93</td></tr></tbody></table></div><p>변화율은 (1.93 − 1.72) ÷ 1.72 × 100을 소수 첫째 자리로 반올림했습니다.</p><p class="dialog-footnote">출처: 제공된 매출 자료의 확인된 비교 수치. 작업 시작일·사진 교체일·다른 요인의 영향은 이 자료에서 분리되지 않았습니다. 본 수치를 ‘사진 교체만으로 얻은 성과’나 ‘3주 실행 효과’로 해석하지 않습니다.</p>',
    b: '<h2 id="dialog-title">웰니스 B의 유입 기록</h2><p>2026년 5월부터 8월까지 플레이스 유입 횟수의 변화를 확인했습니다. 업장명은 공개하지 않습니다.</p><div class="dialog-metric">+168%<span>877회 → 2,350회 · 2026년 5월 대비 8월</span></div><div class="table-scroll"><table><caption>월별 플레이스 유입 횟수</caption><thead><tr><th scope="col">기간</th><th scope="col">유입</th></tr></thead><tbody><tr><th scope="row">2026.05</th><td>877회</td></tr><tr><th scope="row">2026.06</th><td>1,137회</td></tr><tr><th scope="row">2026.07</th><td>2,002회</td></tr><tr><th scope="row">2026.08</th><td>2,350회</td></tr></tbody></table></div><p>변화율은 (2,350 − 877) ÷ 877 × 100을 정수로 반올림했습니다.</p><p class="dialog-footnote">출처: 제공된 월별 플레이스 유입 자료. 유입 횟수는 방문객 수·예약 수·매출이 아닙니다. 작업별 기여도는 분리되지 않았으며, 가상 매장 C의 화면 구성 예시와는 별개입니다.</p>'
  };
  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-case]').forEach(button => {
      button.addEventListener('click', () => { dialogTrigger = button; document.getElementById('dialog-content').innerHTML = details[button.dataset.case]; dialog.showModal(); document.getElementById('close-dialog').focus(); });
      button.disabled = false;
    });
    document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => dialogTrigger?.focus());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
  }
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuSummary = mobileMenu.querySelector('summary');
  mobileMenu.addEventListener('toggle', () => menuSummary.setAttribute('aria-label', mobileMenu.open ? '메뉴 닫기' : '메뉴 열기'));
  document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => { mobileMenu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.open) { mobileMenu.open = false; menuSummary.focus(); }
  });
  document.addEventListener('click', event => { if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false; });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) mobileMenu.open = false; }, {passive:true});
  const form = document.getElementById('request-form');
  const noLink = document.getElementById('no-link');
  const url = document.getElementById('shop-url');
  const shopName = document.getElementById('shop-name');
  const region = document.getElementById('shop-region');
  const result = document.getElementById('request-result');
  const message = document.getElementById('prepared-message');
  const status = document.getElementById('form-status');
  noLink.addEventListener('change', () => {
    const alternative = noLink.checked;
    document.getElementById('alternative-fields').hidden = !alternative;
    document.getElementById('url-field').hidden = alternative;
    url.required = !alternative;
    url.disabled = alternative;
    [shopName, region].forEach(input => { input.required = alternative; input.disabled = !alternative; input.setCustomValidity(''); });
    result.hidden = true;
  });
  [url, shopName, region].forEach(input => input.addEventListener('input', () => { input.setCustomValidity(''); result.hidden = true; }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const lines = ['[Weplace 무료 진단 요청]'];
    if (noLink.checked) {
      for (const input of [shopName, region]) { if (!input.value.trim()) { input.setCustomValidity('내용을 입력해 주세요.'); input.reportValidity(); return; } }
      lines.push(`매장명: ${shopName.value.trim()}`, `지역: ${region.value.trim()}`);
    } else {
      try { const parsed = new URL(url.value.trim()); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol'); }
      catch (_) { url.setCustomValidity('https:// 또는 http://로 시작하는 공개 매장 링크를 입력해 주세요.'); url.reportValidity(); return; }
      lines.push(`매장 링크: ${url.value.trim()}`);
    }
    lines.push('', '매장 1곳 · 공개 채널 1개 · 직접 써볼 개선안 1개에 대한 무료 진단을 요청합니다.');
    message.value = lines.join('\n');
    result.hidden = false;
    status.textContent = '내용이 준비되었습니다. 아직 전송되지 않았습니다.';
    animate(result, [{ opacity: .88 }, { opacity: 1 }], { duration: 160 });
    message.focus();
  });
  document.getElementById('copy-message').addEventListener('click', async () => {
    try { if (!navigator.clipboard) throw new Error('no clipboard'); await navigator.clipboard.writeText(message.value); status.textContent = '복사했습니다. 카카오톡에 붙여넣고 직접 전송해 주세요.'; }
    catch (_) { message.focus(); message.select(); status.textContent = '내용을 선택했습니다. 직접 복사한 뒤 카카오톡에서 전송해 주세요.'; }
  });
  document.getElementById('open-channel').addEventListener('click', () => { status.textContent = '카카오 채널을 여는 링크를 선택했습니다. 요청 내용은 직접 전송해 주세요.'; });
  const sticky = document.getElementById('sticky-cta');
  const heroCta = document.getElementById('hero-cta');
  const request = document.getElementById('request');
  let stickyFrame = 0;
  function updateSticky() {
    stickyFrame = 0;
    const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    const visible = mobileQuery.matches && heroCta.getBoundingClientRect().bottom < 0 && request.getBoundingClientRect().top > window.innerHeight && !editing && !dialog.open;
    sticky.classList.toggle('visible', visible);
    sticky.setAttribute('aria-hidden', String(!visible));
    sticky.querySelector('a').tabIndex = visible ? 0 : -1;
  }
  const scheduleSticky = () => { if (!stickyFrame) stickyFrame = requestAnimationFrame(updateSticky); };
  window.addEventListener('scroll', scheduleSticky, { passive: true });
  window.addEventListener('resize', scheduleSticky, { passive: true });
  document.addEventListener('focusin', scheduleSticky);
  document.addEventListener('focusout', scheduleSticky);
  dialog.addEventListener('close', scheduleSticky);
  updateSticky();
  document.querySelectorAll('a[href="#request"], #open-channel').forEach(link => link.addEventListener('click', () => {
    const placement = link.id === 'hero-cta' ? 'hero' : link.closest('#sticky-cta') ? 'mobile' : 'kakao_contact';
    try { window.WeplaceMetrics?.emit('weplace_consult_click', {placement}); } catch (_) { /* Navigation remains usable if analytics fails. */ }
  }));
  document.getElementById('request-fields').disabled = false;
})();
