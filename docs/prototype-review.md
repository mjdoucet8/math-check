# Phase 7 · Prototype polish and review

Mathieu requested Phase 7 on 3 October 2026. The software work covers MAT-59 (interface/audio polish) and MAT-60 (focused journey verification). MAT-61 remains a human review: the preview and backup are prepared, but a decision to refine, continue or rethink requires Mathieu’s feedback. Historical handoff documents remain unchanged.

## Playable proof of concept

Meet the harbour keeper, restore the light with five stones, follow the coastal path into the garden, fill five vessels, and discover/equip the satchel. Progress saves on this browser at this address. Optional help uses separate practice objects and then guided counting; assistance remains recorded and earns the same restoration/reward. The prototype does not establish mastery, curriculum accuracy or learning benefits.

The interface uses the existing navy, cream and gold palette. Activity text and controls are larger, prompts are shorter, and an approaching-object message names the destination. Portrait and short landscape layouts retain usable controls; long activity/confirmation panels scroll within the screen. Keyboard actions preserve focus when a control disappears or becomes disabled. Closing an activity returns focus to a usable island control. Walking through the world still requires mouse/touch; this is not a complete keyboard or screen-reader navigation implementation.

Sound on/off is available on the island and inside both math activities. It controls narration, practice/guided spoken counting and short restoration chimes. Audio begins only after a user gesture; no background music or startup sound plays. Listen reads the task instructions on request. The restoration chime follows a confirmed correct submission only. Missing browser audio APIs and narration failures leave the written task and feedback available, with an explanation in the activity. Muting stops current speech/tones. Pause, leaving the page and hiding the page stop current audio. Sound preference lasts for the page session; refreshing returns to Sound on. Browser speech uses the device/browser’s installed voice service, which may depend on connectivity.

No new dependencies, microphone, account system, names or remote progress storage were added. Original PNGs and curriculum PDFs are excluded from the source backup. No new raster assets were needed.

## Verification record

Strict TypeScript checking, the production build, all 28 domain checks and the final 34-scenario browser suite pass. The final browser run took 16 minutes locally: 17 desktop and 17 Chromium touch scenarios, including a 390 × 844 phone viewport, a 320 × 568 narrow layout and a 667 × 375 short landscape activity. Desktop/garden, phone/vessel, narrow island and reset screenshots were visually reviewed.

Coverage includes the full harbour → coast → garden → five vessels → satchel journey, independent first responses and retries, declining help, separate demonstration, guided completion with the same reward, Empty, blocked paths, retargeting, pause, reduced motion, chapter revisits, reload at unfinished/practice/success boundaries, all colour choices, cancel/confirm reset, corrupt/unsupported saves, quota failures and denied storage. New browser checks cover mute inside activities and on the island, unchanged answer evidence after Listen, absence of chimes while muted, chime requests only after confirmed restoration, unsupported/failed narration with written fallback, focus after disabling/replacing controls, rapid confirmation and small-screen control bounds. The initial focused run found a fractional-pixel measurement mismatch in a touch-control assertion; the assertion now rounds measured CSS height and the final full run passes.

Narration tests use browser API instrumentation; tone checks observe real Web Audio oscillator creation. Neither establishes audible quality on physical speakers. Physical-device audio quality and classroom usability remain manual checks below. The existing full-Phaser bundle warning remains (about 350 KB gzip); no dependency changes were made.

## Classroom-device check sheet

Run this on an actual device/browser you expect pupils to use. Record device model, browser/version, orientation and date. Mark each item pass/fail and describe any confusing moment. These items have not been performed on a physical classroom device.

The local computer preview is at `http://127.0.0.1:5173/`. That address works on the development computer only. For an optional same-Wi-Fi tablet review, run `npm run dev -- --host 0.0.0.0` on the computer and open the computer’s LAN IP with the printed port on the tablet. This address has its own browser save. Public hosting is a separate task.

- [ ] Open a fresh journey in portrait, then rotate to landscape. Goal, Pause, Sound and Start again remain readable and tappable. Activities scroll without hiding essential actions.
- [ ] Tap the keeper, beacon, signs, arch and pump. The character approaches them; paths, destination rings and blocked feedback are understandable. Follow narrow paths toward distant objects before selecting them.
- [ ] At the harbour, move five stones and Confirm. The task does not display a running answer total. Restore the light and follow the newly available path.
- [ ] Try two wrong submissions. The help offer is optional. Practice uses separate objects and preserves the answer. Then try guided counting; its restoration/reward matches independent completion.
- [ ] Listen to instructions. Check voice clarity, counting pace and volume. Confirm a correct task and listen for a brief, comfortable chime. Turn Sound off while speech plays; speech and cues stop, and written feedback remains clear.
- [ ] Complete the five vessels. Pump gives one fixed portion; Empty removes all water; Confirm submits; Next is deliberate. Assess whether five tasks feel engaging or repetitive.
- [ ] Discover the satchel, preview all three colours and equip one. Walk and revisit chapters with the visible satchel.
- [ ] Refresh an unfinished answer and a completed journey. Both resume accurately on the same browser/address. Open Start again, cancel once, then confirm and refresh to verify the new journey.
- [ ] Pause during movement and continue. Check that the camera stays comfortable, interactions remain visible while approaching, and foreground scenery does not prevent intended taps.

## Feedback to decide the next iteration

Record a short response for each: Was exploring enjoyable? Was the next destination clear? Were the math instructions clear without adult explanation? Did the five-vessel sequence have the right pace? Did restoration and the satchel make the math feel part of the adventure? Note the first moment that felt confusing or repetitive.

After review, record **refine**, **continue** or **rethink** in MAT-61 with the reasons and a bounded next milestone. No next-phase feature work or publication is implied by completing this proof of concept.
