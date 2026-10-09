# CODEYEA approved motion implementation plan

**Goal:** Apply the requested Roofing corrections and reuse existing motion without changing approved geometry or specialist interactions.
**Architecture:** Shared entrance/viewport lifecycle utilities own only explicitly selected, previously untreated elements. Existing carousel, pointer, showcase, hero, accordion and header controllers remain sole owners of their targets.
**Tech Stack:** React, GSAP, CSS, Playwright, private CMS revision API.
**Spec:** Owner request in this task, 20 September 2026.

## Constraints
No content/schema/layout changes except the requested contact destination. No publication/deployment. Preserve specialist motion. White texture base, sharp Roofing surfaces, inner-image-only travel, ordered Growth Path activation.

- [x] Extract Industries entrance constants (35px, 1.8s, .18 delay/stagger, power4.out) and shared observer lifecycle; use identical constants in Industries.
- [x] Add explicitly scoped entrances to Roofing, About editorial areas and Industries introduction/final CTA. Exclude existing specialist controllers and semantic fragments.
- [x] Replace Roofing image travel with the fixed-window pattern, reuse approved zoom range/ease, remove gray texture base and corner radii. Use existing industry underline contract for contact link.
- [x] Implement Growth Path line-first sequence using approved easing and viewport trigger; completed SSR/reduced state, responsive line geometry, no layout changes.
- [x] Save contact destination through authenticated expected-version private draft workflow; compare unrelated snapshots.
- [x] Verify all four pages at five widths, normal/reduced/no-JS, keyboard/touch, stationary frames, image edge coverage and cleanup. Run focused regressions, TypeScript/build. Capture recordings/screenshots and write scoped audit.

