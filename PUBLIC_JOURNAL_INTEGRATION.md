# WEPLACE audience integration

Visitor home: `/`; public work and editorial feed: `/field-notes/`; employee entry: `/team`; document studio: `/team/documents`.

Employee routes redirect to the existing authenticated FLOW origin, preserving identity/session and database boundaries. No private API is proxied through this repository. Only the public-journal API is proxied. Public API emits allowlisted, approved publications only; no configured workspace means an empty feed.

Public visuals use warm ivory, editorial serif headings and sans body; data comparisons use blue-grey and tabular numbers. Comparisons use visitor-entered values, never fabricated outcomes, and are not saved or sent. Existing industry pages, analytics and Kakao contact remain.

FLOW source commit: 7f8e0f51ec7e5cb447248139609b764e384d0628. Public bundle built separately from FLOW; no CRM, Identity or document server code included. Validation: 125 FLOW tests; TypeScript; separate public Vite build. `review/audience.html` provides noindex viewport checks.

Real client publications require separate consent and approval. External member posting/payment and spreadsheet import are not enabled by this release.
