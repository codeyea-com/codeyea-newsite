# Actual site release — 2026-10-09

Branch: codex/real-site-updates, based on origin/cms-seo-arabic (1c52c7c), including the newer public routes and Vercel configuration.

The approved repairs now render on normal website routes. Shared header/footer views serve React pages and the 14 document templates; the Industries menu has 14 public destinations and preserves its approved opening/hover motion. Content uses the shared page width, photo heroes stay full width, and designed heroes keep their artwork boxed with full-width backgrounds. Services retains its approved composition and an opaque background.

Contact uses the recovered original photo. App mockups use the original local food images and approved iPhone frame refinements. Quote options are 17px/16px. About uses the approved four-slide version with wheel/touch, click and keyboard controls, including on older publication records. Domains has centered copy and subtle curved extension motion with gradual fade in/out.

CMS draft mappings were verified for all 18 pages and 14 documents, including their saved previews. The Contact template preserves its existing field map; public rendering removes unconfirmed contact details. Public routes prefer published CMS content and retain the existing approved fallbacks. No CMS draft was published by this integration. Git transfers code and fallback assets; existing database records and hosting secrets stay in their configured environment.

The rejected Homepage concepts were not applied. The retained agency photograph is in ../reusable-images for future interior-page use.

## Validation

- 150 tests passed against the isolated test database.
- TypeScript and production build passed.
- 32 public routes at 1440, 1024, 768, 390 and 320px: HTTP 200, no horizontal overflow; sampled foreground containers remain within page bounds.
- All routes have one header/footer, the same navigation labels, 14 industry destinations and no private preview links in the shell.
- Public menu position, mobile navigation, quote sizes, original Contact photo and About click/scroll checked in the production server.
- Domain opacity ramp sampled on the production route: gradual entry/exit, maximum 16%; reduced motion respected.
- Deployment traces include the templates and canonical shell CSS.

Evidence: public-audit.json, public-interactions.json, cms-audit.json, domain-fade.json, and index.html (approved references beside production screenshots).

## Run / transfer

Use this branch with Node 22.x. Configure the existing DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL securely, following the repository README and .env.example. Then run npm ci, npm run db:migrate, npm run build, and npm run start. Never copy local .env files into Git. The local production review runs at http://127.0.0.1:3004.

The original milestone-1 checkout, CODEX_HANDOFF.md and whmcs-template-review remain untouched. This release is prepared separately; production deployment is not part of this integration.
