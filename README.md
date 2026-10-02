# Numora

Stage 3 harbour counting checkpoint for the harbour-to-garden proof of concept. Explore a layered isometric harbour, select the keeper or dormant light to approach automatically, and pause or restart. Meet the keeper, then select the light to place five stones in its tray and Confirm. Optional practice and guided counting preserve distinct completion evidence. Saving, garden access and rewards belong to later stages.

## Run

Use Node 22.18 or later within Node 22 (`.nvmrc` selects the version used for verification).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Dependencies and lockfile are pinned. No account, API key or environment file is needed. Runtime assets are bundled locally; the preview does not load fonts, artwork or game code from a CDN.

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
- `src/world/art.ts`: layered vector scenery, cached textures and idle/walk animation.
- `src/scenes/FoundationScene.ts`: historical engine preview; no longer loaded.
- `src/ui/StoneEncounter.ts`: accessible counting overlay, optional narration, practice and guided actions.
- `src/domain/stones.ts`: stone selection and submitted-attempt/help state.
- `src/domain/progress.ts`: plain shared challenge/outcome/progress contract; no Phaser dependency or storage system. First-response success, retries, assistance and guided completion remain distinct.
- `tests/`: domain and browser checks.
- `docs/prototype-brief.md`: original approved scope, preserved unchanged.
- `docs/recovered-starter/`: previous incomplete local starter preserved unchanged as historical material. Its commands and instructions are not the active implementation.
- `docs/source-manifest.json`: original filenames, local source locations and checksums for the supplied handoff, concepts and curriculum. Originals remain in `/home/owner/Numora`; images/PDFs have not been uploaded to GitHub.
- `docs/foundation-status.md`: completed foundation record.
- `docs/movement-review.md`: approved movement checkpoint.
- `docs/counting-checkpoint.md`: harbour counting scope, evidence and verification.

## Next checkpoint

Review the harbour counting encounter before expanding the coastal path and garden. Five is a provisional prototype target. Incorrect answers preserve the tray; help becomes available after two incorrect submitted arrangements. After the demonstration, one new incorrect submitted arrangement offers guided counting. An unchanged repeated Confirm is ignored. Reload and Start again clear this session; persistence is later work.

Linear: https://linear.app/mathieu-doucet/project/numora-e3f40e0a62ed
