# Vercel and Neon deployment checklist

The production application uses Next.js App Router on Vercel, Neon PostgreSQL for relational data, and private Vercel Blob storage for CMS media. It requires the Node.js server runtime; do not configure a static export.

## Vercel project

- Import the `codeyea-com/codeyea-newsite` GitHub repository and use the repository root as the project root.
- Framework preset: Next.js. Build command: `npm run build`. Leave the output directory at the Next.js default; do not publish `.next` as a static directory.
- Use Node.js 22.12 or newer, matching `package.json`.
- Connect a private Vercel Blob store to the project. The integration provides `BLOB_READ_WRITE_TOKEN` to the server runtime. Do not make CMS media public.
- Add production and preview environment values separately. Use a dedicated non-production Neon branch and a different auth secret for previews; never copy production lead data to previews.

## Required server environment

Add these as encrypted/server-only Vercel environment variables (Production and Preview as applicable):

- `DATABASE_URL`: Neon pooled connection string for the app runtime.
- `DIRECT_URL`: Neon direct connection string for Prisma migration tooling.
- `BETTER_AUTH_SECRET`: unique secret with at least 32 characters.
- `BETTER_AUTH_URL`: exact HTTPS origin for the environment.
- `BLOB_READ_WRITE_TOKEN`: supplied by the connected private Vercel Blob store.

Also configure integrations only when their credentials and destinations are verified:

- Lead email: `RESEND_API_KEY`, `RESEND_FROM`.
- Cloudflare Turnstile: `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and optionally `TURNSTILE_ALLOWED_HOSTNAMES` with the exact served hostnames.
- CMS writing assistant: `AI_API_URL`, `AI_MODEL`, `AI_API_KEY`.
- Search/analytics: `GA4_PROPERTY_ID`, `GOOGLE_ACCESS_TOKEN`, `GSC_SITE_URL`, `GTM_CONTAINER_ID`, `CLARITY_PROJECT_ID`, `CLARITY_API_TOKEN`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` as applicable.
- Keep `SITE_INDEXING_ENABLED=false` until canonical URLs, redirects, robots, sitemap, real copy, and form delivery have passed the pre-launch review.

Never commit or print secret values. Apply committed Prisma migrations from a trusted environment with `DIRECT_URL` set, then deploy. Ensure Neon backups and a tested restore path exist before production data is used.

## One-time Netlify media import

Existing CMS image metadata in Neon refers to image variants held in the former Netlify Blob stores. Import those bytes before expecting existing CMS media to appear on Vercel. The migration script is deliberately separate from the production build and reads only `READY` media records:

```powershell
$env:DATABASE_URL = "<Neon pooled URL>"
$env:NETLIFY_SITE_ID = "<former Netlify site ID>"
$env:NETLIFY_AUTH_TOKEN = "<Netlify personal access token>"
$env:BLOB_READ_WRITE_TOKEN = "<Vercel Blob read/write token>"
npm run migrate:netlify-media
```

Run from a trusted local shell after connecting the private Blob store. It copies missing variants from the old production or preview store, leaves existing Vercel objects intact, and exits with an error if referenced files are missing. Keep the token out of shell history where possible and clear the temporary environment values after the import. Do not remove the original Netlify media until the Vercel copy is verified.

## Before opening production

- Configure and test lead receipt, editable PDF delivery, and Turnstile verification using the real verified sender and final hostnames.
- Review the production-hardening list in `docs/CORRECTION_REVIEW.md`, including MFA/recovery, backup/restore, secret rotation, CSP nonce policy, audit permissions, trusted-proxy login limits, and draft visibility.
- Replace temporary media and unconfirmed copy/prices listed in `docs/MILESTONE_2_ASSETS.md`; confirm all public links and forms.
- Complete the CMS page catalog, English copy/media review, and human Arabic translation/RTL review before publishing those pages.
- Verify the imported CMS media, responsive layouts, keyboard and reduced-motion behavior, canonical URLs, robots, sitemap, and analytics consent.

This checklist and migration script prepare the application; a successful Vercel production deployment and release review are still required before calling the site launched.
