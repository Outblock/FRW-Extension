import { useCallback } from 'react';

import { ensureEvmAddressPrefix } from '@/shared/utils/address';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useWallet } from '@/ui/utils';

export const useProfileHook = () => {
  const usewallet = useWallet();
  const { setMainAddress, setEvmAddress } = useProfileStore();

  const fetchProfileData = useCallback(async () => {
    try {
      const mainAddress = await usewallet.getMainAddress();
      if (mainAddress) {
        setMainAddress(mainAddress);
        try {
          const evmRes = await usewallet.queryEvmAddress(mainAddress);
          setEvmAddress(ensureEvmAddressPrefix(evmRes!));
        } catch (err) {
          console.error('queryEvmAddress err', err);
        }
      }
    } catch (err) {
      console.error('fetchProfileData err', err);
    }
  }, [usewallet, setMainAddress, setEvmAddress]);

  return {
    fetchProfileData,
  };
};
