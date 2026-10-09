# CODEYEA SEO Route and Linking Plan

Status reviewed: 2026-10-08. Target market: worldwide, English-first. This is a route and intent map, not a keyword-volume report. Candidate phrases must be validated against Search Console after the site has verified impressions; no search-volume or ranking claims are inferred here.

## Public route inventory

Template page routes are now backed by English and Arabic public renderers, a publish/unpublish workflow, canonical and robots metadata, and sitemap integration. A route is live only after its matching page document is explicitly published. The CMS page catalog lists every registered route, including missing records, and can create private English drafts from the approved template designs in one action. Arabic route records remain flagged until human-written Arabic copy is ready; English copy is never published as an Arabic translation.

| Public route | Search intent / candidate phrase | Supporting terms | Internal links to build/verify | Current release state |
|---|---|---|---|---|
| `/` | digital agency for business growth | web design, SEO, digital marketing, automation | Services, Industries, About, Contact/quote | Public route; indexing controlled by `SITE_INDEXING_ENABLED` |
| `/about/` | CODEYEA digital agency | digital innovation agency, team, approach | Services, Industries, Contact/quote | Public route |
| `/services/` | digital services for businesses | web design, mobile apps, eCommerce, SEO, hosting, automation | Website Design, SEO & GEO, AI & Automation, Web & Mobile Apps, eCommerce, Digital Marketing, Brand Design, relevant industries, Contact | Service cards now target their registered detail routes; links appear when each destination is published |
| `/industries/` | digital solutions by industry | industry website design, industry marketing | Every industry detail, Services, quote | Public route |
| `/industries/healthcare/` | healthcare website design | medical practice web design, patient enquiries | Services, related industries, quote | Public route |
| `/industries/construction/` | construction website design | contractor web design, project enquiries | Services, Roofing, Real Estate, quote | Public route |
| `/industries/e-commerce/` | eCommerce website development | online store development, ecommerce UX | Services, Small Business, quote | Public route |
| `/industries/small-business/` | small business website design | small business digital marketing, local business website | Services, industries, quote | Public route |
| `/industries/event-coordinators/` | event planner website design | event booking website, event marketing | Services, eCommerce, quote | Public route |
| `/industries/legal/` | law firm website design | legal website development, client enquiries | Services, Small Business, quote | Public route |
| `/industries/online-magazine/` | online magazine website development | digital publication, editorial website | Services, eCommerce, quote | Public route |
| `/industries/oil-and-gas/` | oil and gas website design | energy-sector digital services, industrial web development | Services, Construction, quote | Public route |
| `/industries/real-estate/` | real estate website development | property website, real estate lead generation | Services, Construction, quote | Public route |
| `/industries/roofing/` | roofing company website design | roofing lead generation, contractor website | Services, Construction, quote | Public route |
| `/industries/fashion-and-lifestyle/` | fashion eCommerce website design | lifestyle brand website, fashion online store | Services, eCommerce, quote | Public route |
| `/industries/beauty-skincare-med-spa/` | med spa website design | aesthetic clinic website, skincare eCommerce | Services, Healthcare, eCommerce, quote | Public route |
| `/industries/restaurants-cafes-bakeries/` | restaurant website design | cafe website, bakery website, online ordering | Services, eCommerce, quote | Public route |
| `/industries/solar-energy/` | solar company website design | renewable energy website, solar lead generation | Services, Construction, quote | Public route |

## Routes needing implementation before they can earn organic traffic

The 14 registered English page templates now have public routes and can be initialized from the CMS as private drafts. Before they can earn organic traffic, review their page copy, image replacements, canonical and social metadata, contextual internal destinations, schema, and publication state. Keep SEO indexing off until Search Console verification, redirects, lead delivery and the release checks pass. Product/Offer data must only be emitted once actual offer terms, prices, currency and availability are verified.

The `/ar/` counterparts are not implemented yet. Arabic routes must receive separately written Arabic copy, RTL review and independent metadata before publication; English content must never silently appear at an Arabic URL.

## Page-level SEO controls and technical rules

- The CMS SEO editor stores page title, meta description, editorial focus phrase, robots index/follow, social metadata and an optional registered media-library image in versioned drafts.
- Public metadata reads the published snapshot. Unsaved and unpublished edits must stay private.
- Canonical paths must remain same-site and match the page's registered route; arbitrary redirects, query strings and fragments are rejected.
- Site-wide indexing remains disabled until redirects, page content, canonical URLs, real lead delivery and Search Console verification pass the release check.
- Structured data should describe the visible page. Product markup belongs only on genuinely purchasable hosting, domain and support offers; do not add ratings, prices or availability that the page does not show.
- Maintain descriptive image alt text, one clear H1, specific title/description per route, descriptive internal-link anchors and a useful 404 page.
- GA4/GSC charts must show provider data with its reporting period and unavailable/error state. Do not substitute sample values. GTM is tag delivery, not a reporting source.

## Internal-link implementation order

1. Global and footer links in approved templates now resolve to real public routes; private preview and CMS destinations are removed from public HTML.
2. The Services page has contextual links to implemented service templates. Industry service and related-industry items resolve to their matching registered page when no explicit destination is saved. Explicit CMS destinations take priority, and every inferred link activates only after its target is published.
3. Industry and service renderers receive the complete set of published main-page and template routes. This prevents dead links while allowing the same approved copy to become linkable once its destination is live.
4. Template pages include breadcrumbs and only published, indexable routes enter the sitemap.
5. Run a link checker against the production build and validate CMS-selected destinations against the registered route catalog before launch.

## Off-page authority plan

Earn relevant links rather than purchasing bulk links or automating placements. Prioritize verified client case studies with permission, partner/vendor directories, design/development associations, local business and chamber directories where CODEYEA has a genuine listing, and useful technical or sector articles offered to relevant publications. Record prospect, relevance, outreach status and resulting URL in an editorial tracker; never represent an opportunity as an existing backlink. Review referring domains and page-level queries in Search Console and a backlink index after launch, then refine the content plan around observed data.

## Validation checklist

- [ ] Verify route inventory against the deployed origin and ensure every intended public route returns the expected status.
- [ ] Check unique title/description, canonical, robots, Open Graph and schema for each published route.
- [ ] Confirm links resolve and sitemap contains only published, indexable routes.
- [ ] Verify Google Search Console property and sitemap after domain launch; wait for real data before choosing winners or losers.
- [ ] Revisit candidate keyword clusters using actual query, country, device and landing-page data; keep global English as the current targeting assumption.
- [ ] Track off-page outreach separately from on-page implementation.
