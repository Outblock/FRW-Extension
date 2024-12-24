import { type NFTModel, type NFTData } from './networkModel';

const EMULATOR_HOST = 'http://localhost:8888';

class EmulatorService {
  // Transaction related
  async getTransfers(address: string, cursor: string, limit: number) {
    try {
      const response = await fetch(
        `${EMULATOR_HOST}/v1/accounts/${address}/transactions?limit=${limit}`
      );
      const data = await response.json();
      return {
        data: {
          transactions: data.transactions || [],
          total: data.transactions?.length || 0,
        },
      };
    } catch (error) {
      console.error('Error getting transfers:', error);
      return {
        data: {
          transactions: [],
          total: 0,
        },
      };
    }
  }

  // NFT related
  async nftCatalogList(
    address: string,
    limit: number,
    offset: number,
    network: string
  ): Promise<NFTData> {
    try {
      // Get all NFT collections for the account
      const response = await fetch(`${EMULATOR_HOST}/v1/accounts/${address}/storage`);
      const data = await response.json();

      // Filter for NFT collections in storage
      const nfts = Object.entries(data)
        .filter(([key]) => key.includes('NFT'))
        .map(([key, value]) => ({
          id: key,
          collectionName: key,
          name: key,
          description: '',
          thumbnail: '',
          // Add other required NFT fields
        }));

      return {
        nfts: nfts.slice(offset, offset + limit),
        nftCount: nfts.length,
      };
    } catch (error) {
      console.error('Error getting NFT catalog:', error);
      return {
        nfts: [],
        nftCount: 0,
      };
    }
  }

  async nftCatalogCollections(address: string, network: string) {
    try {
      // Get all collections from the account's storage
      const response = await fetch(`${EMULATOR_HOST}/v1/accounts/${address}/storage`);
      const data = await response.json();

      // Filter for NFT collections
      return Object.entries(data)
        .filter(([key]) => key.includes('NFT'))
        .map(([key]) => ({
          name: key,
          address: address,
          count: 1, // Default count, could be updated with actual count if available
        }));
    } catch (error) {
      console.error('Error getting NFT collections:', error);
      return [];
    }
  }

  // Scripts related
  async cadenceScriptsV2() {
    // Return default scripts for emulator
    return {
      scripts: {
        emulator: {
          basic: {
            revokeKey: `
              transaction(keyIndex: Int) {
                prepare(signer: AuthAccount) {
                  signer.keys.revoke(keyIndex: keyIndex)
                }
              }
            `,
          },
          storage: {
            getStorageInfo: `
              pub fun main(address: Address): {String: UFix64} {
                let account = getAccount(address)
                let used = account.storageUsed
                let capacity = account.storageCapacity
                return {
                  "used": used,
                  "capacity": capacity,
                  "available": capacity - used
                }
              }
            `,
          },
        },
      },
      version: '1.0',
    };
  }

  // Storage related
  async getStorageInfo(address: string, network: string) {
    try {
      const response = await fetch(`${EMULATOR_HOST}/v1/accounts/${address}/storage`);
      const data = await response.json();
      return {
        used: data.storageUsed || '0',
        capacity: data.storageCapacity || '0',
        available: (Number(data.storageCapacity || 0) - Number(data.storageUsed || 0)).toString(),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        used: '0',
        capacity: '0',
        available: '0',
      };
    }
  }

  // Account related
  async getAccount(address: string, network: string) {
    try {
      const response = await fetch(`${EMULATOR_HOST}/v1/accounts/${address}`);
      const data = await response.json();
      return {
        address: data.address || address,
        balance: data.balance || '0',
        code: data.code || '',
        contracts: data.contracts || {},
        keys: data.keys || [],
      };
    } catch (error) {
      console.error('Error getting account:', error);
      return {
        address: address,
        balance: '0',
        code: '',
        contracts: {},
        keys: [],
      };
    }
  }

  // Block related
  async getLatestBlock(network: string) {
    try {
      const response = await fetch(`${EMULATOR_HOST}/v1/blocks?height=sealed`);
      const data = await response.json();
      const block = data.length > 0 ? data[0] : null;
      return {
        height: block?.height || '0',
        id: block?.id || '',
        parentId: block?.parent_id || '',
        timestamp: block?.timestamp || '',
      };
    } catch (error) {
      console.error('Error getting latest block:', error);
      return {
        height: '0',
        id: '',
        parentId: '',
        timestamp: '',
      };
    }
  }

  // Events related
  async getEvents(eventType: string, startHeight: number, endHeight: number, network: string) {
    try {
      const response = await fetch(
        `${EMULATOR_HOST}/v1/events?type=${eventType}&start_height=${startHeight}&end_height=${endHeight}`
      );
      const data = await response.json();
      return {
        events: data.events || [],
      };
    } catch (error) {
      console.error('Error getting events:', error);
      return {
        events: [],
      };
    }
  }
}

export const emulatorService = new EmulatorService();
