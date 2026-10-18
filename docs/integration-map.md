# 홈페이지와 FLOW 통합 구조

기준일: 2026-10-19 KST. 검토용 브랜치이며 운영 배포·데이터 변경·자동 개인정보 저장·결제 활성화는 수행하지 않는다.

```mermaid
flowchart TD
  subgraph Public["공개 홈페이지 · 정적 화면"]
    H["업종별 고객 시선 체험"] --> Q["6문항 자가진단 · 메모리"]
    H --> K["사용자가 직접 여는 카카오 상담"]
    Q --> K
    Q --> M["미팅 준비 · 미연결 템플릿"]
    P["내 매장 관리 안내"]
    N["Field Notes · 승인된 기록"]
  end
  subgraph Flow["기존 FLOW · 인증과 서버 권한"]
    S["담당자 확인 · Prospects"] --> C["Calendar · 미팅"]
    C --> B["Briefs · 제안"]
    B --> A["계약 상태 · 거래처"]
    A --> G["고객 계정 연결 · Client grants"]
    G --> W["고객별 요청 · 공유 작업"]
    U["공개 승인 · 비식별 projection"]
  end
  K -. "현재는 담당자 수동 확인" .-> S
  M -. "실제 일정·조건 합의" .-> C
  P -->|"기존 /client 리디렉트"| G
  W -. "별도 공개 검수" .-> U
  U -->|"기존 public-journal"| N
  U -->|"기존 public-industries"| H
  A -. "별도 승인 필요" .-> PG["전자계약·PG · 미연결"]
```

실선은 화면 연결 또는 확인된 기존 객체 관계를 나타낸다. 점선은 담당자의 확인·별도 승인·미구현 전환이다. 이 도식은 홈페이지 클릭을 자동 CRM 접수·계약·결제로 처리한다는 뜻이 아니다.

## 원본과 배포

| 대상 | 확인된 기준 | 상태 |
|---|---|---|
| 홈페이지 | `HotCharliepepper/Weplace`, main `ec714758367b5bc448d61cc8c73b6fd2a3de9007` | CONFIRMED |
| 홈페이지 운영 | Netlify `weplace`, deploy `6acf8753289dcea4ef81258f`, ready, main SHA 일치 | CONFIRMED |
| 홈페이지 새 변경 | `feature/weplace-customer-discovery-20261019`, main에서 독립 생성 | 검토 브랜치 |
| 기존 PR #4 | merged | CONFIRMED |
| 기존 PR #5 | Draft/open, 영어·시장 근거·가격안; 이번 변경의 기반 아님 | CONFIRMED / 가격 미승인 |
| FLOW 실제 서버 소스 | `HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2`, `feature/industry-folders-20261014`, `29dace237c8a2ce2323a499409a81aa28a12a50b` | CONFIRMED: 배포 보관 ZIP 226개 파일과 Git blob 전수 일치 |
| FLOW 운영 | Netlify `weplace-flow-mino-review`, deploy `6acf86ec3b764e3a56f9339c`, `flow.withweplace.kr` | ready; drop/API deploy, commit_ref/branch null 유지 |
| FLOW 테스트 변경 | `feature/homepage-intake-sandbox-20261019`, 위 서버 소스 SHA에서 생성 | 별도 가상 데이터 검토 브랜치 |

FLOW의 `main`만 보면 오래된 시각적 프로토타입이다. **실제 서버 기능이 포함된 작업 브랜치를 발견했으므로 저장소 이름만으로 소스 여부를 판정하지 않는다.** 226개 파일 대응과 운영 정적 진입 파일의 일치는 확인했지만, 운영 서버 함수 바이너리와 Git 소스의 완전한 동일성을 보증하는 배포 SHA 메타데이터는 아직 없다.

## 공개와 인증의 경계

| 공개 홈페이지 경로 | 서비스 | 접근/보존 원칙 |
|---|---|---|
| `/api/weplace-industries` | 기존 FLOW `public-industries` proxy | `credentials: omit`, 공개 projection만, 만료/오류 시 수치 숨김 |
| `/api/weplace-journal` | 기존 FLOW `public-journal` proxy | 승인된 공개 저널; 서버의 게시 승인 필터 보존 |
| `/field-notes/` | 기존 FLOW 공개 Vite 산출물 | 기존 번들 보존, 내부 CRM 번들/비밀값 복제 없음 |
| `/my-store/` → `/client` | 기존 FLOW `/client` | 홈페이지에는 설명과 로그인 링크만; 인증/계정 연결은 기존 FLOW |
| `/team`, `/team/*` | 기존 FLOW 직원 화면 | 기존 리디렉트와 인증 유지 |
| `/check/`, `/meeting/` | 정적 메모리 처리 | API·GA4·스토리지 없음; 명시적 복사/다운로드/인쇄만 |
| `/review/integration.html` | 가상 응답 fixture | 운영 API 호출/저장 없음; 정상·만료·오류·예상 외 필드 테스트 |

`_redirects` 원본 7개 규칙은 변경하지 않았다. 개인/고객 식별자·진단 답변을 URL로 넘기지 않으며 허용 업종 enum만 다음 화면에 전달한다.

## 실제 운영으로 연결할 순서

1. 미리보기에서 고객 질문·체험·미팅 화면의 적합성을 검토한다.
2. 별도 승인 후 홈페이지 PR만 병합·배포한다. FLOW 테스트 PR은 운영 활성화와 분리한다.
3. FLOW 운영 원본을 immutable SHA로 배포하는 경로를 정하고 담당자·공식 workspace·테스트 계정을 확정한다. 기존 계정·배포 연결을 이번에 바꾸지 않는다.
4. 동의 문구·최소 수집 항목·보존/삭제 정책을 승인한 뒤 익명 인입 서버 경계를 별도로 구현한다. 기존 인증된 prospects API를 공개하지 않는다.
5. 서버 접수 성공/중복/담당자 확인, 미팅 합의, 제안 버전, 계약 상태, 고객 계정 grant를 서로 다른 증빙으로 검증한다.
6. 실제 가격·VAT·환불·계약/PG 주체 승인 후 전자계약·결제 검증을 별도 연결한다. 결제 메모나 버튼 클릭을 PG 성공으로 취급하지 않는다.
7. 고객 공유 작업과 공개 사례의 승인을 분리해 운영한다.

상세 상태 매핑은 [journey-to-crm.md](journey-to-crm.md), 서버 원본/권한 근거는 [flow-integration-inventory.md](flow-integration-inventory.md), 최종 검증은 [release-review.md](release-review.md)를 따른다.

## v1.2 — 경험과 신뢰의 공통 기준

PR #8의 기존 4업종·8목적·전후 비교·진단·미팅 기능을 유지한 후속 패치다. 실제 고객 사례를 새로 공개하지 않고, 홈페이지·현장 안내물·직원 작업 목록의 연결을 명시적인 가상 구성 예시로 설명한다.

```mermaid
flowchart TD
  M["Mashcore · 관점과 연구"] <--> H["Weplace · 고객 시선과 작업 범위"]
  H --> E["업종 체험 · 자가진단"]
  E --> C["본인이 선택하는 상담 · 미팅"]
  C --> P["담당자 확인 · 제안·계약 합의"]
  P --> F["기존 FLOW · 고객별 공유 작업"]
  F --> R["고객 승인 + 내용 검수"]
  R --> N["공개 기록"]
  N --> H
  I["공통 법인 정보 · 정책 검토 초안"] -. "공개 홈페이지에 접근 링크" .-> H
  I -. "승인 후 기존 입력 지점에 적용" .-> F
```

- Mashcore 연결은 콘텐츠 이동만 의미한다. 계정·상담·계약·개인정보를 브랜드 사이에 자동 전달하지 않는다.
- `/privacy/`는 로그인 없이 열리는 **검토 초안**이다. 법인 최신 증빙·기간·위탁/국외 이전·삭제 절차의 운영 확인과 법률 검토가 끝난 정식 방침이 아니다.
- `config/company-info.json`과 `config/privacy-release.json`은 빌드 입력이다. 공통 footer/구조화 데이터는 같은 회사값으로 생성하며, 미확인 주소·등록번호를 만들어 내지 않는다.
- 운영 빌드는 위 검토 상태를 검사한다. Preview 성공을 운영 공개 승인으로 해석하지 않는다.
- FLOW 로그인/가입/의뢰 화면에 정책 링크가 없는 점을 확인했다. PR #10에는 적용 위치 시안과 실제 원본 기반 개인정보 인벤토리·진단 테스트만 추가한다. 기존 인증·서버 권한·DB·Blobs·가입 동작은 변경하지 않는다.
- FLOW 사진 삭제는 현재 DB 연결 해제와 원본 파일 파기를 구분해야 한다. 보유/삭제 개선은 운영 담당자 결정과 별도 구현·검증 대상이다.
- 공개 사례용 상세 구성은 `/review/case-layout.html`의 가상 자료로만 검토한다. 실제 고객명을 포함한 사실·승인 대장은 공개 저장소/Preview에 넣지 않는다.
