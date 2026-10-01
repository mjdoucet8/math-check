import { expect, test } from '@playwright/test';

test('production preview boots the game, survives resize, and pauses/resumes', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.getByRole('heading', { name: 'An island waiting to awaken.' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('foundation.png'), fullPage: true });
  const pause = page.getByRole('button', { name: 'Pause atmosphere' });
  if (testInfo.project.name === 'touch') await pause.tap();
  else await pause.click();
  await expect(page.getByRole('button', { name: 'Resume atmosphere' })).toHaveAttribute('aria-pressed', 'true');
  const stillFrame = await page.locator('canvas').screenshot();
  await page.waitForTimeout(200);
  expect(await page.locator('canvas').screenshot()).toEqual(stillFrame);
  await page.getByRole('button', { name: 'Resume atmosphere' }).click();
  await expect(page.getByRole('button', { name: 'Pause atmosphere' })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await page.locator('canvas').screenshot()).equals(stillFrame)).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => page.locator('canvas').evaluate((canvas) => Math.round(canvas.getBoundingClientRect().width))).toBe(356);
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('reduced motion starts paused and controls are keyboard accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const resume = page.getByRole('button', { name: 'Resume atmosphere' });
  await expect(resume).toBeEnabled();
  await expect(resume).toHaveAttribute('aria-pressed', 'true');
  await resume.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Pause atmosphere' })).toHaveAttribute('aria-pressed', 'false');
});
