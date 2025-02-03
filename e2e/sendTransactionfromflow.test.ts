import { test, loginToSenderAccount, expect, getCurrentAddress, switchToEvm } from './utils/helper';
export const sendToken = async ({ page, tokenname, receiver, successtext }) => {
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

  await expect(page.locator('li').first().filter({ hasText: successtext })).toBeVisible({
    timeout: 60_000,
  });
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderAccount({ page, extensionId });
  // switch to EVM account
  // await switchToEvm({ page, extensionId });
});
test('send FLOW token between flow', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'Sealed',
  });
});
test('send USDC token between flow', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'USDC.e (Flow) $',
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'Sealed',
  });
});
test('send stFlow token between flow', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'Liquid Staked Flow $',
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'Sealed',
  });
});
test('send BETA token between flow', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'BETA $',
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'Sealed',
  });
});
test('send FLOW token from flow to COA', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from flow to COA
  await sendToken({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'Sealed',
  });
});
test('send USDC token from flow to COA', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'USDC.e (Flow) $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'Sealed',
  });
});
test('send stflow token from flow to COA', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'Liquid Staked Flow $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'Sealed',
  });
});
test('send BETA token from flow to COA', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);

  // Send FLOW token from COA to COA
  await sendToken({
    page,
    tokenname: 'BETA $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'Sealed',
  });
});
