import React, { useCallback, useEffect, useReducer } from 'react';
import { Redirect, useParams } from 'react-router-dom';

import { type TransactionState } from '@/shared/types/transaction-types';
import { type FlowAddress, type WalletAddress } from '@/shared/types/wallet-types';
import { isValidAddress, isValidEthereumAddress, isValidFlowAddress } from '@/shared/utils/address';
import { transactionReducer, INITIAL_TRANSACTION_STATE } from '@/ui/reducers/transaction-reducer';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from '@/ui/utils/WalletContext';

import SendToCadence from '../SendToCadence';
import SendToEvm from '../SendToEVM';

export const SendTo = () => {
  // Remove or use only in development
  console.log('SendTo');

  const wallet = useWallet();
  const { mainAddress, currentWallet, userInfo } = useProfileStore();
  const coinStore = useCoinStore();
  const { toAddress } = useParams<{ toAddress: string }>();

  // Move coins to a separate memoized value
  const coins = React.useMemo(() => coinStore.coins, [coinStore.coins]);

  const [transactionState, dispatch] = useReducer(transactionReducer, {
    ...INITIAL_TRANSACTION_STATE,
    toAddress: toAddress as WalletAddress,
    toContact: {
      id: 0,
      address: toAddress as WalletAddress,
      contact_name: '',
      username: '',
      avatar: '',
    },
    toNetwork: isValidEthereumAddress(toAddress) ? 'Evm' : 'Cadence',
  });

  const handleTokenChange = useCallback(
    async (address: string) => {
      const tokenInfo = await wallet.openapi.getTokenInfo(address);
      if (tokenInfo) {
        const coinInfo = coins.find(
          (coin) => coin.unit.toLowerCase() === tokenInfo.symbol.toLowerCase()
        );
        if (coinInfo) {
          dispatch({
            type: 'setSelectedToken',
            payload: {
              tokenInfo,
              coinInfo,
            },
          });
        }
      }
    },
    [wallet, coins] // Add coins as dependency
  );

  useEffect(() => {
    console.log('useEffect', mainAddress, currentWallet?.address);
    if (isValidFlowAddress(mainAddress) && isValidAddress(currentWallet?.address)) {
      dispatch({
        type: 'initTransactionState',
        payload: {
          rootAddress: mainAddress as FlowAddress,
          fromAddress: currentWallet.address as WalletAddress,
          fromContact: {
            id: 0,
            address: currentWallet.address as WalletAddress,
            contact_name: userInfo?.nickname || '',
            username: userInfo?.username || '',
            avatar: userInfo?.avatar || '',
          },
        },
      });
      // Setup the to address
      dispatch({
        type: 'setToAddress',
        payload: {
          address: toAddress as WalletAddress,
          contact: {
            id: 0,
            address: toAddress as WalletAddress,
            contact_name: '',
            username: '',
            avatar: '',
          },
        },
      });
      // Set the token to the default token
      handleTokenChange(INITIAL_TRANSACTION_STATE.selectedToken.symbol);
    }
  }, [
    mainAddress,
    currentWallet?.address,
    userInfo?.nickname,
    userInfo?.username,
    userInfo?.avatar,
    handleTokenChange,
    toAddress,
  ]);

  const handleAmountChange = useCallback(
    (amount: string) => {
      dispatch({
        type: 'setAmount',
        payload: amount,
      });
    },
    [dispatch]
  );

  const handleSwitchFiatOrCoin = useCallback(() => {
    dispatch({
      type: 'switchFiatOrCoin',
    });
  }, [dispatch]);

  const handleMaxClick = useCallback(() => {
    dispatch({
      type: 'setAmountToMax',
    });
  }, [dispatch]);

  if (isValidEthereumAddress(toAddress)) {
    return (
      <SendToEvm
        transactionState={transactionState}
        handleAmountChange={handleAmountChange}
        handleTokenChange={handleTokenChange}
        handleSwitchFiatOrCoin={handleSwitchFiatOrCoin}
        handleMaxClick={handleMaxClick}
      />
    );
  } else if (isValidFlowAddress(toAddress)) {
    return (
      <SendToCadence
        transactionState={transactionState}
        handleAmountChange={handleAmountChange}
        handleTokenChange={handleTokenChange}
        handleSwitchFiatOrCoin={handleSwitchFiatOrCoin}
        handleMaxClick={handleMaxClick}
      />
    );
  } else {
    // Should never happen...
    return null;
  }
};

export default SendTo;
