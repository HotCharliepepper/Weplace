# WEPLACE — RESOLUTE IT FAST. 메인 검토 R1

2026-11-11 KST. 검토 전용 새 메인은 `/resolute.html`입니다. 기존 `/` 홈페이지는 그대로 유지합니다.

- [새 메인 Preview](https://deploy-preview-29--weplace.netlify.app/resolute.html)
- [Draft PR #29](https://github.com/HotCharliepepper/Weplace/pull/29)
- [원본 홈페이지](https://deploy-preview-29--weplace.netlify.app/)
- [반응형 검토 도구](https://deploy-preview-29--weplace.netlify.app/review/resolute.html)
- [QA 결과](QA.md)

## 기준과 보존

시작 전 PR #28의 최신 HEAD `e9b9fa90bbce4d02691856f7e75e4172209d4e71`을 확인한 뒤 `draft/weplace-resolute-fast-r1-20261111`로 분기했습니다. 운영 main의 기준은 `42562ec1a3dedec0e97b4fef1944aef4d84a6a49`입니다.

새 경로·스타일·스크립트·검수 자료만 추가했습니다. 기존 `index.html`, `/ad-funnel.html`, `/go/`, 사례·서비스·FLOW, 인증·DB·CRM, `_redirects`, `netlify.toml`, 배포 승인 가드를 바꾸지 않았습니다. Preview 생성을 위해 main 대상 Draft PR을 열었으므로 앞선 미병합 변경도 포함됩니다. 이번 작업은 PR #28 HEAD와 비교합니다. 병합·운영 배포는 하지 않았습니다.

## 반영한 구성

1. **강한 첫 화면:** `RESOLUTE IT FAST.`를 요청 그대로 유지했습니다. FAST의 선명한 본문 뒤에 좌·우 잔상과 마스크 그라데이션을 배치하고, F→점 순서로 외곽 두께를 줄였습니다. 문구는 제공된 의도적인 브랜드 표현이며 임의로 `Resolve`로 교정하지 않았습니다.
2. **직접 비교:** 사진은 음식 단독→메뉴·공간 병치, 길은 분산된 안내→약도·3단계 도착·입구 도식·주차, 예약은 안내문→인원·시간 선택으로 실제 UI가 바뀝니다. 길 안내를 기본 선택으로 두었습니다. 같은 가상 매장의 예시이며 실제 운영 정보나 성과가 아닙니다.
3. **일하는 방식:** 보여주고, 정리하고, 실행합니다. 세 문장을 대각선으로 배치하고 각 문장의 스크롤 위치에 따라 독립적으로 드러냅니다. 서비스·사례·FLOW를 각각 한 장으로 압축하고 `/#changes`, `/#cases`, `/#flow`, `/#process`로 연결합니다. 업종·작업기록·기업 협업 경로도 유지합니다.
4. **첫 진단 문의:** 선택 주제가 구성 예시와 문의문에 이어집니다. 요청문 생성·복사만 하며 실제 전송·접수·예약 확정은 하지 않습니다. 카카오 채널도 사용자가 직접 여는 링크입니다. 실제 전송은 검수하지 않았습니다.

## 모션과 폴백

기존 로컬 GSAP 3 / ScrollTrigger를 사용합니다. 사진 프레임은 데스크톱에서 1→1.035→0.96→1, 모바일에서 1→1.014→0.985→1로 변합니다. 긴 pin, 강제 snap, 스크롤 잠금, 반복 자동재생은 없습니다. 비교 전환은 0.35초 opacity만 사용합니다.

`gsap.matchMedia()`로 모바일·데스크톱·움직임 줄이기를 구분합니다. OS 설정 변경 시 GSAP context를 되돌리고 모든 문장을 보입니다. 페이지의 ‘움직임 줄이기’ 버튼과 Save Data/2g 폴백도 있습니다. GSAP 실패 시 정적인 콘텐츠와 비교·문의 기능을 유지하고, JavaScript 전체 실패 시 기존 진단 경로로 연결합니다.

## 자료와 자산

- 첨부 `WEPLACE_R1_R2_작업자료_전체모음_20261111(1).zip`: R1 퍼널·R2 비주얼/GSAP 기준.
- `WEPLACE_RESOLUTE_FAST_R1_WORK_PACK.zip`: 시그니처 문구·압축 구조·별도 검토 경로 기준.
- 사진·로고·기본 폰트·GSAP: 확인한 PR #28에 있는 자산 재사용. 분위기 참고 사진을 실제 고객 실적으로 표기하지 않습니다.
- 길 안내 SVG와 입구 도식: 이번에 작성한 가상 화면. 실제 지도·실제 매장 입구 사진이 아닙니다.
- 새 문구에서 기본 서브셋에 없던 44개 문자(한글·영문·기호 포함)를 같은 Noto Sans CJK KR로 보충했습니다. WOFF Regular 6,588B / Bold 6,752B. SIL OFL은 자산 폴더에 포함합니다.
- 사례 숫자는 기존 홈페이지의 음식점 A 2026.05 1.72억→06 1.93억, +12.2%를 그대로 인용합니다. 원자료를 새로 검증했다거나 특정 작업이 매출을 만들었다고 주장하지 않습니다.

## 실행과 검수 재현

Node 22 이상에서 `npm ci`, `npm run verify`를 실행합니다. `python3 -m http.server 4173 --bind 127.0.0.1 --directory dist`로 띄운 뒤 `npx playwright install chromium`, `node scripts/qa-resolute.cjs`를 실행하면 Chromium 검수와 캡처가 `test-results/resolute/`에 남습니다. 이 브랜치에 한정된 GitHub Actions가 같은 검사를 실행합니다.

`/review/resolute.html`의 reduced-motion은 제어된 matchMedia fixture입니다. 별도 Actions는 Playwright의 브라우저 media emulation을 사용합니다. 둘 다 실제 iPhone·Android·Safari·Kakao 인앱 또는 OS 설정에서 직접 측정한 결과를 뜻하지 않습니다.
