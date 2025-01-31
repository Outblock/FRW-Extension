import { test, loginToSenderAccount, expect, getCurrentAddress } from './utils/helper';
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

test('send other-FT COA to COA', async ({ page, extensionId }) => {
  // This can take a while
  test.setTimeout(300_000);
  await loginToSenderAccount({ page, extensionId });
  await page.getByLabel('menu').click();
  // switch to COA account
  await page.getByRole('button', { name: 'EVM' }).nth(0).click();
  // Send FLOW token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
  // Send stFLOW token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'Liquid Staked Flow $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
  // Send USDC token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'Bridged USDC (Celer) $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
  // Send BETA token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'BETA $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
  // Send TRUMP token from COA to COA
  await sendTokenfromCOAtoCOA({
    page,
    tokenname: 'OFFICIAL TRUMP $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
  });
});
