import Phaser from 'phaser';
import { HarbourScene } from './HarbourScene.ts';

/** Reserved for asset loading as the harbour scene is added. */
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  create() { this.scene.start(HarbourScene.KEY); }
}
