# WEPLACE | Growth site analytics + GEO implementation, 2026-10-11

## Live source of truth
- Domain: https://withweplace.kr/
- GitHub: HotCharliepepper/Weplace
- GA4 measurement ID: G-H9B5F4HRDS (existing; preserved)
- Working branch: feature/visual-ga4-geo-20261011

## What was implemented
1. Homepage Before/After uses a **real image asset already present in the repository** in both panels. The comparison is a **fictional UI/information-order example**, not an actual client result. Color/blur and metadata chips illustrate the problem rather than implying the business physically changed.
2. Homepage analytics:
   - `weplace_experience_select` (industry)
   - `weplace_before_after_view` (one event per page once comparison becomes visible)
   - `weplace_audit_start` (first user audit interaction)
   - `weplace_audit_complete` (all six options checked)
   - `weplace_audit_all_checked` (legacy retained)
   - `weplace_faq_open` (question_index)
   - `weplace_industry_open` (industry)
   - `weplace_consult_click` (placement); this is a click, **not a confirmed lead**.
3. Industry analytics:
   - `weplace_diagnosis_cta_click` (jump-to-diagnosis click)
   - `weplace_diagnosis_start` (first answer actually selected)
   - `weplace_diagnosis_complete` (result displayed)
   - `weplace_calculator_open` (jump-to-calculator click)
   - `weplace_calculator_use` (first user input, not default values)
   - `weplace_demo_select` (interactive sector demo)
   - `weplace_faq_open` (question_index)
   - `weplace_consult_click` (Kakao outbound click)
4. Main service Organization/WebSite/WebPage/Service JSON-LD, industry-specific Service/WebPage/BreadcrumbList JSON-LD, and human-visible industry FAQs. No false ratings, fabricated clients, case studies or guaranteed AI rankings.
5. Root sitemap.xml and robots.txt reference existing canonical URLs. Note there is no guarantee of indexing.

## GA4 property-side work: still needs administrator access
In GA4 > Admin > Data display > Custom definitions, register event-scoped custom dimensions as **appropriate**: `industry` (homepage industry selector), `industry_focus` (industry pages), `placement`, `question_index`, `entry_method`, `page_type`. Do not duplicate a predefined GA4 dimension.

Use DebugView and Realtime to verify expected events:
- Home: choose industry -> audit -> expand FAQ -> click contact.
- Industry: edit calculator value, select first quiz answer, finish quiz, click Kakao.
- Confirm each `*_start` fires on user action (not page load) and each `*_complete` fires only on completion.
- Avoid setting `generate_lead` as a key event for Kakao **clicks**, because clicking does not prove someone sent an inquiry. For verified lead generation, connect a consented form or CRM confirmation with its own event.
- If enabling outbound link auto tracking, ensure it is not mistakenly treated as a second conversion event.

## Privacy boundaries
- Do not send names, contact details, exact store names, budgets, survey answers or calculated money outputs into GA4.
- Current quiz results stay within the visitor's browser and may be copied to Kakao by the visitor. CRM storage is not yet implemented.

## Google Search Console handoff
- Verify ownership of https://withweplace.kr.
- Submit https://withweplace.kr/sitemap.xml.
- Inspect the canonical index and each industry URL using URL Inspection.
- Monitor indexing/exclusions, query/page impressions and organic clicks in Search Console. Schema and sitemaps do not guarantee search/AI ranking.
- Google's FAQ rich result eligibility is restricted primarily to authoritative government and health sites. We use visible FAQs for **human understanding**, not promise FAQ rich snippets.

## QA / release
- Verify desktop width 1440; mobile 390 and 320; no horizontal overflow or broken images.
- Confirm original and revised visuals use the same /img/ind-dining.jpg and existing file path.
- Verify scripts, JSON-LD and HTML syntax on new branch before merging.
- Verify Netlify Deploy Preview and production deploy references.
- Confirm GA4 events and GSC data separately after release (tools do not offer direct GA4 admin/GSC access here).
- External documentation: Google GA4 recommended events (https://developers.google.com/analytics/devguides/collection/ga4/reference/events); Google Search starter guide (https://developers.google.com/search/docs/fundamentals/seo-starter-guide); Google sitemap guidelines (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap); FAQ rich-result change (https://developers.google.com/search/blog/2023/08/howto-faq-changes).

## Success signals
Meaningful completion and qualified inquiry first; scroll depth / dwell time are supportive indicators, not the primary success metric.
