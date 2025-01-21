import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useNetworkStore } from '@/ui/stores/useNetworkStore';

import { useNetworkHook } from '../useNetworkHook';

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn().mockImplementation((fn) => fn),
  };
});

// Mock the store
vi.mock('@/ui/stores/useNetworkStore', () => ({
  useNetworkStore: vi.fn().mockImplementation(() => ({
    setNetwork: vi.fn(),
  })),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWallet: vi.fn().mockReturnValue({
    getNetwork: vi.fn().mockResolvedValue('mainnet'),
    openapi: {
      store: {},
      setHost: vi.fn(),
      getHost: vi.fn(),
      init: vi.fn(),
    },
    boot: vi.fn(),
    isBooted: vi.fn(),
    loadMemStore: vi.fn(),
  }),
}));

describe('useNetworkHook', () => {
  let mockGetNetwork: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetNetwork = vi.fn().mockResolvedValue('mainnet');
    vi.clearAllMocks();
  });

  describe('fetchNetwork', () => {
    it('should fetch and set network', async () => {
      const { fetchNetwork } = useNetworkHook();
      await fetchNetwork();

      const { setNetwork } = useNetworkStore();
      expect(setNetwork).toHaveBeenCalledWith('mainnet');
    });

    it('should handle network fetch error', async () => {
      const mockError = new Error('Network error');
      mockGetNetwork.mockRejectedValueOnce(mockError);

      const { fetchNetwork } = useNetworkHook();
      await expect(fetchNetwork()).rejects.toThrow('Network error');
    });

    it('should update network when wallet changes', async () => {
      mockGetNetwork.mockResolvedValueOnce('testnet');
      const { fetchNetwork } = useNetworkHook();
      await fetchNetwork();

      const { setNetwork } = useNetworkStore();
      expect(setNetwork).toHaveBeenCalledWith('testnet');
    });
  });
});
