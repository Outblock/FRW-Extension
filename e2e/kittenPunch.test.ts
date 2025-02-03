import { test, loginToSenderAccount, getCurrentAddress } from './utils/helper';

test('connect with kitten punch', async ({ page, extensionId }) => {
  //   await loginAsTestUser({ page, extensionId });
  await loginToSenderAccount({ page, extensionId });
  await getCurrentAddress(page);
  //   const page1 = await context.newPage();
  await page.goto('chrome://new-tab-page/');
  await page.goto('https://swap.kittypunch.xyz/');
  await page.getByRole('button', { name: 'Connect Wallet' }).click();
  await page.getByTestId('rk-wallet-option-com.flowfoundation.wallet').click();

  //   await page.goto('chrome-extension://cfiagdgiikmjgfjnlballglniejjgegi/notification.html');
  //   await page2.goto(
  //     'chrome-extension://cfiagdgiikmjgfjnlballglniejjgegi/notification.html#/approval'
  //   );
  //   await page.getByRole('button', { name: 'Connect' }).click();
  //   await page.close();
  const flowIcon = page.locator('button', { name: 'FlowEVM Mainnet' });
  //   await expect(flowIcon).toBeVisible();
  await expect(page.getByRole('button', { name: 'FlowEVM Mainnet' }));
  await page.pause();
});
