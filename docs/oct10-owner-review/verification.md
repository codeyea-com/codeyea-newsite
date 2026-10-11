# October 10 owner corrections

This batch edits the application source and local CMS drafts. No GitHub push,
production deployment or production database write was performed.

## Implemented

- Correct parent and matching mega-menu child active; hosting does not activate Services.
- Back-to-top slide-in, gentle float, subtle shadow and working scroll-to-top.
- Frosted sticky header; smaller logo and navigation while the quote button keeps its size.
- Homepage logos restored; existing CMS section visibility controls retained. Six enabled logos verified.
- Homepage introductory copy updated in English and Arabic local CMS drafts.
- Shared black service section content bounds and balanced existing columns.
- One industry service-list heading, consistent eight-service order, valid links and interactive hover.
- Red form field text, placeholder and border on hover/focus.
- Button arrows spaced, diagonal normally and animated to horizontal on hover; Arabic direction mirrored.
- Language-link hover and floating switch during scroll, retaining region eligibility.
- Readex Pro hierarchy with differentiated weights, smaller Arabic navigation/body/headings.
- Intentional Arabic alignment: image caption on the right; showcase controls on the left; balanced image/text columns and service-grid spacing.
- About capability section full-height separators, upward white hover line, moving labels, distinct descriptions and real category links in both languages.
- Showcase CTAs linked to their corresponding service pages.
- Contextual internal service links in authored paragraphs, following page language.
- Arabic industry carousel starts at the right, without the empty rail; controls, pause text and card padding corrected.
- Remaining English technical-support UI and contact placeholders localized.

## Checks

- TypeScript: `npx tsc --noEmit` passed.
- Shared JavaScript: `node --check public/site/post-launch.js` passed.
- Application tests: 168 passed, zero failed.
- Production build: `npm run build` passed using a separate `.next-owner-review` directory.
- Browser route audit: 64 English/Arabic pages returned HTTP 200 with main content.
- Internal route audit: 61 unique destinations returned successful responses.
- Mobile Arabic audit: all 32 pages fit a 390px viewport without horizontal overflow.
- Browser interactions checked: navigation ownership, distinct category copy, button arrow normal/hover transforms, red form hover, floating controls and actual back-to-top click.
- Placeholder smoke check: all five contact placeholders are Arabic.

`index.html` contains reference/implementation comparisons and live local page links.
Its sticky-header image uses a mocked eligible-country language response to expose
the switch for inspection; the application's geographic eligibility rules were not changed.
Local draft updates are repeatable through `scripts/prepare-oct10-review.ts`, which
rejects non-local database hosts and preserves publication fields.

## Latest corrections

- Arabic headings animate whole words to preserve connected glyphs.
- All 32 Arabic pages passed alignment, connected heading, em dash and desktop overflow checks.
- Telephone values remain LTR with right alignment and Arabic placeholders.
- Industry content retains two paragraphs matching the English information structure.
- Shared dark service sections have a heading, existing service image above the introduction, and a wide free quote CTA under the lists.
- Six CMS Arabic font weight controls (200 to 700) save independently. An authenticated save applied body weight 300 in the browser; original settings were restored.

## Production release

- GitHub PR #5 merged as dac2e6609e238c3beb7abe37cdf2a41288c22fcc.
- Vercel production deployment FtaQg5ZxN7sgZcT1hJU4sRyjwVJY reported success.
- Live typography endpoint returned numeric CSS defaults without exposing integration credentials.
- Published Arabic content updated with snapshot backups, version guards and audit records.
- Live shared dark section has its requested title, image and working free quote panel CTA.
- Live industry section has two Arabic paragraphs and eight linked services.
- Live home intro has a connected Arabic heading with intentional line order.
- Arabic Services returned 200 after restoring its internal schema identifier.
- Live phone field is right aligned with LTR numerical entry and an Arabic placeholder.
