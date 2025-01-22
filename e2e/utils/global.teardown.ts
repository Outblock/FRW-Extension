// Just import from playwright as we don't want to load the extension from the temp directory
import { test as teardown } from '@playwright/test';

import { cleanAuth, cleanExtension } from './helper';

teardown('cleanup extension storage', async () => {
  //   Create a new page and navigate to extension
  await cleanAuth();
  await cleanExtension();
});
