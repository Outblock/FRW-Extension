import { create } from 'zustand';

interface CoinItem {
  coin: string;
  unit: string;
  balance: number;
  price: number;
  change24h: number | null;
  total: number;
  icon: string;
  custom?: boolean;
}
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
