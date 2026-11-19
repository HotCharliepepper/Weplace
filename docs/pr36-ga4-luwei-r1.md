# WEPLACE / PR #36 차트 복원 · 루위 · GA4 · 2026-11-19

## Source of truth
- PR #36 `unified-r3-evidence.html` (PR head `13912a16ef47429b659b0947e712859e1804f1bc`): 0-based **two vertical bars connected by a fine line** for 2026 Restaurant A May/June revenue.
- User-provided corrected 4-6 month observations (100 million KRW):
  - 2023: Apr 1.70, May 1.79, Jun 1.60
  - 2024: Apr 1.66, May 1.96, Jun 1.94
  - 2025: Apr 1.91, May 2.02, Jun 1.70
  - 2026: Apr 1.74, May 1.72, Jun 1.93
- Wellness B Naver Place *detail inflow count* May 2026 877 → August 2026 2,350, +1,473, +168%.
- Restaurant A sales May 2026 KRW 172M → June 2026 KRW 193M, +KRW 21M, +12.2%. **These are different clients and different metrics.**

## UI implemented
- Replaced both PR #64 chart bars with PR #36 inspired 0-origin vertical bar+thin line SVG, with exact printed values, separate clients, units and periods.
- Added 2023–2026 four *4/5/6-month* small line chart panels, explicitly with 1.50–2.10 hundred million KRW y-scale and exact value table. This *non-zero* scale differs from the 0-origin two-bar comparison and is disclosed in the UI.
- Both home and November FAST have the two charts and LuWei exterior → pause → duck composition. The full independent /cases/luwei-first-look/ preview from PR #63 is retained. Images come from previously supplied cropped exterior and dish photos; no unsupported public approval assumed.
- November FAST R8 retains first-look comparisons, multi-step inquiry and return-home CTA. No new paywall, no automated Kakao sending.
- GA4 new user-provided measurement ID `G-FVCYL26FTL` configured in both; main keeps existing `G-H9B5F4HRDS` config. No raw query strings, names, addresses or free-text choices in GA4 custom-event payloads. Page_view can fire on each independent property. This code does not prove actual data ingestion to the GA4 console.

## Before production release
1. Check customer permission to publicly disclose the anonymized Wellness B/Restaurant A performance and LuWei food/exterior images. Being a user-provided figure does not independently prove this permission.
2. Check originals: SmartPlace admin totals, revenue POS for each month, periods and attribution wording.
3. Update/privacy notice and GA4 collection basis/consent requirements for deployed region/site. Confirm the user's new GA4 stream belongs to the intended property and DebugView or realtime shows test page_view/event after release. Check third-party tools or ad blockers do not suppress tag.
4. Run Chrome 360/390/768/1440 and manual iOS Safari / Android Kakao in-app before public launch.

**Status: Draft Preview only. No main merge, external promotional message or live collection claim.**
