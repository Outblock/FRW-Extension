import create from 'zustand';

interface NetworkState {
  currentNetwork: string;
  setNetwork: (network: string) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  currentNetwork: 'mainnet',
  setNetwork: (network) => set({ currentNetwork: network }),
}));
