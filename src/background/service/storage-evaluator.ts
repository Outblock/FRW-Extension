import * as fcl from '@onflow/fcl';

import { openapiService } from '../service';

import type { StorageInfo } from './networkModel';
interface EvaluateStorageResult {
  isStorageSufficient: boolean;
  isStorageSufficientAfterAction: boolean;
  storageInfo: StorageInfo;
}
export class StorageEvaluator {
  private static MINIMUM_STORAGE_BUFFER = 10000; // minimum required storage buffer (10,000 bytes)
  private static FIXED_MOVE_FEE = 0.001;
  private static AVERAGE_TX_FEE = 0.0005;
  private static BYTES_PER_FLOW = 100 * 1024 * 1024; // 100 MB

  async evaluateStorage(
    address: string,
    sendAmount?: number,
    coin?: string,
    movingBetweenEVMAndFlow?: boolean,
    freeGas?: boolean
  ): Promise<EvaluateStorageResult> {
    // Get storage info from openapi service
    const storageInfo = await openapiService.getStorageInfo(address);

    const remainingStorage = storageInfo.capacity - storageInfo.used;
    const isStorageSufficient = remainingStorage >= StorageEvaluator.MINIMUM_STORAGE_BUFFER;

    let noStorageAfterAction = false;

    if (isStorageSufficient) {
      // Check if there is enough storage after the action
      if (sendAmount !== undefined) {
        // This is the amount of flow that will be used by the transaction
        const flowUsed =
          (coin === 'flow' ? sendAmount : 0) +
          (movingBetweenEVMAndFlow ? StorageEvaluator.FIXED_MOVE_FEE : 0) +
          (freeGas ? 0 : StorageEvaluator.AVERAGE_TX_FEE);

        const storageAffected = flowUsed * StorageEvaluator.BYTES_PER_FLOW;
        const remainingStorageAfterAction = storageInfo.available - storageAffected;

        noStorageAfterAction =
          remainingStorageAfterAction < StorageEvaluator.MINIMUM_STORAGE_BUFFER;
      }
    }

    return {
      isStorageSufficient,
      isStorageSufficientAfterAction: !noStorageAfterAction,
      storageInfo,
    };
  }
}
