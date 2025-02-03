import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Object } from 'ts-toolbelt';

import type { WalletController as WalletControllerClass } from 'background/controller/wallet';

import type { IExtractFromPromise } from '../../shared/utils/type';

export type WalletControllerType = Object.Merge<
  {
    [key in keyof WalletControllerClass]: WalletControllerClass[key] extends (
      ...args: infer ARGS
    ) => infer RET
      ? <T extends IExtractFromPromise<RET> = IExtractFromPromise<RET>>(
          ...args: ARGS
        ) => Promise<IExtractFromPromise<T>>
      : WalletControllerClass[key];
  },
  Record<string, <T = any>(...params: any) => Promise<T>>
>;

export type WalletController = Object.Merge<
  {
    openapi: {
      [key: string]: (...params: any) => Promise<any>;
    };
  },
  Record<string, (...params: any) => Promise<any>>
>;

const WalletContext = createContext<{
  wallet: WalletController;
  loaded: boolean;
} | null>(null);

const WalletProvider = ({
  children,
  wallet,
}: {
  children?: ReactNode;
  wallet: WalletController;
}) => {
  const [walletInitialized, setWalletInitialized] = useState(false);

  useEffect(() => {
    const checkWalletInitialized = async () => {
      const walletInitialized = await wallet.isLoaded();
      if (walletInitialized) {
        console.log(
          'WalletProvider - checkWalletInitialized - setWalletInitialized ->',
          walletInitialized
        );
        setWalletInitialized(true);
      }
    };
    checkWalletInitialized();
  }, [wallet]);

  const walletInitializedListener = (msg: any, sender: any, sendResponse: any) => {
    if (msg.type === 'walletInitialized') {
      // eslint-disable-next-line no-console
      console.log('WalletProvider - got the message!! ->', msg);
      setWalletInitialized(true);
    }
  };
  useEffect(() => {
    let walletListener: typeof walletInitializedListener | null = null;
    if (!walletInitialized) {
      walletListener = walletInitializedListener;
      chrome.runtime.onMessage.addListener(walletListener);
    } else if (walletListener) {
      chrome.runtime.onMessage.removeListener(walletListener);
      walletListener = null;
    }
    return () => {
      if (walletListener) {
        chrome.runtime.onMessage.removeListener(walletListener);
        walletListener = null;
      }
    };
  }, [walletInitialized]);

  return (
    <WalletContext.Provider value={{ wallet, loaded: walletInitialized }}>
      {children}
    </WalletContext.Provider>
  );
};

/**
 * @deprecated The method should not be used
 */
const useWalletOld = () => {
  const { wallet } = useContext(WalletContext) as {
    wallet: WalletController;
  };

  return wallet;
};

const useWallet = () => {
  const { wallet } = useContext(WalletContext) as unknown as {
    wallet: WalletControllerType;
  };

  return wallet;
};

const useWalletLoaded = () => {
  const { loaded } = useContext(WalletContext) as unknown as {
    loaded: boolean;
  };

  return loaded;
};

export { WalletProvider, useWalletOld, useWallet, useWalletLoaded };
