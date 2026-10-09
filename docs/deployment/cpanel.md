# GitHub → cPanel deployment

Target confirmed by owner: Node.js and PostgreSQL available. This repository is a Next.js application, not a static export.

## Initial server setup
- Use Node.js 22.12+ (or a supported newer LTS). Confirm the host supports a persistent Next.js process and reverse proxy / Application Manager.
- Keep PostgreSQL and Resend credentials in the cPanel environment, never GitHub source or public files.
- Set DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL (the final HTTPS origin), RESEND_API_KEY and RESEND_FROM (verified sender).
- Create a PostgreSQL backup before migrations.
- Deploy the repository through cPanel Git Version Control from the approved GitHub branch. Keep application files outside public_html; route the domain through the Node application.
- Run npm ci, npm run db:migrate, npm run build. For first import only: npx tsx scripts/import-approved-pages.ts.
- Startup command: npm run start, or the host's configured Node process with the required PORT. Do not use a development server.
- Restart the application after the build. Verify login, private pages, quote/contact capture and notification delivery before enabling public traffic.

## Release discipline
This change prepares local private drafts. It does not publish them or deploy to the cPanel account. Host path, domain, GitHub repository and deployment credentials are still required. Do not introduce a .cpanel.yml with guessed account paths.

## Required follow-ups before launch
- Approve/publicly expose final page routes; current imported pages are private previews.
- Review real contact data, temporary media and proposed commercial terms.
- Configure Resend and test delivery to each authorized recipient with owner-approved test data.
- Connect analytics accounts and choose keyword-ranking provider/budget.
- Add a scheduled email outbox retry and stale-delivery recovery, plus spam protection before exposing public forms.
- Backups, restore testing, logs, TLS, redirects, canonical URLs, sitemap and locale-specific metadata.
