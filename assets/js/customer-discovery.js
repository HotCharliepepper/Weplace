(function () {
  'use strict';
  // Illustrative examples only. No store names, addresses, answers or contacts are collected.
  // State lives in memory; only an allowlisted industry may travel in a URL.
  var scenarios = {
    dining: { label: '요식업', name: '함께 식사할 곳', purposes: [
      { label: '가족 모임을 준비하는 손님', question: '“가족 8명이 모이는데, 자리와 주차를 미리 알 수 있을까?”', intro: '가족 모임을 준비하는 손님의 검색 화면', before: [['공간', '따뜻한 식사 사진과 매장 분위기'], ['모임', '몇 명까지 함께 앉는지 보이지 않음'], ['주차·예약', '주차 위치와 예약 방법을 다시 찾아야 함']], after: [['공간', '룸·테이블 사진에 이용 인원과 조건 표시'], ['모임', '모임 메뉴, 가격과 예약 전 확인사항 안내'], ['주차·예약', '주차 위치·지원 조건과 예약 경로를 함께 안내']], good: '분위기와 음식 사진은 함께 식사할 장면을 떠올리게 합니다.', check: '사진 다음에 모임 인원·메뉴·주차 조건도 한 화면에서 찾을 수 있나요?', next: '모임 예약 화면을 열고, 인원과 주차 안내가 보이는지 직접 확인해 보세요.', beforeNote: '분위기는 알겠지만, 함께 올 사람에게 설명할 답은 더 찾아야 합니다.', afterNote: '사진에서 느낀 기대를 인원·메뉴·주차 안내로 이어줍니다.' },
      { label: '오늘 저녁 방문하려는 손님', question: '“오늘 가도 될까? 메뉴 가격과 마지막 주문은 언제지?”', intro: '오늘 저녁 식사할 곳을 찾는 손님의 검색 화면', before: [['음식', '먹음직스러운 메뉴 사진'], ['시간', '영업시간만 표시, 휴무·마지막 주문 불명확'], ['이용', '메뉴 가격과 예약·웨이팅 안내가 흩어짐']], after: [['음식', '메뉴 사진 옆에 현재 가격과 구성 안내'], ['시간', '오늘 영업·휴게·마지막 주문 기준 안내'], ['이용', '예약과 현장 대기 방식, 확인 연락처 안내']], good: '메뉴 사진은 오늘 먹고 싶은 음식을 고르는 데 도움이 됩니다.', check: '현재 가격과 영업·휴게·마지막 주문 안내가 서로 맞나요?', next: '네이버·구글·홈페이지에서 오늘의 영업 안내와 대표 메뉴 가격을 비교해 보세요.', beforeNote: '방문할 마음은 생겼지만, 지금 가도 되는지 다시 확인하게 됩니다.', afterNote: '오늘의 방문 판단에 필요한 시간·가격·이용 방법을 연결합니다.' }
    ] },
    cafe: { label: '카페', name: '잠시 머무를 곳', purposes: [
      { label: '편하게 대화하려는 손님', question: '“둘이 이야기하기 좋은 자리일까? 언제까지 머물 수 있지?”', intro: '편하게 대화할 카페를 찾는 손님의 검색 화면', before: [['분위기', '예쁜 음료와 인테리어 사진'], ['자리', '테이블 간격과 좌석 구성이 잘 보이지 않음'], ['시간·메뉴', '영업시간과 대표 메뉴 가격을 따로 찾아야 함']], after: [['분위기', '눈높이에서 촬영한 실제 좌석과 테이블 배치'], ['자리', '좌석 유형과 이용 시 참고할 운영 안내'], ['시간·메뉴', '영업시간·휴무와 시그니처 메뉴·가격을 함께 안내']], good: '음료와 공간 사진은 만나고 싶은 장소의 분위기를 전합니다.', check: '예쁜 한 장 다음에 실제 좌석과 이용 시간을 확인할 수 있나요?', next: '입구에서 좌석까지 보이는 사진 한 장과 현재 영업시간을 점검해 보세요.', beforeNote: '분위기는 마음에 들지만, 대화할 자리를 상상하기 어렵습니다.', afterNote: '분위기와 실제 좌석 정보를 함께 보여 머무를 장면을 돕습니다.' },
      { label: '시그니처 메뉴를 찾는 손님', question: '“여기서 꼭 먹어볼 메뉴는 무엇이고, 가격은 얼마일까?”', intro: '새로운 메뉴를 경험하려는 손님의 검색 화면', before: [['메뉴', '다양한 음료 사진이 섞여 있음'], ['선택', '대표 메뉴의 이름과 맛 설명이 부족함'], ['주문', '현재 가격·제공 시간·포장 안내가 보이지 않음']], after: [['메뉴', '대표 메뉴 사진에 이름과 특징을 함께 표시'], ['선택', '맛·재료와 선택 가능한 옵션을 짧게 안내'], ['주문', '현재 가격과 운영상 필요한 주문·포장 조건 안내']], good: '메뉴 사진은 처음 먹어보려는 마음을 만드는 출발점입니다.', check: '사진을 본 손님이 메뉴 이름과 현재 가격을 바로 알 수 있나요?', next: '대표 메뉴 하나를 골라 사진·이름·가격·맛 설명이 함께 보이는지 확인해 보세요.', beforeNote: '궁금한 메뉴는 생겼지만, 이름과 가격을 찾아야 주문할 수 있습니다.', afterNote: '사진의 호기심을 메뉴 정보와 주문 안내로 이어줍니다.' }
    ] },
    stay: { label: '숙박', name: '안심하고 머무를 곳', purposes: [
      { label: '차로 늦게 도착하는 손님', question: '“늦게 도착해도 주차하고 체크인할 수 있을까?”', intro: '도착 동선을 미리 확인하는 손님의 예약 화면', before: [['객실', '정돈된 객실 사진'], ['도착', '주차 위치·차량 조건이 명확하지 않음'], ['체크인', '늦은 도착 시 절차와 연락 방법을 따로 확인해야 함']], after: [['객실', '예약하는 객실 유형과 실제 사진을 연결'], ['도착', '주차장 입구·위치와 차량 이용 조건 안내'], ['체크인', '체크인 시간·늦은 도착 절차·연락 경로 안내']], good: '정돈된 객실 사진은 도착 후 쉬는 모습을 떠올리게 합니다.', check: '차를 세우는 순간부터 객실에 들어갈 때까지 필요한 안내가 있나요?', next: '처음 오는 손님처럼 주차장 입구와 늦은 체크인 안내를 찾아보세요.', beforeNote: '객실은 마음에 들지만, 도착한 뒤의 절차가 남아 있습니다.', afterNote: '숙소 사진 다음에 도착·주차·체크인 안내가 이어집니다.' },
      { label: '객실과 예약 조건을 비교하는 손님', question: '“사진 속 객실을 예약하는 걸까? 추가요금과 취소 조건은?”', intro: '객실의 차이와 예약 조건을 비교하는 화면', before: [['객실', '여러 객실 사진이 유형 구분 없이 섞여 있음'], ['구성', '객실별 시설과 이용 인원 차이가 불명확함'], ['조건', '추가요금과 취소 조건을 찾기 어려움']], after: [['객실', '객실 유형별 실제 사진과 시설을 연결'], ['구성', '기준 인원·추가 인원·시설 이용 조건 안내'], ['조건', '선택한 일정과 상품의 총요금·취소 조건을 예약 전 표시']], good: '객실 사진과 시설은 자신에게 맞는 휴식을 고르는 근거입니다.', check: '사진·객실명·시설·요금 조건이 같은 예약 상품을 설명하나요?', next: '예약 상품 하나를 열어 사진 속 시설과 요금·취소 조건이 연결되는지 확인해 보세요.', beforeNote: '매력적인 사진은 있지만, 내가 예약하는 객실과 같은지 확신하기 어렵습니다.', afterNote: '객실과 상품 조건을 함께 보여 예약 전에 비교할 수 있게 합니다.' }
    ] },
    beauty: { label: '뷰티', name: '나에게 맞는 관리를 받을 곳', purposes: [
      { label: '첫 방문을 고민하는 손님', question: '“처음인데 어떤 순서로 진행되고, 무엇을 준비해야 할까?”', intro: '처음 방문할 뷰티 매장을 살펴보는 검색 화면', before: [['분위기', '정돈된 공간과 관리 장면 사진'], ['과정', '상담부터 마무리까지의 순서가 보이지 않음'], ['준비', '소요시간·방문 전 준비·예약 방법이 흩어짐']], after: [['분위기', '공간과 상담·서비스 과정을 보여주는 사진'], ['과정', '상담·서비스·마무리 순서와 예상 소요시간 안내'], ['준비', '서비스별 방문 전 확인사항과 예약 방법 안내']], good: '공간과 관리 사진은 처음 들어갈 곳을 익숙하게 만듭니다.', check: '처음 오는 손님이 진행 순서와 준비할 내용을 미리 알 수 있나요?', next: '처음 예약하는 화면에서 과정·소요시간·방문 전 확인사항을 찾아보세요.', beforeNote: '분위기는 편안해 보여도, 처음 방문할 때의 절차가 궁금합니다.', afterNote: '사진에서 느낀 인상을 과정과 준비 안내로 이어줍니다.' },
      { label: '원하는 서비스와 가격을 비교하는 손님', question: '“내가 원하는 서비스는 무엇이고, 추가 비용은 있을까?”', intro: '서비스 구성과 가격을 비교하는 검색 화면', before: [['사례', '다양한 서비스 사례 사진'], ['구성', '사진과 서비스 이름·포함 항목의 연결이 부족함'], ['비용', '기본 가격과 추가 선택의 기준이 명확하지 않음']], after: [['사례', '공개 동의된 실제 사례에 서비스 설명을 연결'], ['구성', '서비스별 포함 항목과 상담이 필요한 조건 안내'], ['비용', '기본 가격·추가 항목·최종 금액 확인 시점을 안내']], good: '실제 서비스 사례는 원하는 방향을 말할 때 참고가 됩니다.', check: '사례 옆에서 서비스 구성과 추가 비용의 기준을 찾을 수 있나요?', next: '대표 서비스 하나의 사례·포함 항목·가격 안내를 나란히 확인해 보세요.', beforeNote: '원하는 모습은 있지만, 어떤 서비스와 비용에 해당하는지 다시 물어야 합니다.', afterNote: '사례와 서비스·가격 기준을 연결해 상담 전에 비교할 수 있게 합니다.' }
    ] }
  };
  var selectedIndustry = null;
  var selectedPurpose = null;
  var selectedView = null;
  var completedExamples = new Set();
  var el = function (id) { return document.getElementById(id); };
  var header = el('siteHeader');
  var menu = el('menuBtn');
  var nav = el('mainNav');
  function animate(node, kind, direction) { if (window.WeplaceMotion) window.WeplaceMotion.play(node, kind, direction); }
  function cancelMotion(node) { if (window.WeplaceMotion) window.WeplaceMotion.cancel(node); }
  function metric(name, placement) {
    if (window.WeplaceMetrics) window.WeplaceMetrics.emit(name, {industry: selectedIndustry, placement: placement});
  }
  function setMenu(open, restoreFocus) {
    header.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    menu.firstElementChild.textContent = open ? '메뉴 −' : '메뉴 +';
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
  nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', function (event) { if (menu.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 700 && menu.getAttribute('aria-expanded') === 'true') setMenu(false); });

  function setContextLinks() {
    var suffix = selectedIndustry ? '?industry=' + encodeURIComponent(selectedIndustry) : '';
    document.querySelectorAll('[data-diagnosis-link]').forEach(function (a) { a.href = '/check/' + suffix; });
    document.querySelectorAll('[data-meeting-link]').forEach(function (a) { a.href = '/meeting/' + suffix; });
  }
  function emptyScreen(message, hint) {
    cancelMotion(el('exampleScreen').firstElementChild);
    el('exampleScreen').style.minHeight = '';
    el('comparisonStatus').textContent = message;
    var root = document.createElement('div'); root.className = 'empty-screen';
    var p = document.createElement('p'); p.textContent = message;
    var span = document.createElement('span'); span.textContent = hint;
    root.append(p, span); el('exampleScreen').replaceChildren(root);
  }
  function hideResult() {
    cancelMotion(el('discoveryResult'));
    el('discoveryResult').hidden = true;
    el('summaryStatus').textContent = '';
    el('copyFallback').hidden = true;
    el('copyFallback').value = '';
  }
  function clearView() {
    selectedView = null;
    document.querySelectorAll('[data-view]').forEach(function (button) { button.setAttribute('aria-pressed', 'false'); button.disabled = selectedPurpose === null; });
    hideResult();
  }
  function selectIndustry(industry, sendMetric) {
    if (!Object.prototype.hasOwnProperty.call(scenarios, industry)) return false;
    selectedIndustry = industry;
    selectedPurpose = null;
    document.querySelectorAll('[data-industry]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.industry === industry)); });
    el('purposeGroup').disabled = false;
    el('purposeHint').hidden = true;
    el('purposeChoices').replaceChildren();
    scenarios[industry].purposes.forEach(function (scenario, index) {
      var button = document.createElement('button'); button.type = 'button'; button.dataset.purpose = String(index); button.setAttribute('aria-pressed', 'false'); button.textContent = scenario.label;
      var arrow = document.createElement('span'); arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true'); button.append(arrow);
      button.addEventListener('click', function () { selectPurpose(index); }); el('purposeChoices').append(button);
    });
    el('customerQuestion').textContent = '“' + scenarios[industry].label + ' 손님은 어떤 목적으로 찾아올까?”';
    el('experienceReset').hidden = false;
    clearView();
    emptyScreen('손님의 방문 목적을 골라주세요.', '선택한 상황에 맞는 질문과 화면이 나타납니다.');
    setContextLinks();
    if (sendMetric) metric('weplace_experience_select', 'experience');
    return true;
  }
  function selectPurpose(index) {
    if (!selectedIndustry || !Number.isInteger(index) || !scenarios[selectedIndustry].purposes[index]) return;
    selectedPurpose = index;
    document.querySelectorAll('[data-purpose]').forEach(function (button) { button.setAttribute('aria-pressed', String(Number(button.dataset.purpose) === index)); });
    var scenario = scenarios[selectedIndustry].purposes[index];
    el('customerQuestion').textContent = scenario.question;
    animate(el('customerQuestion'), 'switch');
    el('exampleScreen').style.minHeight = '';
    clearView();
    renderView('before');
  }
  function addText(tag, className, text) { var node = document.createElement(tag); if (className) node.className = className; node.textContent = text; return node; }
  function renderView(view) {
    if (!selectedIndustry || selectedPurpose === null || (view !== 'before' && view !== 'after')) return;
    if (selectedView === view) return;
    var previousView = selectedView;
    var previousHeight = el('exampleScreen').getBoundingClientRect().height;
    cancelMotion(el('exampleScreen').firstElementChild);
    selectedView = view;
    var scenario = scenarios[selectedIndustry].purposes[selectedPurpose];
    var industry = scenarios[selectedIndustry];
    document.querySelectorAll('[data-view]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.view === view)); });
    var screen = document.createElement('div'); screen.className = 'screen-' + view;
    var top = document.createElement('div'); top.className = 'screen-top'; top.append(addText('strong', '', industry.label + ' / 예시 안내 화면'), addText('span', 'screen-state', view === 'before' ? '정리 전' : '정리 후'));
    var body = document.createElement('div'); body.className = 'screen-body'; body.append(addText('h3', '', industry.name), addText('p', 'screen-intro', scenario.intro));
    var list = document.createElement('dl'); list.className = 'screen-detail-list';
    scenario[view].forEach(function (row, index) { var item = document.createElement('div'); item.className = 'screen-row' + (view === 'before' && index > 0 ? ' is-missing' : ''); item.append(addText('dt', '', row[0]), addText('dd', '', row[1])); list.append(item); });
    body.append(list, addText('p', 'screen-note', view === 'before' ? scenario.beforeNote : scenario.afterNote)); screen.append(top, body); el('exampleScreen').replaceChildren(screen);
    // Reserve only a minimum: enlarged text can always grow; no clipped fixed height.
    if (previousView && previousHeight) el('exampleScreen').style.minHeight = Math.max(previousHeight, el('exampleScreen').getBoundingClientRect().height) + 'px';
    if (previousView) animate(screen, 'wipe', view);
    el('comparisonStatus').textContent = industry.label + ' · ' + scenario.label + ' · ' + (view === 'before' ? '정리 전 예시입니다.' : '정리 후 예시입니다. 아래에서 좋은 점, 확인할 점과 다음 행동을 볼 수 있습니다.');
    el('resultGood').textContent = scenario.good; el('resultCheck').textContent = scenario.check; el('resultNext').textContent = scenario.next;
    el('discoveryResult').hidden = view !== 'after';
    if (view !== 'after') cancelMotion(el('discoveryResult'));
    if (view === 'after') {
      var completionKey = selectedIndustry + ':' + selectedPurpose;
      if (!completedExamples.has(completionKey)) {
        completedExamples.add(completionKey);
        // Expanded completion stays disabled in site-metrics.js until approval.
        metric('weplace_experience_complete', 'experience');
      }
    }
  }
  function summaryText() {
    if (!selectedIndustry || selectedPurpose === null || !selectedView) return '';
    var industry = scenarios[selectedIndustry]; var scenario = industry.purposes[selectedPurpose];
    return ['Weplace — 고객 시선 체험 메모', '예시 화면에 대한 메모 / 실제 매장 점검 결과 아님', '', '업종: ' + industry.label, '방문 목적: ' + scenario.label, '고객 질문: ' + scenario.question, '', '좋은 점 하나: ' + scenario.good, '확인할 점 하나: ' + scenario.check, '다음 행동 하나: ' + scenario.next, '', '이 메모는 상담 신청이 아닙니다. 직접 문의할 때 참고할 수 있습니다.', '내 매장 자가진단: https://withweplace.kr/check/?industry=' + selectedIndustry].join('\n');
  }
  document.querySelectorAll('[data-industry]').forEach(function (button) { button.addEventListener('click', function () { selectIndustry(button.dataset.industry, true); }); });
  document.querySelectorAll('[data-view]').forEach(function (button) { button.addEventListener('click', function () { renderView(button.dataset.view); }); });
  document.querySelector('.comparison-tabs').addEventListener('keydown', function (event) {
    var keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (keys.indexOf(event.key) < 0 || !event.target.matches('[data-view]') || event.target.disabled) return;
    event.preventDefault();
    var buttons = Array.from(document.querySelectorAll('[data-view]'));
    var next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (buttons.indexOf(event.target) + 1) % buttons.length;
    buttons[next].focus(); renderView(buttons[next].dataset.view);
  });
  window.addEventListener('resize', function () { el('exampleScreen').style.minHeight = ''; });
  el('experienceReset').addEventListener('click', function () {
    selectedIndustry = null; selectedPurpose = null; clearView();
    document.querySelectorAll('[data-industry]').forEach(function (button) { button.setAttribute('aria-pressed', 'false'); });
    el('purposeGroup').disabled = true; el('purposeHint').hidden = false; el('purposeChoices').replaceChildren();
    el('customerQuestion').textContent = '“가기 전에, 무엇을 확인하고 싶을까?”';
    el('experienceReset').hidden = true; emptyScreen('손님이 찾아볼 화면을 준비합니다.', '업종과 방문 목적을 먼저 골라주세요.'); setContextLinks();
    document.querySelector('[data-industry]').focus();
  });
  document.addEventListener('weplace:industry', function (event) {
    var industry = event.detail && event.detail.industry;
    if (typeof industry !== 'string' || !selectIndustry(industry, true)) return;
    el('experienceTitle').focus({preventScroll: true});
    var reduced = window.WeplaceMotion ? window.WeplaceMotion.isReduced() : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el('experience').scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
  });
  el('copySummary').addEventListener('click', async function () {
    var text = summaryText(); if (!text) return;
    try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('manual-copy'); await navigator.clipboard.writeText(text); el('summaryStatus').textContent = '메모를 복사했습니다. 문의하려면 카카오톡에서 직접 보내주세요.'; el('copyFallback').hidden = true; }
    catch (error) { el('copyFallback').value = text; el('copyFallback').hidden = false; el('copyFallback').focus(); el('copyFallback').select(); el('summaryStatus').textContent = '아래 메모를 직접 복사해 주세요. 아직 상담이 접수된 것은 아닙니다.'; }
  });
  el('downloadSummary').addEventListener('click', function () {
    var text = summaryText(); if (!text) return;
    var url = URL.createObjectURL(new Blob(['\uFEFF' + text], {type: 'text/plain;charset=utf-8'})); var a = document.createElement('a'); a.href = url; a.download = 'Weplace_Customer_View_' + selectedIndustry + '.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); el('summaryStatus').textContent = '메모 내려받기를 시작했습니다. 선택 내용은 상담 시스템으로 전송되지 않습니다.';
  });
  document.querySelectorAll('[data-experience-start]').forEach(function (a) { a.addEventListener('click', function () { metric('weplace_experience_start', a.dataset.experienceStart); }); });
  document.querySelectorAll('[data-consult]').forEach(function (a) { a.addEventListener('click', function () { metric('weplace_consult_click', a.dataset.consult); }); });
  document.querySelectorAll('.faq-item').forEach(function (item) { item.addEventListener('toggle', function () { if (item.open) metric('weplace_faq_open', 'faq'); }); });
  // All other query keys are ignored, and no query is copied into outgoing links.
  var queryIndustry = new URLSearchParams(window.location.search).get('industry');
  if (queryIndustry && Object.prototype.hasOwnProperty.call(scenarios, queryIndustry)) selectIndustry(queryIndustry, false);

  // Progressive enhancement: without JS all three original examples remain readable.
  var makingTabs = el('makingTabs'), makingBoard = el('makingBoard');
  if (makingTabs && makingBoard) {
    var tabs = Array.from(makingTabs.querySelectorAll('[data-making-tab]'));
    var panels = Array.from(makingBoard.querySelectorAll('[data-making-panel]'));
    var makingSelected = 'before';
    panels.forEach(function (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'makingTab-' + panel.dataset.makingPanel); panel.tabIndex = 0; panel.hidden = panel.dataset.makingPanel !== makingSelected; });
    makingBoard.classList.add('is-enhanced'); makingTabs.hidden = false; el('makingStageNote').hidden = false;
    function chooseStage(button) {
      var next = button.dataset.makingTab;
      if (makingSelected === next) return;
      var previousHeight = makingBoard.getBoundingClientRect().height;
      panels.forEach(function (panel) { cancelMotion(panel); panel.hidden = panel.dataset.makingPanel !== next; });
      tabs.forEach(function (tab) { var current = tab === button; tab.setAttribute('aria-selected', String(current)); tab.tabIndex = current ? 0 : -1; });
      var nextPanel = el('making-' + next);
      if (previousHeight) makingBoard.style.minHeight = Math.max(previousHeight, makingBoard.getBoundingClientRect().height) + 'px';
      animate(nextPanel, 'switch', tabs.indexOf(button) < tabs.findIndex(function (tab) { return tab.dataset.makingTab === makingSelected; }) ? 'before' : 'after');
      makingSelected = next;
    }
    tabs.forEach(function (tab) { tab.addEventListener('click', function () { chooseStage(tab); }); });
    makingTabs.addEventListener('keydown', function (event) {
      var index = tabs.indexOf(event.target); if (index < 0) return;
      var next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); tabs[next].focus(); chooseStage(tabs[next]);
    });
    window.addEventListener('resize', function () { makingBoard.style.minHeight = ''; });
  }
})();
