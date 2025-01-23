import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { storage } from '@/background/webapi';

import { useProfileHook } from '../hooks/useProfileHook';

interface NetworkState {
  currentNetwork: string;
  developerMode: boolean;
  setNetwork: (network: string) => void;
  setDeveloperMode: (mode: boolean) => void;
}

export const useNetworkStore = create<NetworkState>()(
  subscribeWithSelector((set) => {
    // Initialize store on creation
    const init = async () => {
      const developerMode = await storage.get('developerMode');
      if (developerMode) {
        set({ developerMode });
      }
    };
    init();

    return {
      currentNetwork: 'mainnet',
      developerMode: false,
      setNetwork: (network) => set({ currentNetwork: network }),
      setDeveloperMode: (mode) => set({ developerMode: mode }),
    };
  })
);

// Subscribe to network changes
useNetworkStore.subscribe(
  (state) => state.currentNetwork,
  async () => {
    // Trigger profile updates when network changes
    const { fetchProfileData, freshUserWallet, fetchUserWallet } = useProfileHook();
    await fetchProfileData();
    await freshUserWallet();
    await fetchUserWallet();
  }
);
