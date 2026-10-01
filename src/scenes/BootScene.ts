import Phaser from 'phaser';
import { FoundationScene } from './FoundationScene.ts';

/** Reserved for asset loading as the harbour scene is added. */
export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  create() { this.scene.start(FoundationScene.KEY); }
}
