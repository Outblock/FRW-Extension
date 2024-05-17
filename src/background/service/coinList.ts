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
  evm: Record<string, any>;
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
          previewnet:{},
          mainnet: {},
        },
        evm: {
          testnet: {},
          crescendo: {},
          previewnet:{},
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

  addCoin = (data: CoinItem, network: string, listType = 'coinItem') => {
    if (this.store[listType][network] === undefined) {
      this.store[listType][network] = {}
    }
    this.store[listType][network][data.unit] = data;
  };

  removeCoin = (unit: string, network: string, listType = 'coinItem') => {
    delete this.store[listType][network][unit];
  };

  updateCoin = (network: string, data: CoinItem, listType = 'coinItem') => {
    this.store[listType][network][data.unit] = data;
  };

  clear = () => {
    this.store = {
      expiry: now.getTime(),
      coinItem: {},
      evm: {},
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
  listCoins = (network: string , listType = 'coinItem'): CoinItem[] => {
    const list = Object.values(this.store[listType][network]);
    return list.filter((item): item is CoinItem => !!item) || [];
  };
}

export default new CoinList();
