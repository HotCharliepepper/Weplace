# R4.8 — EXPECTATION WINDOW / LUWEI WAIT LAB

**2026-11-08 — Draft review experiment, not an evidence-based fixed threshold.**

## Purpose

The visitor should experience a short, voluntary *anticipation* before the real LuWei menu image is shown, without making repeated comparisons tedious or imitating artificial network loading. Never claim that one duration is the scientific moment just before boredom.

## Evidence informing, not defining, the design

- **Attention and duration:** Block & Gruber (2014), *Time perception, attention, and memory: A selective review*, https://doi.org/10.1016/j.actpsy.2013.11.003 — subjective duration and attention are related; no universal sub-second boredom threshold is established here.
- **Temporal expectation:** Nobre & van Ede (2018), *Anticipated moments: temporal structure in attention*, https://doi.org/10.1038/nrn.2017.141 — predictive cues can structure temporal attention.
- **Interface response:** Nielsen (1993), *Response time limits*, https://www.nngroup.com/articles/response-times-3-important-limits/ — 0.1/1/10s are interface heuristics, **not exact transition points of emotion**.
- **Waiting visual speed:** Ding & Kyung (2025; Journal of Consumer Research 2026 vol. 53), *Optimizing Animation Speed: Convex Effects on Perceived Waiting Time and Digital Customer Experience*, https://doi.org/10.1093/jcr/ucaf037 — moderate-speed animation was associated with a shorter perceived wait in the studied scenarios; this does **not** calibrate a 680ms LuWei reveal.
- **Image readiness:** MDN `HTMLImageElement.decode()`, https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode — actual decode readiness is separable from a decorative pause.

## Implemented rule (hypothesis, not proof)

| State | Time until editorial reveal begins | Followed by |
|---|---:|---|
| First menu reveal, desktop | 680ms | 170ms fade, actual photo decode readiness |
| First menu reveal, mobile under 640px | 560ms | 170ms fade, actual photo decode readiness |
| Return to original exterior | 120ms | 170ms fade |
| Repeat menu reveal | 150ms | 170ms fade |
| Reduced motion, Save-Data, or slow network | No artificial hold | Original R2 image selection |
| Image still not decoded after ~1,250ms | Editorial hold ends | **Truthful loading-state fallback**; source image display restores when actual load finishes |
| Image decode fails | No made-up completion | Error text and a direct exterior return control |

The photo switches only upon a visitor's click/keyboard selection. No automatic scroll pinning, no hidden navigation, no fake percentage, and no numerical sales claim. The 680ms is an initial **design parameter** chosen to stay below the approximate 1s interactive flow heuristic; it is not a neurological fact. Total visible beat may exceed the base duration due to fade or real media readiness.

## How to simulate and compare in the actual Draft Preview

Visit: **https://deploy-preview-23--weplace.netlify.app/?waitlab=1#changes**

In preview or localhost only, a `WAIT LAB` appears above the original LuWei comparison. Select:
- **450ms** — rapid reveal candidate
- **680ms** — recommended exploratory desktop default
- **900ms** — deliberate longer candidate

Switch back to `외관 먼저`, then trigger `메뉴 먼저 보기`. After the actual reveal, choose **`너무 빠름` / `기대 유지` / `조금 느림`**. This checks both insufficient anticipation and excessive delay. These two feedback buttons produce **ephemeral in-browser counts only**, not participant data collection, not analytics, and not scientifically validated questionnaire scores.

An ordinary visitor at `withweplace.kr` cannot open the lab merely by adding a query string. No new public route or customer data infrastructure is created.

## Suggested lightweight study (not yet performed)

1. Recruit about 8–12 representative participants to collect preliminary feedback, not statistically powered generalization. Include owners and potential visitors; record which group each belongs to **outside the prototype** only with appropriate consent.
2. Randomize which duration participants experience first to reduce novelty/order confounds. A first-time impression must not be judged exclusively from repeated toggles by the same person.
3. Ask after the reveal: Did the pause increase curiosity? Did it feel forced? What changed in the photo? Could they still find the next action?
4. Compare perceived impatience/understanding as **subjective observations**, not measured conversion or inferred brain responses.
5. Watch actual mobile and constrained network cases; prefer **shorter** timing when there is ambiguity. Revisit 680ms after real feedback, not before.

## Code and status

- Page: `index.html` (one preview-only lab, one honest image fallback).
- Styles: `assets/css/main-landing-r48.css` scoped to `.home-r48`; existing R4.7 visual stays.
- Controller: `assets/js/main-landing-r48.js` is loaded **instead of** the R4.7 reveal controller to avoid duplicate event owners. Existing `main-landing-r2.js` alone controls actual tab photo/content/ARIA.
- Tests: `tests/r48-anticipation.test.cjs` checks first/repeated reveal, motion reduction, image delay and preview-only feedback. Entire local suite and browser screenshot QA remain to be executed after checkout.
- Existing `main`, PR #21/#22, CRM/FLOW/Auth/DB and production not changed.
- Do not imply that LuWei photography is the same case as independently observed restaurant A revenue.
