# WEPLACE — Hero Evidence Polish R3

2026-11-17 · 비교 검토용. 운영 main 병합 및 운영 배포 없음.

## 기준과 실행

- GitHub Draft PR #39 HEAD: `4f0d873dece051a6a2282819ba8a2be6fe69752e`.
- 원래 로컬에는 R2 HTML/CSS/JS 세 파일이 없었으며, `assets/js/unified-r3-hero-lab.js`는 PR HEAD와 같은 내용이었다.
- 원래 로컬을 덮어쓰지 않고 `.work/hero-evidence-polish-r3`에 독립 체크아웃했다. 기존 추적 파일의 내용 diff는 없다.
- 신규 화면: `/unified-r3-hero-polish-r3.html`. R2 비교: `/unified-r3-hero-polish.html`.
- [Netlify Draft Preview](https://6afbea8818c1890b022dc7c2--weplace.netlify.app/unified-r3-hero-polish-r3.html) · deploy `6afbea8818c1890b022dc7c2`, ready. R2 경로와 함께 HTTP 200/noindex 확인. 운영 deploy `6ad8a7438ddf68ea7482fcd2` 불변 확인.
- 로컬: `http://127.0.0.1:4173/unified-r3-hero-polish-r3.html`.
- 빌드 산출물: `http://127.0.0.1:4173/dist/unified-r3-hero-polish-r3.html`.
- 재시작: 이 체크아웃에서 `python -m http.server 4173 --bind 127.0.0.1`.

## 추가 파일

- `unified-r3-hero-polish-r3.html`: R2 복사에서 모바일 SVG와 CX 질문만 분리 개선. 푸터는 기존 inverse 로고 사용.
- `assets/css/hero-evidence-polish-r3.css`: 모바일 도표, 카피, 푸터 배치 및 버튼 대비.
- `assets/css/hero-evidence-polish-r3-motion.css`: 04 대각선 시작 위치와 문장별 깊이.
- `tests/hero-evidence-polish-r3.test.cjs`: 원값·기존 계약·SVG 좌표 보존 검증.
- `scripts/qa-hero-evidence-polish-r3.cjs`: 여섯 폭의 실제 조작 및 레이아웃 검증.
- `.github/workflows/hero-evidence-polish-r3.yml`: 빌드·정적 테스트·R3 브라우저 및 R2 회귀 검증.

새 JS controller는 없다. R2 연도 선택, 사진 전환, GSAP, FAST, 사운드, 문의 controller를 그대로 공유한다.

## 화면 변경

모바일 800px 이하에서 300×300 viewBox의 SVG를 사용한다. 4·5·6월을 모두 같은 1.50–2.10억 원 세로축에 그리며, 축은 0부터 시작하지 않는다는 설명을 유지한다. 기본 2026년 강조와 네 연도의 선택·전체 강조·2026년만 강조가 데스크톱과 모바일 SVG에 함께 반영된다. 과거 연도는 낮은 명도와 서로 다른 선 패턴으로 구분하며 원값 표는 그대로다. 360px에서 차트 폭 288px, 최소 레이블 크기 12px를 확인했다.

04의 정착 위치는 데스크톱 가로축 15%·30%·45%, 모바일 8%·19%·30%다. 기존 GSAP의 작은 이동과 R2의 한 행 포커스를 유지하며, 마지막 문장에 가장 깊은 좌하향 그림자를 부여한다. 비활성 문장도 읽을 수 있게 대비를 보완했다. pin, snap, 스크롤 잠금은 없다. reduced-motion에서는 모두 정적으로 선명하게 표시한다.

07의 질문은 “손님은 우리 매장의 어느 화면에서 멈출까요?”다. 요청한 서브 카피를 유지하고 사진·찾아오는 길·예약 안내를 떠올릴 수 있는 문장을 덧붙였다. 확인되지 않은 성과 약속은 없다.

푸터 로고·시그니처·고객 사례·FLOW·서비스·진단·개인정보 링크의 목적지를 유지했다. 어두운 배경에는 기존 `weplace-logo-dark.svg`를 사용한다. 기존 flex 상속이 grid를 깨뜨리는 부분은 이 비교 시안에서만 보정했다.

## 검수

- `npm run build`: 성공. 원래 회사·개인정보 승인 22개 미완료 경고 및 운영 차단 유지.
- `npm test`: **166/166 통과**. R3 신규 정적 테스트 5개 포함.
- `python scripts/check-links.py`: HTML 55개, 참조 1,794개, 내부 결함 **0**.
- Playwright Chromium: **299/299 통과**. 360 / 390 / 430 / 768 / 1280 / 1440px.
- 차트 상태, FAST 재생과 기본 무음, 사진 전환·복귀, 사진·길·예약 체험, 세 문장 포커스, 문의문 로컬 생성, 푸터 경로, 360·1440 reduced-motion 검수.
- JS 오류·HTTP 오류·네트워크 쓰기 0.
- 최종 캡처와 결과: [browser](browser/), [빌드](build.txt), [전체 테스트](automated-tests.txt), [링크](links.txt).
- Windows 최초 CRLF 테스트 오류는 독립 체크아웃의 controller 두 파일을 HEAD의 원래 LF 바이트로 맞춰 해결했다. 기존 테스트 코드와 Git 파일 내용 변경 없음. [진단](test-baseline-analysis.md).
- 대비 검수: 새 차트 숫자·CX·푸터·활성/비활성 문장 확인. 자동 대비 판정은 그라데이션·그림자 때문에 일부 판정 불가 항목이 있어 전체 WCAG 준수 인증으로 해석하지 않는다. 과거 차트의 비선택 선은 의도적으로 낮은 명도이며 선택 버튼과 원값 표로 확인할 수 있다. 기존 스타일의 포괄적 hook 경고를 일괄 무시하는 설정은 추가하지 않았다.

## 출처·승인 보존

- +168%: **웰니스 B**, 플레이스 상세 유입 877→2,350회 (2026.05→08).
- 4개년 매출: **음식점 A**, 2023~2026년 4~6월. 2026년 5→6월 1.72→1.93억, +12.2%.
- 서로 다른 업체·지표이며 사진 배열이나 Weplace 작업의 개별 인과 효과를 주장하지 않는다.
- 원장·실제 고객 자료 공개 권한, 회사정보·개인정보 승인 조건을 변경하지 않았다. FLOW·CRM·인증·DB·가격·결제·사운드 코드도 그대로다.
- 실제 iPhone Safari, Android 및 Kakao 인앱의 기기 검수와 자료 공개 동의는 이 Chromium 검수에 포함되지 않는다.

운영 배포나 main 병합은 이번 작업 범위가 아니다. Draft Preview의 주소와 배포 상태는 `netlify-preview.json`에 기록한다.
