# Homepage correction pass 3 — final approved report

2026-09-16. The four requested corrections and subsequent Services copy adjustment are complete. The owner approved **private draft 17**. Open the authenticated [private preview](http://127.0.0.1:3000/preview). No deployment, publication, WordPress change, new destination or external integration occurred.

Open the [capture and recording gallery](homepage-correction-3/index.html) for all evidence.

## Final approved Services copy — draft 17

After reviewing draft 16, the owner requested roughly two additional lines for each service description while approving the title and subtitle. One useful supporting sentence was added to each of the eight descriptions, then the owner approved the result.

The normal CMS save used expected version **16**, producing draft **17**, revision `cmu483u9e000000i194op8cjj` and audit entry `cmu483u9p000100i1kqiyic44`. Only the eight Services body fields changed. Title, subtitle, all other homepage content and the published snapshot were preserved.

See the [final approved Services capture](homepage-correction-3/services-balanced-1440.png) and [eight-field comparison](homepage-correction-3/services-copy-balance.json). The saved result was visually inspected and checked for horizontal overflow at 1440, 768 and 390 px; none was found. This was a content-only change, so the code verification results below remain applicable. Earlier draft-16 captures and comparisons are retained as historical evidence, not the final Services wording.

## Initial correction history — draft 16

The authenticated normal `PATCH /api/cms` save used expected version **15**, creating private draft **16**. Only nine fields changed, copied exactly from saved revision **13**:

- `homepage.services.items[service-1].body` through `homepage.services.items[service-8].body`: the eight concise summaries, each 8–13 words.
- `sections[homepage-positioning].body`: the earlier short supporting statement; no extra line added.

No heading, taxonomy, ID, order, media reference, enabled flag, destination or other section content changed. The fuller Who We Are, Experience, Service Flow and footer copy remains intact.

The normal save recorded revision `cmu43pqh50004p0i19uw5hn33` and audit entry `cmu43pqhn0005p0i167l21a76`. See the [nine-field before/after comparison](homepage-correction-3/draft-comparison.json) and [actual CMS comparison capture](homepage-correction-3/cms-revision-comparison.png). The CMS screenshot previews the hypothetical differences if version 15 were restored; no restore was performed.

Published snapshot SHA-256 remained `6000145995b6c0f809e7fb6f0ef802563dfe833bbb2761177b467f5a9f6a3d30`. [Post-verification record](homepage-correction-3/post-verification.json).

## Exact component changes

| File | Change |
| --- | --- |
| `src/styles/homepage-final.css` | Left-aligned Services introduction on the content-grid edge; navy heading and near-black introduction/card body copy. One shared light-main background with continuous 1px, 9% navy rules: four desktop tracks, three tablet tracks, two mobile edge tracks. No per-card borders. |
| `src/components/sections/homepage-flow-action.tsx` | Shared anchor/`type="button"` presentation; missing destination stays focusable without navigating. RequestAnimationFrame interpolation, maximum ±4px movement, exact centre return, fine-pointer/reduced-motion checks and touch press/release handling. Removed visible destination-status copy. |
| `src/styles/homepage-editorial.css` | Transparent resting circle and dark label/plus; ink circle and white plus during interaction; pink animated underline, external keyboard outline, no coarse-pointer/reduced-motion following. |
| `src/components/sections/homepage-carousel.tsx` | Industries uses `loop: false`, unique finite snaps, existing 16px gaps, accurate end controls/count/progress. Autoplay advances after 5 seconds; at the end it waits 6 seconds, fades out for 180ms, jumps invisibly to the first card and fades in for 220ms. Interaction/environment changes cancel a pending reset. |
| `e2e/homepage-correction-3.spec.ts` | Four focused acceptance tests using only the dedicated test database and test accounts. |

Projects carousel behavior, navigation, footer, content architecture and Service Flow content density were not reopened.

## Acceptance evidence

| Requirement | Captures / recording |
| --- | --- |
| Entire Services section | [1440](homepage-correction-3/services-1440.png), [768](homepage-correction-3/services-768.png), [390](homepage-correction-3/services-390.png) |
| CTA states | [Default](homepage-correction-3/cta-default.png), [hover](homepage-correction-3/cta-hover.png), [keyboard focus](homepage-correction-3/cta-keyboard-focus.png) |
| CTA movement and return | [Close-up recording](homepage-correction-3/cta-pointer-interaction.webm), [measured offsets](homepage-correction-3/cta-motion.json). Four pointer positions, label hover, leave/centre return and keyboard focus/blur. The thin pointer marker is recording-only. |
| Finite final-card boundary | [Desktop](homepage-correction-3/industries-final-1440.png), [mobile](homepage-correction-3/industries-final-390.png) |
| Penultimate → final → pause → first | [Desktop recording](homepage-correction-3/industries-rewind-1440.webm), [mobile recording](homepage-correction-3/industries-rewind-390.webm). Setup occupies the first few seconds; the complete 07 → 08 → 01 sequence follows. |
| Shared multi-section grid | [1440](homepage-correction-3/page-grid-1440.png), [768](homepage-correction-3/page-grid-768.png), [390](homepage-correction-3/page-grid-390.png), [native-size reference comparison](homepage-correction-3/grid-reference-comparison.png) |

Section captures omit fixed navigation/skip-link overlays to show complete sections. Services/grid captures use reduced motion to settle entrance effects; interaction recordings use normal motion. Rendered captures and sampled recording frames were inspected, not inferred from test results.

## Verification

- **4 focused browser tests passed:** alignment/colors at all three widths, concise saved summaries, zero horizontal overflow, no card borders; placeholder and isolated configured-anchor modes; default/hover/focus, bounded movement and exact zero return; coarse touch press/release and keyboard focus; reduced motion; finite arrows/count/progress, eight unique Industries cards and 16px spacing; mouse drag and emulated touch swipe; held-pointer, hover, focus, offscreen and hidden-tab pauses. Hidden-tab checks simulate the visibility event while retaining a running test clock.
- **36 isolated integration tests passed**, including stale-save rejection, atomic revision/audit writes, rollback, permissions, publication separation and owner-database isolation.
- **TypeScript passed. Production build passed.** Local production preview restarted on port 3000.
- A separate read-only code review found no substantive issues. The final held-touch correction also passed its new browser test.

## Visual comparison and remaining boundaries

The Services introduction now starts at the same left line as the first card. Short summaries restore the lighter density. The approved newer heading/taxonomy remains, so heading wrapping differs from the old WordPress wording; the short supporting statement wraps naturally on narrower screens. Existing responsive columns remain.

The shared rules are visibly stronger than the former nearly invisible texture and slightly stronger than the supplied reference crop, while remaining pale behind text. The close crop shows their 1px weight. No card-specific separators or horizontal grid lines were introduced.

Industries ends with Small Business, previous cards to its left and equal gaps; Healthcare does not appear beside the last card. The recorded return uses a short opacity reset rather than backward travel through intermediate cards.

Owner Service Flow destinations remain unconfigured. Their CTA is an interactive placeholder without navigation. The anchor branch was verified against the implemented `#services` target only in isolated test content; no service page or fake URL was added. No other copy was expanded. Stop here for owner review.
