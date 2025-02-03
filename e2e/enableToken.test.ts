/*
import { test, loginToExtension } from './utils/helper';

test('enable EVM token', async ({ page, extensionId }) => {
  await loginToExtension({ page, extensionId });

  await page.goto('chrome-extension://cfiagdgiikmjgfjnlballglniejjgegi/index.html#/dashboard');
  await page.getByLabel('menu').click();
  await page.getByRole('button', { name: '🍋 Lemon EVM 0 FLOW' }).click();
  await page.locator('#full-width-tabpanel-0 button').click();

  await page
    .getByPlaceholder('Contract Address')
    .fill('0xd8Ad8AE8375aa31BFF541e17dC4b4917014EbDAa');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Import' }).click();
  await page.getByRole('button', { name: 'BETA $' }).click();
});

*/
