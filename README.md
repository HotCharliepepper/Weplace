# Weplace public website

Static customer discovery website. Authentication, CRM, customer grants and publication approval stay in the existing FLOW service.

```sh
npm ci
npm test
python3 scripts/check-links.py
npm run build
python3 scripts/check-links.py dist
```

Deploy artifact: `dist/`. Netlify previews use the tracked `netlify.toml`. No API write, migration, form submission, automatic lead storage or payment is built into this site.

Review routes:
- `/review/audience.html`: homepage, diagnosis, meeting, customer portal and public-record views at six selectable widths.
- `/review/integration.html`: in-memory synthetic public-industry API fixtures; no production API calls.
- `/meeting/`: noindex meeting-preparation template, manual copy/print only.

Architecture: [docs/integration-map.md](docs/integration-map.md). Source/authority: [docs/flow-integration-inventory.md](docs/flow-integration-inventory.md). Journey mapping: [docs/journey-to-crm.md](docs/journey-to-crm.md). Approval and measurement: [docs/measurement-and-decisions.md](docs/measurement-and-decisions.md).

The 2026-10-19 change is an independent review branch from main. Do not merge or deploy production before final owner approval. Existing pricing/English Draft PR #5 remains separate.
