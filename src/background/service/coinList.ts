import { createPersistStore } from 'background/utils';
import { storage } from 'background/webapi';
export interface CoinItem {
  coin: string;
  unit: string;
  balance: number;
  price: number;
  change24h: number | null;
  total: number;
  icon: string;
}

interface CoinListStore {
  expiry: number;
  coinItem: Record<string, any>;
  currentCoin: string;
}

const now = new Date()

class CoinList {
  store!: CoinListStore;

  init = async () => {
    this.store = await createPersistStore<CoinListStore>({
      name: 'coinList',
      template: {
        expiry: now.getTime(),
        coinItem: {
          testnet: {},
          crescendo: {},
          mainnet: {},
        },
        currentCoin: 'flow'
      },
    });
  };

  getCoinByUnit = (unit: string) => {
    return this.store.coinItem[unit];
  };

  getExpiry = () => {
    return this.store.expiry;
  };

  setExpiry = (expiry: number) => {
    this.store.expiry = expiry;
  };

  addCoin = (data: CoinItem, network: string) => {
    if (this.store.coinItem[network] === undefined) {
      this.store.coinItem[network] = {}
    }
    this.store.coinItem[network][data.unit] = data;
  };

  removeCoin = (unit: string, network: string) => {
    delete this.store.coinItem[network][unit];
  };

  updateCoin = (network: string, data: CoinItem) => {
    this.store.coinItem[network][data.unit] = data;
  };

  clear = () => {
    this.store = {
      expiry: now.getTime(),
      coinItem: {},
      currentCoin: 'flow'
    }
    storage.remove('coinList')
  };
  setCurrentCoin = (coinName: string) => {
    this.store.currentCoin = coinName;
  };
  getCurrentCoin = () => {
    return this.store.currentCoin;
  };
  listCoins = (network: string): CoinItem[] => {
    const list = Object.values(this.store.coinItem[network]);
    return list.filter((item): item is CoinItem => !!item) || [];
  };
}

export default new CoinList();
