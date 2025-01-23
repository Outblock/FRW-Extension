import { getClipboardText, test, expect, getAuth, loginToExtension } from './utils/helper';

test('Login test', async ({ page, extensionId }) => {
  await loginToExtension({ page, extensionId });
});

/*
// Uncomment and duplicate this test to create a new test for recording
// Turn off the cleanup in the IDE to maintain the user account to save registering again
test('new test', async ({ page, extensionId }) => {
  await loginToExtension({ page, extensionId });
  page.pause();
  //
});
 */
