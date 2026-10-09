# CODEYEA Arabic Site and Release Audit Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Create a complete `/ar/` counterpart with natural, friendly Arabic SEO copy in draft, connect all public routes, and verify launch readiness across responsive behavior, motion, forms, security, and SEO.

**Architecture:** Extend the existing locale-aware route/document model and published snapshots. Keep Arabic drafts independent from English, generate locale-specific metadata and reciprocal hreflang only when both pages are valid, and preserve approved visual layouts. Arabic copy is localized page by page and must remain draft for editorial approval; do not call it human-translated unless a human editor has reviewed it.

**Tech Stack:** Next.js 16 App Router, Prisma/PostgreSQL, Zod, current page renderers, Playwright, existing Netlify/Neon/Turnstile/Resend integration.

**Spec:** [CMS/SEO design](../specs/2026-10-08-cms-seo-maintenance-arabic-design.md)

## Global Constraints

- Use `/ar/` path prefix and keep stable English route segments initially.
- No English fallback on an Arabic URL; incomplete Arabic stays unpublished and noindex.
- Require human-quality, friendly natural Arabic marketing localization, researched Arabic keywords, and no literal word-for-word translation. Assistant-written copy stays draft until a human Arabic editor reviews and approves it; never label it human-translated before that review.
- Do not deploy, enable indexing, publish Arabic owner content, or change DNS.

## Review Focus

- Missing Arabic counterpart or wrong direction: test every route and `lang`/`dir`.
- English content leaking into Arabic: test unpublished fallback behavior.
- Incorrect canonical/hreflang pairs: validate both locales and avoid self/missing references.
- Mobile RTL overflow or broken interactions: test common viewport sizes and reduced motion.
- Security/config gaps: verify lead, Turnstile, Resend, auth, environment secrets, and noindex preview behavior.

---

### Task 1: Complete route and content inventory

**Files:** `src/content/site-routes.ts`, `src/content/industry-registry.ts`, `src/server/site-index.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `tests/site-index.test.ts`, `tests/seo-readiness.test.ts`.

- [ ] Produce a route matrix for every public English page, CMS record, editor, hero, published state, CTA/link destination, metadata/schema, and Arabic counterpart.
- [ ] Implement a CMS readiness report for missing editors, unpublished required pages, broken internal links, and missing locale pairs.
- [ ] Verify admin, API, preview, login, and prototype routes stay excluded from public indexing.
- [ ] Test exact route coverage and sitemap/robots behavior without changing publication state.

### Task 2: Arabic routes, independent drafts, and human-friendly localization

**Files:** `prisma/schema.prisma`, `prisma/migrations/` (create if needed), `src/server/site-documents.ts`, locale-aware page routes under `src/app/`, CMS editor components, `src/content/seo.ts`, `tests/arabic-routes.test.ts` (create), `e2e/arabic-site.spec.ts` (create).

- [ ] Extend route resolution and CMS identity so every eligible `/ar/<stable-slug>/` page has an independent Arabic draft/publication.
- [ ] Add correct `lang="ar"`, `dir="rtl"`, localized metadata, canonical paths, and reciprocal hreflang for fully valid bilingual pairs.
- [ ] Prepare page-specific natural Arabic localization drafts and keyword targets; do not publish untranslated placeholders or claim the assistant's draft is human-translated.
- [ ] Route each Arabic draft through human Arabic editorial review, then keep it unpublished/noindex until copy and metadata are approved.
- [ ] Test full route parity, no English fallback, RTL direction, canonical/hreflang, and draft/public isolation.

### Task 3: Release verification across forms, visuals, backend, and SEO

**Files:** `src/app/api/leads/route.ts`, `src/server/lead-intake.ts`, `src/server/lead-delivery.ts`, `src/server/lead-pdf.ts`, `src/server/turnstile.ts`, `e2e/lead-delivery.spec.ts` (create), `e2e/release-responsive.spec.ts` (create), `docs/seo/` (create), `docs/deployment/netlify-neon.md`.

- [ ] Verify every contact/quote form writes a Lead, appears in the authorized CMS view, and sends through Resend with delivery state and retry behavior.
- [ ] Verify the quote PDF has CODEYEA branding/contact details and working editable additional-notes form field.
- [ ] Run Turnstile acceptance/rejection tests using production-hostname configuration in a safe staging environment; never put secrets in the repository or chat.
- [ ] Check every approved hero, page animation, navigation, footer, CTA, form, image, and section at desktop, tablet, mobile, landscape, and reduced-motion settings.
- [ ] Run auth/input/upload/CSP/rate-limit/secret/maintenance/AI endpoint review; run dependency audit and full tests/build.
- [ ] Complete English-first keyword mapping, internal-link coverage, schema checks including valid Product/Offer data, sitemap/canonical/robots/hreflang audit, and document off-page backlink opportunities separately from implemented code.
- [ ] Report pass/fail and external setup still required. Do not deploy or publish owner content.
