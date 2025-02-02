import { storage } from '@/background/webapi';
import { type LoggedInAccount } from '@/shared/types/wallet-types';

export const getStoragedAccount = async (): Promise<LoggedInAccount> => {
  // Note that currentAccountIndex is only used in keyring for old accounts that don't have an id stored in the keyring
  // currentId always takes precedence
  const accountIndex = (await storage.get('currentAccountIndex')) || 0;
  const currentId = (await storage.get('currentId')) || null;
  const loggedInAccounts: LoggedInAccount[] = (await storage.get('loggedInAccounts')) || [];
  let account;

  // Check if currentId is provided and valid
  if (currentId !== null) {
    // Find account with the currentId
    account = loggedInAccounts.find((acc) => acc.id === currentId);
    // NOTE: If no account is found with currentId, then loggedInAccounts is possibly out of sync with the keyring

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
