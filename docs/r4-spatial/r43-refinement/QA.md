# R4.3 refinement QA

기준: PR #18 `9e3df4f`. Chromium 153.0.8010.0 / Playwright 1.64.1, desktop 1440×1000 + mobile 390×844 프로젝트. 추가 폭 1280 / 768 / 430 / 360 / 320.

## 통과

- 기존 `npm run verify`: 88 passed. 정적 링크·review build 성공. [원본 로그](verify.txt).
- `R43_LOCAL_FILES=1 R43_CHROMIUM_PATH=/tmp/chromium npm run test:r43`: **40 passed / 0 failed / 0 skipped**. [로그](browser/playwright.txt), [요약](browser/test-summary.json).
- 1440/1280/768/430/390/360/320에서 가로 넘침 없음. 세 히어로 상태마다 카드 경계가 영역 안에 있음. 조건·근거 12px 이상. 저장·복사·공유 터치 영역 44px 이상. [desktop](browser/desktop-widths.json), [mobile](browser/mobile-widths.json).
- 사진 메뉴/외관 탭, 키보드 상태·srcset 전환, 사례 dialog Escape/포커스, 업종·FLOW 탭, 진단 요청문 로컬 생성.
- 모바일 메뉴 Enter/Escape/내부 이동, 히어로/마지막 CTA, 공유 페이지 이동·브라우저 뒤로 가기.
- 모의 주문 동의 누락 오류, 무료/상세설계 분기, 완료 고지, 재시작, 브라우저 Back/Forward·포커스 복귀.
- 고정 질문만 복사/기기 공유 API에 전달. 개인정보성 테스트 입력·쿼리·hash·선택 채널 제외. 공유 취소와 미지원·클립보드 거부 폴백.
- JS 완전 비활성: 제목·수치·진단 범위·수동 연락·전체 모의 여정 설명·질문·다운로드 링크 유지. GSAP 차단, 사진 1.2초 지연 후 실패, reduced-motion, 유한 재생/정지.
- 메인 + 여정 5상태 + 공유 페이지 × PC/모바일의 axe-core 자동 검출 위반 0. 불확정 항목은 개별 `*-axe-*.json`에 남김. 자동 검사만으로 WCAG 전체 준수를 선언하지 않음.
- 검수 중 POST 등 비읽기 네트워크 요청 0. 여정/진단의 로컬·세션 저장 0.
- 보호 파일 24개 해시와 기존 섹션 5개 원문 일치. [보존 증빙](preservation.json).
- 실제 관리형 브라우저에서 `카드 저장` 클릭 → 다운로드 파일 생성, 원본 JPG와 SHA-256 `37e4afcbda06d752e399130df1a06f4c09bbe8810d3ff59079193a0cfe3966b6` 일치.

## 발견 후 수정

1. 768px 완료 상태와 1280px 전환 상태의 카드 잘림: 컨테이너 구간별 크기로 수정, 모든 세 상태 재검증.
2. 최초 Playwright run의 1건은 페이지 컨텍스트 생성 timeout. 동일 코드에서 최종 전체 run 통과. 자동 retry는 사용하지 않음.
3. `route.fulfill` fixture에서 네트워크 다운로드 파일 완료가 `canceled`로 반환됨. 실제 브라우저의 정적 URL 다운로드는 성공했으며 바이트 일치 확인. 자동 테스트는 다운로드 이벤트·파일명·원본 자산 존재를 확인하고, 실제 파일 저장 증빙과 구분함.

## 측정 범위 / 미실시

터미널은 관리형 Preview 서버의 네트워크 공간에 직접 연결되지 않아, Playwright에서 **실제 dist 파일을 그대로 route.fulfill**했습니다. 공개 Netlify에서는 별도 실제 브라우저 확인을 수행합니다. fixture 통과를 CDN·실기기 네트워크 통과로 확대하지 않습니다.

성능은 [로컬 렌더링 실험](browser/render-lab.json)입니다. 각 버전·PC/모바일 3회, 새 context, 6초 관찰, 모바일 4배 CPU slowdown. 전송량은 압축 전 요청 자산 합계. 캐시·실제 통신·필드 INP·Lighthouse 점수가 아닙니다. 재생 시간의 단축을 로딩 시간 개선으로 표현하지 않습니다.

영상은 사용하지 않아 영상 지연·재생 실패 테스트는 해당 없음. 대신 GSAP·사진 실패와 JS 비활성을 검사했습니다. 실제 Safari/Firefox·물리 기기·스크린리더, OS별 공유 시트 UI/메신저 수신, 고객 대상 발송, 실제 결제, 실DB·인증·권한 변경은 실시하지 않았습니다. 실제 전환율이나 매출 효과도 측정하지 않았습니다.

## 실행

```sh
npm ci
npm run verify
npx playwright install chromium
npm run test:r43
```

일반 환경은 `R43_BASE_URL=https://<검토주소>` 또는 로컬 static server URL을 지정합니다. 이 관리형 환경은 `R43_LOCAL_FILES=1`을 사용했습니다. `R43_CHROMIUM_PATH`는 설치한 Chromium 실행 파일을 지정할 때만 필요합니다. 기능상 서버 API·비밀키가 필요하지 않습니다.

### 렌더링 실험 중앙값

| 버전 | 화면 | LCP (ms) | CLS | 관찰 구간 긴 작업 초과분 (ms) | 요청 파일 바이트 |
|---|---|---:|---:|---:|---:|
| before | desktop | 848 | 0.00000 | 722 | 459,342 |
| before | mobile | 1516 | 0.00014 | 2555 | 459,342 |
| after | desktop | 656 | 0.01416 | 557 | 469,936 |
| after | mobile | 832 | 0.00014 | 591 | 469,936 |

검증용 빌드를 고정한 뒤 측정했습니다. 동일 작업기 표본의 변동 범위가 크므로 필드 성능 개선을 확정하지 않습니다. 신규 영상·외부 런타임은 추가하지 않았습니다.
