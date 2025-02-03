import { create } from 'zustand';

import { type LoggedInAccountWithIndex, type LoggedInAccount } from '@/shared/types/wallet-types';

import type { ChildAccount, WalletType, UserInfoResponse } from '../../shared/types/network-types';

interface ProfileState {
  mainAddress: string;
  evmAddress: string;
  userWallet: any | null;
  currentWalletIndex: number;
  evmWallet: WalletType;
  walletList: any[];
  initialStart: boolean;
  currentWallet: any;
  mainAddressLoading: boolean;
  childAccounts: ChildAccount;
  evmLoading: boolean;
  listLoading: boolean;
  userInfo: UserInfoResponse | null;
  otherAccounts: LoggedInAccountWithIndex[];
  loggedInAccounts: LoggedInAccount[];
  setMainAddress: (address: string) => void;
  setEvmAddress: (address: string) => void;
  setUserWallet: (wallet: any) => void;
  setCurrentWalletIndex: (index: number) => void;
  setEvmWallet: (wallet: WalletType) => void;
  setWalletList: (list: any[]) => void;
  setInitial: (initial: boolean) => void;
  setCurrent: (current: any) => void;
  setMainLoading: (mainAddressLoading: boolean) => void;
  setChildAccount: (childAccount: ChildAccount) => void;
  setEvmLoading: (evmLoading: boolean) => void;
  setListLoading: (listLoading: boolean) => void;
  setUserInfo: (info: UserInfoResponse | null) => void;
  setOtherAccounts: (accounts: any) => void;
  setLoggedInAccounts: (accounts: any) => void;
  clearProfileData: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  mainAddress: '',
  evmAddress: '',
  userWallet: null,
  currentWalletIndex: 0,
  evmWallet: {
    name: '',
    icon: '',
    address: '',
    chain_id: 'evm',
    id: 1,
    coins: ['flow'],
    color: '',
  },
  currentWallet: {},
  walletList: [],
  initialStart: true,
  mainAddressLoading: true,
  evmLoading: true,
  childAccounts: {},
  userInfo: null,
  otherAccounts: [],
  loggedInAccounts: [],
  listLoading: true,
  setMainAddress: (address) => set({ mainAddress: address }),
  setEvmAddress: (address) => set({ evmAddress: address }),
  setUserWallet: (wallet) => set({ userWallet: wallet }),
  setCurrentWalletIndex: (index) => set({ currentWalletIndex: index }),
  setEvmWallet: (wallet) => set({ evmWallet: wallet }),
  setWalletList: (list) => set({ walletList: list }),
  setInitial: (initial) => set({ initialStart: initial }),
  setCurrent: (current) => set({ currentWallet: current }),
  setMainLoading: (mainAddressLoading) => set({ mainAddressLoading: mainAddressLoading }),
  setChildAccount: (childAccount) => set({ childAccounts: childAccount }),
  setEvmLoading: (evmLoading) => set({ evmLoading: evmLoading }),
  setUserInfo: (info) => set({ userInfo: info }),
  setOtherAccounts: (accounts: LoggedInAccountWithIndex[]) => set({ otherAccounts: accounts }),
  setLoggedInAccounts: (accounts: LoggedInAccount[]) => set({ loggedInAccounts: accounts }),
  setListLoading: (listLoading) => set({ listLoading: listLoading }),
  clearProfileData: () =>
    set({
      mainAddress: '',
      evmAddress: '',
      userWallet: null,
      currentWalletIndex: 0,
      evmWallet: {
        name: '',
        icon: '',
        address: '',
        chain_id: 'evm',
        id: 1,
        coins: ['flow'],
        color: '',
      },
      walletList: [],
      initialStart: true,
      currentWallet: {},
      mainAddressLoading: true,
      childAccounts: {},
      evmLoading: true,
      listLoading: true,
      userInfo: null,
      otherAccounts: [],
      loggedInAccounts: [],
    }),
}));
