import { getAccountKey } from '@/shared/utils/address';

interface TestFunction {
  name: string;
  params: Record<string, any>;
}

interface TestGroups {
  [key: string]: TestFunction[];
}

export interface CommonParams {
  address: string;
  network: string;
  username: string;
  token: string;
  mnemonic: string;
  publicKey: {
    P256: {
      pubK: string;
      pk?: string;
    };
    SECP256K1: {
      pubK: string;
      pk?: string;
    };
  };
  deviceInfo: {
    device_id: string;
    district: string;
    name: string;
    type: string;
    user_agent: string;
  };
}

export const createTestGroups = (commonParams: CommonParams): TestGroups => {
  const accountKey = getAccountKey(commonParams.mnemonic);
  return {
    core: [{ name: 'sendRequest', params: { method: 'GET', url: '', params: {} } }],
    authentication: [
      { name: 'checkUsername', params: { username: commonParams.username } },
      { name: 'register', params: { account_key: accountKey, username: commonParams.username } },
      {
        name: 'login',
        params: { public_key: commonParams.publicKey, signature: '', replaceUser: true },
      },
      {
        name: 'loginV2',
        params: { public_key: commonParams.publicKey, signature: '', replaceUser: true },
      },
      {
        name: 'loginV3',
        params: {
          account_key: accountKey,
          device_info: commonParams.deviceInfo,
          signature: '',
          replaceUser: true,
        },
      },
      {
        name: 'importKey',
        params: {
          account_key: accountKey,
          device_info: commonParams.deviceInfo,
          username: commonParams.username,
          backup_info: {},
          address: commonParams.address,
          replaceUser: true,
        },
      },
    ],
    prices: [
      { name: 'getUSDCPrice', params: { provider: 'binance' } },
      { name: 'getTokenPrices', params: { storageKey: 'test', isEvm: false } },
      { name: 'getTokenPrice', params: { token: 'flow', provider: 'binance' } },
      {
        name: 'getTokenPriceHistory',
        params: { token: 'flow', period: 'oneDay', provider: 'binance' },
      },
    ],
    user: [
      { name: 'coinMap', params: {} },
      { name: 'userInfo', params: {} },
      { name: 'userWallet', params: {} },
      { name: 'userWalletV2', params: {} },
      { name: 'searchUser', params: { keyword: 'test' } },
      { name: 'checkImport', params: { key: 'test' } },
    ],
    wallet: [
      { name: 'createFlowAddress', params: {} },
      { name: 'createFlowSandboxAddress', params: {} },
      {
        name: 'createFlowNetworkAddress',
        params: { account_key: accountKey, network: commonParams.network },
      },
    ],
    coins: [
      { name: 'getCoinList', params: { address: commonParams.address } },
      { name: 'getCoinRate', params: { coinId: 'flow' } },
    ],
    device: [
      { name: 'getManualAddress', params: {} },
      {
        name: 'synceDevice',
        params: { params: { account_key: accountKey, device_info: commonParams.deviceInfo } },
      },
      { name: 'deviceList', params: {} },
      { name: 'keyList', params: {} },
      { name: 'getLocation', params: {} },
      {
        name: 'addDevice',
        params: { params: { wallet_id: '', device_info: commonParams.deviceInfo } },
      },
    ],
    fetch: [
      {
        name: 'fetchGitTokenList',
        params: { network: commonParams.network, chainType: 'flow', childType: '' },
      },
      { name: 'fetchTokenList', params: { network: commonParams.network } },
      { name: 'getNFTListFromGithub', params: { network: commonParams.network } },
    ],
    transactions: [
      { name: 'prepareTransaction', params: { transaction: {} } },
      { name: 'signPayer', params: { transaction: {}, message: '' } },
      { name: 'signProposer', params: { transaction: {}, message: '' } },
      { name: 'getProposer', params: {} },
      { name: 'sendTransaction', params: { transaction: {} } },
      { name: 'getTransfers', params: { address: commonParams.address, after: '', limit: 10 } },
      { name: 'getEVMTransfers', params: { address: commonParams.address, after: '', limit: 10 } },
      { name: 'getTransactionTemplate', params: { cadence: '', network: commonParams.network } },
    ],
    addressBook: [
      { name: 'getAddressBook', params: {} },
      {
        name: 'addAddressBook',
        params: {
          contact_name: 'Test',
          address: commonParams.address,
          username: '',
          domain: '',
          domain_type: 0,
        },
      },
      {
        name: 'editAddressBook',
        params: {
          id: 1,
          contact_name: 'Test Updated',
          address: commonParams.address,
          domain: '',
          domain_type: 0,
        },
      },
      { name: 'deleteAddressBook', params: { id: 1 } },
      {
        name: 'addExternalAddressBook',
        params: { contact_name: 'Test', address: commonParams.address, domain: '', domain_type: 0 },
      },
    ],
    nft: [
      {
        name: 'getNFTMetadata',
        params: {
          address: commonParams.address,
          contractName: '',
          contractAddress: '',
          tokenId: 0,
        },
      },
      { name: 'nftCatalog', params: {} },
      {
        name: 'nftCatalogList',
        params: {
          address: commonParams.address,
          limit: 10,
          offset: 0,
          network: commonParams.network,
        },
      },
      {
        name: 'nftCatalogCollections',
        params: { address: commonParams.address, network: commonParams.network },
      },
      {
        name: 'nftCatalogCollectionList',
        params: {
          address: commonParams.address,
          contractName: '',
          limit: 10,
          offset: 0,
          network: commonParams.network,
        },
      },
      {
        name: 'nftCollectionApiPaging',
        params: {
          address: commonParams.address,
          contractName: '',
          limit: 10,
          offset: 0,
          network: commonParams.network,
        },
      },
      {
        name: 'nftCollectionInfo',
        params: {
          address: commonParams.address,
          contractName: '',
          limit: 10,
          offset: 0,
          network: commonParams.network,
        },
      },
      { name: 'nftCollectionList', params: {} },
      { name: 'evmFTList', params: {} },
      {
        name: 'getEvmFT',
        params: { address: commonParams.address, network: commonParams.network },
      },
      { name: 'getEvmFTPrice', params: {} },
      { name: 'evmNFTList', params: {} },
      {
        name: 'getEvmNFT',
        params: { address: commonParams.address, network: commonParams.network },
      },
      {
        name: 'EvmNFTcollectionList',
        params: { address: commonParams.address, collectionIdentifier: '', limit: 24, offset: 0 },
      },
      { name: 'EvmNFTID', params: { address: commonParams.address } },
      { name: 'EvmNFTList', params: { address: commonParams.address, limit: 24, offset: 0 } },
      {
        name: 'getNFTCadenceList',
        params: {
          address: commonParams.address,
          network: commonParams.network,
          offset: 0,
          limit: 5,
        },
      },
      {
        name: 'getNFTCadenceCollection',
        params: {
          address: commonParams.address,
          network: commonParams.network,
          identifier: '',
          offset: 0,
          limit: 24,
        },
      },
      {
        name: 'getNFTV2CollectionList',
        params: { address: commonParams.address, network: commonParams.network },
      },
      {
        name: 'getNFTList',
        params: { address: commonParams.address, offset: 0, limit: 10 },
      },
      { name: 'genTx', params: { contract_name: '' } },
    ],
    profile: [
      { name: 'updateProfilePreference', params: { privacy: 0 } },
      { name: 'updateProfile', params: { nickname: 'Test', avatar: '' } },
    ],
    flowns: [
      { name: 'flownsPrepare', params: {} },
      { name: 'flownsAuthTransaction', params: { transaction: {}, envelope: '' } },
      { name: 'flownsTransaction', params: { transaction: {}, envelope: '' } },
    ],
    swap: [
      {
        name: 'swapEstimate',
        params: { network: commonParams.network, inToken: 'flow', outToken: 'usdc', amount: '1' },
      },
      {
        name: 'swapOutEstimate',
        params: { network: commonParams.network, inToken: 'flow', outToken: 'usdc', amount: '1' },
      },
      { name: 'swapPairs', params: { network: commonParams.network } },
    ],
    scripts: [
      { name: 'cadenceScripts', params: { network: commonParams.network } },
      { name: 'cadenceScriptsV2', params: {} },
    ],
    misc: [
      { name: 'getNews', params: {} },
      { name: 'getLatestVersion', params: {} },
      { name: 'validateRecaptcha', params: { token: commonParams.token } },
      { name: 'flowScanQuery', params: { query: '', operationName: '' } },
      { name: 'pingNetwork', params: { network: commonParams.network } },
      { name: 'getMoonpayURL', params: { url: '' } },
      { name: 'decodeEvmCall', params: { data: '', address: commonParams.address } },
    ],
  };
};
