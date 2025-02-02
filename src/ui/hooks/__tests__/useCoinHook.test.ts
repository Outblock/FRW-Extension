import { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCoinStore } from '@/ui/stores/coinStore';

import { useCoinHook } from '../useCoinHook';
// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useRef: vi.fn(),
    useEffect: vi.fn(),
    useCallback: vi.fn().mockImplementation((fn) => fn),
  };
});

// Mock the stores
vi.mock('@/ui/stores/useCoinStore', () => {
  const mockSetBalance = vi.fn();
  const mockSetCoinData = vi.fn();
  const mockSetTotalFlow = vi.fn();
  const mockSetAvailableFlow = vi.fn();

  return {
    useCoinStore: Object.assign(
      vi.fn().mockReturnValue({
        setCoinData: mockSetCoinData,
        setBalance: mockSetBalance,
        setTotalFlow: mockSetTotalFlow,
        totalFlow: '0',
        setAvailableFlow: mockSetAvailableFlow,
      }),
      {
        getState: () => ({
          setCoinData: mockSetCoinData,
          setBalance: mockSetBalance,
          setTotalFlow: mockSetTotalFlow,
          totalFlow: '0',
          setAvailableFlow: mockSetAvailableFlow,
        }),
      }
    ),
  };
});

vi.mock('@/ui/stores/useProfileStore', () => ({
  useProfileStore: vi.fn().mockReturnValue({
    mainAddress: 'test-address',
  }),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWalletLoaded: vi.fn().mockResolvedValue(true),
  useWallet: () => ({
    refreshCoinList: vi.fn().mockResolvedValue(undefined),
    getMainWallet: vi.fn(),
    openapi: {
      getAccountMinFlow: vi.fn(),
    },
  }),
}));

// Mock Storage
const mockStorage = {
  get: vi.fn().mockImplementation(() =>
    Promise.resolve([
      { unit: 'USDC.e', total: null, balance: null },
      { unit: 'FLOW', total: '5.0', balance: '5.0' },
      { unit: 'WFLOW', total: '2.0', balance: '2.0' },
    ])
  ),
};

vi.mock('@/background/webapi', () => ({
  storage: mockStorage,
}));

describe('useCoinHook', () => {
  let mockSetBalance: ReturnType<typeof vi.fn>;
  let mockSetCoinData: ReturnType<typeof vi.fn>;
  let mockSetTotalFlow: ReturnType<typeof vi.fn>;
  let mockSetAvailableFlow: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetBalance = vi.fn();
    mockSetCoinData = vi.fn();
    mockSetTotalFlow = vi.fn();
    mockSetAvailableFlow = vi.fn();

    vi.mocked(useCoinStore).mockReturnValue({
      setCoinData: mockSetCoinData,
      setBalance: mockSetBalance,
      setTotalFlow: mockSetTotalFlow,
      totalFlow: '0',
      setAvailableFlow: mockSetAvailableFlow,
    });

    vi.clearAllMocks();
  });

  describe('handleStorageData', () => {
    it('should handle empty data', async () => {
      const { handleStorageData } = useCoinHook();
      await handleStorageData(null);
      expect(useCoinStore.getState().setCoinData).not.toHaveBeenCalled();
    });

    it('should process unique tokens and calculate totals', async () => {
      const mockData = [
        { unit: 'USDC.e', total: null, balance: null },
        { unit: 'FLOW', total: '5.0', balance: '5.0' },
        { unit: 'WFLOW', total: '2.0', balance: '2.0' },
      ];

      const { handleStorageData } = useCoinHook();
      await handleStorageData(mockData);

      expect(mockSetTotalFlow).toHaveBeenCalledWith('5');
      expect(mockSetBalance).toHaveBeenCalledWith('$ 7.00');
      expect(mockSetCoinData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ unit: 'FLOW' }),
          expect.objectContaining({ unit: 'WFLOW' }),
        ])
      );
    });

    it('should handle null totals', async () => {
      const mockData = [
        { unit: 'FLOW', total: null, balance: '10' },
        { unit: 'ETH', total: '2.0', balance: '2.0' },
      ];

      const { handleStorageData } = useCoinHook();
      await handleStorageData(mockData);

      expect(mockSetBalance).toHaveBeenCalledWith('$ 2.00');
    });
  });

  describe('refreshCoinData', () => {
    beforeEach(() => {
      // Reset all mocks
      vi.clearAllMocks();

      // Mock useWallet
      vi.mock('@/ui/utils/WalletContext', () => ({
        useWalletLoaded: vi.fn().mockResolvedValue(true),

        useWallet: () => ({
          refreshCoinList: vi.fn().mockResolvedValue(undefined),
          getMainWallet: vi.fn(),
          openapi: {
            getAccountMinFlow: vi.fn(),
          },
        }),
      }));

      // Mock storage
      mockStorage.get.mockReset();
    });

    it('should handle empty data', async () => {
      mockStorage.get.mockResolvedValue(null);
      const { refreshCoinData } = useCoinHook();
      await refreshCoinData();
      expect(useCoinStore.getState().setCoinData).not.toHaveBeenCalled();
    });

    it('should handle null totals', async () => {
      const mockData = [
        { unit: 'USDC.e', total: null, balance: null },
        { unit: 'FLOW', total: '5.0', balance: '5.0' },
        { unit: 'WFLOW', total: '2.0', balance: '2.0' },
      ];

      mockStorage.get.mockResolvedValue(mockData);
      const { refreshCoinData } = useCoinHook();

      await act(async () => {
        await refreshCoinData();
        // Wait for all promises to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      console.log('Storage mock calls:', mockStorage.get.mock.calls);
      console.log('TotalFlow mock calls:', mockSetTotalFlow.mock.calls);
    });
  });
});
