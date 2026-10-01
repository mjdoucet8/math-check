import Phaser from 'phaser';

/** Decorative engine smoke scene. This is not a playable harbour map. */
export class FoundationScene extends Phaser.Scene {
  static readonly KEY = 'foundation';
  private scenery!: Phaser.GameObjects.Graphics;
  private ripples!: Phaser.GameObjects.Graphics;
  private phase = 0;

  constructor() { super(FoundationScene.KEY); }

  create() {
    this.scenery = this.add.graphics();
    this.ripples = this.add.graphics();
    this.draw();
    const resize = () => this.draw();
    this.scale.on('resize', resize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', resize));
    this.game.events.emit('foundation-ready');
  }

  private draw() {
    const { width, height } = this.scale;
    const g = this.scenery;
    g.clear();
    // Broad bands of sea form a restrained stage for later layered scenery.
    g.fillStyle(0x173c45).fillRect(0, 0, width, height);
    g.fillStyle(0x1b4650).fillTriangle(0, height * .1, width, height * .85, 0, height);
    g.fillStyle(0x21535a).fillTriangle(width, height * .2, width, height, width * .3, height);
    const cx = width * .5;
    const cy = height * .43;
    const scale = Math.min(width / 650, height / 360, 1.3);
    const point = (x: number, y: number) => new Phaser.Geom.Point(cx + x * scale, cy + y * scale);
    g.fillStyle(0x102f36, .7).fillEllipse(cx, cy + 94 * scale, 330 * scale, 62 * scale);
    g.fillStyle(0x7e8e86).fillPoints([point(-140, 38), point(0, -25), point(140, 38), point(0, 108)], true);
    g.fillStyle(0xb9bdab).fillPoints([point(-140, 27), point(0, -36), point(140, 27), point(0, 97)], true);
    g.lineStyle(1, 0xf1e4be, .2).strokePoints([point(-140, 27), point(0, -36), point(140, 27), point(0, 97)], true);
    g.lineStyle(1, 0x6c827d, .4);
    for (const offset of [-70, 0, 70]) {
      g.lineBetween(cx + (-100 + offset / 2) * scale, cy + (9 - offset / 4) * scale,
        cx + (40 + offset / 2) * scale, cy + (77 - offset / 4) * scale);
    }
    // The lens is deliberately dark until the future stone challenge awakens it.
    g.fillStyle(0x556a65).fillEllipse(cx, cy + 35 * scale, 88 * scale, 30 * scale);
    g.fillStyle(0xa18a52).fillRect(cx - 23 * scale, cy - 72 * scale, 46 * scale, 101 * scale);
    g.fillStyle(0x163b42).fillRect(cx - 15 * scale, cy - 64 * scale, 30 * scale, 65 * scale);
    g.fillStyle(0x29535a).fillTriangle(cx - 10 * scale, cy - 33 * scale, cx, cy - 56 * scale, cx + 10 * scale, cy - 33 * scale);
    g.fillStyle(0x1c4149).fillTriangle(cx - 10 * scale, cy - 33 * scale, cx, cy - 12 * scale, cx + 10 * scale, cy - 33 * scale);
    g.fillStyle(0xc4ad70).fillEllipse(cx, cy - 74 * scale, 60 * scale, 18 * scale);
    g.fillStyle(0x9e8750).fillTriangle(cx - 23 * scale, cy - 78 * scale, cx, cy - 108 * scale, cx + 23 * scale, cy - 78 * scale);
    g.fillStyle(0xd3ba7a).fillEllipse(cx, cy + 6 * scale, 64 * scale, 15 * scale);
    g.fillStyle(0x786640).fillRect(cx - 27 * scale, cy + 7 * scale, 54 * scale, 18 * scale);
    g.fillStyle(0xba9d60).fillEllipse(cx, cy + 25 * scale, 72 * scale, 20 * scale);
    this.drawRipples();
  }

  private drawRipples() {
    const { width, height } = this.scale;
    this.ripples.clear().lineStyle(1, 0xb8d5cc, .15);
    for (let i = 0; i < 12; i++) {
      const x = ((i * 97 + this.phase * 5) % (width + 70)) - 35;
      const y = height * (.16 + ((i * 7) % 11) * .063);
      if (Math.abs(x - width / 2) < 155 && Math.abs(y - height / 2) < 125) continue;
      this.ripples.lineBetween(x, y, x + 20 + i % 3 * 8, y);
    }
  }

  update(_time: number, delta: number) {
    this.phase += Math.min(delta, 100) / 1000;
    this.drawRipples();
  }
}
