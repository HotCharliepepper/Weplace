# WEPLACE | GA4 Measurement Plan v0.1 · 2026-11-14

> **설계 상태: Draft only. 실제 GA4 수집 활성화·GA4 속성 설정 변경·외부 전송·CRM 데이터 변경 없음.**
> 기준: Weplace Draft PR #33 (R3 통합), \`assets/js/site-metrics.js\`, \`assets/js/unified-r3.js\`, \`docs/measurement-and-decisions.md\`.
> 현재 계측 상태 (2026-11-14 사용자 제공 + GitHub 재확인):
> - **신규 Weplace 웹 스트림 측정 ID:** `G-FVCYL26FTL` (사용자가 GA4에서 직접 생성·전달, 실제 방문 수집은 아직 미확인).
> - **현재 운영 `main/index.html` 설치 ID:** `G-H9B5F4HRDS` (기존 설치; 새 스트림의 ID가 아님).
> - **최신 R3 검토 브랜치:** `assets/js/site-metrics.js`에 기존 ID가 남았고 `unified-r3.html`은 신규 GA4 태그 미연결.
> - 따라서 **신규 GA4 화면의 '데이터 수집 대기 중'은 현재 정상적인 상태**이며, 데이터 수집을 위해 검증된 1회 태그 연결/구 ID 제거가 필요함.
> - 이 계획 문서 수정은 **태그 설치나 수집 활성화가 아니다**. 회사/개인정보 공개 승인 및 동의 처리 검수 후 별도 계측 코드 수정·출시.

## 1. 측정 목적과 사실 경계

관찰 질문 3개:
- 차트를 본 방문자는 FAST까지 내려오는가?
- FAST 이후 사진·길·예약 중 무엇을 선택하고 \`정리 후\`를 실제 확인하는가?
- 체험 이후 진단 문의를 준비하고 카카오를 열며, **그중 실제로 문의를 보낸 사람은 몇 명인가?**

**GA4가 확인할 수 있는 것:** 웹페이지 도달, 특정 섹션 노출, 클릭, 이벤트 시퀀스, 익명 집계와 채널 구분.  
**GA4만으로 확인할 수 없는 것:** 고객이 머릿속에서 무엇을 느꼈는지, 카카오 메시지를 실제로 발송했는지, 진단서가 전달됐는지, 미팅이 확정됐는지. 그 사실은 운영 담당자 수신 기록으로 확인한다.

## 2. 최소 이벤트 사전 (고객명·전화·매장명·자유입력 제외)

| 이벤트 | 발화 조건 | 허용 매개변수 | 기존 재사용 / 새 이벤트 | 의미하지 않는 것 |
|---|---|---|---|---|
| \`page_view\` | 허용된 홈페이지 실제 방문 | \`page_location\` 안전 경로, 캠페인 안전 식별값 | 기존 | 섹션까지 봤다는 뜻 아님 |
| \`weplace_section_view\` | 대상 섹션 50% 이상 1초 노출, 세션 내 구간별 1회 | \`section=chart\|fast\|experience\|work\|capabilities\|evidence\|contact\` | 신규, 승인 전 OFF | 읽음·이해함을 뜻하지 않음 |
| \`weplace_experience_select\` | 사진·길·예약 클릭 | \`topic=photo\|route\|booking\` | 기존 이벤트 확장 검토 | 체험 완료 아님 |
| \`weplace_compare_after_view\` | 정리 후 상태 실제 표출 | \`topic\` | 신규, 승인 전 OFF | 구매 의도 아님 |
| \`weplace_diagnosis_open\` | 진단 문의 모달 열기 | \`placement=hero\|contact\|experience\` | 신규, 승인 전 OFF | 진단 접수 아님 |
| \`weplace_request_copy\` | 클립보드 복사 성공 | \`topic\` | 신규, 승인 전 OFF | 카카오 발송 아님 |
| \`weplace_consult_click\` | 카카오 채널 이동 명시적 클릭 | \`placement=kakao_contact\` | 기존 | 실제 문의 수신 아님 |

추가로 \`weplace_fast_replay\`, \`weplace_fast_sound_toggle\`은 UI 연구를 위한 선택 이벤트로만 검토하고, 초기 릴리스 필수 KPI에서 제외한다.
섹션은 클릭마다 발송하지 않는다. 50%/1초 기준은 설계 가설이며 실제 기기에서 가시성·성능 검수 후 보정한다. 반복 방문/수동 스크롤·탭 숨김·모션 감소 시 과대 집계 방지.

## 3. 별도의 실제 업무 퍼널

| 실제 단계 | 원본 증빙 | 보관 위치 |
|---|---|---|
| 카카오 메시지 **실수신** | 담당자의 수신 확인 및 시간 | 카카오 채널 + 접근제어된 FLOW/CRM |
| 진단 의뢰 **승인** | 매장 정보·담당·제공 범위·기한 합의 | FLOW/CRM |
| 진단서 **전달** | 결과물·전송·수신 근거 | FLOW/CRM |
| 미팅 **확정** | 고객과 합의한 일시·방식 | 캘린더 + FLOW/CRM |
| 제안·계약·수금 | 고객 합의·계약·대금 확인 별도 | 권한 분리된 업무 원본 |

\`generate_lead\`는 **실제 접수 성공을 서버/담당자 근거로 검증할 수 있게 된 이후에만** 사용한다. 카카오 클릭/복사로 절대 대체하지 않는다. 실제 CRM의 이름·전화·매장명·상담원문을 GA4 이벤트나 \`user_id\`로 전송하지 않는다.

## 4. 캠페인 구분과 공개 전 점검

안전한 A/B 카카오 예시:
- \`utm_source=kakao\`
- \`utm_medium=message\`
- \`utm_campaign=weplace_r3_pilot_202611\`
- \`utm_content=engine_a\` 또는 \`human_b\`

필드 값은 고정된 허용 목록만 사용. 수신자 ID, 카카오 대화 ID, 전화, 상호, 메모, 액세스 토큰을 URL/UTM에 삽입하지 않는다. 가능한 경우 같은 모집단·시간·예산으로 A/B 비교하여 편향을 줄인다.

**확인된 기존 제약:** \`site-metrics.js\`는 \`page_location\`을 canonical path만 남겨 보내므로 UTM 기반 GA4 세션 유입 분류가 누락될 수 있다. 통합 R3에도 아직 신규 측정 코드가 없다. 실제 출시 전 \`gtag\` 설치가 **한 번만** 되도록 감사하고, (1) 캠페인용 쿼리 전송 안전 필드 처리 또는 (2) 별도 고정 캠페인 이벤트 차원 중 하나를 일관되게 구현해 테스트한다. 개인정보 필터 없이 쿼리 원문 전체를 자동 전송하지 않는다.

## 5. GA4 설정 체크리스트 (승인 전 계정 변경 금지)

1. 실운영 데이터 스트림/측정 ID \`G-H9B5F4HRDS\`이 실제 Weplace 계정에 연결되어 있는지 확인.
2. GA4 DebugView/Tag Assistant로 R3 이벤트를 검수하고 중복 \`page_view\`가 없는지 확인.
3. \`section\`, \`topic\`, \`placement\`, \`campaign_variant\` 중 정말 필요한 매개변수만 이벤트 범위 맞춤 측정기준으로 등록 (표준 정의 우선).
4. \`generate_lead\`는 실제 접수 검증이 갖춰진 뒤에만 **주요 이벤트**로 설정; \`kakao_click\`은 보조 지표로 유지.
5. GA4 데이터 보관 기간(표준 속성 이벤트 데이터 최대 14개월)을 내부 보존 정책과 비교. 데이터 보호·삭제 절차가 필요함.
6. 차트/FAST/체험/문의/카카오 이동의 퍼널 탐색 보고서와 source/medium·UTM·device별 이탈 비교 생성.
7. 운영 기록과 대조한 주간 리포트: 세션, 구간별 도달 세션, 체험 선택 세션, 카카오 이동 세션, 실제 수신 문의, 전달 진단, 합의 미팅.
8. 장기 원시 이벤트 보관이 실제로 필요할 때만 BigQuery 무료 한도/비용/권한/삭제를 검토하고 연동 (즉시 필수 아님).

**권장 저장 층:** GA4(익명 이벤트와 집계) → Looker Studio(운영 대시보드) + FLOW/CRM(실제 수신·진단·미팅) → 소수 KPI를 주간 합계로 기록. 개인 식별 정보는 보고용 시트나 공유 대시보드에 복제하지 않는다.

## 6. 개인정보 및 동의 게이트

- 현재 \`config/privacy-release.json\`은 Draft이고 \`config/company-info.json\`도 공개 미승인 상태. 이 문서는 출시에 대한 승인 대체물이 아니다.
- 개인정보처리방침에 분석 도구의 종류·목적·수집정보·처리자/국외 이전·보존/삭제·선택권 등을 실제 운영 설정과 맞춰 검토한다.
- 필요 시 Google Consent Mode v2 및 동의관리 UI를 정확한 법적 기준에 맞춰 적용한다. 모드가 'denied'라는 이름만으로 모든 전송이 차단되는 것은 아니다(advanced vs basic 차이).
- Google 정책상 이메일·전화번호·개인식별자·자유입력/URL의 PII를 GA4에 보내면 안 된다.
- 기존 GA4 태그 자동 로드/쿠키 동작, 기존 GTM 및 리디렉트와 중복 태그 여부를 검토한다.
- 신규 행동 이벤트 기본값 OFF로 보존. 승인 후 별도 측정 브랜치에서 구현하고 Preview QA → 운영 배포 → 24~48시간 GA4 검증 순서.

## 참고 공식 문서
- GA4 이벤트: https://developers.google.com/analytics/devguides/collection/ga4/events
- 주요 이벤트: https://support.google.com/analytics/answer/13128484
- 맞춤 측정기준: https://support.google.com/analytics/answer/14239696
- 개인정보 전송 방지: https://support.google.com/analytics/answer/6366371?hl=ko
- 보존 정책: https://support.google.com/analytics/answer/7667196
- 동의 모드: https://developers.google.com/tag-platform/security/guides/consent
- BigQuery export: https://support.google.com/analytics/answer/9358801
