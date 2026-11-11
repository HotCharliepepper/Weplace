# R4.2 Draft / Preview 배포 확인

## 실제 확인한 배포

| 항목 | 값 |
|---|---|
| Draft PR | https://github.com/HotCharliepepper/Weplace/pull/17 |
| 상태 | open, draft true, merged false |
| branch | `draft/weplace-r42-brand-food-20261103` |
| base | main `42562ec1a3dedec0e97b4fef1944aef4d84a6a49` |
| 검수 소스 commit | `bc1de0e1f82743e172cb3cb06a4d03b6a3e5aa28` |
| 로컬/원격 동일 tree | `cb34b8886b27d628f737afd77e99cbfee6d6520d` |
| Netlify deploy | `6ae9f847fd93c52ad38748b4` |
| context / state | deploy-preview / ready |
| commit_ref | `bc1de0e1f82743e172cb3cb06a4d03b6a3e5aa28` |
| published_at | null — 운영 publish 아님 |
| Preview alias | https://deploy-preview-17--weplace.netlify.app/ |
| 배포별 고정 URL | https://6ae9f847fd93c52ad38748b4--weplace.netlify.app |

Netlify API의 이 deploy는 함수·Edge Function·DB migration이 없는 정적 배포입니다. 배포 검증의 secrets scan은 298개 파일에서 일치 항목을 반환하지 않았습니다. 이는 전체 시스템 보안 감사나 인증 변경을 의미하지 않습니다.

## 실제 Preview에서 확인

Chrome으로 위 Preview alias를 열어 확인했습니다.

- 루트 홈페이지 새 로고, 원래 수치, 음식 사진 표시.
- 외관 먼저 ↔ 메뉴 먼저 사진·대체 텍스트·srcset 상태 변경과 정상 이미지 로드.
- H1 1개, `robots=noindex, nofollow`, canonical `https://withweplace.kr/`.
- `og:image`는 Preview 자체의 `/assets/brand/r42/og-weplace-r42.jpg`로 연결. 실제 이미지 문서에서 로드 완료·1200×630 확인.
- 0원 및 매장 1곳·공개 채널 1개·직접 써볼 개선안 1개 표시.
- 새 accent `#1f4439`, 데스크톱 footer 로고 폭 180px.
- Mashcore 링크 `https://mashcore.co.kr/about/#weplace`.
- 배포된 QA 페이지의 390px CSS iframe: 가로 넘침 없음, fonts loaded, GSAP 3.13.0.

원시 증빙: [DOM](browser/preview-dom.json), [모바일 관측](browser/preview-mobile-raw.json), [첫 화면](browser/preview-desktop-hero.jpg), [음식 장면](browser/preview-desktop-food.jpg).

이 기록은 위 commit의 실제 확인 결과입니다. 이 문서·스크린샷·로컬 실행 안내를 저장하는 후속 문서 커밋의 최신 HEAD와 최종 deploy는 PR 본문에 별도로 기록합니다. 후속 커밋에서 공개 홈페이지 구현은 변경하지 않습니다.

## 운영 보존

운영 기준은 main `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`, Netlify production deploy `6ad8a7438ddf68ea7482fcd2`입니다. 최종 제출 시 두 값의 보존을 다시 확인합니다. 별도 승인 없는 운영 배포·main 병합·실DB·인증 변경은 이 작업에 포함하지 않습니다.

기존 Draft #16은 보존했습니다. #17은 main을 base로 하므로 선행 미병합 R4/R4.1 변경을 포함합니다. R4.2만 검토할 때는 `cd860cb...bc1de0e` 비교를 사용합니다.
