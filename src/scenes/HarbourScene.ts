import Phaser from 'phaser';
import { approach, key, project, route, unproject, type Cell, type Interactable, type Point } from '../world/harbour.ts';
import { Journey, type Area } from '../domain/journey.ts';
import { AREA_OBJECTS, AREA_START, areaWalkable } from '../world/areas.ts';
import { drawBeyondHarbour, refreshGarden } from '../world/gardenArt.ts';
import { drawBeacon, drawPerson, drawTerrain, makeInteractables } from '../world/art.ts';

export interface HarbourState {
  area: Area; objects: readonly Interactable[]; beaconAwake: boolean; cell: string; destination: string; position: Point; moving: boolean;
  view: { left: number; top: number; zoom: number }; visited: string[];
}
export class HarbourScene extends Phaser.Scene {
  static readonly KEY = 'harbour';
  private player!: Phaser.GameObjects.Container;
  private playerArt!: Phaser.GameObjects.Graphics;
  private water!: Phaser.GameObjects.Graphics;
  private marker!: Phaser.GameObjects.Graphics;
  private residents!: ReturnType<typeof makeInteractables>;
  private cell: Cell = {x:7,y:11};
  private journey!: Journey;
  private path: Cell[] = [];
  private pending: Interactable | null = null;
  private visited = new Set<string>();
  private beaconAwake = false;
  private phase = 0;
  private facing = 1;
  private reducedMotion = false;
  private markerExpiry = 0;
  private telemetryAt = 0;
  constructor() { super(HarbourScene.KEY); }
  create() {
    this.journey = this.registry.get('journey') as Journey;
    this.beaconAwake = this.journey.beaconAwake;
    this.cell = { ...(this.journey.positions.get(this.journey.area) ?? AREA_START[this.journey.area]) }; this.path = []; this.pending = null;
    this.visited = this.journey.visited.get(this.journey.area) ?? new Set<string>();
    this.journey.visited.set(this.journey.area,this.visited);
    this.phase = 0; this.markerExpiry = 0; this.telemetryAt = 0;
    this.reducedMotion = Boolean(this.registry.get('reduced-motion'));
    this.water = this.add.graphics().setDepth(-1000);
    if (this.journey.area === 'harbour') {
      drawTerrain(this); this.residents = makeInteractables(this, AREA_OBJECTS.harbour);
      if (this.beaconAwake) drawBeacon(this.residents.find(r=>r.object.id==='beacon')!.art,true);
    } else this.residents = drawBeyondHarbour(this,this.journey.area,this.journey.gardenCompleted);
    this.marker = this.add.graphics().setDepth(-90);
    const start = project(this.cell);
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
    this.game.events.on('harbour-restored', this.restoreBeacon, this);
    this.game.events.on('garden-water', this.updateGarden, this);
    this.events.once('shutdown', () => {
      this.game.events.off('harbour-restored', this.restoreBeacon, this);
      this.game.events.off('garden-water', this.updateGarden, this);
      this.scale.off('resize', this.fitCamera, this);
      this.registry.events.off('changedata', this.registryChanged, this);
      this.input.setDefaultCursor('default');
    });
    this.drawWater(); this.emitState();
    this.game.events.emit('harbour-ready');
    this.emitGoal();
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
    const next = route(this.planningStart(), destination, cell=>areaWalkable(this.journey.area,cell));
    if (next === null) {
      this.showMarker(point, true);
      this.game.events.emit('harbour-feedback', 'That spot is out of reach. Try the stone paths.');
      return;
    }
    this.setPath(next, null);
  }
  private moveToObject(object: Interactable) {
    const next = approach(this.planningStart(), object, cell=>areaWalkable(this.journey.area,cell));
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
    if (object.id==='coast') {
      if(this.journey.area==='harbour'&&!this.beaconAwake) {
        this.game.events.emit('harbour-dialogue',{speaker:'Coastal path',speech:'Bring the harbour light back before following this path.'});return;
      }
      this.travel('coastal-path');return;
    }
    if(object.id==='harbour'){this.travel('harbour');return;}
    if(object.id==='arch'){this.travel('garden');return;}
    if(object.id==='pump'){this.game.events.emit('garden-open-challenge');return;}
    this.visited.add(object.id);
    if (object.id === 'beacon' && this.visited.has('keeper') && !this.beaconAwake) {
      this.game.events.emit('harbour-open-challenge');
    } else this.game.events.emit('harbour-dialogue', {
      speaker: object.name,
      speech: object.id==='gardener' && this.journey.gardenCompleted===5 ? 'You brought water back. The garden can begin to grow again.' : this.journey.area==='harbour' && this.beaconAwake ? object.id === 'keeper' ? 'You brought the light back. The coastal path is waiting for our next adventure.' : 'The crystal shines with a warm, steady light.' : object.line,
    });
    this.emitGoal();
    this.emitState();
  }
  private emitGoal() {
    const area=this.journey.area;
    this.game.events.emit('harbour-goal', area==='harbour' ? this.beaconAwake ? 'Follow the coastal path' : this.visited.has('keeper') ? 'Restore the harbour light' : 'Meet the harbour keeper'
      : area==='coastal-path' ? 'Explore the overgrown arch' : this.journey.gardenCompleted===5 ? 'The garden water is restored' : 'Bring water back to the garden');
  }
  private travel(destination: Area) {
    this.journey.positions.set(this.journey.area,{...this.cell});
    if(!this.journey.travel(destination))return;
    this.game.events.emit('harbour-close-dialogue');this.game.events.emit('harbour-travel');this.scene.restart();
  }
  private updateGarden(completed: number) {this.journey.gardenCompleted=completed;if(this.journey.area==='garden')refreshGarden(this,completed);this.emitGoal();}
  private restoreBeacon() {
    this.beaconAwake = true; this.journey.beaconAwake = true;
    const beacon = this.residents.find(resident => resident.object.id === 'beacon')!;
    drawBeacon(beacon.art, true);
    this.emitGoal();
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
      area: this.journey.area, objects: AREA_OBJECTS[this.journey.area], beaconAwake: this.beaconAwake, cell: key(this.cell), destination: key(this.path.at(-1) ?? this.cell), position: { x: this.player.x, y: this.player.y }, moving: this.path.length > 0,
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
    for (const resident of this.residents) if (['keeper','gardener'].includes(resident.object.id)) drawPerson(resident.art, this.reducedMotion ? 0 : this.phase, false, true);
    if (!this.reducedMotion) this.drawWater();
    this.marker.setAlpha(Phaser.Math.Clamp((this.markerExpiry - this.time.now) / 250, 0, 1));
    if (this.time.now >= this.telemetryAt) { this.telemetryAt = this.time.now + 50; this.emitState(); }
  }
}
