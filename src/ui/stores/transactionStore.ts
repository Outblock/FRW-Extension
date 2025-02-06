import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { NetworkType, TokenType, TransactionState } from '@/shared/types/transaction-types';

interface transactionStore {
  currentTransaction: TransactionState | null;
  tokenType: TokenType | null;
  fromNetwork: NetworkType | null;
  toNetwork: NetworkType | null;
  toAddress: string;
  setTokenType: (type: TokenType) => void;
  setFromNetwork: (type: NetworkType) => void;
  setToNetwork: (type: NetworkType) => void;
  setToAddress: (address: string) => void;
  createTransaction: () => TransactionState | null;
}

export const useTransactionStore = create<transactionStore>()(
  subscribeWithSelector((set, get) => ({
    currentTransaction: null,
    tokenType: null,
    fromNetwork: null,
    toNetwork: null,
    toAddress: '',
    setTokenType: (type) => set({ tokenType: type }),
    setFromNetwork: (type) => set({ fromNetwork: type }),
    setToNetwork: (type) => set({ toNetwork: type }),
    setToAddress: (address) => set({ toAddress: address }),
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

      set({ currentTransaction: transaction });
      return transaction;
    },
  }))
);

// Subscribe to state changes
useTransactionStore.subscribe(
  (state) => [state.tokenType, state.fromNetwork, state.toNetwork, state.toAddress],
  ([tokenType, fromNetwork, toNetwork, toAddress]) => {
    if (tokenType && fromNetwork && toNetwork) {
      useTransactionStore.getState().createTransaction();
    }
  }
);
