# 공개 작업 기록 통합 검토

홈페이지에 `/field-notes/` 진입점과 운영·관리 Mashcore 링크를 추가합니다. 기존 문의 경로, 업종별 페이지, GA4는 유지합니다.

공개용 React 번들의 원본은 비공개 FLOW 저장소에서 관리합니다. 원본 commit `c37731012d746e732dc0f02922bc331a059cbbcb`, `npx vite build --config vite.portal.config.ts`로 만든 `withweplace-public-dist/field-notes/`를 이 저장소에 복사했습니다. 이 경로의 생성된 JS를 직접 수정하지 않습니다. 고객 원문·로그인·CRM 컴포넌트는 공개 번들에 넣지 않습니다.

`/api/weplace-journal`은 FLOW 검토 사이트의 **GET 전용 익명 public-journal 함수** 한 곳만 연결합니다. 내부 flow/journal API는 프록시하지 않습니다. 공식 운영팀 설정 전에는 빈 목록이며 실제 고객 데이터가 게시되지 않습니다. 최종 공개 전에 운영 FLOW 호스트와 공식 팀, 고객 동의를 확인해야 합니다.

외부 회원의 글쓰기와 댓글은 준비 중이라고 표시합니다. 기존 콘셉트 사진 `img/ind-dining.jpg`를 실제 고객 사례로 표시하지 않습니다. 가짜 예약·리뷰·성과 수치는 없습니다.

이 변경은 검토용 draft PR이며 main과 운영 도메인은 자동 변경하지 않습니다.
