# WEPLACE / Hero Polish R2 — launch-review handoff
2026-11-17, Draft-only visual treatment. Current base: [PR #37](https://github.com/HotCharliepepper/Weplace/pull/37) HEAD \`0f1f356e2ff552f29e36f576ec0ad5a427b17a14\`.

## Scope / source of truth
- New route \`/unified-r3-hero-polish.html\`. Old \`/unified-r3-hero-lab.html\`, \`/unified-r3-evidence.html\`, \`/\`, FLOW, CRM, auth, pricing, GA4, approvals and all original scripts are preserved.
- New CSS \`assets/css/hero-polish-r2.css\`, new prompt JS \`assets/js/hero-polish-r2.js\`, copied controller \`assets/js/unified-r3-hero-polish.js\`; original source controller byte-for-byte unchanged.
- Review page has \`noindex,nofollow\`; **do not merge to main or publish as the root homepage** until production/legal/data approval gates are satisfied.

## Actual cause of perceived low resolution
1. **The old exterior is a compressed screenshot**, \`assets/home-r42/luwei-before-capture.webp\` — 908×689, ~61 KB, not a high-resolution photographic source. It includes already pixelated interface lettering.
2. Existing R1 applied \`transform:scale(1.48)\` desktop and \`scale(1.6)\` mobile, visibly enlarging its limited pixels. R2 overrides scaling to \`none\` and removes filters, uses a native text overlay instead of upscaling the screenshot.
3. Menu photo \`luwei-peking-duck-1254.webp\` is actual higher-resolution image (1254×1254). Retain srcset; do not fake an AI-generated true photograph.
4. Chart remains SVG and typography live HTML. Raising image dimensions with CSS cannot restore lost photographic detail. For a truly crisp exterior at 2x Retina, acquire original higher-resolution store photo/screenshot from rights holder; this remains outstanding.

## Image compare / natural choice
- Exterior remains a real evidence capture with contextual disclosure about the original pixels.
- A calm, conspicuous button appears on image: “차량 뒤에는 어떤 메뉴가 기다릴까요?” → “베이징덕 사진 먼저 보기”.
- After click, the same button offers “차량이 보이는 외관 다시 보기”, so the user can freely reverse it; this is an invitation, not a forced click or dark pattern.
- Both original before/after selection buttons remain and share the exact same state owner.
- The existing 470 ms optical pause remains; reduced-motion/manual OFF performs instant change.
- No claim that this change caused sales growth. +168% wellness B traffic and restaurant A 2023–2026 revenues are kept distinct.

## 04 Word stage
- Each \`.rf-word-row\` owns about 59–65svh and is arranged as one visual focal statement at a time through normal document scroll.
- Reuse ScrollTrigger in a separate copied R3 controller only, replacing \`start:'top 93%', end:'bottom 22%', scrub:1.25\` with \`start:'top 83%', end:'top 25%', scrub:1.38\`, opacity \`.14→1\`, x/y slide to settled. No pinned scroll, snap, looping, blur or new audio.
- Strongest depth is on “실행합니다.”; gradient moves warm cream → light sage → richer sage.
- Reduced-motion and no-GSAP still show the readable static words.

## Footer and next action
- Full branded footer with logo, strong editorial closing statement, soft CTA to experience, all existing service/privacy/client/meeting/invite links, and copyright.
- **Company info is not invented**: Business number and physical address supplied by user remain to be cross-checked against approved legal source / privacy release before publication; no false releaseApproved flags or legal assertions are introduced.
- No payment widget or false inquiry completion language.

## Publication gates
- Current production build intentionally rejects 22 unapproved company/privacy verification items. Do not override.
- Verify POS and Places data, use-rights for images, actual Kakao enquiry receipt and ads, and mobile iPhone Safari + Android + Kakao in-app.
- Deployment now means **Netlify Draft Preview**; production root cutover after complete approvals and deep-link migration. Existing \`/#cases\`, \`/#flow\` and service links must not be broken.
- Record live deploy SHA and rollback target before the eventual approved merge.

## QA
- Source tests \`tests/hero-polish-r2.test.cjs\`
- Chromium script \`scripts/qa-hero-polish-r2.cjs\`
- Run \`npm ci && npm run verify\` (review only); host \`dist\` on 4173 for script.
- Six viewports, 02A source unscaled, prompt forward and reversal, original other 3 interactions, 04 row depth/height, footer, audio default OFF, reduced motion, no request writes/404 and screen captures.
- Physical smartphone/in-app QA remains manual.
