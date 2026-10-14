# P02 — Public /team and /client entry routing QA

> 2026-10-14 KST. CONFIRMED: GitHub main source / Netlify production metadata.
> NEED VERIFY: live browser login/redirect, HTTPS, mobile tap and client/staff authorization.
> No change to public copy or redirects until a reproducible defect is verified.

## Current source-level behavior

Source: HotCharliepepper/Weplace, main SHA 4d2774c417f5feb018fb1026a970eb76a92ee888.

- /team → https://flow.withweplace.kr/ (302), /team/* → matching FLOW path (302).
- /client → https://flow.withweplace.kr/client (302), /client/* → matching client subpath (302).
- /api/weplace-journal → only FLOW public-journal Function (public allowlist proxy).
- /api/weplace-industries → only FLOW public-industries Function (public allowlist proxy).
- /field-notes/ uses public content, not customer or team CRM.
- Homepage links new prospects to existing diagnosis/contact CTA; approved existing client to /client, employee to /team.

Current Weplace Netlify production site ready; deploy 6acf5357b003682d3d4cdb2e; SHA matches main. No runtime incident is confirmed in the GitHub routing source.

## Browser QA pending (not completed)

Direct web fetch of /team, /client, FLOW login and /field-notes/ was inaccessible from the present environment, and the container could not resolve public DNS. This is an inspection limitation, not evidence of an outage or successful redirect.

When a controlled QA browser is available:
1. Anonymous access: open https://withweplace.kr/team and /client. Record only final URL, HTTP status, login screen and redacted headers. Do not capture session cookies or customer data.
2. Verify team-user login never grants customer credentials privileges; customer-user login never unlocks staff CRM. Test two different customers with distinct grants.
3. Confirm mobile 320/390px entry controls and contact CTA, field notes, no redirect loop or mixed HTTP resources.
4. Confirm public API has public approved fields only; private FLOW endpoints must remain unproxied.
5. If a defect is found, apply the smallest branch-only link/label change, test Preview after security gate, then request separate production authorization.

## Decision

**Keep current redirects and CTA unchanged** on this branch: no verifiable defect was found in source. This is a QA-only handoff.

Branch: audit/20261014-p02-routing-review-v01. No PR or Netlify Deploy Preview was triggered. Production, main, FLOW DB and domains untouched.

Rollback: discard audit branch. Production rollback SHA if separately approved in the future: 4d2774c417f5feb018fb1026a970eb76a92ee888.
