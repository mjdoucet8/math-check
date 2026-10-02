# Numora

Stage 2 movement checkpoint for the harbour-to-garden proof of concept. Explore a layered isometric harbour, select the keeper or dormant light to approach automatically, and pause or restart. Maths tasks, saving, garden access and rewards belong to later stages.

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
- `src/domain/progress.ts`: plain shared challenge/outcome/progress contract; no Phaser dependency or storage system. First-response success, retries, assistance and guided completion remain distinct.
- `tests/`: domain and browser checks.
- `docs/prototype-brief.md`: original approved scope, preserved unchanged.
- `docs/recovered-starter/`: previous incomplete local starter preserved unchanged as historical material. Its commands and instructions are not the active implementation.
- `docs/source-manifest.json`: original filenames, local source locations and checksums for the supplied handoff, concepts and curriculum. Originals remain in `/home/owner/Numora`; images/PDFs have not been uploaded to GitHub.
- `docs/foundation-status.md`: completed foundation record.
- `docs/movement-review.md`: movement checkpoint verification and review prompts.

## Next checkpoint

MAT-52: Mathieu reviews movement feel, scale, camera and click clarity before the maths journey begins. Movement uses mouse/touch ground selection and automatic approach. Keyboard controls operate the browser buttons; keyboard world navigation and a character creator are outside this checkpoint. Reduced motion stops decorative animation while keeping navigation available.

Linear: https://linear.app/mathieu-doucet/project/numora-e3f40e0a62ed
