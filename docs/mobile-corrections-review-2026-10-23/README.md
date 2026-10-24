# Owner mobile corrections and hosting specifications

Owner-authorized release, 2026-10-23 (America/Chicago). Publication and CMS synchronization were explicitly requested. The original 30-item brief and 45 image references remain preserved in the main workspace at `docs/mobile-corrections-2026-10-23/`.

## Scope by language

- Both languages, BI-01 through BI-23: language-button contrast; compact animated heroes; restore Brand/Ecommerce hero scenes; matched carousel arrows; text-only project-filter hover; faster mobile hero and industry autoplay; persistent project filters and rail height; shorter About card transitions; horizontal touch filmstrip; title/image/copy ordering on the eight specified introductions; contained image captions; single-row hosting navigation; one-plan touch gestures; one-card vertical wheel/touch gestures; mobile copy-only hosting cards; domain and industry drag indicators; Iraq-tab entrance and contact action; duplicate FAQ label removal; complete industry-section entrances; remove extra Explore submenu links.
- Arabic only, AR-01 through AR-06: smaller hero eyebrows; matching text-container gutters; RTL experience counter with a 16px number/label gap; right-side About markers; separate filled/outlined marquee lines; smaller normal-weight mobile menu.
- English only, EN-01: Services FAQ matches the Web Design mobile heading, line height, white background, 60px section padding, 25px gap and sticky position.
- Four hosting pages, both languages: preserved approved Customer stories composition adapted to six server features. Owner-supplied cPanel, JetBackup, WordPress and Imunify360 artwork, two email icons, grayscale-to-color hover, manual navigation and seven-second autoplay. The requested black top padding is 56px.

## Validation

- Production build and TypeScript completed successfully. The pre-existing Next.js installation emitted a security advisory; no dependency changes were included in this design release.
- Five hosting/CMS tests passed, including six distinct features in both languages, public/preview rendering, escaped CMS text, visibility and serialized validation.
- Eighteen mobile hero/intro measurements: no document horizontal overflow. See `hero-checks.json`.
- All fourteen industry galleries in both languages attach the draggable controller and translated indicator without document overflow. See `gallery-checks.json` and `industry-drag-ar.png`.
- Native browser dragging advanced the Arabic industry gallery without opening its photo dialog; the translated indicator appeared during the drag.
- Native wheel bursts advanced one vertical hosting card per burst. On a 390 by 667 frame, Arabic copy fits the 575px card without internal scrolling. Hosting tabs share one 55px row.
- Browser checks confirmed title/image/copy ordering, persistent project filters and rail height, 23px/400 Arabic main menu, 13px hero eyebrow, 16px RTL experience gap, right-side About markers, Iraq contact link and one FAQ label.
- Review CMS branch: eight documents, six slides each, draft/public feature values equal. Four existing Arabic records retain every unrelated draft field and other addition. Immutable revisions and before/after audit records are included in the guarded production transaction.
- Browser frame checks are desktop-browser mobile-width reviews; physical phone touch has not been exercised. The existing integration suite has two independently reproduced baseline failures recorded in `docs/server-specs-review-2026-10-23/baseline-check.json`.

## Release sequence

Deploy the compatible schema and renderer first, then apply the guarded eight-document CMS transaction to production. Verify the public English and Arabic pages after the CMS write. Production deployment and synchronization identifiers are recorded separately after completion.
