# CODEYEA Maintenance Mode and Review Link Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Let administrators close public pages for maintenance while privately reviewing the published site through a revocable, expiring URL.

**Architecture:** Store maintenance state in server-side database settings and issue opaque one-time review tokens persisted by hash. Redeem valid links into short-lived secure cookies; enforce maintenance at public page and lead-intake boundaries while leaving CMS/admin available.

**Tech Stack:** Next.js 16 App Router, Prisma/PostgreSQL, Better Auth, Zod, Node crypto, Playwright.

**Spec:** [CMS/SEO design](../specs/2026-10-08-cms-seo-maintenance-arabic-design.md)

## Global Constraints

- Use existing permission, same-origin, audit, and no-store helpers.
- Never store or log raw bypass tokens; never bypass by an arbitrary query flag.
- Maintenance responses must be 503 and noindex; admin/API access remains intact.

## Review Focus

- Expired, revoked, guessed, and replayed tokens: reject every request.
- Cookie theft/cross-site use: use secure, HTTP-only, same-site cookies and short expiry.
- Public lead submission during maintenance: reject before persistence or email.
- Authenticated admin and CMS preview availability: test while maintenance is on.
- Cache leakage: ensure maintenance state and token previews are not cached across users.

---

### Task 1: Persist maintenance state and review-token records

**Files:** `prisma/schema.prisma`, `prisma/migrations/` (create), `src/schemas/maintenance.ts` (create), `src/server/maintenance.ts` (create), `src/server/permissions.ts`, `tests/maintenance.test.ts` (create).

- [ ] Add a singleton maintenance settings record and hashed review-token records with issued, expiry, revoked, and actor fields.
- [ ] Add migration with unique token hash, expiry index, and relation-safe actor metadata.
- [ ] Implement permission-checked state reads/writes and cryptographically random token issuance; persist only a one-way hash.
- [ ] Test settings persistence, permission denial, token uniqueness, expiry, revocation, and audit attribution.

### Task 2: CMS control and token lifecycle

**Files:** `src/app/admin/page.tsx`, `src/components/cms/maintenance-settings.tsx` (create), `src/app/api/maintenance/route.ts` (create), `src/app/api/maintenance/review-link/route.ts` (create), `e2e/maintenance-admin.spec.ts` (create).

- [ ] Add an admin-only maintenance switch/message and a review-link generator with expiry and revoke controls.
- [ ] Validate exact request origin, permission, message bounds, and allowed expiry windows; return the raw URL only once.
- [ ] Render current state and audit history without exposing token hashes or reusable URLs.
- [ ] Test admin UI state, unauthorized access, single-display token behavior, and revocation.

### Task 3: Enforce maintenance and private review access

**Files:** version-matched Next routing implementation selected after reviewing local Next docs, `src/app/maintenance/page.tsx` (create), `src/app/api/maintenance/redeem/route.ts` (create), public page route loaders, `src/app/api/leads/route.ts`, `tests/maintenance-routing.test.ts` (create), `e2e/maintenance-public.spec.ts` (create).

- [ ] Read the installed Next.js 16 proxy/routing and caching documentation before choosing the enforcement boundary.
- [ ] Return a branded 503/noindex response for public pages when maintenance is enabled and no valid review session exists.
- [ ] Redeem a valid link to an HTTP-only secure short-lived cookie, then redirect to a clean URL without the token.
- [ ] Keep admin/API routes available; reject lead intake during maintenance, including direct API requests.
- [ ] Test 503 status, noindex headers, admin access, valid/invalid/expired/revoked link, token removal, and cache separation.
- [ ] Run migrations only in isolated local/test DBs; do not touch production.
