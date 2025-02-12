import { useEffect } from 'react';

import { useNetworkStore } from '../stores/networkStore';
import { useProviderStore } from '../stores/providerStore';

export const useWeb3 = () => {
  const { currentNetwork: network } = useNetworkStore();

  const providerStore = useProviderStore();

  useEffect(() => {
    providerStore.setWeb3Instance(network);
  }, [network, providerStore]);

  return providerStore.web3Instance;
};
