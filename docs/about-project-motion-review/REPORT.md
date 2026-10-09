# About: Project Image Field motion

Only the Project Image Field is interactive in this pass. The approved body layout, shared header/footer, other sections and saved owner content remain unchanged. No publication or deployment.

## Live reference measurements

Read-only inspection of https://codeyea.com/codeyea-about-us/ on 17 September 2026, including computed styles and its loaded Liquid theme script:

| Effect | Measured reference and local implementation |
|---|---|
| Image transition | 1s, cubic-bezier(.5,0,.08,.85). Incoming opacity 0 → 1 by 65%, horizontal translation -2% → 0. Outgoing opacity 1 → 0 by 65%, translation 0 → 1.5%. Image layer 103% of field. |
| Title ghost | Parent opacity transition delayed .2s, duration .5s. Children delayed .3s, .1s stagger: outgoing xPercent 0 → 3, incoming -3 → 0, opposite opacity fades. GSAP default ease measured as power1.out (samples .4375/.75/.9375 at .25/.5/.75). |
| Pointer | 390 × 390 CSS px; #e0144c; active opacity 1; multiply blending; backdrop-filter blur(8px) brightness(117%). The translucent appearance comes from blending/filtering, not guessed alpha. |
| Tracking | GSAP quickTo x/y duration .1s, power1.out, updated on ticker while active. Centered on pointer, no bounds clamping. |
| Entry/exit | Scale .15 ↔ 1, opacity 0 ↔ 1; .65s expo.out. |
| Categories | Interior Design: interior@2x1-1.jpg; Construction: Slider-2@2x1.jpg; Residential: blg-1@2x1.jpg; City planning: Slider-1@2x1.jpg. |

Three additional original images are local reference assets; the first image still uses the saved CMS media. Stable category IDs select the reference fallback images, and existing item media takes precedence. No CMS structure or snapshot changes.

## Behavior and checks

- Desktop: category-column hover changes the image and title; pointer circle follows and disappears on leave. No autoplay or pinning.
- Touch: category taps change images; circle is hidden. Labels retain approved placement with large column targets.
- Keyboard: real non-submitting buttons, Tab/Enter/Space support, visible focus outline and aria-pressed state. One semantic section heading; ghost copy is hidden from assistive technology.
- Reduced motion: instant image selection; no ghosting or cursor. Preference changes are handled live.
- Cursor work is suspended offscreen, on scroll and while the document is hidden; observers/listeners/tweens are cleaned up on unmount.
- Production build/TypeScript passed. Six isolated browser tests passed, including About CMS isolation, interaction, shared navigation and media workflow.
- Recorded owner preview checks passed at 1440px and 390px, including loaded images, 700px field height, keyboard and reduced motion, no overflow or browser errors. Snapshot fingerprints in checks.json confirm About/homepage draft and publication unchanged.

## Files

- src/components/sections/about-project-field.tsx — scoped client interaction.
- src/components/sections/about-page.tsx — project field component substitution only.
- src/styles/about.css — scoped project layers, reference animations, buttons and pointer.
- public/about-project-reference/ — three original reference images.
- e2e/about-static.spec.ts — additional scoped interaction assertions; existing checks retained.

The approved local typography, dimensions and existing image brightness are preserved rather than replaced by WordPress layout styles. Touch and reduced-motion behavior follow the owner's explicit requirements. Stop for owner review.
