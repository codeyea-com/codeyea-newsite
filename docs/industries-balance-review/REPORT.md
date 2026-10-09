# Industries — heading, balance and scrolling corrections

Saved as **private Industries draft 5**, through the authenticated CMS save path with expected version 4. Nothing published or deployed.

## The four corrections

1. Every industry section now uses its industry name as its only heading. The 11 longer benefit headings were replaced in the saved heading fields; their original wording remains in draft 4's revision for future detail-page work. No detail pages or routes were created.
2. Industry typography is smaller and the text column has more usable width. Paragraph and capability spacing is tighter without removing copy. Text-heavy capability sections allow their image frame to match the text height, avoiding a short image beside a long column.
3. Read-only inspection of the [live template](https://asymmetric-businesspro.liquid-themes.com/solutions/) confirmed that its entire image panel travels vertically, rather than moving an enlarged photograph inside a stationary panel. The implementation now moves the single image panel and its decorative divider together from −120px to +120px with linear scroll progress. The photograph stays clipped inside that panel. Touch, short-height and reduced-motion fallbacks remain static.
4. Tablet/mobile order is now industry label and heading, image, description, highlights, then CTA. This order is also present in the markup; no duplicate images or headings are used.

The introduction, Hero, final CTA, shared header/footer, Homepage and About remain unchanged. All summaries, highlights, image records, destinations, names and order are preserved. The only saved content changes are the 11 industry heading fields.

## Evidence and checks

[Open the visual review](index.html) for desktop and mobile recordings, six full-page captures and section close-ups.

- Verified 1440, 1024, 768, 390, 375 and 320px: no horizontal overflow, one image per section, correct heading text and image-before-description order on stacked layouts.
- Verified keyboard and touch accordion interaction, exclusive opening, and reduced-motion removal of image travel.
- Measured actual panel translation during scroll; the image itself remains untransformed, confirming whole-panel movement.
- Exact saved-draft comparison confirms only heading fields changed. Shared Homepage/About snapshots and versions are unchanged; Industries remains unpublished.
- 42 integration tests and 6 focused browser tests passed. Production build and TypeScript passed.

Temporary images and inactive industry detail destinations remain intentional. No content was shortened. Owner review is the next step.

## Changed components

- `src/components/sections/industries-page.tsx`: heading/image/copy markup order and industry-name heading binding.
- `src/styles/industries.css`: proportional type/spacing, responsive sequence and image panel sizing.
- `src/components/sections/industries-motion.tsx`: whole-panel movement measured from stable layout coordinates; heading entrance targeting follows the new markup.
- `src/content/industries-defaults.ts`: new draft initialization uses industry names as headings.

No schema, CMS architecture, shared style, Hero, header, footer, Homepage or About file was changed. Local inspection and verification scripts are retained under `.local/industries-reference/`.
