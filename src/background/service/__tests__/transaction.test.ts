import type { TransactionStatus, TransactionExecutionStatus } from '@onflow/typedefs';
import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';

import transaction from '../transaction';

// Mock storage state
const mockStorageState = {
  local: new Map<string, any>(),
  session: new Map<string, any>(),
};

// Create storage handlers
const createStorageApis = (storageMap: Map<string, any>) => ({
  get: vi.fn((key?: string | string[] | undefined) => {
    if (!key) {
      return Promise.resolve(Object.fromEntries(storageMap));
    }
    if (typeof key === 'string') {
      const value = storageMap.get(key);
      return Promise.resolve({ [key]: value === undefined ? null : value });
    }
    const result = {};
    key.forEach((k) => {
      const value = storageMap.get(k);
      result[k] = value === undefined ? null : value;
    });
    return Promise.resolve(result);
  }),
  set: vi.fn((items: object) => {
    Object.entries(items).forEach(([key, value]) => {
      storageMap.set(key, value);
    });
    return Promise.resolve();
  }),
  remove: vi.fn((key: string) => {
    storageMap.delete(key);
    return Promise.resolve();
  }),
  clear: vi.fn(() => {
    storageMap.clear();
    return Promise.resolve();
  }),
});

// Mock chrome API
const chrome = {
  i18n: {
    getMessage: vi.fn((msg) => msg),
  },
  storage: {
    local: createStorageApis(mockStorageState.local),
    session: createStorageApis(mockStorageState.session),
  },
};

vi.stubGlobal('chrome', chrome);

// Initialize storage with default values
beforeAll(async () => {
  const defaultStore = {
    expiry: Date.now(),
    total: 0,
    transactionItem: {
      mainnet: [],
      crescendo: [],
      testnet: [],
    },
    pendingItem: {
      mainnet: [],
      crescendo: [],
      testnet: [],
    },
  };

  await chrome.storage.local.set({ transaction: defaultStore });
  await chrome.storage.session.set({ transaction: defaultStore });
});

describe('Transaction Service', () => {
  beforeEach(async () => {
    // Clear mock storage state
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();

    // Reset default values
    const defaultStore = {
      expiry: Date.now(),
      total: 0,
      transactionItem: {
        mainnet: [],
        crescendo: [],
        testnet: [],
      },
      pendingItem: {
        mainnet: [],
        crescendo: [],
        testnet: [],
      },
    };
    await chrome.storage.local.set({ transaction: defaultStore });
    await chrome.storage.session.set({ transaction: defaultStore });

    // Reset the service before each test
    await transaction.init();
    transaction.clear();

    // Clear mock call history
    vi.mocked(chrome.storage.local.set).mockClear();
    vi.mocked(chrome.storage.local.get).mockClear();
    vi.mocked(chrome.storage.session.set).mockClear();
    vi.mocked(chrome.storage.session.get).mockClear();
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', async () => {
      expect(transaction.store.total).toBe(0);
      expect(transaction.store.transactionItem.mainnet).toEqual([]);
      expect(transaction.store.transactionItem.testnet).toEqual([]);
      expect(transaction.store.transactionItem.crescendo).toEqual([]);
      expect(transaction.store.pendingItem.mainnet).toEqual([]);
      expect(transaction.store.pendingItem.testnet).toEqual([]);
      expect(transaction.store.pendingItem.crescendo).toEqual([]);
    });
  });

  describe('Pending Transactions', () => {
    test('should set pending transaction correctly', () => {
      const txId = '0x123';
      const address = '0xabc';
      const network = 'mainnet';
      const icon = 'test-icon';
      const title = 'Test Transaction';

      transaction.setPending(txId, address, network, icon, title);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0]).toMatchObject({
        hash: txId,
        sender: address,
        image: icon,
        title: title,
        status: 'PENDING',
        error: false,
      });
    });

    test('should not add duplicate pending transactions', () => {
      const txId = '0x123';
      const address = '0xabc';
      const network = 'mainnet';
      const icon = 'test-icon';
      const title = 'Test Transaction';

      transaction.setPending(txId, address, network, icon, title);
      transaction.setPending(txId, address, network, icon, title);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems).toHaveLength(1);
    });

    test('should update pending transaction status', () => {
      const txId = '0x123';
      const network = 'mainnet';

      transaction.setPending(txId, '0xabc', network, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'CONFIRMED',
        statusCode: 0,
        errorMessage: '',
        events: [],
      };

      transaction.updatePending(txId, network, status);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems[0].status).toBe('CONFIRMED');
      expect(pendingItems[0].error).toBe(false);
    });

    test('should mark transaction as error when status code is 1', () => {
      const txId = '0x123';
      const network = 'mainnet';

      transaction.setPending(txId, '0xabc', network, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 5 as TransactionExecutionStatus,
        statusString: 'FAILED',
        statusCode: 1,
        errorMessage: 'Transaction failed',
        events: [],
      };

      transaction.updatePending(txId, network, status);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems[0].error).toBe(true);
    });

    test('should remove pending transaction', () => {
      const txId = '0x123';
      const address = '0xabc';
      const network = 'mainnet';

      transaction.setPending(txId, address, network, 'icon', 'title');
      transaction.removePending(txId, address, network);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems).toHaveLength(0);
    });

    test('should clear all pending transactions for a network', () => {
      const network = 'mainnet';

      transaction.setPending('tx1', 'addr1', network, 'icon1', 'title1');
      transaction.setPending('tx2', 'addr2', network, 'icon2', 'title2');

      transaction.clearPending(network);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems).toHaveLength(0);
    });
  });

  describe('Transaction Management', () => {
    test('should set transactions correctly', () => {
      const network = 'mainnet';
      const mockData = {
        transactions: [
          {
            sender: '0xsender',
            receiver: '0xreceiver',
            time: 123456789,
            status: 'SEALED',
            txid: '0xtx1',
            error: false,
            image: 'test-image',
            amount: '100',
            title: 'Test Transaction',
            token: 'FLOW',
            type: 1,
            transfer_type: 1,
          },
        ],
        total: 1,
      };

      transaction.setTransaction(mockData, network);

      const transactions = transaction.listTransactions(network);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toMatchObject({
        sender: '0xsender',
        receiver: '0xreceiver',
        hash: '0xtx1',
        status: 'SEALED',
        token: 'FLOW',
      });
      expect(transaction.getCount()).toBe(1);
    });

    test('should handle empty transaction data', () => {
      const network = 'mainnet';
      const mockData = {
        transactions: [],
        total: 0,
      };

      transaction.setTransaction(mockData, network);

      const transactions = transaction.listTransactions(network);
      expect(transactions).toHaveLength(0);
      expect(transaction.getCount()).toBe(0);
    });
  });

  describe('Expiry Management', () => {
    test('should set and get expiry correctly', () => {
      const expiry = Date.now();
      transaction.setExpiry(expiry);
      expect(transaction.getExpiry()).toBe(expiry);
    });
  });
});
