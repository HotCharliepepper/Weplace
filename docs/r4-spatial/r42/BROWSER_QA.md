# R4.2 브라우저 검수

2026-11-03 · 실제 Chrome 렌더 및 UI 조작. 로컬 review build를 Sites preview로 열었습니다. 계정 접속, 고객 메시지 전송, 예약 확정, DB 쓰기는 수행하지 않았습니다.

## 확인 결과

| 항목 | 관측 결과 | 증빙 / 범위 |
|---|---|---|
| 반응형 | 320·360·390·430·768·1280·1440 CSS px에서 문서 가로 넘침 없음 | `browser/viewport-fixtures-raw.json`; iframe 내부 폭, 물리 기기 에뮬레이션 아님 |
| 첫 화면 | 기존 매출 수치·기간·관측 단서, 새 로고와 녹색 포인트 표시 | 최상위 홈페이지 실제 렌더 확인 |
| 루위 사진 | 메뉴 먼저는 베이징덕, 외관 먼저는 제공 자료의 차량·외관 영역 | `browser/desktop-food-local.jpg`, `browser/mobile-food-390-qa.jpg`, `browser/mobile-cars-390-qa.jpg` |
| 사진 프레이밍 | 외관 사진에서 옆 인물 콜라주·리뷰·플랫폼 UI가 보이지 않도록 CSS 프레임 확인 | 제공 캡처 파일 자체는 변경하지 않음 |
| 비교 탭 키보드 | ArrowLeft / ArrowRight로 선택·초점·사진·대체 텍스트 변경 | 390px; before 패널 높이 745.75px, after 744.55px 관측 |
| 음식 질문 | 대표 메뉴 → 식사 자리 → 예약 안내가 해당 답변으로 전환 | 음식과 무관한 마사지 안내가 남지 않음 |
| 예약 설명 | 버튼을 열면 안내 순서와 ‘실제 루위의 예약 조건을 안내하는 화면은 아닙니다’ 표시 | 실제 예약 동작 없음 |
| 모바일 메뉴 | 320px에서 메뉴 열기, Escape 닫기·초점 복귀 | `browser/mobile-menu-320-qa.jpg` |
| FLOW 회귀 | 대표님 확인 / 다음 할 일 탭 및 End 키 전환 | 기존 구조·예시 상태 유지; 저장·승인 없음 |
| 진단 요청문 | 0원·매장 1곳·공개 채널 1개·개선안 1개·4가지 안내 구성 일치 | 합성 URL `https://example.com/qa-r42`로 로컬 문구 생성; ‘아직 전송되지 않았습니다’ 확인 |
| Mashcore | 현재 소개 페이지의 Weplace 구간으로 연결 | `https://mashcore.co.kr/about/#weplace`; 사용자 계정/상담정보 전달 없음 |
| JS 차단 | 제목·핵심 내용 표시, 요청문 작성 fieldset 비활성, 직접 문의 대안 유지 | sandbox fixture; 성능 수집 NOT RUN |
| GSAP 없음 | 핵심 내용과 기본 UI 표시, GSAP false | no-gsap fixture |
| 음식 사진 없음 | 사진 naturalWidth 0·complete true 상태에서도 문구와 대체 설명, 레이아웃 유지 | no-photo fixture; 사진 없는 상태를 정상 로드로 주장하지 않음 |
| 모션 절감 | reviewReduced true, HTML `data-r4-motion="reduced"` | 검수 메시지로 적용; OS 설정 자체를 바꾼 시험이 아님 |
| SEO | H1 1개, 운영 canonical, review noindex 확인 | 실제 DOM + 자동 테스트; Preview OG는 별도 배포 검증 대상 |
| 콘솔 | 검사한 일반 홈페이지 로그에서 사이트 소스의 JS 예외는 관측하지 못함 | 브라우저 확장 content script의 metadata 오류는 존재; ‘콘솔 전체 오류 0’ 주장하지 않음 |

## 검수에서 수정한 문제

1. 공통 footer의 기존 `max-width:36px`가 새 가로 로고를 누르고 있었습니다. R4.2 로고에 `max-width:none`을 적용했고 390px 검수에서 160×36px 비율을 확인했습니다.
2. 상위 `:root`에서 계산된 `--accent`가 갈색 값으로 상속되어 hover와 일부 설명 숫자에 남았습니다. `.home-r42`에서 `--accent`와 `--green`을 새 토큰에 다시 연결했습니다.
3. 사진 전환 때 음식 `srcset` 후보가 외관 사진을 덮지 않도록 먼저 제거하고 새 상태에 맞게 설정합니다. 이 경로는 자동 회귀 테스트에도 포함했습니다.
4. review의 사진 실패 fixture가 이전 마사지 파일명을 찾고 있어 새 음식 이미지 ID를 대상으로 수정했습니다.

## 성능: 원시 관측과 판단 한계

원시 기록은 보정하거나 좋은 값만 골라내지 않았습니다.

- 최상위 페이지 한 회의 `rawClsSessionMax`는 **0.001**입니다. 이 회차의 FCP/LCP/event timing은 **NOT OBSERVED**입니다. `browser/top-level-lab-raw.json`에 원시 기록을 보존했습니다.
- iframe 초기 회차에 raw CLS **0.269, 0.261**이 관측됐고, 이후 폭별 회차에는 0, 여러 장면/안내를 여는 회차에는 최대 0.031이 기록됐습니다. 초기 원시 기록에는 스타일·글꼴 적용 전후의 이동이 포함돼 있습니다. 이를 삭제하거나 일괄 통과로 계산하지 않습니다.
- iframe LCP는 일부 회차 NOT OBSERVED이며, 일부는 984–11,588ms입니다. 상위 검수 UI로 장면을 이동할 때 iframe 문서의 큰 콘텐츠가 늦게 노출될 수 있으므로 이를 실제 첫 방문 LCP 점수로 사용하지 않습니다.
- 가장 긴 event timing에는 도구/브라우저 환경과 검수 입력의 영향이 섞여 있습니다. 이를 필드 INP나 현장 지연으로 확정하지 않습니다.
- 새 음식은 640/1254 responsive WebP, lazy loading, 명시적 크기를 사용합니다. 로고는 로컬 SVG이며 새 런타임 외부 의존성을 추가하지 않았습니다. 실제 파일 크기는 `ASSET_BUDGET.json`에 기록합니다.

**이 제출에서 Core Web Vitals 전체 통과, Lighthouse 점수, 물리 모바일, 네이티브 스크린리더 통과를 주장하지 않습니다.** 그 항목은 운영 승인 전 별도 환경에서 확인할 수 있도록 남겼습니다. 이번 검수의 확정 결과는 화면·상태 전환·가로 넘침·정적 fallback·소스/링크 검증입니다.

## 자동 검증

`npm run verify` 성공: **88 passed / 0 failed / 0 skipped**. HTML 35개, 로컬 참조 1,071개, 로컬 결함 0건. 외부 URL 20개는 이 링크 검사기가 HTTP 검사하지 않았습니다. review build에서 회사·개인정보 운영 승인 조건 22개가 미확정으로 남아 있으며 기존 release gate를 유지합니다. 전체 로그는 `verify.txt`입니다.

실제 Draft PR/Netlify 배포 식별자와 최종 HEAD의 관계는 PR 본문 및 별도 배포 증빙에 기록합니다.
