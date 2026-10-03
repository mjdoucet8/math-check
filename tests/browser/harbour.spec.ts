import { expect, test, type Page } from '@playwright/test';
import { project } from '../../src/world/harbour.ts';

async function select(page: Page, touch: boolean, x: number, y: number, height = 0) {
  await page.waitForTimeout(350);
  const view = JSON.parse((await page.locator('#game').getAttribute('data-view'))!);
  const world = project({ x, y });
  const point = { x: (world.x - view.left) * view.zoom, y: (world.y - height - view.top) * view.zoom };
  if (touch) await page.touchscreen.tap(point.x, point.y); else await page.mouse.click(point.x, point.y);
}
async function arrived(page: Page, cell: string) {
  await expect(page.locator('#game')).toHaveAttribute('data-cell', cell, { timeout: 12000 });
  await expect(page.locator('#game')).toHaveAttribute('data-moving', 'false');
}
test('real input routes around obstacles and approaches objects while retargeting movement', async ({ page }, info) => {
  const touch = info.project.name === 'touch';
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await arrived(page, '7,11');
  await page.screenshot({ path: info.outputPath('harbour.png') });
  // Route to the far side of a blocked cottage footprint.
  await select(page, touch, 11, 5); await arrived(page, '11,5');
  await select(page, touch, 14, 3); await arrived(page, '14,3');
  await select(page, touch, 12, 4);
  await expect(page.getByRole('status')).toContainText('out of reach'); await arrived(page, '14,3');
  await select(page, touch, 11, 8, 75);
  await expect(page.locator('#dialogue')).toBeVisible({ timeout: 12000 });
  await expect(page.locator('#speaker')).toHaveText('The harbour light');
  await expect(page.locator('#speech')).toContainText('crystal is dark');
  expect((await page.locator('#game').getAttribute('data-visited'))).toBe('beacon');
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await select(page, touch, 8, 8, 40);
  await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 12000 });
  await expect(page.locator('#dialogue')).toBeVisible();
  await expect(page.locator('#goal-text')).toHaveText('Restore the harbour light');
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await select(page, touch, 14, 12); await arrived(page, '14,12');
  // A new destination replaces the old route while preserving the current step.
  await select(page, touch, 12, 8);
  const oldDestination = await page.locator('#game').getAttribute('data-destination');
  // Aim inside the open path, away from nearby prop footprints as the camera follows.
  await select(page, touch, 7, 12);
  await expect(page.locator('#game')).not.toHaveAttribute('data-destination', oldDestination!);
  const newDestination = (await page.locator('#game').getAttribute('data-destination'))!;
  expect(newDestination).not.toBe(oldDestination);
  await arrived(page, newDestination);
  await select(page, touch, 0, 12); await expect(page.getByRole('status')).toContainText('out of reach');
  await arrived(page, newDestination);
  expect(errors).toEqual([]);
});
test('moving scene freezes completely and survives repeated reset, resize and reload', async ({page},info)=>{
  const touch=info.project.name==='touch';const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#game')).toHaveAttribute('data-ready','true');
  await select(page, touch, 14, 12);
  await expect(page.locator('#game')).toHaveAttribute('data-moving', 'true');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const frame = await page.locator('canvas').screenshot();
  await page.waitForTimeout(220); expect((await page.locator('canvas').screenshot()).equals(frame)).toBe(true);
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: 'Continue exploring' })).toBeFocused();
  await page.keyboard.press('Escape'); await arrived(page, '14,12');
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Start again' }).click(); await page.getByRole('button',{name:'Start a new journey',exact:true}).click(); await arrived(page, '7,11');
    await expect(page.locator('#dialogue')).toBeHidden(); await expect(page.locator('#game')).toHaveAttribute('data-visited', '');
    await select(page, touch, 7, 10); await arrived(page, '7,10');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.locator('canvas').evaluate(canvas => Math.round(canvas.getBoundingClientRect().width))).toBe(390);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await select(page, touch, 8, 11); await arrived(page, '8,11');
  await page.screenshot({ path: info.outputPath('harbour-mobile.png') });
  await page.reload(); await arrived(page, '8,11'); await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('reduced motion keeps navigation available and stops decorative animation', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await arrived(page, '7,11');
  await page.waitForTimeout(700);
  const still = await page.locator('canvas').screenshot(); await page.waitForTimeout(200);
  expect((await page.locator('canvas').screenshot()).equals(still)).toBe(true);
  await select(page, info.project.name === 'touch', 8, 11); await arrived(page, '8,11');
});
