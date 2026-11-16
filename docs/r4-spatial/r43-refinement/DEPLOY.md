# 공개 Preview 검수 — 2026-11-04

- [Draft PR #19](https://github.com/HotCharliepepper/Weplace/pull/19), draft 상태.
- [Netlify Preview](https://deploy-preview-19--weplace.netlify.app/)
- 구현 commit: `0293440e62fcad30a4eaa58d778096184cb1bd22`
- 검수 구현 tree: `3e6c774088609f64035f27fbf8cfd0d4d95ccc8c` (검수된 로컬 tree와 GitHub 일치)
- ready deploy: `6aeb4d9030b959d912ff17d0`, context `deploy-preview`, commit 일치, error 없음, published_at null.
- 운영 deploy 보존 기준: `6ad8a7438ddf68ea7482fcd2`. main 보존 기준: `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`.

## 공개 URL에서 실제 조작한 결과

| 확인 | 결과 |
|---|---|
| 첫 화면 | 기존 제목·CTA·무료 범위·3장면 표시, video 요소 0 |
| 색인/대표 주소 | robots `noindex,nofollow`, canonical `https://withweplace.kr/` |
| 독립 질문 페이지 | `/review/question` 정상 이동, 질문·분석 결과 아님 표시 |
| OG 이미지 | `https://deploy-preview-19--weplace.netlify.app/assets/brand/r42/og-question-r43.jpg` |
| 공유 payload | 고정 질문·설명 + 현재 Preview의 질문 주소, 입력 정보 제외 |
| 복사 후 붙여넣기 | 버튼 클릭 후 같은 페이지의 매장 링크 입력칸에 Ctrl+V로 실제 질문/주소가 붙여넣어짐. 입력은 검수 후 비우고 새로고침. 전송하지 않음 |
| 카드 저장 | 공개 URL에서 다운로드 파일 생성. 원본과 SHA-256 일치 |
| 무료 진단 | 0원 · 매장 1곳 · 공개 채널 1개 · 직접 써볼 개선안 1개 |
| 모의 주문 | 체험 고지·동의 누락 오류 → 동의 체크 → 체험 완료. 실제 접수/결제가 아님을 명시 |
| 뒤로/앞으로 | 완료에서 Back → 모의 주문, 제목으로 포커스 복귀. Forward → 완료 |
| 완료 후 행동 | 질문 카드 공유 단계 → 독립 카드/홈 이동 가능 |

다운로드 파일 SHA-256: `37e4afcbda06d752e399130df1a06f4c09bbe8810d3ff59079193a0cfe3966b6`.

클라우드 브라우저 clipboard 읽기 인터페이스는 빈 값을 반환했으므로 그 값으로 복사 성공을 판단하지 않았습니다. 브라우저의 실제 Ctrl+V 입력 결과로 검증했습니다. 별도 메신저에 붙여넣거나 외부로 발송하지 않았습니다.

## 실제 공개 화면

- [첫 화면](browser/netlify-hero.jpg)
- [질문 카드와 복사 상태](browser/netlify-question.jpg)
- [모의 주문 완료](browser/netlify-journey-complete.jpg)

Netlify Preview 도구 막대가 함께 보이는 실제 브라우저 캡처입니다. UI 레이어를 숨기거나 합성하지 않았습니다. 정밀한 7개 폭 비교와 모바일 캡처는 [Before / After](README.md#4-before--after)를 참고합니다.

## 범위와 인계

실제 OS 공유 대상 전송·사진 앱 저장, 물리 iPhone/Android, Safari/Firefox, 네이티브 스크린리더 및 필드 성능은 미실시입니다. [자동 검수 및 측정 한계](QA.md).

main 병합·운영 배포·실결제·실DB·인증 변경·외부 고객 메시지는 실행하지 않았습니다. 후속 문서/캡처 커밋의 배포 상태와 최종 commit은 PR 본문에 남깁니다.
