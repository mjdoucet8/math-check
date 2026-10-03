import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 180000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  // Exercise the distributable bundle under a folder, including CSS/Phaser asset URLs.
  use: { baseURL: 'http://127.0.0.1:4173/numora/', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'touch', use: { ...devices['iPad Mini'], defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: 'node scripts/serve-playtest.mjs --prefix /numora/', url: 'http://127.0.0.1:4173/numora/', reuseExistingServer: false },
});
