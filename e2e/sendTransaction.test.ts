import {
  test,
  loginToSenderAccount,
  expect,
  getCurrentAddress,
  switchToEvm,
  waitForTransaction,
} from './utils/helper';
export const sendTokenCOA = async ({ page, tokenname, receiver, successtext }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  await page.getByRole('tab', { name: 'coins' }).click();
  // send Ft token from COA
  await page.getByRole('button', { name: tokenname }).click();
  await page.getByRole('button', { name: 'SEND' }).click();
  await page.getByPlaceholder('Search address(0x), or flow').click();
  await page.getByPlaceholder('Search address(0x), or flow').fill(receiver);
  await page.getByPlaceholder('Amount').fill('0.000112134354657');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  // Wait for the transaction to be completed
  await waitForTransaction({ page, successtext });
};

export const moveTokenCOA = async ({ page, tokenname, successtext }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  await page.getByRole('tab', { name: 'coins' }).click();
  await page.getByRole('button', { name: tokenname }).click();
  await page.getByRole('button', { name: 'Move' }).click();
  await page.getByPlaceholder('Amount').click();
  await page.getByPlaceholder('Amount').fill('0.000112134354657');
  await page.getByRole('button', { name: 'Move' }).click();
  // Wait for the transaction to be completed
  await waitForTransaction({ page, successtext });
};

export const moveTokenCoaHomepage = async ({ page, tokenname }) => {
  await getCurrentAddress(page);
  await page.getByRole('button', { name: 'Move' }).click();
  await page.getByRole('button', { name: 'Move Tokens' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: tokenname, exact: true }).getByRole('img').click();
  await page.getByPlaceholder('Amount').click();
  await page.getByPlaceholder('Amount').fill('0.000000012345');
  await page.getByRole('button', { name: 'Move' }).click();
  // Wait for the transaction to be completed
  await waitForTransaction({ page, successtext: 'success' });
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderAccount({ page, extensionId });
  // switch to EVM account
  await switchToEvm({ page, extensionId });
});
//Send Fts from COA to COA
test('send Flow COA to COA', async ({ page }) => {
  // Send FLOW token from COA to COA
  await sendTokenCOA({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'success',
  });
});

test('send Staked Flow COA to COA', async ({ page }) => {
  // Send stFLOW token from COA to COA
  await sendTokenCOA({
    page,
    tokenname: 'Liquid Staked Flow $',
    receiver: process.env.TEST_RECEIVER_EVM_ADDR!,
    successtext: 'success',
  });
});

//Send FTS from COA to FLOW
test('send Flow COA to FLOW', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);
  // Send FLOW token from COA to FLOW
  await sendTokenCOA({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'success',
  });
});

test('send USDC token COA to FLOW', async ({ page }) => {
  test.setTimeout(60_000);
  // Send USDC token from COA to FLOW
  await sendTokenCOA({
    page,
    tokenname: 'Bridged USDC (Celer) $',
    receiver: process.env.TEST_RECEIVER_ADDR!,
    successtext: 'success',
  });
});

//Send FTs from COA to EOA (metamask)
test('send Flow COA to EOA', async ({ page }) => {
  // This can take a while
  test.setTimeout(60_000);
  // Send FLOW token from COA to EOA
  await sendTokenCOA({
    page,
    tokenname: /^FLOW \$/i,
    receiver: process.env.TEST_RECEIVER_METAMASK_EVM_ADDR!,
    successtext: 'success',
  });
});

test('send BETA token COA to EOA', async ({ page }) => {
  test.setTimeout(60_000);
  // Send BETA token from COA to EOA
  await sendTokenCOA({
    page,
    tokenname: 'BETA $',
    receiver: process.env.TEST_RECEIVER_METAMASK_EVM_ADDR!,
    successtext: 'success',
  });
});
//Move FTs from COA to FLOW
test('move Flow COA to FLOW', async ({ page }) => {
  test.setTimeout(60_000);
  // Move FLOW token from COA to FLOW
  await moveTokenCOA({
    page,
    tokenname: /^FLOW \$/i,
    successtext: 'success',
  });
});

test('move USDC token COA to FLOW', async ({ page }) => {
  test.setTimeout(60_000);
  // Move USDC token from COA to EOA
  await moveTokenCOA({
    page,
    tokenname: 'Bridged USDC (Celer) $',
    successtext: 'success',
  });
});

//Move from main page
test('move Flow COA to FLOW homepage', async ({ page }) => {
  test.setTimeout(60_000);
  // Move FLOW token from FLOW to COA
  await moveTokenCoaHomepage({
    page,
    tokenname: 'Flow',
  });
});

test('move USDC token COA to FLOW homepage', async ({ page }) => {
  test.setTimeout(60_000);
  // Move USDC token from FLOW to COA
  await moveTokenCoaHomepage({
    page,
    tokenname: 'Bridged USDC (Celer)',
  });
});
//Send NFT from COA to COA
//Send NFT from COA to FLOW
//Send NFT from COA to EOA
//Move NFT from COA to FLOW
