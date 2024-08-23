import * as fcl from '@onflow/fcl';
import { send as httpSend } from '@onflow/transport-http';
import { storage } from './webapi';

const CONTRACTS_URL = process.env.NODE_ENV === 'dev'
  ? 'https://us-central1-lilico-dev.cloudfunctions.net/contracts'
  : 'https://us-central1-lilico-334404.cloudfunctions.net/contracts';

// Fallback values for critical contracts (useful when fetch fails)
const fallbackContracts = {
  "mainnet": { 
    "0xDomains": "0x233eb012d34b0070", 
    "0xFind": "0x097bafa4e0b48eef", 
    "0xFlowFees": "0xf919ee77447b7497", 
    "0xFlowIDTableStaking": "0x8624b52f9ddcd04a", 
    "0xFlowns": "0x233eb012d34b0070", 
    "0xFlowTableStaking": "0x8624b52f9ddcd04a", 
    "0xFlowToken": "0x1654653399040a61", 
    "0xFungibleToken": "0xf233dcee88fe0abe", 
    "0xHybridCustody": "0xd8a7e05a7ac670c0", 
    "0xLockedTokens": "0x8d0e87b65159ae63", 
    "0xMetadataViews": "0x1d7e57aa55817448", 
    "0xNonFungibleToken": "0x1d7e57aa55817448", 
    "0xStakingCollection": "0x8d0e87b65159ae63", 
    "0xFlowStakingCollection": "0x8d0e87b65159ae63", 
    "0xStakingProxy": "0x62430cf28c26d095", 
    "0xSwapError": "0xb78ef7afa52ff906", 
    "0xSwapRouter": "0xa6850776a94e6551", 
    "0xEVM": "0xe467b9dd11fa00df" 
  }, 
  "testnet": { 
    "0xDomains": "0xb05b2abb42335e88", 
    "0xFind": "0xa16ab1d0abde3625", 
    "0xFlowFees": "0x912d5440f7e3769e", 
    "0xFlowIDTableStaking": "0x9eca2b38b18b5dfe", 
    "0xFlowns": "0xb05b2abb42335e88", 
    "0xFlowTableStaking": "0x9eca2b38b18b5dfe", 
    "0xFlowToken": "0x7e60df042a9c0868", 
    "0xFungibleToken": "0x9a0766d93b6608b7", 
    "0xHybridCustody": "0x294e44e1ec6993c6", 
    "0xLockedTokens": "0x95e019a17d0e23d7", 
    "0xMetadataViews": "0x631e88ae7f1d7c20", 
    "0xNonFungibleToken": "0x631e88ae7f1d7c20", 
    "0xStakingCollection": "0x95e019a17d0e23d7", 
    "0xFlowStakingCollection": "0x95e019a17d0e23d7", 
    "0xStakingProxy": "0x7aad92e5a0715d21", 
    "0xSwapError": "0xddb929038d45d4b3", 
    "0xSwapRouter": "0x2f8af5ed05bbde0d", 
    "0xEVM": "0x8c5303eaa26202d6", 
    "0xFlowEVMBridge": "0xdfc20aee650fcbdf" 
  }, 
  "previewnet": { 
    "0xFlowEVMBridge": "0x634acef27f871527", 
    "0xFlowFees": "0xab086ce9cc29fc80", 
    "0xFlowIDTableStaking": "0xb6763b4399a888c8", 
    "0xFlowTableStaking": "0xb6763b4399a888c8", 
    "0xFlowToken": "0x4445e7ad11568276", 
    "0xFungibleToken": "0xa0225e7000ac82a9", 
    "0xHybridCustody": "0x294e44e1ec6993c6", 
    "0xLockedTokens": "0x95e019a17d0e23d7", 
    "0xMetadataViews": "0xb6763b4399a888c8", 
    "0xNonFungibleToken": "0xb6763b4399a888c8", 
    "0xStakingCollection": "0x95e019a17d0e23d7", 
    "0xFlowStakingCollection": "0x95e019a17d0e23d7", 
    "0xStakingProxy": "0x7aad92e5a0715d21", 
    "0xSwapError": "0xddb929038d45d4b3", 
    "0xSwapRouter": "0x2f8af5ed05bbde0d", 
    "0xEVM": "0xb6763b4399a888c8" 
  }, 
  "sandboxnet": { 
    "0xDomains": "0x8998b29311d1f3da", 
    "0xFlowFees": "0xe92c2039bbe9da96", 
    "0xFlowns": "0x8998b29311d1f3da", 
    "0xFlowTableStaking": "0xf4527793ee68aede", 
    "0xFlowToken": "0x0661ab7d6696a460", 
    "0xFungibleToken": "0xe20612a0776ca4bf", 
    "0xLockedTokens": "0xf4527793ee68aede", 
    "0xNonFungibleToken": "0x83ade3a54eb3870c" 
  }
};


// Fetch contracts from API and cache them
async function fetchContracts() {
  const ttl = 60 * 60 * 1000; // 1 hour in milliseconds
  
  try {
    // First, try to get the cached contracts
    const cachedContracts = await storage.getExpiry('contracts');
    
    if (cachedContracts) {
      console.log("Loaded contracts from cache.");
      return cachedContracts;
    }

    // If not cached or expired, fetch from the remote server
    const response = await fetch(CONTRACTS_URL);
    const data = await response.json();
    
    // Cache the fetched contracts for future use with expiry
    await storage.setExpiry('contracts', data, ttl);
    console.log("Fetched and cached contracts.");
    return data;
    
  } catch (error) {
    console.error("Error fetching contracts:", error);

    // If fetching and cache both fail, return fallback contracts
    console.warn("Using fallback contract addresses.");
    return fallbackContracts;
  }
}

// Configure FCL for Mainnet
export const fclMainnetConfig = async () => {
  const contracts = await fetchContracts();
  const mainnetContracts = contracts.mainnet || fallbackContracts.mainnet;

  fcl
    .config()
    .put('accessNode.api', 'https://rest-mainnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xFlowToken', mainnetContracts["0xFlowToken"])
    .put('0xFungibleToken', mainnetContracts["0xFungibleToken"])
    .put('0xNonFungibleToken', mainnetContracts["0xNonFungibleToken"])
    .put('0xFlowFees', mainnetContracts["0xFlowFees"])
    .put('0xMetadataViews', mainnetContracts["0xMetadataViews"])
    .put('0xLockedTokens', mainnetContracts["0xLockedTokens"])
    .put('0xFind', mainnetContracts["0xFind"])
    .put('0xDomains', mainnetContracts["0xDomains"])
    .put('0xHybridCustody', mainnetContracts["0xHybridCustody"])
    .put('0xFlowIDTableStaking', mainnetContracts["0xFlowIDTableStaking"])
    .put('0xStakingCollection', mainnetContracts["0xStakingCollection"])
    .put('0xFlowStakingCollection', mainnetContracts["0xFlowStakingCollection"])
    .put('0xStakingProxy', mainnetContracts["0xStakingProxy"])
    .put('0xSwapError', mainnetContracts["0xSwapError"])
    .put('0xSwapRouter', mainnetContracts["0xSwapRouter"])
    .put('0xEVM', mainnetContracts["0xEVM"])
    .put('0xFlowns', mainnetContracts["0xFlowns"]) 
    .put('0xFlowTableStaking', mainnetContracts["0xFlowTableStaking"]) 
    .put('flow.network', 'mainnet');
};

// Configure FCL for Testnet
export const fclTestnetConfig = async () => {
  const contracts = await fetchContracts();
  const testnetContracts = contracts.testnet || fallbackContracts.testnet;

  fcl
    .config()
    .put('accessNode.api', 'https://rest-testnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xFlowToken', testnetContracts["0xFlowToken"])
    .put('0xFungibleToken', testnetContracts["0xFungibleToken"])
    .put('0xNonFungibleToken', testnetContracts["0xNonFungibleToken"])
    .put('0xFlowFees', testnetContracts["0xFlowFees"])
    .put('0xMetadataViews', testnetContracts["0xMetadataViews"])
    .put('0xLockedTokens', testnetContracts["0xLockedTokens"])
    .put('0xFind', testnetContracts["0xFind"])
    .put('0xDomains', testnetContracts["0xDomains"])
    .put('0xHybridCustody', testnetContracts["0xHybridCustody"])
    .put('0xFlowIDTableStaking', testnetContracts["0xFlowIDTableStaking"])
    .put('0xStakingCollection', testnetContracts["0xStakingCollection"])
    .put('0xFlowStakingCollection', testnetContracts["0xFlowStakingCollection"])
    .put('0xStakingProxy', testnetContracts["0xStakingProxy"])
    .put('0xSwapError', testnetContracts["0xSwapError"])
    .put('0xSwapRouter', testnetContracts["0xSwapRouter"])
    .put('0xEVM', testnetContracts["0xEVM"])
    .put('0xFlowEVMBridge', testnetContracts["0xFlowEVMBridge"])
    .put('0xFlowns', testnetContracts["0xFlowns"]) 
    .put('0xFlowTableStaking', testnetContracts["0xFlowTableStaking"]) 
    .put('flow.network', 'testnet');
};

// Configure FCL for Previewnet
export const fclPreviewnetConfig = async () => {
  const contracts = await fetchContracts();
  const previewnetContracts = contracts.previewnet || fallbackContracts.previewnet;

  fcl
    .config()
    .put('accessNode.api', 'https://rest-previewnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xFlowToken', previewnetContracts["0xFlowToken"])
    .put('0xFungibleToken', previewnetContracts["0xFungibleToken"])
    .put('0xNonFungibleToken', previewnetContracts["0xNonFungibleToken"])
    .put('0xFlowFees', previewnetContracts["0xFlowFees"])
    .put('0xMetadataViews', previewnetContracts["0xMetadataViews"])
    .put('0xLockedTokens', previewnetContracts["0xLockedTokens"])
    .put('0xEVM', previewnetContracts["0xEVM"])
    .put('0xFlowEVMBridge', previewnetContracts["0xFlowEVMBridge"])
    .put('0xFlowTableStaking', previewnetContracts["0xFlowTableStaking"])
    .put('0xHybridCustody', previewnetContracts["0xHybridCustody"])  
    .put('0xStakingCollection', previewnetContracts["0xStakingCollection"])  
    .put('0xFlowStakingCollection', previewnetContracts["0xFlowStakingCollection"])  
    .put('0xStakingProxy', previewnetContracts["0xStakingProxy"])  
    .put('0xSwapError', previewnetContracts["0xSwapError"])  
    .put('0xSwapRouter', previewnetContracts["0xSwapRouter"])  
    .put('0xFlowIDTableStaking', previewnetContracts["0xFlowIDTableStaking"])  
    .put('flow.network', 'previewnet');
};
// Configure FCL for Migration Testnet
export const fclTestnetMigrationConfig = async () => {
  const contracts = await fetchContracts();
  const migrationTestnetContracts = contracts.migrationTestnet || fallbackContracts.testnet;

  fcl
    .config()
    .put('accessNode.api', 'https://rest-migrationtestnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xFlowToken', migrationTestnetContracts["0xFlowToken"])
    .put('0xFungibleToken', migrationTestnetContracts["0xFungibleToken"])
    .put('0xNonFungibleToken', migrationTestnetContracts["0xNonFungibleToken"])
    .put('0xFlowFees', migrationTestnetContracts["0xFlowFees"])
    .put('0xMetadataViews', migrationTestnetContracts["0xMetadataViews"])
    .put('0xLockedTokens', migrationTestnetContracts["0xLockedTokens"])
    .put('0xFind', migrationTestnetContracts["0xFind"])
    .put('0xFlowEVMBridge', migrationTestnetContracts["0xFlowEVMBridge"]) 
    .put('0xFlowns', migrationTestnetContracts["0xFlowns"]) 
    .put('0xFlowTableStaking', migrationTestnetContracts["0xFlowTableStaking"]) 
    .put('flow.network', 'migrationtestnet');
};