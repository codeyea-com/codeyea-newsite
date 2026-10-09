> Latest (2026-09-15): [Homepage media/backend review](docs/HOMEPAGE_MEDIA_REVIEW.md) and [checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Ready for final owner review; do not deploy or publish owner content.

> Current status (2026-09-14): Homepage CMS review is ready. See [review](docs/HOMEPAGE_CMS_REVIEW.md) and [resume checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Earlier milestone notes below are historical. Stop for owner backend review.

# CODEYEA homepage and CMS — Milestone 2

Milestone 2 implements the static homepage section map and an explicit Publish workflow for the existing positioning editor. Other sections remain labeled static review fixtures; full collection editing and advanced motion belong to later milestones. Original media is still needed for visual fidelity. See docs/MILESTONE_2_REVIEW.md and docs/MILESTONE_2_ASSETS.md.

Saving creates a private draft. Only users with publish_pages see Publish; save unsaved edits first. Publishing validates the saved version and commits publication history, public snapshot, timestamp and actor audit together. The live WordPress site is never contacted.

## Requirements and local setup

- Node.js 22.12+ (verified with Node 24.18) and npm.
- Windows x64 is verified. The development helper uses real PostgreSQL 18 binaries through `embedded-postgres`, not an in-memory substitute. Other platforms need their matching supported binary or an existing PostgreSQL service.
- Database port 55432 and application port 3000 must be free.
- Run commands from this directory in separate terminals as indicated.

```powershell
npm ci
npm run setup:local
npm run db:start
```

Keep the database terminal running. Local configuration is generated once in ignored `.env` and `.local/runtime.json`, using random credentials. The helper binds PostgreSQL to 127.0.0.1, uses SCRAM authentication and creates a non-superuser application role. It never creates a Windows service or OS user. Ctrl+C stops the server; `.local/postgres` preserves data. The helper refuses to overwrite existing configuration.

In a second terminal:

```powershell
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

The db:migrate command generates the Prisma client before applying SQL migrations, so the setup also works from a clean checkout where generated files are absent. Administrator creation prompts for an email and a hidden new password. It uses Better Auth's maintained password hasher and refuses existing users; never provide the old WordPress password. Public signup is disabled.

For a generated **local-only** owner account instead:

```powershell
npm run admin:create -- --generate-local
```

Read `.local/owner-access.txt` privately. It contains generated local access and is excluded from Git. This option refuses existing access files/users and is restricted to a loopback application URL. An owner account has already been created this way in the current workspace; do not recreate it.

Open http://127.0.0.1:3000/login. Use 127.0.0.1 consistently, since origin/cookie checks use the configured exact origin. To run the optimized build instead of development:

```powershell
npm run build
npm start
```

If npm encounters a corporate certificate-chain error on this machine, use the system certificate store for that shell: `$env:NODE_OPTIONS='--use-system-ca'`. Do not disable TLS verification. Locked installation scripts for Prisma, PostgreSQL and esbuild are explicitly listed in package.json. Older npm versions may ignore that npm-specific allowlist; only install the locked trusted packages.

## Owner acceptance walkthrough

1. Sign in at `/login` using the generated local access file or your bootstrapped administrator.
2. In **Content**, edit **Heading** and **Supporting copy**. The private preview updates immediately, including unsaved text.
3. Select **Save draft**. Check the saved notice and incremented version, then reload to verify persistence.
4. Open **View public page**. The published positioning remains unchanged after Save draft. As Administrator, select **Publish** after saving; the public positioning then updates. The status changes from **Draft saved with unpublished changes** to **Published**. Editor/Author roles do not see Publish.
5. Open **Revisions**, preview a previous version and compare its changes, then restore it. Return to Content and verify the prior text. Restoration creates a new draft version and preserves the version it replaced.
6. Open **Audit log** and verify who saved/restored and when. Audit details now show actor identity, affected record and field changes.
7. Open **Brand & taxonomy** to inspect the supplied brand assets, reference colors and approved service/industry labels.
8. To test concurrent editing, open two editor tabs at the same version. Save one, then save the other: the second must show a reload/conflict message rather than overwrite newer work.
9. Sign out and revisit `/admin`: login is required. Active sessions can also be invalidated from a trusted local operator terminal with `npm run sessions:revoke -- user@example.com`.

## Commands and checks

```powershell
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm start
```

Browser tests manage their own isolated server:

```powershell
npm run test:e2e
npm audit
```

Integration tests use uniquely identified test pages/users and clean up their own records. They verify anonymous/permission denial, validated saves, published isolation, restore, concurrent writers and rollback after an injected audit failure. The rollback test temporarily adds a PostgreSQL constraint affecting only its own random test page and removes it in `finally`. The runner requires the dedicated codeyea_test database and role.

Browser tests cover real login/cookies, save/reload, public isolation, restore, audit, logout, role revocation, origin validation, blocked signup, payload limits and auth throttling. They verify no horizontal page overflow at 320/375/768/1024/1366/1440 and 812x375 landscape, exercise reduced motion, and write desktop/mobile screenshots under `docs/screenshots`. All browser fixtures and homepage edits use the dedicated test database. Owner editing on port 3000 can continue independently.

The throttle test consumes only the test environment quota, which the runner clears before each suite. Test traces are disabled; failure artifacts can contain temporary test credentials, which are revoked during teardown. Do not share ignored test reports without inspection.

## Architecture and boundaries

- `src/server/auth.ts`: Better Auth with Prisma adapter, HTTP-only SameSite cookies, eight-hour sessions, disabled public signup and database-backed rate limits.
- `src/server/permissions.ts`: granular permission lookup from UserRole → RolePermission, rechecked server-side.
- `src/server/content.ts`: serializable draft transactions with row locks and optimistic versions. Revision, section changes and audit entry commit together. Restore looks up a revision scoped to its page and changes only the draft.
- `src/schemas/content.ts`: strict bounded plain-text content, approved taxonomy, locale/market identity and provider-neutral hosting target interface. No raw HTML/CSS/JS editing.
- `src/app/api`: authenticated private CMS endpoints, Better Auth handler, and published-only public content endpoint. Mutation requests require exact Origin and bounded JSON.
- `prisma/schema.prisma`: normalized auth, roles, permissions, Page/PageSection/PageRevision, locale/market and audit tables. PagePublication preserves each explicit publication and its preceding snapshot/timestamp. POST /api/cms/publish requires publish_pages and an expected version. Scheduling remains deferred.
- `src/styles/tokens.css`: brand colors, local Josefin Sans, spacing, container, border, radius, shadow, layers and motion starting values. Global stylesheet contains the responsive CMS presentation.
- `scripts`: local PostgreSQL startup, idempotent seed, administrator bootstrap and session invalidation.

Administrator has the seeded full permission set. Editor has view_admin/edit_pages/view_audit. Author has view_admin/edit_posts and cannot change page drafts. Names are presentation; server checks use permission records. Remaining module permission keys are schema/seed preparation, not claims that those modules are implemented.

## Security and deployment notes

This milestone is a local review build, not a production launch. No WordPress credentials, billing, provisioning or live-site mutations are involved.

- Cookies use Secure on HTTPS; local HTTP loopback is the explicit development exception. Serve any deployed application over HTTPS.
- Rate limiting is database-backed but currently uses one server-controlled shared auth bucket (five sign-ins per minute), preventing spoofed forwarding headers from bypassing it. This can temporarily affect all editors together. Before external deployment, configure and validate a trusted proxy/IP boundary and appropriate per-account protections.
- CSP, frame denial, MIME sniffing prevention, referrer and permissions headers are set. CSP permits inline scripts/styles for Next.js and UI compatibility; nonce-based hardening remains a deployment task. The prototype is noindex.
- The local application DB role is not a superuser but owns its development database to apply migrations. Production requires separate migration and restricted runtime roles, backups, TLS, secret storage and monitoring.
- Generated secret/access files inherit the host user's Windows filesystem protections; do not share `.env` or `.local`. Delete the local access note when you no longer need it. No secrets are included in `.env.example`.
- Email verification, password recovery delivery, MFA, user-management UI, media upload, SEO editor and AI tools remain deferred. No form pretends those integrations are connected.
- `deepmerge-ts` and `mysql2` transitive overrides patch Prisma CLI advisory dependencies. The production build and migrations are verified with those overrides. Review/remove overrides when upstream adopts compatible patched versions.

Deployment target: Netlify with Neon PostgreSQL. See [Netlify + Neon deployment checklist](docs/deployment/netlify-neon.md). Keep `DATABASE_URL` (pooled runtime connection) and `DIRECT_URL` (direct migration connection) in server-only environment settings. Do not deploy the `.local` development database/helper/access files. Production readiness work remains required before external exposure.

Reference implementation guidance: [Better Auth options](https://better-auth.com/docs/reference/options), [Better Auth rate limiting](https://better-auth.com/docs/concepts/rate-limit), [Prisma and Better Auth](https://www.prisma.io/docs/guides/authentication/better-auth/nextjs).

## Correction-pass testing
Run npm run test:setup once while local PostgreSQL is running. npm test and npm run test:e2e now require the dedicated codeyea_test database and ignored .env.test. Browser tests build separately in .next-test and manage a production server on port 3001. They never reuse the owner server on port 3000. See [correction review](docs/CORRECTION_REVIEW.md) for details and the production-hardening backlog.


