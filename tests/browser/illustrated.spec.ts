import { expect, test } from '@playwright/test';
import { select, press } from './gameHelpers.ts';

test('illustrated assets load and the harbour restoration remains playable at desktop and phone sizes', async ({ page }, info) => {
  const errors: string[] = [], assets = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().includes('/art/') && response.status() === 200) assets.add(response.url().split('/').at(-1)!); });
  const touch = info.project.name === 'touch';
  await page.goto('./'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'illustrated');
  expect(assets.size).toBe(6);
  await page.screenshot({ path: info.outputPath('illustrated-harbour.png') });
  await select(page, touch, 'keeper'); await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 'beacon'); await expect(page.locator('#challenge-panel')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.shore-stone-art')).toHaveCount(8);
  for (let i = 0; i < 5; i++) await press(page.getByRole('button', { name: 'Move stone into tray', exact: true }).first(), touch);
  await page.screenshot({ path: info.outputPath('illustrated-stones.png') });
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  const evidence = JSON.parse((await page.locator('#challenge-panel').getAttribute('data-evidence'))!);
  expect(evidence.outcome.kind).toBe('independent-first-response');
  await press(page.getByRole('button', { name: 'Continue exploring' }), touch);
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'true');
  await page.screenshot({ path: info.outputPath('illustrated-restored-harbour.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('illustrated-harbour-mobile.png') });
  await page.reload(); await expect(page.locator('#game')).toHaveAttribute('data-art', 'illustrated', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'true');
  expect(errors).toEqual([]);
});

test('an unavailable scenery file retains a playable geometric fallback with a clear notice', async ({ page }, info) => {
  await page.route('**/art/harbour-quay-v1.webp', route => route.abort());
  await page.goto('./'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'geometric-fallback');
  await expect(page.getByRole('status')).toContainText('Some artwork could not load');
  await select(page, info.project.name === 'touch', 'keeper');
  await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
});
