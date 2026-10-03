import { terrainKey } from './world/illustratedGarden.ts';
import { audio } from './ui/audio.ts';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { HarbourScene, type HarbourState } from './scenes/HarbourScene.ts';
import { StoneEncounter } from './ui/StoneEncounter.ts';
import { Journey } from './domain/journey.ts';
import { VesselEncounter } from './ui/VesselEncounter.ts';
import { SatchelReward } from './ui/SatchelReward.ts';
import { BrowserSave, encodeSnapshots } from './domain/browserSave.ts';
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
let storage: Storage | null = null;
try { storage = window.localStorage; } catch { /* This browser can still play without storage. */ }
const saver = new BrowserSave(storage), loaded = saver.load();
let journey = loaded.session.journey;
const saveStatus = element('save-status');
let lastSave = '', lastAttempt = '';
let resetFailed=false, damagedSave=loaded.status==='damaged';
let resetOpen = false, resetWasPaused = false;
function saveJourney() {
  const text = encodeSnapshots(journey, encounter.snapshot(), vessels.snapshot());
  if (text === lastAttempt) return;
  lastAttempt = text;
  const saved = saver.save(text);
  if (saved) {lastSave = text;resetFailed=false;}
  const message = saved ? damagedSave ? 'A new journey is ready. The earlier save could not be read.' : 'Progress saved on this browser.' : resetFailed ? 'The saved journey could not be cleared. This new journey is for this page only.' : 'Saving is unavailable. This journey lasts until you close this page.';
  if(saveStatus.textContent!==message)saveStatus.textContent=message;
}
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: host, backgroundColor: '#245b65', antialias: true, antialiasGL: false,
  fps: { smoothStep: false, limit: 30 },
  scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
  scene: [BootScene, HarbourScene],
  callbacks: { preBoot: (instance) => {instance.registry.set('reduced-motion', motion.matches);instance.registry.set('journey',journey);} },
});
game.events.on('art-load-start', (area: string) => {
  element('loading-panel').hidden = false;
  element('loading-title').textContent = area === 'harbour' ? 'Opening the harbour…' : area === 'garden' ? 'Opening the garden…' : 'Opening the coastal path…';
  element<HTMLProgressElement>('art-progress').value = 0;
  element('world-ui').inert = true; host.dataset.ready = 'false';
  pause.disabled = true; reset.disabled = true;
});
game.events.on('art-load-progress', (value: number) => { element<HTMLProgressElement>('art-progress').value = value; });
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
const encounter = new StoneEncounter(holdWorld,releaseWorld,()=>{ game.events.emit('harbour-restored'); audio.cue(); },loaded.session.stones,saveJourney);
const vessels = new VesselEncounter(holdWorld,releaseWorld,count=>{ game.events.emit('garden-water',count); audio.cue(); },loaded.session.vessels,saveJourney);
const reward = new SatchelReward(()=>journey.satchelColour,holdWorld,releaseWorld,colour=>game.events.emit('garden-equip',colour));
// Save travel before a chapter download, so refreshing the loading screen resumes there.
game.events.on('harbour-travel', saveJourney);
game.events.on('garden-open-reward',()=>reward.open());
game.events.on('garden-open-challenge',()=>vessels.open());
game.events.on('harbour-open-challenge', () => encounter.open());
function closeDialogue() { dialogue.hidden = true; }
function setPaused(value: boolean) {
  paused = value;
  if (paused) audio.stop();
  (game.scene.getScene(HarbourScene.KEY) as HarbourScene).setCameraPaused(paused);
  if (paused) game.scene.pause(HarbourScene.KEY); else game.scene.resume(HarbourScene.KEY);
  pausePanel.hidden = !paused; pause.textContent = paused ? 'Resume' : 'Pause';
  pause.setAttribute('aria-pressed', String(paused));
  element('world-ui').inert = paused; host.inert = paused;
  if (paused) element('resume').focus(); else pause.focus();
}
game.events.on('harbour-ready', () => {
  element('loading-panel').hidden = true; element('world-ui').inert = false;
  host.dataset.ready = 'true'; host.dataset.checkpoint = 'illustrated-island';
  host.dataset.art = game.textures.exists(terrainKey(journey.area)) ? 'illustrated' : 'geometric-fallback';
  host.dataset.propsArt = String(game.textures.exists('harbour-props-art'));
  if (game.registry.get('art-fallback')) status.textContent = 'Some artwork could not load. You can still explore.';
  pause.disabled = false; reset.disabled = false; if (!game.registry.get('art-fallback')) status.textContent = hint;
});
// Read-only geometry exposed for browser verification; input still comes from real clicks/taps.
game.events.on('harbour-state', (state: HarbourState) => {
  if(state.area!==journey.area)return;
  const areaChanged=host.dataset.area!==state.area;
  if(areaChanged){
  host.dataset.area = state.area;document.body.dataset.area = state.area;host.dataset.objects=JSON.stringify(state.objects);
  const details=state.area==='harbour'?['01','THE QUIET HARBOUR','A light waiting to awaken.']:state.area==='coastal-path'?['02','THE COASTAL PATH','Something grows beyond the shore.']:['03','THE HIDDEN GARDEN','Water can bring this place back.'];
  element('place-number').textContent=details[0]!;element('place-name').textContent=details[1]!;element('place-line').textContent=details[2]!;
  hint='Click or tap the paths to walk. Select a person, sign or machine to approach.';
  element('goal-hint').textContent=state.area==='harbour'?'Tap a person, the light or the coastal sign.':state.area==='coastal-path'?'Tap the overgrown arch to explore.':'Tap the keeper or the old pump.';
  }
  const rewardChanged=host.dataset.rewardUnlocked!==String(state.rewardUnlocked)||host.dataset.satchel!==(state.satchelColour ?? 'none');
  host.dataset.rewardUnlocked=String(state.rewardUnlocked); host.dataset.satchel=state.satchelColour ?? 'none';
  if(state.area==='garden' && (rewardChanged||areaChanged)) element('goal-hint').textContent=state.rewardUnlocked ? state.satchelColour ? 'Your satchel is ready. Revisit the coast or enjoy the garden.' : 'Tap the satchel in the open garden corner.' : 'Tap the keeper or the old pump.';
  host.dataset.beaconAwake = String(state.beaconAwake); host.dataset.cell = state.cell; host.dataset.destination = state.destination; host.dataset.position = JSON.stringify(state.position);
  host.dataset.view = JSON.stringify(state.view); host.dataset.moving = String(state.moving);
  host.dataset.visited = state.visited.join(',');
  host.dataset.gardenRestored = String(journey.gardenCompleted);
  host.dataset.journeyPropsArt = String(game.textures.exists('garden-props-art'));
  host.dataset.art = game.textures.exists(terrainKey(state.area)) ? 'illustrated' : 'geometric-fallback';
  const [x,y]=state.cell.split(',').map(Number); journey.positions.set(state.area,{x:x!,y:y!}); saveJourney();
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
// A user gesture enables optional audio; nothing plays when the game loads.
document.addEventListener('pointerdown', () => audio.unlock(), { ...options, capture: true });
document.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') audio.unlock(); }, { ...options, capture: true });
document.addEventListener('click', event => {
  if ((event.target as HTMLElement).closest('[data-audio-toggle]')) audio.toggle();
}, options);
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stop(); }, options);
audio.refresh();
pause.addEventListener('click', () => setPaused(!paused), options);
element('resume').addEventListener('click', () => setPaused(false), options);
element('close-dialogue').addEventListener('click', closeDialogue, options);
const resetPanel=element('reset-panel');
function cancelReset() {
  resetOpen=false;resetPanel.hidden=true;
  if(resetWasPaused)setPaused(true);else {releaseWorld();reset.focus();}
}
reset.addEventListener('click',()=>{
  resetWasPaused=paused;resetOpen=true;holdWorld();resetPanel.hidden=false;element('cancel-reset').focus();
},options);
element('cancel-reset').addEventListener('click',cancelReset,options);
element('confirm-reset').addEventListener('click',()=>{
  resetOpen=false;resetPanel.hidden=true;clearTimeout(feedbackTimer);
  encounter.reset();vessels.reset();reward.reset();journey=new Journey();game.registry.set('journey',journey);
  closeDialogue();if(paused)setPaused(false);else releaseWorld();
  const cleared=saver.clear();resetFailed=!cleared;damagedSave=false;lastSave='';lastAttempt='';saveJourney();
  if(!cleared && !lastSave)saveStatus.textContent="The saved journey could not be cleared. This new journey is for this page only.";
  host.dataset.ready='false';game.scene.getScene(HarbourScene.KEY).scene.start('boot');reset.focus();
},options);
resetPanel.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.stopPropagation();cancelReset();}
  if(event.key==='Tab'){
    event.preventDefault();(document.activeElement===element('cancel-reset')?element('confirm-reset'):element('cancel-reset')).focus();
  }
},options);
document.addEventListener('keydown', (event) => {
  if(resetOpen)return;
  if (event.key === 'Escape') { if (paused) setPaused(false); else closeDialogue(); }
  if (paused && event.key === 'Tab') { event.preventDefault(); element('resume').focus(); }
}, options);
motion.addEventListener('change', (event) => { game.registry.set('reduced-motion', event.matches); }, options);
function dispose() { audio.dispose(); encounter.dispose(); vessels.dispose(); reward.dispose(); lifecycle.abort(); clearTimeout(feedbackTimer); game.destroy(true); }
window.addEventListener('pagehide', (event) => { if (!event.persisted) dispose(); }, options);
if (import.meta.hot) import.meta.hot.dispose(dispose);
