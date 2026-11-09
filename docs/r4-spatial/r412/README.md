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


## 진행 기록 · 2026-11-09, 통합 Draft 검토

- Netlify PR #26 최초 Deploy Preview `6af1d3b088a288b7cf1161ab` **ready**, 소스 HEAD `3f45ec8f13ddc3a95cac2f7002c84e789985f835`. [미리보기](https://deploy-preview-26--weplace.netlify.app/#first-look). 이후 수정 HEAD의 Deploy 상태는 매번 다시 확인해야 함.
- GitHub 소스 기반 17개 정적 점검 항목(히어로/실매출 별도/4라운드/섹션 순서/이미지/JS 로드/챗·CRM 경계/개인정보 게이트/모바일·감소 모션/문법) **17/17 확인**. 이 수치는 사용자가 로컬에서 `npm run verify`를 실행한 결과와 다름.
- 별도 V8 DOM 모형에서 버튼 이벤트를 실행해 R1 A 선택 → R2 설명 보기 건너뛰기 → R3 B 선택 → R4 A 선택 → 결과 점검 3개 표시 → 처음부터 다시 시작이 흐름상 작동하는 것을 확인했습니다. **실제 모바일 사파리·브라우저 화면 자동화, 네트워크 이벤트 및 접근성 수동 QA를 했다는 뜻은 아닙니다.**
- 공개 빌드의 22개 회사·개인정보 승인 게이트는 여전히 미충족. 기존 main과 운영 배포는 미변경. 사용자의 런칭 요청은 통합 제작 범위를 승인한 것으로 해석하되, 증빙되지 않은 개인정보 처리 현황·사업자 정보·사용권까지 승인한 것으로 보지 않습니다.


## 고화질 사진 선택 사항 (R4.12 원본 9장)

정적 홈페이지는 별도 Next.js 앱의 인증/서버 코드를 가져오지 않습니다. 대신 다음 위치에 원래 AI 이미지의 WebP 파일이 존재하면 브라우저가 성공적으로 이미지를 로드한 라운드만 자동 교체합니다. 없으면 SVG가 그대로 보입니다.

`assets/first-look/photos/recognize-a.webp`, `recognize-b.webp`, `recognize-duo.webp`, `warmth-a.webp`, `warmth-b.webp`, `sheen-a.webp`, `sheen-b.webp`, `plate-a.webp`, `plate-b.webp`.

사용자 PC에는 별도 `weplace-firstlook-r412-review/public/campaign/choices` 경로에 9장 설치 및 WebP 검사가 완료됐습니다. **원본의 바이트를 이 GitHub Draft로 전송하지는 않았습니다.** 아래 작업은 해당 PC에서 실행하는 무손상 복사이며 기존 파일이 다르면 안전하게 중단합니다.

```powershell
# 이 명령은 Weplace 메인 저장소의 R4.12 브랜치 폴더에서만 실행
node scripts/install-r412-firstlook-photos.mjs
node --test tests/r412-unified-homepage.test.cjs
npm run verify
git status --short
```

`install-r412-firstlook-photos.mjs`는 사진을 복사하고 SHA-256 동일 여부만 확인합니다. Git commit/Push, 운영 배포, GA4 또는 환경변수 변경은 하지 않습니다. 실제 사진을 GitHub Draft PR에 커밋·Push한 후 Netlify Preview에서 네 라운드의 이미지 로딩과 320/390/1440px 레이아웃을 재검증합니다.

- R2 `warmth-a/b` 파일은 동일한 사진 바이트입니다. A의 김은 CSS 합성.
- R3 `sheen-a/b` 파일도 동일합니다. A/B의 윤기 차이는 CSS 밝기·반사 표현.
- R4의 사진은 접시와 음식 구성 모두 일부 다르므로 접시만의 인과 효과라고 해석하지 않습니다.
- 방문자의 선택 데이터는 이 정적 메인 구현에서 **수집하거나 서버 전송하지 않습니다**. GA4 소스·캠페인 구분을 분석하는 작업은 별도 동의/계측 검수 범위입니다.


## SEO 공개 조건

R4.11 원본의 루트 `index.html`에는 `<meta name="robots" content="noindex,nofollow">`가 정적으로 들어 있어 운영 빌드에서도 그대로 유지될 위험이 있었습니다. R4.12에서는 루트의 해당 태그를 제거했습니다. 현재 `scripts/build-site.mjs`가 **검토 환경(`!production`)에만** `noindex, nofollow` HTML 메타와 `X-Robots-Tag`를 추가합니다. Netlify Deploy Preview는 Netlify 자체의 noindex 정책도 적용됩니다. <https://docs.netlify.com/deploy/deploy-overview/#search-engine-indexing>

이는 법률 승인 게이트를 우회하지 않습니다. `CONTEXT=production`에서 기존 사업자/개인정보 검증을 통과해야만 게시할 수 있습니다. 하위 경로의 별도 robots 규칙과 전체 sitemap QA는 최종 공개 전 추가 확인 사항입니다.
