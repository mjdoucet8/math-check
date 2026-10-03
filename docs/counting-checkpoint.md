# Stage 3 · Harbour counting encounter

Movement review approved by Mathieu on 2 October 2026 (“Things look good”). Stage 2 was already committed as cfdb057; approval was recorded and pushed as 4bfab34 before development began.

## Encounter

Meet the keeper, then select the dormant light. Approach automatically opens a focused tray interaction, with the harbour paused behind it. Tap stones to move them between shore and brass tray; tap a tray stone to return it. There are eight available stones and a provisional target of five. There is no running answer total, spoken-answer input, timer or number entry. Optional Listen reads instructions through the browser's available speech service. The activity remains usable without speech.

Confirm is the only action that submits an answer. An incorrect response preserves the arrangement for correction. A repeated Confirm without an intervening edit is ignored, preventing duplicate mistakes from a double tap. Closing and reopening the encounter preserves the current session's arrangement and evidence. Success illuminates the beacon, updates its later conversation and points toward the next coastal-path chapter. The path itself is later work.

## Support and evidence

After two incorrect submitted arrangements, an optional demonstration becomes available. It uses three separate practice stones, highlights and names each once, and returns to the original tray unchanged. Students can ignore this help and continue independently. Accepting it marks future success as assisted.

The provisional post-demonstration trigger is one new incorrect submitted arrangement. It offers guided placement: reset the working tray explicitly, place five stones one at a time, count them with text and available speech, then Confirm. Guided evidence remains distinct. First-response independent success, independent retries, assisted success and guided completion all restore the same light. Edits, closing/reopening, practice steps and reset are not submitted maths failures. These categories do not establish mastery.

Help implementation currently covers the harbour. Equivalent pump help belongs with the garden encounter in MAT-54/MAT-56. Local persistence, garden restoration and the satchel remain later stages.

## Verification

On 2 October 2026, strict TypeScript and the production build passed, along with all 14 domain/routing/encounter checks and eight desktop/touch production-browser checks. Desktop, tablet and 390-pixel tray screenshots and the narrow restoration view were reviewed. An additional 390-pixel touch check passed for stone manipulation, Confirm and restoration.

Domain checks cover selection versus submission, first-response and retry evidence, duplicate Confirm, preserved arrangements, optional help/decline, three separate practice stones, sticky assistance and the post-demonstration guided trigger. Browser checks use actual clicks and emulated taps to approach the objects, manipulate stones, submit an answer, close/reopen, accept practice, complete guidance and reset the restored light. Existing movement/pause/resize checks remain active.

Browser speech output and physical classroom tablets require a manual check. Automated checks verify visible counting feedback and state, not audible speech quality. Runtime code and artwork remain bundled locally; no account or student name is collected. Reload resets session progress until persistence is implemented.

## User review · 2 October 2026

Mathieu confirmed “it's working” and requested Phase 4. The prior GitHub run subsequently completed with two desktop whole-test timeouts, while six browser checks passed. Local checks had passed. Phase 4 splits long scenarios, allows bounded extra headroom for software rendering, and reduces WebGL multisampling/render frequency. Verification of the new checkpoint supersedes that timed-out run.
