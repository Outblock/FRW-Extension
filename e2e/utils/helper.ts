import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { test as base, chromium, type BrowserContext } from '@playwright/test';

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
    await fs.writeFileSync(keysFilePath, JSON.stringify(auth));
  } else {
    if (fs.existsSync(keysFilePath)) {
      await fs.unlinkSync(keysFilePath);
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

export const loginToExtension = async ({ page, extensionId }) => {
  const keysFile = await getAuth();

  if (keysFile.password === '') {
    return false;
  }

  const { password, addr } = keysFile;

  // Navigate and wait for network to be idle
  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/unlock`);

  await page.waitForSelector('.logoContainer', { state: 'visible' });

  await page.getByPlaceholder('Enter your password').clear();
  await page.getByPlaceholder('Enter your password').fill(password);

  const unlockBtn = await page.getByRole('button', { name: 'Unlock Wallet' });
  await unlockBtn.click();
  // await unlockBtn.isEnabled();

  // await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  // get address
  await expect(page.getByLabel('Copy Address')).toBeVisible({ timeout: 120_000 });
  const copyIcon = await page.getByLabel('Copy Address');
  await copyIcon.isVisible();

  await copyIcon.click();

  const flowAddr = await page.evaluate(getClipboardText);

  expect(flowAddr).toBe(addr);
  return true;
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
