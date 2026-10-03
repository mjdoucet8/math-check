# Illustrated harbour · first visual checkpoint

Mathieu requested a playable harbour closer to the original concept imagery on 3 October 2026. This is a visual checkpoint for review before extending detailed scenery through the coast and garden.

## Integrated artwork

The quay now uses richly textured limestone and turquoise sea artwork generated against a diagram of the existing playable land shape. Separate ivy-covered cottages, brass beacon, planters, crates, bollard and coastal sign sit at the existing world coordinates. Buildings become translucent where their overhanging artwork would hide the explorer. Object labels temporarily hide if they overlap the explorer’s head; their interaction hit areas remain present. The beacon’s blue crystal receives an engine-drawn warm light after restoration.

The explorer uses eight registered raster poses: idle and provisional walking poses facing left/right. Foot baselines are anchored per frame rather than allowing the sprite’s transparent padding to move its ground position. The keeper is a separate illustrated character. These character assets carry through chapter travel so the player retains a consistent appearance; the coast/garden scenery remains the previous geometric version for a subsequent visual pass. The earned satchel remains an engine-drawn overlay; its choices and unlocks are unchanged. More directional poses and a more detailed worn satchel are later visual refinements.

The harbour activity uses the generated beach stone and the original navy/cream/brass visual language. Its eight supply stones, five-stone target, edits versus Confirm, practice/guidance, outcome classification, reset and save record have not changed. There is no pre-equipped satchel. Missing artwork falls back to playable geometric scenery/objects with a notice rather than blocking play.

## Assets and prompts

Six runtime PNGs are saved under `public/art/`:

- `harbour-quay-v1.png`: quay, surrounding sea and distant scenery.
- `harbour-cottage-v1.png`: transparent cottage, reused at the two existing building footprints.
- `harbour-beacon-v1.png`: transparent unlit light; restoration is a separate glow.
- `explorer-frames-v1.png`: transparent 4 × 2 character sheet.
- `harbour-keeper-v1.png`: transparent keeper.
- `harbour-props-v1.png`: transparent prop/activity-object atlas.

`docs/art-prompts.md` preserves the exact six prompts used with built-in image generation. `docs/art-manifest.json` records file sizes, dimensions and SHA-256 checksums. The original supplied PNGs remain in `/home/owner/Numora` as references, excluded from the repository. Generated alpha is preserved; engine texture frames crop/position assets without rewriting the PNGs. The layout guide in `docs/art/` is generated from the existing map geometry.

The full-resolution runtime artwork totals about 13.1 MB and is loaded once at entry. This local review checkpoint prioritizes visual evaluation; smaller delivery encodings and device/network performance work remain before a classroom release. No graphics application was downloaded or installed. No dependency, curriculum, save-format or progression changes were made. The artwork is an adaptation of the concept style, not an exact reproduction of a flattened screenshot. The quay is currently a still illustration; further sea/lighting animation is a later visual refinement.

## Verification

All 28 domain checks passed. Type checking and the production build passed. All 38 browser checks passed in 18.5 minutes: 19 desktop and 19 touch scenarios, including artwork loading, missing-image fallback, harbour activity outcomes, chapter travel and saved progress. Desktop, activity and phone screenshots were visually reviewed. The live development preview was checked with the saved journey intact and no browser errors. An earlier terminal-managed browser run was interrupted by SIGTERM; the complete detached run exited successfully. The existing Phaser bundle warning remains (approximately 352 kB gzip for the main JavaScript bundle). Physical tablet performance, audible sound quality, overall visual approval and the next scenery pass remain pending.
