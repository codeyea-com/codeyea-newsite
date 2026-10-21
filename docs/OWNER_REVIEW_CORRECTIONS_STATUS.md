# Owner review corrections, updated 2026-10-21

Active checkout: `.worktrees/real-site-updates`. Complete local application: http://127.0.0.1:3016/ar/ . No deployment, publishing, original-database updates or production CMS writes.

## Latest three requested items: complete

### Integrated hosting plans
- The approved design is integrated into Website, WordPress, Cloud and Email hosting in both languages, replacing the old pricing tables.
- All 15 original plans and their resource rows are retained. Monthly/annual switching and annual totals were checked in all eight actual pages. Existing rendered discounts are preserved: 20% for Website/WordPress/Cloud and 10% for Email.
- Details toggle by click and mouse hover, with animated height and panel entrance. Navigation buttons and keyboard controls work in both directions; actual pointer dragging was verified in the Arabic mobile carousel.
- Responsive layout verified: three desktop cards, two tablet cards, one mobile card with a visible portion of the next. Native scrollbar hidden; no page-width overflow. Shadow gutters retained.
- Evidence: `docs/bilingual-review/hosting-interactions.json`, `scripts/check-integrated-hosting-plans.ts`.

### Arabic/English page parity
- Compared 40 public page pairs, including all service pages, all hosting pages, Domains, Contact, the industry directory/details, and case-study directory/details.
- 404 corresponding image placements checked, along with responsive sources, inline backgrounds and section coverage. The sole intentional image variant is the translated Arabic CMS assistant interface on Website Design.
- Corrected six mismatched placements on Restaurants and Solar Energy. Arabic now follows the same English temporary-media fallback and final artwork selection, retaining translated alt text.
- Expanded 14 Arabic industry-directory introductions and 21 visible highlight items to carry the corresponding English meaning.
- Translated the remaining illustrative app UI on the Arabic homepage; corrected mixed-language mobile submenu labels, duplicate Contact and two sector-menu descriptions; removed an Arabic-only unconfirmed address placeholder absent from English.
- Fixed a functional review finding: optional empty SEO fields caused Arabic Services and some industry pages to switch to 404 after the initial content streamed. Valid pages now derive fallback metadata from their existing content.
- Evidence: `docs/bilingual-review/comparison.json`, `routes.json`, `scripts/check-bilingual-review.py`. All 80 routes pass without streamed render errors.
- Image-source parity does not claim a new creative-quality review or new owner approval of generated assets. No new imagery was generated.

### Approved text hover coverage
- Browser inventories completed on all 80 actual pages, not just a shared stylesheet inspection.
- Eligible text links use CODEYEA red and a small upward movement, without text shadows, underlines, fill backgrounds or box shadows. Removed the remaining Services link pseudo-element underline.
- Verified actual focused state: rgb(224,20,76), top -2px, text-shadow none, text-decoration none.
- Retained approved image-card effects, filled/outlined button effects, tab interactions, utility sheen and specialist interactive hero behavior.
- Evidence: `docs/bilingual-review/hover-coverage.json`; remaining exclusions inspected as buttons, cards or specialist tab controls.

## Earlier approved corrections retained
- Section-by-section sequential text entrances; centered wide hero crops without replacing assets.
- Synchronized Arabic/English industry menu icons; Services mega-menu case-study feature and divider.
- Industry service-list hierarchy, closer title spacing, eight service links, sector-specific copy and lightly separated related-industries section.
- Fully transparent initial homepage header, white navigation/light logo/red CTA, unchanged sticky design; mobile menu icon without a word; mobile-only outlined language button.
- Reduced Arabic homepage About spacing; centered hosting headings; full-width flip-card backgrounds and bottom CTA spacing.
- Approved Domains corrections: readable LTR domains, smaller domain under heading, balanced hosting scene/list alignment, subtle parallax, indigo sliding button hover, all-hosting CTA, Iraq extensions tab and repaired final CTA background.
- Arabic small FAQ labels use FAQs.

## Checks
- TypeScript passes.
- Hosting integration checks pass for eight language/page combinations.
- Fourteen bilingual menu-icon pairs, service lists and hero placements pass.
- Bilingual route/image/responsive-source checks and 80 browser link inventories pass.
- These checks do not claim a sitewide performance profile.

## Waiting for owner information only
- Additional case-study styling changes the owner said would be supplied later.
- Unrelated incorrect button destinations remain for the owner as instructed.

Old static previews on ports 3011/3014 are superseded. Use the complete application on 3016. All current changes remain local.
