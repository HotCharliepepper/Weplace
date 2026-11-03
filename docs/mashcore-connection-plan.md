# Mashcore–Weplace 콘텐츠 연결 계획

검토일: 2026-10-19 KST. 이번 문서는 공개 브랜드 링크만 다룬다. 계정·인증·상담·계약·개인정보 공유를 추가하지 않는다.

## 확인한 운영 주소와 원본

| 확인 항목 | 확인 결과 |
|---|---|
| 현재 HTTPS 주소 | https://mashcore.netlify.app/ |
| 홈페이지 title | Mashcore — 보이는 것 너머, 사람의 이유를 봅니다 |
| 브랜드 표기 | Mashcore Lab / MASHCORE LAB |
| 운영 저장소 | https://github.com/HotCharliepepper/Mashcore |
| main 소스 | 45bba47cee6e59e64fd74ea50e3779a9e4865208 |
| Netlify published deploy | 6acea31aa6b6223a8eaafa43 |
| published_at | 2026-10-13T21:31:29.947Z = 2026-10-14 06:31:29 KST |
| 대조 결과 | GitHub main SHA와 Netlify production deploy commit_ref 일치 |
| 직접 HTTPS GET | 홈·/about/·/research/ 각각 200, title과 현재 소스 일치 |
| 계획 도메인 mashcore.kr | 이 환경에서 HTTPS GET 502. 정상 전환을 확인하지 못했으므로 링크 교체하지 않음. 도메인 미등록·소유권 부재를 뜻하지 않음 |

운영 메타데이터와 HTTP 응답을 확인했다. 이 문서의 확인을 모든 화면의 브라우저 시각 검수나 로그인 검수로 확대하지 않는다.

## 연결할 수 있는 페이지

| 주소 | 소스 title | 이번 확인 수준 | 추천 역할 |
|---|---|---|---|
| https://mashcore.netlify.app/ | Mashcore — 보이는 것 너머, 사람의 이유를 봅니다 | HTTPS 200 + 운영 commit 소스 | 브랜드의 첫 인상 |
| https://mashcore.netlify.app/about/ | About — Mashcore Lab | HTTPS 200 + 운영 commit 소스 | Lab·Weplace의 역할 설명. 공통 footer 링크에 가장 적합 |
| https://mashcore.netlify.app/research/ | Research — Mashcore Lab | HTTPS 200 + 운영 commit 소스 | 연구 방식 탐색 |
| https://mashcore.netlify.app/explore/ | Mashcore Lab — 관점과 생각 읽기 | 운영 commit tree 존재·로컬 소스 확인; 직접 HTTP 재검수 필요 | 글 탐색 후보 |
| https://mashcore.netlify.app/research/chore-to-play/ | Chore to Play — 함께 존재하는 일의 상태 \| Mashcore Lab | 운영 commit tree 존재·로컬 소스 확인; 직접 HTTP 재검수 필요 | 주제와 직접 맞는 글에서만 연결 |

확인된 연구 목록에는 현재 별도의 ‘고객 망설임/로컬 매장 접점’ 전용 글을 특정하지 못했다. /about/를 특정 고객 사례의 해설 글인 것처럼 ‘이 작업의 관점 읽기’로 안내하지 않는다.

## 지금 추천하는 연결

- Weplace → Mashcore `/about/`: `브랜드 관점과 연구 · Mashcore Lab ↗`.
- Weplace의 연구 설명에서 `/research/`: `관찰을 판단 기준으로 바꾸는 과정 ↗`.
- Mashcore → Weplace `https://withweplace.kr/#experience`: `우리 업종의 손님 시선으로 보기 →`.
- Mashcore → Weplace `https://withweplace.kr/field-notes/`: 승인된 사례가 실제 공개된 후 `현장에서 실행한 기록 보기 →`.

현재 Mashcore 홈과 소개 페이지에는 `https://withweplace.kr/` 역링크가 이미 있다. 홈은 ‘고객의 망설임을, 다음 접점의 개선으로’, 소개는 ‘Weplace에서 현장 실행 보기’라는 맥락을 둔다. 역링크 수정이 필요하면 Mashcore 저장소의 별도 브랜치/PR로 검토하며 이번 문서에서 운영 소스를 변경하지 않는다.

## 연결 경계와 승인

1. 클릭하는 일반 HTTPS 링크만 사용한다. 로그인 토큰·연락처·진단 답변·고객 ID·계약 식별자를 URL에 넣지 않는다.
2. 신규 cross-domain analytics, 추적 파라미터, SSO, 계정 연결, 상담 복제, CRM API 호출은 추가하지 않는다.
3. Weplace의 서비스 제공자·개인정보처리자 표기와 Mashcore의 연구/브랜드 관점 표기를 구분한다. ‘운영·관리 Mashcore’만으로 법인 역할을 대체하지 않는다.
4. 상호 연구 기여의 실제 범위와 문안 승인 후 footer에 반영한다. 동일 담당자가 참여한다는 사실로 법인·위탁 관계를 추정하지 않는다.
5. 사례→연구 글은 사례 파일과 문안의 별도 공개 승인 및 자료 권리 확인 후 연결한다. 내부 운영 기록을 자동으로 연구/공개 콘텐츠로 이동하지 않는다.
6. mashcore.kr 전환 시 DNS·TLS·HTTP 상태·canonical·하위페이지를 함께 확인한 후 같은 승인 PR에서 모든 브랜드 링크를 정리한다.

## 확인 출처

- GitHub branch: https://api.github.com/repos/HotCharliepepper/Mashcore/branches/main
- 고정 소스: https://github.com/HotCharliepepper/Mashcore/tree/45bba47cee6e59e64fd74ea50e3779a9e4865208
- 홈/소개/연구 HTML의 title·문안·링크를 같은 commit에서 읽음.
- Netlify authenticated read: site `mashcore`, current published deploy와 해당 deploy 상세 대조.
- 공개 HTTPS GET: 위 홈·소개·연구 3개와 mashcore.kr. 상태만 확인하고 데이터 변경 없음.
