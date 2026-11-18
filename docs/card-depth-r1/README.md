# WEPLACE — Selective Card Depth R1 (2026-11-18)

## 기준
- Reference image: user's LocalScope-style three-card composition, read as **low-contrast hairline border + raised white surface + one deep-green primary card + diffuse floor shadow**.
- Start: PR #42 HEAD `85a4894439bff9c746686132d4e88dad072cf397`.
- Scope is *existing card geometry only*: do not change copy, CTA destinations, service/earnings data, site route semantics, payment, FLOW, auth, CRM, analytics, main, or production deployment.

## Placement (intentionally limited)
1. `/site.html` → nine `.card-grid > a.link-card` destinations. The one `.featured` link is deep green; the remaining eight retain ivory with clearer text contrast in the dark section.
2. `/` → three `#explore .explore-links > a` destinations were simple top-border rows; turn them into interactive cards. Two `.r46-role-grid > div` explanatory cards get *quiet depth*, no misleading hover affordance.
3. `/unified-r3-hero-polish-r3.html` → three `#capabilities .rf-proof-card` destination cards receive depth; the first service card is dark green, with readable white chips.

## Deliberately untouched
- Revenue chart axes and observed metrics, `#hero-evidence`, all proof tables/ledger, comparison simulations, first-look mechanics, diagnosis sheet skew and original shadow.
- No global `a`, `.card`, `button`, or `section` override.
- Motion under 250ms; `prefers-reduced-motion` disables it; keyboard focus ring remains visible.

## QA
- `npm run verify` covers existing scripts and paths and includes `tests/card-depth-r1.test.cjs`.
- `node scripts/qa-card-depth-r1.cjs` checks 360, 390, 768, 1440 widths, three surfaces, card shadows/borders, contrast cue, overflow, destinations, keyboard/reduced motion and collects screenshots.
- Production launch remains blocked by existing company/privacy evidence gate. Verify photo/data/publication rights and real Safari/Kakao devices separately.

## QA finding / safe related fix
The first Chromium sweep had 82 passing card checks but 8 HTTP 404 entries for `/assets/first-look/photos/recognize-{a,b}.webp`: these optional files are absent. The behavior was inherited from the baseline page, not caused by new CSS. Applied the tested opt-in `data-wpfl-photo-pack="ready"` gate from the earlier R3 launch-preflight branch: SVG illustrations remain usable and no unavailable image is requested. Adding real photos later still requires publishing permissions and a complete verified pack. This is a narrowly scoped QA defect fix, not a new feature.
