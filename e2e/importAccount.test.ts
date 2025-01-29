import { test, importSenderAccount, importReceiverAccount } from './utils/helper';

// Import our sender account
test('import sender account', async ({ page, extensionId }) => {
  // Don't login before this. The account should be locked
  await importSenderAccount({ page, extensionId });
  //
});

// Import our receiver account
test('import receiver account', async ({ page, extensionId }) => {
  // Don't login before this. The account should be locked
  await importReceiverAccount({ page, extensionId });
});
