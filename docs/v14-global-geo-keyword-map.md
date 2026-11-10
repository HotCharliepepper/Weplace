# v1.4 글로벌 GEO — 두 시장의 검색 의도와 페이지 설계

검토일: 2026-10-19 KST. 상태: **서비스·키워드·운영 범위 검토안**. 공식 기술 지침은 아래 1차 문서를 열어 확인했다. 검색어는 실제 계정 자료나 검색량 도구로 측정하지 않은 **HYPOTHESIS 씨앗**이다. 문장이 자연스럽다는 판단과 그 문장으로 실제 고객이 검색한다는 증거를 구분한다.

## 1. 먼저 나누는 두 사업

| 항목 | A — 한국 매장의 외국인 손님 유치 | B — 해외 매장의 한국인 손님 유치 |
|---|---|---|
| 서비스를 구매할 사람 | 한국에서 매장을 운영하는 대표·마케팅/예약 담당자 | 해외에서 매장을 운영하는 현지 대표·마케팅/예약 담당자. 한국어 사용자와 영어 사용자를 별도 검증 |
| 도움을 받는 매장 위치 | 대한민국. 구체 지역은 매장별 확인 | 해외. 국가·도시별 운영 가능 여부는 미확정 |
| 매장을 고르는 손님 | 한국 여행을 준비하거나 한국에 체류하는 외국인 | 해외 여행·출장을 준비하거나 현지에 있는 한국어 사용자 |
| 우선 확인할 문제 | 외국어 검색 뒤 메뉴·가격·위치·이용 조건·예약 방법을 이해하는가 | 한국어 검색 뒤 현지의 위치·가격·예약·준비 사항을 실제로 이용할 수 있는가 |
| 검토할 채널 | 매장 소유 홈페이지, 해당 국가/언어의 Google 검색·지도, 실제 운영 중인 예약 경로 | 한국어 검색 콘텐츠, 현지 매장의 홈페이지·지도·공식 예약 경로. 해외 업소의 네이버 플레이스 등록 가능성을 전제하지 않음 |
| 언어 구분 | Weplace 안내 페이지 ko/en과 고객 매장의 영어 메뉴·직원 영어 응대는 별개 | Weplace 안내 페이지 ko/en과 현지 직원 한국어 응대·통역·현지 언어 지원은 별개 |
| 최초 대화에서 정할 것 | 제공 자료·번역 검수자·가격/메뉴 갱신 담당자·예약 응대 언어와 시간 | 대상 국가·사업자/계약 주체·현지 운영 기준·한국어 자료 검수자·시간대·예약 응대 언어 |
| 이번 Preview의 의미 | 필요한 작업을 설명하는 시범. 외국어 상담/예약 대행의 즉시 제공 약속 아님 | 필요한 작업을 설명하는 시범. 해외 사무실·모든 국가 지원·현지 규제 검토 완료 의미 아님 |

양쪽 모두 **Weplace 서비스 구매 페이지(B2B)**와 **매장 방문·예약 페이지(B2C)**를 분리한다. 여행객에게 Weplace 미팅 페이지를 매장 예약 버튼처럼 보여주지 않는다. B2C 예시는 실제 매장 자료·권한을 받은 뒤 해당 매장 페이지에서 구현할 주제이며, 지금 Weplace 고객 사례로 게시할 자료가 아니다.

## 2. 우선순위의 의미

- **P1 — 구매 검토:** ‘제작·대행·업체·agency·service’와 매장/시장 조건이 함께 있어 외주 작업을 찾을 가능성이 비교적 명료한 문구. 실측 전환율이 높다는 뜻은 아니다.
- **P2 — 문제 탐색:** ‘유치 방법·마케팅·how to’처럼 정보 수집과 구매 검토가 섞인다. 작업 범위·예시·상담 전 확인사항으로 연결할 수 있는지 확인한다.
- **P3 — 매장 고객 질문:** Weplace를 구매할 검색어가 아니라 고객 매장 콘텐츠의 재료. 실제 장소·서비스 조건과 일치할 때만 사용한다.
- **보류:** 위치/언어/법적 서비스 범위가 미확정이거나 검색 주체가 너무 넓은 표현. 길게 쓰면 자동으로 좋은 검색어가 되는 것은 아니다.

아래 모든 행의 **검색량·경쟁 난도·순위·CPC·전환율은 미조사**다. P1/P2/P3은 편집·검증 순서이며 수요 크기나 성과 등급이 아니다. 국가·도시는 맥락을 보여주는 예시이고 영업 지역·계약처·성과를 의미하지 않는다.

## 3. 랜딩 코드와 URL 설계

| 코드 | 대상·언어 | 제안 URL | 반드시 답할 것 | 다음 행동 |
|---|---|---|---|---|
| AK | 한국 매장 구매자·ko | `/global/international-visitors-korea/` | 누구를 위한 일인지, 메뉴/지도/예약 중 무엇을 확인하는지, 운영 조건·지원 범위가 미확정인 부분 | 필요한 작업 범위 확인 |
| AE | 같은 서비스 구매자·en | `/en/global/international-visitors-korea/` | Who owns the business, what visitors need to check, what materials and booking process must be confirmed | Review the scope before discussing work |
| BK | 해외 매장 구매자·ko | `/global/korean-visitors-overseas/` | 현지 업주가 준비할 자료, 한국어로 설명할 예약·가격·이용 기준, 국가별 수행 가능 범위 | 국가와 작업 범위 확인 |
| BE | 같은 서비스 구매자·en | `/en/global/korean-visitors-overseas/` | What Korean-speaking visitors need to know, who maintains local facts, scope and language support to confirm | Discuss the market and materials |
| GK/GE | 두 서비스 안내 | `/global/` · `/en/global/` | 매장 위치와 손님의 이동 방향으로 A/B 선택 | 해당 시장 페이지로 이동 |
| AC/BC | 실제 매장 고객·언어별 | 해당 매장 소유 도메인의 검증된 언어별 안내/예약 URL — 아직 미정 | 실제 메뉴·가격·위치·예약 조건·직원 응대 언어 | 그 매장의 실제 예약·문의 |

URL은 마스터 명세 기반의 설계 매핑이다. 실제 구현/Preview 링크는 이번 릴리스의 PR·테스트 기록을 우선한다. PR #5의 `/en/`과 공유 파일을 diff로 비교하고 미확정 가격을 가져오지 않는다.

## 4. A — 한국 매장 → 외국인 손님

### A1. 한국어 B2B 구매 검색어

| ID | 씨앗 검색어 | 의도·우선순위와 판단 | 랜딩 | 답할 내용·필요 증거 |
|---|---|---|---|---|
| A-K-B1 | 외국인 고객 대상 식당 홈페이지 제작 | 제작물을 찾는 구매 검토 · P1. ‘식당’을 넣어 일반 관광 홍보와 구분 | AK | 제작 범위, 메뉴/가격/예약 안내 예시, 실제 지원 언어와 수정 기준 승인 |
| A-K-B2 | 구글 비즈니스 프로필 관리 대행 외국인 고객 | 업체 검토 가능 · P1. 지도 등록만 원하는지 지속 관리를 원하는지 재확인 | AK | 계정 소유·관리 권한, 실제 점포 자격, 변경 승인 과정. 순위 보장 없음 |
| A-K-B3 | 호텔 영어 예약 안내 페이지 제작 | 납품 대상이 명료 · P1. 예약 시스템 개발인지 기존 예약의 안내인지 구분 필요 | AK | 객실/요금/취소의 원본, 현재 예약 도구, 개발·안내 작업의 경계 |
| A-K-B4 | 외국인 손님 유치 방법 | 정보 탐색 우세 · P2. 외주 계약 의도가 확인되지 않은 넓은 문구 | AK | 검색→확인→예약의 누락 항목 예시와 자가점검. 구매 의도라고 단정하지 않음 |

### A2. 영어 B2B 구매 검색어

| ID | Seed query | Intent / priority | Landing | Evidence and answer |
|---|---|---|---|---|
| A-E-B1 | English website design for restaurants in Korea | Deliverable-led buying investigation · P1. Reader may be an English-speaking owner or marketing manager | AE | What pages and source materials are included; whether translation review is available; no promise of booking software |
| A-E-B2 | Google Business Profile management service Korea | Service-provider investigation · P1. Broad industry scope must be narrowed on the page | AE | Owner authorization, eligible locations, update process, scope; no ranking guarantee |
| A-E-B3 | multilingual booking information website for Korean hotels | Narrow deliverable hypothesis · P1 for validation, not a proven high-volume phrase | AE | Clear difference between a booking information page and a live reservation/payment platform |
| A-E-B4 | how to attract international visitors to a restaurant in Korea | Problem research · P2. “How to” can mean DIY learning rather than hiring | AE | A practical information checklist, sample visitor questions, scope discussion only if relevant |

### A3. 매장 방문자의 B2C 질문 — ko/en 별도

| ID·언어 | 씨앗 검색어/질문 | 방문 상황·우선순위 | 랜딩 | 실제 게시 전 확인할 사실 |
|---|---|---|---|---|
| A-K-C1 · ko | 서울 영어 메뉴 있는 식당 주차 | 외국인 동행을 돕는 한국어 사용자라는 가설 · P3. 외국인 본인의 주요 검색어로 간주하지 않음 | AC | 영어 메뉴의 최신본, 주차 위치/지원 조건. 영어 메뉴≠영어 응대 |
| A-K-C2 · ko | 성수 외국인 친구와 갈 카페 메뉴 가격 | 동행 장소 탐색 · P3. ‘외국인에게 인기’ 등 집단 선호 주장으로 확대하지 않음 | AC | 실제 메뉴·가격·자리 사진·이용 시간 |
| A-K-C3 · ko | 사천 호텔 늦은 체크인 주차 | 도착 전 실무 질문 · P3. 국내 고객과 의도가 겹치며 외국인 전용 수요 증거 아님 | AC | 해당 날짜 체크인 마감/늦은 도착 절차·차량 조건 |
| A-K-C4 · ko | 서울 미용실 영어 상담 가능 예약 | 언어 지원 확인 · P3, 실제 지원 전에는 보류 | AC | 가능한 서비스·담당자·언어·시간대, 예약 전달 방식 |
| A-E-C1 · en | private dining in Seoul for 8 people parking | Group meal selection · P3. The group size is a search scenario, not verified capacity | AC | Seating limits, room conditions, menu, parking and reservation policy |
| A-E-C2 · en | cafe in Seongsu English menu prices | Menu and visit planning · P3 | AC | Current menu and prices; actual seating; English menu availability |
| A-E-C3 · en | Sacheon hotel late check-in parking | Arrival planning · P3 | AC | Late-arrival policy, contact route and parking access; no implied 24-hour check-in |
| A-E-C4 · en | hair salon Seoul English consultation prices | Service and language suitability · P3 / hold until verified | AC | Actual consultation language, eligible services, inclusions and price basis |

## 5. B — 해외 매장 → 한국인 손님

### B1. 한국어 B2B 구매 검색어

| ID | 씨앗 검색어 | 의도·우선순위와 판단 | 랜딩 | 답할 내용·필요 증거 |
|---|---|---|---|---|
| B-K-B1 | 해외 식당 한국어 홈페이지 제작 | 해외 업주/대리인의 제작 검토 · P1 | BK | 운영 국가, 계약 주체, 현지 자료 원본·한국어 검수·수정 범위 |
| B-K-B2 | 해외 호텔 한국어 예약 안내 페이지 제작 | 납품 목적 구체 · P1. 예약 대행·실시간 재고 개발과 구분 | BK | 객실별 정보, 현지 통화/세금/취소, 기존 예약 경로·응대 언어 |
| B-K-B3 | 일본 식당 한국인 관광객 마케팅 대행 | 대행사 비교 가능 · P1 검증 후보. 일본 영업 가능 사실은 미확정 | BK | 대상 도시·업종·채널·현지 사업 조건과 실제 수행 인력 승인 |
| B-K-B4 | 해외 매장 한국인 손님 늘리는 방법 | 정보 탐색 · P2. 구매자와 여행정보 작성자를 구분해야 함 | BK | 출발 전 검색 질문과 현지 예약 문제, 실무 점검 예시 |

### B2. 영어 B2B 구매 검색어

| ID | Seed query | Intent / priority | Landing | Evidence and answer |
|---|---|---|---|---|
| B-E-B1 | Korean-language website service for restaurants in Japan | Provider search for a concrete deliverable · P1 validation candidate | BE | Local facts, Korean editorial review, country scope, ownership and maintenance |
| B-E-B2 | Korean-language booking information page for hotels | Deliverable investigation · P1. “Booking page” may imply transactions: clarify the distinction | BE | Existing reservation system, currency/tax/cancellation rules and what the page actually does |
| B-E-B3 | marketing agency for reaching Korean tourists in Thailand | Agency comparison · P1 candidate; country execution capability not established | BE | Region-specific scope, channels and staffing, verified terms; no implied local office |
| B-E-B4 | how to attract Korean travelers to a local business | Broad business information search · P2 | BE | Korean visitor questions, translated facts vs. Korean-speaking staff, actionable scope checklist |

### B3. 매장 방문자의 B2C 질문 — ko/en 별도

| ID·언어 | 씨앗 검색어/질문 | 방문 상황·우선순위 | 랜딩 | 실제 게시 전 확인할 사실 |
|---|---|---|---|---|
| B-K-C1 · ko | 오사카 식당 한국어 메뉴 예약 방법 | 여행 전 메뉴·예약 확인 · P3 | BC | 한국어 메뉴 존재·예약 방법·취소 조건·주소. 추천 순위나 ‘한국인 인기’ 주장 없음 |
| B-K-C2 · ko | 방콕 마사지 가격 예약 준비사항 | 가격·현장 이용 확인 · P3 | BC | 현지 합법적 서비스 범위, 시간/포함 사항/추가 비용, 준비·변경 기준 |
| B-K-C3 · ko | 도쿄 미용실 한국어 상담 가능한가요 | 서비스·상담 언어 확인 · P3, 실제 지원 전에는 보류 | BC | 담당자별 가능 언어·예약일·서비스 범위·요금 기준 |
| B-K-C4 · ko | 방콕 호텔 공항 늦은 도착 체크인 | 이동과 도착 계획 · P3 | BC | 실제 체크인 마감/절차·현지 연락처·이동 안내. 공항 픽업을 임의로 추가하지 않음 |
| B-E-C1 · en | Osaka restaurant Korean menu how to book | Bilingual traveler or companion hypothesis · P3 secondary. English is not the primary Korean traveler path by assumption | BC | Verified Korean menu and booking method |
| B-E-C2 · en | Bangkok massage Korean booking instructions prices | Bilingual search hypothesis · P3 secondary / validate actual query data first | BC | Current prices, scope and real booking instructions; translation does not imply staff language |
| B-E-C3 · en | Tokyo hair salon Korean-speaking stylist appointment | Staff-language requirement · P3 / hold | BC | A real Korean-speaking stylist and appointment availability; no invented staff capability |
| B-E-C4 · en | Bangkok hotel late arrival check-in Korean instructions | Arrival-information hypothesis · P3 secondary | BC | Real late-arrival policy and Korean instructions. English query alone does not establish nationality |

**의도상 제외:** ‘한국 맛집’, ‘일본 여행’, ‘외국인’, ‘Korea marketing’, ‘Korean marketing’만으로는 구매자/매장 위치/필요 작업이 구분되지 않는다. ‘Korean marketing’은 한국 시장 진출을 뜻할 수도 있어 해외 매장의 한국인 관광객 유치와 같지 않다. ‘번역’, ‘English menu translation’만 찾는 사람에게는 번역 납품 의도일 수 있다. 번역 서비스 범위가 승인되기 전 핵심 구매 랜딩으로 확장하지 않는다.

## 6. 공식 지침 재확인과 이번 설계의 연결

아래는 공식 지침의 요약이며 서비스 성과의 증거가 아니다. 실제 지침 확인과 이 프로젝트에 대한 적용 판단을 별도 열로 나눴다.

| 확인 항목 | 공식 문서에서 확인한 내용 | 프로젝트 적용 판단 | 1차 출처 |
|---|---|---|---|
| 언어별 URL | 언어마다 독립 URL을 사용하고 사용자가 언어를 선택할 수 있게 한다. 추정 언어에 따른 강제 이동은 피한다 | ko/en 정적 페이지·명시적 언어 링크. IP/위치 추적·자동 이동 추가 없음 | [Google 다국어 사이트](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) |
| hreflang | 각 언어 페이지는 자기 자신과 대응 페이지를 포함하고, 서로 돌아오는 링크가 있어야 한다. 절대 URL 사용 | AK↔AE, BK↔BE, GK↔GE의 동등한 내용끼리만 묶는다. A와 B는 번역쌍 아님. 준비되지 않은 ja/zh/th 없음 | [Google 언어별 페이지](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| canonical | 대표 페이지 자체의 canonical을 포함하고, hreflang 사용 시 같은 언어의 대표 URL을 지정한다. sitemap과 충돌하는 대표 URL 금지 | 각 언어 자기 URL을 대표로. 영문 전부를 한국어 홈으로 canonical 처리하지 않음 | [Google canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| AI 검색 | 일반 SEO 원칙이 적용되며 별도 AI 전용 기술 조건·특별 스키마는 필요하지 않다. 색인·노출은 보장되지 않는다 | 핵심 질문/답을 정적 텍스트로 제공, 사실과 구조화 데이터 일치. ‘AI 노출 보장’·새 AI 배지 없음 | [Google AI 기능](https://developers.google.com/search/docs/appearance/ai-features) |
| 제목·설명·이미지 | 페이지 주제를 나타내는 고유 제목과 요약, 이미지 설명을 권고한다 | A/B와 ko/en 각각 고유 title/description. H1은 기술 약어보다 구매자의 과제. 이미지 장식과 정보 역할 구분 | [네이버 SEO 기본](https://searchadvisor.naver.com/guide/seo-help) |
| 실제 매장 구조화 데이터 | LocalBusiness는 실제 사업장 이름·물리 주소 등 해당 장소의 정보를 표현한다. 리치 결과 노출을 보장하지 않는다 | Weplace B2B 설명에 가상의 해외 지점·고객 매장 주소를 넣지 않음. 실제 고객 사이트는 검증 자료와 승인 후 별도 설계 | [Google LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business) |
| Business Profile 자격·권한 | 원칙적으로 표시된 영업시간에 고객과 대면하는 사업이 대상이며 예외가 있다. 소유자나 승인된 대리인만 관리한다 | 해당 매장의 실제 자격·사업주 허가를 확인. 언어 랜딩을 만들었다고 Weplace 명의 해외 프로필/주소 생성 금지 | [Google 프로필 자격·소유권](https://support.google.com/business/answer/13763036?hl=en) |
| 검색 성과 데이터 | Search Console은 검색어·페이지·국가·기기 등 차원별 자료를 제공하며 집계 기준에 따라 표와 차트의 합계가 다를 수 있다 | 승인된 읽기 권한으로 실제 쿼리/랜딩 확인 후 씨앗 갱신. 검색 국가를 국적/모국어로 간주하지 않음 | [Search Console 성과 보고서](https://support.google.com/webmasters/answer/7576553?hl=en) |

기술 설계의 핵심은 검색 엔진마다 다른 사실을 쓰는 것이 아니라, 같은 실제 정보를 해당 독자가 이해하는 언어와 질문 순서로 제공하는 것이다. 이는 설계 판단이며 검색 성과가 확인되었다는 뜻은 아니다.

## 7. 다국어 기술·편집 인수 기준

| 항목 | Preview 검토 | 운영 공개 전 통과 조건 |
|---|---|---|
| `<html lang>` | ko/en 문서별 정확한 언어 | 보이는 본문·내비게이션·대체 텍스트와 일치. lang만으로 Google 언어 타깃이 완성되는 것은 아님 |
| 언어 전환 | 동등한 페이지가 실제 존재할 때만 텍스트 링크 | 탭 상태 전환과 언어 이동을 구분. 국가/IP 수집·강제 리디렉트 없음 |
| canonical/hreflang | 검토 페이지에 최종 도메인 메타를 넣는 경우 아직 운영에 없는 URL임을 기록 | 200 응답, 같은 언어의 자기 canonical, 번역쌍 양방향·자기 참조, 잘못된 A↔B 참조 없음 |
| sitemap | Preview 자체를 검색 노출 성과 검증으로 사용하지 않음 | 승인된 실제 공개 URL과 canonical 일치. Preview 전용/미공개 서비스 URL을 운영 sitemap에 섞지 않음 |
| 구조화 데이터 | 보이는 설명과 일치하는 WebPage/Organization 정도로 검토 | 미확정 가격·Offer·AggregateRating·해외 지점·지원 언어/지역·고객 실적을 사실로 추가하지 않음 |
| 검색 제어 | 기존 Preview noindex 유지 | noindex는 접근 제한이 아니므로 고객 이름·비공개 이미지/자료를 넣지 않음. 공개 여부 승인 후 제어 변경 |
| 영어 문장 | 직역 대신 영어 사용 업주의 문제·자료·다음 행동에 맞춘 편집 | 목표 국가/업종을 아는 독립적인 영어 사용자 검수 필요. 원어민 검수 완료라고 가정하지 않음 |
| CTA | ‘범위 확인/검토’ 수준, 기존 상담/미팅 안내와 연결 | 새로운 자동 수집·글로벌 관심정보 전송·결제/계약 활성화 없음. 실제 응대 가능한 언어·시간은 운영자가 확정 |
| PR #5 충돌 | `/en/`, 홈 링크, sitemap, 공유 CSS/빌드 설정을 파일별 비교 | PR #5 자동 병합/체리픽 없음. 미확정 가격·부가세/계약 가안 유입 없음 |

## 8. 키워드를 실제로 채택하는 절차

1. **서비스 확인:** 시장 A/B, 매장 국가·업종, 제공 결과물, 담당자, 편집/번역·예약 응대 범위를 확정한다. 웹페이지 언어와 현장 응대 언어를 따로 기록한다.
2. **검색 의도 확인:** 검색어를 사람이 실제로 찾는 문장으로 검토하고, 승인된 검색/키워드 도구에서 해당 국가·언어·날짜 기준으로 검색결과를 확인한다. 아래 §10에서 대표 B2B 검색어 4개에 대한 제한적인 검색결과 관찰을 추가했다. 나머지 검색어와 국가·기기별 결과는 미검증이다.
3. **작은 페이지 검증:** 동일한 지명을 바꾼 수십 개 페이지를 만들지 않는다. 두 시장별 핵심 페이지에서 서로 다른 질문과 필요한 자료를 먼저 확인한다.
4. **공개 후 관찰:** 소유자의 승인된 Search Console/서치어드바이저 읽기 자료를 검토한다. 이번 패치에서 계정을 새로 연결하거나 분석 추적을 켜지 않는다.
5. **문의와 분리:** 노출·클릭은 문의·예약·계약이 아니다. 상담에서 확인한 구매자 유형과 실제 필요한 작업을 별도 근거로 축적하되, 수집·보관·연결 정책 승인 후 수행한다.
6. **변경 기록:** 씨앗이 실제 검색어로 확인되면 `query, market, audience, locale, source, period, device, landing, evidence_status, owner, next_review`를 남긴다. 자료가 없으면 HYPOTHESIS를 유지한다.

## 9. 남은 승인·확인

- 한국/해외 각 시장의 수행 국가·업종·담당자·서비스 범위와 계약·정산 조건.
- 한국어·영어 홈페이지 제작 범위와 번역 검수 책임. 현지 직원의 언어 응대와 예약 가능 시간.
- 고객사 정보·사진·사용 예시·성과의 소유권과 공개 동의. 공개된 정보라고 고객 사례 게시 승인을 대신하지 않음.
- 검색 도구 읽기 권한과 실제 수요 자료. 신규 추적·국가/언어/상담 기록 자동 연결은 이번 범위 밖.
- 해외 운영 시 개인정보·위탁/국외 이전·권리 행사·현지 법률의 별도 검토. 본 문서는 법률 준수 판정이 아님.
- 실제 Preview에서 링크·언어쌍·메타·접힘 내용·모바일 읽기 확인. 이 문서의 공식 가이드 검토만으로 기술 QA 통과를 주장하지 않음.

**현재 결론:** A는 국내 업주의 외국인 방문 준비, B는 해외 업주의 한국어 방문 준비로 명확히 나눌 수 있다. 먼저 검토할 구매 검색어는 ‘누구의 매장 + 어떤 결과물/대행’이 드러나는 문구다. B2C 질문은 서비스 홍보 키워드로 뭉치지 않고, 매장마다 검증할 사실 목록으로 활용한다.

## 10. 대표 B2B 검색어 4개 — 실제 반환 결과의 질적 관찰

확인일: **2026-10-19 KST**. 범위: 공개 웹 검색 도구에 각 검색어를 입력해 반환된 결과 중 관련 서비스 제공자의 1차 페이지를 읽었다. 아래 순서는 기록 순서이지 검색 순위가 아니다. Google/네이버의 특정 국가·기기·개인화 조건을 통제한 SERP 조사가 아니며, 검색량·난도·검색 순위·실제 유입·문의 의도를 입증하지 않는다. 공급자가 자신의 웹사이트에서 설명한 서비스는 공급자의 주장으로만 다루며, 그 회사의 실적·품질·운영 사실을 별도로 검증한 것이 아니다.

| 시장·검색어 | 실제 반환된 결과 제목·URL | 직접 확인 수준·관찰 | 의도 해석과 후속 판단 |
|---|---|---|---|
| A·ko — `외국인 고객 대상 식당 홈페이지 제작` | [외국인 고객용 다국어 홈페이지 제작 · Onirique Studios](https://oniriquestudios.co.kr/) | **본문 확인.** 식당 등 로컬 비즈니스의 다국어 홈페이지·예약·관리 기능을 소개하고 상담 경로를 제공한다 | 서비스 공급자의 구매 안내 페이지와 연결되는 문구임을 제한적으로 확인. ‘식당의 외국인 손님용 홈페이지’라는 과제는 유지할 수 있다. 해당 업체의 예약/관리 제공 범위를 Weplace의 기능으로 가져오지 않음 |
| A·en — `English website design for restaurants in Korea` | [Online Ordering Website for Restaurants in South Korea · Zegashop](https://www.zegashop.com/business/how-to-create-an-online-ordering-website-for-restaurants-in-south-korea/) / [Web Design for Korean restaurants · TePublico.NET](https://tepublico.net/en/web-design-for/korean-restaurant/) | **두 본문 확인.** 전자는 한국 식당을 언급하지만 온라인 주문 사이트 빌더·자가 제작 안내에 무게가 있다. 후자는 견적 문의가 있는 제작 서비스이며 영어권의 한식당을 대상으로 설명한다 | ‘한국에 있는 식당’과 ‘해외의 한식당’, 제작 대행과 DIY 도구가 섞이는 결과를 관찰. 랜딩에서 `businesses located in South Korea`와 납품 범위를 분명히 적는 편이 적절하다. `in Korea`만으로 시장이 정확히 한정됐다고 볼 수 없음 |
| B·ko — `해외 식당 한국어 홈페이지 제작` | [JOIED WEB · 한국·베트남 및 해외 홈페이지 제작·웹디자인·디지털 메뉴보드](https://joiedweb.com/) / [식당 홈페이지 제작 비용 — 견적 비교법 · Arupix](https://arupix.com/ko/blog/restaurant-website-cost/) | **검색 제목·발췌 관찰만.** JOIED WEB은 한국어·베트남어 사이트와 식당용 메뉴보드를 설명하는 발췌가 반환됐으나, 본문 열기에서 읽을 수 있는 텍스트를 얻지 못했다. Arupix 결과는 식당 제작 견적 일반 안내로 나타났다 | 해외 웹 제작과 식당 제작 수요가 인접해 있으나 ‘해외 식당의 한국인 손님 유치’에 정확히 대응하는 구매 페이지를 충분히 확인하지 못함. **정확한 의도 적합성은 NEED VERIFY.** 시장 B의 주요 검색어로 확정하지 않고 대상 국가/업주 언어를 좁혀 차후 검증 |
| B·en — `Korean-language website service for restaurants in Japan` | [Restaurant Website Design in Japan · RINSAI TECH](https://rinsaitech.com/restaurant-websites) / [Menu Yomeru — 外国人のお客様に伝わるメニューを](https://www.menuyomeru.com/) / [Rakuten GURUNAVI — Japan's Largest Gourmet & Restaurant Guide](https://gurunavi.com/en/site/about/) | **RINSAI 검색 발췌만:** 일본 식당과 한국어 손님을 위한 다국어 사이트가 언급됐지만 본문 접근 오류. **나머지 두 본문 확인:** Menu Yomeru는 일본어 메뉴를 한국어 등을 포함한 다국어 QR 메뉴로 제공하는 도구이고, GURUNAVI는 한국어 메뉴와 예약을 안내하는 플랫폼이다 | 관련 과제는 반환되지만 맞춤 웹 제작·메뉴 번역 SaaS·예약 플랫폼이 혼재한다. ‘한국어 웹 제작’, ‘한국어 메뉴’, ‘예약 플랫폼 등록’을 한 서비스처럼 묶지 말고 산출물을 나눠 설명. 직접 제작 대행의 구매 의도는 **부분 확인·추가 검증 필요** |

### 이 관찰로 바꾸는 판단

- A-ko는 비교적 과제와 맞는 서비스 페이지를 읽을 수 있어 첫 페이지의 설명 언어로 유지한다. 수요가 많거나 구매 전환이 높다는 뜻은 아니다.
- A-en은 `Korean restaurant`의 음식 종류/위치 혼동을 피한다. 제목·본문에서 한국에 있는 매장임을 직접 밝히고, 주문 시스템을 찾는 방문자와 정보 정리를 원하는 방문자를 구분한다.
- B-ko는 언어적으로 구체적이라는 이유만으로 P1을 채택하지 않는다. 현지 업주가 한국어로 공급자를 찾는지부터 확인해야 한다. 현재 P1은 **검증 후보**이며 실행 우선순위 확정이 아니다.
- B-en은 홈페이지·메뉴·예약을 분리한 서비스 범위 설명이 필요하다. 영어로 검색하는 현지 업주 가설은 여전히 HYPOTHESIS이며 일본어 검색 수요까지 확인한 것으로 확장하지 않는다.
- 위 결과에 나온 업체의 가격·수치·고객 사례·검색 노출 주장·예약/결제 기능은 Weplace 페이지로 옮기지 않는다. 미확인 본문 접근을 완료로 처리하지 않고, 실패한 페이지를 무리하게 반복 조회하지 않았다.

이 추가 조사는 대표 문구의 **의도 혼재를 찾기 위한 소규모 관찰**이다. 32개 씨앗의 사실 등급은 모두 HYPOTHESIS로 유지한다.
