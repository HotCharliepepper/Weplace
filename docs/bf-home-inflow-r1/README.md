# WEPLACE — November FAST → Main / Place +168% R1
Date: 2026-11-19. Status: **DRAFT PREVIEW ONLY; NOT YET APPROVED FOR PRODUCTION**

## User request and boundaries
- Add an unmistakable **Weplace homepage CTA at the bottom of November FAST R8**, after the inquiry selection and before the tiny footer.
- Audit the exact main footer destinations in the supplied screenshot; keep usable paths but clarify labels where they misrepresent the destination.
- Reintroduce the main landing's previous **+168% / 877 → 2,350** observed Naver Place detail inflow hook, with date and interpretation limits. Maintain FAST, main comparison, capability, FLOW and inquiry sections.
- New branch is based on current main `9d45e219ca12e84963d698f44ddf213e43149b95`. Original R8, main, FLOW/CRM/DB/auth/payment unchanged on production. No ads, customer messages or production deploy.

## Source of the metric
Weplace GitHub Draft PR #37 `docs/hero-evidence-lab-r1/README.md` (17 Nov 2026) records user-provided monthly Naver SmartPlace **detail inflow** for anonymous Wellness B:
2026-05 **877 counts**; 2026-08 **2,350 counts**.
Difference **1,473**; (2350-877)/877*100 ≈ **167.96%**, rounded **+168%**.

Critical constraints:
- This is *not* a count of unique people, actual in-store visitors, sales, orders, or conversion rate.
- It is *not* evidence that one marketing intervention caused the change; other factors aren't isolated.
- It is unrelated to the revenue / POS time series of anonymized Restaurant A. Do not combine evidence or photography as if they belonged to one business.
- Independent original SmartPlace admin-screen check, consistent metric definitions and **client permission to publish** remain unresolved. **Do not merge or publish the homepage numerical hook before these are resolved.** No unverified customer-facing logo/photos introduced.

## Navigation audit
- `/#place-evidence`: new metric explanation with source limitation.
- `/#evidence`: existing method evidence.
- `/#experience`: existing visual comparison.
- `/#contact`: existing diagnosis contact.
- `/field-notes/`: existing client work records/experience site, labeled ‘작업 기록·사례’ (not unconditionally verified results).
- `/flow-preview/`: existing noindex demo, labeled ‘FLOW 미리보기’.
- `/industries/`: verified existing page.
- `/my-store/`: verified existing customer-space introduction; login behavior untouched.
- privacy label was a `mailto:` action rather than a real privacy policy page. Relabeled **‘개인정보 문의’**; a valid published privacy policy, where required, is a separate pre-release task.
- `/november-fast/`: existing live R8 campaign route.

## User journey
Ad R8 hook → three fictional before/after screens → optional 5-step contact choices → **new full-width main-home CTA** → main landing **+168% (provided data, qualified)** → methods / case / FLOW / contact.
The new CTA is an ordinary anchor and works without JavaScript or a form.

## QA
CI runs at 360, 390, 768, 1440: first hero number readable, 2-bar ratio, evidence anchor, footer page routing, 3 topic choices, homepage return link, reduced motion and no-JS, errors/overflow/screenshot checks.
CI screenshots and browser test do not substitute for iOS Safari/Android Kakao in-app tests. Existing operation remains unchanged pending publication-rights check.
