import * as fcl from '@onflow/fcl';
import { send as httpSend } from '@onflow/transport-http';

// const {
//   ACCESSNODE_API,
//   LOCKEDTOKENS,
//   FIND,
//   CHILDACCOUNT,
//   HYBRIDCUSTODY,
//   FLOWNS,
//   DOMAINS,
//   FLOWTOKEN,
//   FUNGIBLETOKEN,
//   NONFUNGIBLETOKEN,
//   FLOWFEES,
//   METADATAVIEWS,
//   FLOW_NETWORK,
//   FLOW_AUDITORS,
// } = process.env;

export const fclTestnetConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-testnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0x95e019a17d0e23d7')
    .put('0xFind', '0xa16ab1d0abde3625')
    .put('0xChildAccount', '0x1b655847a90e644a')
    .put('0xHybridCustody', '0x294e44e1ec6993c6')
    .put('0xFlowns', '0xb05b2abb42335e88')
    .put('0xDomains', '0xb05b2abb42335e88')
    .put('0xFlowToken', '0x7e60df042a9c0868')
    .put('0xFungibleToken', '0x9a0766d93b6608b7')
    .put('0xNonFungibleToken', '0x631e88ae7f1d7c20')
    .put('0xFlowFees', '0x912d5440f7e3769e')
    .put('0xMetadataViews', '0x631e88ae7f1d7c20')
    .put('0xFlowEVMBridge', '0x715c57f7a59bc39b')
    .put('0xEVM', '0x8c5303eaa26202d6')
    .put('flow.network', 'testnet')
    .put('flow.auditors', ['0xf78bfc12d0a786dc']);
    
};

export const fclMainnetConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-mainnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0x8d0e87b65159ae63')
    .put('0xFind', '0x097bafa4e0b48eef')
    .put('0xChildAccount', '0x1b655847a90e644a')
    .put('0xHybridCustody', '0xd8a7e05a7ac670c0')
    .put('0xFlowns', '0x233eb012d34b0070')
    .put('0xDomains', '0x233eb012d34b0070')
    .put('0xFlowToken', '0x1654653399040a61')
    .put('0xFungibleToken', '0xf233dcee88fe0abe')
    .put('0xNonFungibleToken', '0x1d7e57aa55817448')
    .put('0xMetadataViews', '0x1d7e57aa55817448')
    .put('0xFlowEVMBridge', '0x715c57f7a59bc39b')
    .put('0xEVM', '0xe467b9dd11fa00df')
    .put('0xFlowFees', '0xf919ee77447b7497')
    .put('flow.network', 'mainnet')
    .put('flow.auditors', ['0xfd100e39d50a13e6']);
};

export const fclCrescendoConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-crescendo.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0x95e019a17d0e23d7')
    .put('0xFind', '0xa16ab1d0abde3625')
    .put('0xChildAccount', '0x1b655847a90e644a')
    .put('0xHybridCustody', '0x294e44e1ec6993c6')
    .put('0xFlowns', '0xb05b2abb42335e88')
    .put('0xDomains', '0xb05b2abb42335e88')
    .put('0xFlowToken', '0x7e60df042a9c0868')
    .put('0xFungibleToken', '0x9a0766d93b6608b7')
    .put('0xNonFungibleToken', '0x631e88ae7f1d7c20')
    .put('0xFlowFees', '0x912d5440f7e3769e')
    .put('0xMetadataViews', '0x631e88ae7f1d7c20')
    .put('0xFlowEVMBridge', '0x715c57f7a59bc39b')
    .put('flow.network', 'crescendo')
    .put('flow.auditors', ['0xf78bfc12d0a786dc']);
};


export const fclPreviewnetConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-previewnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0xb6763b4399a888c8')
    // .put('0xFind', '0xa16ab1d0abde3625')
    // .put('0xChildAccount', '0x1b655847a90e644a')
    // .put('0xHybridCustody', '0x294e44e1ec6993c6')
    // .put('0xFlowns', '0xb05b2abb42335e88')
    // .put('0xDomains', '0xb05b2abb42335e88')
    .put('0xEVM', '0xb6763b4399a888c8')
    .put('0xFlowToken', '0x4445e7ad11568276')
    .put('0xFungibleToken', '0xa0225e7000ac82a9')
    .put('0xNonFungibleToken', '0xb6763b4399a888c8')
    .put('0xFlowFees', '0xab086ce9cc29fc80')
    .put('0xMetadataViews', '0xb6763b4399a888c8')
    .put('0xFlowEVMBridge', '0x715c57f7a59bc39b')
    .put('flow.network', 'previewnet')
    // .put('flow.auditors', ['0xf78bfc12d0a786dc']);
};

export const fclTestnetMigrationConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-migrationtestnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0x95e019a17d0e23d7')
    .put('0xFind', '0xa16ab1d0abde3625')
    .put('0xChildAccount', '0x1b655847a90e644a')
    .put('0xHybridCustody', '0x294e44e1ec6993c6')
    .put('0xFlowns', '0xb05b2abb42335e88')
    .put('0xDomains', '0xb05b2abb42335e88')
    .put('0xFlowToken', '0x7e60df042a9c0868')
    .put('0xFungibleToken', '0x9a0766d93b6608b7')
    .put('0xNonFungibleToken', '0x631e88ae7f1d7c20')
    .put('0xFlowFees', '0x912d5440f7e3769e')
    .put('0xMetadataViews', '0x631e88ae7f1d7c20')
    .put('0xFlowEVMBridge', '0x715c57f7a59bc39b')
    .put('flow.network', 'migrationtestnet')
    .put('flow.auditors', ['0xf78bfc12d0a786dc']);
    
};
