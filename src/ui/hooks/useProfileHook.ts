import { useCallback } from 'react';

import { ensureEvmAddressPrefix } from '@/shared/utils/address';
import {
  useProfileStore,
  type ChildAccount,
  type WalletResponse,
  type WalletType,
} from '@/ui/stores/useProfileStore';
import { useWallet } from '@/ui/utils';

export const useProfileHook = () => {
  const usewallet = useWallet();
  const {
    setMainAddress,
    setEvmAddress,
    setUserWallet,
    setInitial,
    setChildAccount,
    setCurrent,
    setEvmWallet,
    setMainLoading,
    setEvmLoading,
    setUserInfo,
    setOtherAccounts,
    setLoggedInAccounts,
    initialStart,
  } = useProfileStore();

  const fetchProfileData = useCallback(async () => {
    try {
      const mainAddress = await usewallet.getMainAddress();
      if (mainAddress) {
        setMainAddress(mainAddress);
        try {
          const evmRes = await usewallet.queryEvmAddress(mainAddress);
          const emoji = await usewallet.getEmoji();
          const newEvmRes: WalletType = {
            name: emoji[9].name,
            icon: emoji[9].emoji,
            address: ensureEvmAddressPrefix(evmRes!),
            chain_id: '1',
            id: 1,
            coins: [],
            color: emoji[9].bgcolor,
          };
          setEvmWallet(newEvmRes);
          setEvmLoading(false);
          setEvmAddress(ensureEvmAddressPrefix(evmRes!));
        } catch (err) {
          console.error('queryEvmAddress err', err);
        }
      }
    } catch (err) {
      console.error('fetchProfileData err', err);
    }
  }, [usewallet, setMainAddress, setEvmAddress, setEvmWallet, setEvmLoading]);

  const freshUserWallet = useCallback(async () => {
    const wallet: WalletResponse[] = await usewallet.getUserWallets();
    const fData: WalletResponse[] = wallet.filter((item) => item.blockchain !== null);

    setUserWallet(fData);
    if (initialStart) {
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
  }, [usewallet, initialStart, setUserWallet, setInitial]);

  const freshUserInfo = useCallback(async () => {
    const currentWallet = await usewallet.getCurrentWallet();
    const isChild = await usewallet.getActiveWallet();

    const mainAddress = await usewallet.getMainAddress();
    if (isChild === 'evm') {
      const res = await usewallet.queryEvmAddress(mainAddress!);
      const evmWallet = await usewallet.getEvmWallet();
      const evmAddress = ensureEvmAddressPrefix(res);
      evmWallet.address = evmAddress;
      await setCurrent(evmWallet);
      setMainLoading(false);
    } else if (isChild) {
      const currentWallet = await usewallet.getCurrentWallet();
      await setCurrent(currentWallet);
      setMainLoading(false);
    } else {
      const mainwallet = await usewallet.returnMainWallet();
      await setCurrent(mainwallet);
      setMainLoading(false);
    }
    const keys = await usewallet.getAccount();
    const pubKTuple = await usewallet.getPubKey();
    console.log('mainAddress', mainAddress);

    const walletData = await usewallet.getUserInfo(true);

    const { otherAccounts, wallet, loggedInAccounts } = await usewallet.openapi.freshUserInfo(
      currentWallet,
      keys,
      pubKTuple,
      walletData,
      isChild
    );

    await setOtherAccounts(otherAccounts);
    await setUserInfo(wallet);
    await setLoggedInAccounts(loggedInAccounts);
  }, [usewallet, setCurrent, setMainLoading, setUserInfo, setOtherAccounts, setLoggedInAccounts]);

  const fetchUserWallet = useCallback(async () => {
    freshUserInfo();
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    setChildAccount(childresp);
    usewallet.setChildWallet(childresp);
  }, [freshUserInfo, usewallet, setChildAccount]);

  return {
    fetchProfileData,
    freshUserWallet,
    fetchUserWallet,
  };
};
