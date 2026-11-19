# Weplace / GA4 section exposure R1 (2026-11-19)
## Goal and scope
Prepare main homepage and November FAST R8 for event-based section reach and cumulative foreground visibility milestones. Existing G-FVCYL26FTL stream and G-H9B5F4HRDS homepage stream, privacy opt-in/opt-out, and prior events remain intact.

## Events
- `section_view`: section occupied at least 50% of the visible viewport or its own height for 1,000 ms of *foreground* time, cumulative.
- `section_engaged`: same visible time reached 5,000 or 15,000 ms. `dwell_bucket` is `5s` or `15s`.
- `section_id` identifies only one of the hardcoded section names (top, fast, observed_records, search_surfaces, luwei_scene, experience, work, capabilities, evidence, contact, first_look, beyond_the_ad, action_plan, more_weplace).
- `page_type` is `home` or `november_fast`.
- Events are sent exclusively via existing `window.wpAnalytics.track` and only after visitor explicitly accepted the site's visit analytics policy. No interactions, text inputs, phone, address or precise geolocation sent. At most 3 events per section per page load. No Netlify deploy-preview traffic sent to live GA4.
- These events represent **estimated visual exposure**, NOT attention, reading, unique human visitor identity, or precise dwell duration. Repeated short exposures can cumulatively exceed a threshold. Google may drop some events due to privacy/security/browser policies.

## Required manual GA4 property configuration
No direct permission to create definitions in the user's GA4 admin. In *GA4 > Admin > Data display > Custom definitions*, create two **event-scoped custom dimensions**:
1. Dimension name "화면 구간" / event parameter `section_id`.
2. Dimension name "누적 화면 노출 구간" / event parameter `dwell_bucket`.
Optionally register `page_type` as a third custom dimension if separate page-type filtering is useful. In Explore > Free form choose `Event name`, `화면 구간`, `누적 화면 노출 구간` as rows, `Event count` or `Total users` as values, filter to section_view and section_engaged. The names must match exact snake_case event parameter spelling. GA4 reporting can take up to 48 hours after definitions. This is not retroactive to historical records.
Path exploration may start from page_view but cannot show custom section_id as a standalone node type; use Event name or a free-form exploration with section_id dimension.

## Release status
- Work on separate branch, do not alter existing public consent behavior.
- Release only with browser test proving tag loading after accept, no data before/after reject, event de-duplication, both paths responsive, no query strings/PII.
- External Google property is not accessed; actual Realtime/DebugView receipt needs explicit GA account check by site administrator.
