# FLOW preview on the Weplace website

The homepage now links to `/flow-preview/` from navigation, the shared-experience section, and the footer. The existing `/team`, `/client`, public journal, and industry API redirects are unchanged.

The preview uses the reviewed FLOW home and quick-record components with an in-memory synthetic transport. It makes no live API requests, uses no actual account/session, and resets on page load. The finance view remains denied. This does not deploy the operational FLOW application or change its database, Sheets, Identity, or finance allowlist.

The export removes legacy member/customer/project fixtures, uses generic example names, and excludes source maps and server functions. A path-scoped CSP blocks connections and form submissions. The page is marked noindex in HTML, response headers, and robots.txt. Search exclusions are not access controls: this is a public synthetic preview.

## Source and rebuild

Generated files and SHA-256 values are recorded in `flow-preview-source.json`. With dependencies installed in an authorized, clean FLOW checkout at the recorded tree:

```sh
node scripts/build-flow-preview.mjs /absolute/path/to/flow
```

The adapter changes only the static export; it does not edit the FLOW checkout. Commit the updated generated files with any future homepage changes so later deploys retain this route.

## Validation

- Production source baseline: Weplace main `ec714758367b5bc448d61cc8c73b6fd2a3de9007`.
- Export builds successfully. Vite reports the existing large client bundle warning (about 506 kB uncompressed / 149 kB gzip).
- Homepage link opens the real FLOW components under the nested path.
- Synthetic quick schedule saves, appears in the team and personal schedule, and disappears after a new page load.
- Finance direct query shows the denied view; return link remains under `/flow-preview/`.
- Browser checks at 320, 390, 768, and 1024 px iframe widths show no horizontal page overflow.
- Export contains no legacy staff/customer names, email addresses, or source maps. Existing `_redirects` is byte-identical.
- Operational authentication and database permissions are not exercised by this static preview.
