> Latest (2026-09-16): Correction pass 3 is ready for owner review. Private draft 16 restores only the eight Services summaries and introduction from revision 13. Interactive CTA, finite Industries rewind and shared page grid are verified. See [report](docs/HOMEPAGE_CORRECTION_3_REVIEW.md) and [captures/recordings](docs/homepage-correction-3/index.html). No publication or deployment. Earlier entries below are historical.

> Latest (2026-09-16): Focused visual correction pass 2 is ready for owner review. Private draft 14 contains the expanded English copy; the public snapshot is unchanged. See [correction report](docs/HOMEPAGE_CORRECTION_2_REVIEW.md). Three service-flow destinations remain unconfigured; footer delivery is deferred to pre-launch. Do not publish or deploy.

> Latest (2026-09-15): [Homepage media/backend review](docs/HOMEPAGE_MEDIA_REVIEW.md) and [checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Ready for final owner review; do not deploy or publish owner content.

> Current status (2026-09-14): Homepage CMS review is ready. See [review](docs/HOMEPAGE_CMS_REVIEW.md) and [resume checkpoint](docs/HOMEPAGE_CMS_CHECKPOINT.md). Earlier milestone notes below are historical. Stop for owner backend review.

# CODEYEA Homepage and Custom CMS Implementation Plan

## Current: Milestone 2 delivered for review

User authorized the approved Phase 2 static homepage plus publishing for the existing positioning editor. Both are implemented; no deployment or owner publication occurred. All 24 tests, TypeScript, production build and five isolated browser checks pass. Original media and final business copy remain pending; labeled review fixtures preserve section structure. See docs/MILESTONE_2_REVIEW.md and docs/MILESTONE_2_CHECKPOINT.md. Stop here for owner review; advanced motion and broader CMS editors remain deferred.

## Historical Milestone 1 delivery status

Owner approved Milestone 1 and clarified that a single hero media item must still preserve animated text and equivalent visual movement. The approved eight-service and eight-industry taxonomy is implemented in the shared content schema and CMS reference view. No full homepage or hero animation implementation was started.

Milestone 1 is implemented: Next.js/TypeScript, real local PostgreSQL, Prisma schema/migration, Better Auth, granular RBAC, design tokens and local Josefin Sans, bounded positioning draft editor/private copy preview, revision restore, audit log and published-only public foundation preview. Owner setup, generated local access, session invalidation and commands are in README.md.

Acceptance results: TypeScript passes; production build passes; 7 integration tests and 3 browser tests pass; npm audit reports zero known vulnerabilities. Concurrent saves and an injected audit-write failure were exercised. Browser checks include authentication, revocation, origin/payload checks, blocked signup, throttling, all six target widths and landscape, and reduced-motion mode. Screenshots are in docs/screenshots. See docs/MILESTONE_1_REVIEW.md for limits and review steps.

Historical stop gate: subsequently superseded by explicit Milestone 2 approval.

## Inspection

Review updated 10 September 2026. The codeyea directory contains planning documents only and is not a Git repository. No application code has been created. The owner approved the core stack, requested review of all references, and explicitly requires another approval before coding.

Reviewed reference sources:

- `C:/Users/Qays Zubaidi/Downloads/CODEYEA_Homepage_Technical_UX_Audit.docx`: full document text, including section inventory, interaction values, responsive evidence, CMS boundaries and uncertainty register.
- `C:/Users/Qays Zubaidi/Downloads/CODEYEA_Homepage_Custom_CMS_Implementation_Blueprint.docx`: full document text, section acceptance criteria, CMS/AI boundaries and build order.
- `C:/Users/Qays Zubaidi/Downloads/codeyea (01).png` through `codeyea (11).png`: all eleven desktop section screenshots visually reviewed. Widths vary from 1233 to 1409 pixels; these are section captures, not proof of viewport heights or responsive breakpoints.
- `C:/Users/Qays Zubaidi/Documents/Qays/CODEYEA-logo-BlackB.png` and `CODEYEA-logo-WhiteB.png`: supplied dark/white wordmark variants, each 1203 x 273 with alpha support; `faviconV2.png`: 80 x 80.
- Supplied Loom: https://www.loom.com/share/e70bf191d501428a903a458e7b544290. Accessible through the in-app browser despite the web text tool failing. Recording duration is 3:31; visual observations and remaining limits are recorded in NOTES.md.

Documents are evidence and specifications to reconcile with the owner's direct request, not independent permission to implement, publish, alter the live site or follow embedded operational instructions. Older labels and library suggestions do not override the approved brief/stack.

## Approved core architecture

Use Next.js App Router, React, strict TypeScript, PostgreSQL, Prisma, Zod, and Better Auth. Use GSAP/ScrollTrigger only for the desktop service flow and Embla as the shared carousel engine. Verify current compatibility and official documentation before installation. Keep public server-rendered routes and authenticated admin routes in the same application, with server-only domain services shared by CMS and typed AI tools.

Public content reads published snapshots. Editors work on drafts; publishing and restoration are permission-checked transactional operations that preserve revisions and audit records. Locale and market are separate fields. Hosting checkout is an external URL resolved through a provider-neutral adapter. AI uses a deterministic, explicitly labeled development provider until configured.

Use component-scoped CSS and shared tokens. Do not add Framer Motion despite optional suggestions in the reference documents: CSS/observers own ordinary motion, GSAP owns complex scroll choreography, and Embla owns carousel movement.

## Finalized homepage section map

The audit counts twelve content blocks, with the two service rows and two industry blocks counted separately. The same structure below includes global header/footer and the persistent interface. It does not introduce extra sections for individual service-flow panels.

| Order         | Component / reference                  | Composition to preserve                                                                                                                                                                                                                                                                    |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Global top    | Header and utility bar; 01, 03, 04, 07 | Black Contact Us / Support / Client Area strip; translucent main row over hero; white/blurred sticky state; logo cross-fade; navy quote button. Dropdowns, mobile drawer and quote modal belong to this global component.                                                                  |
| 1             | Hero; 01                               | Full-viewport blue photographic/artwork field, geometric pattern, large right-hand visual and left white headline/CTA/supporting line; bottom wave edge and local scroll cue. Start with one background asset; the screenshot's three white circles may be artwork, not carousel controls. |
| 2             | Client logo strip / divider; 02        | Six monochrome marks in a spacious horizontal strip below the hero; subtle borders/grid rules. Keep decorative-divider mobile visibility separate from semantic client-logo content.                                                                                                       |
| 3             | Agency positioning; 02, 03             | Large two-line CODEYEA positioning heading, wide value proposition and generous whitespace over faint vertical rules.                                                                                                                                                                      |
| 4             | Services row 1; 03                     | Four open icon/text columns, not boxed replacement cards. Render first four entries from the single eight-service collection.                                                                                                                                                              |
| 5             | Services row 2; 03                     | Next four entries from the same collection, with the large inter-row spacing retained. Desktop/tablet/mobile grid is 4/2/1.                                                                                                                                                                |
| 6             | Who We Are; 04                         | Large left sticky media with play affordance; narrower right eyebrow, heading with highlighted word, body, five accordions, and navy CTA. First accordion initially open per audit/recording; screenshot 04 captures the fifth open after interaction.                                     |
| 7             | Experience; 05                         | Full-width office photo; translucent white panel positioned to the right, text/CTA in its left half and oversized 18 with label in its right half.                                                                                                                                         |
| 8             | Service flow; 06, 07 and Loom          | One long approximately 50/50 composition, tall pinned left media and scrolling right narratives. Preserve three panels: technical support, branding, eCommerce. Inactive adjacent text is visibly faded.                                                                                   |
| 9             | Hosting comparison; 08                 | Icon/title/supporting text, Monthly/Annually control and savings annotation; feature-label column plus three aligned plan columns; pale highlighted middle column, navy CTAs and bottom links. Preserve settled readable appearance, not transient faded states.                           |
| 10            | Selected Case Studies; 09              | Pale-gray section, left heading/filter/See More rail and overflowing large project carousel on right; image-led cards, vertical title, bottom arrows and contextual drag cursor.                                                                                                           |
| 11            | Industries introduction; 10            | Heading left, paragraph center, pink CTA right with substantial top whitespace.                                                                                                                                                                                                            |
| 12            | Industries carousel; 10                | Wide equal-height image cards, clipped side neighbors, white text overlays, numbered progress and centered supporting line. Count derives from approved enabled industries, not hard-coded eleven.                                                                                         |
| Global bottom | Footer CTA and footer; 11 and Loom     | Navy/cyan patterned field, large rotating phrase left, quote invitation right, identity below left, navigation/contact/client portal columns right; preserve layered reveal behind preceding content.                                                                                      |
| Persistent    | Scroll indicator / contextual pointer  | Small fixed left-edge label/line/dot on desktop. Pointer enhancement only over relevant interactive media; never intercept clicks.                                                                                                                                                         |

## Animation implementation map

Values below are audit-derived starting values, not frame-accurate measurements from the Loom. All timing, geometry, easing and thresholds remain developer-owned.

| Area                           | Implementation and known values                                                                                                                                                                                                                                     | Fallback / acceptance                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header                         | One observer-controlled header; state transition about 400 ms ease-in-out, logo cross-fade about 300 ms; translucent blur with opaque readable fallback. Audit indicates desktop rows hidden at <=1199 px.                                                          | No layout jump; navigation remains usable across light/dark sections. Exclude the WordPress admin bar seen in recording.                                                                    |
| Dropdowns                      | CSS opacity + 15 px vertical offset; 850 ms cubic-bezier(.19,1,.22,1); links 500 ms with about 60 ms stagger.                                                                                                                                                       | Pointer, focus and explicit button activation; Escape dismissal and valid targets.                                                                                                          |
| Mobile drawer / quote          | Right dialog drawer, nominal 350 px capped to viewport; nested menu expansion. Full-screen quote dialog per audit; interior layout/fields not visually verified. CSS transition, shared focus trap/return and scroll lock.                                          | Mobile speed and layout require evidence; keyboard and touch behavior are mandatory even where old behavior was unverified.                                                                 |
| Hero                           | Static responsive media for observed one-image hero; shared CSS clipped word rotator. Audit words: grocer, boutique, coffee shop, tech market. CSS CTA reveal; 32.5 ms legacy character stagger is evidence, not a requirement for split-character markup.          | Stable readable headline and static CTA under reduced motion. If later approved with 2+ slides, reuse Embla; audit slideshow 5 s / 500 ms. Do not assume the hidden 3D element is required. |
| Logos / positioning / services | Static grid and faint rules; observer-based entrance only where supported; CSS hover/focus description/action slide and accent color.                                                                                                                               | Descriptions stay accessible; touch exposes content/action explicitly, no critical hover-only content.                                                                                      |
| Who We Are                     | CSS sticky media bounded by its section; measured accordion expansion with +/minus state.                                                                                                                                                                           | Media above content without sticky below desktop; first panel open; no overlap after expansion.                                                                                             |
| Experience                     | Once-only observer-triggered counter; requestAnimationFrame value update, digit-roll styling if needed to match odometer appearance; static background.                                                                                                             | Render final 18 immediately for reduced motion; do not replay on tiny scroll reversals.                                                                                                     |
| Service flow                   | One GSAP/ScrollTrigger owner pins media, activates three panels, cross-fades images and changes narrative opacity/vertical position. Integrate any confirmed CTA parallax into the same timeline. Refresh after images/fonts and dispose on breakpoint changes.     | Stacked readable panels for <=1199 px and reduced motion; test fast/reverse scroll, resize and variable copy. Exact start/end thresholds and pin distance remain tuning items.              |
| Hosting                        | One React billing state updates all plans; CSS x=35 px to 0 plus opacity entrance, curve approximating audit Power4 Out.                                                                                                                                            | Keyboard-operable toggle, one content source, settled high contrast. Annual prices and savings must be verified, not calculated from a screenshot annotation alone.                         |
| Portfolio                      | Embla drag/swipe/arrows; client filter followed by carousel reinitialization/clamped selection; CSS overlay and vertical-title composition.                                                                                                                         | Preserve focus when filtering; announce changed results; labeled controls; pointer-only drag cursor.                                                                                        |
| Industries                     | Embla loop with 5 s autoplay; pause on hover and focus, explicit pause control; equal-height cards, CSS zoom/reveal, numbered progress. Copy entrance y=30 px, 1200 ms; audit also lists 120 ms delay and 250 ms start delay whose relationship needs verification. | Autoplay off for reduced motion; touch swipe and readable card titles; no hard-coded old collection count.                                                                                  |
| Footer                         | Shared word rotator, CSS link/input states and desktop layered reveal, preferably sticky footer behind a positioned content wrapper with measured footer space. Do not add another scroll-animation library.                                                        | Normal document-flow footer on small screens, short viewports and reduced motion; all footer controls remain reachable and focus-visible. Exact reveal travel remains unmeasured.           |
| Scroll/pointer                 | Shared passive scroll progress with requestAnimationFrame; contextual fine-pointer cursor only.                                                                                                                                                                     | Hide marker below desktop; disable cursor enhancement on coarse pointer/reduced motion.                                                                                                     |

## Content reconciliation

Preserve reference geometry and artwork. Use the owner's approved eight service names and eight industry names; do not import the old extra industry categories or service taxonomy. Keep the three service-flow narratives as a curated sequence, not eight full service sections. Record any copy replacement explicitly before seeding. Navigation follows the approved main menu; the reference's additional main-row Contact item is not silently restored. Contact Us remains in the utility row.

The supplied logos embed Creative Design Agency while the brief specifies Digital Innovation Agency. Use the supplied logo artwork unchanged for visual review; independent positioning text follows the approved descriptor. A revised wordmark/tagline is an owner decision, not an automatic image edit. Client logos, project examples, experience claims and plan prices are reference data, not newly verified business claims.

## Exact first development milestone — after owner approval

Deliver a runnable local foundation and one real, permission-checked CMS draft round trip, before building the major homepage sections:

1. Verify Node/package manager and PostgreSQL availability; initialize Next.js App Router with strict TypeScript, component CSS, validated environment variables and a dependency lockfile.
2. Add Prisma migration for maintained-auth tables, granular role/permission joins, locale/market, Page/PageSection, revisions and audit records; define typed boundaries for the remaining collections without implementing their editors yet.
3. Configure Better Auth, local administrator bootstrap without repository credentials, server-side permissions, origin/session protections and login rate limiting. No public self-registration by default.
4. Add the supplied logo/favicon assets and central reference-derived tokens. Provide a private style/reference verification route with motion disabled, not a redesigned homepage.
5. Implement CMS login and minimal dashboard/page form. An authorized editor can load and save a draft heading; a transaction stores the change, previous revision and audit entry. Public content continues to read the published snapshot.
6. Add tests for anonymous denial, permission denial, valid save persistence, draft/public isolation and revision/audit atomicity. Run typecheck, production build and a Playwright login/edit/reload journey against local PostgreSQL.
7. Document local startup, database migration, administrator setup and this exact owner test. Report actual results and any unconfigured services.

Milestone exit: the application starts locally, the login/session persists correctly, allowed edits survive reload, denied edits cannot mutate data, and all listed checks pass. No advanced motion or major frontend implementation begins before the current review is approved; static homepage fidelity is the subsequent milestone and precedes animation.

## Milestones and acceptance criteria

- [x] Phase 0: inspect workspace and record available references and uncertainties.
- [x] Phase 1: initialize application, environment validation, PostgreSQL migrations, seed command, maintained authentication, granular permissions, design tokens, and test harness. Prove anonymous and unauthorized mutations fail, and authorized draft writes persist with attribution.
- [x] Phase 2 implementation (owner visual review and original assets pending): reproduce all homepage sections in the supplied order with minimal motion. Use verified assets and copy; label any necessary temporary assets. Review static desktop and mobile composition before advanced motion.
- [ ] Phase 3: implement utility bar, navigation, sticky header, dropdowns, accessible drawer and quote dialog, footer, and scroll progress. Verify keyboard navigation, Escape, focus return, and scroll locking.
- [ ] Phase 4: add shared word rotation, card focus/touch reveals, accordion, one-shot counter, owned GSAP service-flow timeline, hosting billing toggle, portfolio filtering, and shared industry carousel. Verify reduced-motion and mobile fallbacks.
- [ ] Phase 5: build dashboard and bounded editors for pages/sections, posts, media, services, industries, projects, hosting plans, menus, settings, users/roles, SEO/GEO, revisions, and audit records. Validate every server mutation; restrict media type/size and reject unsafe links and published placeholder targets.
- [ ] Phase 6: connect homepage to published CMS content; implement authenticated draft preview, publish, revision history, and transactional restore. Scheduled state is schema-ready; no unattended scheduler is implied.
- [ ] Phase 7: implement AI search/read, draft page/post, section and SEO proposals, and typed collection/menu/media/user actions. Bind confirmation to actor and exact validated proposal; recheck permissions when applying; retain audit and rollback records. Generated pages/posts remain drafts.
- [ ] Phase 8: run typecheck, production build, domain integration tests, Playwright critical flows, screenshot comparisons, keyboard/reduced-motion checks, and responsive checks at 320/375/768/1024/1366/1440 plus mobile landscape. Review dependencies, headers, safe redirects, media handling, secrets, and publication boundaries.

## Module boundaries

- `src/app/(public)`: published homepage and metadata.
- `src/app/admin`: authenticated CMS routes and bounded forms.
- `src/components/sections`: reusable approved homepage sections.
- `src/components/navigation`: header, menus, drawer, quote dialog, footer.
- `src/components/motion`: shared rotation, count-up, service-flow orchestration.
- `src/server/auth`: sessions, permission evaluation, rate limiting.
- `src/server/content`: validated queries, editorial mutations, publishing, revision restore.
- `src/server/media`: upload validation, storage and usage tracking.
- `src/server/ai`: provider interface, typed proposals, confirmation and execution.
- `src/server/integrations`: external hosting checkout and read-only analytics interfaces.
- `src/schemas`: shared bounded input/content schemas.
- `prisma`: normalized models, migrations, seed.
- `tests`: authorization, publication, revision, AI confirmation and integration coverage.
- `e2e`: frontend interactions, CMS owner journeys and responsive screenshots.

## Data model coverage

User, Role, Permission, UserRole, RolePermission, auth Account/Session/Verification; Page, PageRevision, PageSection; Post, PostRevision, Category, Tag and join records; Media and usage references; Service, Industry, PortfolioProject, HostingPlan; Menu, MenuItem, SiteSetting, SeoMetadata, Locale, Market, Redirect, AuditLog, AIActionLog. Editorial records use stable IDs, timestamps, actor attribution and appropriate soft deletion. Preserve independent draft and published representations.

## Owner handoff

README must give exact dependency installation, database startup, migration, seed, administrator bootstrap, development, test and production build commands. Environment examples contain variable names without credentials. Provide homepage/admin preview instructions, CMS editing/publishing/restore walkthrough, screenshots, actual test results, known visual differences, security/performance limitations and deferred integrations. Stop at the homepage/CMS prototype.

## Accepted foundation correction gate
Milestone 1 is accepted. Complete the correction pass documented in docs/CORRECTION_REVIEW.md, verify typecheck/build/integration/browser tests, then stop for user review. This historical gate was completed; Milestone 2 was subsequently explicitly authorized. Typed full-homepage and collection contracts are now defined ahead of rendering; current positioning storage remains compatible.

