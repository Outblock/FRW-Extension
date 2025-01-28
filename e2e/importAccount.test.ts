import { test, loginToExtension, importSenderAccount } from './utils/helper';

// Uncomment and duplicate this test to create a new test for recording
// Turn off the cleanup in the IDE to maintain the user account to save registering again
test('import sender account', async ({ page, extensionId }) => {
  // Don't login before this. The account should be locked
  await importSenderAccount({ page, extensionId });
  //
});
