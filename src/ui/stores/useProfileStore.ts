import create from 'zustand';

interface ProfileState {
  mainAddress: string;
  evmAddress: string;
  setMainAddress: (address: string) => void;
  setEvmAddress: (address: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  mainAddress: '',
  evmAddress: '',
  setMainAddress: (address) => set({ mainAddress: address }),
  setEvmAddress: (address) => set({ evmAddress: address }),
}));
