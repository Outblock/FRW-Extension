import BN from 'bignumber.js';
import { useCallback, useEffect } from 'react';

import { withPrefix } from '@/shared/utils/address';
import { useCoinStore } from '@/ui/stores/useCoinStore';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useWallet } from 'ui/utils';

const DEFAULT_MIN_AMOUNT = '0.001';

export const useCoinHook = () => {
  const usewallet = useWallet();
  const { setCoinData, setBalance, setTotalFlow, totalFlow, setAvailableFlow } = useCoinStore();
  const { mainAddress } = useProfileStore();

  const handleStorageData = useCallback(
    async (storageData) => {
      if (!storageData) return;

      // Create a map for faster lookups
      const uniqueTokenMap = new Map();
      let sum = new BN(0);
      let flowBalance = new BN(0);

      // Single pass through the data
      for (const coin of storageData) {
        const lowerUnit = coin.unit.toLowerCase();

        // Handle unique tokens
        if (!uniqueTokenMap.has(lowerUnit)) {
          uniqueTokenMap.set(lowerUnit, coin);
        }

        // Calculate sum and flow balance
        if (coin.total !== null) {
          sum = sum.plus(new BN(coin.total));
          if (lowerUnit === 'flow') {
            flowBalance = new BN(coin.balance);
          }
        }
      }

      // Batch updates
      await Promise.all([
        setCoinData(Array.from(uniqueTokenMap.values())),
        setTotalFlow(flowBalance.toString()),
        setBalance(`$ ${sum.toFixed(2)}`),
      ]);
    },
    [setCoinData, setTotalFlow, setBalance]
  );

  const calculateAvailableBalance = useCallback(async () => {
    try {
      const address = withPrefix(mainAddress) || '';
      // TODO: need a controller for this
      const minAmount = new BN(
        (await usewallet.openapi.getAccountMinFlow(address)) || DEFAULT_MIN_AMOUNT
      );
      const total = new BN(totalFlow);
      const availableFlow = total.minus(minAmount).toString();
      setAvailableFlow(availableFlow);
    } catch (error) {
      console.error('Error calculating available balance:', error);
      setAvailableFlow('0');
    }
  }, [usewallet, totalFlow, mainAddress, setAvailableFlow]);

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

  useEffect(() => {
    calculateAvailableBalance();
  }, [totalFlow, calculateAvailableBalance]);

  return {
    refreshCoinData,
    handleStorageData,
  };
};
