import {
  test,
  loginToExtension,
  importSenderAccount,
  importReceiverAccount,
  loginToExtensionAccount,
  loginToSenderAccount,
  lockExtension,
} from './utils/helper';

test.beforeAll(async ({ page, extensionId }) => {
  await importSenderAccount({ page, extensionId });
  await lockExtension({ page });
  await importReceiverAccount({ page, extensionId });
  await lockExtension({ page });
});

test('send other-FT COA to COA', async ({ page, extensionId }) => {
  await loginToSenderAccount({ page, extensionId });
  await page.pause();
  // Take it from here!
});
