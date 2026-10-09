# CODEYEA CMS and SEO Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make every editable public page discoverable in the CMS, expose safe whole-site content controls, and provide complete page SEO editing, visual search previews, and real performance analytics.

**Architecture:** Extend the current route registry, snapshot schemas, CMS editor, and publishing pipeline. Keep media in Netlify Blobs, preserve the approved page designs, and make published metadata derive only from published snapshots.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, Zod, Netlify Blobs, Playwright.

**Spec:** [CMS/SEO design](../specs/2026-10-08-cms-seo-maintenance-arabic-design.md)

## Global Constraints

- Do not redesign or reorder approved page compositions.
- Keep admin inputs bounded and schema-validated; do not accept raw HTML, scripts, or CSS.
- Preserve drafts, revisions, optimistic concurrency, permissions, audit records, and published-only public reads.
- Analytics must use real GA4/GSC data and retain visitor-consent gating; never show fabricated metrics.

## Review Focus

- Route registry and CMS catalog drift: test that every editable route appears exactly once and system routes are excluded.
- Draft SEO leaking publicly: test public metadata before and after publish.
- Invalid canonical, image, and schema values: test publish validation.
- Rich-text injection: test escaped or rejected script/unsafe URL payloads.
- Missing provider credentials: test explicit unavailable states without sample values.

---

### Task 1: Route-backed page selector

**Files:** `src/content/site-routes.ts`, `src/content/page-catalog.ts` (create), `src/server/site-index.ts`, `src/app/api/site-routes/route.ts`, `src/app/admin/page.tsx`, `src/components/cms/route-map.tsx`, `tests/page-catalog.test.ts` (create), `e2e/site-catalog.spec.ts` (create).

- [ ] Enumerate every public route from the existing route registry and CMS documents; mark routes with no editable document or locale counterpart.
- [ ] Extend the authenticated route response with title, path, locale, publication/draft state, and update time; exclude `/admin`, `/api`, `/login`, and private preview routes.
- [ ] Replace the split hard-coded page list with one searchable, selectable page catalog and an editor page switcher.
- [ ] Test route completeness, search, locale/state display, permission enforcement, and selection navigation.
- [ ] Run `npm test` and `npm run typecheck`; run `npm run test:e2e` after browser-test setup is available.

### Task 2: Site-wide image, visibility, and rich-text controls

**Files:** `src/components/cms/draft-editor.tsx`, `src/components/cms/about-editor.tsx`, `src/components/cms/services-editor.tsx`, `src/components/cms/industries-editor.tsx`, `src/components/cms/industry-detail-editor.tsx`, `src/schemas/`, `src/server/site-editing.ts`, `e2e/site-content-controls.spec.ts` (create).

- [ ] Inventory each public content field and image reference against the route catalog; record any route without an existing editor control.
- [ ] Reuse `MediaPicker` for eligible image fields and existing `enabled` fields for section visibility; persist through the current draft/revision transaction.
- [ ] Add bounded formatting controls for bold, italic, links, and ordered/unordered lists using a typed content representation; render with an allowlisted formatter, never raw HTML.
- [ ] Verify every exposed control is keyboard usable, preserves locale direction, and cannot change protected layout or motion.
- [ ] Add schema and browser tests for persistence, unsafe markup/URLs, media replacement, hidden sections, and draft/public isolation.

### Task 3: Unified page-level SEO and visual search preview

**Files:** `src/schemas/seo-text.ts`, `src/schemas/contract-primitives.ts`, relevant page schemas in `src/schemas/`, `src/app/admin/page.tsx`, `src/components/cms/seo-editor.tsx` (create), `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/services/page.tsx`, `src/app/industries/page.tsx`, `src/app/industries/[slug]/page.tsx`, `src/content/seo.ts`, `tests/seo-readiness.test.ts`, `e2e/seo-editor.spec.ts` (create).

- [ ] Define bounded SEO fields for title, description, editorial focus phrase, canonical URL, robots index/follow, social title/description/image, and approved schema type.
- [ ] Add the shared SEO editor to every content-page editor and store values in versioned drafts/revisions/publications.
- [ ] Render a live desktop/mobile Google-style result preview and social share preview from draft fields; label the Google preview as an estimate.
- [ ] Ensure public metadata and JSON-LD read published values only; validate host, route, locale, media reference, and schema type at publish.
- [ ] Test draft isolation, published metadata, noindex previews, canonical safety, and HTML/JSON-LD escaping.

### Task 4: Graphical analytics and SEO readiness

**Files:** `src/components/cms/analytics-dashboard.tsx`, `src/components/cms/analytics-panel.tsx`, `src/components/cms/integration-settings.tsx`, `src/server/analytics-reports.ts`, `src/server/integration-settings.ts`, `src/app/api/analytics/route.ts`, `src/app/api/integration-settings/route.ts`, `tests/integration-settings.test.ts`, `e2e/analytics-dashboard.spec.ts` (create), `docs/seo/` (create reports).

- [ ] Verify GA4 and Search Console API authentication, report scopes, date ranges, and per-source errors against current official API behavior.
- [ ] Complete visual KPI cards, trend charts, keyword/query tables, position history, and top-page tables using real provider responses.
- [ ] Keep GA4/GTM/GSC setup in CMS and Clarity optional; test consent, no duplicate GA4 loading, secret isolation, and unavailable states.
- [ ] Audit each public route for keyword mapping, internal destinations, canonical/robots, schema validity, sitemap inclusion, and link integrity; write actionable on-page findings and an off-page opportunity plan without automated link placement.
- [ ] Add truthful Product/Offer schema only to actual purchasable hosting/domain/support pages; validate against page data and test these specific routes.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:e2e`; fix failures in this scope and repeat the affected checks.
