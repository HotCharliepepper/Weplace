# WEPLACE R4.9 — Premium Momentum / 680ms Release Candidate

Status: **Draft Preview only**. Source branch: `draft/weplace-r49-premium-path-680-20261108`, based on PR #23 HEAD `fbf5100fbc405d79c459c5fb272d3a78ab44587e`. Existing PR #21, #22, #23, main and production remain unchanged.

## User decision / design thesis

The first intentional exterior→menu reveal is **680ms on both desktop and mobile**, plus a short 170ms fade. Repeat comparisons remain short. This is a **chosen interaction design value**, not an experimentally established boredom threshold.

The top hero and LuWei case have different jobs:
- **First fold:** independent dark forest + gold *symbolic* ascent, a subtle existing Weplace W vector, strong H1 and unchanged 0원 first-diagnosis CTA. No duck photograph or inferred revenue gain; scene controls preserve the existing finite eight-second T0/T3/T8 logic.
- **01 / changes:** original LuWei exterior is the initial image. A visitor intentionally selects `메뉴 먼저 보기`; after the short dark editorial pause, the existing original Peking-duck photo is first shown, with verified-condition and non-causality disclaimers. This is not an artificial network spinner.
- **After fold:** actual anonymous restaurant A and wellness B observations are separate sources, not an effect claim from LuWei photos. The OPEN WORK hotel example remains non-photographic until owner and room-matching rights are proven.

## Files and ownership

| Path | Scope |
|---|---|
| `index.html` | Swap only #hero-photo content to existing Weplace vector, revise hero microcopy, add `home-r49` and CSS; keep #changes true before state |
| `assets/css/main-landing-r49.css` | Full-fold dark forest, fine grid, gold rising route, premium typography, responsive and reduced-motion styles, the changes/open-work visual rhythm |
| `assets/js/main-landing-r45.js` | 8-second scene captions only; duration and timeline semantics preserved |
| `assets/js/main-landing-r48.js` | First menu reveal locked to 680ms on all viewports. Existing real-media decode/failure logic and reduced-motion exceptions preserved |
| `tests/browser/r45.spec.cjs` | Update previous food-hero image expectation to brand vector and corresponding delay/failure fixtures |
| `tests/r49-premium-landing.test.cjs` | Structural/regression assertions for hero separation and same 680ms on mobile and desktop |
| `scripts/capture-r49.cjs` | Read-only browser screenshots at 1440, 390, 320 of hero, exterior and revealed menu |

The earlier WAIT LAB remains **hidden except on localhost/Netlify Preview with explicit `?waitlab=1`**; no new live URL, user tracking or booking is added. It's a QA experiment, not a public product feature.

## Actual environment verification

- [GitHub Draft PR](https://github.com/HotCharliepepper/Weplace/pull/24)
- [Netlify Deploy Preview](https://deploy-preview-24--weplace.netlify.app/): judge the *actual READY deploy* against current PR head; a ready build is not a completed user-flow QA.
- [R4.9 only (from PR #23)](https://github.com/HotCharliepepper/Weplace/compare/fbf5100fbc405d79c459c5fb272d3a78ab44587e...draft/weplace-r49-premium-path-680-20261108)

### Run locally on Windows VS Code

Do **not** switch over unsaved work. Use `git worktree` if keeping PR #23 open:

```powershell
git fetch origin
git worktree add ../weplace-r49-review origin/draft/weplace-r49-premium-path-680-20261108
cd ../weplace-r49-review
npm ci
npm test
py scripts/check-links.py
npm run build
py .\START_PREVIEW.py --port 4176
```

In **a second terminal** while 4176 serves the build:

```powershell
cd $HOME\weplace-r49-review
$env:R45_BASE_URL = "http://127.0.0.1:4176"
npm run test:r45
$env:R49_BASE_URL = "http://127.0.0.1:4176"
node scripts/capture-r49.cjs
```

Screenshots and summary are written to `docs/r4-spatial/r49/browser/`. Only after they exist may they be called actual PC/mobile captures. Review the actual image composition, not just dimensions and zero overflow.

### Visual & functional acceptance

- **Desktop 1440/1280, tablet 768/1024, mobile 430/390/360/320**: visible H1, CTA before motion, no overlap with vector arrow/labels, no horizontal clipping; image/source note small but readable.
- Keyboard: T0/T3/T8 tabs, stop/replay, LuWei Before/After and dedicated switch button, focus visibility; no automatic scroll lock.
- First menu reveal 680ms editorial hold on every viewport + short fade; repeat menu 150ms and exterior 120ms; reduced motion, Save Data and genuinely delayed/missing media provide immediate/honest alternatives.
- Unchanged: source JPEG/WebP bytes, actual results and disclosed time frames, anonymous restaurant A vs LuWei data separation, free scope 0원/1 shop/1 public channel/1 improvement, other content, FLOW, CRM/auth/data.
- Verify no user input is sent, tracked or written through the preview.

### Release decision / blocker

**Production build is currently blocked by design.** The checked `config/company-info.json` is `publicationState:"review"` with 7 non-confirmed fields plus missing overall approval; `config/privacy-release.json` is `publicationState:"draft"` with 13 false verification fields plus missing approval. That is **22 company/privacy release issues** enforced by `scripts/company-info.mjs`. The production HTML privacy markup must also be explicitly approved, and original image public-use rights verified. **Do not "fix" by setting flags true without original records and authorized approval.**

For a real release: finish responsive + Playwright QA → collect verified business information/approved privacy policy and image permissions → have owner authorize **this exact commit** → run release build and approval review → only then merge and trigger production. No merge, operational deployment, payment, CRM/DB/auth changes or external communication was authorized in this draft task.
