import { useState } from 'react';
import create from 'zustand';

interface WalletType {
  name: string;
  icon: string;
  address: string;
  chain_id: string;
  id: number;
  coins: string[];
  color: string;
}

export interface WalletResponse {
  color: string;
  icon: string;
  name: string;
  chain_id: string;
  wallet_id: number;
  blockchain: Array<BlockchainResponse>;
}

export interface BlockchainResponse {
  name: string;
  address: string;
  chain_id: string;
  coins: Array<string>;
  id: number;
  icon: string;
  color: string;
}

interface ProfileState {
  mainAddress: string;
  evmAddress: string;
  userWallet: any | null;
  currentWallet: number;
  evmWallet: WalletType;
  walletList: any[];
  initialStart: boolean;
  current: any;
  setMainAddress: (address: string) => void;
  setEvmAddress: (address: string) => void;
  setUserWallet: (wallet: any) => void;
  setCurrentWallet: (index: number) => void;
  setEvmWallet: (wallet: WalletType) => void;
  setWalletList: (list: any[]) => void;
  setInitial: (initial: boolean) => void;
  setCurrent: (current: any) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  mainAddress: '',
  evmAddress: '',
  userWallet: null,
  currentWallet: 0,
  evmWallet: {
    name: '',
    icon: '',
    address: '',
    chain_id: 'evm',
    id: 1,
    coins: ['flow'],
    color: '',
  },
  current: {},
  walletList: [],
  initialStart: true,
  setMainAddress: (address) => set({ mainAddress: address }),
  setEvmAddress: (address) => set({ evmAddress: address }),
  setUserWallet: (wallet) => set({ userWallet: wallet }),
  setCurrentWallet: (index) => set({ currentWallet: index }),
  setEvmWallet: (wallet) => set({ evmWallet: wallet }),
  setWalletList: (list) => set({ walletList: list }),
  setInitial: (initial) => set({ initialStart: initial }),
  setCurrent: (current) => set({ current: current }),
}));
