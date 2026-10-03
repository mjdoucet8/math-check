# Explorer movement refinement

Mathieu reported unnatural walking on 3 October 2026. The provisional frame sequence repeatedly led with the same leg and used a global timer unrelated to travel.

The new animation reuses registered cutouts of the existing idle artwork as a two-bone leg rig. Alternating ground-contact and recovery phases keep each supporting foot moving backwards at the walking rate, with knee flexion during recovery. The body has a subtle half-pixel bob; both directions share the same proportions. Animation advances with distance, freezes with the scene, and remains still when reduced motion is enabled. Movement eases into a 135-pixel/second pace and brakes at the final destination rather than each tile. Routes and walkable cells are unchanged.

Two built-in image-generation experiments failed to provide genuinely alternating poses; neither experimental sheet is integrated or uploaded. The existing runtime image is preserved unchanged, with only engine texture frames defining limb cutouts. No dependencies or graphics software were installed.

This is an improvement pass for visual feedback, not a complete directional character system. Arm articulation, additional viewing angles and the final stop-to-idle transition may merit further refinement after review.

## Verification

All 28 existing domain checks and the new gait assertions passed. The gait checks verify joint registration, alternating support, continuous cycle boundaries and stance-foot travel cancellation. Type checking and the production build passed. All 12 targeted browser scenarios passed (six desktop, six touch), covering obstacle routing/retargeting, pause/reset/resize/reload, reduced motion, artwork fallback, harbour restoration, and arrival/save behavior. The movement scenario also passed on both platforms after adding paused-pose capture. The first draft of that scenario incorrectly compared two samples after a short walk had finished; it was corrected to compare against the initial position. The live saved coastal journey was visually checked with the new rig. These are targeted checks for this change, not a rerun of every garden activity. The existing Phaser bundle-size warning remains.
