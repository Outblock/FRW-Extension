import { useCallback } from 'react';

import { ensureEvmAddressPrefix } from '@/shared/utils/address';
import { useProfileStore, type WalletResponse } from '@/ui/stores/useProfileStore';
import { useWallet } from '@/ui/utils';

export const useProfileHook = () => {
  const usewallet = useWallet();
  const { setMainAddress, setEvmAddress, setUserWallet, setInitial, initialStart } =
    useProfileStore();

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

  const freshUserWallet = useCallback(async () => {
    const wallet: WalletResponse[] = await usewallet.getUserWallets();
    const fData: WalletResponse[] = wallet.filter((item) => item.blockchain !== null);

    setUserWallet(fData);
    if (initialStart) {
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
  }, [usewallet, initialStart, setUserWallet, setInitial]);

  return {
    fetchProfileData,
    freshUserWallet,
  };
};
