import { getClipboardText, test, expect, getAuth } from './utils/helper';

test('Login test', async ({ page, extensionId }) => {
  const keysFile = await getAuth();

  const { password, addr } = keysFile;

  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/unlock`);

  await page.waitForSelector('.logoContainer', { state: 'visible' });

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
});
