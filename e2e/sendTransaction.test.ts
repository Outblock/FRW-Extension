import { test, loginToSenderAccount, expect, getCurrentAddress } from './utils/helper';

test('send other-FT COA to COA', async ({ page, extensionId }) => {
  // This can take a while
  test.setTimeout(60_000);
  await loginToSenderAccount({ page, extensionId });
  // await page.goto('chrome-extension://cfiagdgiikmjgfjnlballglniejjgegi/index.html#/dashboard');
  await page.getByLabel('menu').click();
  // switch to COA account
  await page.getByRole('button', { name: 'EVM' }).nth(0).click();
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  // send FLOW token from COA to COA
  await page.getByRole('button', { name: /^FLOW \$/i }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByPlaceholder('Search address(0x), or flow').click();
  await page
    .getByPlaceholder('Search address(0x), or flow')
    .fill('0x000000000000000000000002e57b7afa1aec842b');
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
  /*
  // send  stFlow token from COA to COA
  await page.getByRole('tab', { name: 'coins' }).click();
  await page.getByRole('button', { name: 'Liquid Staked Flow $' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page
    .getByPlaceholder('Search address(0x), or flow')
    .fill('0x000000000000000000000002e57b7afa1aec842b');
  await page.getByPlaceholder('Amount').fill('0.0012345465789095425253');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  // send  USDC token from COA to COA
  await page.getByRole('tab', { name: 'coins' }).click();
  await page.getByRole('button', { name: 'Bridged USDC (Celer) $' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page
    .getByPlaceholder('Search address(0x), or flow')
    .fill('0x000000000000000000000002e57b7afa1aec842b');
  await page.getByPlaceholder('Amount').fill('0.00000123586736289103485566');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  // send  BETA token from COA to COA
  await page.getByRole('tab', { name: 'coins' }).click();
  await page.getByRole('button', { name: 'BETA $' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page
    .getByPlaceholder('Search address(0x), or flow')
    .fill('0x000000000000000000000002e57b7afa1aec842b');
  await page.getByPlaceholder('Amount').fill('1.1111111111111111');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  // send  TRUMP token from COA to COA
  await page.getByRole('tab', { name: 'coins' }).click();
  await page.getByRole('button', { name: 'OFFICIAL TRUMP $' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page
    .getByPlaceholder('Search address(0x), or flow')
    .fill('0x000000000000000000000002e57b7afa1aec842b');
  await page.getByPlaceholder('Amount').fill('0.0000011212343254366');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await page.pause();
  await expect(page.getByRole('progressbar')).toBeVisible();
  await expect(page.getByRole('progressbar')).not.toBeVisible();
  await expect(
    page.locator('li').filter({ hasText: 'Execute Contract' }).nth(0).getByRole('paragraph').nth(4)
  ).toHaveText('success');
*/
  // await page.pause();
});
