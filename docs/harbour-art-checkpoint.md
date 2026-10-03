# Illustrated harbour · first visual checkpoint

Mathieu requested a playable harbour closer to the original concept imagery on 3 October 2026. This records the first harbour visual checkpoint. The subsequent Coastal Path and Hidden Garden artwork is documented in [the illustrated island checkpoint](journey-art-checkpoint.md).

## Integrated artwork

The quay now uses richly textured limestone and turquoise sea artwork generated against a diagram of the existing playable land shape. Separate ivy-covered cottages, brass beacon, planters, crates, bollard and coastal sign sit at the existing world coordinates. Buildings become translucent where their overhanging artwork would hide the explorer. Object labels temporarily hide if they overlap the explorer’s head; their interaction hit areas remain present. The beacon’s blue crystal receives an engine-drawn warm light after restoration.

The explorer now uses an articulated walk rig made from registered cutouts of the original idle image. Two-bone leg joints alternate planted-foot support and bent-knee recovery; a 52-world-pixel cycle is driven by actual travel distance. Starts and final stops ease at 700 pixels/second², with a 135-pixel/second cruising pace. Left-facing movement mirrors the same rig, preserving body proportions. The original provisional pose sheet remains available as the source artwork, but its repeated walk poses are no longer played. No PNG pixels are rewritten. The keeper remains a separate illustrated character. These character assets carry through chapter travel. The coast and garden now have their own scenery, and the garden has a separate illustrated keeper. The earned satchel remains an engine-drawn overlay. Further directional views, articulated arm swing and more detailed satchel motion remain visual refinements.

The harbour activity uses the generated beach stone and the original navy/cream/brass visual language. Its eight supply stones, five-stone target, edits versus Confirm, practice/guidance, outcome classification, reset and save record have not changed. There is no pre-equipped satchel. Missing artwork falls back to playable geometric scenery/objects with a notice rather than blocking play.

Current delivery: the PNG masters are now preserved under `assets/art-source/`. The game serves pixel-identical lossless WebP versions and loads each chapter on entry. See [device readiness](device-readiness.md) for current download budgets and verification; the sizes below record the original illustration checkpoint.

## Assets and prompts

Six harbour PNG masters are saved under `assets/art-source/` (runtime WebP copies are under `public/art/`):

- `harbour-quay-v1.png`: quay, surrounding sea and distant scenery.
- `harbour-cottage-v1.png`: transparent cottage, reused at the two existing building footprints.
- `harbour-beacon-v1.png`: transparent unlit light; restoration is a separate glow.
- `explorer-frames-v1.png`: transparent 4 × 2 character sheet.
- `harbour-keeper-v1.png`: transparent keeper.
- `harbour-props-v1.png`: transparent prop/activity-object atlas.

`docs/art-prompts.md` preserves the exact six prompts used with built-in image generation. `docs/art-manifest.json` records file sizes, dimensions and SHA-256 checksums. The original supplied PNGs remain in `/home/owner/education-games/numora` as references, excluded from the repository. Generated alpha is preserved; engine texture frames crop/position assets without rewriting the PNGs. The layout guide in `docs/art/` is generated from the existing map geometry.

The six harbour PNG masters total about 13.1 MB; all illustrated island masters total about 24.5 MB. The original checkpoint loaded them once at entry. Lossless delivery encoding and chapter loading are now implemented; physical-device/network performance remains before a classroom release. No graphics application was downloaded or installed. No dependency, curriculum, save-format or progression changes were made. The artwork is an adaptation of the concept style, not an exact reproduction of a flattened screenshot. The quay is currently a still illustration; further sea/lighting animation is a later visual refinement.

## Verification

All 28 domain checks passed. Type checking and the production build passed. All 38 browser checks passed in 18.5 minutes: 19 desktop and 19 touch scenarios, including artwork loading, missing-image fallback, harbour activity outcomes, chapter travel and saved progress. Desktop, activity and phone screenshots were visually reviewed. The live development preview was checked with the saved journey intact and no browser errors. An earlier terminal-managed browser run was interrupted by SIGTERM; the complete detached run exited successfully. The existing Phaser bundle warning remains (approximately 352 kB gzip for the main JavaScript bundle). Physical tablet performance, audible sound quality and overall visual approval remain pending. The completed coast and garden scenery pass has its own verification record in [the illustrated island checkpoint](journey-art-checkpoint.md).
