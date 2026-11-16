# WEPLACE Resolute R1 — 검수 결과

2026-11-11 KST. **기존 테스트 131/131, Chromium 검사 155/155, 실제 Deploy Preview의 검토 도구 191/191 통과.** 운영 배포·병합은 하지 않았습니다.

- 검수한 코드: `227962e8789f2609ec5b00f6839462c48c9e6736`
- [Actions 실행과 원본 캡처](https://github.com/HotCharliepepper/Weplace/actions/runs/43024766106)
- [새 메인 Preview](https://deploy-preview-29--weplace.netlify.app/resolute.html)
- [반응형 검토 도구](https://deploy-preview-29--weplace.netlify.app/review/resolute.html)
- [브라우저 검사 원자료](qa-results.json)
- 기준 원본: Draft PR #28 `e9b9fa90bbce4d02691856f7e75e4172209d4e71`

## 확인 범위

| 항목 | 결과 | 확인한 내용 |
|---|---|---|
| 기존 테스트 | 131 통과 / 0 실패 | 기존 서비스·퍼널·FLOW·운영 승인 가드 관련 회귀 검사 |
| 정적 링크 | 결함 0 | HTML 46개, 참조 1,276개. 외부 URL 22개는 자동 요청하지 않음 |
| 빌드 | 통과 | `npm run verify`에 포함된 정적 사이트·광고 경로 빌드 |
| 반응형 | 통과 | 360·390·430·768·1280·1440px. 가로 넘침, 이미지 로딩, 비교·예약 선택 버튼 크기 |
| 비교 UI | 통과 | 사진·찾아오는 길·예약의 이전/정리 후 6개 화면, 단일 선택 상태, 예시 인원·시간 변경 |
| 문의 준비 | 통과 | 선택 주제 반영, 문의문 생성과 실제 클립보드 복사, 편집·재진입 시 이전 문의문 제거 |
| 키보드 | 통과 | 모달 초기 포커스, Tab 이동 14회, Escape 닫기, CTA로 포커스 복귀 |
| reduced-motion | 통과 | 최초 진입 및 실행 중 브라우저 미디어 설정 변경. ScrollTrigger 제거, 글자 정적 표시, 비교 버튼 유지 |
| 수동 모션 선택 | 통과 | 움직임 끄기/켜기, GSAP context 복구 |
| 확대→축소→확대 | 통과 | 데스크톱 실제 transform scale 1 → 1.035 → 0.96 → 1 관측. pin 없음 |
| 로딩 실패 | 통과 | GSAP 차단 시 글자와 비교 UI 유지. JS 전체 비활성화 시 기존 `/#request` 경로 유지 |
| 오류·쓰기 요청 | 0 | 검수 중 페이지 JS 오류와 GET/HEAD 이외 요청 없음. 실제 문의·예약 전송은 실행하지 않음 |
| Deploy Preview | 통과 | 검토 도구 191개 통과. 데스크톱 히어로·길 안내·대각선 문장 확인 |
| 시각 검수 | 확인 | 데스크톱·390px 모바일 히어로와 전체 페이지, 길 안내 전후/모바일 캡처 확인 |

브라우저 검사는 Ubuntu/Chromium의 viewport·media emulation입니다. Preview의 검토 도구는 동일 출처 iframe 및 reduced-motion fixture를 이용합니다. 실제 모바일 OS·Safari·Kakao 인앱, 실기기의 저성능·데이터 절약 설정, 스크린리더 음성 출력, 실제 외부 문의 전달은 미검수입니다. 접근성 인증이나 성과 측정을 뜻하지 않습니다.

## 검수 중 보완

- 비교 버튼과 상위 영역이 같은 `data-*` 속성을 사용하므로 이벤트·테스트 선택자를 `button[...]`으로 한정했습니다.
- 새 문구에 필요한 로컬 서체 문자를 보충하고, 축소 모션 중에도 비교 버튼 높이가 44px 이상 유지되도록 조정했습니다.
- 모달의 마지막/첫 요소에서 Tab 이동을 연결하고, 재진입 때 오래된 문의문을 지우도록 수정했습니다.
- iframe 검토 도구는 고정 대기시간 대신 실제 `close` 이벤트를 기다리게 했습니다. 실제 사용자 키 입력 검사는 별도 Chromium 실행으로 검증했습니다.

## 보존·전송 상태

검수 종료 시 PR #28은 위 HEAD의 열린 Draft이며 운영 main은 `42562ec1a3dedec0e97b4fef1944aef4d84a6a49` 그대로입니다. PR #28 대비 변경은 새 파일 추가뿐입니다. 기존 `index.html`, 사례·서비스·FLOW 상세, 인증·DB·CRM·리다이렉트·배포 가드를 수정하지 않았습니다. 보고서 추가 커밋은 검수한 사이트 코드를 바꾸지 않습니다.

결제 SDK·Toss 연동·실결제·실제 신청 저장을 추가하지 않았습니다. 문의문 생성과 복사 이후에도 아직 접수되지 않았음을 표시합니다. 가상 길 안내와 예약 선택 예시는 실제 매장 운영·예약 가능 여부가 아닙니다.

## 캡처 구성

| 파일 | 내용 |
|---|---|
| `WEPLACE_Resolute_Desktop_Hero.png` | 1440×1000 히어로, 기본 모션 |
| `WEPLACE_Resolute_Mobile_Hero.png` | 390×844 히어로, 기본 모션 |
| `WEPLACE_Resolute_Arrival_before.png` | 길 안내 이전: 주소·소개·소식 분산 |
| `WEPLACE_Resolute_Arrival_after.png` | 길 안내 정리 후: 약도·출구·입구·주차 |
| `WEPLACE_Resolute_Mobile_Arrival.png` | 390px 길 안내 정리 후 |
| `WEPLACE_Resolute_Desktop_Full.png` | 데스크톱 전체 페이지, reduced-motion |
| `WEPLACE_Resolute_Mobile_Full.png` | 모바일 전체 페이지, reduced-motion |
| `WEPLACE_Resolute_Preview_Final.jpg` | 실제 Netlify Preview의 데스크톱 화면. 하단 Drawer는 Preview 도구 |

PNG는 Actions가 빌드한 동일 사이트의 캡처이며 전체 페이지는 모든 문장의 배치를 확인하도록 reduced-motion에서 촬영했습니다. JPEG는 실제 Preview 브라우저에서 촬영했습니다. Actions 캡처 보존기간은 14일이며 제출 ZIP에도 함께 제공합니다.
