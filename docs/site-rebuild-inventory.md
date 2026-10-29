# WEPLACE public site inventory — 2026-10-19

Execution basis: `WEPLACE_Work_Rebuild_Brief_v1.1_FLOW_Integrated_2026-10-19(1).md`.
Baseline: `main` commit `ec714758367b5bc448d61cc8c73b6fd2a3de9007`.
This document records static source evidence. Live FLOW authorization, deployed API
responses and production source ownership are covered by the separate integration
audit; the existence of a link is not proof that a service is working.

## Routes and operational boundaries

| Route | Purpose / next destination | Status and boundary |
| --- | --- | --- |
| `/` | Four industries → customer-view example → `/check/` → consultation | Homepage changes are reviewed in the same branch. Examples are not customer outcomes. |
| `/industries/` | Four-sector directory → working detail routes | Rebuilt in paper/deep green; original Weplace symbol; no contract counts or scarcity. |
| `/industries/restaurant/` | Dining questions → `/?industry=dining#experience` → `/check/?industry=dining` | Existing route retained. |
| `/industries/cafe/` | Cafe questions → `/?industry=cafe#experience` → `/check/?industry=cafe` | Existing route retained; distinct first-party illustration. |
| `/industries/stay.html` | Lodging questions → `/?industry=stay#experience` → `/check/?industry=stay` | Existing URL retained. Netlify clean URL `/industries/stay/` can resolve this file; no forced redirect added. |
| `/industries/beauty/` | Beauty questions → `/?industry=beauty#experience` → `/check/?industry=beauty` | Existing route retained. |
| `/industries/esthetic/` | Esthetic service questions → shared beauty experience / diagnosis | Existing route retained; no separate competing questionnaire. |
| `/industries/dining.html` | Legacy dining entry → shared experience / diagnosis | File and URL retained with its own canonical; no deletion or redirect. |
| `/industries/hospitality.html` | Combined lodging/dining entry → separate questions for each | File and URL retained; joint navigation and shared operation guidance. |
| `/check/` | Six-question self-report → explicit copy/export → user-initiated Kakao message | Memory-only response handling remains the baseline. No lead ingestion is added by these subpages. |
| `/start/` | Consultation → meeting → proposal → contract → customer-specific work | Complete public explanation; no booking, contract submission or payment action. |
| `/problems/` | Visible information problems → GBP guide / diagnosis / industry directory | Links point to existing pages, not placeholder destinations. |
| `/problems/google-business-profile/` | Compare public displays and actual operating information | Unsupported ranking causes, fixed-time outcomes and tourism/device statistics removed. |
| `/field-notes/` | Publicly approved records | Existing built application retained. Public-data filtering is a separate integration test concern. |
| `/my-store/` | Account-linking explanation → `/client` | Existing authenticated portal boundary retained. |
| `/client`, `/client/*` | Redirect → `https://flow.withweplace.kr/client` and matching subpath | Existing 302 rules unchanged by this subpage work. |
| `/team`, `/team/*` | Redirect → `https://flow.withweplace.kr/` and matching subpath | Existing 302 rules unchanged by this subpage work. |
| `/api/weplace-industries` | Forced proxy → FLOW `public-industries` | Existing endpoint preserved; this inventory does not infer authorization from its name. |
| `/api/weplace-journal` | Forced proxy → FLOW `public-journal` | Existing endpoint preserved; no authenticated journal API substituted. |

## Before / after findings

| Finding at baseline | Change | Evidence status |
| --- | --- | --- |
| `/assets/weplace.css` and `/assets/weplace.js` absent | Removed obsolete imports; subpages share `/industries/surface.css` and existing `/assets/css/brand.css`. | CONFIRMED in tree and static validator |
| Missing `/diagnosis/`, `/essay/`, `/webtoon/`, `/industries/massage/`, `/industries/clinic/` | Replaced with actual diagnosis, industry, public-record and contact destinations; no unsupported clinic/massage landing claims. | CONFIRMED |
| Broken root fragments `how-we-see`, `how-we-work`, `self-diagnosis` | Replaced subpage links with concrete routes. | CONFIRMED |
| Prototype links to missing image, essay and industry files | Point to existing image / Field Notes / beauty / industry directory; labels updated to match destination. | CONFIRMED |
| Conflicting Gasan and Yeongdeungpo addresses | Removed unverified address and legal-identity assertions from rebuilt subpages and their structured data. No address inferred. | NEED VERIFY: authoritative legal/operating address and public legal details |
| Start page public pricing, revision counts, time promises and customer metrics not backed by approval evidence | Removed; public copy explicitly states rates are under review and lists the conditions to agree in a proposal. | APPROVAL REQUIRED: prices, scope, VAT, payment entity, refund/termination terms |
| Restaurant/cafe promises about sales approach, free monthly exit or fixed-time changes | Removed unsupported guarantees and replaced with factual process guidance. | NEED VERIFY before any new policy claim |
| Beauty claims about an average of five comparison shops; GBP tourism/device percentages and ranking assertions | Removed instead of treating unsupported claims as verified market evidence. | CONFIRMED removal; no substitute fabricated statistic |
| Three `.html` pages duplicated five-question quizzes and hypothetical revenue/reservation numbers | Consolidated entry into `/check/` six-question flow; removed fabricated outcome counters, revenue calculator and duplicate quiz. | CONFIRMED; intentional feature consolidation |
| Old `.html` deep links | Preserved relevant section anchors including `top`, `insight`, `why`, `system`, `work`, `metrics`, `calculator`, `delivery`, `diagnosis`, `service-faq`, `contact`. Retired calculator anchors now reach explanatory diagnosis content. | CONFIRMED |
| Image provenance not established for old photos | Rebuilt subpages use first-party SVG illustrations and label them as industry examples, not customer photos. | CONFIRMED for new assets; old assets retained elsewhere |

## Analytics compatibility and privacy

Only `dining.html`, `stay.html` and `hospitality.html` retain their pre-existing GA4
setup (`G-H9B5F4HRDS`). They load it only on `withweplace.kr` or
`www.withweplace.kr`. Preview and local hosts do not load analytics. Canonical
`page_location` contains only origin and pathname; `page_referrer` is blank, so
query strings or hash values are not sent by this configuration.

Existing coarse event families retained:

- `weplace_consult_click`: channel link click, not a received inquiry.
- `weplace_diagnosis_cta_click`: diagnosis link click, not completion.
- `weplace_faq_open`: FAQ index only.
- Existing `industry_focus` values remain `dining`, `stay`, `all`.

Legacy calculator/demo/independent-quiz events are retired with those features.
Diagnosis start/completion belong to the shared flow's separately approved
measurement plan. No new analytics was introduced to other rebuilt subpages.
No form, customer identifier, text response, budget, contact data, persistence API,
automatic CRM write or payment endpoint is present in these rebuilt subpages.

## Validation

Run `python scripts/check-links.py` from the repository root. It checks all HTML
`href`, `src`, `poster`, `srcset`, CSS `url()`, fragments and sitemap URLs against
the tree; understands Netlify index/clean-URL resolution and configured redirects;
and explicitly treats external targets as **not probed**. It does not execute the
Field Notes app, infer JavaScript-generated links, or claim network availability.

| Check | Result |
| --- | --- |
| Baseline tree | 20 HTML documents, 508 references, **31 local defects**. |
| After subpage rebuild, at audit time | 22 HTML documents, 535 references, **0 local defects**. Rerun after other branch work to obtain the final counts. |
| Rebuilt subpages | 11 pages: one H1, viewport, canonical and valid JSON-LD; original symbol present. |
| Script syntax | All rebuilt inline JavaScript passed `node --check`. |
| Privacy host test | Three legacy pages × local, preview and production hosts: no local/preview GA load; production canonical URL strips query/hash and referrer; click payload has only allowlisted coarse fields. |
| Source-side intake test | No `localStorage`, `sessionStorage`, `fetch`, `XMLHttpRequest`, `sendBeacon`, lead form or payment action in the 11 rebuilt subpages. |
| Responsive/accessibility source | 600px and 900px layout breakpoints, flexible grids, 44px minimum nav targets, skip link, focus outlines, native disclosure controls, explicit image dimensions, reduced-motion rule. |
| Rendered browser / keyboard / screen-reader / slow-network / LCP tests | **NOT MEASURED by this subtask**. Static and VM checks do not replace a supported browser pass at the required viewport sizes. |

The 11 rebuilt HTML files were 500,737 bytes before this change. They are
substantially smaller and share one stylesheet; this is a source-size comparison,
not a measured loading-speed or Core Web Vitals improvement.

## Open decisions

1. **NEED VERIFY** — legal/operating address and public business information from
   authoritative current evidence; then restore one shared truthful footer source.
2. **APPROVAL REQUIRED** — official rates, supplied scope, revision limits,
   payment/contract party, start terms and refund/termination policy.
3. **NEED VERIFY** — actual indexed/search traffic and external referrals for the
   retained legacy `.html` pages. No 301/canonical consolidation without evidence.
4. **APPROVAL REQUIRED** — production merge/deploy and expanded tracking; no such
   approval or action is implied by passing a link check.
5. **NEED VERIFY** — supported-browser rendering and deployed route behavior;
   root integration report records whichever additional checks are completed.
