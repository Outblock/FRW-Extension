import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from '@/ui/utils/WalletContext';

import { useProfileHook } from '../useProfileHook';

// All vi.mock calls must be at the top level
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn().mockImplementation((fn) => fn),
  };
});

vi.mock('@/ui/stores/useNetworkStore', () => ({
  useNetworkStore: vi.fn().mockReturnValue({
    currentNetwork: 'mainnet',
  }),
}));

const mocks = {
  setMainAddress: vi.fn(),
  setEvmAddress: vi.fn(),
  setEvmWallet: vi.fn(),
};

vi.mock('@/ui/stores/useProfileStore', () => ({
  useProfileStore: vi.fn().mockReturnValue({
    setMainAddress: vi.fn(),
    setEvmAddress: vi.fn(),
    setEvmWallet: vi.fn(),
    setUserWallet: vi.fn(),
    setCurrent: vi.fn(),
    setChildAccount: vi.fn(),
    setUserInfo: vi.fn(),
    setOtherAccounts: vi.fn(),
    setLoggedInAccounts: vi.fn(),
    setMainLoading: vi.fn(),
    setEvmLoading: vi.fn(),
    setInitial: vi.fn(),
    initialStart: true,
  }),
}));

vi.mock('@/ui/utils/WalletContext', () => ({
  useWalletLoaded: vi.fn().mockResolvedValue(true),
  useWallet: () => ({
    getMainAddress: vi.fn().mockResolvedValue('0x138c20de202897fb'),
    queryEvmAddress: vi.fn().mockResolvedValue('0x0000000000000000000000022888571dfacf27b4'),
    getEvmWallet: vi.fn().mockResolvedValue({
      name: 'Test Wallet',
      address: '0x0000000000000000000000022888571dfacf27b4',
      evmAddress: '0x0000000000000000000000022888571dfacf27b4',
      type: 'evm',
      blockchain: 'evm',
    }),
    getAccount: vi.fn().mockResolvedValue({
      name: 'Test Account',
      address: '0x138c20de202897fb',
    }),
    getPubKey: vi.fn().mockResolvedValue('test-pub-key'),
    getEmoji: vi.fn().mockReturnValue(
      Array(10)
        .fill(null)
        .map((_, i) => ({
          name: `Emoji ${i}`,
          emoji: '😀',
          bgcolor: '#FF9500',
        }))
    ),
    getUserWallets: vi.fn().mockResolvedValue([
      {
        blockchain: 'flow',
        address: '0x138c20de202897fb',
        chain_id: '1',
      },
    ]),
    getCurrentWallet: vi.fn().mockResolvedValue({
      name: 'Test Wallet',
      address: '0x138c20de202897fb',
      type: 'flow',
      blockchain: 'flow',
    }),
    getActiveWallet: vi.fn().mockResolvedValue({
      name: 'Test Wallet',
      address: '0x138c20de202897fb',
      type: 'flow',
      blockchain: 'flow',
    }),
    getUserInfo: vi.fn().mockResolvedValue({
      name: 'Test User',
      accounts: ['account1', 'account2'],
      loggedInAccounts: ['account1'],
    }),
    refreshCoinList: vi.fn().mockResolvedValue(undefined),
    checkUserChildAccount: vi.fn().mockResolvedValue({
      address: '0x123',
      type: 'child',
    }),
    setChildWallet: vi.fn(),
    openapi: {
      getAccountMinFlow: vi.fn(),
      putDeviceInfo: vi.fn().mockResolvedValue(undefined),
      freshUserInfo: vi.fn().mockResolvedValue({
        name: 'Test User',
        accounts: ['account1', 'account2'],
        loggedInAccounts: ['account1'],
      }),
    },
  }),
}));

describe('useProfileHook', () => {
  beforeEach(() => {
    vi.mocked(useProfileStore).mockReturnValue({
      setMainAddress: mocks.setMainAddress,
      setEvmAddress: mocks.setEvmAddress,
      setEvmWallet: mocks.setEvmWallet,
      setUserWallet: vi.fn(),
      setCurrent: vi.fn(),
      setChildAccount: vi.fn(),
      setUserInfo: vi.fn(),
      setOtherAccounts: vi.fn(),
      setLoggedInAccounts: vi.fn(),
      setMainLoading: vi.fn(),
      setEvmLoading: vi.fn(),
      setInitial: vi.fn(),
      initialStart: true,
    });
    vi.clearAllMocks();
  });

  it('should fetch and set profile data', async () => {
    const { fetchProfileData } = useProfileHook();
    await act(async () => {
      await fetchProfileData();
    });

    expect(mocks.setMainAddress).toHaveBeenCalledWith('0x138c20de202897fb');
    expect(mocks.setEvmAddress).toHaveBeenCalledWith('0x0000000000000000000000022888571dfacf27b4');
    expect(mocks.setEvmWallet).toHaveBeenCalledWith({
      name: 'Emoji 9',
      address: '0x0000000000000000000000022888571dfacf27b4',
      evmAddress: '0x0000000000000000000000022888571dfacf27b4',
      icon: '😀',
      color: '#FF9500',
      chain_id: '1',
      id: 1,
      coins: [],
      type: 'evm',
      blockchain: 'evm',
    });
  });

  describe('freshUserWallet', () => {
    it('should update user wallet data', async () => {
      const mockSetWalletList = vi.fn();
      const mockSetUserWallet = vi.fn();

      vi.mocked(useProfileStore).mockReturnValueOnce({
        setMainAddress: vi.fn(),
        setEvmAddress: vi.fn(),
        setEvmWallet: vi.fn(),
        setUserWallet: mockSetUserWallet,
        setCurrent: vi.fn(),
        setChildAccount: vi.fn(),
        setUserInfo: vi.fn(),
        setOtherAccounts: vi.fn(),
        setLoggedInAccounts: vi.fn(),
        setMainLoading: vi.fn(),
        setEvmLoading: vi.fn(),
        setInitial: vi.fn(),
        setWalletList: mockSetWalletList,
        initialStart: true,
      });

      const { freshUserWallet } = useProfileHook();
      await act(async () => {
        await freshUserWallet();
      });

      expect(mockSetWalletList).toHaveBeenCalled();
      expect(mockSetUserWallet).toHaveBeenCalled();
    });
  });

  describe('freshUserInfo', () => {
    it('should update user info and accounts', async () => {
      const mockSetUserInfo = vi.fn();
      const mockSetOtherAccounts = vi.fn();
      const mockSetLoggedInAccounts = vi.fn();

      // Mock the profile store
      vi.mocked(useProfileStore).mockReturnValueOnce({
        setMainAddress: vi.fn(),
        setEvmAddress: vi.fn(),
        setEvmWallet: vi.fn(),
        setUserWallet: vi.fn(),
        setCurrent: vi.fn(),
        setChildAccount: vi.fn(),
        setUserInfo: mockSetUserInfo,
        setOtherAccounts: mockSetOtherAccounts,
        setLoggedInAccounts: mockSetLoggedInAccounts,
        setMainLoading: vi.fn(),
        setEvmLoading: vi.fn(),
        setInitial: vi.fn(),
        setWalletList: vi.fn(),
        initialStart: true,
      });

      const { fetchUserWallet } = useProfileHook();
      await act(async () => {
        await fetchUserWallet();
      });

      expect(mockSetUserInfo).toHaveBeenCalled();
      expect(mockSetOtherAccounts).toHaveBeenCalled();
      expect(mockSetLoggedInAccounts).toHaveBeenCalled();
    });
  });
});
