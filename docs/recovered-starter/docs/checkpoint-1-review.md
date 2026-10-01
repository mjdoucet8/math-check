# Harbour movement review

## Manual checks
1. Start on a laptop-sized viewport. Click paving: character travels to destination, ring appears briefly, camera follows without losing character.
2. Click across cottage: route goes around blocked footprint. Click sea/building: blocked feedback, no movement into obstacles.
3. Change destination while walking: character follows newest target without teleporting.
4. Click resident from distance: walk to interaction range, one short dialogue. Click beacon: approach and inspect.
5. Click pause: movement/animation stop, Resume restores. Clicking UI never also selects a world destination.
6. Resize to a tablet viewport and repeat movement plus interaction with touch. Buttons and dialogue remain legible.
7. Reset returns initial position and clears dialogue/destination without duplicated input listeners.
8. Inspect browser console for runtime errors; build output contains all locally required assets.

## Mathieu's review
Is walking pleasant? Is character scale right? Does the scene feel like exploration? Is it obvious what to click? Are the camera and automatic interactions comfortable?

The garden and math tasks are not part of this first checkpoint. Do not label movement-only completion as a complete educational prototype.
