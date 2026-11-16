# WEPLACE R4.3 — Experience Refinement

PR #18의 실제 Work 결과 `9e3df4f4e5f78cd8f3e7b7a961af868ead95a06a`에서 분기한 검토본입니다. PR #17(`48a1227`)을 최신으로 가정하지 않았습니다. 시작 시 PR #18 HEAD·Netlify ready deploy `6aeaf52aebb786bfc75cf06d`·로컬 HEAD가 일치했습니다.

## 1. 보존한 장점

- 모바일 제목·CTA·입체 카드의 기본 배치. 제목이나 CTA를 애니메이션 완료까지 숨기지 않습니다.
- `2,100만 원`, `+12.2%`, `1.72억 → 1.93억`과 2026년 5–6월 기간·관측값·개별 작업 기여도 미분리 설명.
- 루위 베이징덕 사진과 `메뉴 먼저 / 외관 먼저` 전환. 이미지·srcset·대체 텍스트와 안내를 함께 바꾸는 기존 동작.
- 관심 → 사진 선택 → 정보와 근거 → FLOW → 진행 방식 → 진단 → 연결 → 마지막 질문의 순서. 기존 섹션을 추가·삭제·획일화하지 않았습니다.
- 크림·포리스트·세이지·골드, 접힌 W·금색 점, Mashcore의 관점과 Weplace의 실행 구분.
- 보호 파일 24개와 `changes / discovery / cases / flow / explore` 섹션 원문 5개가 바이트 단위로 같습니다. [보존 기록](preservation.json).

## 2. 발견한 문제와 이유

| 화면 | 확인한 문제 | 수정 이유 |
|---|---|---|
| 히어로 768px | 고정 `.76` 배율 때문에 양쪽 카드가 잘림 | 카드 영역 크기에 따라 축소 |
| 히어로 1280px, 전환 상태 | 마지막 카드가 약 12px 잘림 | 완료뿐 아니라 세 상태 전체의 경계 확인 |
| 모바일 히어로 | 작은 화면에서도 큰 회전량·4.4초 장면 진행 | 기울임 40%, 이동량 60%, 전환 0.45초·간격 1.5초 |
| 근거·상품 조건 | 관측 단서 10–11px, 범위 문구 10px | 주요 조건·근거 12px 이상, 문장 단위 줄바꿈 |
| 마지막 장면 | 일반 브랜드 문구 + 항상 열린 복사 입력창 | 가져갈 질문 하나와 저장·공유 행동으로 집중 |
| 모의 여정 | 브라우저 뒤로 가기가 직전 단계로 돌아가지 않음 | 비식별 단계 번호만 History에 기록 |

제목·수치·음식 사진을 한 화면에 더 겹치지 않았습니다. 히어로는 관심과 첫 행동, 이어지는 매출 블록은 근거, 실제 음식 사진은 선택 비교를 맡습니다.

## 3. 실제 수정과 작동 방식

- `assets/css/main-landing-r43.css`: 컨테이너 너비에 맞춘 3장면 크기, 근거·조건·장면 탭 위계. 기존 제목 크기와 섹션 밀도는 유지.
- `assets/js/main-landing-r43.js`: 모바일 회전·이동·시간 축소, rotationX 초기화, 폭 변경 시 정지 후 정착. 기존 GSAP는 수치·사진/FLOW, 이 스크립트는 `.cinema-plane`만 제어합니다. H1·CTA에는 등장 지연 없음.
- `index.html`, `assets/css/question-r43.css`: “우리 매장 첫 사진은, 손님에게 무엇을 알려주나요?” 질문 카드. 실제 분석 결과가 아님을 카드 자체에 표시.
- `review/question.html`: 질문만 열 수 있는 정적 공유 페이지. 제목·설명·1200×630 OG 이미지. 기존 빌드의 Preview 이미지 출처 교체를 이용하므로 원본 빌드·Netlify 설정은 변경하지 않음.
- `assets/js/share-r43.js`: 고정 질문 + 현재 검토본의 `/review/question` 주소만 복사/공유. 입력값·쿼리·해시·선택 채널은 제외. 기기 공유 취소는 취소 안내, 미지원은 복사, 클립보드 실패는 선택 가능한 수동 복사란. 외부 메시지를 자동 발송하지 않음.
- `assets/brand/r42/og-question-r43.jpg`: 기존 브랜드 체계로 만든 저장용 질문 카드. `scripts/render-question-card.cjs`에서 실제 폰트·로고와 편집 가능한 HTML로 재생성 가능. `download` 링크는 JS 없이도 사용 가능.
- `review/journey.html`, `assets/js/journey-r43.js`: 첫 진단 범위를 동일하게 표기, 완료는 체험 완료로 표현. 뒤로/앞으로 가기·포커스 복귀. 실제 접수·계약·결제·데이터 저장 없음.
- 기존 폰트를 보존하고 누락 한글 53자만 10,256B의 보완 폰트로 공급. 콘텐츠 글리프 누락 0개.

새 영상은 필요하지 않아 생성·적용하지 않았습니다. 기존 [선택적 Runway 명세](../r43/RUNWAY.md)는 참고용이며 영상 확보가 구현 완료의 전제가 아닙니다.

## 4. Before / After

동일한 폭·모션 감소 조건에서 촬영했습니다. 전체 페이지와 긴 섹션 캡처는 고정 헤더가 콘텐츠를 가리지 않도록 캡처 영역보다 큰 높이에서 촬영하고, 본문 전체 캡처 전 맨 위로 이동했습니다. 내용이나 스타일을 숨기지 않았습니다.

| 화면 | Before (PR #18) | After |
|---|---|---|
| PC 1440 첫 화면 | [Before](browser/before-1440-hero.jpg) | [After](browser/after-1440-hero.jpg) |
| 모바일 390 첫 화면 | [Before](browser/before-390-hero.jpg) | [After](browser/after-390-hero.jpg) |
| 768 카드 잘림 | [Before](browser/before-768-hero.jpg) | [After](browser/after-768-hero.jpg) |
| PC 마지막 장면 | [Before](browser/before-1440-closing.jpg) | [After](browser/after-1440-closing.jpg) |
| 모바일 마지막 장면 | [Before](browser/before-390-closing.jpg) | [After](browser/after-390-closing.jpg) |
| PC 전체 페이지 | [Before](browser/before-1440-full.jpg) | [After](browser/after-1440-full.jpg) |
| 모바일 전체 페이지 | [Before](browser/before-390-full.jpg) | [After](browser/after-390-full.jpg) |
| 모바일 음식 장면 | [Before](browser/before-390-photo.jpg) | [After](browser/after-390-photo.jpg) |

1280/430/360/320px 캡처도 `browser/`에 포함했습니다.

## 5. Figma

[편집 가능한 전후 프레임](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=104-274): 히어로 PC/모바일 시작·전환·완료 6개, 기존 완료 비교 2개, 마지막 장면 전후 4개 = 12개. 텍스트·도형·기존 로고/버튼 인스턴스로 구성되며 화면을 통째로 이미지로 붙이지 않았습니다. [프레임 목록](figma/frames.json).

기존 [진단·상품·모의 주문·완료·공유 10프레임](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=90-2)과 원본 페이지를 보존했습니다. 새 프레임은 이번 변화의 검토용입니다. 기기 공유·복사·다운로드·브라우저 뒤로 가기는 실제 웹에서 검수합니다. Figma는 제공되는 Noto Sans KR를 사용하며, 웹의 Pretendard와 완전한 픽셀 일치를 주장하지 않습니다.

## 6. Playwright QA

[검수 보고서](QA.md) · [40개 검사 로그](browser/playwright.txt) · [기존 88개 회귀 검사/링크/빌드](verify.txt)

## 7. Draft PR / Netlify

별도 브랜치: `draft/weplace-r43-experience-refinement-20261104`. [Draft PR #19](https://github.com/HotCharliepepper/Weplace/pull/19) · [Netlify Preview](https://deploy-preview-19--weplace.netlify.app/) · [질문 카드](https://deploy-preview-19--weplace.netlify.app/review/question) · [진단→모의 주문 체험](https://deploy-preview-19--weplace.netlify.app/review/journey).

구현 commit `0293440e62fcad30a4eaa58d778096184cb1bd22`, ready deploy `6aeb4d9030b959d912ff17d0`에서 실제 브라우저 검수를 마쳤습니다. [공개 Preview 검수 기록](DEPLOY.md). 후속 커밋은 이 기록과 캡처만 추가하며 웹 구현은 같습니다. main을 base로 하는 Deploy Preview이므로 선행 미병합 Draft 변경도 포함됩니다. 이번 수정만의 비교 기준은 `9e3df4f...새 브랜치`입니다.

## 8. 남은 확인과 현재 위치

- 물리 iPhone/Android, Safari/Firefox, 네이티브 스크린리더, 실제 OS 공유 대상으로 전송/사진 앱 저장은 미실시.
- 실제 신청률·매출·사용자 이해 변화는 측정하지 않았습니다. 개선 효과를 확정하지 않습니다.
- 미확정 가격·기준가·초기 체험 혜택은 공개하지 않습니다.
- 기존 회사·개인정보 승인 게이트 22개는 유지합니다. 실결제/실DB/인증 변경이나 운영 승인으로 해석하지 않습니다.
- main 병합·운영 배포·실제 고객 메시지는 수행하지 않았습니다.

다음 첫 행동은 Preview에서 모바일 첫 화면 → 음식 사진 탭 → 진단 범위 → 마지막 질문 카드를 직접 이어보며 문장과 밀도를 확인하는 것입니다. 첫 장면의 입체감과 음식의 감각은 남기고, 마지막에는 조용한 질문 하나를 남기는 방향입니다.
