import Web3 from 'web3';
import { create } from 'zustand';

import { EVM_ENDPOINT } from 'consts';

interface ProviderStore {
  web3Instance: Web3 | null;
  setWeb3Instance: (network: string) => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  web3Instance: null,
  setWeb3Instance: (network) => {
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    set({ web3Instance: new Web3(provider) });
  },
}));
