import { expect, test, type Page } from '@playwright/test';
import { select, press } from './gameHelpers.ts';

declare global {
  interface Window { numoraAudioProbe: { spoken: string[]; canceled: number; tones: number }; }
}
async function openStones(page: Page, touch: boolean) {
  await page.goto('/'); await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await select(page, touch, 'keeper');
  await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 'beacon');
  await expect(page.locator('#challenge-panel')).toBeVisible({ timeout: 20000 });
}
const stones = (page: Page) => page.getByRole('button', { name: 'Move stone into tray', exact: true });
const evidence = async (page: Page) => JSON.parse((await page.locator('#challenge-panel').getAttribute('data-evidence'))!);

// Browser API instrumentation checks requests; it does not establish audible quality.
async function instrumentAudio(page: Page, failure = false) {
  await page.addInitScript(({ failure }) => {
    window.numoraAudioProbe = { spoken: [], canceled: 0, tones: 0 };
    class Utterance {
      lang = ''; rate = 1;
      onerror: ((event: { error: string }) => void) | null = null;
      constructor(public text: string) {}
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      cancel() { window.numoraAudioProbe.canceled++; },
      speak(utterance: Utterance) {
        window.numoraAudioProbe.spoken.push(utterance.text);
        if (failure) utterance.onerror?.({ error: 'synthesis-failed' });
      },
    } });
    const Context = window.AudioContext;
    class ObservedAudioContext extends Context {
      createOscillator() { window.numoraAudioProbe.tones++; return super.createOscillator(); }
    }
    Object.defineProperty(window, 'AudioContext', { value: ObservedAudioContext, configurable: true });
  }, { failure });
}

test('optional narration and mute preserve answers; only confirmed restoration requests a chime', async ({ page }, info) => {
  const touch = info.project.name === 'touch'; await instrumentAudio(page); await openStones(page, touch);
  await press(stones(page).first(), touch);
  await press(page.getByRole('button', { name: 'Listen to instructions' }), touch);
  expect(await page.evaluate(() => window.numoraAudioProbe.spoken)).toEqual(['Put five stones into the tray. Tap a stone to move it. Choose Confirm when you are ready.']);
  expect((await evidence(page)).attempts).toHaveLength(0);
  const sound = page.locator('#challenge-content').getByRole('button', { name: 'Sound on', exact: true });
  await press(sound, touch);
  await expect(page.getByRole('button', { name: 'Listen to instructions' })).toBeDisabled();
  await expect(page.locator('#challenge-content [data-audio-hint]')).toContainText('Sound is off');
  for (let i = 0; i < 4; i++) await press(stones(page).first(), touch);
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  expect((await evidence(page)).outcome.kind).toBe('independent-first-response');
  expect(await page.evaluate(() => window.numoraAudioProbe.tones)).toBe(0);
  await press(page.getByRole('button', { name: 'Continue exploring' }), touch);
  await expect(page.locator('#sound')).toHaveText('Sound off');
  await press(page.getByRole('button', { name: 'Start again' }), touch);
  await press(page.getByRole('button', { name: 'Start a new journey', exact: true }), touch);
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await press(page.locator('#sound'), touch);
  await select(page, touch, 'keeper'); await expect(page.locator('#speaker')).toHaveText('Harbour keeper', { timeout: 20000 });
  await press(page.getByRole('button', { name: 'Close conversation' }), touch);
  await select(page, touch, 'beacon'); await expect(page.locator('#challenge-panel')).toBeVisible({ timeout: 20000 });
  for (let i = 0; i < 5; i++) await press(stones(page).first(), touch);
  expect(await page.evaluate(() => window.numoraAudioProbe.tones)).toBe(0);
  await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
  await expect.poll(() => page.evaluate(() => window.numoraAudioProbe.tones)).toBe(3);
  await press(page.getByRole('button', { name: 'Continue exploring' }), touch);
  await press(page.getByRole('button', { name: 'Pause', exact: true }), touch);
  await expect(page.getByRole('heading', { name: 'The island can wait.' })).toBeVisible();
});

for (const fallback of ['unsupported', 'failed'] as const) {
  test(`narration ${fallback} leaves a clear written fallback and playable task`, async ({ page }, info) => {
    if (fallback === 'failed') await instrumentAudio(page, true);
    else await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
      Object.defineProperty(window, 'AudioContext', { value: undefined, configurable: true });
    });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    const touch = info.project.name === 'touch'; await openStones(page, touch);
    if (fallback === 'failed') await press(page.getByRole('button', { name: 'Listen to instructions' }), touch);
    await expect(page.locator('#challenge-content [data-audio-hint]')).toContainText('Narration is unavailable');
    await expect(page.getByRole('button', { name: 'Listen to instructions' })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Put five stones into the tray.' })).toBeVisible();
    for (let i = 0; i < 5; i++) await press(stones(page).first(), touch);
    await press(page.getByRole('button', { name: 'Confirm', exact: true }), touch);
    expect((await evidence(page)).outcome.kind).toBe('independent-first-response');
    expect(errors).toEqual([]);
  });
}

test('small landscape and narrow portrait retain controls; declining help and rapid confirmation stay independent', async ({ page }, info) => {
  const touch = info.project.name === 'touch'; await openStones(page, touch);
  await page.setViewportSize({ width: 667, height: 375 });
  const panel = page.locator('#challenge-content');
  const bounds = await panel.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0); expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(375);
  await press(stones(page).first(), touch);
  const confirm = page.getByRole('button', { name: 'Confirm', exact: true });
  await confirm.focus(); await page.keyboard.press('Enter');
  // The disabled Confirm is replaced; focus must remain inside the modal.
  await expect(page.getByRole('button', { name: 'Back to harbour' })).toBeFocused();
  await press(stones(page).first(), touch); await confirm.dblclick();
  expect((await evidence(page)).attempts).toHaveLength(2);
  await expect(page.getByRole('button', { name: 'Show me with practice stones' })).toBeVisible();
  for (let i = 0; i < 3; i++) await press(stones(page).first(), touch);
  await confirm.focus(); await page.keyboard.press('Enter');
  expect((await evidence(page)).attempts).toHaveLength(3);
  expect((await evidence(page)).outcome.kind).toBe('independent-retry');
  await expect(page.getByRole('button', { name: 'Back to harbour' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#challenge-content').getByRole('button', { name: 'Sound on', exact: true })).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#pause')).toBeFocused();
  await page.setViewportSize({ width: 320, height: 568 });
  for (const id of ['#sound', '#pause', '#reset']) {
    const box = await page.locator(id).boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    expect(Math.round(box!.height)).toBeGreaterThanOrEqual(44);
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('polished-narrow.png') });
  await press(page.locator('#reset'), touch); await page.screenshot({ path: info.outputPath('polished-reset.png') });
  await page.keyboard.press('Escape'); await expect(page.locator('#reset')).toBeFocused();
});
