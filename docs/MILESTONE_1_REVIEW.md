# Milestone 1 review

Delivered for owner review. Stop before the full homepage and animation milestones.

## Built

- Next.js 16.3.4, React, strict TypeScript and locally bundled Josefin Sans.
- PostgreSQL 18 with project-local persistent data, Prisma 7.10 schema and SQL migration.
- Better Auth 1.7.4, disabled public signup, HTTP-only sessions, server-protected admin route, database-backed throttling and session invalidation command.
- Normalized users/roles/permissions with Administrator, Editor and Author seed mappings.
- One bounded homepage positioning editor: page title, heading and plain supporting copy; private unsaved-copy preview.
- Serialized/versioned draft writes, previous-version snapshots, reversible restore and attributed audit records in one transaction.
- Public foundation preview reads the published snapshot only. No publishing button/API exists in this milestone.
- Supplied logos/favicon, design tokens, approved taxonomy view and locale/market foundation.

## Verified

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Optimized Next.js build | Passed |
| Integration tests | 7 passed |
| Chromium browser tests | 3 passed |
| Dependency audit | 0 known vulnerabilities |
| Independent code review | No blocking Milestone 1 findings |

Integration coverage includes anonymous and permission denial, input validation, persistence, unchanged published content, stale-write conflicts, restore history, two concurrent saves with one winner, and full transaction rollback when PostgreSQL rejects the audit insertion. The invalid-user auth test intentionally produces a Better Auth warning; this is expected rejection evidence, not a failing check.

Browser coverage includes login and HTTP-only cookie attributes, session persistence after reload, draft save/private preview, restore, audit display, logout, live role revocation, session invalidation, exact-Origin enforcement, signup denial, unexpected-field and oversized-payload rejection, and rate limiting despite spoofed forwarding headers. The private-state Request clone bug was found by the initial browser test and fixed before the passing run.

CMS layout has no horizontal page overflow at 320, 375, 768, 1024, 1366 and 1440 pixels, plus 812 x 375 landscape. The workflow runs in reduced-motion mode after layout checks. Desktop/mobile screenshots were visually inspected. These checks verify this CMS milestone; they do not claim homepage visual parity or a complete accessibility audit.

Screenshots: [Desktop](screenshots/cms-desktop.png) · [Mobile](screenshots/cms-mobile.png).

## Review it locally

The current workspace has local PostgreSQL and the production server running. Open http://127.0.0.1:3000/login and read generated credentials privately from `.local/owner-access.txt`. If processes have stopped, run `npm run db:start` in one terminal and `npm start` in another. Setup and recovery commands are in README.md.

Edit a heading, save, reload, compare the public page, restore the previous revision, and inspect the audit log. A two-tab stale-save check must refuse the outdated version. The audit includes clearly labeled browser-test actions; test accounts' authentication credentials and sessions are revoked after the suite.

Superseded by the correction pass: all tests now use an isolated database, auth secret and port 3001. Owner login is unaffected. See CORRECTION_REVIEW.md.

## Scope and remaining limits

This is a foundation and editorial workflow, not the reconstructed homepage. The editor currently exposes one approved section. All other homepage sections, motion, media upload, publishing/scheduling, additional collection editors, user-management UI, SEO/GEO and AI actions remain later milestones.

The local application DB user owns its development database to apply migrations. Separate restricted runtime/migration roles, HTTPS deployment, backups, production secrets, trusted-proxy/IP throttling, email recovery/MFA and stronger nonce CSP are production hardening tasks. The shared auth throttle is safe against spoofed IP headers but affects all local users together. CSP currently permits inline scripts/styles for framework compatibility. No production readiness or performance score is claimed.

The local server binds only to loopback. Passwords use Better Auth's maintained hashing; no legacy WordPress password was used. Generated local secrets are excluded from version control and never printed in build/test output. No live website changes, external publication, billing or hosting provisioning were performed.

After owner approval, the next milestone is the static homepage using the reference section map and approved taxonomy. A single hero media item must retain lively text and equivalent visual movement when the motion milestone is authorized. Original production assets and remaining reference uncertainties are listed in NOTES.md.

