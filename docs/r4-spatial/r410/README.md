# R4.10 — First Sight / Automatic LuWei Reveal

2026-11-08 · Draft Preview for Weplace. Source: PR #24 (`draft/weplace-r49-premium-path-680-20261108`). Preserve PR #20–#23 and deployed `main`.

## User change

A casual visitor arriving at **01 / 바꾸는 일을 먼저 보여드립니다** should experience a clear difference without needing to discover the tabs:

`real LuWei exterior → brief exterior recognition → full-screen dark editorial beat (~0.68s) → real sharp Peking-duck image`.

This is a visual transition that feels like a short pause, **not** an actual network loading animation, sales-performance animation or a 700ms forced scroll lock.

## Actual implementation

- **First entry only:** an IntersectionObserver observes the original LuWei photo. Once at least 58% is visible in the viewport, it waits **360ms** to let the existing exterior be noticed, then activates the original accessible **메뉴 먼저** tab. R2 still owns the genuine photograph and text/ARIA changes.
- **Dark full-screen beat:** R48's established 680ms first reveal (and 170ms fade) drives an aria-hidden decorative veil. Fine grid, gold signal line and `BEFORE → AFTER` explain the transition. No fake load percentage, network requests or scroll interception.
- **Actual source loading:** R48 checks `HTMLImageElement.decode`, handles real load/error, and shows an honest waiting/failure fallback rather than claiming an image is ready.
- **Skip if fast scrolling:** the 360ms checkpoint tests the actual photo position. It does not black out the viewport after the person has already passed the section.
- **User overrides:** pointer/touch, keyboard or a direct tab/switch click cancels pending auto entry. Existing replay/reverse actions continue with shorter durations; no second auto replay.
- **Accessibility:** No-JS leaves the exterior and accessible static comparison; reduced motion, Save Data, slow connections or missing IntersectionObserver do **not** schedule the automatic beat. Screen reader status is already provided by the existing R48 live region. No focus steal, preventDefault, scroll pin, analytics, new URL or form writes.

## Observations from the user's Windows Playwright log

The attached second-terminal log showed **52 passed, 6 failed, 2 skipped** in the earlier R4.9 browser suite. All six failures concerned the **hero image expected to be the W vector** but the local server at `127.0.0.1:4176` still returned the old LuWei duck hero. The GitHub R4.9 source already used the W vector. Most likely the local `dist/` was not rebuilt after updating the worktree. This is a grounded diagnosis of an older artifact; it is **not proof** that the new R4.10 tests pass.

Rebuild the exact latest PR #24 commit and restart the local file server, without editing tests to accept old content.

## VS Code Windows verification

Terminal 1 (from existing `weplace-r49-review` working tree):

```powershell
git status --short
git fetch origin
git switch --detach origin/draft/weplace-r49-premium-path-680-20261108
npm test
py scripts/check-links.py
npm run build
Test-Path .\dist\index.html
py .\START_PREVIEW.py --port 4176
```

Before running `npm run build`, stop the previous `START_PREVIEW.py` server with Ctrl+C if still running. `git switch` must not discard local edits; if there is a conflict, preserve the changes first. A successful preview serves `http://127.0.0.1:4176`. Force-refresh the browser if necessary.

Terminal 2:

```powershell
cd $HOME\weplace-r49-review
$env:R45_BASE_URL = 'http://127.0.0.1:4176'
npm run test:r45

$env:R410_BASE_URL = 'http://127.0.0.1:4176'
node scripts/capture-r410.cjs
```

The additional R4.10 Node test checks entry, one-shot behavior, manual cancellation, reduced motion and lack of writes. The browser suite now contains dedicated entry and reduced-motion cases for both desktop and mobile. Read-only screenshots of the full dark transition and revealed image are written to `docs/r4-spatial/r410/browser/` **only after actual execution**. The capture tool explicitly rejects stale `dist` that still contains the old hero photo.

## Acceptance requirements

- **1440 / 390 / 320**: dark transition clearly visible on first genuine arrival, 680ms editorial hold plus 170ms opacity exit, no cover clipped or text overflow; real menu photo appears once decoded.
- Original before/after photograph and tab states still exactly match the supplied client photos. No modified saturation/blur falsely presented as a result.
- Keyboard users can choose before/after; reduced-motion visitors retain immediate manual control with no surprise full-screen blackout.
- Re-entering the section does not auto-play again; after a rapid scroll past or explicit user choice no surprise blackout occurs.
- H1 + CTA available from initial render, R4.5 finite hero, actual case metrics and 0원 one-shop/one-channel/one-improvement scope remain.
- Full `npm test`, `npm run test:r45`, link integrity, mobile captures and actual browser page QA still need **latest HEAD** verification; do not transfer older passed counts to this commit.

## Publishing

Deploy Preview is allowed, but **production is blocked** by the existing company and privacy release configuration (22 business/privacy gates with no approval) and requires verifying actual customer asset rights. Do not override approval flags. No merge to main, live payment, messages, FLOW, auth, CRM or DB actions until separately approved and verified.
