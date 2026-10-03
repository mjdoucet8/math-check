import Phaser from 'phaser';
import { BUILDINGS, INTERACTABLES, PROPS, TILE_HEIGHT, TILE_WIDTH, land, project, type Interactable } from './harbour.ts';

import { SATCHEL_COLOURS, type SatchelColour } from '../domain/journey.ts';

type Graphics = Phaser.GameObjects.Graphics;
function bake(scene: Phaser.Scene, g: Graphics, name: string, width: number, height: number, x: number, y: number) {
  if (scene.textures.exists(name)) scene.textures.remove(name);
  g.generateTexture(name, width, height);
  scene.add.image(x, y, name).setOrigin(0).setDepth(g.depth);
  g.destroy();
}
const point = (x: number, y: number) => new Phaser.Geom.Point(x, y);
const polygon = (g: Graphics, colour: number, points: number[][], alpha = 1) => {
  g.fillStyle(colour, alpha).fillPoints(points.map(([x, y]) => point(x!, y!)), true);
};

/** Layered vector scenery: terrain and collision data remain independent. */
export function drawTerrain(scene: Phaser.Scene): void {
  const ground = scene.add.graphics().setDepth(-100);
  ground.translateCanvas(760, 100);
  const w = TILE_WIDTH / 2, h = TILE_HEIGHT / 2;
  for (let y = 1; y <= 14; y++) for (let x = 1; x <= 18; x++) {
    if (!land({ x, y })) continue;
    const p = project({ x, y });
    if (!land({ x: x + 1, y })) polygon(ground, 0x86988d, [[p.x, p.y + h], [p.x + w, p.y], [p.x + w, p.y + 24], [p.x, p.y + h + 24]]);
    if (!land({ x, y: y + 1 })) polygon(ground, 0x6b8580, [[p.x - w, p.y], [p.x, p.y + h], [p.x, p.y + h + 24], [p.x - w, p.y + 24]]);
    const colours = [0xc9c6ad, 0xd1ccb5, 0xc0bea6, 0xd9d2b9];
    polygon(ground, colours[(x * 7 + y * 3) % colours.length]!, [[p.x, p.y - h], [p.x + w, p.y], [p.x, p.y + h], [p.x - w, p.y]]);
    ground.lineStyle(1, 0x9ca995, .5).strokePoints([point(p.x, p.y - h), point(p.x + w, p.y), point(p.x, p.y + h), point(p.x - w, p.y)], true);
    if ((x * 11 + y * 7) % 9 === 0) {
      ground.lineStyle(1, 0xa1a58f, .55).lineBetween(p.x - 15, p.y - 2, p.x - 4, p.y + 3);
      ground.fillStyle(0x719172, .6).fillEllipse(p.x + 24, p.y + 2, 8, 3);
    }
  }
  bake(scene, ground, 'harbour-ground', 1500, 900, -760, -100);
  // Coastal planting stays on blocked tiles behind cottages.
  for (const building of BUILDINGS) {
    drawCottage(scene, building);
  }
  for (const prop of PROPS) {
    const p = project(prop);
    const g = scene.add.graphics().setPosition(p.x, p.y).setDepth(p.y);
    g.translateCanvas(50, 60);
    g.fillStyle(0x405b52, .25).fillEllipse(3, 7, 57, 19);
    if (prop.kind === 'planter') {
      polygon(g, 0x9a7960, [[-25, -8], [0, -20], [25, -8], [0, 5]]);
      polygon(g, 0x82654f, [[0, 5], [25, -8], [25, 5], [0, 18]]);
      polygon(g, 0xb39973, [[-25, -8], [0, 5], [0, 18], [-25, 5]]);
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4;
        g.fillStyle(i % 2 ? 0x567e65 : 0x789571).fillEllipse(Math.cos(a) * 17, -18 + Math.sin(a) * 8, 20, 16);
        if (i % 3 === 0) g.fillStyle(0xe1b876).fillCircle(Math.cos(a) * 17, -25 + Math.sin(a) * 8, 3);
      }
    } else if (prop.kind === 'crates') {
      for (const [x, y] of [[-14, 0], [11, -12]]) {
        polygon(g, 0x9f7f51, [[x! - 17, y! - 26], [x!, y! - 34], [x! + 17, y! - 26], [x!, y! - 17]]);
        polygon(g, 0xb59461, [[x! - 17, y! - 26], [x!, y! - 17], [x!, y! + 6], [x! - 17, y! - 3]]);
        polygon(g, 0x7b603f, [[x!, y! - 17], [x! + 17, y! - 26], [x! + 17, y! - 3], [x!, y! + 6]]);
        g.lineStyle(2, 0xd1b888, .7).lineBetween(x! - 13, y! - 22, x! - 3, y! + 1);
      }
    } else {
      g.fillStyle(0x786d50).fillRect(-7, -24, 14, 28);
      g.fillStyle(0xb6a16b).fillEllipse(0, -25, 21, 9).fillEllipse(0, 4, 25, 10);
      g.lineStyle(3, 0xd1c29c).strokeEllipse(0, -13, 18, 8);
    }
    bake(scene, g, `prop-${prop.x}-${prop.y}`, 100, 110, p.x - 50, p.y - 60);
  }
  drawBoat(scene);
}

function drawCottage(scene: Phaser.Scene, building: typeof BUILDINGS[number]) {
  const p = project({ x: building.x + (building.w - 1) / 2, y: building.y + (building.h - 1) / 2 });
  const g = scene.add.graphics().setPosition(p.x, p.y).setDepth(p.y + 45);
  g.translateCanvas(128, 200);
  // Footprint is a 3-by-2 diamond, with walls and pitched roof above it.
  const a = [-100, -10], c = [100, -30], d = [-20, 30];
  g.fillStyle(0x455e50, .2).fillEllipse(14, 22, 240, 75);
  polygon(g, 0xe0d5b6, [a, d, [d[0]!, d[1]! - 88], [a[0]!, a[1]! - 88]]);
  polygon(g, 0xbebd9c, [d, c, [c[0]!, c[1]! - 88], [d[0]!, d[1]! - 88]]);
  polygon(g, building.colour, [[-109, -99], [11, -159], [29, -124], [-20, -62]]);
  polygon(g, building.colour === 0xb77253 ? 0x9e5d46 : 0x657453, [[11, -159], [110, -119], [-20, -62], [29, -124]]);
  g.lineStyle(3, 0xcfa77e, .7).lineBetween(-104, -96, -20, -59).lineBetween(-20, -59, 104, -117);
  polygon(g, 0x326268, [[-13, -27], [14, -41], [14, 13], [-13, 27]]);
  polygon(g, 0x294b52, [[34, -55], [64, -70], [64, -36], [34, -21]]);
  g.lineStyle(3, 0xe3d5ac).lineBetween(48, -63, 48, -28).lineBetween(34, -38, 64, -53);
  g.fillStyle(0xd1ad65).fillCircle(5, -7, 2);
  polygon(g, 0x42717a, [[-93, -62], [-65, -48], [-65, -21], [-93, -35]]);
  g.lineStyle(2, 0xe2d5b5).lineBetween(-79, -55, -79, -28);
  for (let i = 0; i < 14; i++) {
    const x = -100 + ((i * 23) % 38), y = -96 + ((i * 19) % 80);
    g.fillStyle(i % 2 ? 0x517c60 : 0x749168).fillEllipse(x, y, 17, 13);
    if (i % 4 === 0) g.fillStyle(0xe1c77d).fillCircle(x, y - 4, 2.5);
  }
  // Chimney and distant greenery are scenery, not interactive targets.
  polygon(g, 0xb1b399, [[-55, -129], [-55, -168], [-42, -175], [-30, -168], [-30, -130]]);
  g.fillStyle(0x7d8974).fillEllipse(-42, -169, 25, 10);
  bake(scene, g, `cottage-${building.x}`, 300, 300, p.x - 128, p.y - 200);
}

function drawBoat(scene: Phaser.Scene) {
  const p = project({ x: 2, y: 14 });
  const g = scene.add.graphics().setPosition(p.x - 65, p.y + 20).setDepth(-80);
  g.translateCanvas(100, 180);
  g.fillStyle(0x8cb9ad, .3).fillEllipse(0, 40, 175, 30);
  polygon(g, 0x745239, [[-80, -7], [45, -35], [78, -8], [45, 30], [-52, 30]]);
  polygon(g, 0xb68c57, [[-80, -7], [45, -35], [78, -8], [42, 10], [-49, 15]]);
  polygon(g, 0x806247, [[-64, -4], [42, -26], [60, -8], [38, 0], [-42, 8]]);
  g.lineStyle(5, 0x9f7c4b).lineBetween(-2, -8, -2, -147);
  polygon(g, 0xe9dfbf, [[-8, -142], [-65, -20], [-8, -30]]);
  polygon(g, 0xd5ccac, [[5, -142], [56, -41], [5, -29]]);
  polygon(g, 0x396d72, [[-1, -142], [30, -144], [17, -130], [-1, -127]]);
  bake(scene, g, 'harbour-boat', 220, 250, p.x - 165, p.y - 160);
}

/** Draw on a reusable graphics object; feet stay anchored during idle/walk animation. */
export function drawPerson(g: Graphics, phase: number, walking: boolean, keeper = false, facing = 1, satchel: SatchelColour | null = null) {
  g.clear();
  g.fillStyle(0x314e48, .3).fillEllipse(0, 2, 28, 10);
  const stride = walking ? Math.sin(phase * 12) * 5 : 0;
  const bob = walking ? Math.abs(Math.sin(phase * 12)) * 1.5 : Math.sin(phase * 2) * .7;
  g.fillStyle(0x3d4140).fillRoundedRect(-8, -19 + stride, 6, 18, 2).fillRoundedRect(3, -19 - stride, 6, 18, 2);
  g.fillStyle(0x67503b).fillRoundedRect(-10, -4 + stride, 10, 6, 2).fillRoundedRect(2, -4 - stride, 11, 6, 2);
  g.fillStyle(keeper ? 0xc8ad7b : 0x317984).fillRoundedRect(-12, -41 - bob, 25, 25, 6);
  g.fillStyle(keeper ? 0x648880 : 0x57a0a4).fillRoundedRect(-9, -40 - bob, 5, 25, 2);
  g.fillStyle(0xdbad7a).fillCircle(-13, -23 - bob + stride / 2, 4).fillCircle(14, -23 - bob - stride / 2, 4);
  g.fillStyle(0xe0b382).fillEllipse(1, -51 - bob, 22, 24);
  g.fillStyle(keeper ? 0x5a5146 : 0x634e36).fillEllipse(0, -61 - bob, 25, 14).fillRect(-12, -62 - bob, 7, 19);
  g.fillStyle(0x303e3b).fillCircle(6 * facing, -50 - bob, 1.5);
  g.fillStyle(0xb98862).fillEllipse(9 * facing, -44 - bob, 4, 3);
  g.fillStyle(keeper ? 0x426b6a : 0xd5b16a).fillRoundedRect(-8, -40 - bob, 18, 4, 2);
  if (satchel && !keeper) {
    const colour = SATCHEL_COLOURS.find(c => c.id === satchel)!.colour;
    g.lineStyle(3, 0xd3b984).lineBetween(-8 * facing, -40 - bob, 11 * facing, -20 - bob);
    drawSatchel(g, 10 * facing, -21 - bob, colour, .23);
  }
  if (keeper) { g.fillStyle(0xf0dfb8).fillRoundedRect(-6, -28 - bob, 13, 13, 2); }
}

export function drawBeacon(g: Graphics, awake = false) {
  g.clear();
  if (awake) g.fillStyle(0xeacf7f, .18).fillCircle(0, -77, 58);
  g.fillStyle(0x3d574e, .3).fillEllipse(2, 5, 65, 20);
  g.fillStyle(0x8e977b).fillRoundedRect(-22, -23, 44, 25, 5);
  g.fillStyle(0xc7ac70).fillEllipse(0, -23, 53, 16);
  g.fillStyle(0x9c814e).fillRect(-19, -111, 38, 87);
  g.fillStyle(0x274c54).fillRect(-13, -103, 26, 58);
  polygon(g, awake ? 0xffe6a1 : 0x44696b, [[0, -96], [10, -77], [0, -56], [-10, -77]]);
  polygon(g, awake ? 0xcda856 : 0x25474c, [[0, -96], [0, -56], [-10, -77]]);
  g.fillStyle(0xddc58a).fillEllipse(0, -109, 51, 16).fillEllipse(0, -41, 48, 14);
  polygon(g, 0xb2965c, [[-25, -114], [0, -143], [25, -114]]);
  g.fillStyle(0xe0c58c).fillCircle(0, -144, 4);
  g.lineStyle(3, 0xb69b61).strokeEllipse(0, -26, 27, 12);
}

export function makeInteractables(scene: Phaser.Scene, objects: readonly Interactable[] = INTERACTABLES) {
  return objects.map((object) => {
    const p = project(object);
    const container = scene.add.container(p.x, p.y).setDepth(p.y);
    const halo = scene.add.graphics().lineStyle(1.5, 0xd6b56b, .75).strokeEllipse(0, 4, object.id === 'keeper' ? 42 : 70, 19);
    const art = scene.add.graphics();
    if (object.id === 'keeper') drawPerson(art, 0, false, true);
    else if (object.id === 'beacon') drawBeacon(art);
    else { art.fillStyle(0x95784d).fillRect(-5,-63,10,63); art.fillStyle(0xe0c88b).fillRoundedRect(-38,-62,76,30,4); art.lineStyle(3,0x34626a).lineBetween(-20,-47,22,-47).lineBetween(12,-55,22,-47).lineBetween(12,-39,22,-47); }
    container.add([halo, art]);
    const label = scene.add.text(0, object.id === 'beacon' || object.id === 'arch' ? -167 : -86, object.name, {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#fff0ca', backgroundColor: '#244950', padding: { x: 9, y: 5 },
    }).setOrigin(.5);
    container.add(label);
    const height = object.id === 'beacon' || object.id === 'arch' ? 185 : 105;
    container.setInteractive(new Phaser.Geom.Rectangle(-45, -height, 90, height + 18), Phaser.Geom.Rectangle.Contains);
    container.on('pointerover', () => { halo.setAlpha(1); scene.input.setDefaultCursor('pointer'); });
    container.on('pointerout', () => { halo.setAlpha(.75); scene.input.setDefaultCursor('default'); });
    return { object, container, art };
  });
}

/** Shared shape for the discovery and the worn satchel. */
export function drawSatchel(g: Graphics, x: number, y: number, colour: number, scale = 1) {
  g.lineStyle(5 * scale, 0xb99a67).strokeEllipse(x, y - 24 * scale, 50 * scale, 56 * scale);
  g.fillStyle(colour).fillRoundedRect(x - 30 * scale, y - 22 * scale, 60 * scale, 50 * scale, 8 * scale);
  g.lineStyle(2 * scale, 0xe3d1a5).strokeRoundedRect(x - 30 * scale, y - 22 * scale, 60 * scale, 50 * scale, 8 * scale);
  g.fillStyle(colour).fillRoundedRect(x - 30 * scale, y - 22 * scale, 60 * scale, 23 * scale, 6 * scale);
  g.lineStyle(2 * scale, 0xe3d1a5).lineBetween(x - 29 * scale, y, x + 29 * scale, y);
  g.fillStyle(0xe5c67c).fillRoundedRect(x - 4 * scale, y - 5 * scale, 8 * scale, 12 * scale, 2 * scale);
}
