# About Showcase numbered slider

Ready for owner review. Saved privately as About draft **5** (previously 4). Nothing published or deployed.

## Implemented

- Three fixed slides: Social Media Management, Mobile Development, eCommerce Solutions.
- Original clean WordPress media and temporary reference copy, recovered from the live page. Screenshots are not media assets.
- Finite vertical travel: outgoing moves upward when advancing; returning moves downward. **1 second, CSS ease**, measured from the live `.lqd-section-scroll-sections` transition. No autoplay, wheel interception or pinning.
- Number buttons support click, touch, Tab/Enter/Space, arrow keys and Home/End. Active is black; inactive is outlined. Inactive slides are inert and excluded from accessibility navigation.
- Immediate travel-free switching under reduced motion. The existing desktop image cover, copy fades and button hover/focus remain in place.
- CMS collection has exactly three stable identities with editable heading, kicker, copy, button label and media/alt/focal fields. Order and identities are locked. Older single-slide revisions remain readable and restorable.

## Evidence

- [Desktop 01 → 02 → 03 → 01](desktop-numbered-slider.webm)
- [Mobile numbered taps](mobile-taps.webm)
- [CMS collection](cms-showcase.png)
- [Measurements](motion-measurement.json), [browser checks](checks.json), [draft boundary](boundary.json)

Inspected desktop slides and the mobile composition against the supplied references. The clean tablet/laptop images and requested copy are present in the correct order. The previously approved typography, section dimensions and shared header are retained. The screenshots supplied by the owner use a larger viewport; this pass does not rescale the approved desktop layout to that screenshot size. Mobile deliberately retains numbered controls as requested: the live WordPress mobile page does not initialize its desktop slider, and no swipe behavior was confirmed. Controls are 44px for touch usability.

## Verification

- Production build and TypeScript: passed.
- 39 isolated integration/contract tests: passed, including the new collection bounds and legacy revision contract.
- Six isolated browser regression tests: passed (About editor, responsive layout, navigation and media).
- Saved preview checks: 1440, 768, 390 and 320px; no horizontal overflow; unchanged height during 01→02→03→01; keyboard and touch selection; reduced-motion immediate switch.
- Desktop section remains 1000px tall. Mobile/tablet reserve space for the tallest slide so changing copy/images does not jump the layout.
- Normal authenticated CMS save with expected version produced a revision and `page.draft_saved` audit entry. Only `about.sections[showcase].items` changed. Homepage, other About sections and About publication are unchanged.

## Exact implementation scope / resume checkpoint

- `src/components/sections/about-showcase.tsx`: bounded numbered slide presentation around the existing entrance component.
- `src/styles/about.css`: scoped vertical stage, controls, responsive height and reduced-motion rules.
- `src/schemas/about.ts`: optional slide labels and strict three-item Showcase validation; no database migration.
- `src/components/cms/about-editor.tsx`: bounded Showcase editor.
- `tests/showcase-contract.test.ts`: bounds/identity/legacy validation.
- Two recovered images registered through the normal media API; existing first-slide image retained. About draft 4 → 5 saved through the normal CMS API.

The legacy metric and WordPress filler remain temporary reference copy per the owner's request. Button destinations remain deferred. Await owner approval; do not start another section.
