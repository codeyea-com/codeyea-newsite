# Milestone 1 correction review

Scope: foundation corrections only. The full static homepage and homepage animation remain behind the next user review gate.

## Content contracts

`src/schemas/homepage-contracts.ts`, `collection-contracts.ts` and `contract-primitives.ts` define bounded, typed section and collection data with stable identity, locale/market, ordering, visibility and media references. See `src/schemas/CONTRACTS.md` for versioning and reference rules. Legacy positioning snapshots can be read into a versioned immutable snapshot without rewriting historical database records. The current bounded positioning editor remains compatible; these contracts precede the full homepage renderer and collection editors.

## Styling and history

`styles/tokens.css` is the single token definition source. Global CSS contains the box sizing and margin reset plus scoped surface defaults. Admin/login styles live in `studio.css`; the temporary public preview has its own stylesheet. Shared controls require an explicit surface wrapper.

History loads 50 records at a time using a stable version cursor. Selecting a revision previews its full copy and field differences against the current draft, including unsaved changes. Restore is offered only after preview and retains concurrency and transaction protections. Audit entries identify the affected object and show before/after changes.

## Audit attribution

Audit `actorKind` distinguishes USER, OPERATOR and SYSTEM. USER requires a user relation; OPERATOR/SYSTEM require a label and no user relation. A database constraint enforces this distinction. `entityType` and `entityId` describe the target independently. Bootstrap and session maintenance now use operator attribution. The additive migration corrects those known historical command events without deleting history. Existing browser-test records from the prior milestone remain historical records; future tests are isolated.

## Test isolation and operation

Start the local PostgreSQL service using `npm run db:start`, then run `npm run test:setup` once. It creates the dedicated `codeyea_test` role/database and ignored `.env.test`, with an independent auth secret and port 3001. It removes PUBLIC CONNECT on the owner database and explicitly retains owner-role access, so test credentials cannot connect to the owner database. No owner content is changed by setup.

`npm test` loads and validates `.env.test`, applies migrations and seeds only the test database, then runs tests. `npm run test:e2e` does the same and builds into `.next-test`, starts a dedicated production server on 3001 and shuts it down after browser checks. It refuses to reuse a running server. Both runners reject owner database identities; the server also checks test identity. Test rate-limit records are cleared only in the test database. Browser history fixtures and mutations live exclusively there.

The owner prototype remains on port 3000 using `.env` and `.next`. Browser tests cover revision preview/diff, pagination beyond 50 entries, restore, draft/public isolation, responsive widths, authentication and authorization. Integration checks verify test-role denial on the owner database and audit actor constraints.

## Production hardening backlog — nonblocking for Milestone 2

| Item | Production work required |
| --- | --- |
| MFA/recovery | Enroll administrators in MFA; define recovery codes, identity checks and audited recovery procedure. |
| Backups | Automated encrypted PostgreSQL and media backups, retention, offsite copies and restore drills with agreed recovery targets. |
| Secrets | Managed secret store, separate deployment credentials, rotation and least privilege; local ignored files are development only. |
| CSP | Replace inline allowances with nonce/hash policy; verify required media/provider origins and reporting before enforcement. |
| Append-only audit | Dedicated writer privileges, deny update/delete to app role, restrict migrations, durable export and retention policy. Current app database owner is not tamper-proof. |
| Login throttling | Replace the local shared bucket with trusted-proxy derived client keys plus account/global limits, distributed storage, monitoring and recovery from false positives. Never trust arbitrary forwarded headers. |
| Lower-role draft visibility | Current `view_admin` can read homepage draft/history; mutation still requires `edit_pages`. Decide whether authors need narrower per-collection/read-draft permission before production. |

These items are documented production obligations and do not authorize production deployment or expand this correction pass.

## Verification result
Final checks passed: 15 contract/integration tests, TypeScript, production build, and 3 browser acceptance tests on the isolated production test server. The browser suite covers pagination beyond 50 revisions and preview/compare before restore. The malformed external-URL validation regression was fixed and tested. Correction pass is ready for user review; Milestone 2 remains unstarted.

