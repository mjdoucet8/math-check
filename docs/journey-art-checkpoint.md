# Illustrated Coastal Path and Hidden Garden

Requested by Mathieu on 3 October 2026; both chapters are implemented for visual review. The new artwork follows the supplied coastal/garden concept style and the illustrated harbour. Original reference files remain in `/home/owner/education-games/numora`, excluded from the repository.

## Coastal Path

A weathered limestone promenade, brass seawall fittings, turquoise waves, layered cypress and ivy-covered ruins replace the geometric ground. The ivy-and-lantern gateway is a separate interactive sprite at the existing arch location. The return sign and explorer retain the shared illustrated style and articulated walking.

## Hidden Garden

An enclosed ivy-covered limestone courtyard, brass-inlaid paving, distant island ruins and planted walls surround the dry fountain. A distinct garden keeper, brass hand pump with empty glass vessel, closed teal-bud planters and illustrated satchel pedestal are separate objects. Restoring vessels fills the fountain and opens successive groups of flowers. Dormant planters yield to the matching blooming version rather than rendering two pedestal bases. Water streams and flower motion respect reduced motion. The satchel pedestal stays hidden until all five vessels are restored. The worn satchel and three colour choices retain their existing behavior.

The pump activity now uses navy, cream and gold styling and the same illustrated pump motif. The actual glass-vessel portions, task sequence, Pump/Empty/Confirm actions, practice and guidance, assessment evidence and saved progress are unchanged. Missing terrain or props keep their geometric alternatives playable.

Current delivery: the PNG masters are now preserved under `assets/art-source/`. The game serves pixel-identical lossless WebP versions and loads each chapter on entry. See [device readiness](device-readiness.md) for current download budgets and verification; the sizes below record the original illustration checkpoint.

## Assets

Four unchanged PNG masters under `assets/art-source/` (runtime WebP copies under `public/art/`): `coastal-path-v1.png`, `garden-courtyard-v1.png`, `garden-props-v1.png` and `garden-keeper-v1.png`. `docs/journey-art-prompts.md` preserves exact prompts and built-in tool mode; `docs/art-manifest.json` records dimensions, sizes and checksums. Generated alpha is preserved. Atlas crops and object baselines use engine texture frames, accommodating actual generated bounds without editing image pixels. Code-derived terrain diagrams remain in `docs/art/`. Camera bounds follow the registered background origins; original walkable cells and routes remain authoritative. Terrain imagery is an adaptation of the concept style, not a pixel-exact copy of supplied screenshots.

The four new PNG masters total 11.4 MB. At this original illustration checkpoint, all ten PNGs totaled 24.5 MB and loaded once at entry. Lossless delivery encoding and chapter loading have since been completed; physical-device/network performance remains to be reviewed. No graphics application or dependency was installed. Characters still use two mirrored directional views; future directional/arm refinements are separate from this chapter art pass. Sea/background foliage is a still illustration; fountain/flower overlays supply restoration animation.

## Verification

All 28 domain checks and gait assertions passed. Type checking and production build passed. All four new browser scenarios passed (two desktop and two touch): illustrated coast-to-garden restoration/reward/refresh/phone layout and missing-terrain/prop fallback. Coastal, sleeping/restored garden, pump activity and phone screenshots were visually reviewed. All 40 existing browser regression scenarios also passed in 19.7 minutes. Combined with the four new artwork scenarios, all 44 browser checks passed: 22 desktop and 22 touch. These cover chapter gates/revisits, complete restoration and satchel, guidance/evidence, save/reload/reset, reduced motion, optional narration, compact layouts and movement. The live preview remains open with the saved garden journey intact. The existing Phaser JavaScript chunk warning remains. Physical-device performance and Mathieu’s final visual feedback remain open.
