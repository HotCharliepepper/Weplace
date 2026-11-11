# R4 source audit and verification boundaries

Date: 2026-11-03 (Asia/Seoul). This audit covers the isolated R4 review branch. It does not approve a production release.

## Baseline

| Source | Verified revision |
| --- | --- |
| main | `42562ec1a3dedec0e97b4fef1944aef4d84a6a49` |
| R2 Draft PR #13 | `06647cb859fa97c3f96f1c3995388262776d8dc6` |
| OS Draft PR #14 | `61594783b08e9ab90aa7153d96c8e5db3d3492a1` |
| R3 Draft PR #15 / R4 parent | `40ae3c903111334ebc1a4b78da9faceaa298c6c8` |
| Published Netlify deploy | `6ad8a7438ddf68ea7482fcd2` |

The parent agent retrieved the live PR/main/deploy metadata. The audit read complete Git objects at the PR15 revision. PR14 and PR15 add design documents, retaining the R2 page implementation. `protected-baseline.json` records complete-byte SHA256 and Git object hashes for 24 protected files.

## Motion ownership to migrate

R2 `main-landing-r2.js` controls motion in three places:

1. `enter()` animates the container and `.chart-line` paths through WAAPI.
2. `initReveals()` observes all eligible `[data-reveal]` nodes, including case cards and public demo containers.
3. `installTabs()` animates each shared panel after the content callback.

For R4, a GSAP-owned node must be excluded from all three legacy routes that could reach it. Scope migration to the Hero, Store C and public FLOW preview. Keep the industry controls, all existing keyboard behavior, manual Kakao request preparation, and separate authenticated FLOW routes working when GSAP is missing or fails.

Use `gsap.matchMedia`/context cleanup, cancel obsolete tab animations, and do not reset a user's selected tab on breakpoint changes. Reduced-motion changes, visibility changes and bfcache restoration must settle the visual state without changing content or focus. The main heading, chart numbers, axes and notes must be present and readable independently of motion.

## Evidence and content contracts

| Item | Required interpretation |
| --- | --- |
| Food business A | May 2026 KRW 172,000,000 → June KRW 193,000,000; +KRW 21,000,000; rounded +12.2% |
| Wellness B | May–August 2026 Place entries 877 / 1,137 / 2,002 / 2,350; rounded +168% May to August |
| Chart geometry | Y baseline 230. A heights 163.4 / 183.35; B heights 66.652 / 86.412 / 152.152 / 178.6. Zero baseline, linear scale and unit labels retained. |
| Attribution | Observed period comparison; contribution of individual work is not isolated. Entries are not unique people, bookings or revenue. |
| Store C | Virtual page composition using one reused photo; not proof of a real renovation, booking availability or increased conversion. |
| FLOW | Public explanatory UI; internal review and customer confirmation remain distinct. No real write, approval, login or permission change. |
| Diagnosis | One store, one public channel and one suggestion. No unverified KRW 300,000 valuation or capacity claim. |
| Kakao | Preparing/copying a request does not submit it. The visitor sends it manually through the existing channel. |

The existing case-detail dialogs contain source tables and limitations. Preserve them; no-JS visitors still need the essential observations and limitations in HTML.

## Asset and design audit

- Keep the existing Ribbon v0.3 SVG files as decorative images. Their shapes do not encode the observed case data.
- Keep BI, favicon and existing image files byte-identical. `example-space.webp` is described in the baseline as a reused Invitation image. Current rights/publication approval is **NEED VERIFY**; the repository's reuse is not proof of permission.
- Bundled Pretendard Regular/SemiBold each occupy approximately 42 KB. Preserve their OFL license. New Korean words require a visual fallback-font check. The attempted Python cmap inspection could not run because the runtime lacks the Brotli WOFF2 decoder; no glyph-coverage claim is made.
- Computed sRGB contrast of proposed R4 tokens: ink `#25312C` / paper `#F5F0E9` = **11.92:1**; trust `#285247` / paper = **7.76:1**; signal `#AE6045` / paper = **4.06:1**; signal / warm white `#FFFDFA` = **4.54:1**; proof `#BB9465` / paper = **2.46:1**. Signal on paper is unsuitable for small normal text; proof stays decorative. Use a darker text token or ink, and do not rely on low-contrast borders or color alone for selected states.

## Release boundary

`companyReleaseIssues()` was actually executed and returned **22 unresolved company/privacy checks**. The production build also requires approved privacy HTML with no draft marker. The existing configuration remains unapproved; no gate values were synthesized. The protected files include legal configuration, the policy, build scripts, Netlify configuration and public/authenticated redirects.

The review build must remain `noindex, nofollow` in HTML and `X-Robots-Tag`; the canonical stays `https://withweplace.kr/`. Preserve the existing production indexing policy and source configuration. The review artifact is not private merely because it is noindex; it must contain only public-safe material.

## Browser verification still required

This is a source audit, not a browser pass. Record actual results independently for:

- 1440 / 1280 / 768 / 390 / 320 CSS-pixel widths, including horizontal overflow and readable chart labels.
- Three signature scenes, rapid repeated tab changes, arrows/Home/End, one selected tab, correct panel labelling, and persistent selection after resize.
- Native reduced-motion and its mid-session change; no-JS; unavailable GSAP; unavailable image; background/foreground and back/forward restoration.
- Visible keyboard focus, skip link, mobile navigation Escape, case-dialog focus restoration, form invalid inputs and clipboard rejection. Use synthetic form data; do not send a message.
- Screen-reader/accessible-tree check, distinguishing a native screen-reader session from DOM semantic inspection.
- LCP/CLS measurements with environment, viewport, CPU/network profile and navigation context. INP needs interaction observations; no interaction means **not measured**, not zero. A local/preview lab sample cannot establish field 75th-percentile compliance.
- Mobile scroll behavior in the available browser; physical Android/iOS checks stay **NOT RUN** unless an actual device was used.

`/insight/` and authenticated editing remain a separate implementation scope per the execution prompt; the R4 page must not imply a working CMS.
