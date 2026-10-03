# Device readiness · optimized playtest

Mathieu requested artwork optimization and device readiness on 3 October 2026. This milestone prepares the existing illustrated harbour → coast → garden proof of concept for a small playtest. It does not add another chapter or change the provisional math targets.

## Download and fidelity

The ten generated PNG masters are preserved unchanged under `assets/art-source/`, with their original checksums. Only lossless WebP delivery files enter the static build. All ten decode to exactly the same RGBA pixels and dimensions as their masters, including transparent pixels; sprite crops, camera geometry and illustration quality are unchanged. `docs/art-manifest.json` records both source and delivery checksums and decoded RGBA hashes. `python3 scripts/verify-art.py` verifies fidelity with the existing Python/Pillow environment; the browser has no new dependency. Encoding used Pillow WebP with `lossless=True, quality=100, method=6, exact=True`.

| Artwork download | Before | Now |
| --- | ---: | ---: |
| Open a new harbour journey | 24,507,883 bytes | 8,951,518 bytes |
| All ten illustrations | 24,507,883 bytes | 16,778,096 bytes |
| New coast scenery on first entry | Included at startup | 4,345,018 bytes |
| New garden scenery after the coast | Included at startup | 3,481,560 bytes |
| Resume directly in a saved garden | 24,507,883 bytes | 8,078,480 bytes |

Opening the harbour needs 63.5% less artwork; the whole island needs 31.5% less. These are artwork payload sizes, not measured internet loading times. The JavaScript bundle remains about 354 kB gzip, plus CSS/HTML. Images keep their original dimensions, so encoding reduces transfer/storage rather than decoded texture memory.

A loading screen shows chapter progress and disables world controls until scenery is ready. The loader requests only current-chapter art and shared character/sign assets, reuses textures on revisits, and loads missing harbour art when a saved-garden journey is reset. Travel saves the new destination before downloading its scenery, so refreshing a loading screen resumes the selected chapter. Failed files retain the existing playable geometric alternatives. Assets remain loaded in memory once visited; this is not an offline/service-worker cache.

## Shareable package

`npm run build` creates the static `dist/` bundle. Relative asset URLs allow hosting at a root or inside a folder. Generated PNG masters, source notes, original supplied images, curriculum PDFs and saved player progress are excluded from that web bundle. Public publication is separate from local package preparation.

For testing on this computer, run `npm run playtest`. The bundled lightweight server binds to `127.0.0.1:4173` by default. For a tablet on the same trusted Wi-Fi, explicitly run `npm run playtest -- --host 0.0.0.0` and open `http://COMPUTER-LOCAL-IP:4173/` on the tablet. Obtain the computer's local IP from its network settings. Stop the server after the review. No account or pupil name is required. Saves belong to that device/browser/address; moving to another address starts a separate save.

The packaged game must be served by a web server, rather than opened as a file. The local review server serves files inside `dist/` only and accepts GET/HEAD requests. It does not write to the repository or send progress to a service.

## Verification

Pixel fidelity, type checking and production build passed. All domain checks and gait assertions passed. All 48 regression scenarios passed in 25.3 minutes against the production bundle hosted under `/numora/` (24 desktop and 24 touch). The final save-at-travel fix passed two additional production-build scenarios at a root address: 50 verified browser scenarios in total, 25 per layout. No unrelated browser scenarios were rerun after that isolated save fix. Dedicated scenarios cover delayed image loading, download budgets, a saved garden's minimal asset set, and reset loading/caching. An additional desktop/touch check reproduced a refresh-during-download save gap; saving at travel start fixes it, and both final production-build scenarios passed. The first post-fix test had a test-only cancelled-request handling error; the corrected test deliberately cancels the old request and verifies the destination after refresh. Existing full-journey, assistance, restoration, satchel, pause/reduced-motion, save, fallback, phone and movement coverage is retained.

## Physical-device review

Automated touch layouts do not establish performance or audible quality on real tablets. For each device, record model, browser/version, orientation and date, then note:

- Did the harbour open comfortably on a fresh load, with a visible loading indicator?
- Did first-time coast/garden travel finish clearly, and did revisits feel immediate?
- Were the explorer, keeper, pump and fountain clear in portrait and landscape?
- Could the player approach objects, operate both activities, pause and reset comfortably?
- Did refreshing an unfinished activity and an earned satchel preserve progress at the same address?
- Were speech and restoration sounds clear, and did mute stop them?
- Where did a child first hesitate, need adult explanation or find the five vessels repetitive?

Next milestones: actual-device feedback, further directional/arm movement refinement if needed, and a bounded curriculum-reviewed next chapter. Human playtest observation and public hosting have not been completed by this milestone.
