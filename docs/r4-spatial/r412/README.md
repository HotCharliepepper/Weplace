# WEPLACE R4.12 — Unified First Look × Green Momentum × Evidence Charts
작성: 2026-11-09 · 검토용 통합 작업

## 기준과 범위

- **원본:** `HotCharliepepper/Weplace` Draft PR #25 HEAD `327cc6b13b75cbb239d7f8c574044b52dbd2ebc8`. 이 브랜치는 PR #24 R4.10의 딥그린/금색 상승 곡선과 기존 수치 시각화를 모두 계승합니다.
- **참조:** `HotCharliepepper/weplace-invite` Draft PR #2 First Look R4.12의 네 장면 인지 실험과 개인의 고정 성향을 단정하지 않는 결과 안내.
- **이번 통합:** `withweplace.kr` 메인에 고객이 직접 조작할 수 있는 **4라운드 First Look**을 추가하고 기존의 녹색 상승 경로, 실제 월매출 차트, 루위 사진 비교, 결정 경로, FLOW, 첫 진단을 하나의 스크롤 흐름으로 잇습니다.
- **광고용 `invite.withweplace.kr`는 별도 Next.js 앱으로 보존**합니다. 코드/로그인/세션/DB를 합치거나 iframe으로 끼워 넣지 않습니다. 두 앱은 동일한 W 파비콘의 시각 언어와 네 라운드의 의미만 공유합니다.
- **원본 및 운영 배포 보존:** 이 작업은 별도 Draft 브랜치. main, 운영 `withweplace.kr`, FLOW/CRM/인증/DB는 수정하지 않습니다.

## 방문자의 실제 흐름

1. **Hero / 의미의 변화:** 딥그린, 접힌 W, 금색 우상향 경로. 실제 매출 값이 아니라 고객이 선택으로 이동하는 과정을 상징합니다. 기존 H1/진단 CTA는 유지합니다. 히어로 아래 '사진 네 장면부터 골라보기'와 메뉴에서 새 섹션으로 접근할 수 있습니다.
2. **Evidence / 관측 데이터:** 음식점 A 2026.05 `1.72억` → 06 `1.93억`, `+2,100만 원`, 약 `+12.2%`는 관측 월매출 비교입니다. 사진 변경이나 특정 작업의 매출 기여를 분리해 증명한 결과가 아닙니다. 기존 그래프/출처/진단 범위를 변경하지 않았습니다.
3. **First Look / 실제 상호작용:** 고추/오크라 구분 → 연기·온도감 → 윤기 → 접시와 여백. A/B 선택 또는 건너뛰기, 선택 뒤 설명, 네 단계 완료 후 **이번에 고른 표현을 바탕으로 한 매장 첫 사진 점검** 세 항목을 제안합니다. 성격 유형 분류·매출 예측·개인식별·계정 연동은 없습니다.
4. **변화의 실제 맥락:** 루위 기존 사진/베이징덕 선택 비교와 정보의 순서 `#changes`; 기존 원본 사진과 680ms 시네마틱 공개, 오류·모션 감소 안내는 원래 컨트롤러가 관리합니다.
5. **방문 판단:** `#decision-path`의 발견→비교→판단→방문과 검색/채널 기준을 유지합니다.
6. **실행과 기록:** `#flow` 및 고객사 관리 경로, `#request`의 0원/매장 1곳/채널 1개/개선안 1개 진단 내용을 유지합니다.

## 구현 파일과 소유권

| 경로 | 역할 |
|---|---|
| `index.html` | 헤더/히어로의 First Look 입구, 메인 섹션, JS/CSS 연결 |
| `assets/first-look/okra-pepper.svg` | 정답을 선택 전 노출하지 않는 초록 식재료 원본 그림 |
| `assets/first-look/sensory-dish.svg` | 동일 요리를 기반으로 김·빛 반사·접시 표현을 비교하는 그래픽 |
| `assets/css/first-look-bridge-r412.css` | 크림·딥그린·세이지·골드, 320px 모바일과 키보드 포커스 및 모션 감소 |
| `assets/js/first-look-bridge-r412.js` | 독립적인 4회 선택 로직. 네트워크, 스토리지, GA4 이벤트 추가 없음 |
| `tests/r412-unified-homepage.test.cjs` | 상징 상승선·별도 실제 차트·CTA·privacy release gate 회귀 검사 |

`scripts/build-site.mjs`가 이미 `assets/` 트리를 통째로 `dist/`에 복사하므로 인증/DB/Netlify 빌드 설정 변경은 없습니다. JavaScript가 비활성화돼도 그림과 첫 화면 진단 링크가 표시됩니다.

## 실사 이미지 범위

이 통합 브랜치의 First Look 부분은 **안전한 SVG 시각 시뮬레이션**을 사용하며 실제 음식 사진 촬영본처럼 표현하지 않습니다. 고화질 AI WebP 9장은 사용자의 로컬 `weplace-firstlook-r412-review` 저장소에 설치·검증됐지만, **GitHub `Weplace` 또는 `weplace-invite` Draft에 바이너리 반영됐다고 주장하지 않습니다.** 별도 작업을 통해 `assets/first-look/`에 일관된 A/B 원본 사진을 올리고, 촬영/AI 자료 고지·권리·플레이팅 통제 정도를 검토한 다음 실사로 교체할 수 있습니다. 기존 R4.11 루위 사진은 그대로 유지합니다.

## 공개 게이트 (우회 금지)

최신 `config/company-info.json`은 `publicationState: review`, `releaseApproved: false`, `config/privacy-release.json`은 `publicationState: draft`, `releaseApproved: false`입니다. `scripts/build-site.mjs`는 `CONTEXT=production`에 22개 회사/개인정보와 정책 승인 항목이 남았으면 의도적으로 빌드를 중단합니다. **단순한 '런칭' 요청으로 사업자등록증 대조·개인정보 고지·약관·고객 제공 사진의 사용권 검증까지 완료된 것으로 간주할 수 없으며 해당 설정을 수정해서는 안 됩니다.**

회사의 실제 원본 증빙과 승인된 개인정보 처리방침을 반영하고 `npm run verify`, 페이지·모바일 QA, 접근성, 고객 동의·진단 경로의 정확성을 검증한 후에만 운영 빌드/배포를 진행해야 합니다. Netlify Preview 성공은 운영 승인과 별개입니다.

## QA 순서

```powershell
cd $HOME\weplace-r49-review
git fetch origin
git checkout draft/weplace-r412-unified-launch-20261109
npm ci
npm run verify
node --test tests/r412-unified-homepage.test.cjs
```

검수: 1440/1024/768/390/320px, 처음/다음/건너뛰기/결과/다시 시작, 헤더/히어로 진단 이동, `#changes` 실제 사진 탭, `#decision-path`, `#flow`, `#request`, reduced motion, disabled JS, 접힌 메뉴, 초점 이동. 실제 기기 Safari/카카오 인앱 및 GA4 실측은 별도 확인. **본 문서는 브라우저 수동 QA를 실행했다고 주장하지 않습니다.**

## 롤백

PR 병합 전: 이 Draft 브랜치를 폐기하고 PR #25 그대로 사용합니다. 운영 승인이 난 뒤에도 `main`의 이전 배포 Netlify snapshot을 롤백 대상 기록으로 보존하고, 고객 계정·DB에는 접근하지 않습니다.
