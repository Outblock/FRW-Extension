import { useCallback } from 'react';

import { useNetworkStore } from '@/ui/stores/useNetworkStore';
import { useWallet, useWalletLoaded } from '@/ui/utils';

export const useNetworkHook = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
  const { setNetwork } = useNetworkStore();

  const fetchNetwork = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    const network = await usewallet.getNetwork();
    setNetwork(network);
  }, [usewallet, setNetwork, walletLoaded]);

  return { fetchNetwork };
};
