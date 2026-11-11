# 2026-10-19 홈페이지·FLOW 리빌딩 검토 결과

> 아래 본문은 PR #8의 v1.1 검수 기록이다. v1.2 후속 패치는 같은 브랜치 위에서 중앙형 소개·작업 연결 예시·공통 회사정보·개인정보 검토 초안을 추가했다. 후속 자동 검수는 `v12-code-review.md`, 개인정보 검토는 `privacy-data-flow.md`, 통합 구조는 `integration-map.md`를 따른다. 실제 브라우저 화면 기록과 최종 Preview 대조표는 v1.2 제출 보고서에 별도로 기록하며, 아래 v1.1의 ‘미수행’ 기록을 과거 사실로 보존한다.

**운영 변경 없음.** 홈페이지와 FLOW 변경은 서로 다른 검토 브랜치/PR이다. 고객 데이터 쓰기·자동 리드 저장·권한 변경·계약·결제·외부 메시지 전송은 활성화하지 않았다.

## 검토할 화면

- 홈페이지 `/`: 고객 질문 중심 Hero → 네 업종 → 목적 선택 → 정리 전/후 → 좋은 점·확인할 점·다음 행동.
- `/check/`: 기존 6문항, 카페 분리, 메모리만 사용. 업종만 미팅 준비로 전달.
- `/meeting/`: 실제 검색 화면·고객 질문·개선 예시·범위·담당·일정·가격/VAT/해지/환불을 확인하는 noindex 준비 화면. 수동 복사/인쇄.
- `/start/`: 상담부터 계약 이후 FLOW 작업 관리까지 실제 확인과 합의가 필요한 순서.
- `/my-store/`: 원본에서 확인한 계정 연결/공유 작업/요청/접속 문제 안내.
- `/review/audience.html`: 360/390/430/768/1024/1440px 폭을 선택하는 검토 도구.
- `/review/integration.html`: 미승인/만료/잘못된 응답/오류/불필요한 필드의 가상 API 검토 화면.

## Before / After

| 기존 | 변경 |
|---|---|
| 관리 현황·잔여석을 앞세운 폴더 | 고객 질문과 체험이 먼저. 승인된 실제 숫자는 유효한 경우 폴더 안에만 |
| 요식업·카페 동일 사진 | 자체 제작한 네 업종별 SVG 예시, 실제 사례 아님 표시 |
| 업종 선택 후 설명 중심 | 업종 → 방문 목적 → 전후 비교의 3선택, 8개 상황 |
| 하위 페이지의 독립 5문항·가상 계산 | 기존 6문항 `/check/`로 단일화 |
| 설명과 문의에서 흐름 종료 | 미팅 준비 → 제안/계약의 확인 항목 → 인증된 FLOW 작업 관리로 안내 |
| 구주소·미확정 가격·성과/기간 약속 | 확인 전 공개 보류, 확정이 필요한 조건 명시 |
| 일부 경로·자산 누락 | 원래 URL을 유지하면서 유효한 목적지로 연결 |
| 오래된 FLOW main만 원본 후보 | 실제 서버 작업 브랜치와 배포 ZIP 226/226 대응 확인 |

## 검증 결과

| 검증 | 결과와 한계 |
|---|---|
| 홈페이지 자동 테스트 | **37/37 통과**, 0 실패·0 생략. 4업종×2목적, 6문항, 미팅, 복사 fallback, 메모리/비전송, 메뉴, GA allowlist, 공개 수치/실패/만료/초점/레이스 |
| 링크·자산·앵커·sitemap | 소스와 `dist`: **HTML 22개 / 참조 537개 / 결함 0건**. baseline 결함 31건 |
| 구문·JSON-LD | 인라인 JS 및 구조화 데이터 parsing 통과 |
| 정적 빌드 | `npm ci`와 `npm run build` 통과. 공개 산출물에서 docs/tests/node_modules/비밀/CRM 서버 소스 제외 |
| 원본 리디렉트 | `_redirects` 7규칙 바이트 변경 없음. `/team`, `/team/documents`, `/client`, `/client/example` 실제 HTTP 302 목적지 확인 |
| 공개 현황·저널 | 운영 홈페이지 proxy 모두 HTTP 200, 현재 승인된 항목 0. 서버 projection/공개 승인 회귀는 FLOW 테스트에 포함 |
| 카카오 채널 | 기존 채널 HTTP 200 확인. 메시지 발송하지 않음 |
| FLOW 원본 | GitHub SHA와 보관 ZIP 226/226 일치. 재빌드 HTML+8 JS/CSS가 운영 파일과 바이트 동일 |
| FLOW 기존 회귀 | **145/145 통과**, TypeScript·빌드 통과. 가짜 데이터·로컬 DB emulator |
| FLOW 새 인입 검토 | **8/8 통과**, 별도 TypeScript 통과. tools/tests 전용, 실모드 없음, 새 함수/DB/런타임 변경 0 |
| 익명 보호 | 기존 session/prospects/client-portal HTTP 401 확인 |
| 브라우저·성능 | **미검증**. 관리형 환경에서 요구되는 control-browser 기능이 없어 실제 렌더링·모바일 Safari·시각 스크린샷·Lighthouse·느린 네트워크 검수를 완료했다고 주장하지 않음 |

홈 HTML 원문은 43,371 → 20,381 bytes로 분리/정리했다. 새 CSS/JS와 동작이 추가되었으므로 이것만으로 로딩 성능 개선이나 Core Web Vitals 향상을 주장하지 않는다. 네이티브 Netlify 배포 스크린샷이 제공되면 참고 자료로만 사용하며 여섯 기기 폭의 실제 검수 결과로 대체하지 않는다.

## FLOW 테스트 환경

실제 원본 SHA `29dace237c8a2ce2323a499409a81aa28a12a50b`를 기준으로 원본 226개 파일은 변경하지 않았다. 신규 `tools/homepage-intake` 검토 adapter는 기존 도메인 검증기를 재사용하지만 정해진 가상 매장과 example.invalid 연락처만 수용한다. `acceptedByCrm=false`, `persisted=false`, `sent=false`이다. 기존 스키마에 없는 email/동의 보관을 전화·메모 필드에 억지로 넣지 않는다.

[FLOW Draft PR #10](https://github.com/HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2/pull/10)은 기존 #9의 작업 브랜치를 base로 한다. 오래된 main이나 이전 Draft PR 체인을 이번에 병합하지 않는다.

## 운영 전 최종 확인

1. 미리보기 실제 화면(특히 모바일)과 copy, 카드, 진단, 미팅 흐름 검토.
2. 법적/운영 주소·사업자 정보, 공개 요금·VAT·착수·수정·환불 조건 확정.
3. 홈페이지 PR 병합과 운영 배포의 명시적 승인. PR #5와의 홈/sitemap 충돌은 별도 처리.
4. FLOW 실제 두 계정의 격리·연결·회수·로그인 복귀 검증, 공식 workspace/승인 담당자 확인.
5. 서버 함수 바이너리 provenance와 재현 가능한 배포/백업/장애 복구 경로 확인.
6. 자동 인입은 별도 수집 동의·보존/삭제·스팸 방어·durable 중복 방지·권한 검토 후 서버 기능을 추가하고 승인 후 켠다.
7. 계약/PG·외부 알림·신규 추적은 각각 별도 검증·승인. 이번 테스트 환경을 실데이터 인입 완료로 표현하지 않는다.

구조도: [integration-map.md](integration-map.md). 원본/권한: [flow-integration-inventory.md](flow-integration-inventory.md). 전 단계 매핑: [journey-to-crm.md](journey-to-crm.md). 판단·승인 기록: [measurement-and-decisions.md](measurement-and-decisions.md). 상세 QA: [qa-review.md](qa-review.md).
