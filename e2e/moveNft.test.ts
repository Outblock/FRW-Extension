import { test, loginAsTestUser } from './utils/helper';

test('move nft', async ({ page, extensionId }) => {
  await loginAsTestUser({ page, extensionId });
  //

  await page.getByRole('tab', { name: 'NFTs' }).click();
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByPlaceholder('Seach NFT Collection').fill('monster');
  await page.getByPlaceholder('Seach NFT Collection').press('ControlOrMeta+a');
  await page.getByPlaceholder('Seach NFT Collection').fill('');
  await page.getByRole('button', { name: 'Flovatar Flovatar is' }).click();
  await page.getByRole('button', { name: 'Flovatar Flovatar is' }).getByRole('button').click();

  await page.pause();
});
