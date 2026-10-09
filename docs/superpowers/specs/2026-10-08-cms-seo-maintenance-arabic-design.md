# CODEYEA CMS, SEO, Maintenance, and Arabic Site Design

## Purpose

Extend the existing CODEYEA application and CMS so an administrator can select and manage every public page, edit page-level SEO with a realistic search-result preview, request AI-assisted content changes for review, enable maintenance mode with a private review link, and publish a complete Arabic RTL counterpart of the English site. Preserve the current Next.js, Prisma/PostgreSQL, Better Auth, Netlify, Neon, Turnstile, and Netlify Blobs architecture. Do not redesign approved public-page compositions or publish/deploy owner content as part of implementation.

## Current state observed

- The application already has a CMS with Pages and Posts sections, search, draft editing, revision history, publish operations, roles, audit events, media handling, and an existing route map.
- Locale and market fields already exist. Some preview/rendering paths support Arabic direction, and document routes reserve `/ar/` paths, but this does not prove that every public page has a complete Arabic translation or route.
- SEO fields currently center on title and description and vary by page editor. There is no unified SEO panel for every route and no Google-result snippet preview found in the CMS.
- The AI Agent panel only saves a future instruction proposal. It does not call a model, produce an editable content patch, apply changes, or publish.
- No global maintenance-mode setting or signed maintenance bypass preview flow was found.
- Production media is configured to use Netlify Blobs. Neon Object Storage is not required for this design.

## CMS page selection

Extend the existing Pages view rather than replacing the CMS. Present a searchable WordPress-style page index with title, route, locale, draft/published state, and last-updated information. Selecting a row opens that page's existing editor; a page selector remains available while editing so the administrator can switch pages without returning to the index. Keep page identity, approved layout, and section order developer-controlled unless the existing editor already exposes those fields.

The page index must be built from the actual route registry and CMS documents, not a second hard-coded list. It must identify routes that lack an editor or publication mapping and distinguish editable content pages from system routes such as login, preview, APIs, and the admin.

Across all content pages, preserve the requested CMS controls for replacing each page image, showing or hiding eligible sections, and editing copy with working rich-text controls. Reuse the media library and existing section visibility fields where available. Formatting must be functional and safely serialized; do not allow arbitrary scripts, styles, or raw HTML. Keep the approved design, section sequence, layout, and motion protected from content editing.

## Unified SEO editor and search preview

Add a typed SEO contract to every editable public page and locale. The CMS panel will expose SEO title, meta description, focus phrase for editorial guidance, canonical URL, index/follow controls, social title/description/image, and a supported structured-data type. Existing page-specific schema generation remains authoritative; editors cannot inject arbitrary JSON-LD, HTML, scripts, or head markup.

Complete the English-first international SEO pass for every public route: map target keywords to pages without keyword cannibalization, implement useful contextual internal links and verified route destinations, review necessary outbound references, and provide an off-page backlink opportunity plan for appropriate publishers and partners rather than automated link placement. Render page-appropriate schemas and validate them; use Product/Offer structured data only on genuine purchasable hosting, domain, and technical-support offerings, with truthful prices and availability. Include page-level titles/tags, canonical and hreflang consistency, sitemap/robots/indexing checks, social metadata, and a documented SEO issue report. Do not promise rankings or fabricate backlink metrics.

Show an updating desktop/mobile Google-style snippet preview based on the draft values, visibly labeled as an estimate because search engines may rewrite snippets. Persist SEO fields in draft/revision/publication snapshots, render metadata and structured data only from the published snapshot, and keep private previews noindex. Validate canonical host and route, bounded text, required titles/descriptions, locale consistency, and safe image references before publish.

Keep the Google snippet preview separate from SEO analytics. The CMS analytics view must present real GA4 and Search Console data visually, matching the supplied Rank Math dashboard references: KPI cards for traffic, impressions, clicks, CTR, average position, and keyword totals; date-filtered trend charts; ranked query/keyword tables with position history; and top-performing pages. Clearly identify the data source and period, and show a connection/permission state instead of invented sample values when provider data is unavailable. The current analytics dashboard components are the starting point; verify their live provider connections and coverage before extending them.

Retain CMS configuration for GA4, Google Tag Manager, and Search Console; keep Microsoft Clarity optional. Preserve visitor-consent gating for analytics scripts, prevent duplicate GA4 loading through both direct gtag and GTM paths, and keep reporting credentials server-side. Verify each configured property separately for site tracking and CMS report access.

## AI-assisted editing

Replace the future-agent placeholder with an authenticated CMS assistant. It accepts a natural-language instruction and a selected page, reads only that page's current draft and allowed site context, and returns a schema-validated proposed patch plus a concise explanation. Show the patch as a reviewable diff with apply and discard actions. Applying creates an ordinary unsaved editor change; saving, publishing, and restoring remain separate permission-checked actions with the existing revision and audit protections.

Model credentials remain server-only and configurable through deployment secrets. The implementation uses a provider-neutral adapter and must show a clear unavailable state until a real provider and key are configured; it must not imply that a mock response is a live AI result. Bound request size, rate-limit use, validate output against the selected page schema, and reject changes to route identity, permissions, integrations, secrets, or protected design/layout fields.

## Maintenance mode and private review link

Add an audited, permission-controlled site-wide maintenance switch and editable maintenance message in CMS settings. While enabled, public page routes return a branded maintenance response with an appropriate 503 status and noindex directives. Authenticated CMS/admin routes and APIs remain accessible.

The administrator can generate a cryptographically signed, expiring review URL. Opening it grants a short-lived secure preview session for published pages while maintenance mode is active. The link is revocable, is not displayed to public visitors, and all pages viewed through it remain noindex. Do not bypass maintenance for arbitrary query parameters or expose a permanent reusable secret. Public lead submissions are rejected with a maintenance response while the site is closed; authenticated administrative previews cannot create real submissions.

## Lead collection and delivery

The application already has a lead intake endpoint, persistent Lead records, Turnstile verification, a CMS Leads view, lead status updates, and retryable Resend notification. Quote requests generate a branded PDF with an editable additional-notes field. Preserve and complete this existing flow rather than creating a parallel lead system. The route audit must verify every public contact/quote form submits to the same protected intake, every accepted lead is visible to authorized CMS users, delivery states and retry protections are clear, and the quote PDF remains editable. Validate actual Resend and Turnstile credentials in the target environment before enabling public forms; never report delivery as verified based only on code presence.

## Visual and technical release checks

Review every current public page at desktop, tablet, and mobile widths. Confirm that each approved new hero is the one rendered on its page, industry-page entrance/hover motion matches the approved site behavior, reduced-motion remains usable, and header/navigation/footer, forms, internal links, and CTAs work. Run a focused security review of authentication, authorization, server inputs, uploads, secrets, rate limits, headers/CSP, and lead/AI/maintenance endpoints. Confirm public source and metadata contain CODEYEA branding/copyright and no development-only attribution or exposed implementation secrets. Record findings and verified fixes; do not claim external scan results that were not run.

## Route completeness and Arabic counterpart

Use the shared route registry to compare public routes with CMS records, publication state, navigation links, CTAs, sitemap entries, metadata, and locale counterparts. Report broken or unpublished destinations in CMS before enabling the final publish readiness state. Keep system and preview routes out of the public sitemap.

Create Arabic equivalents for all public content routes under `/ar/`, initially retaining each route's stable English path segment after the locale prefix. Each Arabic page gets its own editable draft and published snapshot, translated page copy and SEO fields, `lang="ar"`, `dir="rtl"`, canonical URL, and reciprocal `hreflang` links to the English counterpart. Arabic publishing is independent from English publishing; untranslated pages remain unpublished and noindex rather than silently showing English under an Arabic URL. Preserve approved page layouts and interactions across locales.

Arabic copy must read as friendly, natural marketing copy written for Arabic readers, not a literal or sentence-by-sentence translation. Research and assign relevant Arabic search phrases per page and write localized titles, descriptions, headings, and calls to action around actual CODEYEA services. Do not label AI-assisted copy as human-translated. Keep Arabic content in draft for editorial approval before publication; if the owner requires genuinely human-authored copy, that approval must come from a human editor.

## Security and operational boundaries

- Reuse existing Better Auth sessions, permission checks, origin validation, optimistic version checks, revision transactions, and audit logging.
- Keep database, AI, analytics, email, and Turnstile secrets server-side. Never return provider secrets in CMS reads or previews.
- Sign review tokens with an existing high-entropy server secret, enforce expiry and revocation, avoid logging token values, and use secure HTTP-only SameSite cookies after link redemption.
- Keep maintenance settings and AI actions restricted to authorized administrators; audit toggles, token generation/revocation, AI proposals, accepted patches, and publication separately.
- Preserve consent gating for visitor analytics and existing public-form Turnstile verification.
- Do not deploy, migrate the production database, switch DNS, enable indexing, or publish owner content during implementation.

## Delivery stages

1. Map every route, CMS document, editor, metadata source, current link destination, and locale record; correct the page index/selector using existing CMS records.
2. Implement unified page-level SEO persistence, metadata rendering, structured-data validation, the draft Google-style snippet preview, and verify/complete the graphical GA4/Search Console performance dashboard using real provider data.
3. Implement the audited maintenance switch and revocable expiring preview-link flow.
4. Implement the provider-neutral AI assistant with validated reviewable patches and no automatic publishing.
5. Complete Arabic page records, translation-ready CMS fields, RTL rendering, localized metadata, canonical/hreflang, and route linking.
6. Verify all contact/quote forms, CMS lead review/status controls, Turnstile validation, Resend delivery, and editable quote PDF; complete the responsive/motion, source/privacy, security, keyword, linking, schema, and indexing audits; then run focused tests, full type/build/integration/browser tests, and dependency checks. Document only remaining external credentials or off-page work that requires the owner's relationships or outreach.

## Acceptance criteria

- An administrator can find and switch between every editable public page from one searchable page index.
- Every public page and locale has editable SEO metadata and a draft snippet preview; published HTML reflects only the published values.
- SEO analytics are presented as interactive charts and keyword/page tables backed by real GA4 and Search Console data, with clear empty and unavailable states.
- The AI assistant returns schema-valid changes for review, and cannot save/publish without the corresponding human action and permission.
- Maintenance mode closes public pages, leaves CMS accessible, and permits review only through a valid, unexpired, revocable link; responses are noindex and public lead intake is closed.
- Every live contact/quote form stores the lead, exposes it in the authorized CMS Leads view, reports delivery state, and sends the quote PDF with editable notes after real provider credentials pass an end-to-end test.
- Every supported English public route has an Arabic counterpart or is explicitly reported as incomplete; published Arabic pages render RTL and contain correct canonical/hreflang metadata.
- Every eligible section and image can be controlled in the CMS without changing protected design/layout, and all public routes pass the English-first keyword, internal-link, structured-data, responsive, motion, and security checks.
- Internal links, navigation, CTAs, sitemap, robots rules, schema types, and page status pass automated checks; no unsupported route is silently represented as complete.
- No production deployment or owner publication occurs without separate explicit authorization.
