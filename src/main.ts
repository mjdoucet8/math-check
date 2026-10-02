import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { HarbourScene, type HarbourState } from './scenes/HarbourScene.ts';
import { StoneEncounter } from './ui/StoneEncounter.ts';
import './style.css';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Numora markup is missing ${id}.`);
  return found as T;
}
const host = element('game'), status = element('status'), goal = element('goal-text');
const pause = element<HTMLButtonElement>('pause'), reset = element<HTMLButtonElement>('reset');
const pausePanel = element('pause-panel'), dialogue = element('dialogue');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lifecycle = new AbortController();
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: host, backgroundColor: '#245b65', antialias: true,
  fps: { smoothStep: false },
  scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
  scene: [BootScene, HarbourScene],
  callbacks: { preBoot: (instance) => instance.registry.set('reduced-motion', motion.matches) },
});
let paused = false, feedbackTimer: ReturnType<typeof setTimeout> | undefined;
const hint = 'Click or tap the paths to walk. Select a person or the light to approach.';
const encounter = new StoneEncounter(() => {
  closeDialogue();
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(true);
  game.scene.pause(HarbourScene.KEY); element('world-ui').inert = true; host.inert = true;
}, () => {
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(false);
  game.scene.resume(HarbourScene.KEY); element('world-ui').inert = false; host.inert = false;
}, () => game.events.emit('harbour-restored'));
game.events.on('harbour-open-challenge', () => encounter.open());
function closeDialogue() { dialogue.hidden = true; }
function setPaused(value: boolean) {
  paused = value;
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(paused);
  if (paused) game.scene.pause(HarbourScene.KEY); else game.scene.resume(HarbourScene.KEY);
  pausePanel.hidden = !paused; pause.textContent = paused ? 'Resume' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
  element('world-ui').inert = paused; host.inert = paused;
  if (paused) element('resume').focus(); else pause.focus();
}
game.events.on('harbour-ready', () => {
  host.dataset.ready = 'true'; host.dataset.checkpoint = 'counting';
  pause.disabled = false; reset.disabled = false; status.textContent = hint;
});
// Read-only geometry exposed for browser verification; input still comes from real clicks/taps.
game.events.on('harbour-state', (state: HarbourState) => {
  host.dataset.beaconAwake = String(state.beaconAwake); host.dataset.cell = state.cell; host.dataset.destination = state.destination; host.dataset.position = JSON.stringify(state.position);
  host.dataset.view = JSON.stringify(state.view); host.dataset.moving = String(state.moving);
  host.dataset.visited = state.visited.join(',');
});
game.events.on('harbour-goal', (text: string) => { goal.textContent = text; });
game.events.on('harbour-close-dialogue', closeDialogue);
game.events.on('harbour-dialogue', (text: { speaker: string; speech: string }) => {
  element('speaker').textContent = text.speaker; element('speech').textContent = text.speech; dialogue.hidden = false;
});
game.events.on('harbour-feedback', (text: string) => {
  clearTimeout(feedbackTimer); status.textContent = text;
  feedbackTimer = setTimeout(() => { status.textContent = hint; }, 2200);
});
const options = { signal: lifecycle.signal };
pause.addEventListener('click', () => setPaused(!paused), options);
element('resume').addEventListener('click', () => setPaused(false), options);
element('close-dialogue').addEventListener('click', closeDialogue, options);
reset.addEventListener('click', () => {
  clearTimeout(feedbackTimer); encounter.reset(); closeDialogue(); if (paused) setPaused(false);
  host.dataset.ready = 'false'; game.scene.getScene(HarbourScene.KEY).scene.restart();
}, options);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (paused) setPaused(false); else closeDialogue(); }
  if (paused && event.key === 'Tab') { event.preventDefault(); element('resume').focus(); }
}, options);
motion.addEventListener('change', (event) => { game.registry.set('reduced-motion', event.matches); }, options);
function dispose() { encounter.dispose(); lifecycle.abort(); clearTimeout(feedbackTimer); game.destroy(true); }
window.addEventListener('pagehide', (event) => { if (!event.persisted) dispose(); }, options);
if (import.meta.hot) import.meta.hot.dispose(dispose);
