# 홈페이지·FLOW 개인정보 처리 흐름표 — v1.2 검토

**운영 방침 아님. 실개인정보 조회·저장·전송·삭제 없음.** 소스상 필드와 실제 운영 사용은 다르다. 법적 근거·기간·위탁·국외 이전·권리 절차를 책임자가 확정해야 한다.

기계 판독 원본: `privacy-data-flow.json`. FLOW 11행은 검증된 원본 SHA `29dace237c8a2ce2323a499409a81aa28a12a50b`와 FLOW 소스실사 문서의 동시점 스냅샷이다. 보호된 avatar URL의 memberId/version도 실제 로그 검토 대상이며, 모든 URL에 식별값이 없다고 주장하지 않는다.

| ID | 구간 | 저장/전달 경계 |
|---|---|---|
| PF-01 | 홈페이지 업종·목적 비교 체험 | 현재 페이지 JavaScript 메모리. 자동 서버 저장 없음. |
| PF-02 | 6문항 자가진단·미팅 준비 | 브라우저 메모리. localStorage·자동 API/analytics 없음. |
| PF-03 | 사용자가 직접 보내는 카카오·이메일 상담 | 선택한 상담채널/이메일; 직원의 CRM·문서 복사 여부는 미확인 |
| PF-04 | 공개 홈페이지 기존 분석·호스팅 접속 기록 | Google Analytics / Netlify hosting; 실제 저장설정 미확인 |
| PF-05 | 가입·로그인·이메일 확인·비밀번호 복구 | Netlify Identity. 비밀번호 처리 방식·공급자 보유 항목/기간은 SDK 호출만으로 확정 불가. |
| PF-06 | 사용자 프로필·개인/팀 공간·협업 승인 | Netlify Database flow_profiles, flow_workspaces, flow_memberships, flow_join_requests |
| PF-07 | 선택 프로필 사진 표시 | Netlify Blobs flow-avatars + flow_profiles.avatar_key/avatar_version |
| PF-08 | 고객 계정과 계약 매장 연결·회수 | Netlify Database flow_client_codes, flow_client_grants, flow_client_events |
| PF-09 | 계약 고객 작업 의뢰·업무 보고·답변 | Netlify Database flow_client_records, flow_client_events |
| PF-10 | 직원 CRM·연락·계약 관리 | Netlify Database flow_workspaces.store.operations.accounts/interactions |
| PF-11 | 직원 업무·근태·미팅·검수 | flow_workspaces.store 및 flow_review_events |
| PF-12 | 가망고객 시트 검토형 가져오기·상담 후속 | flow_prospects, flow_prospect_events; Google Sheets source if activated; service credential in private Blobs |
| PF-13 | 제안 문서·가격/성과 근거·고객용 내보내기 | flow_briefs, flow_brief_events |
| PF-14 | 승인된 사례·업종 현황 공개 | flow_publications/events; flow_industry_profiles/capacity; 홈페이지 public API |
| PF-15 | 서비스 세션·접속 보안 기록·브라우저 예시 모드 | Identity cookie; provider infrastructure logs; demo browser localStorage |

## 확인해야 할 차이

- 공개 `/privacy/`는 초안이다. 회사정보·개인정보 처리의 책임자 승인 전 production build를 차단한다.
- Identity, Database, Blobs, Analytics, 상담채널은 이름만으로 수탁·국외이전의 법적 관계나 국가가 확정되지 않는다.
- 사진 참조 제거, 권한 회수, 공개 철회는 전체 원본/백업의 파기가 아니다.
- 직원 CRM, 근태/일정, 고객 의뢰, 공개 사례는 목적·정보주체·접근권한을 구분한다.
- FLOW runtime 법률 링크/수집 시점 고지는 이번 서버 변경 없이 별도 review fixture로 준비한다. 운영 적용과 버전 정합은 승인 후 동시 수행해야 한다.

## PF-01 · 홈페이지 업종·목적 비교 체험

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 홈페이지 업종·목적 비교 체험 |
| 정보주체 | 홈페이지 방문자 |
| 수집 항목 | 업종 enum, 목적 선택 index, 전후 보기 선택. 외부 전송 항목과 구분. |
| 필수·선택 | 체험 선택은 자발적. 이름/전화/매장명 입력창 없음. |
| 적법 근거 | NEED VERIFY — 실제 목적별 처리 근거를 운영 책임자와 확인. 코드/방침 링크가 동의나 계약 근거를 대신하지 않음. |
| 수집 경로 | 고객 시선 선택 UI → assets/js/customer-discovery.js |
| 저장 시스템 | 현재 페이지 JavaScript 메모리. 자동 서버 저장 없음. |
| 접근 가능자 | 해당 브라우저 사용자. 명시적 복사 결과는 사용자 클립보드. |
| 수탁자·재수탁자 | 응답은 서버 전송하지 않는 코드. HTML/자산 호스팅과 기존 운영 분석 공급자는 별도 행에서 검토. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 국가·시점·방법·적법 근거와 계정 설정 미확인. |
| 보유 기간·근거 | 응답 메모리는 페이지 수명. 내려받거나 복사한 사본에 서버 보유기간을 적용했다고 주장하지 않음. |
| 삭제 방법·백업 잔존 처리 | 페이지 새로고침으로 메모리 초기화. 명시 복사/사용자 스크린샷의 사본은 사용자가 관리. |
| 권리 요청 창구 | NEED VERIFY — 기존 공개 이메일/전화가 전담 개인정보 창구인지 미확인; 담당 지정 및 SOP 필요. |
| 확인일 | 2026-10-19 KST |

근거: `assets/js/customer-discovery.js`, `tests/privacy.test.cjs`

## PF-02 · 6문항 자가진단·미팅 준비

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 6문항 자가진단·미팅 준비 |
| 정보주체 | 매장 운영 상담을 검토하는 방문자 |
| 수집 항목 | 자가보고 선택 6개, 업종, 미팅 준비 checkbox 선택과 로컬 생성 요약 |
| 필수·선택 | 진단 결과 생성에 업종과 각 답변 선택이 필요. 미팅 준비 선택은 자발적이며 계약/수집 동의가 아님. |
| 적법 근거 | NEED VERIFY — 실제 목적별 처리 근거를 운영 책임자와 확인. 코드/방침 링크가 동의나 계약 근거를 대신하지 않음. |
| 수집 경로 | /check/ /meeting/ UI → store-check.js / meeting.js |
| 저장 시스템 | 브라우저 메모리. localStorage·자동 API/analytics 없음. |
| 접근 가능자 | 해당 브라우저 사용자. 직접 선택한 복사·내려받기·인쇄는 사용자 환경. |
| 수탁자·재수탁자 | 응답의 외부 전달 없음. 인프라 접속 기록은 별도 처리. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 국가·시점·방법·적법 근거와 계정 설정 미확인. |
| 보유 기간·근거 | 응답 메모리는 페이지 수명. 사용자 저장 사본은 해당 사용자 관리. |
| 삭제 방법·백업 잔존 처리 | 페이지 새로고침 초기화. 다운로드·인쇄·클립보드 사본은 사용자가 직접 관리. |
| 권리 요청 창구 | NEED VERIFY — 기존 공개 이메일/전화가 전담 개인정보 창구인지 미확인; 담당 지정 및 SOP 필요. |
| 확인일 | 2026-10-19 KST |

근거: `assets/js/store-check.js`, `assets/js/meeting.js`, `tests/privacy.test.cjs`

## PF-03 · 사용자가 직접 보내는 카카오·이메일 상담

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 사용자가 직접 보내는 카카오·이메일 상담 |
| 정보주체 | 문의한 방문자·담당자 및 메시지에 포함된 제3자 가능 |
| 수집 항목 | 사용자가 직접 보내는 연락정보, 매장 설명, 상담 본문. 실제 상담채널/사내 재입력 항목은 확인 전. |
| 필수·선택 | 사이트 링크 클릭은 선택. 실제 문의 최소 항목/홍보 선택 여부는 운영자 확인 필요. |
| 적법 근거 | NEED VERIFY — 실제 목적별 처리 근거를 운영 책임자와 확인. 코드/방침 링크가 동의나 계약 근거를 대신하지 않음. |
| 수집 경로 | 외부 카카오 채널 또는 mailto → 사용자가 직접 메시지 전송; 링크 클릭·복사와 상담 접수는 구분 |
| 저장 시스템 | 선택한 상담채널/이메일; 직원의 CRM·문서 복사 여부는 미확인 |
| 접근 가능자 | 채널 운영자·메일 계정 접근자 실제 명단/권한 미확인 |
| 수탁자·재수탁자 | NEED VERIFY — 서비스명과 실제 계약상 수탁·재수탁자를 대조. 사업자가 직접 확인해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 국가·시점·방법·적법 근거와 계정 설정 미확인. |
| 보유 기간·근거 | NEED VERIFY — 목적별 운영 기간/법정 보존 분리. 일괄 1·3·5년을 설정하지 않음. |
| 삭제 방법·백업 잔존 처리 | 채널·메일·직원 사본·CRM의 동시 삭제와 백업 처리 미확인 |
| 권리 요청 창구 | NEED VERIFY — 기존 공개 이메일/전화가 전담 개인정보 창구인지 미확인; 담당 지정 및 SOP 필요. |
| 확인일 | 2026-10-19 KST |

근거: `index.html contact links`, `check/index.html`, `meeting/index.html`, `start/index.html`

## PF-04 · 공개 홈페이지 기존 분석·호스팅 접속 기록

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 공개 홈페이지 기존 분석·호스팅 접속 기록 |
| 정보주체 | 방문자 |
| 수집 항목 | 코드상 fixed measurement ID, canonical page path, allowlisted 기존 event/업종/placement. 원문 진단·전화·상호·쿼리/해시는 payload에 넣지 않음. SDK 쿠키/온라인 식별자·호스팅 IP/log는 운영설정 검토 필요. |
| 필수·선택 | 기존 분석 보존. 신규 퍼널 이벤트 기본 OFF. 구체적 쿠키 통제/거부권 설계는 설정 실사 후 확정. |
| 적법 근거 | NEED VERIFY — 실제 목적별 처리 근거를 운영 책임자와 확인. 코드/방침 링크가 동의나 계약 근거를 대신하지 않음. |
| 수집 경로 | withweplace.kr production hostname의 GA4 load; 호스팅 요청의 별도 기록 |
| 저장 시스템 | Google Analytics / Netlify hosting; 실제 저장설정 미확인 |
| 접근 가능자 | 실제 분석·호스팅 계정 관리권한 미확인 |
| 수탁자·재수탁자 | NEED VERIFY — 서비스명과 실제 계약상 수탁·재수탁자를 대조. 사업자가 직접 확인해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 국가·시점·방법·적법 근거와 계정 설정 미확인. |
| 보유 기간·근거 | NEED VERIFY — 목적별 운영 기간/법정 보존 분리. 일괄 1·3·5년을 설정하지 않음. |
| 삭제 방법·백업 잔존 처리 | GA 보유기간/로그 보관/삭제·백업 정책 및 사용자 요청 처리 설정 미확인 |
| 권리 요청 창구 | NEED VERIFY — 기존 공개 이메일/전화가 전담 개인정보 창구인지 미확인; 담당 지정 및 SOP 필요. |
| 확인일 | 2026-10-19 KST |

근거: `assets/js/site-metrics.js`, `industries/dining.html`, `industries/stay.html`, `industries/hospitality.html`, `tests/privacy.test.cjs`

## PF-05 · 가입·로그인·이메일 확인·비밀번호 복구

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 가입·로그인·이메일 확인·비밀번호 복구 |
| 정보주체 | 직원·계약 고객 계정 사용자 |
| 수집 항목 | 이메일, 입력 비밀번호, 인증/초대/복구 토큰, 인증 계정 ID 및 공급자 반환 프로필 |
| 필수·선택 | UI 기준 이메일·비밀번호 필수. 재입력 비밀번호는 화면 비교용; OAuth는 실제 settings에 활성화된 공급자만 표시. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | AuthGate 가입/로그인/복구/초대 콜백 → @netlify/identity |
| 저장 시스템 | Netlify Identity. 비밀번호 처리 방식·공급자 보유 항목/기간은 SDK 호출만으로 확정 불가. |
| 접근 가능자 | 본인 인증; 서버는 검증된 동일 subject로 confirmedAt 확인. 비밀번호를 FLOW DB에 쓰는 코드 없음. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 앱의 logout은 탈퇴/Identity 삭제가 아님. account delete/admin.deleteUser 또는 전체 삭제 연쇄 구현 미발견. 공급자 백업/로그 삭제 미확인. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/components/AuthGate.tsx:245-279`, `netlify/server/flow-identity.ts`, `netlify/server/flow-session.ts`

## PF-06 · 사용자 프로필·개인/팀 공간·협업 승인

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 사용자 프로필·개인/팀 공간·협업 승인 |
| 정보주체 | 직원 및 고객의 FLOW 프로필 |
| 수집 항목 | user_id/member_id, 표시명, active_workspace_id, 생성·수정시각, 팀 membership role, join code/hash, 가입요청/승인자·상태·시각 |
| 필수·선택 | FLOW 이름/프로필은 계정 시작에 필요. 팀 가입은 고객 계정 연결과 별개. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | saveProfile / createWorkspace / requestJoin / approveJoin |
| 저장 시스템 | Netlify Database flow_profiles, flow_workspaces, flow_memberships, flow_join_requests |
| 접근 가능자 | 같은 팀 정책 및 owner/member; 개인 공간이 팀 가입으로 자동 복사되지 않음. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 전체 profile/workspace/member 삭제 UI/API·보유기간 자동파기 미발견. FK 제약은 탈퇴 절차가 아님. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `netlify/server/flow-database.ts`, `netlify/database/migrations/20261013113000_flow_identity_workspaces.sql`

## PF-07 · 선택 프로필 사진 표시

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 선택 프로필 사진 표시 |
| 정보주체 | 사진을 올린 FLOW 사용자 |
| 수집 항목 | 선택 이미지 → 브라우저 512×512 JPEG, Blob object key/version, DB 참조 |
| 필수·선택 | 선택 업로드. JPG/PNG/WebP 원본 5MB 이하, 전송 JPEG 256KiB 이하 제한. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | ProfilePhotoEditor 사진 선택/미리보기/저장 → avatar POST |
| 저장 시스템 | Netlify Blobs flow-avatars + flow_profiles.avatar_key/avatar_version |
| 접근 가능자 | 인증 본인·승인된 같은 팀 회원에 서버 ACL. private/no-store 응답. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | DELETE는 DB 참조만 null 처리. 기존 Blob object.delete·교체된 사진 정리 없음. 저장 후 DB 실패 시 orphan 가능. 물리파기/백업 정책 NEED VERIFY. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/components/ProfilePhoto.tsx:11-25,43-55`, `netlify/functions/avatar.mts`, `netlify/server/flow-database.ts:118-133`

## PF-08 · 고객 계정과 계약 매장 연결·회수

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 고객 계정과 계약 매장 연결·회수 |
| 정보주체 | 계약 고객, 승인 담당자 |
| 수집 항목 | 연결코드 hash, user_id, workspace/account ID, grant active, granted_by, 생성/승인/수정시각 |
| 필수·선택 | 해당 매장 열람을 위한 관리자 연결. 직원 membership을 만들지 않음. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | client code → owner lookup/confirmed grant/revoke |
| 저장 시스템 | Netlify Database flow_client_codes, flow_client_grants, flow_client_events |
| 접근 가능자 | 고객 본인 코드, team owner의 확인·부여·회수; 현재 active grant만 조회. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 코드 24h 유효/새 코드 교체/승인 후 code row 삭제. 만료의 자동 물리삭제 job 미발견. revoke는 active=false이며 업무·감사기록 삭제 아님. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `netlify/server/client-database.ts:22-66`, `netlify/database/migrations/20261014110000_flow_client_portal.sql:1-19`

## PF-09 · 계약 고객 작업 의뢰·업무 보고·답변

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 계약 고객 작업 의뢰·업무 보고·답변 |
| 정보주체 | 계약 고객·담당 직원; 자유기재에 들어올 제3자 가능 |
| 수집 항목 | title/body/date/url/status/reply, 작성자/매장 ID, shared/revision, 생성·수정시각, source_key |
| 필수·선택 | 고객 UI 제목·내용 필수, 희망일 선택. 의뢰 입력에서 고객 URL/상태/답변 임의지정은 차단. 직원 결과물 URL 선택. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | ClientPortal WorkContentForm 명시적 의뢰 접수 → client-portal POST |
| 저장 시스템 | Netlify Database flow_client_records, flow_client_events |
| 접근 가능자 | 계정 grant로 매장 분리, shared=true만 고객 응답, 관리팀은 account 권한; 고객 요청 하루30 제한. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | request 취소/완료 상태는 삭제 아님. 고객 요청 삭제·보유기간 cleanup 미발견. 내용에 제3자정보 최소화 고지 현재 없음. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/components/ClientPortal.tsx:12-14,46`, `netlify/server/client-database.ts:30-46,100-116`, `src/app/domain/client-portal.ts`

## PF-10 · 직원 CRM·연락·계약 관리

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 직원 CRM·연락·계약 관리 |
| 정보주체 | 고객사 담당자·개인사업자, 담당 직원 |
| 수집 항목 | 매장명/주소, 고객담당자명·직책, phone/email, 연락 요약·관계/요구메모, 계약상태·시작/종료·금액/paymentNote, 담당/열람자·시각 |
| 필수·선택 | 기술 스키마상 문자열 필드는 존재하되 빈값 허용 범위가 있음. 법적 필수 수집 항목은 별도 결정 필요. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | CrmWorkspace 명시 저장, approved import |
| 저장 시스템 | Netlify Database flow_workspaces.store.operations.accounts/interactions |
| 접근 가능자 | account owner/team owner/명시 detail reader; 현재 서버 projection과 작성자 권한. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 관계 closed/계약 ended는 삭제 아님. CRM 전체삭제·기간기반 파기 job 미발견. import baseline/last_import에 사본 존재. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/domain/operations.ts:4-42`, `netlify/server/flow-policy.ts`, `src/app/domain/account-access.ts`, `netlify/server/client-import.ts`

## PF-11 · 직원 업무·근태·미팅·검수

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 직원 업무·근태·미팅·검수 |
| 정보주체 | 직원·일정 참석자 |
| 수집 항목 | 출퇴근/예정시간·근무방식·장소·요약, 일정 제목/시간/장소/준비메모/결과·참여자, 업무목표·인수인계·검수자/의견 |
| 필수·선택 | 업무별 선택 저장. 실제 근무·개인 목표는 일반 팀원 응답에서 제한. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | DailyCheckin/Schedule/WorkWorkspace → authenticated flow/calendar |
| 저장 시스템 | flow_workspaces.store 및 flow_review_events |
| 접근 가능자 | 본인/팀 owner/명시 참가자·검수자 정책; 팀 일정 별도 projection. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 개별 task delete는 존재. 전체 근태·업무 이력 파기나 직원 퇴사 삭제 절차는 미구현/미확인. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/domain/types.ts`, `src/app/domain/operations.ts:43-89`, `netlify/server/flow-policy.ts:132-134`, `netlify/server/flow-database.ts:136-181`

## PF-12 · 가망고객 시트 검토형 가져오기·상담 후속

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 가망고객 시트 검토형 가져오기·상담 후속 |
| 정보주체 | 가망고객 담당자·사업자, 배정 직원 |
| 수집 항목 | name/phone/urls/need/hesitation/memo/reviewNote, 연락일·주기·다음행동·단계, 담당자, external/source ID, 원본위치/단계, last_import 및 원본조회시각 |
| 필수·선택 | CSV/JSON 또는 설정된 서버 시트 읽기 → owner 검토·선택 반영. 신규 홈페이지 자동수집 없음. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | ProspectWorkspace → prospects sheet/previewImport/import/save |
| 저장 시스템 | flow_prospects, flow_prospect_events; Google Sheets source if activated; service credential in private Blobs |
| 접근 가능자 | team owner 전체/가져오기/담당변경, member 본인 담당만. 서버 Sheets actual activation NEED VERIFY. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 연락중단/종료/계약성사는 상태일 뿐 삭제 아님. 누락 행 자동삭제 없음, 원본메모와 last_import 사본의 보유/삭제 결정 필요. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/domain/prospects.ts`, `netlify/server/prospect-database.ts`, `netlify/server/prospect-sheet.ts`, `netlify/database/migrations/20261014130000_flow_prospects.sql`

## PF-13 · 제안 문서·가격/성과 근거·고객용 내보내기

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 제안 문서·가격/성과 근거·고객용 내보내기 |
| 정보주체 | 고객사 담당자·작성/검토 직원 |
| 수집 항목 | client/title/problem/claims/prices/metrics/scenes/internalNote/reviewer, workspace/account/author IDs, revision/events/time |
| 필수·선택 | 직원 작성/검토; 고객 export는 승인된 항목과 최신권한 재확인. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | BriefWorkspace → briefs save/export |
| 저장 시스템 | flow_briefs, flow_brief_events |
| 접근 가능자 | 작성자 또는 team owner + 연결 CRM 열람권한; customer export는 internalNote 제외. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | 항목 제거는 문서 편집. 전체 brief/events 파기·보유기간 정책 미확인. 내려받은 고객용 파일 사본 회수 불가. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `src/app/domain/brief.ts`, `netlify/server/brief-database.ts`, `netlify/database/migrations/20261014064000_flow_briefs.sql`

## PF-14 · 승인된 사례·업종 현황 공개

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 승인된 사례·업종 현황 공개 |
| 정보주체 | 사례 고객/사진 정보주체·작성/승인 직원 |
| 수집 항목 | 독립 공개 원고(title/displayName/summary/before/action/result/evidence/cover URL 등), 내부 account 연결·동의확인 note·승인자/시각/이력; 업종 집계·기한 |
| 필수·선택 | 고객 공유 work가 자동 공개되지 않음. 사례 공개 별도 검토·고객동의확인, 수치 근거 필요. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | PublicationManager draft→submit→official owner publish; industry/capacity approval |
| 저장 시스템 | flow_publications/events; flow_industry_profiles/capacity; 홈페이지 public API |
| 접근 가능자 | 공식 workspace published만 public projection; 내부 account/승인자/note 제외. Free text는 사람이 비식별 검토. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | archive는 공개중단, DB/감사기록 삭제 아님. 업종 승인만료는 숫자 숨김. 사진 URL의 외부 원본 삭제/검색캐시/백업 파기 미확인. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `netlify/server/publication-policy.ts`, `netlify/server/publication-database.ts`, `src/app/components/PublicationManager.tsx:45`, `netlify/server/client-database.ts:123-138`

## PF-15 · 서비스 세션·접속 보안 기록·브라우저 예시 모드

| 필드 | 소스 관찰 / 확인 과제 |
|---|---|
| 처리 목적 | 서비스 세션·접속 보안 기록·브라우저 예시 모드 |
| 정보주체 | 방문자·계정 사용자 |
| 수집 항목 | 코드는 nf_jwt subject/expiry를 인증 후 안내용 조회. 인프라 request/IP/log 범위는 설정 미확인. 명시적 demo는 예시 업무를 localStorage에 저장. 보호된 avatar GET URL은 memberId/version query를 사용하므로 provider URL 로그 처리범위 확인 필요. |
| 필수·선택 | 인증 세션은 서비스 이용, 예시 모드는 별도 선택. 신규 homepage intake fixture는 로컬 가상값만. |
| 적법 근거 | NEED VERIFY — 목적별 운영·법률 검토 필요. 코드가 적법 근거를 확정하지 않음. |
| 수집 경로 | Netlify Identity/Functions/hosting; SessionNotice; demo confirmation |
| 저장 시스템 | Identity cookie; provider infrastructure logs; demo browser localStorage |
| 접근 가능자 | 세션 응답 private/no-store. 브라우저 예시는 사용자의 로컬 환경. |
| 수탁자·재수탁자 | NEED VERIFY — 코드 공급자와 실제 계약상 수탁자·재수탁자 및 역할을 대조해야 함. |
| 이전 국가·시점·방법 | NEED VERIFY — 실제 계정/계약/배포·저장 설정 확인 전 국가·이전 시점·방법을 단정하지 않음. |
| 보유 기간·근거 | NEED VERIFY — 목적별 보유기간과 법정 보존 여부 미확정; 일괄 기간을 만들지 않음. |
| 삭제 방법·백업 잔존 처리 | logout은 세션 종료이며 서버데이터 삭제 아님. 로그/backup 기간·파기/SDK cookie 실제 옵션 미확인. 예시값 자동 운영 이관 없음. |
| 권리 요청 창구 | NEED VERIFY — 법인 담당자·권리요청 이메일/전화·처리 SOP 확인 필요. |
| 확인일 | 2026-10-19 KST |

근거: `netlify/server/flow-session.ts`, `netlify/functions/session.mts`, `src/app/components/AuthGate.tsx:191-211,281-290`, `src/app/repositories/LocalStorageFlowRepository.ts:233`, `src/app/App.tsx:509`

