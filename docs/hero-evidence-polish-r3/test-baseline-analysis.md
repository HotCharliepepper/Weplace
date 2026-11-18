# Windows 체크아웃 테스트 진단

2026-11-17 / 기준: PR #39 HEAD `4f0d873dece051a6a2282819ba8a2be6fe69752e`.

## 첫 실행의 실패 원인

Windows의 `core.autocrlf=true` 설정으로 기존 `assets/js/unified-r3.js`가 CRLF로 체크아웃됐다. 저장소의 원본 blob은 LF다.

기존 `tests/unified-r3.test.cjs:9`는 JSDOM에서 실행하기 전에 `/^import .*?;\n/`으로 첫 import 문을 제거한다. 이 정규식이 CRLF의 `\r`을 허용하지 않아 import가 남고, `window.eval`에서 `SyntaxError: Cannot use import statement outside a module`이 발생한다.

- `git ls-files --eol`: `i/lf w/crlf assets/js/unified-r3.js`.
- 로컬 파일의 CRLF만 LF로 정규화한 내용은 HEAD blob과 완전히 같다.
- 첫 전체 `npm test`: **166개 중 159개 통과, 7개 실패**. 실패는 모두 기존 `unified-r3.test.cjs`의 같은 원인이다.
- 파일을 수정하지 않은 확인: 해당 JS 읽기만 HEAD blob으로 공급하고 기존 테스트를 실행하면 **8개 모두 통과**한다. 테스트 assertion은 수정하지 않았다.

## 재현과 처리 범위

`node --test tests/unified-r3.test.cjs`로 해당 CRLF 실패를 재현할 수 있다. 초기 전체 출력은 로컬 `test-results/npm-test-crlf-baseline.log`에 기록했다.

독립 작업 폴더의 `assets/js/unified-r3.js`를 HEAD의 원래 LF 바이트로 맞춘 뒤 기존 `npm test` 명령을 실행하면 **165/166개 통과**한다. 남은 `hero-evidence-lab-r1.test.cjs:65`는 두 controller 전체 내용을 비교하므로, 아직 CRLF인 `assets/js/unified-r3-hero-lab.js`와 LF인 원본 사이의 줄바꿈 차이 때문에 실패한다. 두 번째 파일도 CRLF를 LF로 바꾸면 HEAD blob과 완전히 같은 것을 확인했다.

이 처리는 Git 내용 변경이나 기존 페이지의 동작 변경이 아니며, 원래 로컬 프로젝트 파일은 건드리지 않는다. 테스트 assertion도 수정하지 않는다. 최종 전체 테스트 결과는 이 문서의 초기 진단 수치와 별도로 기록한다.

## 최종 해결 및 재검증

별도 작업 폴더의 두 controller를 각각 `git show HEAD:<path>`의 원래 LF 바이트로 맞췄다. 쓰기 전 각 파일에 줄바꿈 이외의 차이가 없음을 확인했으며, 쓰기 후 `git diff --exit-code -- assets/js/unified-r3.js assets/js/unified-r3-hero-lab.js`가 **변경 없음(exit 0)**을 확인했다. 기존 사용자 루트의 파일은 변경하지 않았다.

- 최종 `npm test`: **166/166개 통과, 실패 0** (10.65초).
- 기존 테스트와 assertion 변경 없음.
- 최종 전체 로그: [automated-tests.txt](automated-tests.txt).
