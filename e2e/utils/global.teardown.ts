import { cleanAuth, cleanExtension, test as teardown } from './helper';

teardown('cleanup extension storage', async ({ page, extensionId }) => {
  //   Create a new page and navigate to extension
  await cleanAuth();
  await cleanExtension();
});
