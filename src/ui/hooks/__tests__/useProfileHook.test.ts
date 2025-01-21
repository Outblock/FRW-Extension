import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WalletController } from '@/background/controller/wallet';
import { useProfileStore } from '@/ui/stores/useProfileStore';

import { useProfileHook } from '../useProfileHook';

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn().mockImplementation((fn) => fn),
  };
});

// Mock the store
vi.mock('@/ui/stores/useProfileStore', () => ({
  useProfileStore: vi.fn().mockImplementation(() => ({
    setMainAddress: vi.fn(),
    setEvmAddress: vi.fn(),
    setUserWallet: vi.fn(),
    setEvmWallet: vi.fn(),
    setCurrent: vi.fn(),
    setChildAccount: vi.fn(),
    setUserInfo: vi.fn(),
    setOtherAccounts: vi.fn(),
    setLoggedInAccounts: vi.fn(),
    setMainLoading: vi.fn(),
    setEvmLoading: vi.fn(),
    setInitial: vi.fn(),
    initialStart: true,
  })),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWallet: () => ({
    getMainAddress: vi.fn().mockResolvedValue('0x123'),
    queryEvmAddress: vi.fn().mockResolvedValue('0x456'),
    getUserWallets: vi.fn().mockResolvedValue([]),
    getCurrentWallet: vi.fn().mockResolvedValue({}),
    getActiveWallet: vi.fn().mockResolvedValue(false),
    getEvmWallet: vi.fn().mockResolvedValue({}),
    returnMainWallet: vi.fn().mockResolvedValue({}),
    getAccount: vi.fn().mockResolvedValue([]),
    getPubKey: vi.fn().mockResolvedValue([]),
    getUserInfo: vi.fn().mockResolvedValue({}),
    boot: vi.fn().mockImplementation(async (password: any) => Promise.resolve(undefined)),
    isBooted: vi.fn().mockResolvedValue(true),
    loadMemStore: vi.fn().mockResolvedValue(undefined),
    openapi: {
      freshUserInfo: vi.fn().mockResolvedValue({
        otherAccounts: [],
        wallet: {},
        loggedInAccounts: [],
      }),
    },
  }),
}));

describe('useProfileHook', () => {
  let mockGetMainAddress: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetMainAddress = vi.fn().mockResolvedValue('0x123');
    vi.clearAllMocks();
  });

  describe('fetchProfileData', () => {
    it('should fetch and set profile data', async () => {
      const { fetchProfileData } = useProfileHook();
      await fetchProfileData();

      const { setMainAddress, setEvmAddress, setEvmWallet } = useProfileStore();
      expect(setMainAddress).toHaveBeenCalledWith('0x123');
      expect(setEvmAddress).toHaveBeenCalledWith('0x456');
      expect(setEvmWallet).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Failed to fetch');
      mockGetMainAddress.mockRejectedValueOnce(mockError);

      const { fetchProfileData } = useProfileHook();
      await fetchProfileData();

      const { setMainAddress } = useProfileStore();
      expect(setMainAddress).not.toHaveBeenCalled();
    });
  });

  describe('freshUserWallet', () => {
    let mockGetUserWallets: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockGetUserWallets = vi.fn().mockResolvedValue([]);
    });

    it('should update user wallet data', async () => {
      const mockWallets = [{ blockchain: [{ address: '0x789' }], chain_id: '1' }];
      mockGetUserWallets.mockResolvedValueOnce(mockWallets);

      const { freshUserWallet } = useProfileHook();
      await freshUserWallet();

      const { setUserWallet } = useProfileStore();
      expect(setUserWallet).toHaveBeenCalledWith(mockWallets);
    });
  });

  describe('freshUserInfo', () => {
    it('should update user info and accounts', async () => {
      const { fetchUserWallet } = useProfileHook();
      await fetchUserWallet();

      const { setUserInfo, setOtherAccounts, setLoggedInAccounts } = useProfileStore();
      expect(setUserInfo).toHaveBeenCalled();
      expect(setOtherAccounts).toHaveBeenCalled();
      expect(setLoggedInAccounts).toHaveBeenCalled();
    });
  });
});
