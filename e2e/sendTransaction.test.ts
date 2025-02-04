import { test, loginToSenderAccount, expect, getCurrentAddress, switchToEvm } from './utils/helper';
export const sendTokenfromCOAtoCOA = async ({ page, tokenname, receiver }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  await page.getByRole('tab', { name: 'coins' }).click();
  // send Ft token from COA to COA
  await page.getByRole('button', { name: tokenname }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByPlaceholder('Search address(0x), or flow').click();
  await page.getByPlaceholder('Search address(0x), or flow').fill(receiver);
  await page.getByPlaceholder('Amount').fill('0.000112134354657');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page.waitForURL(/.*dashboard\?activity=1/);
  const progressBar = page.getByRole('progressbar');
  await expect(progressBar).toBeVisible();
  await expect(page.locator('li').first().filter({ hasText: 'Pending' })).toBeVisible({
    timeout: 60_000,
  });
  await expect(progressBar).not.toBeVisible({ timeout: 60_000 });

  await expect(page.locator('li').first().filter({ hasText: 'success' })).toBeVisible({
    timeout: 60_000,
  });
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderAccount({ page, extensionId });
  // switch to EVM account
  await switchToEvm({ page, extensionId });
});

test('send Flow COA to COA', async ({ page }) => {
  // Send FLOW token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});

test('send Staked Flow COA to COA', async ({ page }) => {
  // Send stFLOW token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'Liquid Staked Flow $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});

test('send USDC token from COA to COA', async ({ page }) => {
  // Send USDC token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'Bridged USDC (Celer) $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});

test('send BETA token from COA to COA', async ({ page }) => {
  // Send BETA token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'BETA $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});

test('send TRUMP token from COA to COA', async ({ page }) => {
  // Send TRUMP token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'OFFICIAL TRUMP $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});
