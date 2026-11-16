# WEPLACE R3 — 진단 가치·컬러·가상 매장 C·INSIGHT 설계

작성일 2026-11-03 · 설계/검토 전용 · 운영 배포·DB 변경·가격 확정 없음

## 기준
- 홈페이지 R2: `HotCharliepepper/Weplace` PR #13 (SHA `06647cb8`), https://deploy-preview-13--weplace.netlify.app/
- 기존 위플레이스 OS 설계: PR #14, 별도 기능·정책을 덮어쓰지 않는다.
- FigJam: https://www.figma.com/board/QnhjcEPZctjddj7L4wWwGm (추가된 R3 컬러/전환 및 INSIGHT 발행 도식)
- 참고 자료: 사용자가 제공한 `brkpointref.html` — BRKPOINT 공개 블로그 HTML. 게시물 카테고리·검색·3열 반응형 목록/상세·SEO 메타/Article·BreadcrumbList·Tally 문의 구성 확인. **관리자 내부 구현과 실제 노출 성과는 확인 불가**.

## 1. 진단 상품의 경계
R2 기본 진단은 **매장 1곳·공개 채널 1개·개선안 1개**. 30만원 상당의 상품으로 즉시 바꿀 수 없다.

별도 설계하는 ‘종합 진단 프로그램’ 후보:
- 네이버·GBP·홈페이지·리뷰의 공개 정보 확인
- 대표사진/정보 일치·고객 FAQ·예약 진입과 이탈 가능 지점
- 확인일 있는 근거 + 우선과제 3개 + 1~2장 결과 + 설명 기회
- 제외: 비공개 계정 조작, 실제 정보 수정, 상위 노출·매출 보장
- **아직 가치·가격·상품 범위 미확정**. 정상 판매가와 실제 제공 범위를 확인하기 전 ‘30만원 상당’ 혹은 취소선 가격을 라이브 게시하지 않는다.
- 기존 무료 진단은 이름·범위 그대로 유지하거나 독립 진단 상품으로 구분. 서로 다른 결과물을 같은 상품으로 오인시키지 않는다.

CTA 제안 (실제 증빙 확정 이전):
> 고객이 다시 검색하는 자리를 확인해 보세요.
> 먼저 바꿀 화면 하나부터 짚어드립니다.
> [내 매장 화면 점검하기]

실제 가격/모집 확정 후 선택 가능한 문구:
> 검색부터 예약까지 살피는 종합 진단 프로그램
> 30만원 기준가의 이번 모집 혜택
> [진단 프로그램 신청하기]

한정성은 **실제 담당자 소화 가능 수량**을 기준으로 월 N곳/선착순/사례 모집 중 선택. 날짜·모집 근거·마감 상태를 운영으로 검증. 가짜 카운트다운/재시작/허구 잔여 수량 금지.

## 2. 컬러 설계: 감정 가설로 림빅 모델 활용
Hans-Georg Häusel의 Balance / Dominance / Stimulance는 마케팅 해석 프레임. 특정 색이 뇌에서 고정 효과를 낸다는 주장·유형 확정 금지. 다양한 비판·검증 한계를 감안해 사용자 실험의 가설로 다룬다.

| 역할 | 토큰 | HEX | 활용 |
| --- | --- | --- | --- |
| 배경·여백 | warm-paper | `#F5F0E9` | 편안한 이해 |
| 본문·제목 | deep-ink | `#25312C` | 전문성과 정확성 |
| 보조·확인 | trust-green | `#285247` | 신뢰와 질서 |
| 주 CTA | signal-clay | `#AE6045` | 희소한 행동 신호 |
| 성과 근거 | proof-brass | `#BB9465` | 숫자·증거 보조 |
| 경계 | warm-line | `#D8CFC3` | 구획 |

R2 크림·테라코타 디자인은 보존한다. CTA를 여러 색으로 경쟁시키지 않는다. 대비, 키보드/포커스, 감소 모션을 QA한다. 색만으로 의미를 전하지 않는다.

## 3. 가상 매장 C 전후 경험
- 위치: R2 `#flow`; 현재 ‘가상 매장 C / 첫 사진과 예약 안내 정리’의 추상적 작업 카드만으로 고객의 다음 행동이 잘 보이지 않는다.
- Before(가상): 설명 없는 대표사진/가격·주차/예약 방식이 분산/‘더 알아보기’ 애매한 버튼.
- After(가상): 서비스 공간 사진 → 소요시간/가격/조건 → 위치·주차·FAQ → **예약 방법 확인하기** CTA.
- 실시간 예약 가능 슬롯·실고객 예약·전환 증가로 오인되지 않도록 ‘시연 화면 / 실제 예약 불가’ 표시.
- FLOW 직원 UI의 ‘작업→검수→고객 확인’을 그대로 유지하면서 공개 설명용 시연 화면만 별도로 디자인한다.

## 4. INSIGHT는 ‘글 발행’이 아니라 현장 근거의 축적
서로 분리되는 공개 영역:
- `/insight/`: 독자 중심 현장 노트/고객 질문/검색과 AI/운영 기록. 글 목록, 카테고리 필터, 검색.
- `/insight/{slug}/`: 고유 정적 HTML 본문. 제목/H1/요약/원본 이미지/본문/날짜/작성자/BlogPosting 구조화 데이터/내부 링크/한 가지 CTA.
- `/field-notes/`: 공개 승인을 받은 고객 사례. 내부 작업·개인정보 자동 공개 금지.

### 운영 MVP (단계적)
1. 본문 소스는 `content/insights/*.md` 또는 JSON으로 관리. 초기 발행은 GitHub Draft PR → 별도 리뷰/승인 → 빌드로 `dist/insight/` 생성. 기존 `scripts/build-site.mjs` 기능과 충돌 없는 독립 생성/검증 스텝 제안.
2. 웹 관리 UI는 계정과 업로드 보안·최소권한이 확보된 다음 도입. 후보는 **Keystatic GitHub mode / Cloud**, 또는 별도 CMS. 현재 공개 홈페이지가 정적이므로 `/insight` 부분만 별도 Astro/Keystatic 브리지로 증설할 수도 있다.
3. Netlify **Git Gateway는 신규 프로젝트 구축 비권장(deprecated)**. 기존 FLOW의 owner/member 역할을 편집 승인자 역할로 자동 재해석하지 않는다.
4. 게시 상태 `draft → in_review → approved → published`. `published` 전 필수: 근거 상태(CONFIRMED/NEED_VERIFY/HYPOTHESIS), 공개 동의/사용권, 편집 QA, 내부 링크와 검색 메타.
5. 작성 UX: 제목·카테고리·요약·본문·이미지·alt·근거 출처·내부 링크·공개 여부·작성/검수/게시 시각. 고객 신원 정보·CRM 식별자·계약 내용을 공개 본문/분석에 흘리지 않는다.

### 검색 발견성 기준
- 페이지별 독립 indexable URL/정적 HTML/내부 링크, canonical, OG, XML sitemap.
- `BlogPosting` 구조화 데이터의 제목, 작성자, `datePublished`, `dateModified`, 대표 이미지 등은 실제 보이는 사실과 일치.
- Search Console에서 크롤링·색인·실제 유입 확인. 빈번한 게시만으로 SEO/GEO 상승 보장하지 않기.
- Google 공식 2026 안내는 AI 검색에도 일반 SEO와 독창적인 사람 중심 콘텐츠를 우선하며 특수한 GEO 꼼수를 요구하지 않음.
- 우선 발행 아이디어 (실고객 자료 없는 기획 단계): ‘손님이 예약 전 주차를 다시 검색하는 이유’, ‘네이버와 구글의 매장 정보가 다르면 생기는 일’, ‘리뷰 답글은 누구를 안심시키는가’, ‘고객이 승인해야 하는 결과물은 무엇인가’.

## 5. 상태별 검증 및 실행 순서
| 순서 | 상태 | 산출물 | 릴리즈 경계 |
| --- | --- | --- | --- |
| P0 | DONE (DEMO) | R3 로컬 HTML, 1280/390px 브라우저 QA, FigJam 2개 다이어그램 | 실제 서버 저장·게시·예약 동작 없음 |
| P1 | PLANNED | R2 별도 코드 브랜치에서 카피·컬러·매장 C 화면 개선 | 공식 배포와 분리 |
| P2 | PLANNED | 글 목록+개별 HTML + Git/PR 승인 기반 콘텐츠 MVP | noindex 프리뷰와 본 게시 승인 구분 |
| P3 | PLANNED | 웹 편집 UI의 실인증·권한·발행 워크플로 | 실 DB/Identity/Blobs와 격리 테스트 |
| P4 | PLANNED | 콘텐츠에서 진단 상담·CRM에 귀속되는 분석 | 새 수집/추적·동의 승인 후 |

이 설계는 운영 정책/가격/실적 증빙/인증을 승인했다는 뜻이 아니다.

## 참고 자료
- https://www.haeusel.com/limbic/
- https://klicklaut.de/studienblog/limbic-map/
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/
- https://keystatic.com/docs/github-mode
