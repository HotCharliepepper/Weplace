/* Meeting preparation only: no requests, analytics, account access or automatic storage. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const industries = {
    dining: {name: '식당', questions: ['가족 모임 인원에 맞는 자리나 룸을 미리 확인할 수 있나요?', '메뉴·가격·주차 조건을 한 번에 볼 수 있나요?', '예약 방법과 변경·취소 기준이 분명한가요?'], beforeTitle: '“모임 예약 문의 주세요.”', before: '룸 크기, 메뉴, 주차 안내가 흩어져 있어 모임을 준비하는 손님이 하나씩 물어봐야 합니다.', afterTitle: '모임을 준비하는 순서대로.', after: '실제로 앉을 수 있는 인원과 공간 사진, 메뉴·가격, 주차와 예약 조건을 함께 안내합니다.'},
    cafe: {name: '카페', questions: ['함께 갈 사람과 앉을 자리·분위기를 사진으로 알 수 있나요?', '시그니처 메뉴와 가격을 방문 전에 볼 수 있나요?', '영업시간·휴무·이용 조건이 채널마다 같은가요?'], beforeTitle: '“분위기 좋은 카페입니다.”', before: '음료 사진만으로는 자리가 어떤지, 함께 갈 사람과 머물기 괜찮은지 판단하기 어렵습니다.', afterTitle: '어떻게 머물지 떠올릴 수 있게.', after: '실제 좌석과 공간, 시그니처 메뉴·가격, 영업시간과 이용 조건을 확인해 함께 보여줍니다.'},
    stay: {name: '호텔 · 숙소', questions: ['선택할 객실의 실제 모습과 차이를 알 수 있나요?', '주차·도착 동선·체크인 방법이 분명한가요?', '요금·추가 비용·취소 조건을 예약 전에 확인할 수 있나요?'], beforeTitle: '“편안한 휴식을 약속합니다.”', before: '객실 사진과 안내가 섞여 있으면 내가 예약할 방과 도착 후 과정을 다시 물어봐야 합니다.', afterTitle: '예약할 객실과 도착 방법을 한눈에.', after: '객실별 실제 사진과 시설, 주차·체크인 동선, 추가 요금·취소 조건을 운영 기준에 맞춰 구분합니다.'},
    beauty: {name: '뷰티 · 케어', questions: ['나에게 맞는 서비스와 공개 동의된 실제 사례를 볼 수 있나요?', '가격 범위·소요 시간·진행 절차가 안내되어 있나요?', '예약 전 준비와 변경·취소 기준을 알 수 있나요?'], beforeTitle: '“맞춤 관리를 제공합니다.”', before: '가격과 과정, 준비 사항이 없으면 처음 오는 손님은 방문 전에 무엇을 물어야 할지 막막합니다.', afterTitle: '처음 방문하는 순서대로.', after: '서비스 대상과 공개 동의된 실제 사례, 가격 기준·소요 시간, 준비·예약 절차를 확인해 차례로 안내합니다.'},
    other: {name: '그 외 매장 · 서비스', questions: ['어떤 상황의 손님에게 잘 맞는 곳인가요?', '이용 가격과 포함·추가 조건을 미리 알 수 있나요?', '방문·예약하려면 어디에서 무엇을 하면 되나요?'], beforeTitle: '“자세한 내용은 문의 주세요.”', before: '가격과 이용 순서가 보이지 않아, 손님이 전화로 처음부터 다시 확인해야 합니다.', afterTitle: '선택에 필요한 답을 한곳에.', after: '이용 대상·가격 기준·포함 사항·예약 순서를 실제 운영과 맞춰 안내합니다.'}
  };
  const decisionLabels = {screen: '현재 화면을 먼저 함께 살펴보고 싶습니다', proposal: '작업 범위와 조건이 담긴 제안을 받고 싶습니다', self: '직접 정리한 뒤 다시 이야기하겠습니다'};
  const reviewLabels = {current: '현재 화면', questions: '손님의 질문', example: '개선 예시와 실제 적용 범위', scope: '범위·일정·수정·담당자', terms: '비용·부가세·착수·해지·환불 조건', decision: '다음에 이야기할 내용'};
  const isIndustry = key => Object.prototype.hasOwnProperty.call(industries, key);
  const incoming = new URLSearchParams(window.location.search).get('industry');
  $('meetingIndustry').value = isIndustry(incoming) ? incoming : 'other';
  document.querySelectorAll('input[type=checkbox],input[type=radio]').forEach(input => { input.checked = false; });

  function updateSummary() {
    const selected = document.querySelector('input[name="meetingDecision"]:checked');
    const reviewed = Array.from(document.querySelectorAll('[data-review]:checked')).map(input => reviewLabels[input.dataset.review]);
    const industry = industries[$('meetingIndustry').value] || industries.other;
    $('reviewCount').textContent = '확인 표시 ' + reviewed.length + ' / 6';
    $('meetingSummary').value = ['Weplace · 미팅 대화 준비 (검토용)', '업종: ' + industry.name, '', '다음에 이야기할 내용: ' + (selected ? decisionLabels[selected.value] : '아직 선택하지 않았습니다'), '', '이 화면에서 확인 표시한 항목: ' + (reviewed.length ? reviewed.join(', ') : '없음'), '', '확정이 필요한 조건: 작업 범위·납품 수량·일정·수정 횟수·담당자·가격·부가세·착수 조건·해지/환불', '', '현재 화면의 체크를 요약한 것으로, 실제 매장 점검이나 조건 합의의 증빙은 아닙니다.', '상담 접수·미팅 확정·계약·결제가 진행되지 않았습니다.', '자가진단 답변과 개인정보는 포함되지 않습니다.'].join('\n');
    $('meetingStatus').textContent = '';
  }

  function updateIndustry() {
    const key = $('meetingIndustry').value;
    const content = isIndustry(key) ? industries[key] : industries.other;
    $('meetingQuestions').replaceChildren();
    content.questions.forEach(text => { const li = document.createElement('li'); li.textContent = text; $('meetingQuestions').append(li); });
    $('exampleBeforeTitle').textContent = content.beforeTitle;
    $('exampleBefore').textContent = content.before;
    $('exampleAfterTitle').textContent = content.afterTitle;
    $('exampleAfter').textContent = content.after;
    $('meetingCheckLink').href = '/check/?industry=' + encodeURIComponent(isIndustry(key) ? key : 'other');
    updateSummary();
  }

  $('meetingIndustry').addEventListener('change', () => {
    // A different industry has different questions; review marks must not imply it was reviewed already.
    document.querySelectorAll('[data-review]').forEach(input => { input.checked = false; });
    updateIndustry();
  });
  document.querySelectorAll('input').forEach(input => input.addEventListener('change', updateSummary));
  $('copyMeeting').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('meetingSummary').value);
      $('meetingStatus').textContent = '준비 내용을 복사했습니다. 원하실 때 카카오톡에 직접 붙여 넣어 주세요. 아직 전송되지는 않았습니다.';
    } catch {
      $('meetingSummary').focus(); $('meetingSummary').select();
      $('meetingStatus').textContent = '자동 복사를 사용할 수 없습니다. 선택된 요약을 직접 복사해 주세요.';
    }
  });
  $('printMeeting').addEventListener('click', () => window.print());
  updateIndustry();
})();
