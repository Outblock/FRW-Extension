import { Method } from 'axios';
import { createPersistStore } from 'background/utils';
import { getPeriodFrequency } from '../../utils';
import { INITIAL_OPENAPI_URL, WEB_NEXT_URL } from 'consts';
import dayjs from 'dayjs';

import {
  getAuth,
  signInWithCustomToken,
  setPersistence,
  indexedDBLocalPersistence,
  signInAnonymously,
  onAuthStateChanged,
} from '@firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { getInstallations, getId } from 'firebase/installations';
import { Unsubscribe } from '@firebase/util';
import {
  AccountKey,
  CheckResponse,
  SignInResponse,
  UserInfoResponse,
  FlowTransaction,
  SendTransactionResponse,
  Period,
  PriceProvider,
  TokenModel,
  NFTModel,
  StorageInfo,
} from './networkModel';
import fetchConfig from 'background/utils/remoteConfig';
// import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
// import configJson from 'background/utils/firebase.config.json';
import {
  getFirbaseConfig,
  getFirbaseFunctionUrl,
} from 'background/utils/firebaseConfig';
import {
  userWalletService,
  coinListService,
  addressBookService,
  userInfoService,
  transactionService,
  nftService,
  googleSafeHostService,
} from './index';
import * as fcl from '@onflow/fcl';
import { storage } from '@/background/webapi';
// const axios = axiosOriginal.create({ adapter })

export interface OpenApiConfigValue {
  path: string;
  method: Method;
  params?: string[];
}

export interface OpenApiStore {
  host: string;
  config: Record<string, OpenApiConfigValue>;
}

const maxRPS = 100;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = getFirbaseConfig();
const app = initializeApp(firebaseConfig, process.env.NODE_ENV);
const auth = getAuth(app);
// const remoteConfig = getRemoteConfig(app);

const remoteFetch = fetchConfig;

const waitForAuthInit = async () => {
  let unsubscribe: Promise<Unsubscribe>;
  await new Promise<void>((resolve) => {
    // @ts-expect-error firebase auth function
    unsubscribe = auth.onAuthStateChanged((user) => resolve());
  });
  (await unsubscribe!)();
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    // const uid = user.uid;
    console.log('User is signed in');
    if (user.isAnonymous) {
      console.log('User is anonymous');
    }
  } else {
    // User is signed out
    console.log('User is signed out');
  }
});

const dataConfig: Record<string, OpenApiConfigValue> = {
  check_username: {
    path: '/v1/user/check',
    method: 'get',
    params: ['username'],
  },
  search_user: {
    path: '/v1/user/search',
    method: 'get',
    params: ['keyword'],
  },
  register: {
    path: '/v1/register',
    method: 'post',
    params: ['username', 'account_key'],
  },
  create_flow_address: {
    path: '/v1/user/address',
    method: 'post',
    params: [],
  },
  create_flow_sandbox_address: {
    path: '/v1/user/address/sandboxnet',
    method: 'post',
    params: [],
  },
  login: {
    path: '/v1/login',
    method: 'post',
    params: ['public_key', 'signature'],
  },
  loginv2: {
    path: '/v2/login',
    method: 'post',
    params: ['public_key', 'signature'],
  },
  coin_map: {
    path: '/v1/coin/map',
    method: 'get',
    params: [],
  },
  user_wallet: {
    path: '/v1/user/wallet',
    method: 'get',
    params: [],
  },
  user_wallet_v2: {
    path: '/v2/user/wallet',
    method: 'get',
    params: [],
  },
  user_info: {
    path: '/v1/user/info',
    method: 'get',
    params: [],
  },
  prepare_transaction: {
    path: '/v1/account/presign',
    method: 'post',
    params: ['transaction'],
  },
  sign_payer: {
    path: '/v1/account/signpayer',
    method: 'post',
    params: ['transaction', 'message'],
  },
  send_transaction: {
    path: '/v1/account/transaction',
    method: 'post',
    params: ['transaction'],
  },
  coin_list: {
    path: '/v1/account/info',
    method: 'get',
    params: ['address'],
  },
  coin_rate: {
    path: '/v1/coin/rate',
    method: 'get',
    params: ['coinId'],
  },
  nft_list_v2: {
    path: '/v2/nft/list',
    method: 'get',
    params: ['address', 'offset', 'limit'],
  },
  nft_list_lilico_v2: {
    path: '/v2/nft/detail/list',
    method: 'get',
    params: ['address', 'offset', 'limit'],
  },
  nft_collections_lilico_v2: {
    path: '/v2/nft/collections',
    method: 'get',
    params: ['address'],
  },
  nft_collections_single_v2: {
    path: '/v2/nft/single',
    method: 'get',
    params: ['address', 'contractName', 'limit', 'offset'],
  },
  nft_meta: {
    path: '/v2/nft/meta',
    method: 'get',
    params: ['address', 'contractName', 'contractAddress', 'tokenId'],
  },
  fetch_address_book: {
    path: '/v1/addressbook/contact',
    method: 'get',
    params: [],
  },
  add_address_book: {
    path: '/v1/addressbook/contact',
    method: 'put',
    params: ['contact_name', 'username', 'address', 'domain', 'domain_type'],
  },
  edit_address_book: {
    path: '/v1/addressbook/contact',
    method: 'post',
    params: ['id', 'contact_name', 'address', 'domain', 'domain_type'],
  },
  delete_address_book: {
    path: '/v1/addressbook/contact',
    method: 'delete',
    params: ['id'],
  },
  add_external_address_book: {
    path: '/v1/addressbook/external',
    method: 'put',
    params: ['contact_name', 'address', 'domain', 'domain_type'],
  },
  account_transaction: {
    path: '/v1/account/transaction',
    method: 'get',
    params: ['address', 'limit', 'offset'],
  },
  validate_recaptcha: {
    path: '/v1/user/recaptcha',
    method: 'get',
    params: ['token'],
  },
  crypto_map: {
    path: '/v1/crypto/map',
    method: 'get',
    params: ['provider', 'pair'],
  },
  crypto_flow: {
    path: '/v1/crypto/summary',
    method: 'get',
    params: ['provider', 'pair'],
  },
  crypto_history: {
    path: '/v1/crypto/history',
    method: 'get',
    params: ['provider', 'pair', 'after', 'history'],
  },
  account_query: {
    path: '/v1/account/query',
    method: 'post',
    params: ['query', 'operation_name'],
  },
  profile_preference: {
    path: '/v1/profile/preference',
    method: 'post',
    params: ['private'],
  },
  profile_update: {
    path: '/v1/profile',
    method: 'post',
    params: ['nickname', 'avatar'],
  },
  flowns_prepare: {
    path: '/v1/flowns/prepare',
    method: 'get',
    params: [],
  },
  flowns_signature: {
    path: '/v1/flowns/signature',
    method: 'post',
    params: ['transaction', 'message'],
  },
  payer_signature: {
    path: '/v1/flowns/payer/signature',
    method: 'post',
    params: ['transaction', 'message'],
  },
  get_transfers: {
    path: '/v1/account/transfers',
    method: 'get',
    params: ['address', 'after', 'limit'],
  },
  manual_address: {
    path: '/v1/user/manualaddress',
    method: 'get',
    params: [],
  },
  device_list: {
    path: '/v1/user/device',
    method: 'get',
    params: [],
  },
  key_list: {
    path: '/v1/user/keys',
    method: 'get',
    params: [],
  },
  add_device: {
    path: '/v1/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
  },
  get_location: {
    path: '/v1/user/location',
    method: 'get',
    params: [],
  },
};

class OpenApiService {
  store!: OpenApiStore;

  // request = rateLimit(axios.create(), { maxRPS });

  setHost = async (host: string) => {
    this.store.host = host;
    await this.init();
  };

  getHost = () => {
    return this.store.host;
  };

  init = async () => {
    this.store = await createPersistStore({
      name: 'openapi',
      template: {
        host: INITIAL_OPENAPI_URL,
        config: dataConfig,
      },
      fromStorage: false, // Debug only
    });
  };

  checkAuthStatus = async () => {
    await waitForAuthInit();
    const app = getApp(process.env.NODE_ENV!);
    const user = await getAuth(app).currentUser;
    if (user && user.isAnonymous) {
      userWalletService.reSign();
    }
  };

  sendRequest = async (
    method = 'GET',
    url = '',
    params = {},
    data = {},
    host = this.store.host
  ) => {
    // Default options are marked with *
    let requestUrl = '';

    if (Object.keys(params).length) {
      requestUrl = host + url + '?' + new URLSearchParams(params).toString();
    } else {
      requestUrl = host + url;
    }
    const network = await userWalletService.getNetwork();

    const app = getApp(process.env.NODE_ENV!);
    const user = await getAuth(app).currentUser;
    const init = {
      method,
      async: true,
      headers: {
        Network: network,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (method.toUpperCase() !== 'GET') {
      init['body'] = JSON.stringify(data);
    }

    // Wait for firebase auth to complete
    await waitForAuthInit();

    if (user !== null) {
      const idToken = await user.getIdToken();
      init.headers['Authorization'] = 'Bearer ' + idToken;
    } else {
      // If no user, then sign in as anonymous first
      await signInAnonymously(auth);
      const anonymousUser = await getAuth(app).currentUser;
      const idToken = await anonymousUser?.getIdToken();
      init.headers['Authorization'] = 'Bearer ' + idToken;
    }

    const response = await fetch(requestUrl, init);
    return response.json(); // parses JSON response into native JavaScript objects
  };

  private getUSDCPricePair = (provider: PriceProvider): string | null => {
    switch (provider) {
      case PriceProvider.binance:
        return 'usdcusdt';
      case PriceProvider.kakren:
        return 'usdcusd';
      case PriceProvider.huobi:
        return 'usdcusdt';
      default:
        return null;
    }
  };

  getPriceProvider = (token: string): PriceProvider[] => {
    switch (token) {
      case 'usdc':
        return [
          PriceProvider.binance,
          PriceProvider.kakren,
          PriceProvider.huobi,
        ];
      case 'flow':
        return [
          PriceProvider.binance,
          PriceProvider.kakren,
          PriceProvider.coinbase,
          PriceProvider.kucoin,
          PriceProvider.huobi,
        ];
      default:
        return [];
    }
  };

  getUSDCPrice = async (
    provider = PriceProvider.binance
  ): Promise<CheckResponse> => {
    const config = this.store.config.crypto_map;
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: this.getUSDCPricePair(provider),
    });
    return data.data.result;
  };

  private getFlowPricePair = (provider: PriceProvider): string => {
    switch (provider) {
      case PriceProvider.binance:
        return 'flowusdt';
      case PriceProvider.kakren:
        return 'flowusd';
      case PriceProvider.huobi:
        return 'flowusdt';
      case PriceProvider.coinbase:
        return 'flowusd';
      case PriceProvider.kucoin:
        return 'flowusdt';
    }
  };

  getTokenPair = (token: string, provider: PriceProvider): string | null => {
    switch (token) {
      case 'usdc':
        return this.getUSDCPricePair(provider);
      case 'flow':
        return this.getFlowPricePair(provider);
      default:
        return null;
    }
  };

  getTokenPrice = async (
    token: string,
    provider = PriceProvider.binance
  ): Promise<CheckResponse> => {
    const config = this.store.config.crypto_flow;
    const pair = this.getTokenPair(token, provider);
    if (!pair) {
      throw new Error('no price provider found');
    }
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: pair,
    });
    return data.data.result;
  };

  getTokenPriceHistory = async (
    token: string,
    period = Period.oneDay,
    provider = PriceProvider.binance
  ): Promise<CheckResponse> => {
    let after = dayjs();
    const periods = getPeriodFrequency(period);

    const providers = this.getPriceProvider(token);
    if (providers.length === 0) {
      throw new Error('no price provider found');
    }

    switch (period) {
      case Period.oneDay:
        after = after.subtract(1, 'days');
        break;
      case Period.oneWeek:
        after = after.subtract(7, 'days');
        break;
      case Period.oneMonth:
        after = after.subtract(1, 'months');
        break;
      case Period.threeMonth:
        after = after.subtract(3, 'months');
        break;
      case Period.oneYear:
        after = after.subtract(1, 'years');
        break;
    }

    const config = this.store.config.crypto_history;
    const data = await this.sendRequest(config.method, config.path, {
      provider,
      pair: this.getTokenPair(token, provider),
      after: period === Period.all ? '' : after.unix(),
      periods,
    });
    return data.data.result;
  };

  private _signWithCustom = async (token) => {
    this.clearAllStorage();
    await setPersistence(auth, indexedDBLocalPersistence);
    await signInWithCustomToken(auth, token);
  };

  private clearAllStorage = () => {
    nftService.clear();
    userInfoService.removeUserInfo();
    coinListService.clear();
    addressBookService.clear();
    userWalletService.clear();
    transactionService.clear();
  };

  checkUsername = async (username: string) => {
    const config = this.store.config.check_username;
    const data = await this.sendRequest(config.method, config.path, {
      username,
    });
    return data;
  };

  register = async (account_key: AccountKey, username: string) => {
    const config = this.store.config.register;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        account_key,
        username,
      }
    );
    await this._signWithCustom(data.data.custom_token);
    return data;
  };

  login = async (
    public_key: string,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = this.store.config.login;
    // const result = await this.request[config.method](config.path, {
    //   public_key,
    //   signature,
    // });
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { public_key, signature }
    );
    if (!result.data) {
      throw new Error('NoUserFound');
    }
    if (replaceUser) {
      await this._signWithCustom(result.data.custom_token);
    }
    return result;
  };

  loginV2 = async (
    public_key: string,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = this.store.config.loginv2;
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { public_key, signature }
    );
    if (!result.data) {
      throw new Error('NoUserFound');
    }
    if (replaceUser) {
      await this._signWithCustom(result.data.custom_token);
    }
    return result;
  };

  coinMap = async () => {
    const config = this.store.config.coin_map;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  userInfo = async (): Promise<UserInfoResponse> => {
    const config = this.store.config.user_info;
    return await this.sendRequest(config.method, config.path);
  };

  userWallet = async () => {
    const config = this.store.config.user_wallet;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  userWalletV2 = async () => {
    const config = this.store.config.user_wallet_v2;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowAddress = async () => {
    const config = this.store.config.create_flow_address;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowSandboxAddress = async () => {
    const config = this.store.config.create_flow_sandbox_address;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  getMoonpayURL = async (url) => {
    const baseURL = getFirbaseFunctionUrl();
    const response = await this.sendRequest(
      'POST',
      '/moonPaySignature',
      {},
      { url: url },
      baseURL
    );
    return response;
  };

  prepareTransaction = async (transaction: FlowTransaction) => {
    const config = this.store.config.prepare_transaction;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      { transaction }
    );
    return data;
  };

  signPayer = async (transaction, message: string) => {
    const messages = {
      envelope_message: message,
    };
    const config = this.store.config.sign_payer;
    const baseURL = getFirbaseFunctionUrl();
    // 'http://localhost:5001/lilico-dev/us-central1'
    const data = await this.sendRequest(
      'POST',
      '/signAsPayer',
      {},
      { transaction, message: messages },
      baseURL
    );
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  sendTransaction = async (transaction): Promise<SendTransactionResponse> => {
    const config = this.store.config.send_transaction;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        transaction,
      }
    );
    return data;
  };

  getCoinList = async (address) => {
    const config = this.store.config.coin_list;
    const data = await this.sendRequest(config.method, config.path, {
      address,
    });
    return data;
  };

  getCoinRate = async (coinId) => {
    const config = this.store.config.coin_rate;
    const data = await this.sendRequest(config.method, config.path, { coinId });
    return data;
  };

  getNFTList = async (address: string, offset: number, limit: number) => {
    const config = this.store.config.nft_list;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      offset,
      limit,
    });
    return data;
  };

  getNFTListV2 = async (address: string, offset: number, limit: number) => {
    const alchemyAPI = (await storage.get('alchemyAPI')) || false;
    const config = alchemyAPI
      ? this.store.config.nft_list_v2
      : this.store.config.nft_list_lilico_v2;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      offset,
      limit,
    });
    return data;
  };

  getNFTCollectionV2 = async (address: string) => {
    // const alchemyAPI = await storage.get('alchemyAPI') || false
    const config = this.store.config.nft_collections_lilico_v2;
    const data = await this.sendRequest(config.method, config.path, {
      address,
    });
    return data;
  };

  getSingleCollectionV2 = async (
    address: string,
    contract: string,
    offset: number
  ) => {
    // const alchemyAPI = await storage.get('alchemyAPI') || false
    const config = this.store.config.nft_collections_single_v2;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      contractName: contract,
      offset,
      limit: 24,
    });
    return data;
  };

  getNFTMetadata = async (
    address: string,
    contractName: string,
    contractAddress: string,
    tokenId: number
  ) => {
    const config = this.store.config.nft_meta;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      contractName,
      contractAddress,
      tokenId,
    });

    return data;
  };

  getAddressBook = async () => {
    const config = this.store.config.fetch_address_book;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  addAddressBook = async (
    contact_name: string,
    address: string,
    username = '',
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.add_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        contact_name,
        address,
        username,
        domain,
        domain_type,
      }
    );
    return data;
  };

  editAddressBook = async (
    id: number,
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.edit_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        id,
        contact_name,
        address,
        domain,
        domain_type,
      }
    );
    return data;
  };

  deleteAddressBook = async (id: number) => {
    const config = this.store.config.delete_address_book;
    const data = await this.sendRequest(config.method, config.path, { id });
    return data;
  };

  addExternalAddressBook = async (
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = this.store.config.add_external_address_book;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        contact_name,
        address,
        domain,
        domain_type,
      }
    );
    return data;
  };

  getFlowAccount = async (address: string) => {
    try {
      const account = await fcl.account(address);
      return account;
    } catch (error) {
      return null;
    }
  };

  getLastBlock = async () => {
    try {
      const account = await fcl.latestBlock(true);
      return account;
    } catch (error) {
      return null;
    }
  };

  checkChildAccount = async (address: string) => {
    const result = await fcl.query({
      cadence: `
      import HybridCustody from 0xHybridCustody

      pub fun main(parent: Address): [Address] {
        let acct = getAuthAccount(parent)
        let manager = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")
        return manager.getChildAddresses()
    }

    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  };

  queryAccessible = async (address: string, childAccount: string) => {
    const result = await fcl.query({
      cadence: `
      import HybridCustody from 0xHybridCustody
      import MetadataViews from 0xMetadataViews
      import FungibleToken from 0xFungibleToken
      import NonFungibleToken from 0xNonFungibleToken

      pub struct CollectionDisplay {
        pub let name: String
        pub let squareImage: String
        pub let mediaType: String

        init(name: String, squareImage: String, mediaType: String) {
          self.name = name
          self.squareImage = squareImage
          self.mediaType = mediaType
        }
      }

      pub struct NFTCollection {
        pub let id: String
        pub let path: String
        pub let display: CollectionDisplay?
        pub let idList: [UInt64]

        init(id:String, path: String, display: CollectionDisplay?, idList: [UInt64]) {
          self.id = id
          self.path = path
          self.display = display
          self.idList = idList
        }
      }

      pub fun getDisplay(address: Address, path: StoragePath): CollectionDisplay? {
        let account = getAuthAccount(address)
        let resourceType = Type<@AnyResource>()
        let vaultType = Type<@FungibleToken.Vault>()
        let collectionType = Type<@NonFungibleToken.Collection>()
        let metadataViewType = Type<@AnyResource{MetadataViews.ResolverCollection}>()
        var item: CollectionDisplay? =  nil

          if let type = account.type(at: path) {
            let isResource = type.isSubtype(of: resourceType)
            let isNFTCollection = type.isSubtype(of: collectionType)
            let conformedMetadataViews = type.isSubtype(of: metadataViewType)

            var tokenIDs: [UInt64] = []
            if isNFTCollection && conformedMetadataViews {
              if let collectionRef = account.borrow<&{MetadataViews.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path) {
                tokenIDs = collectionRef.getIDs()

                // TODO: move to a list
                if tokenIDs.length > 0 
                && path != /storage/RaribleNFTCollection 
                && path != /storage/ARTIFACTPackV3Collection
                && path != /storage/ArleeScene {
                  let resolver = collectionRef.borrowViewResolver(id: tokenIDs[0]) 
                  if let display = MetadataViews.getNFTCollectionDisplay(resolver) {
                    item = CollectionDisplay(
                      name: display.name,
                      squareImage: display.squareImage.file.uri(),
                      mediaType: display.squareImage.mediaType
                    )
                  }
                }
              }
            }
          }

        return item
      }

      pub fun main(parent: Address, childAccount: Address): [NFTCollection] {
          let manager = getAuthAccount(parent).borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")

          // Address -> Collection Type -> ownedNFTs

          let providerType = Type<Capability<&{NonFungibleToken.Provider}>>()
          let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic}>()

          // Iterate through child accounts

          let acct = getAuthAccount(childAccount)
          let foundTypes: [Type] = []
          let nfts: {String: [UInt64]} = {}
          let collectionList: [NFTCollection] = []
          let childAcct = manager.borrowAccount(addr: childAccount) ?? panic("child account not found")
          
          // get all private paths
          acct.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
              // Check which private paths have NFT Provider AND can be borrowed
              if !type.isSubtype(of: providerType){
                  return true
              }
              if let cap = childAcct.getCapability(path: path, type: Type<&{NonFungibleToken.Provider}>()) {
                  let providerCap = cap as! Capability<&{NonFungibleToken.Provider}> 

                  if !providerCap.check(){
                      // if this isn't a provider capability, exit the account iteration function for this path
                      return true
                  }
                  foundTypes.append(cap.borrow<&AnyResource>()!.getType())
              }
              return true
          })

          // iterate storage, check if typeIdsWithProvider contains the typeId, if so, add to nfts
          acct.forEachStored(fun (path: StoragePath, type: Type): Bool {

              if foundTypes == nil {
                  return true
              }

              for idx, value in foundTypes {
                  let value = foundTypes!

                  if value[idx] != type {
                      continue
                  } else {
                      if type.isInstance(collectionType) {
                          continue
                      }
                      if let collection = acct.borrow<&{NonFungibleToken.CollectionPublic}>(from: path) { 
                          nfts.insert(key: type.identifier, collection.getIDs())
                          collectionList.append(
                            NFTCollection(
                              id: type.identifier,
                              path: path.toString(),
                              display: getDisplay(address: childAccount, path: path),
                              idList: collection.getIDs()
                            )
                          )
                      }
                      continue
                  }
              }
              return true
          })

          return collectionList
      }

    `,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  queryAccessibleFt = async (address: string, childAccount: string) => {
    const result = await fcl.query({
      cadence: `
      import HybridCustody from 0xHybridCustody
      import MetadataViews from 0xMetadataViews
      import FungibleToken from 0xFungibleToken
      import NonFungibleToken from 0xNonFungibleToken

      pub struct TokenInfo {
        pub let id: String
        pub let balance: UFix64

        init(id: String, balance: UFix64) {
          self.id = id
          self.balance = balance
        }
      }

      pub fun main(parent: Address, childAddress: Address): [TokenInfo] {
          let manager = getAuthAccount(parent).borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) ?? panic ("manager does not exist")

          var typeIdsWithProvider: {Address: [Type]} = {}

          var coinInfoList: [TokenInfo] = []
          let providerType = Type<Capability<&{FungibleToken.Provider}>>()
          let vaultType: Type = Type<@FungibleToken.Vault>()

          // Iterate through child accounts

              let acct = getAuthAccount(childAddress)
              let foundTypes: [Type] = []
              let vaultBalances: {String: UFix64} = {}
              let childAcct = manager.borrowAccount(addr: childAddress) ?? panic("child account not found")
              // get all private paths
              acct.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
                  // Check which private paths have NFT Provider AND can be borrowed
                  if !type.isSubtype(of: providerType){
                      return true
                  }
                  if let cap = childAcct.getCapability(path: path, type: Type<&{FungibleToken.Provider}>()) {
                      let providerCap = cap as! Capability<&{FungibleToken.Provider}> 

                      if !providerCap.check(){
                          // if this isn't a provider capability, exit the account iteration function for this path
                          return true
                      }
                      foundTypes.append(cap.borrow<&AnyResource>()!.getType())
                  }
                  return true
              })
              typeIdsWithProvider[childAddress] = foundTypes

              // iterate storage, check if typeIdsWithProvider contains the typeId, if so, add to vaultBalances
              acct.forEachStored(fun (path: StoragePath, type: Type): Bool {

                  if typeIdsWithProvider[childAddress] == nil {
                      return true
                  }

                  for key in typeIdsWithProvider.keys {
                      for idx, value in typeIdsWithProvider[key]! {
                          let value = typeIdsWithProvider[key]!

                          if value[idx] != type {
                              continue
                          } else {
                              if type.isInstance(vaultType) {
                                  continue
                              }
                              if let vault = acct.borrow<&FungibleToken.Vault>(from: path) { 
                                  coinInfoList.append(
                                    TokenInfo(id: type.identifier, balance: vault.balance)
                                  )
                              }
                              continue
                          }
                      }
                  }
                  return true
              })
          
          return coinInfoList
      }

    `,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  checkChildAccountMeta = async (address: string) => {
    const result = await fcl.query({
      cadence: `
      import HybridCustody from 0xHybridCustody
      import MetadataViews from 0xMetadataViews

      pub fun main(parent: Address): {Address: AnyStruct} {
        let acct = getAuthAccount(parent)
        let m = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")
        var data: {Address: AnyStruct} = {}
        for address in m.getChildAddresses() {
            let c = m.borrowAccount(addr: address) ?? panic("child not found")
            let d = c.resolveView(Type<MetadataViews.Display>())
            data.insert(key: address, d)
        }
        return data
    }

    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  };

  checkChildAccountNFT = async (address: string) => {
    const result = await fcl.query({
      cadence: `
      import NonFungibleToken from 0xNonFungibleToken
      import MetadataViews from 0xMetadataViews
      import LinkedAccounts from 0xChildAccount

      /// Custom struct to make interpretation of NFT & Collection data easy client side
      pub struct NFTData {
          pub let name: String
          pub let description: String
          pub let thumbnail: String
          pub let resourceID: UInt64
          pub let ownerAddress: Address?
          pub let collectionName: String?
          pub let collectionDescription: String?
          pub let collectionURL: String?
          pub let collectionStoragePathIdentifier: String
          pub let collectionPublicPathIdentifier: String?

          init(
              name: String,
              description: String,
              thumbnail: String,
              resourceID: UInt64,
              ownerAddress: Address?,
              collectionName: String?,
              collectionDescription: String?,
              collectionURL: String?,
              collectionStoragePathIdentifier: String,
              collectionPublicPathIdentifier: String?
          ) {
              self.name = name
              self.description = description
              self.thumbnail = thumbnail
              self.resourceID = resourceID
              self.ownerAddress = ownerAddress
              self.collectionName = collectionName
              self.collectionDescription = collectionDescription
              self.collectionURL = collectionURL
              self.collectionStoragePathIdentifier = collectionStoragePathIdentifier
              self.collectionPublicPathIdentifier = collectionPublicPathIdentifier
          }
      }

      /// Helper function that retrieves data about all publicly accessible NFTs in an account
      ///
      pub fun getAllViewsFromAddress(_ address: Address): [NFTData] {
          // Get the account
          let account: AuthAccount = getAuthAccount(address)
          // Init for return value
          let data: [NFTData] = []
          // Assign the types we'll need
          let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>()
          let displayType: Type = Type<MetadataViews.Display>()
          let collectionDisplayType: Type = Type<MetadataViews.NFTCollectionDisplay>()
          let collectionDataType: Type = Type<MetadataViews.NFTCollectionData>()

          // Iterate over each public path
          account.forEachStored(fun (path: StoragePath, type: Type): Bool {
              // Check if it's a Collection we're interested in, if so, get a reference
              if type.isSubtype(of: collectionType) {
                  if let collectionRef = account.borrow<&{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(from: path) {
                      // Iterate over the Collection's NFTs, continuing if the NFT resolves the views we want
                      for id in collectionRef.getIDs() {
                          let resolverRef: &{MetadataViews.Resolver} = collectionRef.borrowViewResolver(id: id)
                          if let display = resolverRef.resolveView(displayType) as! MetadataViews.Display? {
                              let collectionDisplay = resolverRef.resolveView(collectionDisplayType) as! MetadataViews.NFTCollectionDisplay?
                              let collectionData = resolverRef.resolveView(collectionDataType) as! MetadataViews.NFTCollectionData?
                              // Build our NFTData struct from the metadata
                              let nftData = NFTData(
                                  name: display.name,
                                  description: display.description,
                                  thumbnail: display.thumbnail.uri(),
                                  resourceID: resolverRef.uuid,
                                  ownerAddress: resolverRef.owner?.address,
                                  collectionName: collectionDisplay?.name,
                                  collectionDescription: collectionDisplay?.description,
                                  collectionURL: collectionDisplay?.externalURL?.url,
                                  collectionStoragePathIdentifier: path.toString(),
                                  collectionPublicPathIdentifier: collectionData?.publicPath?.toString()
                              )
                              // Add it to our data
                              data.append(nftData)
                          }
                      }
                  }
              }
              return true
          })
          return data
      }

      /// Script that retrieve data about all publicly accessible NFTs in an account and any of its
      /// child accounts
      ///
      /// Note that this script does not consider accounts with exceptionally large collections 
      /// which would result in memory errors. To compose a script that does cover accounts with
      /// a large number of sub-accounts and/or NFTs within those accounts, see example 5 in
      /// the NFT Catalog's README: https://github.com/dapperlabs/nft-catalog and adapt for use
      /// with LinkedAccounts.Collection
      ///
      pub fun main(address: Address): {Address: [NFTData]} {
          let allNFTData: {Address: [NFTData]} = {}
          
          // Add all retrieved views to the running mapping indexed on address
          allNFTData.insert(key: address, getAllViewsFromAddress(address))
          
          /* Iterate over any child accounts */ 
          //
          // Get reference to LinkedAccounts.Collection if it exists
          if let collectionRef = getAccount(address).getCapability<&LinkedAccounts.Collection{LinkedAccounts.CollectionPublic}>(
                  LinkedAccounts.CollectionPublicPath
              ).borrow() {
              // Iterate over each linked account in LinkedAccounts.Collection
              for childAddress in collectionRef.getLinkedAccountAddresses() {
                  if !allNFTData.containsKey(childAddress) {
                      // Insert the NFT metadata for those NFTs in each child account
                      // indexing on the account's address
                      allNFTData.insert(key: childAddress, getAllViewsFromAddress(childAddress))
                  }
              }
          }
          return allNFTData 
      }

    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  };

  getFlownsInbox = async (domain: string, root = 'meow') => {
    const detail = await fcl.query({
      cadence: `
      import Flowns from 0xFlowns
      import Domains from 0xDomains
      
      pub fun getDetail(nameHash: String): Domains.DomainDetail? {
        let address = Domains.getRecords(nameHash) ?? panic("Domain not exist")
        let account = getAccount(address)
        let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
        let collection = collectionCap.borrow()!
        var detail: Domains.DomainDetail? = nil

        let id = Domains.getDomainId(nameHash)
        if id != nil && !Domains.isDeprecated(nameHash: nameHash, domainId: id!) {
          let domain = collection.borrowDomain(id: id!)
          detail = domain.getDetail()
        }

        return detail
      }
      
      pub fun main(name: String, root: String) : Domains.DomainDetail? {
        let prefix = "0x"
        let rootHahsh = Flowns.hash(node: "", lable: root)
        let nameHash = prefix.concat(Flowns.hash(node: rootHahsh, lable: name))
        return getDetail(nameHash: nameHash)
      }
    `,
      args: (arg, t) => [arg(domain, t.String), arg(root, t.String)],
    });
    return detail;
  };

  getFlownsAddress = async (domain: string, root = 'fn') => {
    const address = await fcl.query({
      cadence: `
      import Flowns from 0xFlowns
      import Domains from 0xDomains

      pub fun main(name: String, root: String) : Address? {
        let prefix = "0x"
        let rootHahsh = Flowns.hash(node: "", lable: root)
        let namehash = prefix.concat(Flowns.hash(node: rootHahsh, lable: name))
        var address = Domains.getRecords(namehash)
        return address
      }
    `,
      args: (arg, t) => [arg(domain, t.String), arg(root, t.String)],
    });
    return address;
  };

  getFlownsDomainsByAddress = async (address: string) => {
    const domains = await fcl.query({
      cadence: `
      import Domains from 0xDomains
      // address: Flow address
      pub fun main(address: Address): [Domains.DomainDetail] {
        let account = getAccount(address)
        let collectionCap = account.getCapability<&{Domains.CollectionPublic}>(Domains.CollectionPublicPath)
        let collection = collectionCap.borrow()!
        let domains:[Domains.DomainDetail] = []
        let ids = collection.getIDs()

        for id in ids {
          let domain = collection.borrowDomain(id: id)
          let detail = domain.getDetail()
          domains.append(detail)
        }

        return domains
      }
    `,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return domains;
  };

  getFindAddress = async (domain: string) => {
    const address = await fcl.query({
      cadence: `
      import FIND from 0xFind
      //Check the status of a fin user
      pub fun main(name: String) : Address? {
          let status=FIND.status(name)
          return status.owner
      }
    `,
      args: (arg, t) => [arg(domain, t.String)],
    });
    return address;
  };

  getFindDomainByAddress = async (domain: string) => {
    const address = await fcl.query({
      cadence: `
      import FIND from 0xFind

      pub fun main(address: Address) : String?{
        return FIND.reverseLookup(address)
      }
    `,
      args: (arg, t) => [arg(domain, t.Address)],
    });
    return address;
  };

  getTransaction = async (address: string, limit: number, offset: number) => {
    const config = this.store.config.account_transaction;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      limit,
      offset,
    });

    return data;
  };

  getTransfers = async (address: string, after = '', limit: number) => {
    const config = this.store.config.get_transfers;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      after,
      limit,
    });

    return data;
  };

  getManualAddress = async () => {
    const config = this.store.config.manual_address;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  deviceList = async () => {
    const config = this.store.config.device_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };


  keyList = async () => {
    const config = this.store.config.key_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };


  getLocation = async () => {
    const config = this.store.config.get_location;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  addDevice = async (params) => {
    const config = this.store.config.add_device;
    const data = await this.sendRequest(config.method, config.path,{}, params);

    return data;
  };

  getInstallationId = async () => {
    const installations  = await getInstallations(app);
    const id = await getId(installations);
    return id;
  };
  
  searchUser = async (keyword: string) => {
    const config = this.store.config.search_user;
    const data = await this.sendRequest(config.method, config.path, {
      keyword,
    });

    return data;
  };

  getTokenInfo = async (name: string): Promise<TokenModel | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const coins = await remoteFetch.flowCoins();
    return coins.find(
      (item) => item.symbol.toLowerCase() == name.toLowerCase()
    );
  };

  getTokenInfoByContract = async (
    contractName: string
  ): Promise<TokenModel | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const coins = await remoteFetch.flowCoins();
    return coins.find(
      (item) => item.contract_name.toLowerCase() == contractName.toLowerCase()
    );
  };

  getAllToken = async () => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const coins = await remoteFetch.flowCoins();
    return coins;
  };

  getNFTCollectionInfo = async (
    contract_name: string
  ): Promise<NFTModel | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const tokenList = await remoteFetch.nftCollection();

    console.log('getNFTCollectionInfo -->', contract_name, tokenList);
    // const network = await userWalletService.getNetwork();
    return tokenList.find((item) => item.id === contract_name);
  };

  getSwapInfo = async (
  ): Promise<boolean> => {
    remoteFetch.remoteConfig().then((res) => {

      console.log('getNFTCollectionInfo -->', res);
      return res.features.swap;
    }).catch((err) => {

      console.log('getNFTCollectionInfo -->', err);
    });
    return false;
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getAllTokenInfo = async (fiterNetwork = true): Promise<TokenModel[]> => {
    const list = await remoteFetch.flowCoins();
    const network = await userWalletService.getNetwork();
    return fiterNetwork ? list.filter((item) => item.address[network]) : list;
  };

  getAllNft = async (fiterNetwork = true): Promise<NFTModel[]> => {
    const list = await remoteFetch.nftCollection();
    // const network = await userWalletService.getNetwork();
    return list;
  };

  isWalletTokenStorageEnabled = async (tokenSymbol: string) => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const address = await userWalletService.getCurrentAddress();
    const tokenInfo = await this.getTokenInfo(tokenSymbol);
    if (!tokenInfo) {
      return;
    }
    return await this.isTokenStorageEnabled(address, tokenInfo);
  };

  getWalletTokenBalance = async (tokenSymbol: string) => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const address = await userWalletService.getCurrentAddress();
    const tokenInfo = await this.getTokenInfo(tokenSymbol);
    if (!tokenInfo) {
      return;
    }
    return await this.getTokenBalanceWithModel(address, tokenInfo);
  };

  getTokenBalance = async (address: string, tokenSymbol: string) => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const tokenInfo = await this.getTokenInfo(tokenSymbol);
    if (!tokenInfo) {
      return;
    }
    return await this.getTokenBalanceWithModel(address, tokenInfo);
  };

  getStorageInfo = async (address: string): Promise<StorageInfo> => {
    const result = await fcl.query({
      cadence: `
        pub fun main(addr: Address): {String: UInt64} {
          let acct = getAccount(addr)
          let ret: {String: UInt64} = {}
          ret["capacity"] = acct.storageCapacity
          ret["used"] = acct.storageUsed
          ret["available"] = acct.storageCapacity - acct.storageUsed
          return ret
        }
    `,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return {
      available: result['available'],
      used: result['used'],
      capacity: result['capacity'],
    };
  };

  getTokenBalanceWithModel = async (address: string, token: TokenModel) => {
    const network = await userWalletService.getNetwork();
    const cadence = `
    import FungibleToken from 0xFungibleToken
    import <Token> from <TokenAddress>

    pub fun main(address: Address): UFix64 {
      let account = getAccount(address)

      let vaultRef = account
        .getCapability(<TokenBalancePath>)
        .borrow<&<Token>.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow Balance capability")

      return vaultRef.balance
    }
  `
      .replaceAll('<Token>', token.contract_name)
      .replaceAll('<TokenBalancePath>', token.storage_path.balance)
      .replaceAll('<TokenAddress>', token.address[network]);
    const balance = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balance;
  };

  getEnabledTokenList = async () => {
    const tokenList = await remoteFetch.flowCoins();
    const address = await userWalletService.getCurrentAddress();
    const network = await userWalletService.getNetwork();
    const tokens = tokenList.filter((token) => token.address[network]);
    const values = await this.isTokenListEnabled(address, tokens, network);
    // const data = values.map((value, index) => ({isEnabled: value, token: tokenList[index]}))
    return values
      .map((value, index) => {
        if (value) {
          return tokens[index];
        }
      })
      .filter((item) => item);
  };

  isTokenStorageEnabled = async (address: string, token: TokenModel) => {
    const network = await userWalletService.getNetwork();
    const cadence = `
    import FungibleToken from 0xFungibleToken
    import <Token> from <TokenAddress>
    
    pub fun main(address: Address) : Bool {
       let receiver: Bool = getAccount(address)
       .getCapability<&<Token>.Vault{FungibleToken.Receiver}>(<TokenReceiverPath>)
       .check()
       let balance: Bool = getAccount(address)
        .getCapability<&<Token>.Vault{FungibleToken.Balance}>(<TokenBalancePath>)
        .check()
        return receiver && balance
     }
  `
      .replaceAll('<Token>', token.contract_name)
      .replaceAll('<TokenBalancePath>', token.storage_path.balance)
      .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
      .replaceAll('<TokenAddress>', token.address[network]);

    const isEnabled = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return isEnabled;
  };

  isTokenListEnabled = async (
    address: string,
    allTokens: TokenModel[],
    network
  ) => {
    const tokens = allTokens;

    const tokenImports = tokens
      .map((token) =>
        'import <Token> from <TokenAddress>'
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address[network])
      )
      .join('\r\n');

    const tokenFunctions = tokens
      .map((token) =>
        `
      pub fun check<Token>Vault(address: Address) : Bool {
        let receiver: Bool = getAccount(address)
        .getCapability<&<Token>.Vault{FungibleToken.Receiver}>(<TokenReceiverPath>)
        .check()
        let balance: Bool = getAccount(address)
         .getCapability<&<Token>.Vault{FungibleToken.Balance}>(<TokenBalancePath>)
         .check()
         return receiver && balance
      }
      `
          .replaceAll('<TokenBalancePath>', token.storage_path.balance)
          .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address[network])
      )
      .join('\r\n');

    const tokenCalls = tokens
      .map((token) =>
        `
      check<Token>Vault(address: address)
      `.replaceAll('<Token>', token.contract_name)
      )
      .join(',');

    const cadence = `
      import FungibleToken from 0xFungibleToken
      <TokenImports>

      <TokenFunctions>

      pub fun main(address: Address) : [Bool] {
        return [<TokenCall>]
      }
    `
      .replaceAll('<TokenFunctions>', tokenFunctions)
      .replaceAll('<TokenImports>', tokenImports)
      .replaceAll('<TokenCall>', tokenCalls);

    const isEnabledList = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  getTokenListBalance = async (address: string, allTokens: [TokenModel]) => {
    const network = await userWalletService.getNetwork();

    const tokens = allTokens.filter((token) => token.address[network]);

    const tokenImports = tokens
      .map((token) =>
        'import <Token> from <TokenAddress>'
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address[network])
      )
      .join('\r\n');

    const tokenFunctions = tokens
      .map((token) =>
        `
      pub fun check<Token>Balance(address: Address) : UFix64 {
        let account = getAccount(address)

        let vaultRef = account
          .getCapability(<TokenBalancePath>)
          .borrow<&<Token>.Vault{FungibleToken.Balance}>()
          ?? panic("Could not borrow Balance capability")

        return vaultRef.balance
      }
      `
          .replaceAll('<TokenBalancePath>', token.storage_path.balance)
          .replaceAll('<TokenReceiverPath>', token.storage_path.receiver)
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address[network])
      )
      .join('\r\n');

    const tokenCalls = tokens
      .map((token) =>
        `
      check<Token>Balance(address: address)
      `.replaceAll('<Token>', token.contract_name)
      )
      .join(',');

    const cadence = `
      import FungibleToken from 0xFungibleToken
      <TokenImports>

      <TokenFunctions>

      pub fun main(address: Address) : [UFix64] {
        return [<TokenCall>]
      }
    `
      .replaceAll('<TokenFunctions>', tokenFunctions)
      .replaceAll('<TokenImports>', tokenImports)
      .replaceAll('<TokenCall>', tokenCalls);

    const balanceList = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return balanceList;
  };

  getBlockList = async (
    hosts: string[] = [],
    forceCheck = false
  ): Promise<string[]> => {
    return await googleSafeHostService.getBlockList(hosts, forceCheck);
  };

  getEnabledNFTList = async (nftData) => {
    const address = await userWalletService.getCurrentAddress();
    const requestLength = 50;
    const promises: any[] = [];
    for (let i = 0; i < nftData.length; i += requestLength) {
      const requestList = nftData.slice(i, i + requestLength);
      promises.push(this.checkNFTListEnabledNew(address, requestList));
    }

    const promiseResult = await Promise.all(promises);
    const values: any[] = promiseResult.flat();

    // const network = await userWalletService.getNetwork();
    // const notEmptyTokenList = tokenList.filter(value => value.address[network] !== null && value.address[network] !== '' )
    // const data = values.map((value, index) => ({isEnabled: value, token: tokenList[index]}))
    const result = values
      .map((value, index) => {
        if (value) {
          return nftData[index];
        }
        return null;
      })
      .filter((item) => item);
    return result;
  };

  checkNFTListEnabledNew = async (
    address: string,
    allTokens
  ): Promise<NFTModel[]> => {
    const tokenImports = allTokens
      .map((token) =>
        'import <Token> from <TokenAddress>'
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address)
      )
      .join('\r\n');
    const tokenFunctions = allTokens
      .map((token) =>
        `
      pub fun check<Token>Vault(address: Address) : Bool {
        let account = getAccount(address)

        let vaultRef = account
        .getCapability<&{NonFungibleToken.CollectionPublic}>(<TokenCollectionPublicPath>)
        .check()

        return vaultRef
      }
      `
          .replaceAll('<TokenCollectionPublicPath>', token.path.public_path)
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address)
      )
      .join('\r\n');

    const tokenCalls = allTokens
      .map((token) =>
        `
      check<Token>Vault(address: address)
      `.replaceAll('<Token>', token.contract_name)
      )
      .join(',');

    const cadence = `
      import NonFungibleToken from 0xNonFungibleToken
      <TokenImports>

      <TokenFunctions>

      pub fun main(address: Address) : [Bool] {
        return [<TokenCall>]
      }
    `
      .replaceAll('<TokenFunctions>', tokenFunctions)
      .replaceAll('<TokenImports>', tokenImports)
      .replaceAll('<TokenCall>', tokenCalls);

    const enabledList = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return enabledList;
  };

  checkNFTListEnabled = async (
    address: string,
    allTokens: NFTModel[]
  ): Promise<NFTModel[]> => {
    const tokens = allTokens;
    const tokenImports = tokens
      .map((token) =>
        'import <Token> from <TokenAddress>'
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address)
      )
      .join('\r\n');

    const tokenFunctions = tokens
      .map((token) =>
        `
      pub fun check<Token>Vault(address: Address) : Bool {
        let account = getAccount(address)

        let vaultRef = account
        .getCapability<&{NonFungibleToken.CollectionPublic}>(<TokenCollectionPublicPath>)
        .check()

        return vaultRef
      }
      `
          .replaceAll('<TokenCollectionPublicPath>', token.path.public_path)
          .replaceAll('<Token>', token.contract_name)
          .replaceAll('<TokenAddress>', token.address)
      )
      .join('\r\n');

    const tokenCalls = tokens
      .map((token) =>
        `
      check<Token>Vault(address: address)
      `.replaceAll('<Token>', token.contract_name)
      )
      .join(',');

    const cadence = `
      import NonFungibleToken from 0xNonFungibleToken
      <TokenImports>

      <TokenFunctions>

      pub fun main(address: Address) : [Bool] {
        return [<TokenCall>]
      }
    `
      .replaceAll('<TokenFunctions>', tokenFunctions)
      .replaceAll('<TokenImports>', tokenImports)
      .replaceAll('<TokenCall>', tokenCalls);

    const enabledList = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return enabledList;
  };

  getTransactionTemplate = async (cadence: string, network: string) => {
    console.log('getTransactionTemplate ->');
    const base64 = Buffer.from(cadence, 'utf8').toString('base64');

    const data = {
      cadence_base64: base64,
      network: network.toLowerCase(),
    };
    const init = {
      method: 'POST',
      async: true,
      body: JSON.stringify(data),
      headers: {
        Network: network,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    console.log('getTransactionTemplate ->', init);
    const response = await fetch(
      'https://flix.flow.com/v1/templates/search',
      init
    );
    const template = await response.json();

    console.log('template ->', template);

    const auditorsResponse = await fetch(
      `https://flix.flow.com/v1/auditors?network=${network}`
    );
    const auditors = await auditorsResponse.json();
    console.log('auditors ->', auditors);

    fcl.config().put(
      'flow.auditors',
      auditors.map((item) => item.address)
    );

    const audits =
      await fcl.InteractionTemplateUtils.getInteractionTemplateAudits({
        template: template,
      });

    console.log('audits ->', audits);
    const addresses = Object.keys(audits).filter((address) => audits[address]);

    if (addresses.length <= 0) {
      return null;
    }

    const result = auditors.filter((item) => addresses.includes(item.address));
    console.log('result ->', result);
    if (result.length <= 0) {
      return null;
    }
    return {
      auditor: result[0],
      template,
    };
  };

  validateRecaptcha = async (token: string) => {
    const config = this.store.config.validate_recaptcha;
    const data = await this.sendRequest(config.method, config.path, {
      token,
    });

    return data;
  };

  flowScanQuery = async (query: string, operationName: string) => {
    const config = this.store.config.account_query;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        query,
        operation_name: operationName,
      }
    );

    return data;
  };

  pingNetwork = async (network: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://rest-${network}.onflow.org/v1/blocks?height=sealed`
      );
      const result = await response.json();
      return result[0].header != null;
    } catch (err) {
      return false;
    }
  };

  updateProfilePreference = async (privacy: number) => {
    const config = this.store.config.profile_preference;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        private: privacy,
      }
    );

    return data;
  };

  updateProfile = async (nickname: string, avatar: string) => {
    const config = this.store.config.profile_update;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        nickname: nickname,
        avatar: avatar,
      }
    );

    return data;
  };

  flownsPrepare = async () => {
    const config = this.store.config.flowns_prepare;
    const data = await this.sendRequest(config.method, config.path, {}, {});
    return data;
  };

  flownsAuthTransaction = async (transaction, envelope: string) => {
    const message = {
      envelope_message: envelope,
    };
    // console.log({transaction,message})
    const config = this.store.config.flowns_signature;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        transaction,
        message,
      }
    );

    return data;
  };

  flownsTransaction = async (transaction, envelope: string) => {
    const message = {
      envelope_message: envelope,
    };
    const config = this.store.config.flowns_signature;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        transaction,
        message,
      }
    );

    return data;
  };

  swapEstimate = async (
    network: string,
    inToken: string,
    outToken: string,
    amount
  ) => {
    const response = await fetch(
      `https://lilico.app/api/swap/v1/${network}/estimate?inToken=${inToken}&outToken=${outToken}&inAmount=${amount}`
    );
    return response.json();
  };

  swapOutEstimate = async (
    network: string,
    inToken: string,
    outToken: string,
    amount
  ) => {
    const response = await fetch(
      `https://lilico.app/api/swap/v1/${network}/estimate?inToken=${inToken}&outToken=${outToken}&outAmount=${amount}`
    );
    return response.json();
  };

  fetchTokenList = async (network: string) => {
    const response =
      await fetch(`https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/src/tokens/flow-${network}.tokenlist.json
    `);
    return response.json();
  };

  swapPairs = async (network: string) => {
    const response = await fetch(
      `https://lilico.app/api/swap/v1/${network}/pairs`
    );
    console.log(response);
    return response.json();
  };

  nftCatalog = async () => {
    const { data } = await this.sendRequest('GET', `api/nft/collections`, {}, {}, 'https://lilico.app/')
    return data
  };

  nftCatalogList = async (address: string, limit: any, offset: any) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/nft/list?address=${address}&limit=${limit}&offset=${offset}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  nftCatalogCollections = async (address: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/nft/id?address=${address}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  nftCatalogCollectionList = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any
  ) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/nft/collectionList?address=${address}&limit=${limit}&offset=${offset}&collectionIdentifier=${contractName}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  nftCollectionApiPaging = async (address: string, contractName: string, limit: any, offset: any, network: string) => {
    const { data } = await this.sendRequest('GET', `/api/storage/${network}/nft?address=${address}&limit=${limit}&offset=${offset}&path=${contractName}`, {}, {}, "https://lilico.app")
    return data
  };

  nftCollectionInfo = async (address: string, contractName: string, limit: any, offset: any, network: string) => {
    const { data } = await this.sendRequest('GET', `/api/storage/${network}/nft/collection?address=${address}&path=${contractName}`, {}, {}, "https://lilico.app")
    return data
  };

  nftCollectionList = async () => {
    const { data } = await this.sendRequest(
      'GET',
      '/api/nft/collections',
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  genTx = async (contract_name: string) => {
    const network = await userWalletService.getNetwork();
    const app = getApp(process.env.NODE_ENV!);
    const user = await getAuth(app).currentUser;

    // Wait for firebase auth to complete
    await waitForAuthInit();

    const init = {
      headers: {
        Network: network,
      },
    };

    if (user !== null) {
      const idToken = await user.getIdToken();
      init.headers['Authorization'] = idToken;
    } else {
      // If no user, then sign in as anonymous first
      await signInAnonymously(auth);
      const anonymousUser = await getAuth(app).currentUser;
      const idToken = await anonymousUser?.getIdToken();
      init.headers['Authorization'] = idToken;
    }
    const response = await fetch(
      `${WEB_NEXT_URL}/api/nft/gentx?collectionIdentifier=${contract_name}`,
      init
    );

    return response.json();
  };
}

export default new OpenApiService();
