import { test, expect } from '@playwright/test';
import { freshSession, encodeSession, SAVE_KEY } from '../../src/domain/browserSave.ts';
import { select } from './gameHelpers.ts';

test('refresh during a delayed chapter download resumes the chosen destination', async ({ page }, info) => {
  const session = freshSession();
  for (let i = 0; i < 5; i++) session.stones.toggle(i);
  session.stones.confirm(); session.journey.beaconAwake = true;
  session.journey.positions.set('harbour', { x: 14, y: 10 });
  await page.addInitScript(({ key, text }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, text);
  }, { key: SAVE_KEY, text: encodeSession(session) });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requests = 0, refreshing = false;
  const delayed = async (route: import('@playwright/test').Route) => {
    if (++requests === 1) {
      await gate;
      if (refreshing) return; // The old request was cancelled by the deliberate refresh.
    }
    await route.continue();
  };
  await page.route('**/art/coastal-path-v1.webp', delayed);
  await page.goto('./'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await select(page, info.project.name === 'touch', 'coast');
  try {
    await expect(page.locator('#loading-title')).toHaveText('Opening the coastal path…', { timeout: 20000 });
    await expect(page.locator('#loading-panel')).toBeVisible();
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
    expect(saved.journey.area).toBe('coastal-path');
    expect(saved.journey.beaconAwake).toBe(true);
    refreshing = true;
    await page.reload();
    await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true', { timeout: 20000 });
    await expect(page.locator('#game')).toHaveAttribute('data-area', 'coastal-path');
    await expect(page.locator('#game')).toHaveAttribute('data-art', 'illustrated');
    await expect(page.locator('#loading-panel')).toBeHidden();
  } finally { release(); }
});
