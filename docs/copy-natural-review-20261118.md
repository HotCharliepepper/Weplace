# WEPLACE 공개 페이지 Natural Korean 2차 검수 — 2026-11-18

## 기준 원본과 범위

- 시작: GitHub `HotCharliepepper/Weplace` 운영 `main` @ `0dfacf571bc53d8e37558c968364c9b6c1fb9a16`. 현재 운영 페이지를 소스 기준으로 확인한 후 작업.
- 교정 기준: 사용자가 2026-11-18 재업로드한 `Natural_Korean_Limbic_R1_20261117(1).zip`, `00_START_HERE.md`, `manual/03_NATURAL_KOREAN_COPY_LAB.md`, `manual/05_BRANCHING_AND_DECISION.md`, `manual/06_ETHICAL_LIMBIC_REVIEW.md`, `manual/07_QA_AND_FIELD_TEST.md`, `knowledge/02_STATUS_AND_CLAIMS.md`.
- 모드: `NATURALIZE`(사실·의미 보존) + 과도한 일반화에 한한 `AUDIT`/사실 정정. 기능·서버·DB·FLOW·CRM은 변경하지 않는다.
- 원본은 main에 보존, 별도 Draft에서 변경. 운영 배포와 실제 고객 반응은 별도 확인한다.

## 수정 경로

1. `/` — 메인 히어로, 고객 질문, 현재 진행 중인 업종, HOW WE WORK, 실제 작업 기록, 자가점검, 문의.
2. `/november-fast/` (HTML: `november-fast-a-r6.html`) — 광고 반전과 FAST 시각물은 유지, 추상 문장·이전 R5 라벨·문의 설명 교정. R6 슬라이드 설문 원형 보존.
3. `/industries/` — 업종별 안내 허브, 실제 구현된 식당·카페·숙박 진입, 미구현 마사지·병의원 링크 비활성, 잘못된 /diagnosis /essay /webtoon 링크를 실제 자가점검·작업 기록·FLOW 체험으로 바꿈.
4. `/industries/beauty/`, `/industries/esthetic/` — 예약 전 정보·서비스·가격의 실제 질문으로 설명 전환, 통계 없는 ‘다섯 곳 평균’, 검색·매출 단정과 끊어진 링크 제거.
5. `/industries/restaurant/`, `/industries/cafe/` — '손님 절반 이탈', '아이폰은 구글맵 기본', '첫 9장에 무조건 결정' 같은 근거 없는 단정 정리, 실제 사진과 정보의 확인 문장으로 변경.
6. `/industries/dining.html`, `/industries/hospitality.html`, `/industries/stay.html` — 영어 번역체 같은 추상 H1/H2를 숙박·음식점 손님의 실제 질문으로 교정. 기존 조사 통계·계산식·가격/폼 값은 보존.
7. `/problems/`, `/problems/google-business-profile/` — 문제 선택에서 검색 정보 점검으로 문장 변경, 검색 순위 보장 및 불확실한 운영 인과관계 수정, 구조화 FAQ/페이지 본문 동기화.
8. `/start/` — 강한 ‘천장·바닥’, ‘광고로 재현 불가’ 등 비유를 관찰 지표로 교정. **13만 조회·첫 달 방문 사례와 가격 수치는 원본 대조 전 계속 사용 가능 사실로 승인하지 않는다**. 메인 앵커 경로 수정.
9. `/check/`, `/my-store/` — 현재 기능과 일치하는 자가점검·작업 진행 안내로 수정.

## 독립 확인한 사실 하나

기존 다수 업종 페이지의 ‘2025년 방한 관광객 1,740만’은 **전년도 누적/갱신 시점과 연간 기준이 혼동된 수치**. 정부 공식 2025년 연간 방한 외래관광객 **1,894만 명**으로 정정했다. 출처: 문화체육관광부 / 국가데이터처 `https://www.mods.go.kr/boardDownload.es?bid=108&list_no=445254&seq=1` (2026-10 보도자료 수록 2025 연간). 원문에서 ‘2025년 1~11월 누적’이라고 표시했던 주석도 ‘2025년 연간’으로 교체.

## 고정 원칙

- 기존 계약·고객명·성과 원장·가격·진단 결과를 임의로 고치지 않는다.
- 응답·모션·로그인·FLOW·예약·문의 CTA 같은 실행 기능은 유지. 불확실한 ‘1장 무료 결과물’ 제공 약속을 새로 만들지 않는다.
- 한국어 문장을 구체적으로 고치되 성과를 보장하거나 다른 업종의 속마음을 확정하지 않는다.
- R6는 사용자 입력을 자동 저장·카카오로 자동 전송하지 않는다. 실제 발송은 고객이 한다.
- Google Sheets 자동 수집 추가 없음.
- 병의원·뷰티 페이지에 남은 사업자 주소 표기의 불일치는 최신 서류 확인 전 임의 수정하지 않는다. **NEED VERIFY**.
- `/start/`의 13만 조회, 첫 달 방문, 요금/VAT 및 고객사 공개 동의는 출처·공개 가능 범위 확인 전 **SOURCE_STATED/NEED_VERIFY**이며 독립 검증했다고 말하지 않는다.
- 기존 빌드된 FLOW 및 field-notes의 번들 텍스트는 변경하지 않았다. 문장 검수·업데이트는 별도 원본 앱 프로젝트에서 해야 한다.
- QA는 표시·링크·JS·모바일 동작을 검증한다. 실제 전환 효과·구매 판단 개선은 테스트 고객의 관찰이 필요하다.

## 출고 점검

- 페이지별 단일 H1, 주요 CTA href/앵커 존재, 기본 구조화 데이터 JSON 파싱, JS 구문, 오래된 숫자 잔존 여부 확인.
- Chrome 390/1440에서 main / campaign / industries / self-check / problem index, 세 가지 선택과 R6 슬라이드가 동작하는지 검수.
- 운영 merge 및 Netlify deploy 후 실제 URL과 문의·카카오 동작을 실기기 Safari·카카오 인앱에서 재확인.

**사실 상태:** 페이지 코드 변경 = IMPLEMENTED, Preview 및 테스트 확인 전 TESTED 아님, 실제 송출 이후 PUBLISHED, 성과는 관찰 전 OBSERVED IN FIELD 아님.
