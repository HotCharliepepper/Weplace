# R4.4 QA — 2026-11-08

## 실제 실행 결과

- `npm run verify`: **88/88 통과**, 내부 링크 **0건 오류**(HTML 37개, 참조 1,125개). 외부 URL 20개는 이 링크 검사에서 요청하지 않음. 검토 빌드 성공.
- Playwright + Chromium **153.0.8010.0**: **43 통과 / 0 실패 / 3 적용 대상 아님**. 재시도 0, flaky 0.
- 제외 3건: 데스크톱에서 모바일 정적 포스터 전용 검사 1건, 모바일에서 데스크톱 자동 재생·가이드 카드 가림 전용 검사 2건. 각각 해당 기기 프로젝트에서는 실행·통과.
- 초기 QA의 두 실패는 테스트 작성 오류(종료된 GSAP timeline의 `undefined`를 `null`로 가정, 기존 native details 메뉴에 잘못된 선택자 사용)였다. 중복 메뉴 검사를 정리하고 기존 실제 메뉴 검사를 유지했다. 최종 결과에는 실패 없음.
- 시각 검수에서 발견한 시작 장면의 사진/글자 겹침은 코드 수정 후 별도 가림 검사와 실제 캡처로 재확인.
- [Playwright 요약 JSON](browser/playwright-summary.json), [보존 검증](preservation.json), [폰트 포함 문자 검증](font-coverage.json).

## 검수 범위

| 항목 | 결과·근거 |
|---|---|
| 1440 / 1280 / 768 / 430 / 390 / 360 / 320px | 가로 넘침 없음. 모든 폭에서 CTA가 900px 높이 안에 존재. 조건 문구 12px 이상. 수동 장면 전환 통과 |
| 1440 / 390 / 320px 실제 캡처 | Before/After 첫 화면·전체 페이지 저장. 최종 사진 구도와 한글 줄바꿈 직접 확인 |
| 3장면·8초 1회·정지·재생 | 데스크톱 통과. 종료 timeline 제거, 반복 없음. 장면 탭과 키보드 Home/End/좌우키 정상 |
| 2.5D | 전체 장면의 포인터 회전 확인. 키보드 포커스 진입 시 회전 해제. 세 장면 안내 글자 위에 사진이 덮이지 않음을 hit-test로 확인 |
| 모바일·모션 감소 | 8초 후에도 정적 포스터 유지. 자동 재생/포인터 회전 없음. 수동 설명 탭 사용 가능 |
| no-JS / GSAP 차단 | 정적 사진·H1·CTA·수치·범위·질문 카드와 전체 모의 경로 본문 유지 |
| 사진 지연·404 | 첫 문장·CTA가 기다리지 않음. 사진 실패 시 안내 폴백. 비교 탭과 진단 경로 정상 |
| 모바일 메뉴·키보드·포커스 | native details 메뉴, Escape 닫기·포커스 복귀, 메뉴 링크·모달 복귀 통과 |
| 기존 비교·사례·FLOW | 메뉴 먼저/외관 먼저, 업종 탭, 사례 대화상자, FLOW 단계 정상 |
| 첫 진단·상품·모의 주문 | 0원·1곳·1채널·1개 유지. 상세설계는 비용 확정 전 문구 유지. 명시적 모의 확인을 거쳐야 완료, 실제 접수/결제 주장 없음 |
| 마지막 질문·공유 | 이미지 다운로드 의도, 별도 질문 페이지, 복사 성공·거부 폴백, 기기 공유 성공·취소·미지원, 뒤로/앞으로 정상 |
| 개인정보·변경 범위 | 테스트 중 GET/HEAD 외 요청 0. localStorage/sessionStorage 쓰기 0. 공유 URL에 사용자 입력·임의 query/hash 포함 안 됨 |
| 접근성 자동 검사 | PC·모바일 각각 메인, 모의 여정 5상태, 질문 페이지: **검출된 위반 0** |
| 실제 영상 QA | **미실시/해당 없음**. video 요소·영상 요청 0. 사진과 코드 모션이 현재 결과물 |

자동 접근성 검사 결과에는 이미지 위 텍스트·SVG 차트·일부 기존 aria 요소에 `incomplete`가 남아 있다. [desktop-axe-home.json](browser/desktop-axe-home.json), [mobile-axe-home.json](browser/mobile-axe-home.json)에 대상을 보존했다. 사진 위 텍스트는 어두운 그라데이션 배경과 실제 화면으로 확인했지만, 자동 위반 0을 완전한 WCAG 인증으로 표현하지 않는다. 스크린리더 사용자 검수는 실시하지 않았다.

## 성능 — 로컬 렌더링 참고치

각 기기·버전 3회, 중앙값. 동일 Chromium, 새 컨텍스트, Playwright로 dist 파일 바이트를 직접 응답, 9초 관찰. 모바일은 4배 CPU 지연. 공유 호스트에서 실행한 참고치이며 인터넷/CDN/압축/실기기 배터리를 재현하지 않는다.

| 버전 | 환경 | LCP | CLS | 긴 작업의 50ms 초과분 합 | 요청한 원본 파일 바이트 |
|---|---|---:|---:|---:|---:|
| R4.3 기준 | Desktop | 132ms | 0.01416 | 21ms | 469,936 |
| R4.4 | Desktop | 136ms | 0.01509 | 22ms | 481,137 |
| R4.3 기준 | Mobile CPU×4 | 664ms | 0.00000134 | 373ms | 469,936 |
| R4.4 | Mobile CPU×4 | 660ms | 0 | 363ms | 481,137 |

[전체 샘플·측정 방법](browser/render-lab.json). 전송량이나 Lighthouse 점수가 아니다. 이 정도 차이를 성능 향상으로 단정하지 않는다. 최초 관찰 요청 파일은 약 11.2KB 증가했고 신규 영상은 0바이트. 기존 WebP를 재사용하며 DPR 1에서 640px 후보가 선택되는 것을 확인했다.

실제 네트워크 LCP·INP·현장 Core Web Vitals, Safari/iOS/Android 실기기 성능은 미측정이다.

## 재현

```sh
npm ci
npx playwright install chromium
npm run verify
R44_LOCAL_FILES=1 npm run test:r44
node scripts/capture-r44.cjs
node scripts/measure-r44.cjs /path/to/baseline/dist
```

이 실행 환경은 Playwright 기본 Chromium 다운로드가 실패하여 외부 임시 경로의 `@sparticuz/chromium@153.0.0` 배포 바이너리로 검사했다. 저장소 의존성은 변경하지 않았으며, 일반 환경은 위 기본 설치로 실행하면 된다. 별도 바이너리는 `R44_CHROMIUM_PATH=/absolute/path/to/chromium`으로 지정할 수 있다.

각 테스트 상태의 PNG는 실행 시 생성하며, 저장소에는 요청된 Before/After·콘티 JPG와 JSON 근거를 보관한다.

실제 Netlify 접근 검수는 [LIVE_REVIEW.md](LIVE_REVIEW.md)에 별도 기록한다. 로컬 파일 응답 검사와 인터넷 배포 검수를 혼동하지 않는다.
