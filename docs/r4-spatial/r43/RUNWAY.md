# 선택 영상 명세 — 코드 위에 더할 공간의 빛

현재 히어로는 CSS·HTML·로컬 GSAP로 완성된다. **Runway 생성은 실행하지 않았고 영상은 적용하지 않았다.** 파일명이나 외부 임시 URL을 가정해 삽입하지 않는다.

## 참조 이미지

- [시작 장면 실제 렌더](browser/desktop-scene-0.png)
- [전환 장면 실제 렌더](browser/desktop-scene-1.png)
- [완료 장면 실제 렌더](browser/desktop-scene-2.png)
- [모바일 완료 장면](browser/mobile-scene-2.png)

위 이미지는 구현한 화면의 브라우저 캡처이며 AI 생성 사진이나 실제 매장 사진이 아니다. 영상 제작 시에는 이 이미지의 세이지·아이보리·포리스트 색감과 빛의 방향만 참조한다. 카드·글자·로고는 코드로 유지한다.

## 제작·적용 사양

| 항목 | 명세 |
|---|---|
| 목적 | 히어로 공간의 깊이와 빛의 미세한 이동만 보강 |
| 적용 위치 | `.cinema-viewport` 내부 배경, `.cinema-world` 뒤. 제목·CTA·캡션과 겹치지 않음 |
| 납품 길이 | 8초 무음. 선택 모델의 지원 길이로 생성 후 8초로 편집 |
| 장면 | 0–2초: 왼쪽 위의 부드러운 빛 / 2–5초: 표면을 따라 이동 / 5–8초: 안정된 밝기로 정착 |
| 화면 | 16:9, 1280×720, 24fps 목표. 모바일은 영상 대신 현재 CSS 장면 |
| 납품 | MP4 H.264, 1.2MB 이하 목표, 첫 프레임 WebP 포스터 80KB 이하. 무음·로고·텍스트 없음 |
| 합성 | opacity 0.15–0.25를 실제 화면에서 결정. 전체 문구 대비와 사진·안내의 가독성 우선 |
| 재생 | 첫 진입 1회, `muted playsinline`, 화면 이탈 시 정지. 자동 반복 없음 |
| 폴백 | reduced-motion·데이터 절약·재생 오류·미디어 로딩 실패는 CSS 장면 유지 |
| 적용 전 확인 | 실제 파일 존재, 사용 권한, 길이·용량·코덱, 첫 프레임 플래시, 모바일·접근성·성능 재검수 |

## 생성용 프롬프트

> A calm architectural light study for a warm Korean hospitality brand. A matte sage-green background and an ivory floor, soft sunlight moving slowly from the upper left. Very subtle depth, gentle shadows, tactile paper and plaster surfaces. A locked camera with almost imperceptible forward movement. The composition leaves generous empty space in the center for separately coded interface cards. Begin softly, let the light travel across the surface, then settle into a still composition. Warm neutral exposure, restrained forest-green undertones and a faint muted-gold reflection. No readable text, no letters, no logo, no people, no buildings being advertised, no interface elements, no charts, no flashing, no particles, no cuts, no dramatic zoom, no audio.

기존 저장소의 다른 히어로 영상이 이번 장면용으로 검수되었다고 간주하지 않는다. 영상 제작 여부를 결정해도 이번 코드 장면과 진단 경로는 독립적으로 유지할 수 있다.
