# R3 구현·검수 결과

검토용 통합 홈페이지를 구현했다. 운영 배포 승인을 뜻하지 않는다. 작업 종료 시 main HEAD `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`, #31 HEAD 및 운영 Netlify deploy `6ad8a7438ddf68ea7482fcd2`는 작업 시작 때와 같다.

- Preview: https://deploy-preview-32--weplace.netlify.app/unified-r3.html
- 광고 진입 비교: https://deploy-preview-32--weplace.netlify.app/review/unified-r3.html
- Draft PR: https://github.com/HotCharliepepper/Weplace/pull/32
- 이번 변경 기준: PR #31 `9f1b8ff36063cd84d405798707a41745f0844e48`
- 구현 설명·화면 출처·GSAP·이미지·서체: [README.md](README.md)
- 광고·문의 단계와 담당자 운영: [OPERATIONS.md](OPERATIONS.md)

## 실제 구현 범위

차트 → FAST → 사진·길·예약 전후 체험 → 대각선 실행 문장 → 압축 역량 카드 → 관측 근거·작업 기록·FLOW → 진단 문의를 하나의 페이지에 연결했다. 길 안내는 출구·골목·입구 사진·주차를 한 화면에 묶었다. 선택한 관심사는 1장 진단 예시와 문의문에 반영된다.

기본 무음, 선택형 사운드, OS/수동 모션 감소, 저속/Save Data, 이미지·GSAP·폰트 실패, JS 비활성, 복사 권한 거부를 처리한다. 문의문 준비·복사는 접수가 아니며 기존 카카오 채널에서 사용자가 전송해야 한다. 업종 4종 Draft 진입과 UTM 허용 목록을 제공하되 새 추적·이벤트 수집은 넣지 않았다.

## 자동 검증과 실제 브라우저

검증 코드 커밋: `b1ba1ccbad098c044d3ab25cfdab38e141c51149`. 이후 커밋은 이 문서와 보존 기록만 추가하며 실행 코드·테스트·의존성은 동일하다.

최종 CI: https://github.com/HotCharliepepper/Weplace/actions/runs/43058607075 — success. 캡처·로그 artifact: https://github.com/HotCharliepepper/Weplace/actions/runs/43058607075/artifacts/13873276055 (GitHub 보관 30일).

| 검수 | 결과 |
|---|---|
| `npm ci` | 성공, lock 변경 없음 |
| `npm run verify` | 143/143 통과, HTML 49개·로컬 참조 1,392개·정적 결함 0개, review build 성공 |
| R3 Playwright | 243 통과 / 0 실패 |
| 기존 Resolute / Depth R2 | 155 + 88 = 243 통과 / 0 실패 |
| 화면 폭 | 360 / 390 / 430 / 768 / 1280 / 1440px, 가로 넘침 없음 |
| 터치·키보드 | Chromium 모바일 터치 390/430px, 사진·길·예약 × 이전/정리 후. Enter/Space 동일 선택, 문의창 초점 이동·복귀 |
| 모션·사운드 | 실제 transform/잔상 프레임·3개 독립 스크롤 구간, 기본 무음·ON/OFF·재생·reduced-motion·탭 이탈·음성 권한 거부 통과 |
| 실패 대응 | JS 비활성, GSAP 차단, 이미지/폰트 실패, 저속/Save Data, 복사 권한 거부 통과 |
| 내부 상세 링크 | 기존 14개 경로·앵커 HTTP 200 및 존재 확인 |
| 광고 | 기존 `/go/*` 4개 → 기존 퍼널 유지. 새 업종 4종·안전한 UTM·뒤로가기 통과 |
| 접근성 | axe WCAG A/AA 자동 위반 0개. 색 대비 자동 판정 보류 1종(SVG·그라데이션 등)은 완전한 접근성 인증을 의미하지 않음 |
| R3 오류·외부 쓰기 | 페이지 JS 예외 0, R3 콘솔 오류 0, UI의 POST 등 쓰기 요청 0 |
| 카카오 | HTTP 200. 실제 Preview의 문의문에서 채널 열기 → '(주)위플레이스마케팅' 채널홈 확인. 메시지 전송 없음 |

기존 `/` 캡처에서 `assets/first-look/photos/recognize-a.webp`, `recognize-b.webp` 2개 경로가 404였다(2회 방문으로 콘솔 4건). 기준 #31에도 두 파일이 없음을 확인했다. R3에서는 해당 경로를 쓰지 않으며, 원본 보존 범위에 따라 수정하지 않았다. 정적 링크 검사만으로 동적 이미지 오류를 모두 찾을 수 없다는 한계도 기록한다.

브라우저 검사는 GitHub Actions의 실제 Google Chrome 156 / Playwright로 실행했다. 작업 컨테이너는 브라우저의 소켓 생성이 제한돼 로컬 Chromium 실행에 실패했으며, 성공한 것처럼 기록하지 않았다. 이후 CI 실행과 실제 Netlify Preview의 데스크톱 브라우저 확인을 완료했다. 마지막 변경은 FLOW 접근성 역할과 작은 설명 글씨의 대비 보완이며 최종 CI가 이를 포함한다.

수치 검사는 기존 코드의 172,000,000원·193,000,000원, 차이 21,000,000원, 증가율 12.2%, 단위·기간·0축·막대 높이를 대조했다. 원본 POS/장부의 독립 검증이나 Weplace 작업 기여율 검증은 아니다.

## 발견·수정 기록

1. 첫 전체 페이지 axe 검사에서 짙은 푸터 배경에 어두운 링크 8개의 대비가 부족했다. R3에만 밝은 본문색과 어두운 배경용 로고를 적용했다. 기존 푸터 파일은 그대로다.
2. OS reduced-motion 변경 직후 이벤트 처리 전 값을 읽던 테스트를 실제 설정 반영 후 검사하도록 고쳤다. 제품에서 모션·사운드 중단과 ScrollTrigger 제거를 확인했다.
3. 중복 업종별 안내 링크를 하나라고 가정한 QA locator와 기존 테스트의 브라우저 실행 환경변수를 수정했다. 제품 기능 오류와 검수 도구 오류를 구분한다.
4. 자동 판정 보류 항목을 확인해 FLOW 단계에 접근성 그룹 역할을 추가했다. 히어로·실행 문장의 작은 설명 글씨도 더 진하게 조정했다. SVG 축 라벨/차트 바탕 대비 8.67:1, 수치 10.96:1, 푸터 본문 12.02:1을 CSS 색상으로 산출했다. 그라데이션·SVG·장식 화살표의 색 대비는 자동 판정의 한계로 별도 기록하며 사진 위 모든 픽셀이나 실제 낭독 검수를 대신하지 않는다.
5. 터치 이벤트와 키보드 Enter/Space로 여섯 전후 화면을 추가 검수하고, 콘솔 오류의 페이지·리소스 출처를 기록했다.

## 화면 캡처

`unified-r3/` 폴더 기준. 전체 캡처와 정적 장면 비교는 reduced-motion으로 촬영하여 스크롤 중 숨겨지는 글자가 없도록 했다. 실제 모션은 별도로 `motion-frames.json`, `scroll-intervals.json`과 브라우저 검사에서 확인했다.

| 용도 | 파일 |
|---|---|
| 데스크톱 전체 | `1440-full.png` |
| 모바일 전체 | `390-full.png` |
| 차트 전후 | `{width}-before-top.png` / `{width}-after-top.png` |
| FAST 전후 | `{width}-before-fast.png` / `{width}-after-fast.png` |
| 대각선 문장 전후 | `{width}-before-work.png` / `{width}-after-work.png` |
| 역량 카드 전후 | `{width}-before-capabilities.png` / `{width}-after-capabilities.png` |
| 근거 장면 전후 | `{width}-before-evidence.png` / `{width}-after-evidence.png` |
| 진단 문의 장면 전후 | `{width}-before-contact.png` / `{width}-after-contact.png` |
| 사진·길·예약 6개 상태 | `{width}-experience-{photo,route,booking}-{before,after}.png` |
| 원본 길 안내 2개 상태 | `{width}-source-route-{before,after}.png` |
| 문의창·이미지 실패 | `{width}-request.png` / `390-image-failure.png` |

`width`는 390 또는 1440이다. 원본 캡처는 같은 빌드 안에서 보존된 `/`, `/resolute-depth.html`을 실제 촬영했다. 최초 차트는 기존 `.hero-evidence`, 근거 장면의 원본은 `#cases`이며 서로 동일한 길이의 장면은 아니다.

## 성능

동일 CI Chromium, cache off, 지연 80ms·다운로드 10Mbps, 모바일 CPU 4배 감속/데스크톱 1배. 각 폭·버전 3회 교차 실행의 중앙값이다. R3 첫 화면은 차트, 기준 화면은 히어로이므로 동일 콘텐츠 실험이나 실사용 성과로 해석하지 않는다.

| 폭 / 화면 | LCP | CLS | 스크립트 시간 | 50ms 초과 작업 |
|---|---:|---:|---:|---:|
| 390 / 기존 Depth R2 | 768ms | 0.0104 | 154.6ms | 1회 / 62ms |
| 390 / R3 | 576ms | 0.0129 | 76.4ms | 2회 / 122ms |
| 1440 / 기존 Depth R2 | 676ms | 0.0058 | 36.5ms | 0회 |
| 1440 / R3 | 404ms | 0.0009 | 30.0ms | 0회 |

모바일 LCP·스크립트 시간은 이 실험에서 감소했으나, 긴 작업 수/합계는 증가했다. 실제 저성능 기기 확인이 남는다. 초기 로드의 JS decoded bytes는 139,389→139,344, 폰트 153,844→161,120(+7,276 bytes). 히어로 참고 사진은 기존 188,239 bytes 그대로다. 신규 페이지 제어 JS 20,809 bytes(gzip 7,324), CSS 16,496 bytes(gzip 4,515). 원측정은 `performance.json`, `asset-cost.json`에 있다.

## 보존 및 파일 목록

기준 커밋의 기존 추적 파일 **668개를 바이트 대조**했다. 수정·삭제 0개. `index.html`, 기존 Resolute/Depth/광고 퍼널, `/go/*`, FLOW·CRM·인증·DB/API·사례 승인·company/privacy 가드·package lock은 변경하지 않았다. 결과는 [preservation.json](preservation.json)에 기록했다.

| 추가 파일 | 역할 |
|---|---|
| `unified-r3.html` | 일곱 장면과 진단 문의 |
| `assets/css/unified-r3.css` | R3 전용 화면·색·타이포·실패 상태 |
| `assets/css/unified-r3-fonts.css` | 누락 글자용 로컬 서체 연결 |
| `assets/js/unified-r3.js` | 체험·광고 문맥·문의·단일 모션 제어 |
| `assets/unified-r3/fonts/*` 3개 | 보충 서체 2개·OFL 라이선스 |
| `review/unified-r3.html` | 기존 광고 경로와 새 Draft 진입 비교 |
| `scripts/build-unified-fonts.py` | 보충 글자 빌드 재현 |
| `scripts/qa-unified-r3.cjs` | 실제 브라우저·캡처·성능 검수 |
| `tests/unified-r3.test.cjs` | 상태 전달·보안·근거·경로 가드 |
| `.github/workflows/unified-r3-review.yml` | R3 및 기존 화면 회귀 검사 |
| `docs/unified-r3/*` 6개 | 구현·QA·운영·내부 가격·글자·보존 기록 |

## 미구현·미검수와 운영 전 승인

| 구분 | 상태·다음 확인 |
|---|---|
| 실제 iOS Safari / Android / 카카오 인앱 | **미검수**. Chromium 터치 에뮬레이션은 실제 기기 검수를 대체하지 않음. 열기·뒤로가기·복사·채널 이동 확인 필요 |
| 물리 기기의 음질·볼륨 / 스크린리더 낭독 | **미검수**. Web Audio 생성·재생·중단과 키보드·axe 검사는 완료 |
| 원본 매출 자료·고객 공개 승인·사진 사용권 | 기존 코드/표기만 확인. 원증빙과 실제 공개 승인 재확인 필요 |
| 진단 상품 | 문의문과 구성 예시까지. 실제 무료 점검의 범위·담당자·기한·결과물 약속 승인 필요. 미래 유료 가격은 내부 가안만 보존 |
| 자동 문의 접수·CRM 기록·진단서 발급·미팅 예약 | **이번 범위에서 구현하지 않음**. 직접 카카오 전송 이후 담당자의 수신·처리 기록 필요 |
| 광고 발송·집행·전환 추적 | **수행하지 않음**. 기존 경로 보존. 발송 대상·동의·표시·최종 링크와 단계별 집계 승인 별도 |
| 결제·가격 노출 | **구현하지 않음**. 고객용 HTML/JS에 가격·할인·PG SDK·결제 버튼 없음 |
| 회사·개인정보 정책 | 기존 22개 운영 승인 검사 미완료. 기존 빌드 가드를 해제하지 않음 |
| main 병합·운영 배포·실DB 변경 | **수행하지 않음**. 화면 승인·미병합 Draft 의존 관계 검토 후 별도 승인 필요 |

다음 검토는 Preview에서 차트 → FAST → 길 안내 정리 후 → 진단 문의 순서로 진행하면 된다. 승인 전까지 고객 발송 링크를 새 Preview로 교체하지 않는다.
