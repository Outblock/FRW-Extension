import { useCallback } from 'react';

import type { ChildAccount, WalletType, WalletResponse } from '@/shared/types/network-types';
import { ensureEvmAddressPrefix, withPrefix } from '@/shared/utils/address';
import { useNetworkStore } from '@/ui/stores/useNetworkStore';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useWallet } from '@/ui/utils';

export const useProfileHook = () => {
  const usewallet = useWallet();
  const { currentNetwork } = useNetworkStore();
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
    setWalletList,
    initialStart,
  } = useProfileStore();

  // Helper function for formatWallets
  const formatWallets = useCallback(
    (data) => {
      if (!Array.isArray(data)) return [];

      const filteredData = data.filter((wallet) => {
        return wallet.chain_id === currentNetwork;
      });

      return filteredData.map((wallet, index) => ({
        id: index,
        name: wallet.name || 'Wallet',
        address: withPrefix(wallet.blockchain[0].address),
        key: index,
        icon: wallet.icon || '',
        color: wallet.color || '',
      }));
    },
    [currentNetwork]
  );

  // Helper function for fetchUserWallet
  const freshUserInfo = useCallback(async () => {
    try {
      const [currentWallet, isChild, mainAddress] = await Promise.all([
        usewallet.getCurrentWallet(),
        usewallet.getActiveWallet(),
        usewallet.getMainAddress(),
      ]);

      if (isChild === 'evm') {
        const [res, evmWallet] = await Promise.all([
          usewallet.queryEvmAddress(mainAddress!),
          usewallet.getEvmWallet(),
        ]);
        evmWallet.address = ensureEvmAddressPrefix(res);
        await setCurrent(evmWallet);
      } else if (isChild) {
        await setCurrent(currentWallet);
      } else {
        const mainwallet = await usewallet.returnMainWallet();
        await setCurrent(mainwallet);
      }

      const [keys, pubKTuple, walletData] = await Promise.all([
        usewallet.getAccount(),
        usewallet.getPubKey(),
        usewallet.getUserInfo(true),
      ]);

      const { otherAccounts, wallet, loggedInAccounts } = await usewallet.openapi.freshUserInfo(
        currentWallet,
        keys,
        pubKTuple,
        walletData,
        isChild
      );

      await Promise.all([
        setOtherAccounts(otherAccounts),
        setUserInfo(wallet),
        setLoggedInAccounts(loggedInAccounts),
      ]);
    } catch (error) {
      console.error('Error in freshUserInfo:', error);
    } finally {
      setMainLoading(false);
    }
  }, [usewallet, setCurrent, setMainLoading, setUserInfo, setOtherAccounts, setLoggedInAccounts]);

  // 1. First called in index.ts, get the user info(name and avatar) and the main address
  const fetchProfileData = useCallback(async () => {
    try {
      const mainAddress = await usewallet.getMainAddress();
      if (mainAddress) {
        setMainAddress(mainAddress);
        try {
          const [evmRes, emoji] = await Promise.all([
            usewallet.queryEvmAddress(mainAddress),
            usewallet.getEmoji(),
          ]);

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

  // 2. Second called in index.ts, get all the address for this userunder the current network
  const freshUserWallet = useCallback(async () => {
    const wallet: WalletResponse[] = await usewallet.getUserWallets();
    const fData: WalletResponse[] = wallet.filter((item) => item.blockchain !== null);

    setUserWallet(fData);
    if (initialStart) {
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
    const formattedWallets = formatWallets(fData);
    setWalletList(formattedWallets);
  }, [usewallet, initialStart, setUserWallet, setInitial, formatWallets, setWalletList]);

  // 3. Third called in index.ts check the child account and set the child account
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
