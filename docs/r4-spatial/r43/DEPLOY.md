# R4.3 검토 배포 확인

- Draft PR: https://github.com/HotCharliepepper/Weplace/pull/18
- 검토본 홈: https://deploy-preview-18--weplace.netlify.app/
- 모의 여정: https://deploy-preview-18--weplace.netlify.app/review/journey
- 검수된 구현 commit: `86cd6421970246a899ca7f85b0d998fa7a62f2ae`
- 구현·검사 자료 tree: `238f14f13d2a1af3087c4944e102c00cc2b9296d`
- 확인한 Netlify deploy: `6aeaf393bdbe3f94b1919272`, `state=ready`, `context=deploy-preview`, `review_id=18`
- 해당 배포의 `commit_ref`가 구현 commit과 일치. GitHub의 `netlify/weplace/deploy-preview` 상태도 success.
- main은 `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`, 운영 배포는 기존 `6ad8a7438ddf68ea7482fcd2` 유지.

2026-11-04 클라우드 Chromium에서 공개된 검토본을 열고 다음을 직접 확인했다.

1. 홈페이지의 새 제목·기존 수치·무료 진단 범위가 표시됨.
2. 3장면 선택과 마지막 장면의 실제 transform 위치 확인.
3. 메인의 ‘진행 과정 체험하기’로 체험 경로 진입. Netlify pretty URL이 `/review/journey`로 정리됨.
4. 홈페이지 채널 선택 → 첫 진단 범위 → 모의 주문 0원 요약 확인.
5. 확인 체크 누락 시 오류, 확인 후 실제 접수가 아니라는 완료 상태 표시.
6. 공유 버튼을 누르면 clipboard API 성공 상태가 표시됨. 로컬 자동 검사에서 복사 인자·거부 폴백을 검수했으며 OS 클립보드에 붙여넣는 실기기 확인까지 주장하지 않음.
7. 메인으로 돌아가는 경로와 보완 한글 표시 확인.

[배포본 첫 화면](browser/preview-desktop.jpg) / [배포본 모의 완료](browser/preview-complete.jpg)

이 문서와 배포 캡처를 추가하는 후속 커밋은 문서만 바꾼다. 위 구현 commit의 HTML·CSS·JS·자산은 그대로이며, 최신 Deploy Preview commit/state는 PR 상태에서 확인한다.

검토본은 공개로 열 수 있지만 운영 도메인으로 게시하지 않았다. main 병합, 운영 배포, 실제 신청 전송, 실결제, DB·인증 변경은 수행하지 않았다.
