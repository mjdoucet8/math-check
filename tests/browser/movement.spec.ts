import { expect, test } from '@playwright/test';
import { project } from '../../src/world/harbour.ts';

test.use({ video: 'on' });
test('walking stops at its destination and preserves position after reload', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(500);
  const host = page.locator('#game');
  const view = JSON.parse((await host.getAttribute('data-view'))!);
  const initial = JSON.parse((await host.getAttribute('data-position'))!);
  const target = project({ x: 14, y: 12 });
  const point = { x: (target.x - view.left) * view.zoom, y: (target.y - view.top) * view.zoom };
  if (info.project.name === 'touch') await page.touchscreen.tap(point.x, point.y); else await page.mouse.click(point.x, point.y);
  await expect(host).toHaveAttribute('data-moving', 'true');
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) {
    await page.waitForTimeout(120);
    positions.push(JSON.parse((await host.getAttribute('data-position'))!));
    if (i === 0 || i === 3) {
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      await page.locator('canvas').screenshot({ path: info.outputPath(`walk-pose-${i}.png`), style: '#pause-panel { visibility: hidden !important; }' });
      await page.getByRole('button', { name: 'Continue exploring', exact: true }).click();
    }
  }
  expect(Math.hypot(positions.at(-1)!.x - initial.x, positions.at(-1)!.y - initial.y)).toBeGreaterThan(30);
  await expect(host).toHaveAttribute('data-cell', '14,12', { timeout: 15000 });
  await expect(host).toHaveAttribute('data-moving', 'false');
  const stopped = await host.getAttribute('data-position');
  await page.waitForTimeout(250); expect(await host.getAttribute('data-position')).toBe(stopped);
  await page.reload(); await expect(host).toHaveAttribute('data-cell', '14,12');
  expect(errors).toEqual([]);
});
