import { test, loginToExtension } from './utils/helper';

test('Login test', async ({ page, extensionId }) => {
  await loginToExtension({ page, extensionId });
});
