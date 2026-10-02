import Phaser from 'phaser';
import { approach, key, project, route, START, unproject, type Cell, type Interactable, type Point } from '../world/harbour.ts';
import { drawPerson, drawTerrain, makeInteractables } from '../world/art.ts';

export interface HarbourState {
  cell: string; destination: string; position: Point; moving: boolean;
  view: { left: number; top: number; zoom: number }; visited: string[];
}
export class HarbourScene extends Phaser.Scene {
  static readonly KEY = 'harbour';
  private player!: Phaser.GameObjects.Container;
  private playerArt!: Phaser.GameObjects.Graphics;
  private water!: Phaser.GameObjects.Graphics;
  private marker!: Phaser.GameObjects.Graphics;
  private residents!: ReturnType<typeof makeInteractables>;
  private cell: Cell = { ...START };
  private path: Cell[] = [];
  private pending: Interactable | null = null;
  private visited = new Set<string>();
  private phase = 0;
  private facing = 1;
  private reducedMotion = false;
  private markerExpiry = 0;
  private telemetryAt = 0;
  constructor() { super(HarbourScene.KEY); }
  create() {
    this.cell = { ...START }; this.path = []; this.pending = null; this.visited.clear();
    this.phase = 0; this.markerExpiry = 0; this.telemetryAt = 0;
    this.reducedMotion = Boolean(this.registry.get('reduced-motion'));
    this.water = this.add.graphics().setDepth(-1000);
    drawTerrain(this);
    this.residents = makeInteractables(this);
    this.marker = this.add.graphics().setDepth(-90);
    const start = project(START);
    this.player = this.add.container(start.x, start.y).setDepth(start.y + 1);
    this.playerArt = this.add.graphics(); this.player.add(this.playerArt);
    drawPerson(this.playerArt, 0, false);
    const camera = this.cameras.main;
    camera.setBackgroundColor('#245b65').setBounds(-1000, -200, 2100, 1200);
    this.fitCamera(); camera.centerOn(start.x, start.y - 70);
    camera.startFollow(this.player, false, .06, .06, 0, 70);
    for (const resident of this.residents) resident.container.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation(); this.moveToObject(resident.object);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const world = camera.getWorldPoint(pointer.x, pointer.y);
      this.moveToGround(unproject(world), world);
    });
    this.scale.on('resize', this.fitCamera, this);
    this.registry.events.on('changedata', this.registryChanged, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fitCamera, this);
      this.registry.events.off('changedata', this.registryChanged, this);
      this.input.setDefaultCursor('default');
    });
    this.drawWater(); this.emitState();
    this.game.events.emit('harbour-ready');
    this.game.events.emit('harbour-goal', 'Meet the harbour keeper');
  }
  setCameraPaused(paused: boolean) {
    const camera = this.cameras.main;
    if (paused) camera.stopFollow();
    else camera.startFollow(this.player, false, .06, .06, 0, 70);
  }
  private registryChanged(_parent: unknown, name: string, value: unknown) {
    if (name === 'reduced-motion') { this.reducedMotion = Boolean(value); this.drawWater(); }
  }
  private fitCamera() { this.cameras.main.setZoom(Math.min(1.15, Math.max(.72, this.scale.width / 1120))); }
  // Retargeting finishes the current segment, preventing mid-step teleportation.
  private planningStart(): Cell { return this.path[0] ?? this.cell; }
  private setPath(next: Cell[], object: Interactable | null) {
    const current = this.path[0];
    this.path = current ? [current, ...next] : next;
    this.pending = object;
    this.game.events.emit('harbour-close-dialogue');
    const last = this.path.at(-1);
    if (last) this.showMarker(project(last), false);
    else this.finishInteraction();
    this.emitState();
  }
  private moveToGround(destination: Cell, point: Point) {
    const next = route(this.planningStart(), destination);
    if (next === null) {
      this.showMarker(point, true);
      this.game.events.emit('harbour-feedback', 'That spot is out of reach. Try the stone paths.');
      return;
    }
    this.setPath(next, null);
  }
  private moveToObject(object: Interactable) {
    const next = approach(this.planningStart(), object);
    if (next !== null) this.setPath(next, object);
  }
  private showMarker(point: Point, blocked: boolean) {
    this.marker.clear().setPosition(point.x, point.y).setAlpha(1);
    this.marker.lineStyle(2, blocked ? 0xca9474 : 0xe3c278).strokeEllipse(0, 0, 34, 17);
    if (blocked) this.marker.lineBetween(-5, -3, 5, 3).lineBetween(-5, 3, 5, -3);
    else this.marker.fillStyle(0xe3c278).fillCircle(0, 0, 3);
    this.markerExpiry = this.time.now + (blocked ? 850 : 1000);
  }
  private finishInteraction() {
    const object = this.pending; this.pending = null;
    if (!object) return;
    this.visited.add(object.id);
    this.game.events.emit('harbour-dialogue', { speaker: object.name, speech: object.line });
    this.game.events.emit('harbour-goal', this.visited.has('keeper')
      ? this.visited.has('beacon') ? 'Explore the quiet harbour' : 'Inspect the harbour light'
      : 'Meet the harbour keeper');
    this.emitState();
  }
  private drawWater() {
    const g = this.water.clear();
    g.fillStyle(0x245b65).fillRect(-2000, -1500, 4000, 3000);
    g.fillStyle(0x306d73, .35).fillTriangle(-1200, 600, 700, -350, 1800, 1300);
    g.fillStyle(0x5c9490, .16).fillEllipse(-50, 360, 1550, 700);
    g.lineStyle(1.5, 0x8bc0b4, .24);
    for (let i = 0; i < 70; i++) {
      const x = -900 + (i * 173 % 1900), y = -80 + (i * 97 % 1050);
      const drift = this.reducedMotion ? 0 : Math.sin(this.phase * .6 + i) * 5;
      g.lineBetween(x + drift, y, x + drift + 14 + i % 17, y - 2);
    }
  }
  private emitState() {
    const camera = this.cameras.main, origin = camera.getWorldPoint(0, 0);
    const state: HarbourState = {
      cell: key(this.cell), destination: key(this.path.at(-1) ?? this.cell), position: { x: this.player.x, y: this.player.y }, moving: this.path.length > 0,
      view: { left: origin.x, top: origin.y, zoom: camera.zoom }, visited: [...this.visited],
    };
    this.game.events.emit('harbour-state', state);
  }
  update(_time: number, delta: number) {
    const seconds = Math.min(delta, 250) / 1000; this.phase += seconds;
    this.cameras.main.setLerp(1 - Math.exp(-seconds / .24));
    let travel = seconds * 175;
    while (travel > 0 && this.path.length) {
      const next = this.path[0]!, target = project(next);
      const dx = target.x - this.player.x, dy = target.y - this.player.y, distance = Math.hypot(dx, dy);
      if (Math.abs(dx) > .01) this.facing = dx > 0 ? 1 : -1;
      if (distance <= travel) {
        this.player.setPosition(target.x, target.y); this.cell = next; this.path.shift(); travel -= distance;
        if (!this.path.length) this.finishInteraction();
      } else { this.player.x += dx / distance * travel; this.player.y += dy / distance * travel; travel = 0; }
    }
    this.player.setDepth(this.player.y + 1);
    drawPerson(this.playerArt, this.reducedMotion ? 0 : this.phase, this.path.length > 0, false, this.facing);
    for (const resident of this.residents) if (resident.object.id === 'keeper') drawPerson(resident.art, this.reducedMotion ? 0 : this.phase, false, true);
    if (!this.reducedMotion) this.drawWater();
    this.marker.setAlpha(Phaser.Math.Clamp((this.markerExpiry - this.time.now) / 250, 0, 1));
    if (this.time.now >= this.telemetryAt) { this.telemetryAt = this.time.now + 50; this.emitState(); }
  }
}
