# Industries fixed image viewport correction

Saved through the authenticated CMS workflow as **private draft 6**, with expected version 5. Content is identical to draft 5. Nothing published or deployed.

## Corrected implementation

- Removed the wrapper translation and the capability layout's text-dependent, stretched image height.
- Restored layout-controlled desktop frames: layout 1 is 674px high; layouts 2, 3 and 4 are 560px high. Matching sections have equal media dimensions regardless of copy length or accordion state.
- Tablet/mobile frames use a consistent 4:3 aspect ratio. Heading → image → description → highlights → CTA order is preserved.
- Only the photograph receives a transform. Its absolute position is top −120px and its height is the fixed viewport height plus 240px. The viewport and decorative divider remain untransformed, with overflow clipped.
- Scroll progress is measured from the stationary frame's top entering the screen bottom to its bottom reaching the screen top. The image travels linearly within ±120px, with no catch-up or autonomous movement.
- To satisfy the explicit direction acceptance check, scroll-down maps from +120px to −120px (photograph moves upward); scroll-up reverses it. The supplied stationary-window specification governs the correction, rather than the live template's wrapper implementation.
- Touch, narrow layouts, short-height screens, reduced motion and no-JavaScript use the static crop with the existing CMS focal positions.

The live reference was reinspected read-only: [Liquid Themes Solutions](https://asymmetric-businesspro.liquid-themes.com/solutions/). Its configuration confirms linear travel in the ±120px range. No WordPress changes were made.

## Preserved exactly

The draft-5 text entrance timeline and trigger/sequence code were compared with the saved pre-change source: y35→0, opacity0→1, 1800ms, 180ms delay/stagger, power4.out. Accordion and CTA animation rules, typography and all content were left unchanged. The final clarification to preserve content takes precedence over the earlier copy-shortening request.

Introduction, industry-name headings, media records, focal positions, shared Hero, header/footer, Homepage and About remain unchanged. No schema/editor change was required. Only `src/styles/industries.css` and the image-specific lines in `src/components/sections/industries-motion.tsx` changed.

## Acceptance evidence

[Open the recordings and captures](index.html). The desktop recording includes a review-only measurement overlay; that overlay is not part of the website.

- At 1440px the Roofing frame stays 768.953×674px and its document top stays 1561.547px throughout the measured scroll sequence. Its transform and divider transform are always `none`.
- The inner image moves approximately +120 → +62.6 → −1.9 → −66.4 → −120px on scroll-down, then reverses on scroll-up.
- Image coverage contains the whole viewport at every measured point, including both travel ends; no empty edges appear.
- The transform is unchanged after scrolling stops. There is no delayed catch-up.
- All matching layouts have equal frame sizes despite different summaries/highlights. Accordion opening does not change frame height.
- Verified 1440, 1024, 768, 390 and 320px: no horizontal overflow, single image, stationary divider, static touch/reduced-motion crops and correct mobile order.
- Keyboard and touch accordion checks passed. No-JavaScript content and images remain available.
- Exact draft comparison confirms zero content changes and unpublished Industries state. Homepage/About draft/public snapshots and versions are unchanged.

Results: [checks.json](checks.json). All 42 integration tests and 6 focused browser tests passed. TypeScript and the production build passed.

Temporary imagery and unimplemented detail destinations remain as previously approved. Ready for owner visual review.
