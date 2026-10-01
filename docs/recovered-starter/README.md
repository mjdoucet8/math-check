# Numora — recovered prototype checkpoint

This folder preserves the unfinished harbour prototype and planning documents recovered on 30 September 2026. It is not yet a runnable game.

The original repository is https://github.com/mjdoucet8/math-check. The starting commit is `2bfb8cc2280d31a074bac5921383a5186fd3e31c` on `numora/harbour-checkpoint`.

## Recovered work

- Project configuration and HTML interface.
- Harbour geometry, walkability, and pathfinding in `src/world.ts`.
- Interface styling in `src/style.css`.
- Prototype brief, intended review checks, and earlier design decisions.

The ten original text files were recovered without content changes. Their source locations and SHA-256 hashes are recorded in `docs/recovery-manifest.json`. See `docs/recovery-status.md` for the remaining gaps.

## Current limitations

The referenced game entry point `src/main.ts` and test file `src/world.test.ts` were absent in the earlier workspace inspection. They have not been invented or replaced during recovery. No dependencies were installed and no build or preview was started.

Concept images, the assessment PDF, the original planning ZIP, and the vendored Phaser files were not recovered. Their existence is documented in the prior execution records; their contents are not available in this local checkpoint.

## Next development checkpoint

Complete only the harbour movement and interaction scene, then verify a production build and a short mouse/touch review. Keep work sequential with no subagents unless Mathieu changes that instruction. Stop the preview process after testing. Obtain Mathieu's game-feel review before expanding to the math challenges.

The roles in the older prototype brief are historical planning. The current sequential-work instruction takes precedence.
