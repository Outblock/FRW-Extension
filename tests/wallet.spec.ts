import path from 'path';

import { test, expect, chromium } from '@playwright/test';

test.describe('Extension Tests', () => {
  test('extension is loaded', async () => {
    // Get path to extension
    const pathToExtension = path.join(__dirname, '../dist');

    // Launch browser with extension
    const context = await chromium.launchPersistentContext('/tmp/test-user-data-dir', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');

    // Get extension ID from service worker URL
    const extensionId = background.url().split('/')[2];

    // Create a new page and navigate to extension
    const page = await context.newPage();

    // Navigate and wait for network to be idle
    await page.goto(`chrome-extension://${extensionId}/index.html#/welcome`);

    // Wait for the welcome page to be fully loaded
    await page.waitForSelector('.welcomeBox', { state: 'visible' });

    // Check for welcome page elements
    await expect(page.getByText('Welcome to Flow Wallet')).toBeVisible();
    await expect(page.getByText('Create a new wallet')).toBeVisible();
    await expect(page.getByText('Sync with Mobile App')).toBeVisible();

    // Cleanup
    await context.close();
  });
});
