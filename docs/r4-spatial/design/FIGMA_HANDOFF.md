# Weplace R4 — Figma design handoff

Date: 2026-11-03

## Deliverable

[Editable Figma Design file](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a).

| Page | Main frame | Link | Export |
| --- | --- | --- | --- |
| 00_AS_IS | 9:2 | [Baseline reference](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=9-2) | asis.png |
| 01_TOKENS_DEPTH | 2:41 | [Tokens](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=2-41) | tokens.png |
| 02_DESKTOP_1440 | 3:2 | [Desktop 1440](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=3-2) | desktop.png |
| 03_MOBILE_390 | 4:2 | [Mobile 390](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=4-2) | mobile.png |
| 04_MOTION_STORYBOARDS | 10:2 | [Nine A/B/C scene states](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=10-2) | storyboard.png |
| 04_MOTION_STORYBOARDS | 10:209 | [Mobile/reduced-motion reference](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=10-209) | fallback.png |
| 05_QA_STATES | 11:21 | [QA and state matrix](https://www.figma.com/design/paULgpd0M3t3s4q1SG361a?node-id=11-21) | qa.png |

The desktop and mobile frames retain Hero → service band → Store C → Discovery → Cases → FLOW → Process → diagnosis request → Explore → footer. INSIGHT is an explicitly future-scope component only.

## Core scene mapping

| Scene | Desktop | Mobile | Storyboard A / B / C |
| --- | --- | --- | --- |
| Hero proof | 3:7 | 4:7 | 10:7 / 10:34 / 10:61 |
| Store C | 3:40 | 4:40 | 10:90 / 10:104 / 10:118 |
| FLOW | 3:67 | 4:67 | 10:134 / 10:159 / 10:184 |

Desktop uses a 1,184 px content width, 128 px gutters in the 1,440 px frame, and the original restrained paper/ink/trust/signal palette. The Hero proof is a readable foreground card with two decorative depth planes. Store C separates the original photograph, information and booking explanation into three native plates. FLOW adds compact work/QA/client role plates above the existing dynamic task description and criteria. The role emphasis maps `work → work`, `review → client`, `next → QA`; it does not claim task completion or approval.

## Reusable assets

| Component | Node |
| --- | --- |
| Button, default/hover/focus/disabled/reduced | 11:13 |
| Tab, default/selected/focus | 11:20 |
| Proof Card | 8:27 |
| Browser Mock | 8:40 |
| Flow Step | 8:45 |
| Insight Card | 2:76 |

Local primitive and semantic variable collections, text styles and depth effects are defined. The small-text signal alias is `#984A34`; `#AE6045` remains the large accent/fill. Proof gold is decorative. Use the exact variable IDs and values in `figma-handoff.json` and `figma-state-ledger.json` when extending the system.

## Source and preservation

- R2 baseline: `06647cb859fa97c3f96f1c3995388262776d8dc6`.
- R3 comparison: `40ae3c903111334ebc1a4b78da9faceaa298c6c8`.
- Source FigJam: `QnhjcEPZctjddj7L4wWwGm`; existing board was not overwritten.
- Source photograph: `assets/home-r2/example-space.webp`. Figma uses a lossless PNG format conversion of this same image because the uploaded WebP did not render. The browser retains the original WebP.
- Original Ribbon v0.3 SVGs are editable vector imports.
- A: 172,000,000 → 193,000,000 won, +12.2%; B: 877 → 1,137 → 2,002 → 2,350, +168%. These are observed period values, not isolated causal effects. Place inflow is not visitors, reservations or sales.
- The original inline chart SVG in `index.html` is the implementation authority for geometry, labels and zero baseline. Figma chart layers are a design representation and must not replace the original SVG with a screenshot.
- Manual request creation/copy/Kakao flow remains the baseline. No automatic CRM, live database, authentication or production changes were made by this Figma task.

## Validation and limits

The final desktop contains 236 native descendants, including 148 editable text layers, 22 vectors and one component instance. The final mobile contains 234 descendants, also including 148 editable text layers and 22 vectors. Their only image-filled content is the source photograph. No flattened complete UI raster is used in either design.

Native geometry checks found no visible horizontal overflow in either full-page frame. Final visual review corrected mobile container widths, request CTA width, complete-word heading breaks, imported chart label fonts and missing source-photo rendering. All seven PNG exports decode successfully; dimensions, byte sizes and SHA-256 checksums are in `screenshots-manifest.json`.

**Font limitation:** Pretendard is absent from the connected Figma environment and its load failed. All design text uses the documented Noto Sans KR substitute. The website must retain Pretendard. These editable design references are not a claim of pixel-identical browser capture or font parity.

**AS-IS limitation:** `00_AS_IS` is a native reconstructed structural reference with provenance, not an automatic capture of the R2 website.

**Motion limitation:** Nine static A/B/C keyframes and mobile/reduced references communicate intent. Runtime GSAP timing, keyboard behavior, responsive flow, performance and SEO require the implementation's browser QA evidence. The Figma task does not certify those runtime results.

## Handoff files

`figma-handoff.json` is the primary machine-readable manifest. `figma-state-ledger.json` records creation/mutation results. `screenshots-manifest.json` verifies the seven PNG exports. The PNGs are Figma screen exports, distinct from actual browser screenshots collected by implementation QA.
