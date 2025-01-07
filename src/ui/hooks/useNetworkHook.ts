import { useCallback } from 'react';

import { useNetworkStore } from '@/ui/stores/useNetworkStore';
import { useWallet } from '@/ui/utils';

export const useNetworkHook = () => {
  const usewallet = useWallet();
  const { setNetwork } = useNetworkStore();

  const fetchNetwork = useCallback(async () => {
    const network = await usewallet.getNetwork();
    setNetwork(network);
  }, [usewallet, setNetwork]);

  return { fetchNetwork };
};
