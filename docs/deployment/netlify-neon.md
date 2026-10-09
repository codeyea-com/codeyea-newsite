# Netlify and Neon deployment preparation

The application stays on Next.js App Router. Netlify detects Next.js and applies its maintained adapter; this repository does not pin an adapter version.

## Build settings

- Build command: `npm run build`
- Publish directory: `.next`
- Node.js: 22 or newer, matching `package.json`
- Do not add a static export: the CMS, authenticated routes, leads, analytics and server actions need the Next.js server runtime.

`netlify.toml` records these settings. Netlify's current Next.js adapter provides the server runtime and routes; it is not a static-only deployment.

## CMS image storage

The CMS uses Netlify Blobs for uploaded image variants on Netlify, so they remain available after a new deploy. Local development and tests continue to use the private `.local` filesystem adapter. Production and non-production deploys use separate site-wide stores; keep previews on separate Neon branches as well. Blobs are configured for strong consistency so a replaced image is immediately available to the page that references it.

## Database connections

Create a Neon database and add two server-only variables in Netlify:

- `DATABASE_URL`: Neon pooled connection string (the hostname includes `-pooler`), used by the live app.
- `DIRECT_URL`: Neon direct connection string, used by Prisma migrations and schema tooling.

Both URLs must require TLS. Do not put either value in the repository, a browser-visible prefix, or a public CI log. Local development and the isolated test database set both values to their own database URL; the test runner rejects any direct URL outside its loopback test database.

Apply the committed migrations to Neon from a trusted environment with `npm run db:migrate` and `DIRECT_URL` set to the production direct URL. Then deploy the application. Keep backups and a tested restore path before changing production data.

## Netlify environment variables

Set values under server-side environment variables, not client-exposed variables:

- Required to build and run: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` (at least 32 characters), and `BETTER_AUTH_URL` (the final HTTPS site origin).
- Lead email: `RESEND_API_KEY` and `RESEND_FROM`; verify the sender and recipient routing before opening forms to the public.
- Form protection: `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; the server verifies every production lead token with Cloudflare Siteverify. Optionally set `TURNSTILE_ALLOWED_HOSTNAMES` to the exact comma-separated production hostnames, including `www` only if that hostname serves the site. Do not expose the secret key.
- Search and analytics integrations: add their credentials only when the related Google properties and tokens are ready. Visitor analytics remain gated by the site's consent choice.
- Leave `SITE_INDEXING_ENABLED=false` until canonical URLs, redirects, robots rules, sitemap contents, real page copy and form delivery have passed the pre-launch check.

Keep deploy previews isolated from production: use a separate Neon branch and non-production auth secret, and prevent preview URLs from being indexed. Never copy production lead data into preview databases.

## Release gates still to close

- Review the production-hardening list in `docs/CORRECTION_REVIEW.md`: MFA/recovery, backup/restore test, managed secret rotation, CSP nonce policy, append-only audit permissions, trusted-proxy login limits and lower-role draft visibility.
- Replace the temporary media and unconfirmed copy/prices listed in `docs/MILESTONE_2_ASSETS.md` and confirm every public form, CTA and service destination.
- Exercise lead receipt and editable PDF delivery using the real verified sender; confirm retention, access control and deletion expectations for submitted personal data.
- Create a Turnstile widget limited to the final site hostnames, add its site and secret keys to Netlify, then submit valid, missing and expired-token test requests before enabling public forms.
- Run the full test suite and production build in CI after the local runtime is healthy; verify Netlify deploy previews, responsive pages, keyboard/reduced-motion behavior and the final domain/SEO settings.
- Add the final Google/Clarity values after launch as already planned, and verify analytics consent and Search Console access before enabling reports.

This checklist prepares the codebase and deployment settings; it does not deploy or publish the site.
