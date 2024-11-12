import { useEffect, useCallback, useMemo } from 'react';

import { WalletController } from '@/background/controller/wallet';

interface StorageCheckResult {
  checkStorageStatus: () => Promise<boolean>;
  checkTransactionStorage: (amount?: number) => Promise<boolean>;
}

export const useStorageCheck = (): StorageCheckResult => {
  const controller = useMemo(() => new WalletController(), []);

  // Check general storage status
  const checkStorageStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { isStorageSufficient: sufficient } = await controller.checkStorageStatus();
      return sufficient;
    } catch (error) {
      console.error('Storage check failed:', error);
      return true; // Default to true to not block transactions on error
    }
  }, [controller]);

  // Check storage for a specific transaction
  const checkTransactionStorage = useCallback(
    async (amount?: number): Promise<boolean> => {
      try {
        const { canProceed } = await controller.checkTransactionStorageStatus(amount);
        return canProceed;
      } catch (error) {
        console.error('Transaction storage check failed:', error);
        return true;
      }
    },
    [controller]
  );

  // Initial storage check
  useEffect(() => {
    checkStorageStatus();
  }, [checkStorageStatus]);

  return {
    checkStorageStatus,
    checkTransactionStorage,
  };
};
