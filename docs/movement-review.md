# Stage 2 · Harbour movement checkpoint

## Delivered

- A small layered isometric harbour: paving, shoreline, boat, cottages, planters, crates, keeper and dormant brass light. Scenery uses local vector drawings; static layers are cached as textures. The supplied concepts remain visual references, not collision maps.
- A visible player with idle and walking poses, directional facing, depth sorting and no satchel.
- Click/tap ground selection, a brief destination ring, four-neighbour routing around blocked footprints and subtle feedback for unreachable tiles.
- Changing destination finishes the current step and then follows the new route. There is no mid-step teleport or diagonal corner cutting.
- A gentle camera that follows the player, responsive canvas, pause/resume and Start again. Pause freezes movement, animation and camera; browser controls do not send ground clicks.
- Selecting the keeper or light automatically approaches a reachable adjacent tile and opens a short conversation. The light remains dormant. No maths, reward, save system or garden transition is active.
- Reduced-motion settings stop idle and water animation while leaving navigation available. Buttons have keyboard focus controls; world movement currently uses mouse/touch.

## Verification

Local verification on 1 October 2026: strict TypeScript and production build passed; all nine domain/routing checks and four browser checks passed.

The production-preview browser checks exercise real mouse clicks and emulated taps, with read-only scene geometry used to locate ground and objects. They cover movement across a blocked cottage, blocked destinations, both approach interactions, changing a destination while walking, full-scene pause, keyboard access to pause controls, repeated restart, reload, a 390-pixel viewport and reduced motion. Routing checks visit every walkable tile and verify cardinal steps, obstacle exclusion and adjacent interaction destinations. Existing six learning-evidence checks remain in place.

Screenshots are reviewed for desktop and narrow-screen layout. This is Chromium touch emulation, not a physical classroom-tablet test. The complete Phaser bundle still produces Vite's large-chunk warning, at about 1.22 MB raw / 339 KB gzip. Classroom loading and actual-device feel need later validation.

## Mathieu's review · approved 2 October 2026

Open the local preview and try:

1. Click several stone tiles, including destinations across a cottage, then change direction while walking.
2. Select the keeper and the light from a distance. Check whether automatic approach feels clear and comfortable.
3. Pause during a walk, continue, then use Start again.
4. Try a narrow window or touch device. Check player scale, camera motion, reading size and what seems clickable.

Mathieu reviewed the preview, said “Things look good,” and explicitly requested Stage 3. Proceed decision recorded in MAT-52, now Done. No movement adjustments requested. The following prompts are retained as the completed review checklist. MAT-50 and MAT-51 are also Done.

## Git backup

Stage 2 extends the approved numora/foundation branch and existing draft review: https://github.com/mjdoucet8/math-check/pull/1. Source, tests and design records are backed up there; the original images and curriculum PDFs remain excluded. The exact checkpoint SHA and verification result are recorded in Linear when published.
