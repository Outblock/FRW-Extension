import * as fcl from '@onflow/fcl';

import { openapiService } from '../service';

export interface StorageInfo {
  address: string;
  balance: number;
  availableBalance: number;
  storageUsed: number;
  storageCapacity: number;
  storageFlow: number;
}

export class StorageEvaluator {
  private static MINIMUM_STORAGE_BUFFER = 10000; // minimum required storage buffer
  private static MINIMUM_FLOW_BALANCE = 0.001; // minimum required FLOW balance

  async evaluateStorage(address: string): Promise<{
    isStorageSufficient: boolean;
    storageInfo: StorageInfo;
  }> {
    // Get account info from FCL
    const account = await fcl.send([fcl.getAccount(address)]).then(fcl.decode);

    // Get storage info from openapi service
    const storageInfo = await openapiService.getStorageInfo(address);

    const combinedInfo: StorageInfo = {
      address: address,
      balance: parseFloat(account.balance) / 1e8, // Flow amounts are in 8 decimal places
      availableBalance: parseFloat(account.balance) / 1e8,
      storageUsed: storageInfo.used,
      storageCapacity: storageInfo.capacity,
      storageFlow: parseFloat(account.balance) / 1e8, // Using balance as storageFlow since it's the same token
    };

    const remainingStorage = combinedInfo.storageCapacity - combinedInfo.storageUsed;
    const isStorageSufficient = remainingStorage >= StorageEvaluator.MINIMUM_STORAGE_BUFFER;

    return {
      isStorageSufficient,
      storageInfo: combinedInfo,
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
      const remainingBalance = storageInfo.availableBalance - sendAmount;
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
