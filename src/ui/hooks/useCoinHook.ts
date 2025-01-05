import { useCallback, useEffect } from 'react';

import { useCoinStore } from '@/ui/stores/useCoinStore';
import { useWallet } from 'ui/utils';

export const useCoinHook = () => {
  const usewallet = useWallet();
  const { setCoinData, setBalance } = useCoinStore();

  const handleStorageData = useCallback(
    async (storageData) => {
      if (storageData) {
        const uniqueTokens = storageData.filter(
          (token, index, self) =>
            index === self.findIndex((t) => t.unit.toLowerCase() === token.unit.toLowerCase())
        );
        await setCoinData(uniqueTokens);
        let sum = 0;
        storageData
          .filter((item) => item.total !== null)
          .forEach((coin) => {
            sum = sum + parseFloat(coin.total);
          });
        setBalance('$ ' + sum.toFixed(2));
      }
    },
    [setCoinData, setBalance]
  );

  const sortWallet = useCallback(
    (data) => {
      const sorted = data.sort((a, b) => {
        if (b.total === a.total) {
          return b.balance - a.balance;
        } else {
          return b.total - a.total;
        }
      });
      handleStorageData(sorted);
    },
    [handleStorageData]
  );

  const refreshCoinData = useCallback(async () => {
    if (!usewallet) return;

    try {
      const refreshedCoinlist = await usewallet.refreshCoinList(60000);
      if (Array.isArray(refreshedCoinlist) && refreshedCoinlist.length > 0) {
        sortWallet(refreshedCoinlist);
      }
    } catch (error) {
      console.error('Error refreshing coin data:', error);
    }
  }, [usewallet, sortWallet]);

  useEffect(() => {
    if (usewallet) {
      refreshCoinData();
    }
  }, [refreshCoinData, usewallet]);

  return { refreshCoinData };
};
