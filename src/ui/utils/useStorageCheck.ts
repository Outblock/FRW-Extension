import { useEffect, useCallback, useState } from 'react';

import type { StorageInfo } from '@/background/service/networkModel';

import { useWallet } from './WalletContext';

interface StorageCheckResult {
  sufficient?: boolean;
  sufficientAfterAction?: boolean;
  storageInfo?: StorageInfo;
  checkStorageStatus: () => Promise<{ sufficient: boolean; storageInfo: StorageInfo }>;
}

interface UseStorageCheckProps {
  transferAmount?: number | undefined;
  movingBetweenEVMAndFlow?: boolean;
}
export const useStorageCheck = ({
  transferAmount,
  movingBetweenEVMAndFlow,
}: UseStorageCheckProps = {}): StorageCheckResult => {
  const wallet = useWallet();

  const [sufficient, setSufficient] = useState<boolean | undefined>(undefined);
  const [sufficientAfterAction, setSufficientAfterAction] = useState<boolean | undefined>(
    undefined
  );
  const [storageInfo, setStorageInfo] = useState<StorageInfo | undefined>(undefined);
  // Check general storage status
  const checkStorageStatus = useCallback(async (): Promise<{
    sufficient: boolean;
    sufficientAfterAction: boolean;
    storageInfo: StorageInfo;
  }> => {
    try {
      const { isStorageSufficient, isStorageSufficientAfterAction, storageInfo } =
        await wallet.checkStorageStatus({
          transferAmount,
          movingBetweenEVMAndFlow,
        });

      return {
        sufficient: isStorageSufficient,
        sufficientAfterAction: isStorageSufficientAfterAction,
        storageInfo,
      };
    } catch (error) {
      console.error('Error checking storage status:', error);
      return {
        sufficient: false,
        sufficientAfterAction: false,
        storageInfo: { available: 0, used: 0, capacity: 0 },
      }; // Default to true to not block transactions on error
    }
  }, [movingBetweenEVMAndFlow, transferAmount, wallet]);

  // Initial storage check
  useEffect(() => {
    // Add this to track when the effect is actually running

    let mounted = true;
    if (wallet) {
      checkStorageStatus().then(
        ({
          sufficient: isSufficient,
          sufficientAfterAction: isSufficientAfterAction,
          storageInfo,
        }) => {
          if (mounted) {
            setStorageInfo(storageInfo);
            setSufficient(isSufficient);
            setSufficientAfterAction(isSufficientAfterAction);
          }
        }
      );
      return () => {
        mounted = false;
      };
    }
  }, [checkStorageStatus, wallet]);

  return {
    storageInfo,
    sufficient,
    sufficientAfterAction,
    checkStorageStatus,
  };
};
