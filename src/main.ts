import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { FoundationScene } from './scenes/FoundationScene.ts';
import './style.css';

const host = document.querySelector<HTMLElement>('#game');
const status = document.querySelector<HTMLElement>('#status');
const pause = document.querySelector<HTMLButtonElement>('#pause');
if (!host || !status || !pause) throw new Error('Numora preview markup is missing.');

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: host,
  backgroundColor: '#163e47',
  antialias: true,
  scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
  scene: [BootScene, FoundationScene],
  render: { transparent: false },
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lifecycle = new AbortController();
let paused = reducedMotion.matches;
function updatePauseControl() {
  pause!.textContent = paused ? 'Resume atmosphere' : 'Pause atmosphere';
  pause!.setAttribute('aria-pressed', String(paused));
}
function applyPause() {
  if (paused) game.scene.pause(FoundationScene.KEY);
  else game.scene.resume(FoundationScene.KEY);
  updatePauseControl();
}
game.events.once('foundation-ready', () => {
  host.dataset.ready = 'true';
  status.textContent = 'The harbour is taking shape.';
  pause.disabled = false;
  applyPause();
});
pause.addEventListener('click', () => {
  paused = !paused;
  applyPause();
}, { signal: lifecycle.signal });
reducedMotion.addEventListener('change', (event) => {
  paused = event.matches;
  if (host.dataset.ready === 'true') applyPause();
}, { signal: lifecycle.signal });

function dispose() {
  lifecycle.abort();
  game.destroy(true);
}
window.addEventListener('pagehide', (event) => {
  // A cached page keeps its live game when the student navigates back.
  if (!event.persisted) dispose();
}, { signal: lifecycle.signal });

if (import.meta.hot) import.meta.hot.dispose(dispose);
