import { expect, test, type Page } from '@playwright/test';
import { select, press, pump, complete } from './gameHelpers.ts';

async function reachCoast(page: Page, touch: boolean) {
  await page.goto('./'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await select(page, touch, 'keeper'); await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 'beacon'); await expect(page.locator('#challenge-panel')).toBeVisible({ timeout: 20000 });
  for (let i = 0; i < 5; i++) await press(page.getByRole('button', { name: 'Move stone into tray', exact: true }).first(), touch);
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await press(page.getByRole('button', { name: 'Continue exploring' }), touch);
  await select(page, touch, 'coast'); await expect(page.locator('#game')).toHaveAttribute('data-area', 'coastal-path', { timeout: 20000 });
}

test('illustrated coast and garden restore, reveal the reward and survive refresh', async ({ page }, info) => {
  test.setTimeout(240000);
  const touch = info.project.name === 'touch', host = page.locator('#game');
  const errors: string[] = [], loaded = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().includes('/art/') && response.ok()) loaded.add(response.url().split('/').at(-1)!); });
  await reachCoast(page, touch);
  expect(loaded.has('coastal-path-v1.webp')).toBe(true);
  expect(loaded.has('garden-props-v1.webp')).toBe(true);
  expect(loaded.has('garden-courtyard-v1.webp')).toBe(false);
  await expect(host).toHaveAttribute('data-art', 'illustrated');
  await page.screenshot({ path: info.outputPath('illustrated-coastal-path.png') });
  await select(page, touch, 'arch'); await expect(host).toHaveAttribute('data-area', 'garden', { timeout: 20000 });
  await expect(host).toHaveAttribute('data-art', 'illustrated');
  for (const file of ['garden-courtyard-v1.webp','garden-keeper-v1.webp']) expect(loaded.has(file)).toBe(true);
  await expect(host).toHaveAttribute('data-garden-restored', '0');
  await expect(host).toHaveAttribute('data-reward-unlocked', 'false');
  await page.screenshot({ path: info.outputPath('illustrated-sleeping-garden.png') });
  await select(page, touch, 'gardener'); await expect(page.locator('#speaker')).toHaveText('Garden keeper', { timeout: 20000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 'pump'); await expect(page.locator('#vessel-panel')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.garden-pump-art')).toBeVisible();
  await page.screenshot({ path: info.outputPath('illustrated-garden-activity.png') });
  for (const target of [3,5,4,6,5]) { await pump(page, touch, target); await complete(page, touch); }
  const evidence = JSON.parse((await page.locator('#vessel-panel').getAttribute('data-evidence'))!);
  expect(evidence.completed).toHaveLength(5);
  expect(evidence.completed.every((record: { outcome: { kind: string } }) => record.outcome.kind === 'independent-first-response')).toBe(true);
  await press(page.getByRole('button', { name: 'Explore the garden' }), touch);
  await expect(host).toHaveAttribute('data-garden-restored', '5');
  await expect(host).toHaveAttribute('data-reward-unlocked', 'true');
  await page.screenshot({ path: info.outputPath('illustrated-awake-garden.png') });
  await select(page, touch, 'satchel'); await expect(page.locator('#reward-panel')).toBeVisible({ timeout: 20000 });
  await page.getByRole('radio', { name: 'Ocean teal' }).check();
  await press(page.getByRole('button', { name: 'Equip satchel' }), touch);
  await expect(host).toHaveAttribute('data-satchel', 'ocean');
  await page.reload(); await expect(host).toHaveAttribute('data-art', 'illustrated', { timeout: 20000 });
  await expect(host).toHaveAttribute('data-garden-restored', '5');
  await expect(host).toHaveAttribute('data-satchel', 'ocean');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('illustrated-garden-phone.png') });
  expect(errors).toEqual([]);
});

test('missing coast, garden and prop images retain the full playable journey', async ({ page }, info) => {
  await page.route('**/art/coastal-path-v1.webp', route => route.abort());
  await page.route('**/art/garden-courtyard-v1.webp', route => route.abort());
  await page.route('**/art/garden-props-v1.webp', route => route.abort());
  const touch = info.project.name === 'touch';
  await reachCoast(page, touch);
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'geometric-fallback');
  await select(page, touch, 'arch'); await expect(page.locator('#game')).toHaveAttribute('data-area', 'garden', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'geometric-fallback');
  await select(page, touch, 'pump'); await expect(page.locator('#vessel-panel')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.garden-pump-art')).toHaveCount(0);
  await pump(page, touch, 3); await complete(page, touch);
  await expect(page.locator('#game')).toHaveAttribute('data-garden-restored', '1');
});
