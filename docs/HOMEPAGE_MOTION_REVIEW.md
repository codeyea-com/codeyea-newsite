# Homepage motion review — 2026-09-13

Preview: http://127.0.0.1:3000. Homepage frontend only; CMS remains paused.

## Recordings
- Desktop: recordings/homepage-motion-1440.webm (about 27 seconds)
- Mobile: recordings/homepage-motion-390.webm (about 26 seconds)

Recordings come from the isolated browser test environment and include slow/normal scroll segments, CTA states, accordion, count, service sequence, billing, filtering, carousel and footer. Their positioning copy is isolated test content, not an owner publication. The mobile recording uses a narrow desktop browser viewport, not physical-device touch input; responsive layout, keyboard and carousel control behavior were checked, but physical-device gesture feel is not certified.

## Motion parity checklist
| Area | Original reference | Recreated | Difference / assumption |
| --- | --- | --- | --- |
| Header | First-section sticky trigger, translucent-to-white, approximately 400ms; 300ms logo fade | Hero exit observer, crossfading logos, background/text transition, keyboard dropdowns and mobile disclosure transitions | Shared 300ms state timing; native disclosure rather than theme drawer; no quote modal |
| Hero | Clipped rotating words, liquid-x character CTA reveal with 32.5ms stagger | Words integrated in heading, clipped eased travel; CTA text/arrow reveal; one-shot restrained background scale | Whole-text movement instead of per-character cascade; background 7s settle is an explicit assumption, not verified original parallax |
| Services | Description/action slide on hover, grid separators | Transform/opacity reveal on hover/focus, content always visible on touch; once-only entrance with 70ms stagger | Stagger timing is recreated, not measured |
| About | Sticky left media and five accordions | Desktop sticky media, animated content/indicator, existing single image preserved | Height transition necessarily affects accordion layout; native details provides fallback; no unsupported media swap/video |
| Experience | Odometer-style value 18 | One-shot 1.1s eased count, overlay entrance, immediate final reduced-motion state | Numeric count rather than odometer digits; claim remains unverified |
| Service flow | Pinned left media, crossfading images, faded adjacent narratives | GSAP pin, center-crossing activation, 450ms crossfade, readable inactive content and explicit active label; 65vh panels | Thresholds/timing are deliberate approximations; shorter copy uses tighter spacing. Tablet/mobile/reduced motion are stacked |
| Hosting | Billing templates/tabs | Price opacity/8px horizontal entry, reserved caption/price height | Does not animate entire table; Business annual units remain unresolved |
| Projects | Filterable carousel, image/text hover response | Embla, entry animation on filtered cards, image zoom, category/title panel treatment, keyboard focus and arrows | No custom Explore cursor because reference previews have no verified project destinations; no theme masonry choreography |
| Industries | 5000ms autoplay, hover pause, zoom/reveal and count | Same interval; pause on hover/focus/offscreen/hidden/reduced motion, zoom and copy lift, animated count, swipe/arrow/keyboard | Eight approved industries rather than original eleven; exact easing is a shared-system assumption |
| Footer | Live computed sticky footer, patterned navy/turquoise field, rotating phrase | Desktop sticky reveal behind opaque main, rotating words; static accessible mobile/reduced-motion footer | No unverified 3D or elaborate layered choreography |

## Brand system and unresolved gradient
All six approved colors are centralized in src/styles/homepage-motion.css and scoped to the homepage: primary #E0144C, secondary #121212, body #535E65, blue #072448, yellow #FFCB00, turquoise #10AABC. Pink accents interactions/service icons; yellow highlights Creativity and the experience overlay; navy/turquoise retain structural roles. CMS styling is unchanged.

Buttons and CTA controls have square corners, a layered transform/opacity hover surface, 2px controlled movement, subtle transitioning shadow and explicit focus outline/underline. Linked text uses the approved primary on hover/focus. Reduced motion retains final colors and focus treatment without movement.

IMPORTANT: The original second gradient color and direction could not be recovered from accessible live computed styles. No second color was invented. The shared gradient token currently uses #E0144C at both stops, producing an intentional solid-primary fallback; linked text also uses solid primary. Exact red/pink gradient parity remains open pending source values or owner approval. This is not represented as a verified gradient reproduction.

## Before / after state examples
- screenshots/before-button-focus.png — previous homepage button focus
- screenshots/after-button-focus.png — new pink fill, square corners, reveal arrow, visible outline/underline
- screenshots/button-hover-after-1440.png — settled hover fill and text reveal
- screenshots/before-link-focus.png — previous linked-text focus
- screenshots/link-focus-after-1440.png — new primary-colored underlined linked-text focus

Hover and focus transitions are also visible in the recordings. Tight element captures omit outer shadows/outlines; use the full focus capture to inspect the ring.

## Verification
- Full integration/unit suite: 24 passed.
- Full browser suite: 7 passed, including both recorded motion scenarios and original CMS Save draft/Publish checks.
- TypeScript and production build passed.
- Six target widths and landscape; desktop service activation; reduced-motion unpin/final count; menu Escape; billing/filter/carousel operation passed.
- One carousel library (Embla), GSAP limited to service flow; no animation libraries added.
- Scroll progress caches page height with ResizeObserver and writes only a transform in requestAnimationFrame. Simple entrances use IntersectionObserver. Word/carousel timers stop offscreen/hidden; hero settles once and pauses when hidden. No measured Core Web Vitals claim.

Read-only original inspection covered live section states, active branding flow during slow and normal scroll increments, CTA markup/computed presentation, and sticky footer styling; the existing Word audit supplied additional behavior details. No theme/plugin implementation code was copied. Frame-perfect equivalence across all sections has not been established; differences above remain explicit.

Stop for owner visual/motion review. No deployment, WordPress modification or owner publication occurred. Existing copy/claims/pricing/logo attribution approvals from HOMEPAGE_DESIGN_REVIEW.md still apply.
