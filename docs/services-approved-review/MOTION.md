# Services — approved layout and measured motion

Private CMS draft: 4. No publication or deployment.

## Binding design
The owner-approved final preview is `../services-reference-preview/index.html`, including the subsequent content and FAQ corrections. Shared Hero, header, footer, typography and grid retain their existing implementation. Labels have sharp corners. The only work-process section is the three numbered columns. The next section is Results / Improve / Reach, without `05` or repeated Process wording.

## Motion measurements
Read-only source: https://creativeservicespro.liquid-themes.com/case-studies/
Video: owner-supplied `service page template animation video.mp4` (148.458667 seconds).

- Introduction: upward 60px + opacity 0→1, 1800ms, start delay 800ms, 180ms stagger, power4.out.
- Introduction accordion: upward 30px + opacity 0→1, 1800ms, start delay 1100ms, 180ms stagger, power4.out.
- FAQ and numbered steps: reuse these introduction patterns as explicitly requested.
- Card entrance: x60px, scale .85, rotationY35°, opacity0 → neutral, 1800ms, 180ms stagger, power4.out.
- Card hover: frame scale1→1.09; inner image scale1.125→1; content translateZ1px→150px. 650ms cubic-bezier(.23,1,.32,1).
- Card shadow: 0 70px 200px rgba(0,0,0,.3), 300ms.
- Card icon: opacity0→1 and scale.925→1, 300ms cubic-bezier(.19,1,.22,1). Hidden outside hover/focus on pointer layouts; omitted on touch.
- Pointer perspective1200px; measured at 10%/90% positions: translation approximately ±1.6px and rotation approximately ±3.2°. Pointer movement affects the inner surface, not layout dimensions.
- Accordions: 350ms ease. Single-open, semantic buttons, expanded/controls relationships. Without JavaScript all answers remain available.
- Strategy image: the source uses CSS sticky top90px; apply only on sufficiently tall desktop layouts. No invented image entrance.
- Outcomes rows: upward35px + opacity entrance, 1800ms and 180ms stagger, power4.out.
- Dark service words/icons: Homepage ServiceWords and matching timing rules. Words rise7px with 12ms forward word staggering and 14ms return staggering; icon uses the Homepage540ms transition and delayed return.
- Numbered steps: existing outlined number changes to red outline on hover or focus, preserving readability over the number.
- Reduced motion: immediate readable states, no decorative entrance, pointer tilt, image scaling or sticky-image behavior. Touch does not depend on hover.

## CMS compatibility
Existing stable item IDs, order and revisions are retained. An optional item `enabled` boolean allows the two approved indicators and three approved outcome rows without deleting historical items or weakening identity validation. Older revisions remain valid. CMS exposes the enabled field as a checkbox, without style controls. All visible copy and local media references are saved in the private snapshot.

## Image restrictions
External image-provider requests: 0.
New external image imports: 0.
AI-generated images: 0.
Imagery remains temporary — image selection pending.
No provider keys were read or exposed. Live reference inspection blocked image/media requests.

## Draft 6 corrections
Pointer timing was verified in the live hover controller: 1.2 seconds, power2.out, including return. Owner requested broader movement, so range is explicitly expanded to ±4px / ±8 degrees, rather than claiming the original half-strength range is unchanged. Other layered hover values remain as previously measured.
The strategy section now has three owner-approved panels. Their entrances use the existing 1.8s power4.out and 180ms child stagger with independent 70%-viewport triggers. No autoplay or scroll-jacking. Desktop panel spacing allows the next title to wait for its own scroll entry.
The services grid now uses the Homepage selectors and ServiceWords implementation directly. Original title word count drives description offsets, and the original icon/word/link transitions apply. Dark colors are the only visual adaptation.
