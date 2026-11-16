# Emotional Hero R2 — QA record

**Date:** 2026-11-10 · **Status:** implementation and review preview ready; limited end-to-end coverage.

## Source and deployed state

| Reference | Confirmed HEAD / URL |
| --- | --- |
| Existing main | `42562ec1a3dedec0e97b4fef1944aef4d84a6a49` |
| Draft PR #20 | `9ed15798e1ef90712ba842a7f873b230a1688cf0` |
| R4.5 PR #21 | `e3dad9290937af86566e7e398700c9cd9282fb1f` |
| Latest inherited work, PR #26 | `d81a032eb56445b532c277a235776a5276f75619` |
| Functional implementation | `f0912465a61fdf291f9fe0a83e00122346e0f0cf` |
| Draft PR | <https://github.com/HotCharliepepper/Weplace/pull/27> |
| Deploy Preview | <https://deploy-preview-27--weplace.netlify.app> |
| Browser-tested immutable deploy | <https://6af2b6f7ffa517bc1dabc109--weplace.netlify.app/> |

The latest follow-up commit contains documentation only. The browser checks below apply to the functional implementation above. PR #20 and #21 are ancestors of #26. Main was not moved and the production site was not deployed by this work.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run verify` | **127 passed, 0 failed, 0 skipped** |
| Local links | **38 HTML files, 1,177 references, 0 local defects** |
| External link checker coverage | 22 external URLs not probed by that checker |
| Review build | Passed; `dist/` generated |
| New tests | Missing GSAP, reduced motion, Save Data, safe UTM forwarding, invalid UTM fallback, same-origin return and code-free CTA |
| Existing tests | Updated four assertions tied to the replaced old hero; retained existing lower-page checks |
| Preserved body | `.hero-evidence` through `</main>` matches #26 byte for byte; SHA-256 recorded in `baseline.json` |
| Production safeguards | Existing 22 company/privacy checks preserved; no bypass |

## Actual browser checks

Used a real Chromium browser. Desktop was checked at the deployed Preview. Narrow layouts used actual browser iframe viewports with the local review build; this is responsive layout coverage, not physical iOS/Android hardware or mobile user-agent coverage. No screen/device performance score is claimed.

| Viewport width | Home horizontal overflow | Message page horizontal overflow | Local fonts |
| ---: | ---: | ---: | --- |
| 320 px | 0 | 0 | Loaded |
| 390 px | 0 | 0 | Loaded |
| 768 px | 0 | 0 | Loaded |
| 1,024 px | 0 | 0 | Loaded |
| 1,440 px | 0 | 0 | Loaded |

Overflow is `max(0, scrollWidth - innerWidth)`. Negative raw values in some captures come from the scrollbar, not clipped content.

| Behavior | Observed result |
| --- | --- |
| GSAP / ScrollTrigger loading | Both report 3.13.0; hero enters `gsap` mode and creates its scoped triggers |
| Entrances and reading pace | Text enters without pin, scrub or automatic scrolling; all story text remains readable after settling |
| Manual “움직임 줄이기” | `reduced` mode; all 10 reveal text nodes opacity 1; hero triggers removed; re-enable works |
| Missing animation libraries | Separate browser fallback copy stays `static`; all 10 text nodes opacity 1; request field remains usable |
| Images | All four WebPs loaded when their relevant sections were visited; unvisited lazy images may remain unloaded |
| Fonts / wrapping | Opening and message page inspected at the widths above; no horizontal overflow or cropped headings observed |
| Existing diagnosis CTA, 390 px | Reaches `#request`; example URL produces request text and “내용이 준비되었습니다. 아직 전송되지 않았습니다.” |
| Message page route | Preview home → message page works; Netlify resolves the `.html` link to its pretty URL |
| Message page return | Returns to the same Preview at `#hero-share`, preserving permitted campaign labels |
| Existing invitation gate | Desktop and narrow-browser navigation reaches `invite.withweplace.kr`; browser back returns to the prior message/home page |
| Mobile invitation input | Numeric 6-digit input shown; empty submission displays “안내받으신 숫자 6자리를 입력해 주세요.” |
| External submission | No message was sent and no valid authentication attempt or live diagnosis submission was performed |

## Coverage limits

- No valid invitation code was available. Authentication success, the post-code diagnosis path and final submission were **not browser-tested**. The existing invitation service was inspected read-only and left unchanged.
- The new links carry UTM values to the invitation gate. Its independent authentication redirect and post-login attribution were **not verified**; this is not a conversion analytics implementation.
- Physical iPhone/Android, Safari, Kakao in-app browser and low-end hardware were **not tested**.
- `prefers-reduced-motion` and Save Data selection were checked in automated DOM tests. The visible reduction control was exercised in the real browser. Low-memory, few-core and slow-network branches are implemented but no physical low-resource performance benchmark was run.
- Existing FLOW/CRM and customer evidence were preserved and regression-tested; no authenticated production walkthrough or real database write was attempted.
- No Lighthouse/Web Vitals score or quantitative conversion improvement is claimed.

## Captures delivered with the review ZIP

| File | Surface |
| --- | --- |
| `desktop-opening.jpg` | Deployed Preview opening |
| `desktop-memory.jpg` | Deployed Preview atmosphere/story scene |
| `desktop-ad.jpg` | Deployed Preview message page |
| `mobile-opening.jpg` | 390 × 844 responsive opening |
| `mobile-memory.jpg` | 390 × 844 responsive atmosphere scene |
| `mobile-share.jpg` | 390 × 844 invitation / diagnosis CTAs |
| `mobile-ad.jpg` | 390 × 844 responsive message page |
| `mobile-invite.jpg` | Existing invitation gate, no code entered |

Mobile images are mechanical viewport crops from the browser captures; they are not design mockups. The ZIP includes the responsive/reduced/static observations and the final verification log. No customer data or invitation secret is included.

## Remaining review

Review the actual reading pace and the transition into existing customer evidence, then test a valid code in the existing invitation service and revisit the main paths on physical mobile devices. Deployment to production and resolution of the pre-existing company/privacy checks remain outside this task.
