# WEPLACE 광고 퍼널 R2-A

2026-11-11 · 검토용 구현. 운영 배포 및 main 병합 없음.

## 기준과 위치

- 기준: GitHub Draft PR #27 HEAD `b979e08794d0b756a328084d99da5b7e216b8c4c`를 작업 시작 직전에 API로 확인.
- 작업: `draft/weplace-ad-funnel-r2a-20261111`, Draft PR #28.
- 공통 퍼널: `/ad-funnel.html`. 일반 진입에서는 기존 PR #27의 브랜드 스토리를 재사용하며 이 페이지 안에서만 CTA 목적지를 체험으로 조정.
- 광고 진입: `/go/dining/`, `/go/stay/`, `/go/wellness/`, `/go/local/` → 동일 퍼널의 `?ad=…`. 브랜드 히어로를 건너뛰고 광고별 문장·사진으로 시작.
- 기존 `index.html`, `ad-message.html`, `/experience/`, 사례, FLOW/CRM, 인증·DB·권한·리다이렉트·회사/개인정보 승인 설정·원본 GSAP은 바이트 단위 보존.
- `postbuild`에서 기존 빌드와 release guard가 성공한 다음 새 정적 `go/` 경로만 복사. 기존 protected builder와 기준 해시는 변경하지 않음.

## 구현한 흐름

1. 업종별 광고 약속 → 공통 `#experience`. URL의 허용 UTM 문자열을 보존. `/go/`는 replace 이동으로 뒤로가기 루프를 만들지 않음.
2. 사진: 좌석·공간 사진 / 위치: 입구 사진·가상 약도 / 예약: 인원·시간을 실제로 선택하는 예시 화면. 선택은 화면을 자동 스크롤시키지 않음.
3. 비교: 동일 가상 매장의 흩어진 정보와 정리된 정보로 서로 다른 DOM 화면을 표시. 성과 수치가 아닌 정보 배치 체험.
4. 진단: 한 장의 구성 예시. 매장명·지역은 현재 문서 메모리에서만 사용하며 서버·쿠키·스토리지·URL로 전달하지 않음. 실제 진단·접수·담당자 연락으로 표현하지 않음.
5. 첫 작업: 선택 항목에 맞는 작업 범위를 접고 펼침. 미확정 가격·할인·혜택 수치 없음.
6. 미팅: 온라인/방문 희망 방식 → 사용자 선택을 반영한 요청문 → 명시적 복사. 발송·캘린더 예약·CRM 쓰기 없음.

## 비주얼과 모션

기존 저장소의 `img/ind-dining.jpg`, `img/ind-stay.jpg`, `img/ind-spa.jpg`, `img/weplace-hero-surface.jpg`, `img/weplace-diagnosis-bg.jpg`와 `assets/hero-r2/` 이미지를 재사용. 고객 매장 실사나 실제 성과라고 주장하지 않고 참고 이미지·가상 매장 예시를 표시. 공통 체험의 모온은 식당을 바탕으로 한 가상 예시이며 업종별 실진단 결과가 아님.

새 문장에 필요한 한글 글리프를 포함하는 Noto Serif/Sans CJK KR 로컬 서브셋을 추가. 원본 폰트는 변경하지 않음. 라이선스는 `assets/ad-funnel-r2a/fonts/LICENSE.txt`.

기존 GSAP 3.13.0 + ScrollTrigger를 재사용. 상태·ARIA·실제 콘텐츠 변경이 먼저이고 opacity 전환은 보조. `gsap.matchMedia()`로 폭과 reduced-motion을 구분. 강제 스크롤·pin·scrub·자동 반복 없음. GSAP 미로딩 및 Save Data/저속 연결에서는 정적 전환.

참조 공식 문서:
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## 실행과 검수

Node.js 20+ 환경에서 `npm ci` → `npm run verify`. 빌드 산출물은 `dist/`. 정적 HTTP 서버로 `dist/`를 연다. `file://` 더블클릭은 루트 기준 자산 경로 때문에 지원하지 않는다.

검수 전용 `/review/ad-funnel-r2a.html`에서 폭·진입·장면·모션 대체 조건을 선택할 수 있다. 모션 대체 조건은 iframe 안의 controlled fixture이며 실제 OS 설정이나 느린 네트워크를 측정한 결과가 아니다. `?team=1`은 메모리에만 이벤트명을 표시하며 입력값은 기록하지 않는다.

결제 연결 사양은 첨부 R1 원본 내부 문서에 보존되어 있다. 이번 고객 화면에는 결제 영역, 이동 경로, 초기화 이벤트, SDK를 추가하지 않았다. 0원 진단의 실접수는 서비스 범위·담당자·기한·개인정보 처리와 서버 접수 연결이 정해진 뒤 별도 작업한다.
