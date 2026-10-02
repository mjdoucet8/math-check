import { expect, test, type Page, type Locator } from '@playwright/test';
import { project } from '../../src/world/harbour.ts';
async function press(button: Locator, touch: boolean) { if (touch) await button.tap(); else await button.click(); }
async function select(page: Page, touch: boolean, x: number, y: number, height: number) {
  await page.waitForTimeout(500);
  const view = JSON.parse((await page.locator('#game').getAttribute('data-view'))!);
  const world = project({ x, y });
  const point = { x: (world.x - view.left) * view.zoom, y: (world.y - height - view.top) * view.zoom };
  if (touch) await page.touchscreen.tap(point.x, point.y); else await page.mouse.click(point.x, point.y);
}
async function open(page: Page, touch: boolean) {
  await page.goto('/'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await select(page, touch, 8, 8, 40); await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 12000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 11, 8, 75);
  await expect(page.getByRole('heading', { name: 'Put five stones into the tray.' })).toBeVisible({ timeout: 12000 });
}
async function evidence(page: Page) { return JSON.parse((await page.locator('#challenge-panel').getAttribute('data-evidence'))!); }
const shore = (page: Page) => page.getByRole('button', { name: 'Move stone into tray', exact: true });
const tray = (page: Page) => page.getByRole('button', { name: 'Return stone to shore', exact: true });

test('first independent response restores the beacon; close/reopen preserves edits and reset clears it', async ({ page }, info) => {
  const touch = info.project.name === 'touch'; const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await open(page, touch);
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'false');
  const position = await page.locator('#game').getAttribute('data-position');
  await press(shore(page).first(), touch);
  await press(page.getByRole('button', { name: 'Back to harbour' }), touch);
  await select(page, touch, 11, 8, 75); await expect(tray(page)).toHaveCount(1);
  for (let i = 0; i < 4; i++) await press(shore(page).first(), touch);
  await press(tray(page).first(), touch); await expect(tray(page)).toHaveCount(4);
  await press(shore(page).first(), touch); await expect(tray(page)).toHaveCount(5);
  expect((await evidence(page)).attempts).toHaveLength(0);
  expect(await page.locator('#game').getAttribute('data-position')).toBe(position);
  await page.screenshot({ path: info.outputPath('stones.png') });
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await expect(page.getByRole('heading', { name: 'The harbour light is awake.' })).toBeVisible();
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'true');
  expect((await evidence(page)).outcome.kind).toBe('independent-first-response');
  await press(page.getByRole('button', { name: 'Continue exploring' }), touch);
  await expect(page.locator('#goal-text')).toHaveText('Follow the coastal path');
  await press(page.getByRole('button', { name: 'Start again' }), touch);
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'false');
  await expect(page.locator('#challenge-panel')).toBeHidden(); expect(errors).toEqual([]);
});
test('incorrect arrangements persist, optional practice counts separate stones and guided success restores the same light', async ({ page }, info) => {
  const touch = info.project.name === 'touch'; await open(page, touch);
  await press(shore(page).first(), touch); await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await expect(tray(page)).toHaveCount(1); expect((await evidence(page)).attempts).toHaveLength(1);
  await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Show me with practice stones' })).toHaveCount(0);
  await press(shore(page).first(), touch); await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await press(page.getByRole('button', { name: 'Show me with practice stones' }), touch);
  await expect(page.locator('.practice-stones .stone')).toHaveCount(3);
  for (const word of ['One','Two','Three']) {
    await press(page.getByRole('button', { name: 'Count the next stone' }), touch);
    await expect(page.locator('.count-word')).toHaveText(word);
  }
  await press(page.getByRole('button', { name: 'Try your stones' }), touch);
  await expect(tray(page)).toHaveCount(2); expect((await evidence(page)).attempts).toHaveLength(2);
  await press(shore(page).first(), touch); await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await press(page.getByRole('button', { name: 'Count together' }), touch);
  for (let i = 0; i < 5; i++) await press(page.getByRole('button', { name: 'Place a stone' }), touch);
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  expect((await evidence(page)).outcome.kind).toBe('guided');
  await expect(page.locator('#game')).toHaveAttribute('data-beacon-awake', 'true');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: info.outputPath('restored-mobile.png') });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
