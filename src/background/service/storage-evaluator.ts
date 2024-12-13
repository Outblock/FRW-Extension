import { openapiService } from '../service';

import type { StorageInfo } from './networkModel';

export type EvaluateStorageResult = {
  isStorageSufficient: boolean;
  isBalanceSufficient: boolean;
  isStorageSufficientAfterAction: boolean;
  storageInfo: StorageInfo;
};

export class StorageEvaluator {
  private static MINIMUM_FLOW_BALANCE = 0.001;
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

    // Calculate the flow balance that is used by the storage calculation
    // I don't "love" this approach as it involves a division, but it
    // avoids having to figure out which flow balance is used by the storage calculation
    const flowBalanceAffectingStorage = storageInfo.capacity / StorageEvaluator.BYTES_PER_FLOW;

    // Check if the flow balance is sufficient
    const isBalanceSufficient =
      flowBalanceAffectingStorage >= StorageEvaluator.MINIMUM_FLOW_BALANCE;

    let isStorageSufficientAfterAction = true;

    // Check feature flag
    const FEATURE_FLAG_TX_WARNING_PREDICTION =
      await openapiService.getFeatureFlag('tx_warning_prediction');

    if (FEATURE_FLAG_TX_WARNING_PREDICTION) {
      // The feature is enabled, so we need to check if there is enough storage after the action
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

          isStorageSufficientAfterAction =
            remainingStorageAfterAction >= StorageEvaluator.MINIMUM_STORAGE_BUFFER;
        }
      }
    }

    return {
      isStorageSufficient,
      isBalanceSufficient,
      isStorageSufficientAfterAction,
      storageInfo,
    };
  }
}
