import type { NewsConditionType } from '@/shared/types/news-types';

import packageJson from '../../../package.json';
import { userWalletService } from '../service';
import { StorageEvaluator } from '../service/storage-evaluator';

import openapi from './openapi';

const CURRENT_VERSION = packageJson.version;

class ConditionsEvaluator {
  private async evaluateCondition(condition: NewsConditionType): Promise<boolean> {
    switch (condition) {
      case 'isWeb':
        return true; // Always true for Chrome extension

      case 'isIOS':
      case 'isAndroid':
        return false; // Always false for Chrome extension

      case 'canUpgrade':
        const latestVersion = await openapi.getLatestVersion();
        try {
          const canUpgrade = this.compareVersions(CURRENT_VERSION, latestVersion) < 0;
          return canUpgrade;
        } catch (err) {
          console.error('Error evaluating canUpgrade', err);
          return false;
        }

      case 'insufficientStorage': {
        const currentAddress = userWalletService.getCurrentAddress();
        if (!currentAddress) return false;
        return this.evaluateStorageCondition(currentAddress);
      }
      case 'insufficientBalance': {
        const currentAddress = userWalletService.getCurrentAddress();
        if (!currentAddress) return false;
        return this.evaluateBalanceCondition(currentAddress);
      }

      case 'unknown':
      default:
        return false; // Unknown conditions are considered unmet
    }
  }

  private compareVersions(current: string, latest: string): number {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (currentPart !== latestPart) {
        return currentPart - latestPart;
      }
    }
    return 0;
  }

  async evaluateConditions(conditions?: { type: NewsConditionType }[]): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions means always show
    }

    // Evaluate all conditions (AND logic)
    for (const condition of conditions) {
      if (!(await this.evaluateCondition(condition.type))) {
        return false;
      }
    }
    return true;
  }

  async evaluateStorageCondition(address: string): Promise<boolean> {
    const storageEvaluator = new StorageEvaluator();
    const { isStorageSufficient } = await storageEvaluator.evaluateStorage(address);
    return !isStorageSufficient;
  }

  async evaluateBalanceCondition(address: string): Promise<boolean> {
    const storageEvaluator = new StorageEvaluator();
    const { isBalanceSufficient } = await storageEvaluator.evaluateStorage(address);

    return !isBalanceSufficient;
  }
}

export default new ConditionsEvaluator();
