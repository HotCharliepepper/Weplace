# WEPLACE R4.11 — CUSTOMER DECISION PATH × Field Research Transfer

Updated 2026-11-09. The source for this change is the 2026-10-26 **an internal 24-page restaurant-group review proposal**, which is a **proposal / hypothetical design example**, not a confirmed client case or published research result. Only cross-client design principles were reused. No proposal prices, confidential operations, contract decisions or client-specific photos are reproduced in the public website.

## Baseline / boundaries

- Based exactly on PR #24 R4.10 HEAD `0095a37852d5c69186a36be1f11274976bb61494`.
- Keep all hero / +2,100만 원 evidence disclosures, 680ms LuWei reveal, client photos, separate actual metrics, 0원 diagnosis, FLOW/CRM/auth/DB and legal production release gate unchanged.
- New R4.11 section is inserted **after the complete #changes section** and **before #discovery**, with no need to renumber the existing 01–05 navigation or add new public URLs.
- The new section contains **visitor decision examples**, not observed behavior or guaranteed increase in reservations.

## Evidence from the 2026-10-26 proposal and applied design

| Original review pages | Transferable method | Weplace presentation |
|---|---|---|
| 03–04 | 발견 → 비교 → 판단 → 방문; photo is attention, info is decision | 4 keyboard-operable customer-question tabs, with one concrete question, necessary facts and meaningful next link per step |
| 05–06 / 09–11 | Distinguish purpose, menu, people/space, parking, reservation and settlement; don't assert unverified operating conditions | 'Compare' and 'Decide' screens list information to **verify**, not prefilled client facts |
| 16–17 | Website is a source for confirmed public facts; Naver / Google / local team have distinct jobs | Four channel role rows, plus who verified/when/channel-updated statement |
| 18 / 21–22 | Separate effective inquiries, booking confirmation, actual visit; define baseline/cohort and 30/60/90-day review | Three metric categories, **no numeric fabricated KPI** and no causal performance claim |
| 19–20 | Make executable and approvable content, not only attractive sample design | Direct in-page links to existing #changes, #discovery, #request and #flow |

This R4.11 application does NOT state that any particular client or store signed a contract, recorded an increase, or implemented these changes. No unverified menu, room, parking or booking facts are published.

## Files

- `index.html`: one new `#decision-path` section with a progressive four-stage experience, a channel fact rail, and a separately defined inquiry/confirmation/visit measurement rail.
- `assets/css/main-landing-r411.css`: modern editorial green/gold/cream styling consistent with R4.10; responsive 1440/1024/768/390/320 layouts, visible keyboard focus, reduce-motion safeguards.
- `assets/js/main-landing-r411.js`: <2KB JS, 4 accessible tabs, Arrow/Home/End support, 0 network/storage calls. With JS absent, all four stage texts remain visible and buttons are hidden.
- `tests/r411-customer-decision.test.cjs`: source ordering, no-JS progressive fallback, keyboard/focus/one active stage, no client leaks/fabricated metrics and mobile CSS checks.

## UX intention

The visitor feels the difference from R4.10's cinematic opening in these steps:

1. R4.10 symbolic gold path, evidence and real LuWei photo reveal remain visually strong.
2. A new **small, participatory explanation** asks the visitor to choose discovery/comparison/decision/visit, rather than read a long generic Weplace services paragraph.
3. The visitor can see that one verified piece of information is maintained across real channels and why inquiries, confirmed reservations and actual visits are not the same metric.
4. Existing #discovery / #cases / #flow / #request prove execution and suggest a bounded free first-screen check.

Avoid overstating psychological effect: this journey is a proposed lens, not data about all restaurant customers.

## QA and release criteria

- Build: `npm ci; npm test; npm run build`.
- Browser: with build served locally, run `$env:R45_BASE_URL="http://127.0.0.1:4176"; npm run test:r45`, then verify new R4.11 panels at 1440/390/320 with mouse/keyboard/JS disabled/reduced motion and no horizontal overflow.
- New source and syntax checks can pass without rendered/interactive browser proof; don't claim full browser pass unless actually run.
- Verify that 2023–2025 missing revenue figures are **not** fabricated in any UI. The existing 2026 comparison remains separate from LuWei photography.
- Preserve company-info/privacy 22-issue production release block and image-rights review. Publish **Draft Netlify Preview only**. No main merge, operational deploy, account/DB/auth/CRM mutation, outside customer contact or payment.
