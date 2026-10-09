> Superseded by [Homepage CMS checkpoint](HOMEPAGE_CMS_CHECKPOINT.md). The owner explicitly resumed homepage CMS after approving the frontend direction.

# Homepage checkpoint
2026-09-14: mobile/tablet refinement ready for owner visual review. CMS paused.

Current review: docs/HOMEPAGE_MOBILE_REVIEW.md. Artifacts: docs/screenshots/homepage-mobile-refinement-390.png and docs/recordings/homepage-mobile-refinement-390.webm.

Changed homepage-header.tsx (modal drawer), homepage-interactions.tsx (word controls removed and project intro wrapper), homepage.tsx (straight hero, semantic service words, mobile CTA arrow), homepage-hosting.tsx (mobile cards). New homepage-service-words.tsx, homepage-mobile-hosting.tsx, homepage-mobile.css. Desktop five-area behavior retained except requested service word animation and global wave/word-control removal. No backend or owner-data edits.

Verification: 24 unit/integration tests passed; standalone TypeScript passed; production build passed. Full 11-case browser run: 10 passed, one exact float equality failed by 0.00003px. Corrected the assertion to 0.01px tolerance, improved narrow-screen next-card previews, rebuilt outputs, reran both affected mobile/Services cases: 2 passed. Full suite was not repeated after that scoped CSS correction. Recorded tests cover 320/375/390/768 and 812×375 landscape, synthesized touch swipe, menu focus/scroll lock/Escape, project collapse/restore, services hover/focus/touch, reduced motion.

Remaining: owner visual review; physical Safari/iOS/Android and screen-reader testing unverified; exact reference timings and hover gradient stop remain assumptions. Commercial TBCs, 18-year claim and project attribution/destinations still await approval. No deployment, WordPress changes, owner publication or credential changes.

Local preview dev3002; latest production output built but port3000 may need restart. Database55432. Isolated browser environment3001. Resume only for owner review feedback; do not return to CMS without new authorization.
