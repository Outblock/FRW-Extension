import { useCallback } from 'react';

import { useCoinHook } from './useCoinHook';
import { useNetworkHook } from './useNetworkHook';
import { useProfileHook } from './useProfileHook';

export const useInitHook = () => {
  const { fetchProfileData, freshUserWallet, fetchUserWallet } = useProfileHook();
  const { fetchNetwork } = useNetworkHook();
  const { refreshCoinData } = useCoinHook();

  const initializeStore = useCallback(async () => {
    await fetchNetwork();
    await fetchProfileData();
    await freshUserWallet();
    await fetchUserWallet();
    await refreshCoinData();
  }, [fetchNetwork, fetchProfileData, freshUserWallet, fetchUserWallet, refreshCoinData]);

  return { initializeStore };
};
