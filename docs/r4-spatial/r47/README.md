# R4.6 visual iteration — DARK MOMENTUM × MANUAL LUWEI REVEAL

Review-only update in [Draft PR #23](https://github.com/HotCharliepepper/Weplace/pull/23). Latest source and deploy must be compared by exact HEAD; the original R4.5 and parallel R4.6 [Draft PR #22](https://github.com/HotCharliepepper/Weplace/pull/22) remain separate.

## User feedback addressed
A first-time visitor could not perceive a meaningful difference between #22 and #23, and the previously explored green upward-motion idea had not been integrated into the main page. The LuWei comparison also began on the attractive menu image, leaving no contrast to discover.

## Changes committed
1. `#intro`: dark-forest full-width hero field and a large gold symbolic ascending path / arrow. The rise is **not an actual chart or performance forecast**, has no amounts, axes or growth guarantees; observed revenue numbers remain in the separate unchanged evidence chart below. The existing R4.5 hero and its single GSAP eight-second T0/T3/T8 control are preserved. The new visual stroke uses CSS animation only while the existing `data-playing` is true; mobile and reduced motion show a legible static endpoint.
2. `#changes`: initial state is the original provided LuWei exterior crop, selected tab **외관 먼저**. An explicit button **메뉴 먼저 보기** and existing tabs allow voluntary Before/After comparison. On selection, a dark approximately 560ms editorial pause covers the *image region only*, then the provided sharp Peking-duck photo appears. Reverse comparison uses about 350ms pause. This is deliberately **not** a fake download-progress indicator and is not triggered by scrolling.
3. `#changes`: existing R2 tab handler remains sole owner of the photo, responsive candidates, aria state, copy and booking example. R4.6 customer question → information → action panels remain synchronized by sibling state selectors. New R4.7 JS only owns the decorative curtain and replay button, with last-intent-wins cleanup. No auto-scroll or auto-change.
4. All earlier `#open-work` and `#explore` changes stay. FLOW/CRM, bookings, source cases, pricing scope and customer data untouched.
5. Source changes: `index.html`, new `assets/css/main-landing-r47.css` + `assets/js/main-landing-r47.js`, `tests/main-r42.test.cjs` legacy regression adapted to the now-intentional Before default, and new `tests/r47-momentum-reveal.test.cjs`.

## Safety and accessibility
- A dark visual beat is triggered only after a click/keyboard choice; no forced scroll or fake network loading.
- Honors prefers-reduced-motion and Save-Data for the cinematic pause.
- Initial H1, CTA, static text and accessible comparison remain available without scripts. SVG has aria-hidden; existing verified case results are independent.
- Do not present original exterior screenshot as artificially blurred or claim picture selection alone raised sales.
- Earlier 95/95 Node and 58/58 Playwright were user-reported for the **prior** PR #23 version; this visual update has **not** yet been locally re-run through those suites. Netlify status success and ready preview mean the review artifact built, not that browser interactions were validated.
- Desktop and mobile actual render screenshots are not yet captured from the latest code in this execution environment. Confirm visual layout at 1440, 390 and 320px before selecting a canonical draft.

## Local validation in VS Code

```powershell
git status --short
git fetch origin
git switch --detach origin/draft/weplace-r46-customer-journey-20261108
npm ci
npm run verify
py .\START_PREVIEW.py --port 4175
```

In a second PowerShell terminal:
```powershell
$env:R45_BASE_URL = "http://127.0.0.1:4175"
npm run test:r45
```

Inspect `http://127.0.0.1:4175/?scene=0` and `#changes`; try mouse, keyboard left/right/Home/End, motion reduction, repeated fast toggles, mobile 390/320. Do not merge both PR #22 and #23. Do not merge to main, deploy production, send customer communications or change live data without approval.
