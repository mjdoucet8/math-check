import Phaser from 'phaser';
import { HARBOUR_ART } from '../world/illustratedHarbour.ts';
import { HarbourScene } from './HarbourScene.ts';

/** Load the illustrated checkpoint once; retain geometric art if a file is unavailable. */
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  preload() {
    this.load.on('loaderror', () => this.registry.set('art-fallback', true));
    for (const [key, file] of HARBOUR_ART) if (key !== 'harbour-props-art') this.load.image(key, `${import.meta.env.BASE_URL}art/${file}`);
    this.load.spritesheet('explorer-art', `${import.meta.env.BASE_URL}art/explorer-frames-v1.png`, { frameWidth: 384, frameHeight: 512 });
    this.load.spritesheet('harbour-props-art', `${import.meta.env.BASE_URL}art/harbour-props-v1.png`, { frameWidth: 512, frameHeight: 512 });
  }
  create() {
    if (this.textures.exists('harbour-props-art')) {
      const texture = this.textures.get('harbour-props-art');
      texture.add('planter', 0, 20, 40, 515, 455);
      texture.add('crates', 0, 570, 60, 440, 440);
      texture.add('bollard', 0, 1100, 100, 380, 400);
      texture.add('sign', 0, 85, 525, 465, 440);
    }
    this.scene.start(HarbourScene.KEY);
  }
}
