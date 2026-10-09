# Showcase entrance and button review

Read-only live reference: https://codeyea.com/codeyea-about-us/, inspected 17 September 2026. Measured Liquid reveal/custom-animation configuration and computed button styles before implementation.

## Exact measured settings

- Cover #f0ebff. Top-to-bottom cover growth for .5s, then bottom-origin contraction for .5s; both power4.inOut. The image becomes visible underneath at the halfway point. No image scale was added.
- Image trigger: first intersection of the image field with the viewport, threshold 0 / zero root margin, after image readiness. Copy trigger: first copy element at viewport bottom (WordPress `top bottom`). These child thresholds are retained within the approved static section dimensions.
- Copy: kicker, heading, paragraph, button; 1.6s per element, .16s stagger, zero starting delay, power4.out. This pass implements opacity only as requested. Live WordPress also configures 35px y movement and -35deg rotationY; those transforms are deliberately excluded from the requested fade-only entrance.
- Button: #121212 to #e0144c, .3s ease. Computed live shadow is `0 12px 28px rgba(0,0,0,.12)`, not pink-tinted; pseudo-elements have no additional glow. The measured shadow is reproduced without inventing a pink shadow. Keyboard focus receives the same state plus an external outline. No translation or scale.

## Scope and fallbacks

Only the Showcase render branch, its new scoped component and scoped styles changed. Project Image Field and Three Principles code/styles were left intact. No copy, image, CMS snapshot, header/footer or homepage changes.

Desktop entrance runs once per mount; scrolling back does not replay. Tablet/mobile use the approved static layout. Reduced motion shows everything immediately and removes button transitions. Keyboard entry cancels unfinished hiding so the action is visible. Observer, media-query and document listeners and animations are cleaned up. The existing action has no configured destination; it is a focusable non-submitting button, without a fake URL or added route. 01/02/03 remain inert.

## Verification

Owner-preview recording checks passed: one-time reveal, final copy/image visibility, stationary button, keyboard outline, static 768px/390px, reduced motion and unchanged About/homepage draft/public fingerprints. Frame samples are saved in checks.json. Production build and TypeScript passed. Isolated regression suite results are reported with delivery.

No publication or deployment. Stop for owner review.
