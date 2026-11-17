# Emotional Hero R2 — review handoff

2026-11-10 · Draft PR [#27](https://github.com/HotCharliepepper/Weplace/pull/27)

- Preview: <https://deploy-preview-27--weplace.netlify.app>
- Branch: `draft/weplace-emotional-hero-r2-20261110`
- Implemented and browser-checked commit: `f0912465a61fdf291f9fe0a83e00122346e0f0cf`
- Baseline: PR #26 `d81a032eb56445b532c277a235776a5276f75619`, including PR #20 and R4.5 PR #21 history. Compare this work against #26; the PR against main includes the earlier unmerged work.
- [QA record](QA.md) · [baseline record](baseline.json) · [font provenance](font-provenance.json)

## Visitor experience

The opening retains “광고 기획사. / 촬영 스튜디오. / 컨설팅 파트너. / 그게 전부는 아닙니다.” It moves through finding a space, staying comfortably, remembering the experience and sharing it with others. Cream, sage and forest green support three unpinned scenes. Text enters over 1.45 seconds with a 0.48/0.34 second stagger; there is no autoplay loop, scroll lock or forced wait.

Local GSAP and ScrollTrigger 3.13.0 are reused. Without animation support, the HTML and links remain visible. Reduced motion, the visible motion control, Save Data and conservative low-resource checks select static text. The new controller cleans up its own animation state without replacing the existing lower-page interactions.

## Paths

| Visitor intent | Destination |
| --- | --- |
| 받은 초대장 열기 | Existing `https://invite.withweplace.kr/` code gate |
| 우리 매장 첫 화면 살펴보기 | Existing `#request` diagnosis/request composer |
| 첫 화면의 이야기 | New optional `/ad-message.html` |
| Return from the message page | Same-origin `/#hero-share` |
| Code-free diagnosis from the message page | Same-origin `/#request` |

Only `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` values matching `[A-Za-z0-9_-]{1,80}` propagate. Incoming values override default campaign labels. Other query parameters are excluded. This adds no tracking requests, cookies, storage or conversion attribution. UTM arrival at the invitation gate is supported; persistence after its independent authentication redirect is not implemented or verified.

## Scope and preservation

`index.html` retains the existing markup from `.hero-evidence` through the end of `main` byte for byte. First Look, the comparison activity, customer evidence, FLOW links and the request composer remain in place. `_redirects`, the existing `main-landing-r2.js`, `my-store/index.html`, and company/privacy configuration are unchanged from #26. No live database, authentication, invitation repository or production setting was modified.

The supplied ZIP's four WebPs are atmosphere references, explicitly separate from customer evidence. Local Korean font subsets and their license/provenance are included. When changing hero copy, check new glyph coverage and regenerate the subsets if needed.

## Run and review

```sh
npm ci
npm run verify
```

Node.js 20+ is required for source builds. `verify` runs the tests, local link checks and the review build in `dist/`. Serve that directory at a local HTTP origin; opening HTML directly from the filesystem is not supported because the existing site uses root-relative paths. The delivered ZIP also includes a built `site/` and a Python 3 preview launcher.

The build retains the existing company/privacy production guards (22 open checks). This work provides a review build and Deploy Preview; it does not authorize main merge or production publication.

The next review is the reading pace and copy on the Preview, followed by an authorized valid-code test and physical mobile-device checks. Those unperformed checks are listed explicitly in QA.md.
