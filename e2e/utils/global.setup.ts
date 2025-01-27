import {
  getClipboardText,
  saveAuth,
  expect,
  test as setup,
  loginToExtension,
  closeOpenedPages,
} from './helper';

const getNumber = (str: string) => {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0]) : null;
};

const password = 'TestPassword';

// for user register and login
setup('setup new wallet or login if already registered', async ({ page, extensionId }) => {
  // let playwright know this is going to be slow
  // Wait up to 2 minutes to setup an account
  setup.setTimeout(500_000);
  // Create a new page and navigate to extension
  // Navigate and wait for network to be idle

  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  await page.waitForLoadState('domcontentloaded');

  await page.waitForURL(/.*unlock|.*welcome/);
  const pageUrl = page.url();
  console.log('pageUrl', pageUrl);
  const isUnlockPage = pageUrl.includes('unlock');
  console.log('isUnlockPage', isUnlockPage);
  const isWelcomePage = pageUrl.includes('welcome');
  console.log('isWelcomePage', isWelcomePage);

  if (isUnlockPage) {
    // We're not starting from a fresh install, so login
    await loginToExtension({ page, extensionId });
  } else {
    // We're starting from a fresh install, so create a new wallet
    await closeOpenedPages(page);
    // Wait for the welcome page to be fully loaded
    await page.waitForSelector('.welcomeBox', { state: 'visible' });

    // Click on register button
    await page.getByRole('link', { name: 'Create a new wallet' }).click();

    // Wait for the register page to be fully loaded
    await page.getByText('Your username will be used to').isVisible();

    // Fill in the form
    await page.getByPlaceholder('Username').fill('testuser');

    // Click on register button
    await page.getByRole('button', { name: 'Next' }).click();

    await page
      .locator('div')
      .filter({ hasText: /^Click here to reveal phrase$/ })
      .getByRole('button')
      .click();

    await page.getByRole('button', { name: 'Copy' }).click();

    // got keys from clipboard
    const clipboardText = await page.evaluate(getClipboardText);

    const keyArr = clipboardText.split(' ');

    // next step
    await page.getByRole('button', { name: 'Okay, I have saved it properly' }).click();

    // get puzzles
    const firstIdx = await page.locator('div').getByText('#').first().textContent();
    const secondIdx = await page.locator('div').getByText('#').nth(1).textContent();
    const thirdIdx = await page.locator('div').getByText('#').nth(2).textContent();

    const firstMnemonic = keyArr[getNumber(firstIdx!)! - 1];
    const secondMnemonic = keyArr[getNumber(secondIdx!)! - 1];
    const thirdMnemonic = keyArr[getNumber(thirdIdx!)! - 1];

    // console.log(firstMnemonic, secondMnemonic, thirdMnemonic);
    // click the right mnemonic word

    // resolve mnemonics puzzles
    await page.getByLabel('row0').getByRole('button', { name: firstMnemonic }).click();
    await page.getByLabel('row1').getByRole('button', { name: secondMnemonic }).click();
    await page.getByLabel('row2').getByRole('button', { name: thirdMnemonic }).click();

    await page
      .locator('div')
      .filter({ hasText: /^Next$/ })
      .click();

    // fill
    await page.getByPlaceholder('Create a password').fill(password);
    await page.getByPlaceholder('Confirm your password').fill(password);

    await page.getByLabel("I agree to Flow Wallet's").click();

    const registerBtn = await page.getByRole('button', { name: 'Register' });
    await registerBtn.click();
    await expect(page.getByRole('button', { name: 'Connect and Back up' })).toBeVisible({
      timeout: 120_000,
    });

    // await unlockBtn.isEnabled();
    await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);
    // get address
    const copyIcon = await page.getByLabel('Copy Address');
    await expect(copyIcon).toBeEnabled({ timeout: 600_000 }); // 10 minutes...

    await copyIcon.isEnabled();

    await copyIcon.click();

    const flowAddr = await page.evaluate(getClipboardText);

    // save keys and pwd to keys file
    await saveAuth({
      privateKey: clipboardText,
      password: password,
      addr: flowAddr,
    });
  }
});
