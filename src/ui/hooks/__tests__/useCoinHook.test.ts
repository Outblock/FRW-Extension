import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCoinStore } from '@/ui/stores/useCoinStore';

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

// Mock the store with getState
vi.mock('@/ui/stores/useCoinStore', () => ({
  useCoinStore: vi.fn().mockImplementation(() => ({
    setCoinData: vi.fn(),
    setBalance: vi.fn(),
    setTotalFlow: vi.fn(),
    totalFlow: '0',
    setAvailableFlow: vi.fn(),
  })),
}));

// Mock the wallet context
vi.mock('@/ui/utils/WalletContext', () => ({
  useWallet: () => ({
    getMainWallet: vi.fn(),
    openapi: {
      getAccountMinFlow: vi.fn(),
    },
  }),
}));

// Mock Storage
const mockStorage = {
  get: vi.fn(),
};

vi.mock('@/background/webapi', () => ({
  storage: mockStorage,
}));

describe('useCoinHook', () => {
  beforeEach(() => {
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
        { unit: 'FLOW', total: '10.5', balance: '10.5' },
        { unit: 'flow', total: '5.5', balance: '5.5' }, // Duplicate, different case
        { unit: 'ETH', total: '2.0', balance: '2.0' },
      ];

      const { handleStorageData } = useCoinHook();
      await handleStorageData(mockData);

      expect(useCoinStore.getState().setCoinData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ unit: 'FLOW' }),
          expect.objectContaining({ unit: 'ETH' }),
        ])
      );

      expect(useCoinStore.getState().setTotalFlow).toHaveBeenCalledWith('10.5');
      expect(useCoinStore.getState().setBalance).toHaveBeenCalledWith('$ 18.00');
    });

    it('should handle null totals', async () => {
      const mockData = [
        { unit: 'FLOW', total: null, balance: '10' },
        { unit: 'ETH', total: '2.0', balance: '2.0' },
      ];

      const { handleStorageData } = useCoinHook();
      await handleStorageData(mockData);

      expect(useCoinStore.getState().setBalance).toHaveBeenCalledWith('$ 2.00');
    });
  });

  describe('refreshCoinData', () => {
    it('should handle empty data', async () => {
      mockStorage.get.mockResolvedValue(null);
      const { refreshCoinData } = useCoinHook();
      await refreshCoinData();
      expect(useCoinStore.getState().setCoinData).not.toHaveBeenCalled();
    });

    it('should process unique tokens and calculate totals', async () => {
      const mockData = [
        { unit: 'FLOW', total: '10.5', balance: '10.5' },
        { unit: 'flow', total: '5.5', balance: '5.5' },
        { unit: 'ETH', total: '2.0', balance: '2.0' },
      ];

      mockStorage.get.mockResolvedValue(mockData);
      const { refreshCoinData } = useCoinHook();
      await refreshCoinData();

      expect(useCoinStore.getState().setTotalFlow).toHaveBeenCalledWith('10.5');
      expect(useCoinStore.getState().setBalance).toHaveBeenCalledWith('$ 18.00');
    });

    it('should handle null totals', async () => {
      const mockData = [
        { unit: 'FLOW', total: null, balance: '10' },
        { unit: 'ETH', total: '2.0', balance: '2.0' },
      ];

      mockStorage.get.mockResolvedValue(mockData);
      const { refreshCoinData } = useCoinHook();
      await refreshCoinData();

      expect(useCoinStore.getState().setBalance).toHaveBeenCalledWith('$ 2.00');
    });
  });
});
