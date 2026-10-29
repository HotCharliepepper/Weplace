# FLOW source, permissions and integration audit

Checked: 2026-10-19 KST. Scope: read-only production inspection, recovered source verification, isolated synthetic-data regression tests. No production writes, migrations, account creation, customer imports, messages, or payment activation.

## 1. Source of Truth: the missing source was in stacked feature branches

**CONFIRMED:** The default `main` branch of `HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2` is an old visual baseline; the same private repository contains the actual server implementation in stacked Draft PRs. It must not be treated as a prototype-only repository.

| Item | Evidence |
|---|---|
| Recovered source branch | `feature/industry-folders-20261014` |
| Source commit | `29dace237c8a2ce2323a499409a81aa28a12a50b` |
| Latest original PR | https://github.com/HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2/pull/9 (open Draft, not merged) |
| Base lineage | #9 industry folders → #8 owner experience → #7 prospects → #6 client portal → #5 journal/briefs → #4 authentication → earlier workflow changes |
| Current production site | `weplace-flow-mino-review`, https://flow.withweplace.kr |
| Site ID | `42d0e6f2-2488-4e23-a0e2-a135740b7a90` |
| Current production deploy | `6acf86ec3b764e3a56f9339c`, ready, published 2026-10-14 13:44:10 UTC |
| Deploy provenance | title `Build from drop deployment`; context `production`; deploy_source `api`; commit_ref and branch null; has_source_zip true |
| Deployment technology | Vite frontend, Node.js 22 functions, Netlify Database |
| Existing deployment migrations | Metadata confirms `20261014150000_industry_capacity` applied on that production deployment; the source contains seven historical migration files |
| Current connection permissions | Connected GitHub account reports pull/push/admin on the private repository. This is technical access, not approval to merge/deploy or change customer records |
| Original source ZIP | Recovered local `weplace-industry-folders-source.zip`, SHA256 `887a426a099d491247b196a88eebd272c0750126ef61dbca11af579add8aedeb` |
| Whole-source match | GitHub recursive tree at source commit has 226 blobs. ZIP contains 226 files. Git blob SHA-1 comparison: **226/226 identical, zero missing/changed** |
| Frontend reproducibility | Fresh isolated build creates `index-F42LYRzR.js`, `index-D7ZsX5qR.css` and the same eight assets. Rebuilt index.html equals production index.html byte-for-byte |

The earlier local worktree's only commit `eb73c172...` is an old local snapshot with later changes uncommitted. It is **not** the operating version identifier. Use the GitHub source commit above.

**NEED VERIFY:** Netlify itself does not bind a commit SHA to the drop deployment. We have a complete matching repository/ZIP, reproducible production frontend, matching functions/migration and deployment timing. The server function binaries have not been downloaded and compared byte-for-byte to the deployment's original source ZIP. Preserve this distinction in a release manifest; do not relabel null commit metadata as a verified Git-CD deploy.

The original PR authorship and connected repository owner are known, but the current human release approver, official publication approver, actual active team mapping and custody of production backups still require owner confirmation. No internal user identifiers, credentials or customer rows were collected for this audit.

## 2. Existing authentication and authority boundaries

Source files at the verified commit:

- `netlify/server/flow-identity.ts`: Netlify Identity `getUser()`; if authenticated claims omit confirmation time, server-only `admin.getUser(session.id)` checks that same subject. Missing/failed/mismatched/unconfirmed identity does not grant access.
- `flow_memberships.role`: real values are **owner / member**; workspaces are **personal / team**. Do not invent staff/admin/client as persisted membership role values.
- `netlify/server/flow-policy.ts`, `flow-database.ts`: server-side current membership, ownership, workspace/revision checks; peer records are projected before API response.
- `src/app/domain/account-access.ts`: transaction/client visibility is owner, assigned account owner or explicit detail-reader authority; names alone do not give authority.
- `flow_client_grants`: customer account grants are distinct from team membership. A customer connection never enrolls the customer in the staff team.
- `client-database.ts`: 24-hour connection code, owner confirmation of code/identity/account, explicit revoke; only active grants return associated accounts and explicitly shared work/request records.
- Authenticated POST handlers enforce same-origin, JSON content type, input allowlist/size, current role checks, and concurrency revisions. Exposing these existing employee endpoints as anonymous homepage intake would break the current contract.

The customer projection is `accounts: workspaceId/accountId/name/teamName` and shared `entries: id/workspaceId/accountId/kind/content/updatedAt`; entry content allows only title/body/date/url/status/reply. These internal IDs are appropriate only within the authenticated customer portal, never GA4 or public journal.

## 3. Function and route inventory

All function routes below are on FLOW under `/.netlify/functions/`.

| Function | Current implementation and permission | Homepage relationship |
|---|---|---|
| `public-industries` | Anonymous GET only; official workspace, approval, validity date and active-contract filters; explicit public projection | Existing `/api/weplace-industries` read-only proxy |
| `public-journal` | Anonymous GET only; official workspace, state=published; public projection | Existing `/api/weplace-journal` read-only proxy |
| `session` | Authenticated GET; user ID/expiry/current check | FLOW session only; do not proxy into public site |
| `flow` | Authenticated workspace/task/CRM operations; owner/author/reviewer constraints | Staff portal destination |
| `prospects` | Authenticated team; owner may import/reassign; member accesses assigned prospects | No anonymous submission operation exists |
| `briefs` | Authenticated author/team owner plus linked account read permission; export rechecks approval/version | Proposal preparation after human review |
| `calendar` | Authenticated team schedule visibility and scope | Meeting proposals are not confirmed bookings |
| `client-manage` | Team owner grants/import/publication settings; account-owner work publishing under review rules | Employee management only |
| `client-portal` | Verified customer identity plus explicit account grant; own request submission | `/client` and `/my-store/` |
| `journal` | Authenticated draft/review/publication management | Internal approval before public Field Notes |
| `avatar` | Authenticated profile photo storage/read policy | FLOW only |

Preserve homepage `/team` → FLOW root and `/client` → FLOW `/client` (including existing wildcard path handling). Do not copy Identity, admin screens or protected API data into the static public website.

## 4. Public response contracts and approval behavior

### public-industries

Top level: `industries` array, `updatedAt` nullable ISO time.

Each item: `industry`, `count`, `managedCount`, `capacity`, `remaining`, `capacityReviewedAt`, `activeUntil`, `updates[]` containing `summary/updatedAt`.

- `count` counts approved current account descriptions; it is **not** interchangeable with `managedCount`.
- `managedCount/capacity/remaining` remain null unless a valid separately approved industry-capacity setting exists.
- `remaining = max(0, capacity - managedCount)`; null capacity is not zero capacity.
- Current active contracts require `contractStatus === active`, no future start, no past end. Approval validity uses Asia/Seoul dates.
- Missing official workspace, missing approval, revoked approval or expiry suppresses data. A failed request must clear displayed counts, not retain a stale number.
- No account ID, name, contacts, internal approval note or contract amount is projected.

### public-journal

Top level: `entries[]`. Item: `id/kind/content/publishedAt`; kind is `case` or `discussion`.

Publication states: `draft → submitted → published`, with `archived` for public withdrawal. Editing a published entry first requires withdrawal and review again. The official publication workspace plus owner role is required to publish. Case approval requires recorded customer consent and content review; measured outcome additionally requires period and public evidence URL.

The source applies explicit content validation/projection, but free-text anonymity and rights still depend on a real human review. A checkbox is not independent evidence of actual consent. Preserve this distinction.

The current journal policy has publication/withdrawal status, not an automatic per-entry expiry field. Do not claim it has the same expiry policy as industry capacity.

## 5. Homepage → consultation → operations mapping

| Journey step | Existing FLOW source | Current safe behavior / remaining work |
|---|---|---|
| Industry experience / self-check | Public website only | In-memory anonymous choices; no automatic lead/PII collection |
| Consultation click | External Kakao link | Record only non-identifying click; it is not lead acceptance |
| Consultation acceptance | prospects lacks an anonymous create endpoint; existing actions are sheet/previewImport/import/save | New intake contract needed. Do not call current authenticated prospects endpoint from homepage |
| Staff follow-up | Actual prospect stages: 신규, 재통화, 관심, 가망, 미팅예정, 제안중, 보류, 완료(기존), 계약성사, 종료, 연락중단 | Staff confirms identity, need, next action/date. `완료(기존)` must not be reinterpreted as a signed contract |
| Meeting | CRM-linked actor-owned schedule/preparation note | Schedule candidate/proposal is not attendance/booking confirmation; no automatic external notification |
| Proposal | Existing briefs and customer-safe export | Facts/prices/metrics only after source/reviewer approval; internal note excluded |
| Contract / first payment | CRM contract fields and prospect stage exist; no verified e-contract/PG transition | Human-approved contract, official terms and payment system required. Changing prospect to 계약성사 does not create a customer grant |
| Customer account connection | owner-verified connection code + account-specific grant | Preserve separate staff/customer authority and revoke mechanism |
| Work management | Explicitly shared work records + customer requests/replies | Request states received/planned/working/done/cancelled; work states planned/working/done. Click does not create extra paid scope |
| Public case | Journal owner approval, customer consent and public projection | Internal work record never auto-publishes |

The safe future intake is one-way submission → explicit consent/server validation/rate limit/idempotency → owner review → existing prospect/meeting/brief workflow. Reuse the confirmed model where applicable; do not introduce production tables or migrations just to bridge the homepage.

## 6. Tests executed during this audit

Recovered source snapshot: `flow-recovered-test`, extracted from the exact 226-file ZIP. Dependencies reused locally. Tests use a locally started PGlite-backed PostgreSQL-compatible engine and synthetic fixtures; production environment credentials were not read or passed.

| Check | Result |
|---|---|
| Whole GitHub tree ↔ source ZIP | 226/226 matching blobs |
| ZIP ↔ recovered local source | 226/226 matching files |
| `npm test` | **145 passed, 0 failed, 0 skipped** |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| Fresh build ↔ retained build | index.html + eight asset files identical |
| Fresh build ↔ live production assets | All eight JS/CSS files downloaded anonymously and byte-identical |
| Production FLOW `/` and `/client` anonymous GET | HTTP 200 application shell; index.html equals reconstructed build |
| Production `public-industries` GET | HTTP 200, keys industries/updatedAt, zero approved items |
| Production `public-journal` GET | HTTP 200, entries empty |
| Anonymous `session`, `prospects`, `client-portal` GET | HTTP 401 |

The 145 checks include identity fallback/unconfirmed rejection, cross-workspace/ownership isolation, customer grant vs staff separation, customer-to-customer denial, revoked grants, duplicate request handling, optimistic revisions, publication/withdrawal/approval, industry expiry/null-zero distinction, source import idempotence, unauthorized future fields excluded and UI error preservation. These are source regression tests, not proof of a live two-account production workflow.

**NEED VERIFY:** actual two-account browser login, email confirmation/recovery, live customer grant/revocation, long session refresh, mobile Safari, and production concurrent database load. No production test account was supplied and creating accounts/sending mail was outside this audit.

## 7. Safe release/source recovery plan

1. Keep source SHA/ZIP hash/deploy ID together as the baseline manifest. Preserve the recovered source and historical migrations; do not use stale main as a new deployment baseline.
2. For FLOW changes, branch from `29dace237...`, keep the existing stacked PR lineage intact, and create a separate Draft review. Do not merge the older stack automatically.
3. Make any test intake adapter disabled by default with synthetic fixtures and an explicit no-production-write boundary. Retain existing Identity, membership, grants and publication policy.
4. Before hosted FLOW staging, confirm database/Identity/Blobs isolation. A same-site preview may share site-wide private Blobs/integration credentials even when the database branch differs; it must not be assumed safely isolated.
5. Record a repeatable build and source-to-deploy manifest. Do not reconnect the production site to Git, change branch settings or redeploy without approval.
6. Back up/recoverability review is read-only preparation. Current deploy metadata shows an on-publish database snapshot; that does not establish a tested restore procedure. A failed future preview does not replace production. Any production recovery or fix-forward release requires owner approval.
7. Required approvals remain: final homepage publish/merge; FLOW source/release ownership; hosted isolated test identity/storage if desired; real consent/retention/lead intake; actual publication team/capacity approval; contract terms/e-sign/PG; live account/data changes.

## 8. Evidence references

- Private original PR: https://github.com/HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2/pull/9
- Exact source: https://github.com/HotCharliepepper/WEPLACEFLOWVisualBaselineV0.2/tree/29dace237c8a2ce2323a499409a81aa28a12a50b
- Netlify deployment: https://app.netlify.com/projects/weplace-flow-mino-review/deploys/6acf86ec3b764e3a56f9339c
- Function files: `netlify/functions/*.mts`; server authority and projections: `netlify/server/{flow-identity,flow-policy,client-database,prospect-database,publication-database,publication-policy}.ts`
- Actual enums and field contracts: `src/app/domain/{prospects,client-portal,brief,operations,publication}.ts`
- Existing synthetic integration tests: `tests/{server-auth,identity-server,client-portal-security,prospect-security,publication-security,brief-security}.test.ts`

Audit conclusion: **Operating-source lineage recovered and original permissions/API contracts regression-tested. Public connection is preserved; automatic real lead intake, live contract/payment and production changes remain unactivated.**
