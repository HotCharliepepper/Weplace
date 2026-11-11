# WEPLACE FAST — Motion A

2026-11-11. Draft 검토 전용. `resolute.html`의 FAST 히어로만 고도화하며 운영 배포·병합·실제 접수는 하지 않습니다.

## 기준

작업 시작에 재조회한 Draft PR #29 HEAD: `c85c51d9eb70e5cb295a8227c2ade3b24360a8c1`. 새 브랜치: `draft/weplace-fast-motion-a-20261111`. 기준 ZIP: `WEPLACE_FAST_A_WORK_AND_SKILLS_20261111(1).zip`의 4개 문서를 확인했습니다.

원본 `index.html`, `resolute-fast-r1.css/js`, FLOW·사례·사진/길/예약 비교·0원 진단·인증·DB·CRM·가격·배포 가드를 보존합니다. 새 히어로는 같은 `/resolute.html` 경로에서 검토합니다. PR #29는 바꾸지 않습니다.

## 구현

- 단일 의미론적 H1와 문구 `RESOLUTE IT FAST.` 유지. 장식 4개 레이어는 `aria-hidden=true`.
- 기존 Noto CJK KR Bold 서브셋의 테이블을 검사했습니다. `fvar`가 없는 700 정적 폰트입니다. 높이·baseline을 유지한 CSS stroke 0.012→0.009→0.006→0.003→0.001em과 얕은 측면/하이라이트로 광학적 차이를 냅니다. 실제 가변 글꼴의 굵기를 바꾸는 것은 아닙니다.
- 0–120ms 준비 → 120–300ms 우측 가속/왼쪽 잔상 → 300–480ms 정착 → 900ms까지 정적. 우측 이동 14px(모바일 6px), 반복 없음. 스크롤은 재생 조건이 아닙니다.
- 기존 GSAP 3.13.0 재사용. 새 모션은 transform/opacity만 바꿉니다. 블러, pointermove, pin, WebGL, 3D 엔진은 추가하지 않았습니다. 영구 compositor 힌트도 남기지 않습니다.
- 기본 무음이며 AudioContext를 만들지 않습니다. 사용자가 사운드를 켜면 190ms 자체 sine 스윕/확인음을 한 번 재생합니다. 이후에는 FAST 재생 클릭에서만 동반 재생합니다.
- 명시적 클릭에서 AudioContext 생성·재개, 1.2초 차단 타임아웃, 늦은 완료 무효화, 연속 재생 중복 방지, OFF/탭 이탈 시 정지·닫기. 음원 사이에는 context를 suspend합니다. 사운드 ON 상태는 이 페이지 메모리에만 있으며 다시 방문하면 무음입니다.
- reduced-motion·수동 모션 OFF·Save Data/2g·GSAP 미로딩에서 정적인 제목. 기존 비교·문의 기능은 독립적입니다. 새 모듈 로딩 실패 때도 제목은 CSS로 읽히며 기존 기능은 계속 동작합니다.
- 전체 캡처에서 약도 SVG가 시스템 `sans-serif`를 지정해 한국어 글꼴이 없는 Linux에서 네모 글자로 표시되는 것을 발견했습니다. A안 CSS에서 기존 `RF Sans` 웹폰트를 적용했습니다. 원본 약도의 문구·형태·동작과 R1 파일은 보존합니다.

## 검수와 성능

최종 수치·캡처·미검수 범위는 `QA.md`에 기록합니다. `npm ci`, `npm run verify`, `npx playwright install chromium` 후 dist를 4173에서 제공하고 `node scripts/qa-resolute.cjs`, `node scripts/qa-fast-motion-a.cjs`를 실행합니다. 후자는 `dist/review/fast-a-baseline.html`에 기준 HEAD의 원본 resolute.html을 요구하며, GitHub Actions가 해당 파일을 검수 중에만 생성합니다. 배포 소스에는 포함하지 않습니다.

성능 비교는 동일 Chromium·80ms 지연·10Mbps 다운로드, 모바일 CPU 4배 감속/데스크톱 기본 속도, 캐시 없는 상태에서 기준/A를 번갈아 3회 측정합니다. LCP/FCP/CLS, JS·메인 스레드 시간, 힙과 추가 정적 자산 크기를 기록합니다. CI 실험값이며 실사용자의 Core Web Vitals나 실제 휴대폰 성능을 뜻하지 않습니다.

## 도구·라이선스

- GSAP/ScrollTrigger 3.13.0: 기존 공식 배포본·[Standard no-charge license](https://gsap.com/standard-license), `assets/vendor/gsap/LICENSE.txt` 보존. MIT라고 표기하지 않습니다.
- Noto Sans CJK KR: 기존 SIL OFL 1.1. 신규 상태문구의 8개 글자만 1,952B WOFF2로 보충했습니다. 라이선스 동봉. 기본 화면에 해당 글자가 없으면 브라우저가 이 보충 폰트를 요청하지 않습니다.
- Web Audio: 브라우저 기본 API. 음원·샘플·오디오 라이브러리 다운로드 없음. sine 조합은 이번에 작성한 자체 생성 코드입니다. [MDN 사용자 제스처·컨트롤 안내](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [resume 결과 처리](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume)를 참고했습니다.
- Playwright(Apache-2.0)와 axe-core(MPL-2.0): 저장소에 있던 검수용 개발 의존성. 사용자 페이지에 추가하지 않습니다. fontTools(MIT)는 로컬 폰트 서브셋 생성에만 사용했습니다.
- VS Code 안내 문서는 참고했으며 사용자 PC에 도구·스킬을 설치하거나 기존 환경을 변경하지 않았습니다.

## 2.5D의 한계와 B안 판단 기준

A안의 깊이는 일정한 광원과 평면 레이어가 만드는 착시입니다. 실제 측면 메시·광원 이동·공간 회전·포인터 원근 변화는 없습니다. B안은 구현하지 않았습니다. 후속 비교가 필요하면 아래 세 가지로 판단합니다.

1. **느껴지는 깊이:** 정적인 첫 화면과 재생 후에도 A안보다 입체감이 명확히 나아지는가. 제목 가독성과 브랜드 톤을 유지하는가.
2. **기기 비용:** 실제 중저가 모바일에서 첫 CTA 도달·프레임·배터리·추가 다운로드 비용이 이득에 비례하는가.
3. **다음 행동:** 3D가 볼거리에서 끝나지 않고 비교 UI·0원 진단으로 가는 탐색을 돕는가. 키보드·움직임 줄이기·실패 시 대체 화면까지 유지 가능한가.
