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
  useNetworkStore: vi.fn().mockReturnValue({
    setNetwork: vi.fn(),
  }),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWallet: vi.fn().mockReturnValue({
    getNetwork: vi.fn().mockResolvedValue('mainnet'),
  }),
}));

describe('useNetworkHook', () => {
  let mockSetNetwork: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetNetwork = vi.fn();
    vi.mocked(useNetworkStore).mockReturnValue({
      setNetwork: mockSetNetwork,
    });
  });

  describe('fetchNetwork', () => {
    it('should correctly identify network type', async () => {
      const { fetchNetwork } = useNetworkHook();
      await fetchNetwork();

      expect(mockSetNetwork).toHaveBeenCalledWith(expect.stringMatching(/^(mainnet|testnet)$/));
    });
  });
});
