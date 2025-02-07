import type { TokenInfo } from 'flow-native-token-registry';
import { debounce } from 'lodash';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type {
  NetworkType,
  TokenType,
  TransactionStateString,
} from '@/shared/types/transaction-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import { useProfileStore } from '@/ui/stores/profileStore';

interface TransactionStore {
  currentTxState: TransactionStateString | null;
  tokenType: TokenType | null;
  fromNetwork: NetworkType | null;
  toNetwork: NetworkType | null;
  toAddress: string;
  selectedToken: TokenInfo | null;
  setTokenType: (type: TokenType) => void;
  setFromNetwork: (address: string) => void;
  setToNetwork: (address: string) => void;
  setToAddress: (address: string) => void;
  setSelectedToken: (input: TokenInfo) => Promise<void>;
  createTransactionState: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  subscribeWithSelector((set, get) => ({
    currentTxState: null,
    tokenType: null,
    fromNetwork: null,
    toNetwork: null,
    toAddress: '',
    selectedToken: null,
    setSelectedToken: async (input: TokenInfo) => {
      console.log('Selected Token:', input);
      set({ selectedToken: input });
    },
    setTokenType: (type) => set({ tokenType: type }),
    setFromNetwork: (address) => {
      const mainAddress = useProfileStore.getState().mainAddress;
      let networkType: NetworkType = 'Child';

      if (isValidEthereumAddress(address)) {
        networkType = 'Evm';
      } else if (address === mainAddress) {
        networkType = 'Cadence';
      }
      console.log('setFromNetwork networkType', networkType);

      set({ fromNetwork: networkType });
    },
    setToNetwork: (address) => {
      const mainAddress = useProfileStore.getState().mainAddress;
      let networkType: NetworkType = 'Child';

      if (isValidEthereumAddress(address)) {
        networkType = 'Evm';
      } else if (address === mainAddress) {
        networkType = 'Cadence';
      }
      console.log('networkType', networkType, address, mainAddress);
      set({ toNetwork: networkType });
    },
    setToAddress: (address) => {
      set({ toAddress: address });
      get().setToNetwork(address);
    },
    createTransactionState: () => {
      const { tokenType, fromNetwork, toNetwork, currentTxState } = get();
      if (!tokenType || !fromNetwork || !toNetwork) return;

      const newTxState: TransactionStateString = `${tokenType}from${fromNetwork}to${toNetwork}`;
      if (currentTxState !== newTxState) {
        console.log('Creating new transaction state:', newTxState);
        set({ currentTxState: newTxState });
      }
    },
  }))
);

// Subscription with equality check
useTransactionStore.subscribe(
  (state) => ({
    tokenType: state.tokenType,
    fromNetwork: state.fromNetwork,
    toNetwork: state.toNetwork,
  }),
  (newState, prevState) => {
    // Skip if nothing changed
    if (!hasStateChanged(newState, prevState)) {
      console.log('No state changes, skipping update');
      return;
    }

    if (newState.tokenType && newState.fromNetwork && newState.toNetwork) {
      console.log('State changed, creating new transaction state');
      useTransactionStore.getState().createTransactionState();
    }
  },
  {
    equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b), // Deep equality check
  }
);

// Helper function
const hasStateChanged = (newState: any, prevState: any) => {
  return Object.keys(newState).some((key) => newState[key] !== prevState[key]);
};
