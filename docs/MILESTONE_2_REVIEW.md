# Milestone 2 review

Delivered: approved static homepage composition plus homepage positioning Publish. Stop for owner review; no deployment.

## Changes
- Homepage includes utility/header, hero, six client slots, published positioning, eight services in 4/2/1 columns, about with five accordions, experience, three service-flow panels, hosting comparison, asymmetric project strip, eight industries and footer. Native mobile navigation/overflow and reduced-motion fallback; no advanced motion.
- Only positioning uses CMS published data. Other copy is typed static review fixtures, never seeded or published. Missing media and unverified claims are visibly labeled.
- Publish appears only with publish_pages and requires saving edits first. POST /api/cms/publish validates authentication, exact origin, strict input and expected version. It reads the saved draft server-side.
- One serializable transaction preserves PagePublication history (including preceding snapshot/timestamp), updates public snapshot/time, advances the version and records user attribution in AuditLog. A concurrent edit/publish gets 409. Saved status compares actual content with the public snapshot, not the legacy PUBLISHED database flag.
- PostgreSQL raw row-lock serialization errors from the pg adapter now map to the same 409 as Prisma transaction conflicts.

## Verification
- 24 contract/integration tests passed. The initial full run caught the row-lock error mapping; fixed and rerun successfully. Coverage includes no permission, strict input, saved/public isolation, null first publication, prior timestamps, duplicate/stale/concurrent publications, save-vs-publish race and full rollback on audit failure.
- TypeScript and owner production build passed.
- Five browser tests passed on codeyea_test / port 3001 (dedicated production test build): existing CMS acceptance plus homepage structure/keyboard checks and publish UI/endpoint/public round trip. Responsive checks at 320/375/768/1024/1366/1440 plus landscape; reduced motion checked. Desktop/mobile screenshots visually reviewed.
- Additive local migration applied. Owner Page/PageSection/PageRevision fingerprint unchanged across migration. No owner content was published. Browser publication fixtures clean up their publication/revision/audit/user rows and restore the original test page metadata; older pre-existing test suite history behavior remains isolated.

## Review
Open http://127.0.0.1:3000/ and /admin. Inspect section order, desktop/mobile spacing, native accordions and overflow strips. In CMS, observe the saved/unpublished status and role-aware Publish control. Publishing now changes local public positioning, so only click it when you intend that change. No automated owner publish was performed.

Screenshots: screenshots/homepage-1440.png, homepage-375.png, cms-published.png.

## Remaining limitations
Original hero/client/about/office/flow/project/industry/footer assets, final copy, hosting prices/claims and contact/provider destinations remain pending (MILESTONE_2_ASSETS.md). This is a static composition review, not final visual parity or production readiness. Hero word rotation and equivalent visual movement remain assigned to the later motion milestone. The production-hardening backlog in CORRECTION_REVIEW.md is unchanged.
