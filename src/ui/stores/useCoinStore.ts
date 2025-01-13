import { create } from 'zustand';

import type { CoinItem } from '../../shared/types/wallet-types';

interface CoinStore {
  coins: CoinItem[];
  balance: string;
  setCoinData: (coins: CoinItem[]) => void;
  setBalance: (balance: string) => void;
  clearCoins: () => void;
}

export const useCoinStore = create<CoinStore>((set) => ({
  coins: [],
  balance: '$ 0.00',
  setBalance: (balance) => set({ balance }),
  setCoinData: (coins) => set({ coins }),
  clearCoins: () => set({ coins: [], balance: '$ 0.00' }),
}));
