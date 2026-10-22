# Preferred public domain: codeyea.com

Owner direction, 2026-10-22: use `https://codeyea.com` as the primary public origin and permanently redirect `www.codeyea.com` to the equivalent apex URL.

## Implementation

- Set the existing shared `siteOrigin` to `https://codeyea.com`. Canonical links, Open Graph URLs, structured data, language alternates, sitemap entries and the robots sitemap URL inherit this origin.
- Update canonical expectations in the existing five SEO test files. All 23 focused tests pass.
- Keep CMS publication and indexing flags as they are.
- Change only the two existing Vercel project-domain redirects. Clear the apex redirect first, confirm it serves the app, then set `www.codeyea.com` to redirect to `codeyea.com` with status 308. This order prevents a server-side redirect loop.

## Scope and rollback

Project: `prj_bCISlRuTKm56AY83lpYGPrLKvjna`, team `team_5UFiPvcBdmIlPuarWx1RihIU`.

Before this change, `codeyea.com` redirected to `www.codeyea.com` with status 308; `www.codeyea.com` served production. Both domains were verified and assigned to this project.

Rollback order: clear the www redirect before restoring the apex-to-www redirect; restore the corresponding public origin in code. DNS, nameservers, MX records, mail delivery and domain registration are outside this change.

The earlier performance report records the previous www origin at the time it was measured. Its Lighthouse measurements have not been rerun or reinterpreted for this domain change.

## Verification

Production deployment and HTTP verification are recorded in the JSON evidence alongside this file after release. Checks cover HTTPS, one-way permanent redirects, equivalent paths and query strings, Arabic and English canonical links, sitemap origins, and robots exclusions.
