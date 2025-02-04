import { test, loginAsTestUser } from './utils/helper';

test('Login test', async ({ page, extensionId }) => {
  // Shouldn't take more than 15 seconds
  test.setTimeout(30_000);

  await loginAsTestUser({ page, extensionId });
});
