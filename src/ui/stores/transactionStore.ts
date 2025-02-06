import type { TokenInfo } from 'flow-native-token-registry';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { NetworkType, TokenType, TransactionState } from '@/shared/types/transaction-types';
import { isValidEthereumAddress } from '@/shared/utils/address';
import { useProfileStore } from '@/ui/stores/profileStore';

interface transactionStore {
  currentTxState: TransactionState | null;
  tokenType: TokenType | null;
  fromNetwork: NetworkType | null;
  toNetwork: NetworkType | null;
  toAddress: string;
  selectedToken: TokenInfo | null;
  setTokenType: (type: TokenType) => void;
  setFromNetwork: (address: string) => void;
  setToNetwork: (address: string) => void;
  setToAddress: (address: string) => void;
  setSelectedToken: (token: TokenInfo) => void;
  createTransaction: () => TransactionState | null;
}

export const useTransactionStore = create<transactionStore>()(
  subscribeWithSelector((set, get) => ({
    currentTxState: null,
    tokenType: null,
    fromNetwork: null,
    toNetwork: null,
    toAddress: '',
    selectedToken: null,
    setSelectedToken: (token: TokenInfo) => set({ selectedToken: token }),
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
    createTransaction: () => {
      const { tokenType, fromNetwork, toNetwork, toAddress } = get();
      if (!tokenType || !fromNetwork || !toNetwork) return null;

      const transaction: TransactionState = {
        type: tokenType,
        direction: { from: fromNetwork, to: toNetwork },
        status: 'pending',
        amount: '',
        fromAddress: '',
        toAddress,
      };

      set({ currentTxState: transaction });
      return transaction;
    },
  }))
);

// Subscribe to state changes
useTransactionStore.subscribe(
  (state) => [state.tokenType, state.fromNetwork, state.toNetwork, state.toAddress],
  ([tokenType, fromNetwork, toNetwork, toAddress]) => {
    if (tokenType && fromNetwork && toNetwork && toAddress) {
      useTransactionStore.getState().createTransaction();
    }
  }
);
