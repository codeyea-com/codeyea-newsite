# Roofing Static Detail Implementation Plan

**Goal:** Build the requested ten-part Roofing page as a private CMS draft and static reference template, preserving shared components.
**Architecture:** One bounded industry-detail snapshot contract, reusable renderer and CMS editor. Roofing is the only initialized detail route. Use existing save/revision/restore/publication safeguards; no SQL schema change.
**Tech Stack:** Existing Next.js, React, Zod, Prisma and Playwright.
**Spec:** Current owner Roofing detail request. Architecture About body is the visual foundation; Expertise contributes service-list presentation only.

## Constraints
- Reuse InternalPageHero, HomepageHeader, SiteUtility, HomepageFooter and global font/grid unchanged.
- One H1, fixed media sizes, no body motion; existing shared button hover retained.
- Roofing.docx is the primary source. No metrics, invented claims, clients, locations or unavailable links.
- Static body order: overview, needs, services, growth system, process, outcomes, FAQ, related, final CTA.
- All page copy/media/actions editable; layout remains developer-owned.
- No changes to other saved pages, no publication/deployment.

## Tasks
- [x] Add industry-detail schema/defaults, bounded section and collection identities, internal destination validation and media contract reuse.
- [x] Extend existing CMS snapshot/API/identity validation and initialization for roofing; add editor/media picker and revision comparison.
- [x] Create private preview and unpublished public route at /industries/roofing/. Keep current shared navigation and Industries destination registry unchanged.
- [x] Implement server-rendered static body and scoped styles using reference editorial splits, open columns and fixed imagery.
- [x] Add integration tests for initialization, stale saves, restore, identity validation and publication isolation; browser checks for editor/preview/media.
- [x] Initialize through authenticated API, capture 1440/768/390/320, inspect visually, verify isolation and static motion behavior, run TypeScript/build.
- [x] Deliver comparison report and private review gallery. Stop for owner approval.
