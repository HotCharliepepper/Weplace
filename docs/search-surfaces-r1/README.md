# WEPLACE / Search surfaces × owned website R1
기록: 2026-11-19. 상태: Draft Preview 전용. 원본 main과 운영 R8을 직접 수정하지 않음.

## 작업 이유
현재 홈페이지 H1은 웰니스 B의 네이버 플레이스 상세 유입 +168%라는 특정 사례를 전면에 보여준다. 이는 관측 지표를 강하게 알리지만, Google 검색·지도, 홈페이지 직접 제작, AI 검색을 위한 정보 정리 역량은 본문 속 짧은 ‘네이버·구글·홈페이지’ 항목에 묻혀 있다. **하나의 관측 수치를 서비스 전체 범위라고 오해하지 않게** 체험형 섹션으로 보완한다.

## 입력 기준
- 실제 현재 운영 코드 `HotCharliepepper/Weplace` main의 `index.html`, `november-fast-a-r8.html`. +168%와 4개년 매출 원값, R8 문의/GA4 동의 구조를 보존한다.
- 사용자가 업로드한 `Natural_Korean_Limbic_R1_20261117(2).zip`의 `00_START_HERE.md`, 스킬 `SKILL.md`, `knowledge/00_CORE_PRINCIPLES.md`, `knowledge/02_STATUS_AND_CLAIMS.md`, `knowledge/03_LEXICON.md`, `manual/03_NATURAL_KOREAN_COPY_LAB.md` 및 `manual/06_ETHICAL_LIMBIC_REVIEW.md`.
- 역할: 기존 문구 일부는 **NATURALIZE**(의미·수치 보존); 신규 플랫폼/홈페이지 체험은 **LIMBIC_COMPOSE**(가상 시안 분리); 사실·오류·선택 점검은 **AUDIT**.

## 문장 검수: 원문 → 이번 Draft 수정
| 기존 | 수정 | 판단 |
|---|---|---|
| ‘사진부터 예약 안내까지’ (메인 SEO title) | ‘플레이스·구글·홈페이지 제작’ | 범위를 검색어로 구체화; 브랜드 슬로건 유지 |
| ‘흩어진 정보를 연결하는 실행 파트너’ | ‘네이버 플레이스 · Google 검색·지도 / 필요한 매장 홈페이지까지 직접 만듭니다’ | 관념어를 수행 범위로 바꿈 |
| ‘검색 정보 · 홈페이지 · 안내’ | ‘네이버 · 구글 · 홈페이지 · FAQ’ | 실제 화면에서 확인할 대상 제시 |
| ‘바꾸는 일’ (SERVICE 카드 제목) | ‘검색부터 홈페이지까지’ | 서비스를 네이버 대행에 한정하지 않음 |
| ‘어떤 사진을 먼저 보고, 어디에서 다음 행동을 찾을지’ | ‘검색에 나오는 매장 정보와 / 홈페이지에서 찾아야 할 답까지’ | 실제 경로 설명으로 치환 |
| ‘광고를 얼마나 집행하는지만 비교하기보다…’ (R8 설명) | ‘사진·길·예약을 본 손님은 검색창이나 홈페이지에서 한 번 더 확인할 수 있습니다…’ | 단정 대신 가능한 행동으로 수정 |

## 장면 흐름
- Main: 웰니스 B +168% H1 / 음식점 A 별도 매출 차트 → 4채널 인터랙티브 UI → 루위 사진 비교 → 사진·길·예약 선택 → 과정·FLOW → 문의.
- November FAST: 반발형 메시지 → FAST → 두 수치 차트 → 루위 → 가상 매장 사진·길·예약 비교 → 짧은 4채널 연결 CTA → 선택형 문의 → 본 홈페이지.
- 채널 탭(내용이 실제 변함): 네이버 플레이스 / Google 검색·지도 / **직접 제작한 홈페이지(초기 선택)** / AI 검색이 참고할 수 있는 FAQ·본문 정보. 키보드 좌우·상하 화살표, Home/End 조작 및 no-JS 안내.
- `/examples/moon-site/`: Weplace가 직접 작성한 **실제로 작동하는 정적 HTML 샘플**. 가상 매장 모온, 기존 참고 음식·공간 사진, 사진→입구 안내→FAQ→본문 내 이동. 실제 고객 성과·운영 매장이 아니며 noindex 처리. 예약·결제는 하지 않음.

## 상태와 금지 주장
- `SOURCE_STATED`: 웰니스 B의 기존 월별 상세 유입, 음식점 A의 기존 POS 제공값. 새 콘텐츠는 이를 변경하지 않음. 고객 원본·공개 권한의 독립 검증은 이전 작업 상태를 그대로 따름.
- `ILLUSTRATIVE`: 네 가지 채널 목업, 가상 홈페이지 ‘모온’. Google·네이버의 실제 결과 캡처가 아님.
- `NEED_VERIFY`: 고객사 사진 외부 공개 권한, 실제 프로필 편집 권한과 심사 상태, AI 검색 기능 노출·인용 여부.
- “AI 검색 1위 보장”, “AI 답변에 무조건 인용”, “구조화 데이터만으로 상위노출”, “매출 증가를 만든 사진 교체” 등 미근거 주장을 금지.
- Google Search Central은 AI Overviews/AI Mode에 특수한 요건이 없고 기존 검색 기준(크롤링 허용, 사람이 볼 수 있는 텍스트, 내부 링크, 보이는 내용과 일치하는 구조화 데이터)이 중요하다고 설명한다. 참고: https://developers.google.com/search/docs/appearance/ai-features
- 네이버 Search Advisor 또한 읽을 수 있는 HTML과 robots/sitemap/내부 링크 등 기본 수집 조건을 설명한다. 참고: https://searchadvisor.naver.com/guide/report-seo

## QA / 배포
- `qa/search-surfaces-r1.py`와 GitHub Actions가 320·360·390·768·1440px에서 네 채널 전환·키보드·가상 웹사이트 네비게이션·FAQ·기존 차트와 설문·동의·내부 링크, no-JS, 가로 넘침 및 JS/404를 확인한다.
- 이 Draft는 코드와 카피 검토본이며 자동 운영 배포·외부 발송·Google/Naver 프로필 변경은 없음. 실제 사례·수치 출처 상태는 구분하여 별도 검토.

## R1.1 — 2026-11-19, user-approved follow-up
1. **SITE tab destination**: Primary call-to-action now opens https://mashcore.co.kr/ in a separate browser tab, clearly labeled **Mashcore (separate brand/site)**. Weplace-owned *fictional* Moon HTML demo remains as the secondary link, preserving the distinction between a working demo and Mashcore's unrelated brand identity. Target website could not be tested for external availability from the current tool environment; the href and safe external link behavior are QA-tested.
2. **Restaurant A marketing-start marker**: User states Weplace marketing began **May 2026**. This is flagged as a **user-provided timeline**, not independently verified via a customer contract or invoices, and is **not evidence of causal attribution** of the June sales increase. Render a small dashed May marker only when **2026** is selected, and change the accessible text when viewing historical years.
3. **Prior May→June declines**: 2023 **−10.6%**, 2024 **−1.0%**, 2025 **−15.8%**, all against 2026 **+12.2%**. Prior-year selector controls and table cells are visually emphasized with subdued warning tones while 2026 is distinct. Same restaurant, different years; shifts in pricing, market conditions and seasonality remain uncontrolled.
4. **Home first fold**: “같은 화면이 아닌, 서로 다른 두 기록.” → **“말보다, 숫자.”**. Its two supporting tiles continue to disclose **different businesses and metrics**; +168% for Wellness B does not combine with Restaurant A's +21 million KRW.
5. **Deployment boundary**: This change is staged on Draft PR #70. Production release requires QA and the user's request to apply is recorded in this conversation. The existing public client data/image rights and GA4 realtime-ingestion verification limitations are unchanged.
