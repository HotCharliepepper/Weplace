# R4.3 검수 기록

검수일: 2026-11-04. 기준: PR #17 `48a12279`. 범위: 정적 빌드·Chromium 브라우저·실제 UI 캡처. 실DB·실결제·카카오 전송은 실행하지 않았다.

## 결과

| 항목 | 실제 확인 결과 |
|---|---|
| 기존 회귀 검사 | 88/88 통과, 보호된 24개 파일 해시 유지 |
| 정적 링크 | HTML 36개, 참조 1,095개, 로컬 결함 0. 외부 URL 20개는 이 검사에서 미조회 |
| Playwright | 데스크톱 1440×1000 / 모바일 390×844, 24/24 통과 |
| JavaScript 완전 비활성 | 24개 검사에 포함된 2/2 통과. 실제 context 옵션으로 검수 |
| 자동 접근성 | axe-core 4.14.0, WCAG 2 A·AA / 2.1 AA / 2.2 AA 태그. 메인+체험 5상태 × 2화면, 자동 검출 위반 0 |
| 화면 폭 | 320 / 390 / 768 / 1024 / 1440px, 홈과 체험 화면 가로 넘침 없음 |
| 입력·동작 | 히어로·기존 비교 탭의 방향키, CTA, 사례 대화상자 닫기·포커스 복원, FLOW 탭, 진단 문구 생성 확인 |
| 모의 주문 | 무료·상세설계 분기, 확인 누락 오류, 뒤로가기·범위 변경, 완료·재시작 확인 |
| 공유 | 고정 문장+홈 URL. 입력·쿼리·해시 제외. 클립보드 성공과 거부 시 선택 복사 폴백 확인 |
| 외부 쓰기 | 테스트 중 POST·PUT·PATCH 등 쓰기 요청 0. localStorage·sessionStorage 저장 0 |
| 정적 폴백 | GSAP 차단 시 탭·내용 유지, JS 비활성 시 전체 여정 설명과 기존 진단 안내 유지 |
| 움직임 줄이기 | 히어로 정적 상태, 자동 재생 버튼 숨김, 수동 장면 선택 유지 |
| 한글 | 시각 검사에서 글자 누락 발견 → 원본 폰트 보존+보완 9,476B. 대상 콘텐츠 한글 381자 중 누락 0 |

재현 가능한 [검사 로그](browser/test-log.txt), [기존 검사·빌드 로그](browser/verification-log.txt), `browser/*-axe-*.json`, [폰트 검사](font-coverage.json)를 포함한다. 자동 검사만으로 접근성 적합성을 보증하지 않는다. 스크린리더 실기기, Safari·Firefox, 실제 iOS·Android 기기 검사는 미실시다. axe의 `incomplete` 항목은 원본 JSON에 남겼다.

## 화면

- [PC 시작](browser/desktop-hero-0.png) / [전환](browser/desktop-hero-1.png) / [완료](browser/desktop-hero-2.png)
- [모바일 시작](browser/mobile-hero-0.png) / [전환](browser/mobile-hero-1.png) / [완료](browser/mobile-hero-2.png)
- [상품·범위](browser/mobile-journey-scope.png) / [모의 주문](browser/mobile-journey-order.png) / [완료](browser/mobile-journey-complete.png) / [공유](browser/mobile-journey-share.png)

마지막 화면의 CTA가 기존 CSS 우선순위 때문에 배경과 같은 색이 되는 문제도 시각 검수에서 발견해 `button-light`로 수정했다. 해당 CTA의 대비·진단 복귀를 브라우저 검사에 추가했다.

[PC 마감 화면](browser/desktop-closing.png) / [모바일 마감 화면](browser/mobile-closing.png)

## 성능의 확인 범위

Playwright 1.64.1 + npm 패키지 `@sparticuz/chromium` 153.0.0의 Chromium **153.0.8010.0**을 사용했다. 기본 Playwright 브라우저 다운로드가 불완전한 ZIP으로 실패해 이 브라우저로 검수했다. 브라우저 보안 정책을 해제하는 `disable-web-security` 플래그는 사용하지 않았다.

관리형 미리보기는 클라우드 브라우저용이고 터미널에서는 연결되지 않았다. 자동 검사는 `route.fulfill`로 실제 `dist/` 파일을 전달했다. 네트워크 성능이나 Netlify CDN 속도에 관한 결과가 아니다. 네트워크 요청 크기는 압축 전 실제 파일 크기로 계산했다.

아래는 장치별 3회, 6초 관측 구간의 중앙값이다. 모바일은 CPU 4배 감속이다. 공유 실행 환경에서 나온 참고 값이며 이전 버전보다 빨라졌다는 근거로 쓰지 않는다.

| R4.3 로컬 렌더링 | 데스크톱 | 모바일 |
|---|---:|---:|
| 관측 LCP | 308ms | 740ms |
| 관측 CLS | 0.0143 | 0.00014 |
| 50ms 초과 작업의 초과 시간 합계 | 166ms | 675ms |
| 최초 화면 요청 리소스 | 459,329B | 459,329B |

동일한 파일 계측에서 PR #17은 430,435B였다. R4.3 추가 전송 대상은 약 28.9KB이며 새 영상 요청은 없다. [12회 원시 데이터](browser/render-lab.json)에 기준본과 R4.3을 모두 남겼다. 실제 네트워크 LCP·INP·현장 Core Web Vitals·Lighthouse 점수는 측정하지 않았다.

## 남은 판단

- 디자인: 실제 휴대폰에서 새 히어로의 속도와 첫 화면 타이포를 확인한다.
- 선택 영상: 생성·미디어 검수가 끝난 파일만 후속 검토본에 적용한다.
- 운영 전 조건: 기존 회사·개인정보 승인 게이트 22개가 열려 있다. 이번 검토본이 그 승인을 대체하지 않는다.
- 배포 결과와 정확한 commit/Preview URL은 Draft PR에 기록한다.
