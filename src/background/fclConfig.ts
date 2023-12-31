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
    .put('0xFlowFees', '0xf919ee77447b7497')
    .put('flow.network', 'mainnet')
    .put('flow.auditors', ['0xfd100e39d50a13e6']);
};

export const fclSanboxnetConfig = async () => {
  fcl
    .config()
    .put('accessNode.api', 'https://rest-sandboxnet.onflow.org')
    .put('sdk.transport', httpSend)
    .put('0xLockedTokens', '0xf4527793ee68aede')
    .put('0xChildAccount', '0x1b655847a90e644a')
    .put('0xHybridCustody', '0x294e44e1ec6993c6')
    .put('0xFlowToken', '0x0661ab7d6696a460')
    .put('0xFungibleToken', '0xe20612a0776ca4bf')
    .put('0xNonFungibleToken', '0x83ade3a54eb3870c')
    .put('0xMetadataViews', '0x83ade3a54eb3870c')
    .put('0xFlowFees', '0xe92c2039bbe9da96')
    .put('flow.network', 'sandboxnet');
};
