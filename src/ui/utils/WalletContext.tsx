import React, { type ReactNode, createContext, useContext } from 'react';
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
} | null>(null);

const WalletProvider = ({
  children,
  wallet,
}: {
  children?: ReactNode;
  wallet: WalletController;
}) => <WalletContext.Provider value={{ wallet }}>{children}</WalletContext.Provider>;

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

export { WalletProvider, useWalletOld, useWallet };
