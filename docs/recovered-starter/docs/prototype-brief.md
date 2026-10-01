# Numora playable prototype

Approved direction, 30 September 2026. Browser game using Phaser and TypeScript. First deliverable is the harbour movement checkpoint; expand only after Mathieu's game-feel review.

## Checkpoint 1
- Angled isometric harbour, teal sea, pale stone, brass beacon, friendly resident, young newcomer.
- Click/tap walkable ground to travel; brief destination ring. Route around obstacles; never enter water or buildings.
- Click resident/beacon to approach automatically and show one short interaction. A separate interaction button is unnecessary.
- Camera follows gently. UI clicks do not move player. Unreachable destinations receive brief blocked feedback.
- One current goal, readable sparse UI, pause and replay. Mouse and touch support.
- Simplified layered scenery and idle/walk animation are acceptable; concepts are references, not navigable geometry.

## Later checkpoints
Harbour: move five stones into a tray and Confirm; no voice answer or running count. Optional instruction narration. Two unsuccessful submitted attempts offer optional demonstration counting three practice stones. Further difficulty offers guided completion. Independent, assisted and guided evidence stay distinct.

Coastal path leads to hidden garden. Five glass vessels revealed one at a time; fixed portion per Pump click throughout; Empty clears whole vessel, Confirm submits. Foundational targets are provisional (3, 5, 4, 6, 5); no advanced operations or timed pouring. After restoration find/equip explorer satchel with three provisional colours. Assisted completion earns identical reward. Persist locally without accounts/student names; deliberate reset.

## Roles and bounded handoffs
Lead owns this brief, integration, Linear and GitHub publication. Implementation: GPT-6.1 Sol, medium reasoning, one agent at a time; owns app source/build/config/run documentation. QA: GPT-6 Luna, medium reasoning; bounded checkpoint tests, read-only unless assigned fixes. Lead creates necessary raster art. No agent may delegate further without lead instruction.

## Scope boundaries
No backend, account system, teacher dashboard, voice recognition, full curriculum routing, workshop or wider building system. Prototype tests enjoyment, usability and pacing; it does not establish grade accuracy or learning benefits.

## Acceptance
Checkpoint 1 builds and runs, movement/obstacles/approach/pause/resize work, destination feedback is clear, UI doesn't leak clicks, and Mathieu receives a runnable preview or explicit run instructions. Check mouse plus touch-sized viewport. Maintain a small coherent codebase with data-defined walkability/interactables that later scenes can reuse.

Linear: https://linear.app/mathieu-doucet/project/numora-e3f40e0a62ed
