# Weplace R4.2 검토 묶음

2026-11-03 · 음식 사진 · 웹 브랜드 · Mashcore 연결

## 바로 보기

- [Netlify Preview](https://deploy-preview-17--weplace.netlify.app/)
- [Draft PR #17](https://github.com/HotCharliepepper/Weplace/pull/17)
- [Figma Desktop](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=44-16)
- [Figma Mobile](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=44-305)

## ZIP 실행

ZIP을 모두 추출한 뒤 `START_PREVIEW.py`와 `dist/`가 있는 폴더에서 실행합니다. 전달 ZIP에는 검토 빌드가 들어 있어 기본 화면 확인에 npm 설치가 필요하지 않습니다.

Mac / Linux / Bash:

```bash
python3 START_PREVIEW.py
```

Windows / PowerShell:

```powershell
py .\START_PREVIEW.py
```

브라우저에서 `http://127.0.0.1:4173/`를 엽니다. 포트가 사용 중이면 `--port 4175`를 추가합니다. 종료는 `Ctrl+C`입니다. 소스를 수정한 뒤에는 Node.js 20 이상에서 `npm ci`, `npm run verify`로 다시 빌드합니다.

이번 R4.2 ZIP의 기본 실행 범위는 공개 검토 홈페이지입니다. 30만원 비교가격을 넣은 내부 상품 시안은 포함하지 않습니다. `--concept`는 이전 별도 내부 묶음에만 해당합니다.

## 순서대로 확인

1. [구현과 유지한 기준](docs/r4-spatial/r42/README.md)
2. [실제 화면·브라우저 QA와 성능 한계](docs/r4-spatial/r42/BROWSER_QA.md)
3. [자동 테스트·링크·빌드 로그](docs/r4-spatial/r42/verify.txt)
4. [사진 출처](docs/r4-spatial/r42/R42_ASSET_PROVENANCE.md), [자산 용량](docs/r4-spatial/r42/ASSET_BUDGET.json), [색상·코드 QA](docs/r4-spatial/r42/QA_NOTES.md)
5. [Figma 동기화와 폰트 제한](docs/r4-spatial/r42/figma/FIGMA_R42_SYNC.md)
6. [배포 확인](docs/r4-spatial/r42/DEPLOY_CHECK.md)

실제 음식 사진 선택, 사진 설명, 예약 안내 예시를 함께 확인하세요. 진단은 0원·매장 1곳·공개 채널 1개·개선안 1개입니다. 홈페이지와 요청문이 같은 범위를 안내합니다.

## 이번 차수의 경계

사진 1의 구성·수치와 기존 FLOW 구조를 유지했습니다. 내부 작업자의 달성률·추천 작업·고객 연락 주기를 게임처럼 보는 기능은 다음 차수입니다. Figma는 편집 가능한 기본 상태이며, 웹은 Pretendard·Figma는 Noto Sans KR이라 글자 폭과 줄바꿈 차이가 있습니다.

운영 배포·main 병합·실DB·인증 변경은 수행하지 않았습니다. 기존 회사·개인정보 운영 승인 gate를 유지합니다. Preview에는 noindex를 적용하고 실제 신청 전송·예약·DB 저장을 구현하지 않았습니다.
