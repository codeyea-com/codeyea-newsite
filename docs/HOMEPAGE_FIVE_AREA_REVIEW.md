# Five-area homepage refinement review
2026-09-14. Frontend only; CMS remains paused. No owner content published, WordPress changed, or deployment performed.

## Before / after
| Area | Earlier implementation | Current implementation |
|---|---|---|
| Navigation | Generic chevron and compact dropdown | Thin rotating SVG, spacious translucent rounded panel, pink active/focus treatment, independent neighboring text contrast, Escape closing |
| Services | Card-like reveal hid too much content | Open 4/2/1 layout with subtle column rules; icon/title/description visible; coordinated Learn More entrance and reverse; touch links visible |
| Hosting | Generic plan presentation | One aligned comparison table, header icon, billing control and reference Save 20% note, continuous gray Colossal column, aligned square Get Started controls |
| Projects | Permanently reserved intro panel | Carousel navigation triggers synchronized intro recession and track expansion; returning to first position reverses it; vertical image titles, square arrows, media-only Explore pointer and subtle card depth |
| Industries | Compact carousel treatment | Tall edge-reaching cards, progressive overlay/text reveal, Drag pointer, animated count/progress, existing autoplay with drag/hover/focus/offscreen/hidden-tab/reduced-motion pauses |

## Recordings
- Desktop: recordings/homepage-five-area-1440.webm
- Mobile: recordings/homepage-five-area-390.webm
These cover menu, Services, billing, project next/previous and keyboard expansion/reversal, filters, Industries controls and reduced-motion fallback. Mobile uses an emulated viewport/touch context; physical-device swipe testing remains unverified.

## Verification
24 unit/integration tests passed. TypeScript and production build passed. Full browser run: eight passed and one new mobile cursor check failed. The browser reported a fine pointer after mixed keyboard/mouse test input despite a touch context. Added a defensive tablet/mobile-width cursor exclusion; rebuilt production and isolated test outputs, then reran both affected recording checks. See checkpoint for final results.

## Reference limits and review decisions
- Compared the read-only live WordPress navigation and carousel expansion and existing local reference screenshots (03 Services, 08 Hosting, 09 Projects, 10 Industries). The five newly mentioned screenshots were not separately attached in this session.
- The original carousel-triggered expansion is verified. Its 650ms easing and 3D recession are custom approximations, not measured frame-exact timing. Mobile deliberately preserves section space and uses a simpler fade.
- Exact original gradient second stop/direction remains unverified. The shared approved pink fallback remains; no second color was invented.
- Save 20% is displayed as a reference offer marked TBC. Existing reference plan figures are retained; annual Business and other unresolved commercial details remain TBC. Get Started uses the existing contact destination, not an invented checkout.
- Project imagery is reference material, with neutral titles and approval notes. Explore is a pointer treatment, not an invented destination. Owner-approved project names, copy and destinations are still needed.
- Review the menu spacing, Services motion, hosting hierarchy, project expansion speed and mobile intro fade, and tall Industries card proportions. Exact slow-motion parity and physical-device performance are not certified.

Stop here for owner visual/motion review. Do not resume CMS development.
