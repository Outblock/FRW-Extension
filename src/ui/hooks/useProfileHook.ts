import { useCallback } from 'react';

import type { ChildAccount, WalletType, WalletResponse } from '@/shared/types/network-types';
import { ensureEvmAddressPrefix, withPrefix } from '@/shared/utils/address';
import { useNetworkStore } from '@/ui/stores/useNetworkStore';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useWallet, useWalletLoaded } from '@/ui/utils/WalletContext';

export const useProfileHook = () => {
  const usewallet = useWallet();
  const walletLoaded = useWalletLoaded();
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

  // Helper function to handle EVM wallet setup
  const setupEvmWallet = useCallback(
    async (mainAddress: string) => {
      try {
        const [evmRes, emoji, evmWallet] = await Promise.all([
          usewallet.queryEvmAddress(mainAddress),
          usewallet.getEmoji(),
          usewallet.getEvmWallet(),
        ]);

        const evmAddress = ensureEvmAddressPrefix(evmRes!);

        // Setup EVM wallet data
        const evmWalletData: WalletType = {
          ...evmWallet,
          name: emoji[9].name,
          icon: emoji[9].emoji,
          address: evmAddress,
          chain_id: '1',
          id: 1,
          coins: [],
          color: emoji[9].bgcolor,
        };

        // Batch updates
        await Promise.all([setEvmWallet(evmWalletData), setEvmAddress(evmAddress)]);
        setEvmLoading(false);

        return evmWalletData;
      } catch (error) {
        console.error('Error setting up EVM wallet:', error);
        throw error;
      }
    },
    [usewallet, setEvmWallet, setEvmAddress, setEvmLoading]
  );

  // Helper function for fetchUserWallet
  const freshUserInfo = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    try {
      const [currentWallet, isChild, mainAddress] = await Promise.all([
        usewallet.getCurrentWallet(),
        usewallet.getActiveWallet(),
        usewallet.getMainAddress(),
      ]);

      if (isChild === 'evm') {
        await setupEvmWallet(mainAddress!);
      } else if (isChild) {
        await setCurrent(currentWallet);
      } else {
        const mainwallet = await usewallet.returnMainWallet();
        await setCurrent(mainwallet);
      }

      const [keys, pubKTuple] = await Promise.all([usewallet.getAccount(), usewallet.getPubKey()]);

      // Separate getUserInfo with retry since it depends on address from cadence and userinfo from openapi
      let walletData;
      try {
        walletData = await retryOperation(
          () => usewallet.getUserInfo(true),
          3, // max attempts
          1000 // delay between attempts
        );
      } catch (error) {
        console.error('All attempts failed to get user info:', error);
        throw error;
      }

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
  }, [
    usewallet,
    walletLoaded,
    setLoggedInAccounts,
    setOtherAccounts,
    setUserInfo,
    setCurrent,
    setupEvmWallet,
    setMainLoading,
  ]);

  // 1. First called in index.ts, get the user info(name and avatar) and the main address
  const fetchProfileData = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    try {
      const mainAddress = await usewallet.getMainAddress();
      if (mainAddress) {
        setMainAddress(mainAddress);
        await setupEvmWallet(mainAddress);
      }
    } catch (err) {
      console.error('fetchProfileData err', err);
    }
  }, [usewallet, setMainAddress, setupEvmWallet, walletLoaded]);

  // 2. Second called in index.ts, get all the address for this userunder the current network
  const freshUserWallet = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    const wallet: WalletResponse[] = await usewallet.getUserWallets();
    const fData: WalletResponse[] = wallet.filter((item) => item.blockchain !== null);

    setUserWallet(fData);
    if (initialStart) {
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
    const formattedWallets = formatWallets(fData);
    setWalletList(formattedWallets);
  }, [
    usewallet,
    initialStart,
    setUserWallet,
    setInitial,
    formatWallets,
    setWalletList,
    walletLoaded,
  ]);

  // 3. Third called in index.ts check the child account and set the child account
  const fetchUserWallet = useCallback(async () => {
    if (!usewallet || !walletLoaded) return;
    freshUserInfo();
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    setChildAccount(childresp);
    usewallet.setChildWallet(childresp);
  }, [freshUserInfo, usewallet, setChildAccount, walletLoaded]);

  return {
    fetchProfileData,
    freshUserWallet,
    fetchUserWallet,
  };
};

const retryOperation = async (operation: () => Promise<any>, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
