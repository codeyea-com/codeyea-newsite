# Homepage catalog synchronization, 2026-10-14

Owner scope: synchronize Homepage industry slides and services with the implemented pages, use the new industry artwork, restore the original Case Studies section with the six illustrated concepts, and preserve the section composition and motion.

## Result

- Fourteen industry cards use `industry-registry`, canonical bilingual labels and the generated general-page directory images. The original eight remain in their prior order; the six missing sectors follow them.
- Eight services use the shared `service-catalog`, including Website Design and Digital Marketing. Hosting stays in its separate existing menu. The same grid, word animations, icon transitions and stagger remain.
- Six concept case cards use the existing project carousel, cover images, localized company names, three category filters and article destinations. They remain explicitly labelled fictional with simulated results. Existing real-project approval checks are retained separately.
- English and Arabic case index/detail routes reuse the already implemented illustrated case renderer. Private authenticated case routes remain unchanged. All case responses are no-store and noindex/nofollow.
- Project carousel event handlers, Embla duration, expansion trigger, hover, shadow and reduced-motion handling remain. RTL desktop positioning mirrors the original displacement and rotation values, fixing the first card previously falling outside the screen.
- Industry card dimensions measured before and after: 341.333 × 455.111 CSS pixels at the same desktop viewport. No section order or corner changes.

## Checks

- 18 focused tests passed: catalog parity, image files, labels, all twelve case articles, language links, invalid route 404s, schema compatibility and prior service routing.
- TypeScript check passed; diff whitespace check passed.
- All 22 English service and industry destinations returned HTTP 200 on the local server.
- Native English homepage: six project cards, fourteen industry slides, eight service entries, project filtering (Automation returns Atlas and Safa), next/previous expansion and successful article navigation.
- Arabic desktop: mirrored first-card placement and expansion checked. Arabic and English mobile: four filters fit without horizontal page overflow, cards navigate and the introduction collapses using existing motion. A 390px outer review frame had 371 CSS pixels available after its scrollbar.
- Industry autoplay observed advancing; all fourteen sources are the new generated assets.
- Review uses the real Homepage/Carousel components and read-only marketing snapshots. The local wrapper includes a before/after industry comparison.

## Publication boundary

No CMS draft, published snapshot, user session or deployment was changed. Existing Arabic general/service/industry pages are still private CMS drafts: their public URLs remain unavailable until a separate publication step. Their canonical links are synchronized in the source; the Arabic homepage is provided as a local review. Case studies are available locally through the new article routes.

## Local review

`http://127.0.0.1:3011/homepage-catalog/review.html`

Native English homepage: `http://127.0.0.1:3014/#work`

Screenshots: `docs/homepage-catalog-review/`.

Rebuild review with `node --env-file=.env --import tsx scripts/build-homepage-catalog-review.ts`.
