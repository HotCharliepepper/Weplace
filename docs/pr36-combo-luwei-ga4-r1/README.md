# WEPLACE PR36 Bar + Line × LuWei × GA4 / 2026-11-19

Status: **DRAFT PREVIEW / DO NOT MERGE OR SEND MARKETING UNTIL RELEASE GATES ARE MET**.

## Sources preserved
1. User-supplied monthly sales record for anonymous Restaurant A (unit 100M KRW):
| Year | April | May | June |
|---|---:|---:|---:|
| 2023 | 1.70 | 1.79 | 1.60 |
| 2024 | 1.66 | 1.96 | 1.94 |
| 2025 | 1.91 | 2.02 | 1.70 |
| 2026 | 1.74 | 1.72 | 1.93 |
2. Anonymous Wellness B Naver Place monthly **detail inflow count**: 2026-05 877, 2026-08 2,350. `(2350-877)/877*100=167.96%` ≈ **+168%**. This metric is not unique people, in-store visits, or sales.
3. Restaurant A 2026-05 172,000,000 KRW → June 193,000,000 KRW, delta **21,000,000 KRW (+12.21%)**; different business, period and metric from Wellness B.
4. Visual reference: [WEPLACE Evidence R1 PR #36](https://github.com/HotCharliepepper/Weplace/pull/36) — exactly two bars connected by thin line representing *the same metric*, plus dot/value labels, 0 baseline. Use design structure; do not copy unsupported outcome claims. The four-year selector uses the user's corrected 12 monthly sales values.
5. LuWei visual source: PR #63 (based on PR #55) restores a privacy-cropped exterior, provided Peking duck images and 700 ms pause → green text → food. No person/review UI from original full screenshot. The sequence is a **photo ordering illustration**; not proof of real Naver photo updates or causality.

## Integrated interfaces
- Homepage: +168% annotated first-fold, two independent PR36-style bar+line charts, four-year selectable restaurant data and full 12-value details table, then the LuWei exterior→duck scene, existing FAST/first-look/FLOW/inquiry intact.
- November FAST R8: original contrarian hook, FAST, same two independently labelled charts and four-year table, LuWei scene, existing photo/route/booking demo, 5-step intake, Kakao manual handoff, homepage return. V glyph removal remains.
- Standalone /cases/luwei-first-look/ retained from PR #63. No new photographer/licensing claims.

## GA4 implementation
- User provided new GA4 measurement ID **G-FVCYL26FTL** (property “광고 / 작업10” screenshot showed no received data at the time). Property ownership, collection state and DebugView **are not independently verified by this PR**.
- Homepage previously loaded **G-H9B5F4HRDS** without opt-in; the new implementation gates both that *existing stream* and the requested stream **until visitor clicks analytics consent**.
- On R8 only new G-FVCYL26FTL is configured. gtag.js is not loaded after rejection or before opt-in; no Google Ads personalization/storage is enabled. Any consent choice is browser-local and can be revised via footer setting; revoking an already active consent reloads the page to stop future collection.
- Custom events sent only after opt-in to **G-FVCYL26FTL**: firstlook_select, firstlook_compare, intake_start, intake_complete, message_copy_click, kakao_open_click, evidence_year_select, campaign_view, home_to_campaign/campaign_to_home. Only enumerated categorical properties are forwarded; free-form values and unknown URL parameters are removed. No contact names, store names, phone numbers, inquiry content or PII in event payloads.
- The consent info page at /analytics-info/ is **a review-stage notice, not a complete legally approved privacy policy**. Company must verify data retention, account/stream owner, formal privacy notice and consent practice before release.
- Consent tests mock Google endpoints. A successful test proves *tag installation logic*, not that Analytics received real events. Owner should consent on real site, use Chrome Tag Assistant then GA4 **Realtime/DebugView**. Google states data collection can take up to ~30 minutes to begin.
- Campaign clicks or message copy are **not** verified consultation/contract/payment. No user messages are sent by the app.

## Public release gates and QA
- Original SmartPlace admin screen and sales/POS records of the same metric and periods, plus client authorization to publish even if anonymized.
- LuWei photo usage rights (photographer/owner, intended public site scope).
- Final verified privacy policy/data processing information and GA4 owner/measurement stream. Current site has a privacy email link rather than a full published policy.
- Browser QA 320/360/390/768/1440px, real Korean glyph, numbers/line chart/year selections, LuWei images and state, R8 wizard and return link, analytics no-request before consent/reject + network stub after consent, static no-JS fallback, no PII.
- Main branch/production and payment/CRM/auth/DB unaffected by this Draft PR.
