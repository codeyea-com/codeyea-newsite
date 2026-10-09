# CODEYEA SEO readiness audit — 7 October 2026

Scope: English-first, worldwide. Arabic is a later, separate language release. This is a code/template audit, not a crawl of a launched site. Search Console, keyword-volume, competitor and backlink data are not connected, so no search-volume, difficulty or ranking claims are made. No content was published.

## What was checked

- The four shared React pages, 14 Industry detail routes, 14 imported service/hosting/domain/contact templates, metadata, canonical URLs, sitemap, preview protection, and link rendering.
- The 14 imported templates each have exactly one H1 in `<main>`. Each source contains about 50 `/preview` links, mainly repeated in the shared navigation/footer. Their private previews are intentional, but those destinations cannot appear unchanged in public output.
- All 14 source templates have image alt attributes on their main `<img>` elements; this checks presence, not whether the descriptions are useful. None contains a canonical tag yet. Nine have a source meta description of only 30–36 characters because they are design previews; the public descriptions need deliberate copy.
- Every in-page `#anchor` found in those 14 source templates currently matches an element ID. That does not verify links across pages or the eventual public routes.
- Their current absolute outbound links point only to `codeyea.com` or `hosting.codeyea.com`; no third-party authority links or earned backlinks were found or credited as part of the templates.
- Imported templates are private `SiteDocument` drafts. They do not have public routes or sitemap entries yet; their current renderer adds `noindex,nofollow`. The blog also lacks a public publication workflow.
- Site-wide link and content QA cannot be called complete until the template-to-CMS conversion and public routing are done.
- Production-build runtime check with the existing local database: Homepage and About returned 200, one H1, descriptive title, canonical and `noindex,nofollow` while the release switch was off. Services, Industries and Roofing returned 404 because they have no published snapshot. Private preview redirected to login. Sitemap had no URLs. The temporary verification server and database process were stopped afterward.

## Technical findings and status

| Priority | Finding | Status / required completion |
| --- | --- | --- |
| Critical | Public pages previously mixed indexing rules: Homepage inherited `noindex`, Services was always `noindex`, and About/Industries/Industry details could become indexable while the release switch was off. | Fixed in code: public route metadata now uses one publication + `SITE_INDEXING_ENABLED` rule. No switch was enabled. |
| Critical | The current Homepage contains design-review text and unapproved client/price claims. | Keep indexing disabled until this visible review content is removed through the approved content/design workflow and claims are verified. |
| High | Public Homepage description said “static homepage design review”. Services had no description or canonical. | Fixed in code with descriptive English metadata, canonical URLs and Open Graph defaults. Review final business wording before launch. |
| High | Fourteen imported pages have no public route or sitemap inclusion. | Private previews now render page-specific Open Graph/Twitter tags and WebPage/Breadcrumb JSON-LD; their robots and response headers remain `noindex`. Canonical URLs and public routes are intentionally pending CMS publication. Do not expose preview URLs as canonical pages. |
| High | Imported source templates include `/preview` navigation/footer links. | Pending public link binding. Replace only with published destinations; preserve approved visual structure. |
| High | Many service-detail CTAs are absent because destinations are intentionally null until routes exist. | Activate relevant internal links only after their targets are public and return 200. |
| High | The Industries directory previously had a permanently empty destination registry, so its detail links would stay disabled after publication. | Fixed in code: directory headings and CTAs now link only when the destination has a published snapshot. |
| Medium | Some template source titles still say “Design preview”. | Replace in public metadata during conversion. Private previews may retain preview labels. |
| Medium | The approved Contact template's H1 says “Creative Design Agency,” not “Contact.” The Website Design, Brand Design and E-Commerce H1s are creative slogans rather than direct query terms. | Preserve approved visible design/copy until the owner reviews changes. Use accurate title, introduction and contextual body copy; do not add a second or hidden keyword-stuffed H1. |
| Medium | The imported preview renderer appended second robots and description meta tags on top of the source tags. | Fixed in code: it now replaces an existing tag and keeps one of each. Private previews remain noindex. |
| Medium | Per-page SEO title/description editing was uneven across structured pages. | Fixed 7 October: Homepage, Services and Industries now have bounded CMS search title/description fields connected to rendered metadata; About and industry detail already had them. Canonical paths and language alternates remain system-controlled. |
| Medium | Public pages lacked consistent social metadata and most structured data. | Fixed 7 October: public routes now emit canonical, Open Graph and Twitter metadata; homepage has Organization/WebSite/WebPage JSON-LD, and About, Services, Industries and industry routes have page and breadcrumb markup. CMS previews render WebPage/Breadcrumb markup. |
| Medium | Commercial hosting, domain and technical-support pages had no purchase entity markup. | Fixed 7 October in CMS rendering: hosting variants, domain registration and technical support include Product JSON-LD. Prices, availability and reviews are omitted because package terms are not verified. This entity markup alone does not qualify pages for Google product rich results; publish specific purchasable offer details only after verified pricing is approved. |
| Medium | No verified keyword demand, current queries, backlink baseline or crawl/performance measurements. | Connect Search Console after launch, then prioritize using impressions, clicks, intent and conversions. |
| Medium | Arabic content storage does not yet equal an Arabic site. | Publish translated Arabic pages at distinct URLs before reciprocal `hreflang`; never label English copy as Arabic. |

## English keyword map

These are **candidate query themes**, chosen for service intent and relevance to visible page subjects. They are not volume-ranked. Each public page should own one main intent and a few natural variants; keep titles, H1, body and anchor text aligned without repeating phrases mechanically.

| Page | Primary intent | Supporting language |
| --- | --- | --- |
| Homepage | digital innovation agency | website design, apps, SEO, branding |
| Services | digital services for businesses | website development, marketing, automation |
| About | about CODEYEA digital agency | team, approach, technical and creative partner |
| Industries | digital solutions by industry | industry websites and workflows |
| Website Design | custom website design services | business website development, responsive website design |
| Brand Design | brand identity design services | visual identity, graphic design |
| E-Commerce service | ecommerce website development | online store design, ecommerce integrations |
| SEO & GEO | SEO and GEO services | technical SEO, generative engine optimization |
| Digital Marketing | digital marketing services | campaign strategy, social media marketing |
| Web & Mobile Apps | web and mobile app development | custom web app, mobile application development |
| AI & Automation | AI workflow automation services | business process automation, AI assistants |
| Technical Support | website technical support | website maintenance, migration and repair |
| Website Hosting | business website hosting | managed website hosting, hosting plans |
| WordPress Hosting | managed WordPress hosting | WordPress website hosting and maintenance |
| Cloud Hosting | managed cloud hosting | scalable cloud hosting for businesses |
| Email Hosting | business email hosting | custom domain email hosting |
| Domains | domain name registration | register a business domain name |
| Contact | contact CODEYEA | request a project quote |

Industry pages should answer the industry's actual buying questions, not repeat the same service list with only an industry name swapped:

| Industry | Candidate primary theme | Useful supporting angle |
| --- | --- | --- |
| Roofing | roofing company website design | estimates, project galleries |
| Healthcare | healthcare website design | patient information, booking journeys |
| Construction | construction company website design | projects, enquiries |
| E-Commerce industry | digital solutions for e-commerce businesses | operations, retention; distinct from store-build service |
| Small Business | small business website design | lead capture, practical maintenance |
| Event Coordinators | event planning website design | booking and event portfolios |
| Legal | law firm website design | practice areas, consultations |
| Online Magazine | online magazine website design | publishing structure, editorial workflows |
| Oil & Gas | oil and gas company website design | corporate credibility, project information |
| Real Estate | real estate website design | listings and enquiry journeys |
| Fashion & Lifestyle | fashion brand website design | collections, campaigns |
| Beauty, Skincare & Med Spa | med spa website design | treatments, booking |
| Restaurants, Cafés & Bakeries | restaurant website design | menus, reservations and ordering |
| Solar Energy | solar company website design | projects, quote requests |

Do not add a geographical modifier until a real market-specific offering and supporting content exist. Confirm terminology against Search Console and actual enquiries after launch. Google Trends provides *relative* interest, not absolute volume.

## Internal link plan

1. Homepage → Services, Industries, Contact, and the most relevant published service pages. Use the visible service names as descriptive anchors.
2. Services → each matching service detail page; About → Services and Contact; Industries → every enabled published industry page.
3. Industry detail → one or two relevant service pages, related industries, and Contact. Keep existing related-industry navigation; add contextual links where the body actually discusses that service.
4. Website Design ↔ Brand Design, SEO & GEO, Website Hosting. E-Commerce ↔ Digital Marketing and Email Hosting where context supports it. Web & Mobile Apps ↔ AI & Automation. Hosting ↔ Domains, WordPress Hosting, Cloud Hosting and Email Hosting.
5. Every destination must be a real public 200 URL. Do not link public content to `/preview`, `/admin`, unpublished pages, bare `#` placeholders or disabled buttons masquerading as links. Never force a link solely to repeat a keyword.
6. Add a link audit to release checks: crawlable `<a href>`, descriptive anchor, no orphaned indexable page, redirects and broken destinations checked against the published route set.

## External / off-page links

- **Outbound from CODEYEA:** Link to a trustworthy primary source only when it helps explain a claim (for example a platform specification or research cited in an article). Check the destination and give it human-readable anchor text. Do not scatter irrelevant authority links across sales pages.
- **Inbound to CODEYEA:** Prepare accurate business profiles, real partner/vendor listings where CODEYEA has a relationship, approved client case studies, original technical articles or tools worth citing, and relevant industry collaborations. Record source, destination, status and referral results. No paid ranking links, automated directory submissions or reciprocal-link schemes.
- No off-page backlinks were created or claimed in this audit. Search Console's link report will establish the measured baseline once connected.

## Arabic release contract

Use distinct Arabic URLs (planned `/ar/...`), fully translated main content/navigation and Arabic search-intent research. Each language page owns its canonical URL. Add reciprocal `hreflang="en"` and `hreflang="ar"` only when both versions are public and substantively translated. Keep unpublished/missing counterparts out of alternates and sitemaps. Verify RTL and `lang="ar"` on rendered pages.

## Release verification

- Crawl all published routes at desktop/mobile widths: 200 response, one meaningful H1, unique title/description, self-canonical, no accidental noindex, correct OG, real links, usable images/alt text and no preview links.
- Confirm sitemap contains only public canonical routes, private/admin/API paths remain excluded, and robots.txt references the sitemap only when indexing is enabled.
- Check representative content with JavaScript disabled and with Search Console URL Inspection/Rich Results Test after deployment. Measure Core Web Vitals and fix demonstrated regressions.
- Only after launch: submit sitemap, connect Search Console, measure query/page performance and leads, refine the candidate keyword map. Do not promise a ranking position.

## Primary guidance

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Links and anchor text: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Titles: https://developers.google.com/search/docs/appearance/title-link
- Sitemaps and canonicals: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap and https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Link spam policy: https://developers.google.com/search/docs/essentials/spam-policies
- Google Trends data limitations: https://support.google.com/trends/answer/4365533
