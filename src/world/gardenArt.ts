import Phaser from 'phaser';
import { areaLand, AREA_OBJECTS } from './areas.ts';
import { project } from './harbour.ts';
import { makeInteractables, drawPerson } from './art.ts';
import type { Area } from '../domain/journey.ts';
export function drawBeyondHarbour(scene: Phaser.Scene, area: Area, completed: number) {
    const g = scene.add.graphics().setDepth(-100);
    g.translateCanvas(650, 120);
    for (let y = 1; y <= 12; y++)
        for (let x = 1; x <= 14; x++)
            if (areaLand(area, { x, y })) {
                const p = project({ x, y });
                g.fillStyle(area === 'garden' ? ((x + y) % 3 === 0 ? 0x99aa80 : 0xb5b79a) : 0xbec2a3);
                g.fillPoints([{ x: p.x, y: p.y - 20 }, { x: p.x + 40, y: p.y }, { x: p.x, y: p.y + 20 }, { x: p.x - 40, y: p.y }], true);
                g.lineStyle(1, 0x7e9679, .35).strokePoints([{ x: p.x, y: p.y - 20 }, { x: p.x + 40, y: p.y }, { x: p.x, y: p.y + 20 }, { x: p.x - 40, y: p.y }], true);
                if (!areaLand(area, { x, y: y + 1 })) {
                    g.fillStyle(0x708c79).fillPoints([{ x: p.x - 40, y: p.y }, { x: p.x, y: p.y + 20 }, { x: p.x, y: p.y + 38 }, { x: p.x - 40, y: p.y + 18 }], true);
                }
            }
    const texture = `terrain-${area}`;
    if (scene.textures.exists(texture))
        scene.textures.remove(texture);
    g.generateTexture(texture, 1300, 900);
    g.destroy();
    scene.add.image(-650, -120, texture).setOrigin(0).setDepth(-100);
    for (let i = 0; i < 16; i++) {
        const cell = { x: 3 + (i * 7 % 10), y: 2 + (i * 3 % 10) };
        if (!areaLand(area, cell))
            continue;
        const p = project(cell), plant = scene.add.graphics().setPosition(p.x, p.y).setDepth(p.y - 1);
        plant.fillStyle(completed > i / 4 ? 0x79a37a : 0x698974, .7).fillEllipse(-12, 0, 26, 12).fillEllipse(5, -6, 32, 19);
        scene.add.graphics().setName(`garden-bloom-${i}`).setPosition(p.x, p.y).setDepth(p.y).fillStyle(0xe5c67c).fillCircle(4, -10, 3).setVisible(completed > i / 4);
    }
    if (area === 'garden') {
        const p = project({ x: 9, y: 4 });
        const f = scene.add.graphics().setPosition(p.x, p.y).setDepth(p.y + 40);
        f.fillStyle(0x75897a).fillEllipse(0, 5, 190, 90).fillStyle(0xbdc2a4).fillEllipse(0, -8, 182, 83);
        f.fillStyle(completed ? 0x619e9a : 0x7f9080).fillEllipse(0, -10, 146, 61);
        f.fillStyle(0xa6b395).fillRoundedRect(-14, -82, 28, 70, 6).fillEllipse(0, -83, 80, 26);
        scene.add.graphics().setName('garden-water').setPosition(p.x, p.y).setDepth(p.y + 41);
        refreshGarden(scene, completed);
    }
    const residents = makeInteractables(scene, AREA_OBJECTS[area]);
    for (const resident of residents) {
        const a = resident.art;
        if (resident.object.id === 'gardener')
            drawPerson(a, 0, false, true);
        if (resident.object.id === 'arch') {
            a.clear().fillStyle(0xadb599).fillRoundedRect(-54, -139, 24, 139, 7).fillRoundedRect(30, -139, 24, 139, 7);
            a.lineStyle(25, 0xbec5a4).beginPath().arc(0, -129, 42, Math.PI, 0).strokePath();
            for (let i = 0; i < 14; i++)
                a.fillStyle(i % 2 ? 0x557d61 : 0x799773).fillEllipse(-48 + i * 7, -139 - Math.sin(i / 14 * Math.PI) * 40, 23, 17);
        }
        if (resident.object.id === 'pump') {
            a.clear().fillStyle(0x576f60).fillEllipse(5, 4, 100, 30).fillStyle(0xb49d62).fillRect(-9, -73, 18, 73);
            a.fillStyle(0xcfbb83).fillRoundedRect(-16, -83, 31, 30, 7);
            a.lineStyle(6, 0x96794b).lineBetween(0, -75, -31, -99).lineBetween(8, -64, 43, -64).lineBetween(43, -64, 43, -38);
            // Only the current vessel is visible. Later questions remain concealed.
            a.lineStyle(2, 0xc5dfd2).strokeRoundedRect(22, -36, 42, 42, 7);
            if (completed)
                a.fillStyle(0x78b9aa, .7).fillRoundedRect(25, -12, 36, 16, 4);
        }
    }
    return residents;
}
export function refreshGarden(scene: Phaser.Scene, completed: number) {
    const water = scene.children.getByName('garden-water') as Phaser.GameObjects.Graphics | null;
    if (water) {
        water.clear();
        if (completed)
            water.fillStyle(0x78b4a7, .55).fillEllipse(0, -10, 140, 55).lineStyle(4, 0xa0d4bf, .8).lineBetween(0, -106, 0, -82).lineBetween(-27, -79, -42, -13).lineBetween(27, -79, 42, -13);
    }
    for (let i = 0; i < 16; i++)
        scene.children.getByName(`garden-bloom-${i}`)?.setActive(true);
    for (const item of scene.children.list)
        if (item.name.startsWith('garden-bloom-'))
            (item as Phaser.GameObjects.Graphics).setVisible(completed > Number(item.name.slice(13)) / 4);
}
