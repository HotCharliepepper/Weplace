# Weplace root R2 integration

R2 replaces `/` with the supplied Invitation visual language and verified period comparisons. New homepage assets are isolated under `assets/`; all existing industry pages, self-check, public journal, enterprise/process pages, portal redirects and company/privacy gates remain available.

The previous customer-view tool is now `/experience/`. Its before/after choices, eight scenarios, exports, motion controls and anonymous industry widget retain their existing logic and regression assertions. Only the test input path and generated navigation target moved. The new homepage links to that tool and `/check/`.

## Run

Node 20+ and Python 3: `npm ci`, then `npm run verify`. `dist/` is the review artifact. Use a static HTTP server to view it; Netlify reads the existing `netlify.toml` and preserves `_redirects` and `_headers`.

## Evidence and boundaries

- A: 2026 May KRW 172,000,000 → June 193,000,000; +KRW 21,000,000 / +12.2%.
- B: 2026 May–August Place visits 877 / 1,137 / 2,002 / 2,350; +168% May to August. Not bookings, people, or sales.
- The fictional C comparison uses the same image and changes its layout. It is not the A/B renovation evidence.
- The request flow prepares local text, supports clipboard failure, and opens the established Kakao channel. No server receipt, CRM record or message is created.
- The home does not infer anonymous journal approval from a display name. `/field-notes/` retains the existing public feed and detail interaction.
- Production is still blocked by the existing company/privacy gate. Review builds are noindex.

## Verification

74 automated tests pass; 34 HTML pages and 1,053 references have zero local link defects. Four viewport browser review and hosted Preview verification are recorded in `browser-qa.json`. Tests use synthetic inputs and do not log in or write to live systems.

## Remaining release inputs

Confirm legal company details/contact/privacy policy; supply actual before/after images with dates/rights; validate any future 3-week/+15% claim with matching periods and execution records. Actual CRM intake is a separate approved implementation. Current mobile browser review is desktop Chromium at specified iframe viewports, not physical iOS/Android or field Core Web Vitals.

## Review delivery

- Draft PR: https://github.com/HotCharliepepper/Weplace/pull/12
- Netlify Deploy Preview: https://deploy-preview-12--weplace.netlify.app/
- Base: current PR 11 head, so PR 12 against main includes PR 11's pending work. Review `changed-files.txt` for the R2-only delta. Neither PR 11 nor main was changed.
- Seven industry detail pages now retain their selected industry when opening `/experience/?industry=…#experience`; enterprise and my-store navigation also use the new tool path.
- `test-results.txt` contains the complete final automated verification output. No browser fixture or browser capture is part of the deployed source.
