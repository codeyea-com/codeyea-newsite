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

Production release: `4afde6ca23f2f7f658a37955b1ec43b9ae7c6fe4`, deployment `dpl_8gFdkwfYm4eeAfE2JCB7ggrvouBW`, status `READY`. The local production build and all 23 focused tests passed. The Vercel build took 45.059 seconds.

Live HTTP verification passed:

- Apex pages serve HTTPS with status 200.
- HTTPS www requests redirect with status 308 directly to the equivalent apex URL, preserving paths and query strings. English and Arabic examples were checked.
- HTTP upgrades to HTTPS successfully; HTTP www upgrades before the domain redirect.
- All 33 unique sitemap URLs use the apex origin and serve successfully. Each page's canonical link, Open Graph URL, and any language alternates and CODEYEA structured-data URLs use the apex origin.
- The robots file references the apex sitemap and preserves the admin, login, preview and API exclusions.
- Both project domains remain verified. DNS and email records were not modified.

Evidence: `deployment.json`, `domains.json` and `production-http.json`. The first immediate request after clearing the old apex redirect still saw its previous 308 while the platform propagated the change. The www redirect was held until direct apex responses were confirmed as 200, so both redirect directions were never enabled together.
