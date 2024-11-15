import * as fcl from '@onflow/fcl';

import { openapiService } from '../service';

import type { StorageInfo } from './networkModel';

export class StorageEvaluator {
  private static MINIMUM_STORAGE_BUFFER = 100000; // minimum required storage buffer
  private static MINIMUM_FLOW_BALANCE = 0.001; // minimum required FLOW balance

  async evaluateStorage(address: string): Promise<{
    isStorageSufficient: boolean;
    storageInfo: StorageInfo;
  }> {
    // Get storage info from openapi service
    const storageInfo = await openapiService.getStorageInfo(address);

    const remainingStorage = storageInfo.capacity - storageInfo.used;
    const isStorageSufficient = remainingStorage >= StorageEvaluator.MINIMUM_STORAGE_BUFFER;

    return {
      isStorageSufficient,
      storageInfo,
    };
  }

  async canPerformTransaction(
    address: string,
    sendAmount?: number
  ): Promise<{
    canProceed: boolean;
    reason?: string;
  }> {
    const { isStorageSufficient, storageInfo } = await this.evaluateStorage(address);

    if (!isStorageSufficient) {
      return {
        canProceed: false,
        reason: 'insufficient_storage',
      };
    }

    if (sendAmount) {
      // Need to check the units. Is available in flow? Or is it in mb?
      const remainingBalance = storageInfo.available - sendAmount;
      if (remainingBalance < StorageEvaluator.MINIMUM_FLOW_BALANCE) {
        return {
          canProceed: false,
          reason: 'insufficient_balance',
        };
      }
    }

    return {
      canProceed: true,
    };
  }
}
