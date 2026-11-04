# [Draft] Weplace R4.2 — 음식 사진·웹 브랜드·Mashcore 연결

> Draft / review-only. 최신 Preview 배포 식별자와 HEAD는 실제 배포 후 PR 본문에 기록합니다.

## 목적

기존 사진 선택 장면의 마사지 예시와 브랜드 자산이 사용자가 선택한 음식 사례·접힌 W 로고 방향과 달랐습니다. 이 PR은 현재 홈페이지의 간결한 메시지·여백·매출 차트를 유지하면서 루위 제공 사진, 음식점 안내, 웹 브랜드를 일치시킵니다.

## 변경과 동작

- 사진 선택 장면을 **루위 · 사진 선택 비교**로 바꿉니다. 기본은 베이징덕이 보이는 `메뉴 먼저`, 비교는 기존 제공 외관·차량 자료의 `외관 먼저`입니다.
- 탭 전환 시 사진·대체 텍스트·`srcset`·크기 정보·제목·설명을 함께 바꿉니다. 외관 상태에 음식의 반응형 후보가 남아 잘못 표시되는 경로를 막습니다.
- 질문을 `대표 메뉴 / 식사 자리 / 예약 안내`로 맞춥니다. 예약 버튼은 안내 구성 예시를 펼치며 실제 예약을 확정하지 않습니다.
- 사진 3을 기준으로 **웹용 SVG 로고를 재해석**하고, 헤더·공통 footer·파비콘·Apple icon·OG를 맞춥니다. 원본 래스터의 정확한 복원이라고 주장하지 않습니다.
- 밝은 크림 바탕을 유지하고 주요 버튼·숫자·보조 표면을 포리스트·세이지·골드 계열로 정리합니다.
- Mashcore의 관점과 Weplace의 실행을 설명하고 [현재 소개 페이지의 Weplace 구간](https://mashcore.co.kr/about/#weplace)으로 연결합니다.
- 비운영 빌드는 새 OG 이미지만 검증된 Preview 출처로 연결합니다. 운영 canonical과 noindex 정책을 유지합니다.

Hero의 `1.72억 → 1.93억`, `+12.2%`, `2,100만 원`, 기간·관측 단서를 보존합니다. 공개 진단은 **0원 · 매장 1곳 · 공개 채널 1개 · 개선안 1개**입니다. 기존 3장면 모션과 FLOW 구조를 유지하며, 게임형 업무·고객 연락 기능은 다음 차수입니다.

## 자료와 예시의 경계

루위 사진은 기존 제공 자료입니다. 촬영일·정확한 교체일·사진 선택의 개별 매출 기여를 새로 확정하지 않습니다. 캡처의 리뷰 수·영업시간을 현재 값으로 재사용하지 않으며, 안내·예약 버튼은 화면 구성 예시로 표시합니다.

## 검증

최종 `npm run verify`: **88 passed / 0 failed / 0 skipped**. HTML 35개, 로컬 참조 1,071개, 로컬 링크 결함 0건, review build 성공입니다.

- 추가 회귀 검증: 키보드 사진 전환, `srcset` 교체, 음식 문구의 상태 일치, 예시·실제 예약 구분, 로고·아이콘 파일, Preview OG 주소와 canonical 보존.
- [구현·판단·검증 상태](README.md) · [보호 기준과 변경 사유](protected-baseline.json)
- 작업 중 모바일 화면: [메뉴 먼저 390px](browser/mobile-food-390-qa.jpg) · [외관 먼저 390px](browser/mobile-cars-390-qa.jpg)
- [최종 테스트·링크·빌드 로그](verify.txt).
- [7개 CSS 폭·키보드·모션 절감·JS/GSAP/사진 fallback·진단 요청문 검수](BROWSER_QA.md).
- Figma: [Desktop 1440](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=44-16), [Mobile 390](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=44-305), [동기화 및 제한](figma/FIGMA_R42_SYNC.md).
- [Netlify Preview](https://deploy-preview-17--weplace.netlify.app/) ready·commit 일치·noindex·실제 OG 로드를 확인했습니다. [배포 증빙](DEPLOY_CHECK.md)을 참고하세요.

DOM 검사와 작업 중 캡처를 물리 모바일·네이티브 스크린리더·현장 성능 통과로 확대하지 않습니다. 미실시 항목과 INP 판정 한계는 최종 검수 보고에 명시합니다.

## 기준과 운영 경계

- 작업 브랜치: `draft/weplace-r42-brand-food-20261103`
- R4.1 비교 기준: `cd860cb04ce0650d3a6d222e7f1f7b235e3a8c13`
- 보존할 main: `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`
- 보존할 운영 deploy: `6ad8a7438ddf68ea7482fcd2`

Draft / review-only입니다. main 병합·운영 배포·실DB·인증·권한 변경·외부 고객 연락은 진행하지 않습니다. 기존 회사·개인정보 release gate를 유지합니다. PR base는 `main`이며 선행 Draft PR #16의 미병합 R4/R4.1 변경을 포함합니다. R4.2만의 검토 기준은 `cd860cb...HEAD`입니다. 선행 Draft를 병합하거나 닫지 않습니다.
