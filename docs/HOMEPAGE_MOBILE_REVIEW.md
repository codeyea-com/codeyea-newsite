# Mobile / tablet homepage review
2026-09-14. Homepage frontend only. CMS remains paused; no owner publication, commercial-value edits, WordPress changes or deployment.

## Before / after
| Area | Before | After |
|---|---|---|
| Mobile navigation | White dropdown | Right-side navy modal drawer, prominent logo, close control, accordion submenus, pink action icons, overlay, scroll lock and keyboard focus containment/restoration |
| Hero / words | Curved separator and visible word controls | Straight boundary; automatic words without controls or hover/touch pausing; stable assistive text; reduced-motion and hidden/offscreen efficiency retained |
| Services | One mobile column | Two readable columns, open separators; desktop hover/focus word stagger and reverse; once-only touch entrance; links available immediately |
| Experience | Image/number spread apart | Compact image-backed composition, connected overlay copy and 18, text CTA with arrow |
| Hosting | Horizontally compressed comparison table | Mobile/tablet Embla plan cards, next-card preview, arrows/pagination, existing billing values, expandable secondary features; desktop table retained |
| Case Studies | Faded introduction left reserved space | Mobile/tablet intro space collapses and reverses; controls below cards; narrow-screen next-card preview; desktop expansion retained |
| Industries | Tight moving text | Stable readable mobile copy over stronger overlay, space for long headings, next-card preview and existing autoplay pause rules |
| Other sections / footer | Desktop spacing carried onto mobile | Compact stacks and flow spacing; navy/turquoise angular footer, grouped links and clearer CTA hierarchy |

## Review artifacts
- Full mobile screenshot: screenshots/homepage-mobile-refinement-390.png
- Mobile recording: recordings/homepage-mobile-refinement-390.webm
- Preview: http://127.0.0.1:3002/

The recording demonstrates menu/submenu, focus and Escape, Services, billing, hosting swipe/features, project swipe/collapse/reversal/filtering, Industries swipe, footer and reduced motion. It also visits the requested viewport checks. The screenshot shows the fully revealed page with reduced motion so it does not capture incomplete entrances.

## Verification
- Focused mobile interaction test passed, including synthesized touch swipes via Chromium, menu focus trap/restoration and scroll lock, project-space collapse, and no horizontal page overflow at 320, 375, 390, 768 and 812×375 landscape.
- Services checked at desktop and touch widths; semantic headings remain single coherent accessible strings. At 320px, visual service words stay inside their columns.
- 24 unit/integration tests and standalone TypeScript passed. Production build passed.
- Full browser suite: 10 passed; one exact floating-point comparison failed on a 0.00003px height difference. Replaced exact equality with a 0.01px tolerance. Also improved narrow-screen next-card widths after visual inspection. Rebuilt production and test outputs; affected mobile/Services tests rerun. Final outcome is recorded in the checkpoint.

## Assumptions / remaining approvals
- Read-only live CODEYEA mobile menu confirmed the right drawer, logo and secondary actions. Existing verified ticket, client portal and contact destinations were reused. Hosting/Work have no invented submenu destinations; Services and Industries use the approved taxonomy.
- Hostinger (https://www.hostinger.com/web-hosting) and GoDaddy (https://www.godaddy.com/hosting/web-hosting) were consulted for plan hierarchy. Separate supplied reference image files were not attached in this turn. Their exact mobile animation timings were not measured; this is a custom branded interpretation.
- Card positioning lines restate existing storage figures. Colossal is visually featured without an invented recommendation claim. All previous TBC pricing/renewal/inclusion notes remain. Project identities, destinations and the 18-year claim still require the existing owner approvals.
- Native modal-dialog behavior and transition support vary by browser. Verified in Chromium; physical iOS/Android devices, Safari and TalkBack/VoiceOver remain untested. Operating-system reduced motion removes the new animation.
- Existing shared solid-pink hover fallback remains because the original gradient's second stop/direction is unverified.

Stop for owner visual review. Do not resume CMS development or deploy.
