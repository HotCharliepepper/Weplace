# WEPLACE R4.3 — Cinematic Hero × Customer Journey

기준 원본: [R4.2 Draft PR #17](https://github.com/HotCharliepepper/Weplace/pull/17), `48a12279a12866acf1ad9a06ace2c8f991a9142e`.

영상 없이 작동하는 3장면 히어로와 별도 5단계 체험을 구현했다. 메인의 기존 진단 CTA는 `#request`를 유지한다. 새 체험 진입점은 진단 아래의 `/review/journey.html`이다. 운영 배포·main 병합·실결제·실DB·인증 변경은 하지 않는다.

## 확인할 결과물

- [Figma 전체 R4.3 페이지](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=90-2): PC·모바일 히어로 6개, 여정 10개. 기존 R4.2 페이지 보존.
- [프레임 ID와 크기](figma/frames.json).
- [실제 데스크톱 히어로](browser/desktop-hero-2.png), [모바일 히어로](browser/mobile-hero-2.png), [모바일 완료 화면](browser/mobile-journey-complete.png).
- [검수 결과와 한계](QA.md), [Runway 선택 영상 명세](RUNWAY.md).

## 방문 경로

| 단계 | 실제 작동 | 경계 |
|---|---|---|
| 히어로 | 흩어진 첫인상 → 순서 정리 → 사진·안내·다음 행동 연결 | 모든 텍스트·CTA는 즉시 표시. 1회 재생, 정지·장면 선택 가능 |
| 기존 진단 | 공개 채널 URL로 요청문 만들기 | 브라우저에서 문구만 생성. 카카오 전송은 사용자가 직접 수행 |
| 체험 진단 선택 | 네이버·Google·홈페이지 선택 | 선택만으로 분석이나 진단 결과를 만들지 않음 |
| 상품·범위 | 첫 진단 / 여러 채널 상세설계 | 첫 진단 0원, 매장 1곳·공개 채널 1개·개선안 1개. 상세설계 가격 미확정 |
| 모의 주문 | 선택 요약, 체험 확인, 오류·뒤로가기·재선택 | 연락처·카드정보·주문번호·접수 기록 없음 |
| 완료 | 체험 완료 안내와 당장 볼 첫 화면 제안 | 실제 접수가 아니라는 안내 유지 |
| 공유 | 고정 브랜드 문장+현재 검토본 홈 URL 복사, 실패 시 선택 복사 | 입력값·선택 채널·쿼리·해시를 제외. 자동 외부 전송 없음 |

음식점 A의 `1.72억 → 1.93억 / +12.2% / 2,100만 원`, 웰니스 B의 `877 → 2,350 / 유입 +168%`와 해석 범위를 보존했다. 기존 브랜드 SVG, 회사·개인정보 승인 게이트, 실서비스 라우팅, 인증·저장 구조를 그대로 유지한다.

## 개발과 재검수

```sh
npm ci
npm run verify
npx playwright install chromium
# 별도로 실행 중인 개발 서버 또는 검토 Preview를 지정
R43_BASE_URL=https://YOUR-DEPLOY-PREVIEW.netlify.app npm run test:r43
```

Work 환경의 정적 미리보기는 `npm run build` 후 `sites-preview start <checkout>`으로 연다. 이번 실행에서는 터미널에서 관리형 미리보기 호스트에 직접 접근할 수 없어, Playwright의 `route.fulfill`로 **동일한 dist 파일**을 읽는 로컬 fixture를 사용했다. 별도 서버나 네트워크 권한 변경은 없다.

```sh
R43_LOCAL_FILES=1 npm run test:r43
# 표준 Playwright 브라우저 대신 이미 설치된 Chromium을 지정할 때만
R43_LOCAL_FILES=1 R43_CHROMIUM_PATH=/path/to/chromium npm run test:r43
node scripts/measure-r43.cjs /path/to/r42/dist
```

`?scene=0`, `?scene=1`, `?scene=2`로 각 장면을 고정할 수 있다. 접근성·오류 검사와 캡처는 `tests/browser/r43.spec.cjs`, 렌더링 실험은 `scripts/measure-r43.cjs`에 있다. CI가 자동으로 브라우저 검사를 실행한다고 주장하지 않는다.

기존 폰트에는 448개 코드포인트의 제한된 글자 집합만 포함되어 있었다. 웹에서 빠지는 글자를 확인해 원본은 보존하고, 공식 Pretendard 1.3.9에서 필요한 한글 49자를 추출한 **이름을 바꾼 보완 폰트**를 추가했다. 두 굵기 합계 9,476바이트. OFL과 [글자 범위·출처·해시](font-coverage.json)를 포함했다. 새 문구를 추가하면 `scripts/build-r43-font-supplement.py`로 다시 확인한다.

Figma는 연결 환경에 Pretendard가 없어 Noto Sans KR를 사용한다. 편집 가능한 구조·상태 설계이며 픽셀 동일성을 주장하지 않는다. Figma의 기본 CTA는 여정 프로토타입으로 연결했고, 실제 웹의 메인 CTA는 기존 진단을 보존했다. 선택 분기·오류·클립보드 처리는 실제 웹이 기준이다.

현재 위치: 구현·로컬 검수 완료, 검토용 배포 제출 단계. 다음 첫 행동은 PC와 휴대폰에서 히어로의 속도와 모의 완료 후의 인상을 직접 확인하는 것이다. Runway 영상은 필수 의존성이 아니다.
