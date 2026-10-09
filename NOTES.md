> Pending owner instruction (2026-09-16): With the NEXT work the owner shares, make the shared vertical page-background lines visually thinner across ALL pages. Explicitly deferred: do not implement now. Preserve the shared texture approach; this request concerns line thinness. Draft 17 and the other correction-pass-3 changes are approved. No visual/code/content change was made for this deferred request.

> Historical (2026-09-16): Correction pass 3 was delivered for review; draft 17 was subsequently approved. See [final report](docs/HOMEPAGE_CORRECTION_3_REVIEW.md) and [captures/recordings](docs/homepage-correction-3/index.html). No publication or deployment.

> Latest (2026-09-16): Focused visual correction pass 2 is ready for owner review. Private draft 14 contains the expanded English copy; the public snapshot is unchanged. See [correction report](docs/HOMEPAGE_CORRECTION_2_REVIEW.md). Three service-flow destinations remain unconfigured; footer delivery is deferred to pre-launch. Do not publish or deploy.

> Latest (2026-09-15): [Homepage media/backend review](docs/HOMEPAGE_MEDIA_REVIEW.md) and [checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Ready for final owner review; do not deploy or publish owner content.

> Current status (2026-09-14): Homepage CMS review is ready. See [review](docs/HOMEPAGE_CMS_REVIEW.md) and [resume checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Earlier milestone notes below are historical. Stop for owner backend review.

# Reference review and implementation uncertainties

## Current Milestone 2 update

Static homepage and positioning publishing implemented. See docs/MILESTONE_2_REVIEW.md for current verification and docs/MILESTONE_2_ASSETS.md for unresolved source assets. No owner content published or WordPress changes made. Earlier status statements below are historical.

## Historical Milestone 1 update

The owner subsequently approved Milestone 1. Application foundation and draft editorial workflow are now implemented and verified; the earlier reference-review statements below describe the pre-implementation review, not current runtime availability. Real PostgreSQL 18 is running locally with persisted data, Better Auth and Prisma are configured, and only Milestone 1 is delivered.

Hero clarification: one media item must preserve animated word/text behavior and equivalent visual movement; single-media optimization must not flatten the visual experience. That implementation remains deferred until the owner reviews Milestone 1. The approved eight services and industries are centralized in src/schemas/content.ts; outdated WordPress taxonomy was not seeded.

Acceptance details and local/prototype security limits are recorded in docs/MILESTONE_1_REVIEW.md and README.md. Original media, mobile references, exact motion timing, quote interior and later homepage fidelity uncertainties below remain open. The local font is now Josefin Sans, not the early fallback.

During browser QA, constructing a native Request from Next.js's wrapped request caused a private-state TypeError. The auth route now rebuilds from primitive request fields and size-bounded JSON. The regression browser login path passes. Two patched transitive overrides resolve Prisma CLI dependencies' advisories; final npm audit reports zero known vulnerabilities.

Review date: 10 September 2026. Core architecture is approved. The owner explicitly requires approval of the updated maps and milestone before coding. This review changes documentation only.

## Evidence reviewed

Both Word documents were located in Downloads and their complete body text and table-cell text were extracted for content review: `CODEYEA_Homepage_Technical_UX_Audit.docx` and `CODEYEA_Homepage_Custom_CMS_Implementation_Blueprint.docx`. This is a requirements review, not a Word layout audit; no page-number claims are made.

All eleven supplied section images and all three brand assets were visually reviewed in the conversation. Local image dimensions were verified. Screenshot filenames map directly to the numbered references in IMPLEMENTATION_PLAN.md. The screenshots confirm desktop composition, not mobile outcomes or animation timing.

The Loom URL opens in the in-app browser and is titled Loom Message - 10 September 2026, duration 3:31. The initial web text request failed; this is no longer a recording-access blocker. The visible transcript is imperfect automated Arabic and is partially gated by signup. Treat its captions as supporting context, not exact specifications. Review uses visible playback frames as well as available captions; no signup, live-site mutation or form submission was performed.

Playback checkpoints inspected: about 0:16 service hover, 0:32 accordion/left media, 0:52 experience, 1:05 service-flow image change, 1:17 monthly pricing, 1:24 annual pricing, 1:59 portfolio with contextual Explore cursor, 2:35 and 2:49 industries/footer reveal, and 3:07–3:26 hero word/CTA states. These are sampled playback observations, not a frame-by-frame timing analysis. The final inspected quote-button frames did not establish an opened modal; full-screen modal configuration is supported by the audit, but its actual interior layout remains unverified.

## Confirmed visual findings

- Twelve content blocks match the audit, plus global header, drawer, quote modal, footer and persistent scroll/pointer enhancements. The two service rows are one CMS collection, and the three service-flow narratives are one scroll scene.
- Preserve Josefin Sans, navy headings/buttons, cyan accents, pink CTA accents, large white fields and subtle continuous vertical rules. Audit samples: body 17/28.9 px weight 400, H1 50/50 px weight 600, H2 35/42 px weight 600, navigation 18 px weight 500. These are desktop samples, not universal type sizes; the positioning heading is visibly larger.
- Header has a black utility strip, translucent hero state and white/blurred sticky state. The recording contains a WordPress admin toolbar which is not part of the prototype frontend.
- The hero's blue water/sports/SEO composite and geometric pattern are intentional reference artwork, not a request for replacement stock art. Only one background image was identified in the audit. Three white dots appear within the browser-window artwork; do not assume they are functional slide controls.
- Client strip shows six monochrome marks. Their appearance is reference evidence, not verification of client relationships.
- Services are open icon/text columns with wide spacing, not bordered cards. The recording shows the first service gaining pink heading/action emphasis on hover.
- Who We Are uses a left sticky media panel, five right-hand accordions and CTA. The audit and early recording show the first open; screenshot 04 shows the fifth open. These are different interaction states, not competing defaults.
- Experience is an office background with a right-positioned translucent panel and large final value 18.
- Service flow has three ordered narratives: WordPress Technical Support, Brand Designing / Creative Vision Without The Limits, and E-Commerce Website Design. Screenshots show faded neighboring content and the recording shows the left image changing as the active narrative advances.
- Hosting settled state is a white/light comparison with a pale middle column. The screenshot shows monthly 14/21/35. Recording around 1:24 shows annual values 135/201/336 and first-year discount notes; these require business validation, including billing units and renewal terms, before publication. They are not derived from a blanket 20% formula.
- Portfolio retains a separate left filter rail, oversized horizontal images, a partially visible next card, vertical title and drag affordance.
- Industries retains wide image cards with partially clipped neighbors and numeric progress. Footer retains its navy/cyan patterned background and shared rotating-word treatment.

## Content differences requiring explicit handling

| Reference                                                                                                                                         | Approved brief / decision                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creative Design Agency in heading and embedded in both logo files                                                                                 | Use Digital Innovation Agency for editable positioning text; keep supplied logo artwork unchanged pending owner decision about a revised tagline asset. |
| Website Design, eCommerce Development, Web Hosting and Domain, Graphic Design, SEO, Branding Design, Content Writing, WordPress Technical Support | Use the approved eight service names. Preserve the 4 x 2 layout and adapt copy deliberately; no SaaS service.                                           |
| Eleven old industries, including Event Coordinators, Fashion and Lifestyle, and Magazine                                                          | Use the approved eight-industry taxonomy; preserve carousel behavior, not an obsolete eleven-item total.                                                |
| Amall Business with roofing-related text, per audit                                                                                               | Use approved Small Business name; require relevant description rather than copying the mismatched text.                                                 |
| Contact additionally present in main navigation                                                                                                   | Follow approved main navigation and utility Contact Us. This is a documented content change, not accidental omission.                                   |
| Footer rotation includes develops and partnership                                                                                                 | Preserve reference text for review; do not silently repair wording. Final rotation copy needs owner confirmation.                                       |
| Many menu links are #; some destinations/media use codeyea.net                                                                                    | Parent submenu triggers may be buttons. Published destination links must be real and validated; map to codeyea.com where a correct destination exists.  |

## Remaining visual uncertainties

1. No phone/tablet or landscape references were supplied. Exact mobile crops, typography, drawer contents, nested-menu motion and touch interaction remain unverified. Audit provides a <=1199 px desktop-header switch and nominal 350 px right drawer. Proposed grid 4/2/1 and non-pinned small-screen flow are brief-approved fallbacks, not observed mobile parity.
2. Original hero, office, Who We Are/video, three flow images, portfolio/industry images, icon files, client marks, and footer background artwork have not been supplied as individual production assets. Screenshots are layout references, not substitutes for source imagery. A media URL/asset inventory is needed before the static fidelity milestone. No generic AI images are authorized.
3. Exact hero crop and viewport sizing across widths; whether the hidden 3D-hover element has an intended visible state; word-rotation dwell/easing; play-button destination in Who We Are.
4. Service-flow activation thresholds, pin travel, transition overlap and any CTA bounce/parallax remain unmeasured. Preserve the visible three-panel progression; developer tokens must permit tuning without changing editor fields.
5. Footer layered reveal is highlighted in the recording/captions. Its exact geometry, travel, stacking and small-screen behavior require tuning. Avoid a fixed footer that traps focus or clips content on short viewports.
6. Header blur radius/opacity, direction-dependent sticky behavior and whether utility bar visibility changes by scroll direction are not fully isolated from the recording. Retain one header owner and validate a complete down/up pass.
7. Hosting has a readable settled state in the recording. The audit's low-contrast transient may be entrance motion; duration and behavior under other viewport/network conditions remain unverified. Do not retain permanently faded content.
8. Portfolio final loading under a clean/throttled session, filter transition mechanics, image shadow/overlay timing and exact visible-card ratios still need QA. Do not reproduce loading failures as design.
9. Industry autoplay 5 s, dropdown timing and pricing x-offset are audit-derived. Do not claim frame-accurate video measurement. Audit's industry 120 ms delay and 250 ms start delay need reconciliation rather than blindly summing them.
10. Keyboard-only, reduced-motion and physical touch behavior of the old site were not fully tested. Implement the required accessible behavior and report it as an intentional improvement, not measured legacy equivalence.
11. Quote-modal interior, field labels, error/success states and entrance/exit timing are not established by the supplied screenshots or inspected recording frames. The audit identifies modal 5501 and its form, but does not provide a complete visual form specification. Desktop dropdown timing is documented in the audit; precise panel dimensions/appearance still need close visual comparison.

## Operational boundaries

- Cloud Hosting needs evidence that it remains a genuine product. External checkout, support/client destinations, newsletter delivery, quote delivery and video source need configuration. No fake submission success or live analytics.
- PostgreSQL/runtime availability has not yet been checked; no dependencies or database were installed during reference review.
- Store timing and geometry in developer-owned tokens. Normal editors get bounded content fields, media focal points, ordering and enabled state only.
- No old WordPress password may be copied, requested, stored or seeded. No live WordPress modifications are authorized by this review.
- The audit's logged-in DOM/script/stylesheet counts are diagnostic, not anonymous-user performance benchmarks. Measure the custom build independently.

## Foundation correction pass
See docs/CORRECTION_REVIEW.md for contracts, scoped styling, revision preview/pagination, audit attribution, isolated test database/environment and the nonblocking production-hardening backlog. Test runs use codeyea_test on port 3001; owner prototype remains on port 3000. Historical test records from the prior milestone were preserved.

## About page review checkpoint — 2026-09-16
See docs/ABOUT_CHECKPOINT.md and docs/ABOUT_REVIEW.md. About private draft v2 and evidence in docs/about-review/index.html are ready for owner review. No About publication or deployment. Shared homepage snapshots are unchanged; the requested thinner shared grid is applied. Do not start another page or reuse the About visual system before owner approval.

