# R4 실제 브라우저 검수

검수일: 2026-11-03. Chrome cloud browser와 격리된 로컬 정적 Preview를 사용했다. 이후 Netlify Deploy Preview 검수는 이 문서의 제출 기록에 추가한다. 아래 결과는 실제 화면 관측과 자동 테스트를 구분한다.

## 반응형과 기능

1440×900, 1280×900, 768×1024, 390×844, 320×740 CSS viewport에서 Hero, Store C, FLOW와 본문을 확인했다. 초기 `canvas=1` 검수와 스크롤바를 유지한 최종 검수를 구분해 JSON에 보존했다. 이 도구는 iframe의 CSS 폭을 바꾸며, 물리 기기나 네이티브 모바일 브라우저를 에뮬레이션하지 않는다.

| 항목 | 실제 결과 |
| --- | --- |
| 5개 폭 | 가로 넘침 없음. H1과 수치 표시, 폰트 로딩 완료 |
| Store C | 정리 전/후, ArrowRight·Home·End, 질문 선택의 `aria-pressed`, native 예약 안내 disclosure 정상 |
| FLOW | ArrowRight·End와 클릭으로 탭 변경. 선택 탭·패널 레이블 일치, 작업/내부 검수/고객 확인 3역할 표시 |
| 모션 절감 | 검수용 postMessage override 적용 후 선택 상태와 본문 유지. 실제 OS 설정 변경 검수와 구분 |
| 모바일 메뉴 | 열기와 Escape 닫기 정상 |
| 근거 모달 | 음식점 A 원자료 표시, Escape 닫기 후 호출 버튼으로 포커스 복귀 |
| JavaScript 차단 | Store C 모든 답, 전후 텍스트 비교, FLOW 전체 설명을 native disclosure로 읽음. 요청 필드는 안전하게 disabled, 직접 문의 링크 유지 |
| GSAP 누락 | 라이브러리가 없는 실제 fixture에서 탭·질문 선택·수동 요청문 생성 정상 |
| 문의 준비 | 합성 URL `https://example.invalid/weplace-r4-qa` 사용. “내용이 준비되었습니다. 아직 전송되지 않았습니다.” 표시. 외부 전송하지 않음 |
| 사진 누락 | 강제 404에서 alt 설명과 이미지 영역 유지, 해당 390px 검수에서 높이 195.047px·가로 넘침 없음 |

폼 fixture는 submit 이벤트를 허용하되 capture 단계에서 기본 이동을 차단한다. 기존 페이지의 로컬 요청문 생성 핸들러는 실행된다. 검수 화면 밖 이동과 인증 화면 이동은 차단했다. 실제 예약·고객 승인·CRM 쓰기는 없다.

## 접근성·SEO

실제 키보드/접근성 트리와 소스 검수로 제목 구조, 탭 역할·선택·레이블, 이미지 대체 설명, dialog focus 복귀, 버튼·disclosure 포커스 스타일을 확인했다. 정확한 SVG 제목·설명·0 기준선과 수치는 HTML에 남아 있다. 페이지가 GSAP에 의존해 내용을 숨기지 않는다.

빌드 결과의 H1은 1개이며, canonical은 `https://withweplace.kr/`를 유지한다. Preview의 HTML robots와 `X-Robots-Tag`는 `noindex, nofollow`이다. title·description·OG·JSON-LD는 기존 근거 중심 내용을 보존했다. 구조화 데이터에 가상 매장의 실체·예약 가능 여부·임의 평점은 추가하지 않았다. 내부 링크 검사 35 HTML / 1,063 참조 / 결함 0; 외부 URL 19개는 이 검사 범위에 포함되지 않는다.

네이티브 스크린리더, 물리 iOS/Android, 실제 OS reduced-motion 변경, 네트워크/CPU throttling은 **NOT RUN**이다. 자동 테스트의 MediaQueryList 모의 검증이나 검수 스위치를 네이티브 OS 검수라고 주장하지 않는다.

## 성능 관측과 해석

최상위 페이지 `/?qa=r4`에서 동일한 소스를 별도로 관측했다. 이 명시적 쿼리가 없는 일반 방문에서는 성능 수집 스크립트나 QA UI를 로드하지 않는다. 관측은 메모리와 DOM에만 남고 외부 전송·Storage 저장·입력값 수집을 하지 않는다.

| 로컬 LAB 표본 | 관측값과 조건 |
| --- | --- |
| 페이지 크기 | innerWidth 1,363 / clientWidth 1,348 / 높이 936 / DPR 1 |
| CPU·네트워크 | 현재 cloud browser, 제한 없음. 실제 모바일·throttle 환경 아님 |
| FCP / LCP | 200ms / 200ms; LCP 대상 H1 |
| CLS | 0.001; 작은 폰트 교체 이동 기록 포함 |
| 페이지 오류 | top-level observer가 기록한 error/unhandledrejection 0 |
| 추가 런타임 자산 | 원본 143,176B; gzip level 9 참고 합 53,086B. 새 사진 0B. 실제 전송 크기와 구분 |

[로컬 최상위 관측 기록](browser/r4-local-session-observations.json)은 브라우저 도구 출력에서 옮긴 값이며 전체 원시 trace는 아니다. iframe 원시 로그는 [초기 iframe 기록](browser/r4-browser-qa-initial.json), [기능 기록](browser/r4-browser-checks.json), [최종 fixture 기록](browser/r4-browser-qa-final.json)에 있다. [자산 예산](asset-budget.json)에 개별 크기를 기록했다.

초기 iframe에서는 CLS 0.302와 0.834가 관측되었다. BODY의 브라우저 기본 여백에서 스타일 적용 후 위치로 이동한 기록과 `canvas=1` 스크롤바 제거 이동이 포함되어 있다. 측정용 iframe의 `canvas=1`은 제거했다. 최상위 페이지에서는 같은 BODY 이동이 관측되지 않았다. 이 기록을 삭제하거나 좋은 값으로 바꾸지 않았으며, iframe 값을 홈페이지의 성능 합격 근거로 사용하지 않는다.

여러 조작을 한 도구 호출에 묶었을 때 Event Timing의 다음 paint까지 시간이 길어져 3,216ms까지 기록됐다. 각 클릭 처리 자체는 대체로 2ms 미만이고, 같은 배치의 뒤쪽 조작일수록 duration이 약 1초씩 줄어드는 패턴이 있다. 이는 배치 자동화의 paint 시점이 섞인 관측이라는 추정이며, 확인한 duration·처리 시간·타깃을 관측 기록에 남겼다. QA 버튼 이벤트도 `harness:true`로 남겼다. **이를 실제 사용자 INP 합격 또는 확정값으로 해석하지 않는다.** 필드 p75와 물리 모바일 상호작용 성능은 별도 확인이 필요하다.

## 자동 검증과 제출 기록

최종 `npm run verify`는 전체 83개 테스트, 로컬 링크 검사, review build를 모두 통과했다. [전체 최종 로그](final-verify.txt)를 참조한다. 100회 빠른 전환·실제 GSAP 실행·중복 WAAPI 0·라이프사이클 정리·보호 파일 24개 바이트 동일 검증은 자동 테스트 결과다.

Netlify 최종 URL·배포 커밋·실화면 및 top-level 관측: Draft PR 생성 후 검증 결과를 추가한다.
