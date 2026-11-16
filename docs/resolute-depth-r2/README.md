# WEPLACE — RESOLUTE / DEPTH R2

**2026-11-11 · Draft-only comparison route**: \`/resolute-depth.html\`.

## Source and preservation

- Base: Draft PR #30 \`draft/weplace-fast-motion-a-20261111\`, commit \`3f07d0c7be8a1264db2246491c506c9ab170f286\`.
- New isolated branch: \`draft/weplace-resolute-depth-r2-20261111\`.
- Comparison: original \`/resolute.html\` (A) vs new \`/resolute-depth.html\` (Depth R2).
- No edits to \`/\`, \`/resolute.html\`, ads, \`/go/\`, \`/ad-funnel.html\`, existing FLOW, CRM, authentication, pricing, database, production release gates or original GSAP/Audio.
- **No main merge, production deploy, real consultation submission, booking or payment.**

## 1. Hero: depth that means something

\`RESOLUTE IT FAST.\` stays unchanged. FAST A's approximately 480ms accelerated/rightward motion and optional Web Audio stay owned by the existing scripts.

The new scene borrows the **sense of a short forward rush** from the earlier Mashcore universe research, **not its dark brand identity**: 2 shallow orbit lines, 3 finite motion rays, a directional underline and a light afterimage above a grounded entry image.

**Main image changed** from \`/assets/hero-r2/room.webp\` to the existing local reference photo \`/img/weplace-hero-surface.jpg\`. It depicts an entrance and the step from discovery to visit; it is explicitly a reference image, not a client site or field result. The photo is available on the source PR #30. No external image host or new photo license was introduced.

The image card keeps a dark-green accent, while the page remains editorial cream and sage. No WebGL/Three.js/Spline, fullscreen movie, looping particles, autoplay sound, visual text baked into images, forced scroll, pin or snap.

## 2. Section-headline hierarchy (semantic as well as optical)

| Section | Single idea | Visual emphasis |
|---|---|---|
| Hero | \`손님이 멈추는 화면부터.\` | FAST arrests motion; the threshold image shows the real-world next step |
| \`#experience\` | \`어느 화면을 먼저 바꿔볼까요?\` | \`먼저\` receives a quiet underline/colour cue; real before/after controls remain |
| \`#work\` | \`보여주고 → 정리하고 → 실행합니다\` | darkening colour weight across existing diagonal scroll phrases; three proof cards unchanged |
| \`#contact\` | \`우리 매장은 어디에서 멈출까요?\` | gradient emphasis solely on the question's final verb; same no-submit inquiry dialog |

No extra explanatory paragraphs were added to the main route.

## 3. Where the colour gradients belong

- Hero → experience: cream to pale sage (**smooth**, no distracting hard edge).
- Experience → Work: lighter sage to deeper sage (**confidence** after choice).
- Work → Contact: green sage to warmer paper (**reassurance** before direct inquiry).
- Contact → Footer: intentional dark-green stop (**closure**, not gradient everywhere).

Gradients are static CSS backgrounds; there is no scroll-bound expensive filter or background-position animation.

## 4. Motion policy / graceful degradation

- The standalone \`resolute-depth-r2.js\` animates **only the new decorative lines**, 0.1–0.8s and then completely stops. It does not tween the existing FAST A headline letters or duplicate audio.
- The existing FAST replay button can replay decorative motion if motion is permitted.
- No sound source is added. Audio is user-opt-in and remains entirely with FAST A.
- \`prefers-reduced-motion: reduce\`, manual motion OFF, Save Data / 2G, hidden tab and missing GSAP retain a readable static screen. Rays remain hidden when reduced motion is active.
- \`aria-hidden\` on decorative lines; one meaningful H1; no user text or personal data added to URL/analytics/storage.

## Local QA

\`\`\`powershell
git fetch origin
git switch -c study/resolute-depth-r2 origin/draft/weplace-resolute-depth-r2-20261111
npm ci
npm run verify
py -3 -m http.server 4173 --directory dist
\`\`\`

In a **second terminal**:

\`\`\`powershell
node scripts/qa-resolute-depth-r2.cjs
\`\`\`

Open \`http://127.0.0.1:4173/resolute-depth.html\` to compare against \`/resolute.html\`.

## Remaining manual checks before any customer release

1. iPhone Safari and Android Chrome, including low-power settings and real inertial scrolling.
2. Kakao in-app browser and external link navigation; no paid click campaign before review.
3. Physical audio (FAST A only), screen-reader focus and contrast.
4. Verify all previous route links, case evidence and the no-submit inquiry wording.
5. Confirm company/privacy release gates and expressly authorize any production merge/deployment.

Do not label test previews, draft design images or 0원 request composition as confirmed customer work.
