import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { HarbourScene, type HarbourState } from './scenes/HarbourScene.ts';
import { StoneEncounter } from './ui/StoneEncounter.ts';
import { Journey } from './domain/journey.ts';
import { VesselEncounter } from './ui/VesselEncounter.ts';
import { SatchelReward } from './ui/SatchelReward.ts';
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
let journey = new Journey();
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: host, backgroundColor: '#245b65', antialias: true, antialiasGL: false,
  fps: { smoothStep: false, limit: 30 },
  scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
  scene: [BootScene, HarbourScene],
  callbacks: { preBoot: (instance) => {instance.registry.set('reduced-motion', motion.matches);instance.registry.set('journey',journey);} },
});
let paused = false, feedbackTimer: ReturnType<typeof setTimeout> | undefined;
let hint = 'Click or tap the paths to walk. Select a person or the light to approach.';
function holdWorld() {
  closeDialogue();
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(true);
  game.scene.pause(HarbourScene.KEY); element('world-ui').inert = true; host.inert = true;
}
function releaseWorld() {
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(false);
  game.scene.resume(HarbourScene.KEY); element('world-ui').inert = false; host.inert = false;
}
const encounter = new StoneEncounter(holdWorld,releaseWorld,()=>game.events.emit('harbour-restored'));
const vessels = new VesselEncounter(holdWorld,releaseWorld,count=>game.events.emit('garden-water',count));
const reward = new SatchelReward(()=>journey.satchelColour,holdWorld,releaseWorld,colour=>game.events.emit('garden-equip',colour));
game.events.on('garden-open-reward',()=>reward.open());
game.events.on('garden-open-challenge',()=>vessels.open());
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
  host.dataset.ready = 'true'; host.dataset.checkpoint = 'reward';
  pause.disabled = false; reset.disabled = false; status.textContent = hint;
});
// Read-only geometry exposed for browser verification; input still comes from real clicks/taps.
game.events.on('harbour-state', (state: HarbourState) => {
  const areaChanged=host.dataset.area!==state.area;
  if(areaChanged){
  host.dataset.area = state.area;host.dataset.objects=JSON.stringify(state.objects);
  const details=state.area==='harbour'?['01','THE QUIET HARBOUR','A light waiting to awaken.']:state.area==='coastal-path'?['02','THE COASTAL PATH','Something grows beyond the shore.']:['03','THE HIDDEN GARDEN','Water can bring this place back.'];
  element('place-number').textContent=details[0]!;element('place-name').textContent=details[1]!;element('place-line').textContent=details[2]!;
  hint='Click or tap the paths to walk. Select a person, sign or machine to approach.';
  element('goal-hint').textContent=state.area==='harbour'?'Select a person, the light or the coastal sign to walk over.':state.area==='coastal-path'?'Select the overgrown arch to see what lies beyond.':'Select the garden keeper or the old pump to approach.';
  }
  const rewardChanged=host.dataset.rewardUnlocked!==String(state.rewardUnlocked)||host.dataset.satchel!==(state.satchelColour ?? 'none');
  host.dataset.rewardUnlocked=String(state.rewardUnlocked); host.dataset.satchel=state.satchelColour ?? 'none';
  if(state.area==='garden' && (rewardChanged||areaChanged)) element('goal-hint').textContent=state.rewardUnlocked ? state.satchelColour ? 'Your satchel is ready. Revisit the coast or enjoy the garden.' : 'Select the explorer satchel in the newly opened garden corner.' : 'Select the garden keeper or the old pump to approach.';
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
  clearTimeout(feedbackTimer); encounter.reset(); vessels.reset(); reward.reset(); journey=new Journey();game.registry.set('journey',journey);closeDialogue(); if (paused) setPaused(false);
  host.dataset.ready = 'false'; game.scene.getScene(HarbourScene.KEY).scene.restart();
}, options);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (paused) setPaused(false); else closeDialogue(); }
  if (paused && event.key === 'Tab') { event.preventDefault(); element('resume').focus(); }
}, options);
motion.addEventListener('change', (event) => { game.registry.set('reduced-motion', event.matches); }, options);
function dispose() { encounter.dispose(); vessels.dispose(); reward.dispose(); lifecycle.abort(); clearTimeout(feedbackTimer); game.destroy(true); }
window.addEventListener('pagehide', (event) => { if (!event.persisted) dispose(); }, options);
if (import.meta.hot) import.meta.hot.dispose(dispose);
