import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { test, chromium, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysFilePath = path.join(__dirname, '../playwright/.auth/keys.json');

const getClipboardText = async () => {
  const text = await navigator.clipboard.readText();
  return text;
};

test('Login test', async () => {
  const keysFile = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));

  const { password, addr } = keysFile;

  const pathToExtension = path.join(__dirname, '../dist');

  // Launch browser with extension
  const context = await chromium.launchPersistentContext('/tmp/test-user-data-dir', {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--allow-read-clipboard',
      '--allow-write-clipboard',
    ],
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  // for manifest v3:
  let [background] = context.serviceWorkers();
  if (!background) background = await context.waitForEvent('serviceworker');

  // Get extension ID from service worker URL
  const extensionId = background.url().split('/')[2];

  // Create a new page and navigate to extension
  const page = await context.newPage();

  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/unlock`);

  await page.waitForSelector('.logoContainer', { state: 'visible' });

  await page.getByPlaceholder('Enter your password').fill(password);

  const unlockBtn = await page.getByRole('button', { name: 'Unlock Wallet' });
  await unlockBtn.click();

  await unlockBtn.isEnabled();

  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  // get address
  const copyIcon = await page.getByLabel('Copy Address');
  await copyIcon.isVisible();

  await copyIcon.click();

  const flowAddr = await page.evaluate(getClipboardText);

  expect(flowAddr).toBe(addr);

  // Cleanup;
  await context.close();
});
