# Weplace · Experience-led Website v4 (draft PR)

## Goal
Rebuild the brand homepage around meaningful, voluntary exploration rather than passive reading or superficial time-on-page inflation.

## Included
- New spacious ivory + forest-green homepage with responsive desktop and mobile layouts.
- Customer-question explorer (4 industries), fictional before/after, four-step journey, visible operating process, six-item self check and contact CTA.
- Hospitality, dining and stay industry pages (v3) with national travel data, assumption-based simulator, 5-question diagnostic and consultation link.
- Reused existing repository photos: img/ind-dining.jpg, img/ind-stay.jpg and img/ind-beauty.jpg. No new image binary or new JavaScript dependencies.
- Existing Kakao channel, phone, email, GA4 measurement ID G-H9B5F4HRDS preserved.

## Integrity / boundaries
- Industry statistics refer to national tourism, not client outcomes. Calculation results are arithmetic under entered assumptions and not sales forecasts.
- Before/after is clearly marked fictional. No invented client cases, testimonials, or ROI guarantees.
- Quiz answers are not saved; CRM/consent is separate future work.
- Analytics are lightweight behavior events without names, contact details, or quiz answers.

## QA checklist before merging
- Netlify Deploy Preview: desktop 1440px, tablet 768px, phones 390px and 320px.
- Keyboard: mobile navigation toggle; industry switches, audit selected state, links and FAQ details.
- Routes: /, /industries/hospitality.html, /industries/dining.html, /industries/stay.html, /industries/beauty/.
- All stock/site photography rights and match between page claim and depiction.
- GA4 DebugView: experience selection, industry open and contact click; outbound links to official Kakao and email.
- Verify published survey references and calculators; use real operational data only when supported.

## Measure quality (not dwell time alone)
Industry-select rate, diagnostic completion rate, calculator engagement, qualified contact rate, proposal conversion, and loss of trust signals. Monitor depth and time only as diagnostic indicators.

## Deployment
Keep main unchanged until preview reviewed. The existing GitHub→Netlify workflow will deploy when this PR is merged. Do not manually replace the full live site with a partial ZIP.
