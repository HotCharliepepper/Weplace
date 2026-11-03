# 로컬 실행과 검토

전달 ZIP에는 저장소 소스와 미리 생성한 `dist/` review build가 함께 들어 있다. 운영 계정·서버 비밀값·node_modules는 포함하지 않는다.

## ZIP을 바로 열어보기

압축을 풀고 `START_PREVIEW.py`가 있는 폴더에서 실행한다. Python 3가 필요하다.

```sh
python3 START_PREVIEW.py
```

Windows에서 Python launcher를 사용한다면 `py START_PREVIEW.py`로 실행한다. 브라우저에서 `http://127.0.0.1:4173/`를 연다. 다른 프로그램이 같은 포트를 쓰면 `python3 START_PREVIEW.py --port 4174`로 바꾼다. 종료는 Ctrl+C다. 서버는 localhost에만 연결된다.

HTML을 파일 탐색기에서 직접 여는 대신 HTTP로 실행해야 `/assets/...` 경로와 검수 fixture가 동작한다.

## 소스를 수정하고 다시 빌드하기

Node.js 20 이상과 Python 3를 사용한다.

```sh
npm ci
npm run verify
python3 START_PREVIEW.py
```

`npm run verify`는 테스트·링크 검사·review build를 실행한다. `dist/`는 다시 생성된다. 다른 정적 서버가 기존 폴더를 캐시하고 있다면 빌드 후 재시작한다.

## 검수 화면

- `/`: 실제 홈페이지. Store C 전후·질문·예약 설명, FLOW 탭을 확인한다.
- `/review/spatial.html`: 5개 CSS 폭, JS 차단·GSAP 누락·사진 누락과 모션 절감 검수. 물리 기기를 에뮬레이션하지 않는다.
- `/?qa=r4`: 최상위 페이지의 명시적 LAB 성능 관측. 일반 방문에서는 로드되지 않는다.
- `docs/r4-spatial/README.md`: 디자인 링크·범위·검증·운영 전 조건.
- `docs/r4-spatial/BROWSER_QA.md`: 실제 화면과 성능 관측의 한계.

이 묶음은 검토용이다. `--production`, main 병합, 운영 Netlify 게시, 실DB·인증 변경은 별도 승인 대상이며 기존 release gate를 유지한다. 문의 폼은 문구만 준비한다. 실제 카카오 전송은 사용자가 직접 수행한다.
