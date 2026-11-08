# R4.5 검수 보고

## 실행

- `npm ci`: 성공. Node / Playwright / Chromium 버전은 `browser/qa-summary.json`.
- `npm run verify`: 88/88 통과, 37 HTML / 1,132 참조 / 로컬 링크 결함 0. 외부 링크 20개는 이 정적 검사에서 미탐색.
- `R45_LOCAL_FILES=1 R45_CHROMIUM_PATH=/tmp/weplace-r44-browser/chromium npm run test:r45`: **58 통과 / 0 실패 / 2 기기별 해당 없음**. Desktop autoplay 테스트의 mobile 제외, mobile poster 테스트의 desktop 제외.
- 최종 캡션 가독성 수정 후 폭·자동 접근성·히어로 보호 검사 추가 실행: 6/6 통과.
- CPU/rendering 실험: 동일 Chromium, fresh context, 로컬 dist bytes route fulfillment, 3회/기기, mobile CPU 4배 지연, 9초 관찰. 실제 네트워크/CDN 지연·압축 전송량을 반영하지 않습니다.

## 통과 범위

| 영역 | 결과 / 검증 내용 |
|---|---|
| 1440/1280/1024/768/430/390/360/320 | 수평 넘침 없음, CTA 즉시 표시, 근거 조건 가독성, 모바일 포스터 |
| Hero | T0/T3/T8 탭·좌우/Home/End·멈춤·8초 종료·재생·중복 GSAP 미로드 |
| 폴백 | no-JS, GSAP 차단, 사진 404/지연, reduced motion, Save-Data/3g |
| Lifecycle | pagehide/pageshow persisted 이벤트, 화면 이탈 정지, 키보드 포커스 정지 |
| 확대 | desktop 200% reflow / mobile CDP visual scale 2, 키보드 CTA 작동 |
| 숙박 예시 | 5개 탭·라벨·포커스·예시 상시 표시·호텔명/실사진 없음·no-JS 전체 설명 |
| 진단 예시 | 4개 항목 / 1채널·1개 개선안 / 가상 예시 / #request 연결 |
| 기존 | 루위 비교·업종 탭·웰니스 근거 대화상자·FLOW 탭·진단 메시지 로컬 준비 |
| 모의 주문 | 5단계·상세설계 미확정 가격·확인 체크·완료/재시작·Back/Forward |
| 공유 | 복사 성공/거절·공유 성공/취소/미지원 mock·개인 입력 미포함·다운로드 intent |
| 접근성 자동 | main·5개 모의 경로·질문 페이지 axe WCAG2A/AA/2.1AA/2.2AA violations 0 |
| 금지 작업 | 테스트 내 POST/쓰기 요청 0, local/sessionStorage 0, PG·DB·인증 변경 없음 |

자동 axe의 incomplete는 각 JSON에 남겼습니다. 이미지/SVG의 의미·주변 문맥과 포커스를 수동 확인했으며, 자동 0건을 완전한 접근성 인증으로 보지 않습니다.

## 수정 / 측정의 한계

- 초기 시선선 렌더에서 스케일과 dash의 조합 때문에 끝부분이 끊겼습니다. 화면 길이를 고려하고 최종 상태에서 dash를 해제해 수정했습니다.
- Figma 텍스트 height 1px 및 가로 모듈 높이 때문에 생긴 겹침/잘림을 Auto Layout 높이 계산으로 수정했습니다.
- 초기 mobile `html{zoom:2}` 검사는 390px을 195px 레이아웃처럼 강제해 실패했습니다. 이를 모바일 핀치 확대 검증으로 주장하지 않습니다. 이후 desktop reflow와 모바일 visual viewport 확대를 구분해 테스트했습니다. 195px CSS 레이아웃은 지원 범위 밖입니다.
- 실제 bfcache 캐시 복원은 엔진/네트워크 조건에 따라 달라집니다. 자동 검사는 persisted lifecycle 이벤트이며 실제 브라우저 Back/Forward는 질문/모의 경로에서 별도 확인합니다.
- Safari/iOS·Android 실기기, VoiceOver/NVDA, 실제 운영 CWV/INP, Lighthouse 점수, 사용자 인터뷰·전환율·예약/매출 성과: **미실시**.
- Figma Pretendard 완전 일치: **미완료**, Noto Sans KR 대체. 웹은 자체 호스팅 Pretendard.
- 숙박 실사진 공개, 촬영권/고객 공개 승인, 실제 OTA 적용, 기존 루위 차기 운영 공개권, 회사/개인정보 게이트: **확인 대기**.

## 실행 상태

소스·편집 프레임·브라우저 검수 완료. 실제 Netlify URL/배포 커밋 및 라이브 검수는 [LIVE_REVIEW.md](LIVE_REVIEW.md)에 기록합니다. 운영 배포·main 병합 승인을 의미하지 않습니다.

## 렌더링 실험 중앙값

| 버전 | 기기 | LCP(ms) | CLS | 긴 작업 초과분(ms) | 요청 파일 bytes |
|---|---|---:|---:|---:|---:|
| before | desktop | 136 | 0.01509 | 25 | 481137 |
| before | mobile | 676 | 0.00000 | 374 | 481137 |
| after | desktop | 132 | 0.01513 | 28 | 500994 |
| after | mobile | 700 | 0.00000 | 385 | 500994 |

로컬 렌더링 표본이며 네트워크 성능 점수나 실사용 개선 주장으로 사용하지 않습니다. mobile LCP +24ms, 요청 파일 약 +20KB의 변화입니다. 이 측정 이후 캡션 글자 크기 11→12px / 10→12px 수정(동일 CSS 길이)을 폭·접근성 회귀로 재검수했습니다.
