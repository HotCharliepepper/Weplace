# WEPLACE R4.6 — Customer Path × Mashcore Handoff

2026-11-08 · **Draft/review-only**, not an approved public release.

## Basis and scope
- Source handoff: uploaded `WEPLACE_R45_MASHCORE_HANDOFF_R01_20261108.zip` → `00_START_HERE_WEPLACE.md`, two Mashcore process/journey docs.
- Source code: PR #21 `e3dad9290937af86566e7e398700c9cd9282fb1f`; prior PR #20 `9ed15798e1ef90712ba842a7f873b230a1688cf0`. Current R4.5 hero and its 8-second T0/T3/T8 GSAP script remain unchanged.
- New draft: [PR #23](https://github.com/HotCharliepepper/Weplace/pull/23), [Netlify deploy preview](https://deploy-preview-23--weplace.netlify.app/) (readiness checked separately via Netlify).
- Existing operating `main` and published Netlify deploy were not changed by this task.

## Exact changes
1. `index.html`: add one customer-path layer under existing LuWei Before/After comparison. Before and After tabs still own the exact source image and information changes; the new 3-step text automatically follows the existing `.sample-page.before/.after` state via CSS, no added animation driver.
2. All five `#open-work` tabs now show a specific customer question → relevant information → next action. Still general, non-photographic hospitality examples, not any actual hotel or OTA result.
3. `#explore`: editable prose separates **Mashcore Lab** observation/research and decision criteria from **Weplace** field application/operation. The primary action stays `#request`; the existing Mashcore informational link stays unchanged. No customer data or accounts flow between brands.
4. New `assets/css/main-landing-r46.css` is scoped to `.home-r46`, with mobile stacking at 900/639px and explicit hidden-state styling for stay tabs.
5. New `tests/r46-customer-path.test.cjs` adds structural regression guards. No new public page route, customer asset, video or data collection.

## Editable A/B design
Existing Figma R4.5 frames preserved. New review page:
- [R4.6 A/B Desktop 1440](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=146-3)
- [R4.6 Customer Path Mobile 390](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=146-36)
These are editable information-architecture comparison frames, **not pixel-perfect exported screenshots of the deployed site**. Product Pretendard was unavailable in Figma; text uses Noto Sans KR for design review, while web font remains unchanged.

## Evidence and QA
**Performed:** GitHub files/PRs fetched and compared, Figma source read, editable A/B frames created and screenshots visually inspected. 15 targeted source-level assertions passed: new CSS link once, public path unchanged, identical hero fragment and hero/R2 scripts, five stay flows, single LuWei path, role CTA, scoped state/mobile CSS, preservation of disclaimer/free scope and no unapproved hotel claims. GitHub status for initial implementation commit reported `netlify/weplace/deploy-preview=success`; Netlify showed a ready deploy-preview for the branch. Build-ready is not browser interaction QA.

**Not performed in this environment:** running the entire existing `npm run verify` or `npm run test:r45` suite against the checked-out PR #23 source; executing the newly committed Node tests; real browser interaction on the latest deployed site, 1440/390/320 viewport captures, Safari/Android hardware, screen reader or field INP/CWV. The external site cannot be navigated through the available environment. **These are release/preview review tasks still pending.**

### Suggested verification on local VS Code
```powershell
git fetch origin
git switch draft/weplace-r46-customer-journey-20261108
npm ci
npm run verify
npm run test:r45
py .\START_PREVIEW.py
```
Open `http://127.0.0.1:4173/#changes`; toggle LuWei before/after and observe the 3-step text. Open `#open-work`, select all five tabs with mouse and keyboard. Open `#explore`, check separate roles and `#request` action. Test 1440/390/320px and reduced motion; capture screenshots in `docs/r4-spatial/r46/browser/` only after real browser execution.

## Parallel draft warning
During review, another independently created **[PR #22](https://github.com/HotCharliepepper/Weplace/pull/22)** was discovered. It applies the same handoff to the same sections from PR #21 HEAD with different markup and tests; its Netlify preview is also ready. **PR #22 and PR #23 are alternative solutions, not sequential changes: do not merge both.** Compare actual screenshots and test outcomes, choose one canonical R4.6 PR, and close the redundant draft only after explicit project decision.

## Release boundary
No production deployment, main merge, customer messages, contract/payment, CRM, auth or DB modifications. Existing company/privacy 22 release gates, image publication permissions and case metric limitations remain.
