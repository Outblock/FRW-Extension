import { storage } from '@/background/webapi';

export const getStoragedAccount = async () => {
  const accountIndex = (await storage.get('currentAccountIndex')) || 0;
  const currentId = (await storage.get('currentId')) || null;
  const loggedInAccounts = (await storage.get('loggedInAccounts')) || [];
  let account;

  // Check if currentId is provided and valid
  if (currentId !== null) {
    // Find account with the currentId
    account = loggedInAccounts.find((acc) => acc.id === currentId);

    // If no account is found with currentId, default to accountIndex
    if (!account) {
      account = loggedInAccounts[accountIndex];
    }
  } else {
    // If currentId is not provided, use accountIndex
    account = loggedInAccounts[accountIndex];
  }

  if (!account) {
    // Handle the case when no account is found
    throw new Error('Account info not found.');
  } else {
    // Return account
    return account;
  }
};
