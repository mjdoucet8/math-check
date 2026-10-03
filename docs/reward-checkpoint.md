# Phase 5 · Explorer satchel discovery

Mathieu approved Phase 4 and requested Phase 5 on 2 October 2026. This implements MAT-57. Original brief and historical design notes remain unchanged.

## Playable reward

Completing all five vessels reveals the explorer satchel corner in the garden and changes the goal to finding it. Before completion the corner is hidden and cannot open a reward; its small pedestal footprint remains reserved for routing. Selecting the satchel automatically approaches a reachable neighbour and opens the colour chooser. A short garden-keeper line and the vessel-completion message point toward this discovery.

The three provisional colours are Moss green, Ocean teal and Sunset ochre. Each has a clearly visible satchel preview, text label and radio selection. Previewing or closing the chooser does not equip anything. Equip satchel confirms the choice and closes the chooser. The shared character renderer draws the coloured bag and shoulder strap during idle and walking, including facing changes and visits to the coast/harbour. Revisiting the discovery lets the student change colour; repeated equipping changes one choice rather than awarding extra items.

Water gently pulses and flowers open with subtle movement. Reduced-motion mode uses stable water and flower poses; pausing the world also pauses these effects. Independent, retry, assisted and guided completion all reveal the same reward. There is no shop, currency or inventory system.

## Session behavior and controls

Satchel ownership and colour live in the shared Journey session, so area changes retain them. Start again creates a fresh Journey and clears both the reward and challenge state. Reload resets progress until MAT-58 adds browser saving. The chooser pauses world/camera input, exposes labelled native radio controls, supports arrow-key choice, Tab focus containment and Escape, and restores previous focus on close. The three options fit a narrow touch viewport.

## Verification

Strict TypeScript checking, the production build and all 21 domain checks pass. All 16 distinct desktop/touch browser scenarios pass, including targeted reruns of the movement and complete reward journeys. Desktop and 390-pixel touch screenshots were reviewed. Domain checks cover the five-vessel gate, valid colours, garden-only equipping, revisits, repeated equipping, fresh reset and guided completion receiving the same reward. Browser checks cover closed reward state, independent and guided unlocking, preview/cancel, all three colours, explicit equipping, keyboard choice, area revisits and full reset. Screenshots cover narrow touch previews and the worn satchel. The initial full run passed 14 scenarios; its two failures exposed automation clicks using a moving camera or aiming beyond the visible screen. The checks now aim inside the open path, wait for an area camera to render, and walk through visible intermediate coast/garden tiles. The affected desktop/touch movement and reward flows passed their reruns without application changes. The long full-reward scenario allows 240 seconds for software rendering; individual action assertions remain bounded.

Physical classroom-tablet and audible narration checks remain manual. The existing Phaser bundle warning remains; this phase adds no dependencies or remote assets.
