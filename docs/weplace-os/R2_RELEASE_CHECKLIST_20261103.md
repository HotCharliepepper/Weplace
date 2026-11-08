# WEPLACE R2 — 운영 공개 게이트 및 인수 기준
기준: 2026-11-03 · GitHub: HotCharliepepper/Weplace
FigJam: https://www.figma.com/board/QnhjcEPZctjddj7L4wWwGm

## 현재 상태
- [x] 공식 사이트와 Preview가 다른 배포임을 확인: Production `42562ec1` / Preview `06647cb8`.
- [x] 최신 R2 PR #13의 74개 테스트 통과와 브라우저 QA **기존 기록 확인**. 이번 작업에서 재실행하지 않음.
- [x] 생산용 빌드 차단 사유 문서 확인: `docs/brand/ribbon-v03/production-preflight.txt`.
- [ ] 회사·개인정보·사례 공개 승인 정보 확정.
- [ ] 확정 뒤 같은 SHA에서 production build 재실행 및 로그 기록.
- [ ] 리뷰어의 staging/production 화면 확인 및 운영 반영.
- [ ] 배포 직후 주요 경로, 카카오, /team /client, 404, 롤백 검증.

## A. 회사 표기 — 최신 증빙 필요
각 값의 값/증빙/확인자/확인일을 `config/company-info.json`에 정식 반영하기 전 승인.
- [ ] 법인명 (`legalName`)
- [ ] 대표자 (`representative`)
- [ ] 사업자등록번호 (`businessNumber`)
- [ ] 현재 사업장 주소 (`businessAddress`)
- [ ] 대표 이메일 (`email`)
- [ ] 대표 전화 (`telephone`)
- [ ] 개인정보 보호 담당 부서/연락 창구 (`privacyContactDepartment`)
- [ ] 정보 공개 승인 `releaseApproved`, `approvedBy`, `approvedAt`

기존 HTML, 이전 proposal/업종 페이지에 기재된 번호·주소를 *최신 확인된 증빙*으로 간주하지 않는다.

## B. 개인정보 운영 — 담당자의 실제 확인 필요
`config/privacy-release.json`의 아래 13항목을 현 운영 프로세스 기준으로 검토.
- [ ] 처리자와 문의 창구
- [ ] 처리 목적 및 근거
- [ ] 필수·선택 수집 항목
- [ ] 보존 기간 및 법적 보존
- [ ] 삭제·백업 삭제
- [ ] 처리 위탁·하위 처리자
- [ ] 제3자 제공
- [ ] 국외 이전
- [ ] 쿠키·통계·보안 로그
- [ ] 정보주체 권리 행사
- [ ] 안전조치 및 사고 대응
- [ ] FLOW 수집 시점 고지
- [ ] 서비스 약관과 개인정보 방침 구분
- [ ] 승인된 방침 원문, 시행일, 승인자, 승인 시점
- [ ] `/privacy/` 공개 화면에 '검토 초안' 표기가 없고 승인 문안과 일치

방침 확인이 안 된 상태에서 `releaseApproved`를 기계적으로 true로 바꾸지 않는다.

## C. 콘텐츠·채널·기술 QA
- [ ] 사례 A 2026년 5월 1.72억→6월 1.93억 / +12.2%: 원본·표기·공개 동의
- [ ] 사례 B 2026년 5월 877회→8월 2,350회 / +168%: '유입 횟수' 범위 명시
- [ ] 전후 비교의 원본·촬영·권리·가상 구성 표시
- [ ] 3주 15% 상승 등 미확정/인과 보장 문구 없음
- [ ] 로고, 파비콘, Ribbon, 웹폰트, alt, 모바일 최적화
- [ ] Google/Naver/홈페이지의 상호·연락처 일치, JSON-LD / OG / canonical
- [ ] 카카오 상담 링크와 고객이 실제로 전송하는 과정
- [ ] 자가진단 버튼이 실제 CRM 저장으로 오인되지 않는 설명
- [ ] 직원 /team, 고객 /client, 공개 API 2개 리디렉트/읽기 정책
- [ ] noindex Preview → 운영 index 정책·robots 검토
- [ ] 직원 권한, 고객 데이터, 결제, DB 변경 없음

## D. 배포 후 증빙
기록 항목: 승인 시각 / 승인자 / source SHA / 검증 로그 / Netlify deploy ID / URL / smoke QA / 롤백 대상 SHA.

## E. FLOW 통합은 별도 출시 열차
- [ ] R1·R1.1 Draft #18, #19와 현재 drop deploy 소스 차이 기록
- [ ] 분리된 Identity/DB/Blobs 확보
- [ ] 계정/고객사 권한 격리·작업 수정·별도 검수·고객 승인 E2E
- [ ] 우선순위·진행률·완료의 정확한 정의
- [ ] 신규 공개 접수는 정책 승인과 API 별도 개발 후 도입
- [ ] 자동 계약·결제·고객 초대·외부 공개를 FLOW 화면 상태와 혼동하지 않기

**의사결정 규칙:** 공개 R2 배포는 회사·개인정보 고지 승인이 완료된 뒤 추진한다. FLOW의 CRM/직원 협업 배포는 그 다음 별도 검증 트랙으로 출시한다.
