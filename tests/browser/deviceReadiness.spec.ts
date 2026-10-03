import { test, expect } from '@playwright/test';
import { freshSession, encodeSession, SAVE_KEY } from '../../src/domain/browserSave.ts';
import { press, select } from './gameHelpers.ts';

test('slow artwork shows loading progress and fetches only the harbour chapter', async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const files = new Map<string, number>();
  page.on('response', response => {
    if (response.url().includes('/art/')) files.set(response.url().split('/').at(-1)!, Number(response.headers()['content-length']));
  });
  await page.route('**/art/harbour-quay-v1.webp', async route => { await gate; await route.continue(); });
  try {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#loading-panel')).toBeVisible();
    await expect(page.locator('#loading-title')).toHaveText('Opening the harbour…');
    await expect.poll(() => page.locator('#art-progress').evaluate((node: HTMLProgressElement) => node.value)).toBeGreaterThan(0);
    await expect(page.locator('#pause')).toBeDisabled();
    await expect(page.locator('#reset')).toBeDisabled();
    await page.screenshot({ path: info.outputPath('island-loading.png') });
  } finally { release(); }
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await expect(page.locator('#loading-panel')).toBeHidden();
  expect(files.size).toBe(6);
  expect([...files.keys()].every(file => file.endsWith('.webp'))).toBe(true);
  expect([...files.values()].reduce((sum, bytes) => sum + bytes, 0)).toBeLessThan(9_000_000);
  expect([...files.keys()].some(file => /garden|coastal/.test(file))).toBe(false);
});

test('a saved garden loads only its art and reset loads the harbour without losing input', async ({ page }, info) => {
  const session = freshSession();
  for (let i = 0; i < 5; i++) session.stones.toggle(i);
  session.stones.confirm(); session.journey.beaconAwake = true;
  session.journey.travel('coastal-path'); session.journey.travel('garden');
  const seed = encodeSession(session), requested: string[] = [];
  await page.addInitScript(({ key, text }) => localStorage.setItem(key, text), { key: SAVE_KEY, text: seed });
  page.on('request', request => { if (request.url().includes('/art/')) requested.push(request.url().split('/').at(-1)!); });
  await page.goto('./');
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-area', 'garden');
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'illustrated');
  expect(requested).toHaveLength(5);
  expect(requested.some(file => /harbour-quay|cottage|beacon|coastal/.test(file))).toBe(false);
  const touch = info.project.name === 'touch';
  await press(page.locator('#reset'), touch);
  await press(page.getByRole('button', { name: 'Start a new journey', exact: true }), touch);
  await expect(page.locator('#game')).toHaveAttribute('data-area', 'harbour', { timeout: 20000 });
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-art', 'illustrated');
  expect(requested.filter(file => file === 'explorer-frames-v1.webp')).toHaveLength(1);
  expect(requested.filter(file => file === 'harbour-props-v1.webp')).toHaveLength(1);
  await select(page, touch, 'keeper');
  await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
});
