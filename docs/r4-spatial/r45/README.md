# WEPLACE R4.5 — THE CLEAR PATH × OPEN WORK

2026-11-08 검토 구현. 운영 배포 승인본이 아닙니다.

[실제 Netlify Preview](https://deploy-preview-21--weplace.netlify.app/) · [Draft PR #21](https://github.com/HotCharliepepper/Weplace/pull/21). 앱 코드 `e8950a6`의 deploy-preview `6af038d11f08324d31a05af7`가 ready이며 실제 브라우저의 핵심 경로를 확인했습니다. 이후 검수 기록 커밋은 문서·증빙만 추가합니다.

기준: PR #20 `9ed15798e1ef90712ba842a7f873b230a1688cf0` (Draft). 시작 시 Preview deploy `6af005fdd53ddf4f9c27a60c`, 동일 커밋 / ready 확인. 별도 브랜치 `draft/weplace-r45-clear-path-20261108`에서 작업했습니다.

## 실제 변경

- H1·CTA·무료 범위는 유지. 보조 문장은 '다시 확인하는 정보와 예약 방법까지'로 구체화했습니다.
- HTML 안내 카드 2개를 제거하고 루위 원본 사진, 1px 시선선, 약한 빛, 기존 Folded W로 재구성했습니다. 제목·CTA·사진은 처음부터 HTML에 존재합니다.
- 로컬 GSAP 8초 단발. T0 사진 → T3 시선 정리 → T8 경로 완성. 재생·정지·키보드 장면 선택. 모바일 1000px 이하, reduced-motion, Save-Data/slow-2g/2g/3g는 정적 포스터입니다.
- R4.4 hero JS를 로드하지 않고 R4.5만 해당 요소를 제어합니다. pagehide/pageshow·visibility·화면 이탈 시 정지합니다. 영상·추가 외부 요청 없음.
- 루위 비교 뒤에 숙박 사진 선택의 5개 기준을 설명하는 OPEN WORK를 넣었습니다. **호텔 사진·고객명·적용 실적은 공개하지 않은 일반 비실사 예시**입니다.
- 기존 접힌 무료 예시를 '제작 예시 · 실제 진단 결과 아님'이 항상 보이는 1장으로 교체했습니다. 가상 매장 C / 홈페이지 한 곳 / 대표 메뉴 사진을 먼저 놓는 개선안 한 가지입니다.

## 편집 가능한 Figma

- [A/B 및 T0·T3·T8 보드](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=132-3)
- [Desktop B 1440](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=132-105), [Mobile B 390](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=132-160)
- [OPEN WORK·진단 Desktop/Mobile](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=135-198)

| 상태 | Desktop | Mobile |
|---|---|---|
| T0 | 132:254 | 132:334 |
| T3 | 132:403 | 132:483 |
| T8 | 132:552 | 132:632 |

새 페이지 `132:2`. R4.4 페이지와 원본은 보존했습니다. 텍스트·벡터·사진 fill·Auto Layout·기존 로고/버튼 인스턴스, 6개 장면 컴포넌트로 구성했습니다. 전체 UI 래스터를 삽입하지 않았습니다. **Figma 환경에 Pretendard가 없어 Noto Sans KR로 대체했으며 폰트 완전 일치는 미완료**입니다. 웹은 실제 Pretendard를 사용합니다. Figma는 편집 가능한 키프레임이며 실제 시간 재생은 웹 GSAP에서 검수했습니다.

## 보존

음식점 A 2026.05 1.72억 → 06 1.93억 / 2,100만 원 / +12.2%, 웰니스 B 877 → 2,350 / +168%와 관측 해석, 루위 메뉴/외관 비교, FLOW, 고객/팀 링크, 수동 진단 문구 준비, 모의 주문, 마지막 질문·공유를 보존했습니다. 루위 사진과 음식점 A는 같은 사례로 연결하지 않습니다.

main `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`, 운영 Netlify deploy `6ad8a7438ddf68ea7482fcd2`는 변경하지 않습니다. 인증·DB·실결제·외부 고객 발송 없음. 회사정보·개인정보 22개 승인 게이트를 유지합니다.

- [검수 결과](QA.md)
- [Before / After와 판단](BEFORE_AFTER_DECISIONS.md)
- [8초 콘티와 자산 상태](STORYBOARD_AND_ASSETS.md)
- [기계 판독 근거 상태](media-evidence.json)
- [실제 Preview 검수](LIVE_REVIEW.md)
