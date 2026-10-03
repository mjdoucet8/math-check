# Phase 6 · Browser saving and deliberate replay

Mathieu requested Phase 6 on 2 October 2026. This implements MAT-58. The historical brief and prior checkpoint records remain unchanged.

## Saved journey

A versioned `numora.journey.v1` localStorage record saves the current area, last reached walkable tile in each area, visited residents, harbour stones, submitted attempts/outcomes, support classification, practice/guided steps, current vessel and water arrangement, explicit next-vessel boundary, garden restoration and equipped satchel colour. Movement destinations, camera animation, narration and open dialogs are transient. Refresh starts in the saved area; approaching the encounter resumes its saved state. No accounts, names, backend or remote storage are introduced. Browser/device/address determine the save; clearing browser data removes it.

Edits and Pump/Empty create no submissions. Restoring evidence replays submitted quantities and support through the shared evidence rules, then verifies the stored outcome and unlocks. An unfinished correct-looking arrangement is still unfinished; accepting help remains recorded after refresh. Duplicate Confirm guards and the explicit next boundary persist. Invalid/unreachable positions, impossible question state, inconsistent unlocks, altered result flags, downgraded help and unsupported versions are rejected. Decoding constructs fresh domain instances rather than trusting stored prototypes.

Save writes happen synchronously after challenge actions and reached-cell changes, with unchanged-record suppression. The current tile represents completed movement, so reload never places the character between tiles. Stale state from a departing area is ignored while the next scene starts. Satchel equipping and scene transitions use the same shared save record.

## Deliberate reset and recovery

Start again opens a short confirmation. Keep exploring or Escape preserves the saved journey. Start a new journey clears this app’s record, resets all challenge/reward state and stores a fresh journey; unrelated localStorage entries remain intact. The confirmation pauses the world/camera and supports keyboard focus containment.

Unreadable or incompatible saves recover to a fresh playable journey with a short explanation. Storage-access errors and quota/write errors are caught; the game remains playable and explains that the journey lasts only for this page. If both deleting and replacing the save fail, the reset message explicitly states that the old saved journey could not be cleared. Saving status changes are announced only when the message changes.

## Verification

Strict TypeScript checking and the production build pass. All 28 domain checks and the full 26-scenario desktop/touch browser suite pass on the final implementation (14 minutes locally). The initial ten persistence-specific browser scenarios also passed before the final full run. Desktop/touch resume and reset screenshots were reviewed. Domain checks cover round trips for unfinished, independent-retry, practice, guided and completed states; duplicate submission guards; question boundaries; reward/position/resident retention; malformed/unsupported and inconsistent records; unavailable storage; and reset leaving unrelated data intact. Browser checks exercise actual harbour answer refresh, a validated garden save fixture followed by real practice/pumping/reward inputs, reload before Next, satchel reload, cancel/confirm reset and reset durability, damaged/unsupported saves, quota failure and denied storage. Existing full journey, movement, pause, resize and reward checks remain active.

Physical classroom-tablet and audible narration checks remain manual. Vite retains the existing full-Phaser bundle warning (about 349 KB gzip). This phase adds no dependencies.
