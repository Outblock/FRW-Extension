import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { test, chromium, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFilePath = path.join(__dirname, '../playwright/.auth/user.json');
const keysFilePath = path.join(__dirname, '../playwright/.auth/keys.json');

const getNumber = (str: string) => {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

const getClipboardText = async () => {
  const text = await navigator.clipboard.readText();
  return text;
};

test('Register test', async () => {
  // Get path to extension
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
  await page.goto(`chrome-extension://${extensionId}/index.html#/welcome`);

  // Wait for the welcome page to be fully loaded
  await page.waitForSelector('.welcomeBox', { state: 'visible' });

  // Click on register button
  await page.getByRole('link', { name: 'Create a new wallet' }).click();

  // Wait for the register page to be fully loaded
  await page.getByText('Your username will be used to').isVisible();

  // Fill in the form
  await page.getByPlaceholder('Username').fill('testuser');

  // Click on register button
  await page.getByRole('button', { name: 'Next' }).click();

  await page
    .locator('div')
    .filter({ hasText: /^Click here to reveal phrase$/ })
    .getByRole('button')
    .click();

  await page.getByRole('button', { name: 'Copy' }).click();

  // got keys from clipboard
  const clipboardText = await page.evaluate(getClipboardText);

  const keyArr = clipboardText.split(' ');

  // keys length should be 12
  expect(keyArr.length).toBe(12);

  // next step
  await page.getByRole('button', { name: 'Okay, I have saved it properly' }).click();

  // get puzzles
  const firstIdx = await page.locator('div').getByText('#').first().textContent();
  const secondIdx = await page.locator('div').getByText('#').nth(1).textContent();
  const thirdIdx = await page.locator('div').getByText('#').nth(2).textContent();

  const firstMnemonic = keyArr[getNumber(firstIdx!)! - 1];
  const secondMnemonic = keyArr[getNumber(secondIdx!)! - 1];
  const thirdMnemonic = keyArr[getNumber(thirdIdx!)! - 1];

  // console.log(firstMnemonic, secondMnemonic, thirdMnemonic);
  // click the right mnemonic word

  // resolve mnemonics puzzles
  await page.getByLabel('row0').getByRole('button', { name: firstMnemonic }).click();
  await page.getByLabel('row1').getByRole('button', { name: secondMnemonic }).click();
  await page.getByLabel('row2').getByRole('button', { name: thirdMnemonic }).click();

  await page
    .locator('div')
    .filter({ hasText: /^Next$/ })
    .click();

  // init pwd
  const password = 'TestPassword';

  // fill
  await page.getByPlaceholder('Create a password').fill(password);
  await page.getByPlaceholder('Confirm your password').fill(password);

  await page.getByLabel("I agree to Flow Wallet's").click();

  const registerBtn = await page.getByRole('button', { name: 'Register' });
  await registerBtn.click();

  // register finished
  await registerBtn.isEnabled();

  // save context to auth file
  await page.context().storageState({ path: authFilePath });

  // Unlock wallet
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

  // save keys and pwd to keys file
  await fs.writeFileSync(
    keysFilePath,
    JSON.stringify({
      privateKey: clipboardText,
      password: password,
      addr: flowAddr,
    })
  );

  // Cleanup;
  await context.close();
});
