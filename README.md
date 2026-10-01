# Numora

Stage 1 foundation for the harbour-to-garden proof of concept. This runs a small decorative Phaser scene to verify loading, rendering, resizing and pause controls. Movement, residents, math tasks, saving and rewards belong to later stages.

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

`npm test` checks evidence rules, then builds and tests the production preview on desktop and a Chromium touch configuration. Touch emulation is not validation on a physical classroom tablet.

## Structure

- `src/main.ts`: game configuration and browser controls.
- `src/scenes/BootScene.ts`: entry/loading scene.
- `src/scenes/FoundationScene.ts`: temporary decorative engine preview; replace with the playable harbour at Stage 2.
- `src/domain/progress.ts`: plain shared challenge/outcome/progress contract; no Phaser dependency or storage system. First-response success, retries, assistance and guided completion remain distinct.
- `tests/`: domain and browser checks.
- `docs/prototype-brief.md`: original approved scope, preserved unchanged.
- `docs/recovered-starter/`: previous incomplete local starter preserved unchanged as historical material. Its commands and instructions are not the active implementation.
- `docs/source-manifest.json`: original filenames, local source locations and checksums for the supplied handoff, concepts and curriculum. Originals remain in `/home/owner/Numora`; images/PDFs have not been uploaded to GitHub.
- `docs/foundation-status.md`: verification, repository backup and next checkpoint.

## Next checkpoint

MAT-50–52: create a small layered harbour, visible player, resident and dormant beacon; add click/tap routing, camera and approach interactions; then let Mathieu review movement before adding the math journey. No keyboard movement or full character creator is implied by this foundation.

Linear: https://linear.app/mathieu-doucet/project/numora-e3f40e0a62ed
