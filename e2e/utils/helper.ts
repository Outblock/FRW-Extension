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
  await fs.writeFileSync(keysFilePath, auth ? JSON.stringify(auth) : '');
};

// get keys auth file
export const getAuth = async () => {
  const keysFile = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));
  return keysFile;
};

// delete keys file
export const cleanAuth = async () => {
  await saveAuth(null);
};

export const loadExtension = async () => {
  const pathToExtension = path.join(__dirname, '../../dist');
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
  let [background] = context.serviceWorkers();
  if (!background) background = await context.waitForEvent('serviceworker');
  const extensionId = background.url().split('/')[2];

  return { context, extensionId };
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
