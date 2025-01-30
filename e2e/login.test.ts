import { test, loginAsTestUser } from './utils/helper';

test('Login test', async ({ page, extensionId }) => {
  await loginAsTestUser({ page, extensionId });
});
