import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { test as base, chromium, type Page, type BrowserContext } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysFilePath = path.join(__dirname, '../../playwright/.auth/keys.json');

export const getClipboardText = async () => {
  const text = await navigator.clipboard.readText();
  return text;
};

// save keys auth file
export const saveAuth = async (auth) => {
  if (auth) {
    // Ensure directory exists
    const dirPath = path.dirname(keysFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(keysFilePath, JSON.stringify(auth));
  } else {
    if (fs.existsSync(keysFilePath)) {
      fs.unlinkSync(keysFilePath);
    }
  }
};

// get keys auth file
export const getAuth = async () => {
  const keysFileContent = fs.existsSync(keysFilePath)
    ? fs.readFileSync(keysFilePath, 'utf8')
    : null;
  const keysFile = keysFileContent ? JSON.parse(keysFileContent) : null;
  return keysFile || { password: '', addr: '' };
};

// delete keys file
export const cleanAuth = async () => {
  await saveAuth(null);
};

export const closeOpenedPages = async (page: Page) => {
  const allPages = page.context().pages();
  if (allPages.length > 1) {
    for (const p of allPages) {
      if (p !== page) {
        await p.close();
      }
    }
  }
};

export const getCurrentAddress = async (page: Page) => {
  await expect(page.getByLabel('Copy Address')).toBeVisible({ timeout: 120_000 });
  const copyIcon = await page.getByLabel('Copy Address');
  await copyIcon.isVisible();

  await copyIcon.click();

  const flowAddr = await page.evaluate(getClipboardText);
  return flowAddr;
};

export const loginToExtension = async ({ page, extensionId }) => {
  const keysFile = await getAuth();

  if (keysFile.password === '') {
    return false;
  }

  const { password, addr } = keysFile;

  // close all pages except the current page
  await closeOpenedPages(page);

  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/unlock`);

  await page.waitForSelector('.logoContainer', { state: 'visible' });

  await page.getByPlaceholder('Enter your password').clear();
  await page.getByPlaceholder('Enter your password').fill(password);

  const unlockBtn = await page.getByRole('button', { name: 'Unlock Wallet' });

  await expect(unlockBtn).toBeEnabled({ enabled: true, timeout: 60_000 });

  // close all pages except the current page (the extension opens them in the background)
  await closeOpenedPages(page);
  await unlockBtn.click();

  // await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  // get address
  let flowAddr = await getCurrentAddress(page);

  if (flowAddr !== addr) {
    // switch to the correct account
    await page.getByLabel('menu').click();
    await page.getByRole('button', { name: 'close' }).click();
    await page.getByRole('button', { name: 'avatar testuser' }).click();

    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Unlock Wallet' }).click();

    // get address
    flowAddr = await getCurrentAddress(page);
  }

  expect(flowAddr).toBe(addr);
};

export const importAccountBySeedPhrase = async ({ page, extensionId, seedPhrase, username }) => {
  const password = process.env.TEST_PASSWORD;
  if (!password) {
    throw new Error('TEST_PASSWORD is not set');
  }

  // Don't login before this. The account should be locked

  // Go to import the sender account
  await page.goto(`chrome-extension://${extensionId}/index.html#/welcome/accountimport`);

  // Close all pages except the current page (the extension opens them in the background)
  await closeOpenedPages(page);

  await page.getByRole('tab', { name: 'Seed Phrase' }).click();
  await page.getByPlaceholder('Import 12 or 24 words split').click();

  await page.getByPlaceholder('Import 12 or 24 words split').fill(seedPhrase);

  await page.getByRole('button', { name: 'Import' }).click();

  await page.pause();

  // Create user name if need be...

  // await page.getByPlaceholder('Username').fill(username);

  // await page.getByPlaceholder('Create a password').fill(password);
  // await page.getByPlaceholder('Confirm your password').fill(password);

  // await page.getByRole('button', { name: 'Login' }).click();

  // Option 3 - Welcome back
  const step = await page.getByText('STEP').textContent();
  await page.pause();

  if (step === 'STEP 4/6') {
    // await page.getByRole('button', { name: 'Login' }).click();
  }

  //getByRole('heading', { name: 'Welcome Back' })
  //locator('div').filter({ hasText: /^STEP 4\/6$/ })
  //getByText('STEP 4/')

  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  // get address
  const flowAddr = await getCurrentAddress(page);

  return flowAddr;
};

export const importSenderAccount = async ({ page, extensionId }) => {
  await importAccountBySeedPhrase({
    page,
    extensionId,
    seedPhrase: process.env.TEST_SEED_PHRASE_SENDER,
    username: 'sender',
  });
};

export const importReceiverAccount = async ({ page, extensionId }) => {
  await importAccountBySeedPhrase({
    page,
    extensionId,
    seedPhrase: process.env.TEST_SEED_PHRASE_RECEIVER,
    username: 'receiver',
  });
};

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, call) => {
    const pathToExtension = path.join(__dirname, '../../dist');
    const context = await chromium.launchPersistentContext('/tmp/test-user-data-dir', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--allow-read-clipboard',
        '--allow-write-clipboard',
      ],
      env: {
        ...process.env,
        TEST_MODE: 'true',
      },
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    await call(context);
    await context.close();
  },
  extensionId: async ({ context }, call) => {
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];
    await call(extensionId);
  },
});

export const cleanExtension = async () => {
  const userDataDir = '/tmp/test-user-data-dir';
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
};

export const expect = test.expect;
