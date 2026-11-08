# ZIP 다운로드 후 로컬 실행

전달 ZIP에는 저장소 소스와 미리 생성한 `dist/` 검토 빌드가 함께 들어 있습니다. 기본 화면을 보려면 Python 3만 필요하며, Node.js 설치나 npm 빌드는 필요하지 않습니다.

## Windows · PowerShell

1. ZIP을 다운로드한 뒤 파일 탐색기에서 **모두 추출**합니다. ZIP 안에서 바로 실행하지 않습니다.
2. 추출한 폴더 안에서 `START_PREVIEW.py`와 `dist`가 보이는 위치를 엽니다.
3. 그 폴더의 빈 공간을 오른쪽 클릭해 **터미널에서 열기**를 선택합니다.
4. PowerShell에서 아래 명령을 실행합니다.

```powershell
py .\START_PREVIEW.py
```

5. 브라우저에서 `http://127.0.0.1:4173/`를 엽니다. 터미널은 화면을 보는 동안 열어 둡니다. 종료는 `Ctrl+C`입니다.

`py` 명령을 찾을 수 없지만 Python 3가 설치되어 있다면 `python .\START_PREVIEW.py`를 사용합니다. 두 명령 모두 인식되지 않으면 Python 3 설치가 필요합니다. Git Bash는 필요하지 않습니다.

포트가 이미 사용 중이면 `py .\START_PREVIEW.py --port 4175`로 실행하고 `http://127.0.0.1:4175/`를 엽니다.

## Mac · Linux · Bash

```bash
python3 START_PREVIEW.py
```

주소는 `http://127.0.0.1:4173/`입니다. HTML 파일을 직접 더블클릭하면 `/assets/...` 주소가 정상 작동하지 않을 수 있으므로 localhost로 실행합니다.

## ZIP에 동봉된 내부 상품 시안

내부 상품 시안이 포함된 전달 ZIP에서만 사용할 수 있습니다. 기본 홈페이지와 별도 폴더를 제공합니다.

```powershell
py .\START_PREVIEW.py --concept --port 4174
```

Mac/Linux에서는 `python3 START_PREVIEW.py --concept --port 4174`입니다. `http://127.0.0.1:4174/`에서 엽니다. 이 모드는 `local-concept/`만 localhost로 제공합니다. 저장소와 공개 Netlify 빌드에는 이 폴더가 없습니다. 시안의 제안값을 바꾸어도 공개 페이지는 바뀌지 않습니다.

## 소스를 수정하고 다시 빌드하기

수정한 소스를 보려면 Node.js 20 이상과 Python 3를 사용합니다.

```bash
npm ci
npm run verify
```

`npm run verify`는 자동 테스트·내부 링크 검사·검토 빌드를 실행합니다. `dist/`를 재생성한 뒤 로컬 서버를 다시 시작합니다. 기본 실행은 `dist/`, `--concept`는 `local-concept/`를 사용합니다.

## 검수 화면과 기록

- `/`: 홈페이지. Store C 전후·질문·예약 설명, FLOW 탭, 첫 화면 진단을 확인합니다.
- `/review/spatial.html`: 1440/1280/768/390/320 CSS 폭과 JS·GSAP·사진 누락 조건. 실제 기기를 에뮬레이션하지 않습니다.
- `/?qa=r4`: 최상위 페이지의 명시적인 LAB 성능 관측. 일반 방문에서는 수집 스크립트가 로드되지 않습니다.
- `docs/r4-spatial/R41_DIAGNOSIS_UPDATE.md`: 이번 진단 제안 변경과 검증 결과.
- `docs/r4-spatial/BROWSER_QA.md`: 기존 R4 브라우저·성능 검증 범위와 한계.

이 묶음은 검토용입니다. 서버는 `127.0.0.1`에만 연결됩니다. 운영 배포·main 병합·실DB·인증 변경은 별도 승인 대상이며 기존 release gate를 유지합니다. 문의 폼은 요청문만 준비하며 카카오 전송은 사용자가 직접 수행합니다.
