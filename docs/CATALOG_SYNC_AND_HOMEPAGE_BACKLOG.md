# Catalog synchronization review, 2026-10-13

Owner request: compare industry sliders/lists and service lists throughout the site in Arabic and English. Keep them synchronized. Work on the Homepage last, including its missing Case Studies.

## Scope completed

Preserved the approved section layout, order, imagery, typography and interactions. Changes are limited to service identities, localized labels/destinations, menu completion and duplicate prevention. No CMS publication or production deployment was performed.

| Surface | Before | After |
| --- | --- | --- |
| Shared Services navigation | Current CMS menu already has 8; partial saved menus only auto-filled Technical Support | Shared catalog fills any missing service and removes duplicate destinations |
| Shared Industries navigation | Current CMS menu already has 14; a trailing slash could create duplicates | Same 14 sectors, normalized destination comparison prevents duplicates |
| Services page complete list | 8 entries but 7 unique services; Brand Design and Graphic Design both target Brand Design; Technical Support missing | 8 unique services; Brand & Graphic Design combined; Technical Support included |
| Industry detail service lists | Current drafts have 8, but older fallbacks contain inconsistent labels/destinations | All rendered complete lists resolve to the same 8 identities and localized names/links; section copy and media retained |
| Industry directory and related lists | 14 after schema completion, despite older raw files containing 11 | Confirmed complete; no layout change required |

The shared service catalog is: Technical Support, Website Design & Development, E-Commerce, Web & Mobile Apps, AI & Automation, SEO & GEO, Digital Marketing, Brand & Graphic Design. Hosting remains in its existing separate menu.

## Homepage: deferred until the final phase

The homepage component, fixtures and saved homepage content were not changed in this task. Shared navigation still uses the synchronized menus.

1. **Industry slider:** currently 8 of 14 sectors in both language snapshots. Missing Event Coordinators; Online Magazine; Fashion and Lifestyle; Beauty, Skincare & Med Spa; Restaurants, Cafés & Bakeries; Solar Energy. Add them using the same catalog identities and approved slider treatment during the Homepage phase.
2. **Services section:** its older 8 labels/groups differ from the shared catalog. Reconcile them during the Homepage phase, including the relationship to Hosting and Digital Strategy, while preserving the approved design.
3. **Case Studies:** the section is enabled and contains 3 cards, but none is marked approved. The rendering condition requires at least one approved project. Resolve the section during the Homepage phase; do not fabricate client projects or mark unapproved samples as real approved work.
4. Carry forward the owner's earlier request for at least 3 Homepage hero ideas to that final phase.

## Validation and limits

- TypeScript check passed.
- 23 catalog, destination and site-integration tests passed.
- Read-only audit checked available draft/published snapshots, plus all 14 industry fallbacks. Industry draft services covered both locales; the Services list resolves to 8 unique destinations in both locales.
- Native browser verification: Roofing showed 8 canonical service links and 14 industry entries; Services showed all 8 correct links, including Brand Design and Technical Support.
- Before/after evidence: `CATALOG_SYNC_AUDIT_BEFORE.json` and `CATALOG_SYNC_AUDIT.json`. The audit checks effective rendered catalog normalization, not writes to CMS snapshots.
- Arabic content/data checks passed. This does not publish currently private Arabic pages or claim that unpublished routes are publicly available.
- Homepage omissions remain deliberately outstanding under the owner's instruction to work on it last.
