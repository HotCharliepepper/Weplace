# FAST Motion A — QA 결과

2026-11-11, Draft 검토용. [Draft PR #30](https://github.com/HotCharliepepper/Weplace/pull/30) · [Netlify Deploy Preview](https://deploy-preview-30--weplace.netlify.app/resolute.html)

## 기준과 검수 상태

- 작업 시작에 조회한 PR #29 HEAD: `c85c51d9eb70e5cb295a8227c2ade3b24360a8c1`.
- 새 브랜치: `draft/weplace-fast-motion-a-20261111`.
- 최종 코드 검수 SHA: `51df2f1a58d5fa7c5432bda661a5872b095aa715`. 이후 커밋은 검수 문서만 추가합니다.
- PR #29 HEAD와 main `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`는 종료 시 재조회해 변경 없음을 확인했습니다.
- [최종 GitHub Actions 실행](https://github.com/HotCharliepepper/Weplace/actions/runs/43036601009): Node 22, Google Chrome 156.0.8078.79, 완료 2026-11-11T14:16:54.684Z.
- 운영 배포·병합·실제 신청·결제·외부 전송 없음. B안 구현 없음.

| 검사 | 결과 | 확인 범위 |
| --- | --- | --- |
| `npm ci` / `npm run verify` | 통과 | 기존 Node 테스트 131/131, HTML 46개·참조 1,279개·오류 0, 정적 빌드 |
| 기존 `qa-resolute.cjs` | 155/155 | 6개 폭, 3주제×Before/After, 예약 선택 예시, 모달 포커스·복귀·가두기, 문의문 생성·실제 클립보드 복사·수정 시 무효화, 상세 경로 |
| `qa-fast-motion-a.cjs` | 112/112 | 아래 모션·오디오·접근성·실패 경로·성능 |
| 배포 Preview의 기존 검수 화면 | 191/191 | `e59650f`에서 실제 Netlify 핵심 경로·6개 폭·reduced/GSAP 미로딩 fixture 확인. 이후 약도 폰트 보정은 최종 CI에서 재검수. 입력·복사·외부 전송 제외 |
| 화면 육안 검수 | 통과 | 360/390/430/768/1280/1440px 히어로, 390/1440px 전체 reduced 화면 |

검사 집합 사이에 중복이 있으므로 숫자를 더해 고유 사례 수로 표현하지 않습니다. 로컬 환경은 브라우저 실행 제한과 Playwright 브라우저 다운로드 실패가 있어, 동일 소스의 실제 Playwright 실행을 GitHub Actions에서 완료했습니다. 기존 브라우저 테스트는 `FAST_A_BROWSER_PATH`로 설치된 Chrome을 선택하는 한 줄만 바꾸었고 검증 조건은 보존했습니다.

## 확인한 동작

- 제목은 정확한 이름 `RESOLUTE IT FAST.`의 H1 한 개. 중복 장식 레이어 4개는 접근성 트리에서 제외. 각 글자 baseline·높이 일치, 우측으로 CSS stroke 감소.
- FAST 120ms 준비 → 180ms 우측 가속 → 180ms 정착 → 420ms 정적. RAF 관측에서 390px +6px, 1440px +14px 및 왼쪽 잔상을 확인. 500ms 이후 이동·잔상 없음. 모션 종료 시 `will-change` 제거. 초기 진입은 무음 1회, 스크롤 자동 재생·반복 없음.
- 6개 폭에서 가로 넘침 없음, 한글 웹폰트 정상 로딩, 신규 버튼 높이 최소 44px. 약도 SVG의 시스템 글꼴 의존 문제를 발견하고 A안 CSS에서 기존 웹폰트로 보정한 후 전체 캡처 재검수.
- 키보드 Enter로 Sound ON, accessible name·pressed 상태, hero axe WCAG 2A/AA·2.1AA 자동 검사 위반 0. 이는 전체 사이트의 접근성 인증이나 실제 스크린리더 낭독 검수가 아닙니다.
- reduced-motion 최초 진입과 실행 중 실시간 변경, 수동 모션 OFF/ON, Save Data/2g, GSAP 요청 차단, 폰트 요청 차단, JS 비활성에서 제목·기존 비교/문의 진입 폴백 확인. 모션 ON으로 복귀해도 자동 재생하지 않음.
- 기본 AudioContext 생성 0. 사용자 ON에서만 context 생성/재개와 sine 2개 재생. 재생 사이 context suspend, 연속 재생 중첩 방지, OFF에서 context close, OFF 상태의 재생은 무음.
- Web Audio 미지원, constructor 예외, resume 거절, resolve되어도 suspended, 1.2초 timeout, 취소 후 늦은 resolve를 각각 주입해 mute/정직한 상태문구/비교 기능 유지 확인.
- visibility fixture로 숨김 시 소리·모션 정지, 숨김 중 시작 방지, 복귀 시 무음 확인. 실제 OS의 앱 전환·오디오 정책과 구분합니다.
- OfflineAudioContext로 실제 synth 코드 렌더링: 유효 신호 189.52ms, peak 0.02997(약 −30.5dBFS). WAV는 250ms 버퍼이며 끝은 무음. 스피커 체감 음량·음색의 청취 평가는 미실시.
- 브라우저 pageerror 0, 검수 중 비 GET/HEAD 요청 0. 0원 진단은 문의문 준비/복사까지이며 접수·예약 확정 표현 없음.

## 성능 영향

동일 CI Chrome, 캐시 없음, 네트워크 80ms 지연/10Mbps, 390px CPU 4배 감속·1440px 기본 속도. 각 폭에서 기준/A를 번갈아 3회 측정한 중앙값입니다. 기준 HTML은 PR #29의 고정 SHA에서 복원하고 같은 서버의 원본 CSS·JS를 사용했습니다. `/review/fast-a-baseline.html`은 테스트 중에만 생성하며 배포하지 않습니다.

| 폭 | FCP 기준 → A | LCP 기준 → A | CLS 기준 → A | JS 실행 기준 → A | 메인 스레드 작업 기준 → A |
| --- | --- | --- | --- | --- | --- |
| 390px | 648 → 656ms | 776 → 796ms | 0.0098 → 0.0098 | 96.1 → 120.0ms | 605.6 → 700.2ms |
| 1440px | 480 → 472ms | 540 → 508ms | 0.0134 → 0.0052 | 23.9 → 34.1ms | 165.2 → 219.6ms |

초기 로드 관측 구간의 누적 시간이며 지속 CPU 사용률이 아닙니다. 모바일 LCP +20ms, JS 실행 +23.9ms, 메인 스레드 작업 +94.7ms를 관측했습니다. 데스크톱 LCP는 −32ms였으나 3회 표본으로 개선 효과를 단정하지 않습니다. GC 영향이 큰 JS heap 값도 메모리 절감 근거로 쓰지 않습니다. 모든 A 표본 CLS는 0.0098 이하였습니다. 실기기·배터리·실사용자 Core Web Vitals 결과는 아닙니다.

| 추가 자산 | 원본 크기 | gzip 실험값 |
| --- | --- | --- |
| `assets/css/resolute-fast-motion-a.css` | 3,605B | 1,453B |
| `assets/js/resolute-fast-motion-a.js` | 6,916B | 2,622B |
| `assets/js/resolute-sonic-a.js` | 1,943B | 765B |
| `assets/resolute-fast-motion-a/fonts/WeplaceMotionA.woff2` | 1,952B | 1,975B |

CSS와 JS 합계 gzip 4,840B. HTML은 +1,134B(압축 전). 보충 WOFF2 1,952B는 상태 문구에서 해당 글자를 쓸 때만 필요하며 초기 성능 측정에서는 요청되지 않았습니다. gzip은 로컬 압축 비교값이며 Netlify의 실제 Brotli 전송량과 다릅니다. 신규 런타임 라이브러리·3D 엔진·오디오 파일 요청 없음. GSAP/ScrollTrigger는 기존 파일 재사용, 사운드 미동의 시 오디오 처리 비용 없음.

## 변경 파일과 보존 범위

- `resolute.html`: 추가 CSS·모듈 연결, 히어로 레이어와 작은 재생/사운드 컨트롤. `rf-experience` 이후 본문은 기준과 동일.
- `assets/css/resolute-fast-motion-a.css`: 얕은 측면·우측 하이라이트·광학적 획 변화, 컨트롤, 약도 폰트 보정.
- `assets/js/resolute-fast-motion-a.js`, `resolute-sonic-a.js`: 모션·사운드 상태/실패/정리 처리와 자체 생성음.
- `assets/resolute-fast-motion-a/fonts/`: 신규 UI에서 필요한 한글 8글자 서브셋과 라이선스.
- `scripts/qa-fast-motion-a.cjs`, `scripts/qa-resolute.cjs`(브라우저 선택 1줄), `.github/workflows/fast-motion-a-review.yml`, 이 폴더의 문서.

`index.html`, `ad-funnel.html`, `/go/*`, `/experience/`, R1 CSS/JS, package/lock, 기존 배포 설정·인증·FLOW·CRM·DB·가격·성과 로직은 변경하지 않았습니다. PR은 Netlify Preview 생성을 위해 main을 대상으로 하므로 이전 미병합 변경도 표시됩니다. A안 자체 변경은 [기준 HEAD와의 비교](https://github.com/HotCharliepepper/Weplace/compare/c85c51d9eb70e5cb295a8227c2ade3b24360a8c1...draft/weplace-fast-motion-a-20261111)로 확인합니다.

## 캡처와 증거

Actions의 `WEPLACE-FAST-A-QA` artifact에 6개 폭 히어로 PNG, 390/1440 전체 reduced PNG, 기존 Before/After 캡처, WAV, `qa-results.json`, `motion-*.json`, `performance.json`, `asset-cost.json`, `axe-hero.json`이 있습니다(14일 보관). 사용자 제출 ZIP은 최종 캡처와 동일 원자료, 실제 Netlify 캡처/검수 결과를 포함합니다. 전체 캡처는 문장·카드를 빠짐없이 검토하기 위해 reduced-motion으로 촬영했으며 기본 모션의 동작 여부는 별도 RAF·상호작용 검사로 확인했습니다.

## 미검수와 후속 판단

실제 iPhone/Android 기기, Safari, 카카오 인앱, VoiceOver/TalkBack/NVDA 낭독, 물리 스피커·이어폰·기기 음소거 정책, 장시간 배터리는 미검수입니다. 모바일 결과는 Chromium viewport/media 시뮬레이션입니다. 브라우저가 running 상태여도 운영체제·출력장치의 실제 청취 여부까지 검출할 수 없습니다.

A안의 깊이는 CSS 평면 레이어와 고정 음영의 착시이며 실제 메시·광원·회전은 없습니다. B안은 시작하지 않습니다. 추후 별도 요청이 있을 때 **가독성을 유지하는 깊이의 차이**, **실제 모바일 비용**, **CTA·비교·진단으로 이어지는 행동의 도움** 세 기준으로 판단합니다. 무료 도구와 정확한 라이선스는 [구현 기록](README.md)에 정리했습니다.
