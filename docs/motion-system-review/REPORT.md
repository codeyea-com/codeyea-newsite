# CODEYEA shared motion review

Private Roofing draft **5**. Nothing published or deployed. Only the Roofing FAQ contact destination changed in the saved CMS content: `https://codeyea.com/contact/`. Homepage, About and Industries draft/public snapshots are unchanged.

## Corrections

- Texture sections now expose the continuous white page base. The raster texture's off-white paper is lifted to white with a brightness filter; no white overlay or gray section layer is used.
- Roofing labels, headings, paragraphs, lists and actions use the existing Industries editorial entrance where no specialist animation already owns them: 35px upward travel, 1.8 seconds, 180ms delay/stagger, `power4.out`.
- The existing Roofing desktop service-character/list entrance remains unchanged. Touch layouts use the simpler shared editorial entrance.
- Roofing rounded badge/button corners are removed without changing their padding or dimensions.
- Growth Path numbers activate only after their incoming line finishes. The sequence runs once, follows the existing four-column/two-column/stacked layout, and completes immediately under reduced motion. Lines are decorative and do not affect layout.
- “Get in touch” is a real contact link, using the Industries underline/arrow presentation and visible keyboard focus.
- Full-width and contained Roofing images move within stationary clipping frames with 240px overscan. Scroll travel is direct and linear, from +120px to −120px. The photograph moves upward when scrolling down. Image-only hover zoom-out uses the existing 1.075→1 range and 1.5-second easing. The final CTA frame and copy do not scale.
- Touch/short-view/reduced-motion layouts retain static crops. Server-rendered text remains readable without JavaScript.

## Shared coverage and preserved ownership

| Element | Shared pattern / existing owner |
|---|---|
| Editorial labels, headings, body and lists | `EditorialMotion` and approved entrance constants; Roofing, About editorial sections, Industries introduction/final CTA |
| Homepage text | Existing `HomepageMotion`, word rotator and service words; unchanged |
| Fixed-frame images | `FixedImageMotion` / bounded offset calculation; Roofing and About editorial image; Industries keeps its original controller with the same shared calculation |
| Cards | Existing Homepage carousel image/copy hover and focus; About principles heading-only turquoise response; unchanged |
| Filled buttons | Existing shared Homepage button and page-specific approved CTA states; unchanged apart from requested Roofing sharp corners |
| Naked text links | Shared opt-in underline treatment, used by Industries and Roofing contact link |
| Icons and mouse-follow | Existing parent-owned Homepage action and About Project Image Field components; unchanged |
| Ordered sequence | `OrderedPath`, using the approved 650ms controlled ease per connecting segment; next number activates on completion |
| Sliders/carousels | Homepage finite rewind, About one-second vertical Showcase, Roofing Flickity gallery; unchanged |
| Accordions | Existing page-specific transition timings and exclusive-open behavior retained |
| Masks/reveals | About Showcase cover and copy entrance remain exclusively controlled by `AboutShowcase` |
| Shared shell/Hero | Header, footer, utility navigation and internal Hero components unchanged |

No universal controller is attached to specialist animation targets. Observers, listeners, animation frames and GSAP contexts are released during cleanup. Repeated reduced-motion toggles keep one Growth Path and remove all opted-in image-scroll controllers.

## Verification

- All four implemented pages checked at **1440, 1024, 768, 390 and 320px**, with normal motion, reduced motion and JavaScript disabled.
- No horizontal overflow, broken images or hidden readable text in the fallback matrix; one H1 on each page.
- Recorded samples confirm stationary image-frame document positions/heights, covered image edges, opposite scroll directions and line-before-number activation.
- Keyboard focus, touch FAQ controls, gallery controls and visible contact-link focus checked.
- **46 integration/unit tests and 9 focused browser tests passed.** Production build and TypeScript passed.
- Hash comparisons confirm the Homepage components, shared Hero/header/footer, About Project Image Field and Showcase remain unchanged. CMS snapshot comparisons confirm publication isolation.

**Existing loading limitation:** a cold-cache font swap can shift the shared Hero/header before Josefin Sans finishes loading (observed About 320px CLS ≈0.042). The trace attributes this to font loading, not the new animation. Shared font and Hero code were preserved. This is not represented as a zero-CLS page-load result.

## Review files

Open `index.html` for desktop/mobile recordings and all five Roofing screenshot widths. The package also includes representative Homepage, About and Industries captures, `verification.json`, `normal-checks.json`, `motion-evidence.json` and `layout-shifts.json`.

## Resume checkpoint

New reusable files: `src/components/motion/approved-patterns.ts`, `editorial-motion.tsx`, `fixed-image-motion.tsx`, `ordered-path.tsx`, and `src/styles/approved-motion.css`.

Scoped consumers: Roofing body/interactions/styles; About editorial renderer; Industries renderer/entrance/style. No schema or database migration. Tests: `tests/approved-motion.test.ts`, `e2e/roofing.spec.ts`.

Owner design/motion review remains pending. No further page, content or deployment work is started.
