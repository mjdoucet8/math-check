# Numora

The illustrated harbour checkpoint updates the harbour artwork within the coastal path and hidden garden journey with a discoverable explorer satchel. Restore the harbour light, select the coastal sign, then approach the overgrown arch. In the garden, meet the keeper and use the old pump to fill five vessels, one at a time. Pump always adds one portion, Empty clears the whole vessel, and Confirm submits. Revisiting or refreshing preserves the journey’s evidence and water arrangement. Finishing the garden reveals a satchel corner: preview Moss green, Ocean teal or Sunset ochre, then equip the chosen colour. The visible satchel travels with the character. Progress saves automatically on this browser at this address. Refresh resumes the area, answer arrangements, help/evidence, vessel position and satchel. Start again asks before clearing the saved journey. If storage is unavailable, play continues with an explanatory message.

## Run

Use Node 22.18 or later within Node 22 (`.nvmrc` selects the version used for verification).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Dependencies and lockfile are pinned. No account, API key or environment file is needed. Runtime assets are bundled locally (the current full-resolution illustrated harbour is about 13.1 MB); the preview does not load fonts, artwork or game code from a CDN.

## Build and verify

```sh
npm run build
npm run preview
```

Browser checks require Playwright's Chromium once:

```sh
npx playwright install chromium
npm test
```

`npm test` checks evidence and routing rules, then builds and tests the production preview on desktop and a Chromium touch configuration. Touch emulation is not validation on a physical classroom tablet.

## Structure

- `src/main.ts`: game configuration and browser controls.
- `src/scenes/BootScene.ts`: entry/loading scene.
- `src/scenes/HarbourScene.ts`: movement, camera, destination feedback and approach interactions.
- `src/world/harbour.ts`: island, blocked footprints, projection and routing, independent of scenery.
- `src/world/art.ts`: layered objects, character rendering and geometric fallback.
- `src/world/illustratedHarbour.ts`: detailed harbour scenery, raster poses, anchored feet and foreground visibility.
- `public/art/`: generated runtime PNGs matching the concept style; original reference images remain local.
- `src/scenes/FoundationScene.ts`: historical engine preview; no longer loaded.
- `src/ui/StoneEncounter.ts`: accessible counting overlay, optional narration, practice and guided actions.
- `src/domain/journey.ts`: gated chapter travel and in-session area state.
- `src/domain/vessels.ts`: sequential fixed-portion pumping and support evidence.
- `src/world/areas.ts` and `src/world/gardenArt.ts`: coastal/garden walkability and layered scenery.
- `src/domain/browserSave.ts` and `src/domain/saveValidation.ts`: versioned browser saves, validation and safe recovery.
- `src/ui/audio.ts`: shared optional narration, mute and short restoration cues.
- `src/ui/SatchelReward.ts`: accessible colour preview and explicit equipping.
- `src/ui/VesselEncounter.ts`: pumping, practice and guided counting.
- `src/domain/stones.ts`: stone selection and submitted-attempt/help state.
- `src/domain/progress.ts`: plain shared challenge/outcome/progress contract; no Phaser dependency or storage system. First-response success, retries, assistance and guided completion remain distinct.
- `tests/`: domain and browser checks.
- `docs/prototype-brief.md`: original approved scope, preserved unchanged.
- `docs/recovered-starter/`: previous incomplete local starter preserved unchanged as historical material. Its commands and instructions are not the active implementation.
- `docs/source-manifest.json`: original filenames, local source locations and checksums for the supplied handoff, concepts and curriculum. Originals remain in `/home/owner/education-games/nunora`; images/PDFs have not been uploaded to GitHub.
- `docs/foundation-status.md`: completed foundation record.
- `docs/movement-review.md`: approved movement checkpoint.
- `docs/counting-checkpoint.md`: approved harbour counting scope.
- `docs/garden-checkpoint.md`: Phase 4 scope and verification.
- `docs/reward-checkpoint.md`: Phase 5 reward scope and verification.
- `docs/save-checkpoint.md`: Phase 6 saving and reset scope.
- `docs/prototype-review.md`: Phase 7 polish, verification and classroom review checklist.
- `docs/harbour-art-checkpoint.md`: first detailed harbour art checkpoint, scope, asset record and review notes.
- `docs/art-prompts.md` and `docs/art-manifest.json`: generation prompts and runtime asset provenance.

## Prototype review

Sound on/off controls optional instruction narration, spoken practice/guidance and gentle restoration chimes. Written tasks remain available when browser audio is missing or fails. Larger activity text, touch controls and compact landscape layouts support the final review. See `docs/prototype-review.md` for verification, known limits and the physical-device check sheet. Provisional garden targets are 3, 5, 4, 6 and 5 portions. One new submitted mistake after the three-portion demonstration offers guided counting. Instructional support remains recorded through revisits and subsequent garden vessels. Start again deliberately clears the saved journey. Saves belong to this browser and address; there are no accounts or cross-device transfers.

Linear: https://linear.app/mathieu-doucet/project/numora-e3f40e0a62ed
