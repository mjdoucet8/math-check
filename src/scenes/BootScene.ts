import Phaser from 'phaser';
import { HARBOUR_ART } from '../world/illustratedHarbour.ts';
import { JOURNEY_ART } from '../world/illustratedGarden.ts';
import { HarbourScene } from './HarbourScene.ts';

/** Load the illustrated checkpoint once; retain geometric art if a file is unavailable. */
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  preload() {
    this.load.on('loaderror', () => this.registry.set('art-fallback', true));
    for (const [key, file] of HARBOUR_ART) if (key !== 'harbour-props-art') this.load.image(key, `${import.meta.env.BASE_URL}art/${file}`);
    for (const [key, file] of JOURNEY_ART) this.load.image(key, `${import.meta.env.BASE_URL}art/${file}`);
    this.load.spritesheet('garden-props-art', `${import.meta.env.BASE_URL}art/garden-props-v1.png`, { frameWidth: 512, frameHeight: 512 });
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
    if (this.textures.exists('garden-props-art')) {
      const texture = this.textures.get('garden-props-art');
      const frames = [
        ['arch', 0, 0, 512, 580], ['fountain', 512, 0, 512, 580], ['pump', 1024, 0, 512, 580],
        ['reward', 0, 580, 512, 444], ['sleeping-planter', 512, 580, 512, 444], ['blooming-planter', 1024, 580, 512, 444],
      ] as const;
      for (const [name, x, y, width, height] of frames) texture.add(name, 0, x, y, width, height);
    }
    this.scene.start(HarbourScene.KEY);
  }
}
