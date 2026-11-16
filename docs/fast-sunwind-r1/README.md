# WEPLACE — FAST SUNWIND R1 | Optical Hero Study

2026-11-16. **Standalone Draft-only** visual experiment for the \`RESOLUTE IT FAST.\` section. This does not replace the current chart landing, R3, home, FLOW, ads or release gates.

## Baseline

- User's local handoff: PR #32 ZIP snapshot \`fa5e4cff894fdd115311fa0f8a4f79a1fd7782c3\` (**no .git**, localhost:5320).
- This branch starts from the same exact PR #32 HEAD and adds the independent route \`/unified-r3-sunwind.html\`.
- Compare the new route side by side with \`/unified-r3.html\`. The old page and controllers remain byte-identical. GitHub/Netlify production not altered.

## Design intent

**Light at 1 o'clock → weight on the letters → fast leftward afterimage → static sunlight.**

The letters are an **invisible optical glass sculpture**: a shallow bright top-right rim, finite diagonal reflection, natural left-bottom shadow. The afterimage means a sudden step to the right, with traces of the previous position left behind. A breeze-like streak crosses the composition when FAST accelerates; there is no endless idle animation.

The sunlight/air/pressure suggests active work and persistence, but does not label customers by gender or promise business results. Keep the image and the next CTA grounded in actual store visits rather than turning this into a science-fiction game.

### Why the letter resolution is sharper

No rendered lettering in an image, canvas, SVG outline or video. \`RESOLUTE IT FAST.\` remains accessible HTML text rendered at the browser's native display resolution; responsive font scaling preserves sharp edges. Background uses CSS gradients and 1px vector-like lines. Existing reference photography remains an image, not an upscaled 4K original; it should not be represented as newly generated high-resolution photographic material.

## Implementation

| Source | Ownership |
|---|---|
| \`unified-r3-sunwind.html\` | Copy of R3 + new scoped body class, decorative HTML, CSS/JS links |
| \`assets/css/fast-sunwind-r1.css\` | All 1 o'clock lighting, tiny text shadow, glass corners, responsive layout, finite wind keyframes |
| \`assets/js/fast-sunwind-r1.js\` | Watches the **existing** \`.rf-fast[data-fast-state]\` and starts/clears only decorative effects |
| \`assets/js/unified-r3.js\` | **Unchanged** existing GSAP movement, optional Web Audio, scroll and customer controls |
| \`tests/fast-sunwind-r1.test.cjs\` | Structural and nontracking regression |
| \`scripts/qa-fast-sunwind-r1.cjs\` | Real Chromium viewport / interactions / QA screenshots |

## User-facing experience

1. Chart first: preserve the observed \`1.72억 → 1.93억\` plot and cautions exactly as the base R3.
2. FAST as its own full-viewport scene on desktop: warm ivory and sun from upper-right; subtle crystalline box cues and shadows behind live type.
3. When original FAST advances, new wind/ray layers animate once (under one second), then settle and stay quiet.
4. Same "직접 바꿔보기", photo/route/booking and 0원 진단 inquiry, preserved existing sound button (off by default).
5. Mobile: one readable column, shorter text depth, smaller wind layer; no forced scroll, pin, or pointer-follow tricks.
6. No JS or GSAP / reduced-motion / Save Data: static legible heading and existing links. No extra network services, tracking, personal information or writes.

## Review & QA

\`\`\`powershell
npm ci
npm run verify
py -3 -m http.server 4173 --directory dist
# another terminal
node scripts/qa-fast-sunwind-r1.cjs
\`\`\`

Capture at 390 and 1440. Automatic review covers 360,390,430,768,1280,1440, title crop, chart, photo, choices, inquiry dialog, sound default, wind replay, reduced-motion, console failures, missing assets and HTTP writes.

**Not checked by browser emulation:** actual iPhone Safari / Android Chrome / Kakao in-app GPU/compositing, battery, sound pressure, low-power mode and human visual comfort.

## Deliberately excluded

- No Three.js, Spline, WebGL, Runway video, new sound, payment, price, analytics tag, enrollment, CRM write or live publication.
- No main branch merge; no production deploy.
- New route includes \`noindex,nofollow\` as in source R3. Reviewed customer claims and company/privacy gates from PR #32 still apply.
