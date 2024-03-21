import { storage } from 'background/webapi'

export const saveIndex = async (username = '') => {
  const loggedInAccounts = await storage.get('loggedInAccounts');
  let lastIndex;

  if (!loggedInAccounts || loggedInAccounts.length === 0) {
    lastIndex = 0;
  } else {
    const index = loggedInAccounts.findIndex(account => account.username === username);
    lastIndex = index !== -1 ? index : loggedInAccounts.length;
  }

  const path = await storage.get('temp_path') || "m/44'/539'/0'/0/0";
  const passphrase = await storage.get('temp_phrase') || '';
  await storage.set(`user${lastIndex}_path`, path);
  await storage.set(`user${lastIndex}_phrase`, passphrase);
  await storage.remove(`temp_path`);
  await storage.remove(`temp_phrase`);
  await storage.set('currentAccountIndex', lastIndex);
};
