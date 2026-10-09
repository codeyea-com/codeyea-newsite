# Showcase slide 04 — AI & Workflow Automation

Added the exact owner-approved kicker, title, body and CTA label as editable slide `about-showcase-ai`, position 3. Normal authenticated expected-version CMS save advanced private About draft 5 → 6. Only `about.sections[showcase].items[3]` was added; the other slides, other sections, homepage and published snapshot were verified unchanged.

No approved AI-specific image was found in the registered library. Reused the existing technical-work photo (`about-reference-support.webp`) as a temporary placeholder, explicitly identified in the slide's editable alt text. No screenshot was used as media. Replace this placeholder when approved AI imagery is available.

The existing renderer automatically displays 01 / 02 / 03 / 04. No renderer, animation, CSS, shared style, header or footer changes were made. The CTA is a non-submitting button with no destination; clicking does not navigate. No route, autoplay, publication or deployment was added.

## Verification

- Production build / TypeScript passed.
- 39 isolated integration/contract tests passed, including three-slide revision compatibility and fixed fourth-slide identity validation.
- Browser checks at 1440, 768, 390 and 320px passed: four controls, exact approved copy, loaded media, stable height while switching, no horizontal overflow, keyboard access, touch selection and non-navigational CTA.
- Normal transition remains 1 second, CSS ease. Reduced-motion transition is immediate.
- Desktop and mobile recordings plus screenshots are linked in `index.html`.

## Dimension caveat

Desktop remains exactly 1000px high. The existing tablet/mobile auto-height behavior accommodates the longer approved copy, so overall height increases: 768px viewport ~1287 → 1360px; 390px ~961 → 1127px; 320px ~907 → 1133px. Height remains stable between all four slides. Therefore exact previous tablet/mobile pixel heights are **not** retained. No clipping, smaller typography, copy edits or new internal scrolling was introduced to force a fit. Owner review is needed for this content-driven size difference.

Changed source files: `src/schemas/about.ts`, `src/components/cms/about-editor.tsx`, `tests/showcase-contract.test.ts`. No database migration. Earlier three-slide revisions remain supported and editable.
