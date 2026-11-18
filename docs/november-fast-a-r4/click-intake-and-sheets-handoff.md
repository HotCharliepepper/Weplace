# WEPLACE November FAST R4 — 클릭형 상담 및 Sheets 연동 인계

작성일 2026-11-18. 독립 검토용. PR #46 HEAD 4cab7e4b8c2ba5520892b5010a172d6ebc301c43 기반.
신규 페이지: /november-fast-a-r4.html. 기존 R3, main, FLOW, CRM, 인증과 DB 변경 없음.

## 실제 구현

- 상담 이력: 처음 / 이전 협업 점검 (기본은 처음, 고객이 변경).
- 업종 선택: 식당/카페/숙박/뷰티/기타 (필수).
- 화면: 사진/찾아오는 길/예약 안내. 기존 비교 화면 선택을 승계하고 변경 가능.
- 불편: 주제에 맞춰 세 문장 중 한 가지 클릭 (필수). 주제 변경 시 불편 항목 초기화.
- 받고 싶은 안내: 먼저 바꿀 순서 / 개선 방향 / 비용·일정 (필수).
- 필수 세 가지를 누르면 카카오톡 문의문 자동 완성. 한 화면에서 진행률과 내용 요약을 보여줌.
- 페이지는 서버에 내용을 저장하거나 자동 전송하지 않음. 매장명, 연락처는 별도 입력 없음.

## 카카오 동작 및 제한

'내용 복사하고 카카오톡 열기' 누르면 클립보드 복사를 시도하면서 기존 Weplace 채널 채팅 링크를 새 탭에서 연다.
모든 기기에서 자동 복사가 성공한다는 보장은 없으므로, 별도 복사 버튼과 텍스트 선택 폴백, 단순 채널 열기 링크를 보존.
채팅창에 고객이 직접 붙여넣고 보내야 접수 완료. 카카오 공식 Channel.chat 기능은 채팅방 진입만 지원하며 메시지 자동 전송 기능이 아니다.
공식 문서: https://developers.kakao.com/docs/ko/kakaotalk-channel/js

## Google Sheets 자동접수 — 미연결

추천 경로: 캠페인 선택 UI → 승인된 서버리스 POST 접수 → 서버에서 Google Sheets API append.
실제 배포 전 회사/개인정보 고지·수집목적·보관기간·담당자·철회·삭제 절차 및 별도 동의 확인이 필요하다.
서버는 허용값 검증, 부정 제출 방지, 중복 방지, 권한·접근 기록 및 실패 처리 필요.
Google Sheet ID/서비스 키/토큰과 고객정보를 정적 HTML 또는 공개 저장소에 공개하지 않는다.
직접 Apps Script 공개 URL POST는 스팸과 보안 검증 없이 활성화하지 않는다.

대안: Google Forms → 연결된 Google Sheets 방식은 운영이 간단하지만 캠페인 밖으로 이동하므로 이탈 가능성이 있다.
Google 공식 문서: https://support.google.com/docs/answer/2917686

Sheet 제안 열:
received_at, inquiry_id, campaign_id, source_channel, relationship, industry, focus, concern, desired_help,
store_name_optional, preferred_contact_optional, consent_version, consent_timestamp, status, assigned_to, first_reply_at, next_action.

실제 연락처·사업장명 입력은 수집 목적과 권한이 확정된 후에만 추가.
'Sheets 접수 완료' 표시 기능은 서버 성공 응답을 검증한 뒤 켠다.

## 내부 검수 시나리오

1. iPhone Safari/Android Chrome/카카오 인앱에서 R4 Preview 접속.
2. 길→주차·대중교통→식당→비용·일정→기존 상담 클릭.
3. 입력 없이 만들어진 문의문과 복사 동작, 카카오톡으로 열기 확인.
4. 길→예약으로 변경 시 불편 항목 초기화와 주요 CTA 비활성화를 확인.
5. 카카오 채널에 직접 붙여넣고 보내서 내부 담당자가 수신 확인. 전송 전에 접수됨으로 말하지 않는다.
6. 외부 발송은 수신 동의, 광고 표시·수신거부, 회사·개인정보 공개 정보, 혜택 확정, 담당자 준비 후 별도 결정.

## 상태

실제 제작: 선택 UI / 요청문 자동 완성 / 클립보드 시도 / 카카오 채팅 링크.
미구현: 고객정보 자동 수집, Google Sheets append, 카카오 자동 전송, 실기기·운영 배포.
