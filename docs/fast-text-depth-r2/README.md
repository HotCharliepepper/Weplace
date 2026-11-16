# WEPLACE / Text Depth R2 — VS Code Handoff

2026-11-16 · Visual experiment only

## 기준 / 실행 상태
- 기준: Draft PR #34 HEAD \`49569926954f8316404198c64e4b8c62c6df5ebf\`.
- 새 브랜치: \`draft/weplace-text-depth-r2-20261116\`. 기존 Sunwind와 R3 작업은 수정하지 않는다.
- 비교 페이지: \`/unified-r3-sunwind.html\` (기존) ↔ \`/unified-r3-text-depth.html\` (새 스타일).
- R3의 7개 화면, 사진/길/예약, 매출 차트, FLOW, 문의 복사와 기존 선택형 사운드는 동일.
- 운영 배포/병합/새 개인정보 수집/신규 GA4 태그/결제 없음.

## 왜 화면마다 같은 '3D'를 쓰면 안 되는가

글자 깊이는 단순한 광학 효과가 아니라 의미를 인식시키는 수단이다.
**같은 1시 방향 광원, 다른 시각적 무게**로 설계했다.

| 장면 | 강도 | 의미 | 적용 |
|---|---|---|---|
| 01. 차트·수치 | Medium | 정확한 숫자가 또렷이 보이게 | 1px 하이라이트 + 짧은 그림자; 세로축/원값 불변 |
| 02. FAST | High | 속도, 빛, 바람, 정착 | 기존 Sunwind 그대로; 중복 모션 없음 |
| 03. 어느 화면 | Medium | '먼저'를 스스로 고르게 | 키워드 밝은 면 + 얕은 측면 |
| 04. 보여주고→정리하고→실행합니다 | Low→Medium→High | 책임이 쌓이고 실행으로 끝남 | 각 단어의 그림자만 단계 차등; ScrollTrigger unchanged |
| 05. 함께하는 방식 | Low | 안정성과 신뢰 | 본문보다 제목만 깊이 |
| 06. 근거 | Medium inverse | 사실이 명확히 읽히게 | 짙은 배경 위 흰 글자 하이라이트 |
| 07. 진단 | Medium warm | 부담없이 다음 행동 | 질문형 키워드 강조 + CTA의 살짝 눌리는 감각 |

**수치와 자료는 움직이거나 부풀려 보이지 않게 한다.**
색 대비, 사용자 권한, 숫자 근거, 가격 비공개, 상담 수신 진실성은 시각 효과보다 우선한다.

## 실제 수정 위치

1. \`unified-r3-text-depth.html\`: 기존 Sunwind HTML과 똑같은 기능에 \`tdp-study\` 클래스와 새 CSS 링크만 추가.
2. \`assets/css/fast-text-depth-r2.css\`: 모든 시각 깊이 효과. 기존 \`unified-r3.css\`, \`resolute-*.css\`를 덮어쓰지 않는다.
3. 기존 \`assets/js/unified-r3.js\`의 \`playMotion()\`과 \`ScrollTrigger\`는 변경하지 않는다. FAST의 1회 가속과 Work의 독립 스크롤은 유지.
4. 정적 서체 렌더링이므로 새 폰트·Canvas·텍스트 이미지·Three.js/Spline 불필요.
5. 모바일에서는 그림자 패스를 줄였으며 \`prefers-reduced-motion\`, \`forced-colors\`, 키보드와 버튼 초점 대체를 제공.

## 사용자 로컬 환경 (PR #32 ZIP, .git 없음)에서 시험하기

사용자의 로컬 경로: \`WEPLACE_PR32_VSCODE_20261116/.../\` 및 5320 서버.
- 이미 Sunwind 패치를 적용했다면 **그 폴더를 복사**해서 비교할 것. 파일을 원본에 덮어쓰지 않는다.
- \`assets/css/fast-text-depth-r2.css\`를 동일 경로로 저장.
- \`unified-r3-sunwind.html\`을 **복사하여** \`unified-r3-text-depth.html\`로 생성.
- 새 파일의 body 클래스만 \`rv-vision unified-r3 swd-study tdp-study\`로 변경.
- \`</head>\` 직전에 CSS 링크 \`<link rel="stylesheet" href="/assets/css/fast-text-depth-r2.css">\` 삽입. **기존 CSS 뒤에 위치**해야 최종 override가 적용됨.
- 원래 서버 프로세스가 활성화되어 있다면 \`npm run build\` 뒤 \`http://127.0.0.1:5320/unified-r3-text-depth.html\` 열기.
- 새 route의 줄바꿈, 문장 가독성, 동작을 체크한 뒤 원본과 나란히 비교.

별도 테스트 스크립트는 현재 GitHub의 Draft 브랜치에서 \`npm ci\`, \`npm run verify\`, \`node scripts/qa-fast-text-depth-r2.cjs\`로 재현. Playwright QA는 빌드한 \`dist\`를 4173에서 서비스해야 함.

## 검수 완료 기준

- 360/390/430/768/1280/1440px에서 글자 잘림, 가로 넘침, 제목 겹침 없음.
- 차트의 \`2,100만 원\`, \`+12.2%\`, 5월/6월 원값·축·출처 그대로.
- Work 스크롤은 기존 순서대로 3문장, CTA와 FLOW 상세 링크 정상.
- 사진·길·예약 6가지 UI와 진단 모달/복사 독립 기능.
- 기존 FAST 사운드는 **기본 OFF**, 사용자의 클릭에서만 재생.
- 모바일에서 과한 그림자·읽기 피로가 없고, 대비/접근성이 유지됨.
- 실패 시 CSS 파일을 제거하거나 \`tdp-study\` 클래스를 삭제하면 원본 Sunwind로 돌아감.

## 이후 실제 고도화의 우선순위

P0 (런칭 기술/운영): 실제 Webplace GA4 속성 \`G-FVCYL26FTL\`에 검증된 태그 1회 연결; 기존 ID와 중복 방지, 개인정보/회사정보 공개 승인, 고객 매출 증빙, 기존 \`/#cases\` 링크 보존 등 별도 Work. 현재 Draft에서는 **미적용**.

P1 (시각): 실제 모바일 사파리/카카오 인앱에서 폰트·그림자·성능·가속 0.48s 테스트; 강한 1시 빛의 대비가 CTA를 흐리지 않는지 확인. 차트와 FAST 사이 전환 구간 한 번만 강화. 사진 픽셀 수는 별도 원본 권리·해상도 확인.

P2 (경험/전환): 선택→진단 문의 준비→카카오 실제 수신 경로를 한 명씩 검수. 사용자가 앞서 고른 사진/길/예약이 후속 화면까지 남는지 확인. GA4 익명 행동과 실제 수신 건을 분리 관리.

## 간단한 판단 기준

> 텍스트 그림자의 존재를 의식하게 만들지 말고, 의미가 더 쉽게 읽히게 만든다.

*시각 개선이 고객의 실제 전환을 늘렸다는 근거는 아직 없다. 광고 테스트/GA4 확보 이후 검증한다.*
