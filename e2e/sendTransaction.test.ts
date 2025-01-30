import { test, loginToSenderAccount } from './utils/helper';

test('send other-FT COA to COA', async ({ page, extensionId }) => {
  await loginToSenderAccount({ page, extensionId });
  await page.pause();
  // Take it from here!
});
