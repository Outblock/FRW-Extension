import { useCallback } from 'react';

import { useTransactionStore } from '@/ui/stores/transactionStore';
import { useWallet } from '@/ui/utils/WalletContext';

// Temporary fix before getting the coinlist tokenlist upgrade in the background.
export const useTransactionHook = () => {
  const usewallet = useWallet();
  const { setSelectedToken } = useTransactionStore();

  const fetchAndSetToken = useCallback(
    async (address: string) => {
      try {
        const tokenInfo = await usewallet.openapi.getEvmTokenInfo(address);
        if (tokenInfo) {
          setSelectedToken(tokenInfo);
        }
      } catch (error) {
        console.error('Error fetching token info:', error);
      }
    },
    [setSelectedToken, usewallet]
  );

  return { fetchAndSetToken };
};
