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
  runtime: {
    sendMessage: vi.fn(),
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

    test('should update pending transaction status and handle EVM transaction IDs', () => {
      const txId = '0x123';
      const network = 'mainnet';

      transaction.setPending(txId, '0xabc', network, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'CONFIRMED',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4], // This will be converted to hex
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 0,
          },
          {
            type: 'EVM.SomethingElse',
            data: {
              hash: [5, 6, 7, 8], // This will be converted to hex
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 1,
          },
        ],
      };

      const updatedHash = transaction.updatePending(txId, network, status);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems[0].status).toBe('CONFIRMED');
      expect(pendingItems[0].error).toBe(false);
      expect(pendingItems[0].cadenceTxId).toBe(txId);
      expect(pendingItems[0].evmTxIds).toHaveLength(2);
      expect(pendingItems[0].evmTxIds![0]).toMatch(/^0x[0-9a-f]+$/);
      expect(pendingItems[0].evmTxIds![1]).toMatch(/^0x[0-9a-f]+$/);
      expect(updatedHash).toBe(`${txId}_${pendingItems[0].evmTxIds!.join('_')}`);
    });

    test('should not duplicate EVM transaction IDs', () => {
      const txId = '0x123';
      const network = 'mainnet';

      transaction.setPending(txId, '0xabc', network, 'icon', 'title');

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'CONFIRMED',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 0,
          },
          {
            type: 'EVM.SomethingElse',
            data: {
              hash: [1, 2, 3, 4], // Same hash as above
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: txId,
            transactionIndex: 0,
            eventIndex: 1,
          },
        ],
      };

      transaction.updatePending(txId, network, status);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems[0].evmTxIds).toHaveLength(1);
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

    test('should remove pending transaction when matching cadence or evm id', () => {
      const cadenceTxId = '0x123';
      const network = 'mainnet';

      // Set up a pending transaction
      transaction.setPending(cadenceTxId, '0xabc', network, 'icon', 'title');

      // Update it with EVM transactions to create a composite hash
      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'CONFIRMED',
        statusCode: 0,
        errorMessage: '',
        events: [
          {
            type: 'EVM.Something',
            data: {
              hash: [1, 2, 3, 4],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: cadenceTxId,
            transactionIndex: 0,
            eventIndex: 0,
          },
          {
            type: 'EVM.SomethingElse',
            data: {
              hash: [5, 6, 7, 8],
            },
            blockId: '123',
            blockHeight: 1,
            blockTimestamp: '2024-01-01T00:00:00.000Z',
            transactionId: cadenceTxId,
            transactionIndex: 0,
            eventIndex: 1,
          },
        ],
      };

      transaction.updatePending(cadenceTxId, network, status);
      const pendingItems = transaction.listPending(network);
      const evmTxId = pendingItems[0].evmTxIds![0]; // Get one of the EVM tx IDs

      // Should remove when using cadence ID
      transaction.removePending(cadenceTxId, '0xabc', network);
      expect(transaction.listPending(network)).toHaveLength(0);

      // Set up another pending transaction
      transaction.setPending(cadenceTxId, '0xabc', network, 'icon', 'title');
      transaction.updatePending(cadenceTxId, network, status);

      // Should remove when using EVM ID
      transaction.removePending(evmTxId, '0xabc', network);
      expect(transaction.listPending(network)).toHaveLength(0);
    });

    test('should handle large number of EVM transactions in one cadence transaction', () => {
      const cadenceTxId = '0x123';
      const network = 'mainnet';
      const numEvmTxs = 50;

      transaction.setPending(cadenceTxId, '0xabc', network, 'icon', 'title');

      // Create status with 50 EVM transactions
      const events = Array.from({ length: numEvmTxs }, (_, i) => ({
        type: 'EVM.Something',
        data: {
          hash: [i + 1, i + 2, i + 3, i + 4], // Different hash for each event
        },
        blockId: '123',
        blockHeight: 1,
        blockTimestamp: '2024-01-01T00:00:00.000Z',
        transactionId: cadenceTxId,
        transactionIndex: 0,
        eventIndex: i,
      }));

      const status: TransactionStatus = {
        blockId: '123',
        status: 4 as TransactionExecutionStatus,
        statusString: 'CONFIRMED',
        statusCode: 0,
        errorMessage: '',
        events,
      };

      const updatedHash = transaction.updatePending(cadenceTxId, network, status);

      const pendingItems = transaction.listPending(network);
      expect(pendingItems[0].evmTxIds).toHaveLength(numEvmTxs);
      expect(pendingItems[0].cadenceTxId).toBe(cadenceTxId);

      // Verify the composite hash format
      const hashParts = updatedHash.split('_');
      expect(hashParts).toHaveLength(numEvmTxs + 1); // cadence tx id + 50 evm tx ids
      expect(hashParts[0]).toBe(cadenceTxId);
      hashParts.slice(1).forEach((hash) => {
        expect(hash).toMatch(/^0x[0-9a-f]+$/);
      });

      // Verify we can still remove it using any of the IDs
      transaction.removePending(pendingItems[0].evmTxIds![25], '0xabc', network); // Try removing using a middle EVM tx ID
      expect(transaction.listPending(network)).toHaveLength(0);
    });
  });

  describe('Transaction Management', () => {
    test('should set transactions correctly with indexed flag', () => {
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
        indexed: true,
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
