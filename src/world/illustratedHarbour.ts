import Phaser from 'phaser';
import { BUILDINGS, PROPS, project } from './harbour.ts';

export const HARBOUR_ART = [
  ['harbour-quay-art', 'harbour-quay-v1.png'],
  ['harbour-cottage-art', 'harbour-cottage-v1.png'],
  ['harbour-beacon-art', 'harbour-beacon-v1.png'],
  ['harbour-keeper-art', 'harbour-keeper-v1.png'],
  ['harbour-props-art', 'harbour-props-v1.png'],
] as const;
const FEET = [457, 460, 457, 460, 445, 445, 444, 445];

/** Raster art uses the existing world coordinates; it never defines walkability. */
export function drawIllustratedTerrain(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists('harbour-quay-art')) return false;
  scene.add.image(-688, -150, 'harbour-quay-art').setOrigin(0).setDepth(-100);
  if (scene.textures.exists('harbour-cottage-art')) for (const [index, building] of BUILDINGS.entries()) {
    const p = project({ x: building.x + (building.w - 1) / 2, y: building.y + (building.h - 1) / 2 });
    scene.add.image(p.x, p.y, 'harbour-cottage-art').setOrigin(.516, .8).setScale(.21)
      .setDepth(p.y + 45).setName(`illustrated-house-${index}`).setData('foot', p);
  }
  if (scene.textures.exists('harbour-props-art')) for (const prop of PROPS) {
    const p = project(prop), frame = prop.kind === 'planter' ? 'planter' : prop.kind === 'crates' ? 'crates' : 'bollard';
    scene.add.image(p.x, p.y, 'harbour-props-art', frame).setOrigin(.5, .96)
      .setScale(prop.kind === 'planter' ? .15 : .13).setDepth(p.y);
  }
  return true;
}

/** Buildings yield visually when the explorer is behind their overhanging art. */
export function revealExplorer(scene: Phaser.Scene, x: number, y: number) {
  for (let index = 0; index < BUILDINGS.length; index++) {
    const house = scene.children.getByName(`illustrated-house-${index}`) as Phaser.GameObjects.Image | null;
    if (!house) continue;
    const foot = house.getData('foot') as { x: number; y: number };
    const behind = Math.abs(x - foot.x) < 125 && y < foot.y + 38 && y > foot.y - 195;
    house.setAlpha(behind ? .4 : 1);
  }
}

export function attachIllustratedPerson(scene: Phaser.Scene, container: Phaser.GameObjects.Container,
  graphics: Phaser.GameObjects.Graphics, keeper = false) {
  const key = keeper ? 'harbour-keeper-art' : 'explorer-art';
  if (!scene.textures.exists(key)) return;
  const sprite = scene.add.image(0, 0, key).setOrigin(.5, keeper ? 1477 / 1536 : FEET[0]! / 512)
    .setScale(keeper ? .067 : .23);
  container.addAt(sprite, container.length === 1 ? 0 : 1);
  graphics.setData('illustrated-person', sprite);
}

export function drawIllustratedPerson(graphics: Phaser.GameObjects.Graphics, phase: number,
  walking: boolean, keeper: boolean, facing: number): boolean {
  const sprite = graphics.getData('illustrated-person') as Phaser.GameObjects.Image | undefined;
  if (!sprite) return false;
  const bob = walking ? 0 : Math.sin(phase * 2) * .45;
  if (!keeper) {
    const pose = walking ? [1, 2, 3, 2][Math.floor(phase * 8) % 4]! : 0;
    const frame = pose + (facing < 0 ? 4 : 0);
    if (graphics.getData('illustrated-frame') !== frame) { sprite.setFrame(frame); graphics.setData('illustrated-frame', frame); }
    sprite.setOrigin(.5, FEET[frame]! / 512);
  }
  sprite.setY(-bob);
  graphics.clear().fillStyle(0x243b34, .22).fillEllipse(0, 2, keeper ? 32 : 27, 9);
  return true;
}

export function attachIllustratedProp(scene: Phaser.Scene, container: Phaser.GameObjects.Container,
  graphics: Phaser.GameObjects.Graphics, id: string) {
  if (id === 'beacon' && scene.textures.exists('harbour-beacon-art')) {
    const sprite = scene.add.image(0, 0, 'harbour-beacon-art').setOrigin(.5, 1465 / 1536).setScale(.112);
    container.addAt(sprite, 1); graphics.setData('illustrated-beacon', true);
  }
  if (id === 'coast' && scene.textures.exists('harbour-props-art') && scene.registry.get('journey')?.area === 'harbour') {
    const sprite = scene.add.image(0, 0, 'harbour-props-art', 'sign').setOrigin(.28, .94).setScale(.17);
    container.addAt(sprite, 1); graphics.clear();
    graphics.lineStyle(2.5, 0xf2d58e).lineBetween(-4, -45, 25, -45).lineBetween(16, -51, 25, -45).lineBetween(16, -39, 25, -45);
  }
}
