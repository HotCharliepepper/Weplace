# Weplace R4.2 · 웹 브랜드 자산

## 디자인 기준

사용자가 제공한 `image(20261103-134948).png`의 접힌 리본 W, 세이지·포리스트 면, 금색 점, `Weplace,` 표기를 웹용 벡터로 정리했습니다. 제공 이미지에서 배경을 제거하거나 자동 추적한 결과가 아닙니다. **사용자가 승인한 웹용 재구성**이며 원본 로고와 픽셀 동일성을 주장하지 않습니다.

- 큰 W는 네 면의 부드러운 연결과 제한된 SVG 그라데이션으로 접힘을 표현합니다.
- 헤더에서는 W와 워드마크를 가로로 배치하고 `MARKETING`은 생략했습니다.
- 작은 파비콘은 직선과 면으로 단순화하여 16px에서도 W와 금색 점이 분리됩니다.
- 워드마크의 문자 경로는 프로젝트에 이미 포함된 Pretendard SemiBold에서 생성했습니다. 사진 3의 정확한 원본 글꼴을 추정하거나 새 웹폰트를 추가하지 않았습니다.
- 워드마크 끝의 금색 쉼표는 제공 시안의 둥근 형태를 반영한 별도 벡터입니다.
- OG는 크림·세이지 배경, 기존 메시지 `매장의 변화, 실행과 기록으로.`를 사용합니다. 수치·성과·가격 주장을 추가하지 않았습니다.

## 사용 파일

| 파일 | 규격 | 용도 |
|---|---|---|
| `weplace-logo-light.svg` | 400×90 | 밝은 배경용 가로 로고 |
| `weplace-logo-dark.svg` | 400×90 | 어두운 배경용 가로 로고 |
| `weplace-symbol.svg` | 680×330 | 큰 리본 W+점 |
| `weplace-symbol-flat.svg` | 680×330 | 단색 면 구성의 리본 W+점 |
| `favicon.svg` | 96×96 | 단순화한 W, 크림 바탕 |
| `favicon.ico` | 16·32·48px | 브라우저 favicon |
| `favicon-16.png` / `favicon-32.png` / `favicon-48.png` / `favicon-96.png` | 정사각형 | 용도별 PNG |
| `apple-touch-icon.png` | 180×180 | 홈 화면 아이콘 |
| `og-weplace-r42.jpg` | 1200×630 | 링크 공유 이미지 |

`weplace-logo-*.png`, `weplace-symbol.png`, `apple-touch-icon.svg`, `og-weplace-r42.svg`는 편집·검토·호환용입니다. `brand-board.png`와 `favicon-qa.png`는 검수 자료입니다. 서비스 배포 자산과 생성·검수 파일을 필요에 맞게 구분하여 복사합니다.

## 적용 치수

- 가로 로고 기본 비율은 400:90입니다. 너비 180px일 때 높이 40.5px, 190px일 때 42.75px입니다.
- 헤더는 `<img width="400" height="90" ...>`에 CSS `width:180px; height:auto` 방식으로 적용할 수 있습니다.
- 홈페이지 헤더는 모바일 156px, 359px 이하에서 138px로 적용했습니다. 공통 footer는 420px 이하에서 160px입니다. 사진 1의 메뉴·CTA 공간을 유지합니다.
- SVG는 외부 이미지 파일로 사용하면 내부 gradient ID가 다른 이미지와 충돌하지 않습니다.
- 이미지 `alt="Weplace"` 또는 링크 접근성 이름 `Weplace 처음으로`를 사용합니다. 같은 링크에서 중복해서 읽히지 않도록 조정합니다.

## 색상

| 역할 | 색 |
|---|---|
| Paper | `#F5F0E9` |
| Ink | `#20352D` |
| Forest | `#285247` |
| Sage | `#AAB69E` |
| Gold | `#C8A56B` |
| White | `#FFFDFA` |

SVG 그라데이션은 위 색의 가까운 밝기 변형을 사용합니다. 골드는 작은 본문용 색이 아닙니다. 본문 대비는 페이지 CSS에서 별도 검수해야 합니다.

## 폰트 출처

- 기존 프로젝트 파일: `assets/home-r2/Pretendard-SemiBold.woff2`
- Copyright (c) 2021, Kil Hyung-jin, Reserved Font Name Pretendard.
- 기존 프로젝트의 `assets/home-r2/FONT-LICENSE.txt`를 이 폴더의 `FONT-LICENSE.txt`로 그대로 복사했습니다.
- `font-provenance.json`에 원본 폰트 SHA-256, name table, 경로 생성 방식을 기록했습니다.
- 새 폰트 바이너리를 배포하지 않으며, SVG·OG에는 글자 윤곽선만 포함됩니다.

## 생성과 검수

`build_brand.py`는 원본 폰트의 글자 경로와 수작업 리본 경로로 SVG를 생성합니다. FontTools에서 WOFF2를 읽기 위한 Brotli 해제는 Node.js 내장 zlib을 사용합니다. PNG/JPG는 Sharp로 SVG를 렌더링했고 ICO는 출력 PNG 16·32·48px를 패키징했습니다. 제공된 래스터 참조 이미지를 변형하지 않았습니다.

SVG 재생성은 `python3 build_brand.py /원본/Pretendard-SemiBold.woff2`로 실행합니다. 인자를 생략하면 `assets/brand/r42/` 배치 기준으로 기존 `assets/home-r2/` 폰트를 찾습니다. 생성 도구는 납품 자산을 다시 만드는 오프라인 도구이며 홈페이지 런타임·배포 빌드의 새 의존성이 아닙니다.

실제로 확인한 항목:

- 밝은 바탕·어두운 바탕 가로 로고 시각 확인.
- 180px 너비 헤더 로고의 읽기와 비율 확인.
- 16·32·48·96px 파비콘의 실제 크기 및 확대 비교.
- OG 1200×630의 글자·심벌·여백 및 잘림 확인.
- SVG XML 파싱, 외부 이미지/폰트/스크립트 의존성 없음.
- ICO에 16·32·48px 프레임 포함, PNG/JPG 실제 치수 확인.

홈페이지 헤더와 footer, 모바일 적용은 `../BROWSER_QA.md`와 `../browser/` 증빙을 참고합니다. 브라우저 탭의 실 픽셀 검수는 별도로 표시한 범위에서만 주장합니다.
