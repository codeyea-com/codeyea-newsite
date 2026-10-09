# Local integration status — 2026-09-27

Owner decision: deployment to cPanel is the final step, only after the entire site is complete and explicitly approved. Node.js and PostgreSQL are available there. Nothing in this integration deploys or publishes new pages.

## Implemented and locally verified

- Fourteen approved HTML service/contact/hosting/domain templates imported as private `SiteDocument` drafts. Originals retained.
- Pages lists both imported pages and existing homepage/about/services/industry editors. Imported pages expose bounded text and SEO-description editing and authenticated previews.
- Versioned draft saves, previous-version history, optimistic concurrency protection, atomic audit entries and draft restoration.
- Posts can be created as English/Arabic drafts with title, slug, content, category and SEO description. Public blog presentation/publication is still pending.
- Contact and quote capture save to PostgreSQL before notification. Quote schema limits selection to two distinct services. Email recipients are server-controlled:
  - Contact: info@codeyea.com; codeyea.cda@gmail.com.
  - Quote: qays.zubaidi@codeyea.com; support@codeyea.com; codeyea.cda@gmail.com.
- Resend adapter, duplicate-submission handling, consent validation, honeypot, email-based hourly throttling and Leads inbox with status/retry controls. Missing Resend configuration retains the lead with an explicit waiting status. No test email was sent.
- Quote panel connected to imported private pages and existing React preview routes.
- Authenticated GA4/GSC/Clarity report adapters and an admin dashboard for GA4 totals/trends, Search Console clicks/impressions/CTR/average position, top queries and pages. Missing credentials display unavailable/configuration state, never fabricated numbers. GA4 overview totals use a dimension-free report; Search Console daily rows omit dates without data and query rows are provider-limited. Clarity requests use a four-hour process cache and its 72-hour export window.
- AI instruction queue saves page/version context only. It does not generate, execute or publish edits.
- Local verification: `npm test` — 79 passed; `npm run build` — passed. Read-only binding audit passed for all 14 stored template drafts. Browser visual/interaction verification has not been completed for this integration.
- Pages now includes a route-readiness table with planned URLs, private preview links and publication state. Sitemap generation validates published snapshots and excludes drafts, deleted pages, unsupported routes and mismatched content. It remains disabled unless `SITE_INDEXING_ENABLED=true`; this flag controls sitemap output, not all page metadata.
- Imported content is bound to a fingerprint of its approved main section. Rendering, saving and restoring reject changed template mappings; legacy drafts are checked by ordered field keys and labels. New imports receive the fingerprint without overwriting existing drafts.

## Remaining implementation/review

- Full visual and interaction comparison against approved templates, including responsive behaviour; never equate the static assertions with visual fidelity.
- Imported pages still render allowlisted approved template files. Full structured section/image/link editing remains to be completed. Template-version checks are implemented; an explicit migration workflow is still needed if an approved template changes. Overview animated headings now source their editable text from the saved main heading while retaining the approved animation.
- The approved mega-menu is now implemented in existing React preview headers as well as imported templates. Hosting includes five services and Domains follows it. Mobile service links are aligned. Imported contact and industry destinations are connected. Complete visual checks and the remaining in-page/footer destination audit.
- New pages remain private. Planned route mapping and the existing published-page sitemap are implemented. New-page public routes, publish workflow, canonical metadata and translated page relationships remain incomplete. Arabic availability in storage is not a translated Arabic site.
- Configure verified Resend sender/key securely; verify delivery using owner-approved test data. Stale SENDING retries are bounded to the provider idempotency window and older uncertain attempts require provider-log review. Add scheduled outbox processing. Email-only throttle and honeypot are not the complete launch anti-spam controls.
- Owner deferred creating analytics accounts until site completion (2026-09-27). CMS integration settings save GA4 measurement/property IDs, GTM container, GSC property/verification, and Clarity ID. Recognised IDs are extracted from pasted install snippets; arbitrary scripts are not stored or executed. Saves have permission checks, version conflicts and audit records. Public GA4/GTM/Clarity scripts are wired behind the CMS switch and visitor opt-in; the choice can be reopened, expires after 180 days, and revocation updates tag consent, clears known analytics cookies and reloads without tracking. Configure consent requirements for additional GTM tags. The current global CSP blocks external tracking hosts, so scripts will remain blocked until that security-boundary change is approved. Google report adapter currently accepts a server-side access token; durable OAuth refresh/account connection is still needed.
- Owner has no ranking subscription and requested a completely free starting plan. The owner rejected the Semrush recommendation; it is not selected. Its API is paid, so no automatic competitor API connection is implied. GSC will provide owned-site query reports when connected. No account or subscription was created.
- AI provider, proposal generation, scoped patches, review/approval and rollback workflow remain future work.
- Confirm real contact details, temporary media and commercial package terms.
- Complete operational backup/restore, retention, monitoring and release checks before launch. No cPanel deployment job is enabled.

## API references used

- [GA4 reports](https://developers.google.com/analytics/devguides/reporting/data/v1/basics)
- [Search Console queries](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Clarity export](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api)
- [Resend retry/idempotency window](https://resend.com/docs/dashboard/emails/idempotency-keys)
- [Google server-side OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)

## SEO and internal-link progress — 2026-10-07

- Homepage, Services and Industries CMS editors now expose bounded search titles and descriptions, and published-page metadata reads the saved values. Existing content receives compatible defaults; canonical URLs and index controls stay system-managed.
- Services page links now resolve published page IDs through the public route map, including nested industry routes, and skip pages without a publication timestamp or snapshot.
- Public homepage, About, Services, Industries, Roofing and industry-detail routes now emit consistent canonical, Open Graph and Twitter metadata. JSON-LD covers Organization/WebSite on Home, AboutPage or CollectionPage identity where applicable, and BreadcrumbList for internal routes.
- Imported CMS previews now render one CMS-backed description, Open Graph/Twitter tags, and WebPage/Breadcrumb JSON-LD while remaining `noindex,nofollow` at both HTML and response-header level. Hosting, WordPress/Cloud/Email Hosting, Domains and Technical Support preview pages additionally carry Product JSON-LD. Prices, stock and ratings are deliberately absent because commercial terms are awaiting confirmation; the product markup is not yet eligible for Google product rich results.
- Full public routing and publication for imported service templates remains pending. Keep their `/preview` destinations private until each public route is explicitly published and its links are bound to published targets.
- Structured-data validation: focused SEO readiness and industry identity tests pass. Live URL Inspection and Google Rich Results Test must wait until public routes are deployed and indexing is approved.
- Validation: focused SEO readiness tests passed; all 89 project tests passed; TypeScript and production build passed. The temporary isolated test database was stopped afterward.
