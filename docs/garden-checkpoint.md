# Phase 4 · Coastal path and hidden garden

Mathieu approved the harbour encounter on 2 October 2026 and asked to begin Phase 4. This checkpoint implements MAT-55, MAT-56 and the remaining garden-pump support in MAT-54. Satchel discovery and local persistence remain subsequent work.

## Journey

The coastal sign is approachable from the harbour, but travel is gated by beacon restoration. After restoring the light, select the sign to walk into range and follow the coast. The overgrown arch leads to a hidden garden with a keeper, dry fountain and old pump. Return signs support revisiting both earlier areas. One current goal and chapter label update with location; UI controls continue to use the shared pause, routing and automatic approach behavior.

Session state retains the beacon, visited residents, position in each area, incomplete pumping, question position, submitted evidence and support state through every area transition. Start again clears this whole session. Reload persistence is intentionally reserved for MAT-58; this is not a browser save implementation.

## Garden encounter

Five glass-vessel tasks appear sequentially; only the current vessel is shown. Provisional targets are 3, 5, 4, 6 and 5. Each Pump adds one fixed portion throughout. Visible water bands represent the portions, with no running numeric answer total. Empty clears the whole working vessel and creates no submitted attempt. Confirm records the current arrangement; an unchanged repeated Confirm is ignored. Incorrect water remains for correction. Success has an explicit next-vessel action, preventing double taps from skipping questions or applying input to the following vessel.

Two incorrect submitted arrangements offer optional pump help. The separate practice vessel receives three fixed portions, counted once each, then returns to the original answer unchanged. One new incorrect arrangement afterward offers guided Empty-and-pump counting. Support is conservatively retained across later garden vessels, so instructional exposure does not become a fresh independent-success claim. All outcome categories advance the same fountain and plant awakening. These categories describe assistance, not mastery.

The final vessel restores the water; the explorer reward corner belongs to MAT-57. There is no satchel yet, inventory, account, student name, timed pumping or spoken-answer input. Optional narration depends on the browser's speech service; visible instructions/counting remain available without speech.

## Verification

The production build and strict TypeScript check pass. All 19 domain checks and all 16 desktop/touch browser checks pass locally. A final garden-keeper dialogue correction is also checked against the production build on both input layouts.

Domain checks cover the locked harbour gate, chapter adjacency, connectivity of every accessible tile and interaction neighbour, fixed pumping, Empty, all five targets, retained incorrect water, duplicate submission guards, practice preservation, guided placement and sticky support.

Browser scenarios cover the actual harbour → coast → arch → keeper → pump journey, the closed gate, revisiting with an unfinished answer, independent retries, five sequential vessels, practice and guided completion, narrow touch layout and full session reset. Existing harbour movement, pause, resize and counting checks remain active. Long workflows are split into bounded scenarios; the desktop deadline allows software-rendering headroom without weakening per-action assertions. WebGL multisampling is disabled while texture smoothing remains enabled, and rendering is limited to 30 fps.

Physical classroom-tablet and audible narration checks remain manual. The complete Phaser bundle retains Vite's large-chunk warning (about 345 KB gzip).
