import Phaser from 'phaser';
import { project } from './harbour.ts';
import type { Area } from '../domain/journey.ts';

export const JOURNEY_ART = [
  ['coastal-path-art', 'coastal-path-v1.png'],
  ['garden-courtyard-art', 'garden-courtyard-v1.png'],
  ['garden-keeper-art', 'garden-keeper-v1.png'],
] as const;
export const terrainKey = (area: Area) => area === 'harbour' ? 'harbour-quay-art' : area === 'garden' ? 'garden-courtyard-art' : 'coastal-path-art';

export const terrainOrigin = (area: Area) => area === 'garden' ? { x: -736, y: -210 } : { x: -688, y: -150 };

export function drawJourneyTerrain(scene: Phaser.Scene, area: Area): boolean {
  const key = terrainKey(area);
  if (!scene.textures.exists(key)) return false;
  const origin = terrainOrigin(area);
  scene.add.image(origin.x, origin.y, key).setOrigin(0).setDepth(-100);
  return true;
}

/** The illustration is decorative. Original route geometry remains authoritative. */
export function addJourneyPlants(scene: Phaser.Scene, area: Area, completed: number) {
  if (area !== 'garden' || !scene.textures.exists('garden-props-art')) return;
  const beds = [[3,2],[5,2],[7,2],[11,2],[13,2],[14,4],[14,6],[14,8],[12,11],[10,12],[8,12],[6,12],[4,12],[1,10],[1,8],[1,6]] as const;
  for (const [i, [x, y]] of beds.entries()) {
    const p = project({ x, y });
    scene.add.image(p.x, p.y, 'garden-props-art', 'sleeping-planter')
      .setName(`garden-dormant-${i}`).setVisible(completed <= i / 4).setOrigin(.5, 411 / 444).setScale(.14).setDepth(p.y - 1);
    scene.add.image(p.x, p.y, 'garden-props-art', 'blooming-planter')
      .setName(`garden-bloom-${i}`).setOrigin(.5, 415 / 444).setScale(.14).setDepth(p.y)
      .setData('rest-scale', .14).setVisible(completed > i / 4);
  }
}

export function attachJourneyObject(scene: Phaser.Scene, container: Phaser.GameObjects.Container,
  graphics: Phaser.GameObjects.Graphics, id: string): boolean {
  if (!scene.textures.exists('garden-props-art') || !['arch', 'pump', 'satchel'].includes(id)) return false;
  const frame = id === 'satchel' ? 'reward' : id;
  const scale = id === 'arch' ? .38 : id === 'pump' ? .28 : .25;
  const baseline = id === 'arch' ? 562 / 580 : id === 'pump' ? 548 / 580 : 414 / 444;
  const sprite = scene.add.image(0, 0, 'garden-props-art', frame).setOrigin(.5, baseline).setScale(scale);
  container.addAt(sprite, 1); graphics.clear();
  const label = container.getByName('interaction-label') as Phaser.GameObjects.Text | null;
  if (label) label.setY(id === 'arch' ? -218 : id === 'pump' ? -145 : -125);
  if (id === 'arch') container.setInteractive(new Phaser.Geom.Rectangle(-65, -210, 130, 228), Phaser.Geom.Rectangle.Contains);
  if (id === 'pump') container.setInteractive(new Phaser.Geom.Rectangle(-55, -135, 110, 153), Phaser.Geom.Rectangle.Contains);
  return true;
}

export function addIllustratedFountain(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists('garden-props-art')) return false;
  const p = project({ x: 9, y: 4 });
  scene.add.image(p.x, p.y, 'garden-props-art', 'fountain').setOrigin(.5, 541 / 580).setScale(.44).setDepth(p.y + 40);
  return true;
}
