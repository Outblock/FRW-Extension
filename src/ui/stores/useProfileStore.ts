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

interface Thumbnail {
  url: string;
}

interface AccountDetails {
  name: string;
  description: string;
  thumbnail: Thumbnail;
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

export interface ChildAccount {
  [key: string]: AccountDetails;
}

export interface UserInfoResponse {
  avatar: string;
  nickname: string;
  username: string;
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
  mainAddressLoading: boolean;
  childAccounts: ChildAccount;
  evmLoading: boolean;
  userInfo: UserInfoResponse | null;
  otherAccounts: any | null;
  loggedInAccounts: any | null;
  setMainAddress: (address: string) => void;
  setEvmAddress: (address: string) => void;
  setUserWallet: (wallet: any) => void;
  setCurrentWallet: (index: number) => void;
  setEvmWallet: (wallet: WalletType) => void;
  setWalletList: (list: any[]) => void;
  setInitial: (initial: boolean) => void;
  setCurrent: (current: any) => void;
  setMainLoading: (loading: boolean) => void;
  setChildAccount: (childAccount: ChildAccount) => void;
  setEvmLoading: (loading: boolean) => void;
  setUserInfo: (info: UserInfoResponse | null) => void;
  setOtherAccounts: (accounts: any) => void;
  setLoggedInAccounts: (accounts: any) => void;
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
  mainAddressLoading: true,
  evmLoading: true,
  childAccounts: {},
  userInfo: null,
  otherAccounts: null,
  loggedInAccounts: null,
  setMainAddress: (address) => set({ mainAddress: address }),
  setEvmAddress: (address) => set({ evmAddress: address }),
  setUserWallet: (wallet) => set({ userWallet: wallet }),
  setCurrentWallet: (index) => set({ currentWallet: index }),
  setEvmWallet: (wallet) => set({ evmWallet: wallet }),
  setWalletList: (list) => set({ walletList: list }),
  setInitial: (initial) => set({ initialStart: initial }),
  setCurrent: (current) => set({ current: current }),
  setMainLoading: (loading) => set({ mainAddressLoading: loading }),
  setChildAccount: (childAccount) => set({ childAccounts: childAccount }),
  setEvmLoading: (loading) => set({ evmLoading: loading }),
  setUserInfo: (info) => set({ userInfo: info }),
  setOtherAccounts: (accounts) => set({ otherAccounts: accounts }),
  setLoggedInAccounts: (accounts) => set({ loggedInAccounts: accounts }),
}));
