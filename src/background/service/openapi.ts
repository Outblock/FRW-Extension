import * as fcl from '@onflow/fcl';
import dayjs from 'dayjs';
import type { TokenInfo } from 'flow-native-token-registry';
import log from 'loglevel';

import { storage } from '@/background/webapi';
import { type FeatureFlagKey, type FeatureFlags } from '@/shared/types/feature-types';
import { isValidFlowAddress, isValidEthereumAddress } from '@/shared/utils/address';
import { getStringFromHashAlgo, getStringFromSignAlgo } from '@/shared/utils/algo';
import { getPeriodFrequency } from '@/shared/utils/getPeriodFrequency';
import { getScripts, findKeyAndInfo } from 'background/utils';
import { getFirbaseFunctionUrl } from 'background/utils/firebaseConfig';
import fetchConfig from 'background/utils/remoteConfig';
import { INITIAL_OPENAPI_URL, WEB_NEXT_URL } from 'consts';

import {
  getAppInstallationId,
  getUserToken,
  signInWithToken,
  verifyAuthStatus,
} from './authentication';
import {
  type AccountKey,
  type CheckResponse,
  type SignInResponse,
  type UserInfoResponse,
  type FlowTransaction,
  type SendTransactionResponse,
  type TokenModel,
  type NFTModel,
  type StorageInfo,
  type NewsItem,
  type NewsConditionType,
  Period,
  PriceProvider,
} from './networkModel';

import {
  userWalletService,
  coinListService,
  addressBookService,
  userInfoService,
  transactionService,
  nftService,
  googleSafeHostService,
  mixpanelTrack,
  newsService,
} from './index';

const remoteFetch = fetchConfig;

const DATA_CONFIG = {
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
    path: '/v1/user/address/crescendo',
    method: 'post',
    params: [],
  },
  create_flow_network_address: {
    path: '/v1/user/address/network',
    method: 'post',
    params: ['account_key', 'network'],
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
  loginv3: {
    path: '/v3/login',
    method: 'post',
    params: ['signature', 'account_key', 'device_info'],
  },
  importKey: {
    path: '/v3/import',
    method: 'post',
    params: ['username', 'account_key', 'device_info', 'backup_info', 'address'],
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
  add_device_v3: {
    path: '/v3/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
  },
  get_location: {
    path: '/v1/user/location',
    method: 'get',
    params: [],
  },
  sync_device: {
    path: '/v3/sync',
    method: 'post',
    params: ['account_key', 'device_info '],
  },
  check_import: {
    path: '/v3/checkimport',
    method: 'get',
    params: ['key'],
  },
  get_version: {
    path: '/version',
    method: 'get',
    params: [],
  },
};

class OpenApiService {
  init = async () => {
    await userWalletService.setupFcl();
  };

  checkAuthStatus = async () => {
    return verifyAuthStatus();
  };

  sendRequest = async (
    method = 'GET',
    url = '',
    params = {},
    data = {},
    host = INITIAL_OPENAPI_URL
  ) => {
    // Default options are marked with *
    let requestUrl = '';

    if (Object.keys(params).length) {
      requestUrl = host + url + '?' + new URLSearchParams(params).toString();
    } else {
      requestUrl = host + url;
    }
    const network = await userWalletService.getNetwork();

    const idToken = await getUserToken();
    const init: RequestInit = {
      method,
      headers: {
        Network: network,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + idToken,
      },
    };

    if (method.toUpperCase() !== 'GET') {
      init.body = JSON.stringify(data);
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
        return [PriceProvider.binance, PriceProvider.kakren, PriceProvider.huobi];
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

  getUSDCPrice = async (provider = PriceProvider.binance): Promise<CheckResponse> => {
    const config = DATA_CONFIG.crypto_map;
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
      default:
        return '';
    }
  };

  getTokenPrices = async (storageKey: string, isEvm: boolean = false) => {
    const cachedPrices = await storage.getExpiry(storageKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    const pricesMap: Record<string, string> = {};

    try {
      const response = await this.sendRequest('GET', '/api/prices', {}, {}, WEB_NEXT_URL);
      const data = response?.data || [];

      data.forEach((token) => {
        if (isEvm && token.evmAddress) {
          // EVM price
          const { rateToUSD, evmAddress } = token;
          const key = evmAddress.toLowerCase();
          pricesMap[key] = Number(rateToUSD).toFixed(8);
        } else if (!isEvm && token.contractName && token.contractAddress) {
          // Flow chain price
          const { rateToUSD, contractName, contractAddress } = token;
          const key = `${contractName.toLowerCase()}${contractAddress.toLowerCase()}`;
          pricesMap[key] = Number(rateToUSD).toFixed(8);
        } else if (isEvm && token.symbol) {
          // Handle fallback for EVM tokens
          const { rateToUSD, symbol } = token;
          const key = symbol.toUpperCase();
          pricesMap[key] = Number(rateToUSD).toFixed(8);
        }
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }

    await storage.setExpiry(storageKey, pricesMap, 300000);
    return pricesMap;
  };

  getPricesBySymbol = async (symbol: string, data) => {
    const key = symbol.toUpperCase();
    return data[key];
  };

  getPricesByAddress = async (symbol: string, data) => {
    const key = symbol.toLowerCase();
    return data[key];
  };

  getPricesByKey = async (symbol: string, data) => {
    const key = symbol.toLowerCase();
    return data[key];
  };

  getPricesByEvmaddress = async (address: string, data) => {
    const key = address.toLowerCase();
    return data[key];
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

  getTokenPrice = async (token: string, provider = PriceProvider.binance) => {
    const config = DATA_CONFIG.crypto_flow;
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

    const config = DATA_CONFIG.crypto_history;
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
    await signInWithToken(token);
  };

  private clearAllStorage = () => {
    nftService.clear();
    userInfoService.removeUserInfo();
    coinListService.clear();
    addressBookService.clear();
    userWalletService.clear();
    transactionService.clear();
    newsService.clear();
  };

  checkUsername = async (username: string) => {
    const config = DATA_CONFIG.check_username;
    const data = await this.sendRequest(config.method, config.path, {
      username,
    });
    return data;
  };

  register = async (account_key: AccountKey, username: string) => {
    // Track the time until account_created is called
    mixpanelTrack.time('account_created');

    const config = DATA_CONFIG.register;
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
    await storage.set('currentId', data.data.id);

    // Track the registration
    mixpanelTrack.track('account_created', {
      public_key: account_key.public_key,
      sign_algo: getStringFromSignAlgo(account_key.sign_algo),
      hash_algo: getStringFromHashAlgo(account_key.hash_algo),
    });
    return data;
  };

  login = async (
    public_key: string,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = DATA_CONFIG.login;
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
      await storage.set('currentId', result.data.id);
    }
    return result;
  };

  loginV2 = async (
    public_key: string,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = DATA_CONFIG.loginv2;
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
      await storage.set('currentId', result.data.id);
    }
    return result;
  };

  loginV3 = async (
    account_key: any,
    device_info: any,
    signature: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = DATA_CONFIG.loginv3;
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { account_key, device_info, signature }
    );
    if (!result.data) {
      throw new Error('NoUserFound');
    }
    if (replaceUser) {
      await this._signWithCustom(result.data.custom_token);
      await storage.set('currentId', result.data.id);
    }
    return result;
  };

  proxyKey = async (token: any, userId: any) => {
    if (token) {
      await this._signWithCustom(token);
      await storage.set('currentId', userId);
    }
    return;
  };

  importKey = async (
    account_key: any,
    device_info: any,
    username: string,
    backup_info: any,
    address: string,
    replaceUser = true
  ): Promise<SignInResponse> => {
    const config = DATA_CONFIG.importKey;
    const result = await this.sendRequest(
      config.method,
      config.path,
      {},
      { username, address, account_key, device_info, backup_info }
    );
    if (!result.data) {
      throw new Error('NoUserFound');
    }
    if (replaceUser) {
      await this._signWithCustom(result.data.custom_token);
      await storage.set('currentId', result.data.id);
    }
    return result;
  };

  coinMap = async () => {
    const config = DATA_CONFIG.coin_map;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  userInfo = async (): Promise<UserInfoResponse> => {
    const config = DATA_CONFIG.user_info;
    return await this.sendRequest(config.method, config.path);
  };

  userWallet = async () => {
    const config = DATA_CONFIG.user_wallet;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  //todo check data
  userWalletV2 = async () => {
    const config = DATA_CONFIG.user_wallet_v2;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowAddress = async () => {
    const config = DATA_CONFIG.create_flow_address;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowSandboxAddress = async () => {
    const config = DATA_CONFIG.create_flow_sandbox_address;
    const data = await this.sendRequest(config.method, config.path);
    return data;
  };

  createFlowNetworkAddress = async (account_key: AccountKey, network: string) => {
    const config = DATA_CONFIG.create_flow_network_address;
    const data = await this.sendRequest(
      config.method,
      config.path,
      {},
      {
        account_key,
        network,
      }
    );
    return data;
  };

  getMoonpayURL = async (url) => {
    const baseURL = getFirbaseFunctionUrl();
    const response = await this.sendRequest('POST', '/moonPaySignature', {}, { url: url }, baseURL);
    return response;
  };

  prepareTransaction = async (transaction: FlowTransaction) => {
    const config = DATA_CONFIG.prepare_transaction;
    const data = await this.sendRequest(config.method, config.path, {}, { transaction });
    return data;
  };

  signPayer = async (transaction, message: string) => {
    const messages = {
      envelope_message: message,
    };
    const config = DATA_CONFIG.sign_payer;
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

  signProposer = async (transaction, message: string) => {
    const messages = {
      envelope_message: message,
    };
    const config = DATA_CONFIG.sign_payer;
    const baseURL = getFirbaseFunctionUrl();
    // 'http://localhost:5001/lilico-dev/us-central1'
    const data = await this.sendRequest(
      'POST',
      '/signAsProposer',
      {},
      { transaction, message: messages },
      baseURL
    );
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  getProposer = async () => {
    const config = DATA_CONFIG.sign_payer;
    const baseURL = getFirbaseFunctionUrl();
    // 'http://localhost:5001/lilico-dev/us-central1'
    const data = await this.sendRequest('GET', '/getProposer', {}, {}, baseURL);
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  sendTransaction = async (transaction): Promise<SendTransactionResponse> => {
    const config = DATA_CONFIG.send_transaction;
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
    const config = DATA_CONFIG.coin_list;
    const data = await this.sendRequest(config.method, config.path, {
      address,
    });
    return data;
  };

  getCoinRate = async (coinId) => {
    const config = DATA_CONFIG.coin_rate;
    const data = await this.sendRequest(config.method, config.path, { coinId });
    return data;
  };

  getNFTMetadata = async (
    address: string,
    contractName: string,
    contractAddress: string,
    tokenId: number
  ) => {
    const config = DATA_CONFIG.nft_meta;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      contractName,
      contractAddress,
      tokenId,
    });

    return data;
  };

  getAddressBook = async () => {
    const config = DATA_CONFIG.fetch_address_book;
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
    const config = DATA_CONFIG.add_address_book;
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
    const config = DATA_CONFIG.edit_address_book;
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
    const config = DATA_CONFIG.delete_address_book;
    const data = await this.sendRequest(config.method, config.path, { id });
    return data;
  };

  addExternalAddressBook = async (
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = DATA_CONFIG.add_external_address_book;
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

  checkChildAccount = async (address: string) => {
    const script = await getScripts('hybridCustody', 'checkChildAccount');
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return result;
  };

  queryAccessible = async (address: string, childAccount: string) => {
    const script = await getScripts('hybridCustody', 'checkChildAccount');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  queryAccessibleFt = async (address: string, childAccount: string) => {
    const script = await getScripts('hybridCustody', 'getAccessibleCoinInfo');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address), arg(childAccount, t.Address)],
    });
    return result;
  };

  checkChildAccountMeta = async (address: string) => {
    const script = await getScripts('hybridCustody', 'getChildAccountMeta');
    try {
      const res = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return res;
    } catch (err) {
      return null;
    }
  };

  checkChildAccountNFT = async (address: string) => {
    const script = await getScripts('hybridCustody', 'getAccessibleChildAccountNFTs');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(result, 'check child nft info result----=====');
    return result;
  };

  getFlownsInbox = async (domain: string, root = 'meow') => {
    const script = await getScripts('domain', 'getFlownsInbox');

    const detail = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.String), arg(root, t.String)],
    });
    return detail;
  };

  getFlownsAddress = async (domain: string, root = 'fn') => {
    const script = await getScripts('basic', 'getFlownsAddress');

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.String), arg(root, t.String)],
    });
    return address;
  };

  getAccountMinFlow = async (address: string) => {
    const script = await getScripts('basic', 'getAccountMinFlow');
    if (isValidFlowAddress(address)) {
      const minFlow = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(address, t.Address)],
      });
      return minFlow;
    }
  };

  getFlownsDomainsByAddress = async (address: string) => {
    const script = await getScripts('basic', 'getFlownsDomainsByAddress');

    const domains = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return domains;
  };

  getFindAddress = async (domain: string) => {
    const script = await getScripts('basic', 'getFindAddress');

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.String)],
    });
    return address;
  };

  getFindDomainByAddress = async (domain: string) => {
    const script = await getScripts('basic', 'getFindDomainByAddress');

    const address = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(domain, t.Address)],
    });
    return address;
  };

  // getTransaction = async (address: string, limit: number, offset: number) => {
  //   const config = DATA_CONFIG.account_transaction;
  //   const data = await this.sendRequest(config.method, config.path, {
  //     address,
  //     limit,
  //     offset,
  //   });

  //   return data;
  // };

  getTransfers = async (address: string, after = '', limit: number) => {
    const config = DATA_CONFIG.get_transfers;
    const data = await this.sendRequest(config.method, config.path, {
      address,
      after,
      limit,
    });

    return data;
  };

  getEVMTransfers = async (address: string, after = '', limit: number) => {
    const data = await this.sendRequest(
      'GET',
      `/api/evm/${address}/transactions`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  getManualAddress = async () => {
    const config = DATA_CONFIG.manual_address;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  deviceList = async () => {
    const config = DATA_CONFIG.device_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  keyList = async () => {
    const config = DATA_CONFIG.key_list;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  getLocation = async () => {
    const config = DATA_CONFIG.get_location;
    const data = await this.sendRequest(config.method, config.path, {});

    return data;
  };

  addDevice = async (params) => {
    const config = DATA_CONFIG.add_device_v3;
    const data = await this.sendRequest(config.method, config.path, {}, params);

    return data;
  };

  synceDevice = async (params) => {
    const config = DATA_CONFIG.sync_device;
    const data = await this.sendRequest(config.method, config.path, {}, params);

    return data;
  };

  getInstallationId = async () => {
    return await getAppInstallationId();
  };

  searchUser = async (keyword: string) => {
    const config = DATA_CONFIG.search_user;
    const data = await this.sendRequest(config.method, config.path, {
      keyword,
    });

    return data;
  };

  checkImport = async (key: string) => {
    const config = DATA_CONFIG.check_import;
    const data = await this.sendRequest(config.method, config.path, {
      key,
    });

    return data;
  };

  getTokenInfo = async (name: string, network = ''): Promise<TokenInfo | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    if (!network) {
      network = await userWalletService.getNetwork();
    }
    const tokens = await this.getTokenListFromGithub(network);
    // const coins = await remoteFetch.flowCoins();
    return tokens.find((item) => item.symbol.toLowerCase() === name.toLowerCase());
  };

  getEvmTokenInfo = async (name: string, network = ''): Promise<TokenInfo | undefined> => {
    if (!network) {
      network = await userWalletService.getNetwork();
    }

    const tokens = await this.getEvmListFromGithub(network);

    const tokenInfo = tokens.find((item) => item.symbol.toLowerCase() === name.toLowerCase());

    if (tokenInfo && isValidEthereumAddress(tokenInfo.address)) {
      return tokenInfo;
    }

    const freshTokens = await this.refreshEvmGitToken(network);
    return freshTokens.find((item) => item.symbol.toLowerCase() === name.toLowerCase());
  };

  getTokenInfoByContract = async (contractName: string): Promise<TokenModel | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const coins = await remoteFetch.flowCoins();
    return coins.find((item) => item.contract_name.toLowerCase() === contractName.toLowerCase());
  };

  getAllToken = async () => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const coins = await remoteFetch.flowCoins();
    return coins;
  };

  getNFTCollectionInfo = async (contract_name: string): Promise<NFTModel | undefined> => {
    // FIX ME: Get defaultTokenList from firebase remote config
    const tokenList = await remoteFetch.nftCollection();

    // const network = await userWalletService.getNetwork();
    return tokenList.find((item) => item.id === contract_name);
  };

  getFeatureFlags = async (): Promise<FeatureFlags> => {
    try {
      const config = await remoteFetch.remoteConfig();
      return config.features;
    } catch (err) {
      console.error(err);
    }
    // By default, all feature flags are disabled
    return {};
  };
  getFeatureFlag = async (featureFlag: FeatureFlagKey): Promise<boolean> => {
    const flags = await this.getFeatureFlags();
    return !!flags[featureFlag];
  };

  getSwapInfo = async (): Promise<boolean> => {
    return (await this.getFeatureFlags()).swap;
  };

  // @ts-ignore
  getAllTokenInfo = async (fiterNetwork = true): Promise<TokenInfo[]> => {
    const network = await userWalletService.getNetwork();
    const list = await this.getTokenListFromGithub(network);
    return fiterNetwork ? list.filter((item) => item.address) : list;
  };

  getAllNft = async (fiterNetwork = true): Promise<NFTModel[]> => {
    const list = await remoteFetch.nftCollection();
    // const network = await userWalletService.getNetwork();
    return list;
  };

  getAllNftV2 = async (fiterNetwork = true): Promise<NFTModel[]> => {
    const list = await remoteFetch.nftv2Collection();
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
    const script = await getScripts('basic', 'getStorageInfo');

    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return {
      available: result['available'],
      used: result['used'],
      capacity: result['capacity'],
    };
  };

  getTokenBalanceWithModel = async (address: string, token: TokenInfo) => {
    const script = await getScripts('basic', 'getTokenBalanceWithModel');
    const network = await userWalletService.getNetwork();
    const cadence = script
      .replaceAll('<Token>', token.contractName)
      .replaceAll('<TokenBalancePath>', token.path.balance)
      .replaceAll('<TokenAddress>', token.address);
    const balance = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balance;
  };

  fetchGitTokenList = async (network, chainType, childType) => {
    const isProduction = process.env.NODE_ENV === 'production';
    let url;

    if (isProduction) {
      url = `https://raw.githubusercontent.com/Outblock/token-list-jsons/outblock/jsons/${network}/${chainType}/default.json`;
    } else if (
      !isProduction &&
      childType !== 'evm' &&
      (network === 'testnet' || network === 'mainnet')
    ) {
      url = `https://raw.githubusercontent.com/Outblock/token-list-jsons/outblock/jsons/${network}/${chainType}/dev.json`;
    } else {
      url = `https://raw.githubusercontent.com/Outblock/token-list-jsons/outblock/jsons/${network}/${chainType}/default.json`;
    }

    const response = await fetch(url);
    const { tokens = [] } = await response.json();
    const hasFlowToken = tokens.some((token) => token.symbol.toLowerCase() === 'flow');
    if (!hasFlowToken) {
      tokens.push({
        name: 'Flow',
        address: '0x4445e7ad11568276',
        contractName: 'FlowToken',
        path: {
          balance: '/public/flowTokenBalance',
          receiver: '/public/flowTokenReceiver',
          vault: '/storage/flowTokenVault',
        },
        logoURI:
          'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
        decimals: 8,
        symbol: 'flow',
      });
    }
    return tokens;
  };

  addFlowTokenIfMissing = (tokens) => {
    const hasFlowToken = tokens.some((token) => token.symbol.toLowerCase() === 'flow');
    if (!hasFlowToken) {
      tokens.push({
        name: 'Flow',
        address: '0x4445e7ad11568276',
        contractName: 'FlowToken',
        path: {
          balance: '/public/flowTokenBalance',
          receiver: '/public/flowTokenReceiver',
          vault: '/storage/flowTokenVault',
        },
        logoURI:
          'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg',
        decimals: 8,
        symbol: 'flow',
      });
    }
  };

  mergeCustomTokens = (tokens, customTokens) => {
    customTokens.forEach((custom) => {
      const existingToken = tokens.find(
        (token) => token.address.toLowerCase() === custom.address.toLowerCase()
      );

      if (existingToken) {
        // If the custom token is found, set the custom key to true
        existingToken.custom = true;
      } else {
        // If the custom token is not found, add it to the tokens array
        tokens.push({
          chainId: 747,
          address: custom.address,
          symbol: custom.unit,
          name: custom.coin,
          decimals: custom.decimals,
          logoURI: '',
          flowIdentifier: custom.flowIdentifier,
          tags: [],
          balance: 0,
          custom: true,
        });
      }
    });
  };

  getTokenListFromGithub = async (network) => {
    const childType = await userWalletService.getActiveWallet();
    const chainType = childType === 'evm' ? 'evm' : 'flow';

    const gitToken = await storage.getExpiry(`GitTokenList${network}${chainType}`);
    if (gitToken) return gitToken;

    const tokens = await this.fetchGitTokenList(network, chainType, childType);

    if (chainType === 'evm') {
      const evmCustomToken = (await storage.get(`${network}evmCustomToken`)) || [];
      this.mergeCustomTokens(tokens, evmCustomToken);
    }

    storage.setExpiry(`GitTokenList${network}${chainType}`, tokens, 600000);
    return tokens;
  };

  getEvmListFromGithub = async (network) => {
    const chainType = 'evm';

    const gitToken = await storage.getExpiry(`GitTokenList${network}${chainType}`);
    if (gitToken) return gitToken;

    const tokens = await this.fetchGitTokenList(network, chainType, chainType);

    if (chainType === 'evm') {
      const evmCustomToken = (await storage.get(`${network}evmCustomToken`)) || [];
      this.mergeCustomTokens(tokens, evmCustomToken);
    }

    storage.setExpiry(`GitTokenList${network}${chainType}`, tokens, 600000);
    return tokens;
  };

  refreshEvmGitToken = async (network) => {
    const chainType = 'evm';
    let gitToken = await storage.getExpiry(`GitTokenList${network}${chainType}`);
    if (!gitToken) gitToken = await this.fetchGitTokenList(network, chainType, 'evm');

    const evmCustomToken = (await storage.get(`${network}evmCustomToken`)) || [];
    this.mergeCustomTokens(gitToken, evmCustomToken);

    storage.setExpiry(`GitTokenList${network}${chainType}`, gitToken, 600000);

    return gitToken;
  };

  refreshCustomEvmGitToken = async (network) => {
    const chainType = 'evm';
    const gitToken = await this.fetchGitTokenList(network, chainType, 'evm');

    const evmCustomToken = (await storage.get(`${network}evmCustomToken`)) || [];
    this.mergeCustomTokens(gitToken, evmCustomToken);

    storage.setExpiry(`GitTokenList${network}${chainType}`, gitToken, 600000);
  };

  getNFTListFromGithub = async (network: string) => {
    const childType = await userWalletService.getActiveWallet();
    let chainType = 'flow';
    if (childType === 'evm') {
      chainType = 'evm';
    }
    const gitToken = await storage.getExpiry(`GitNFTList${network}${chainType}`);
    if (gitToken && gitToken.length > 0) {
      return gitToken;
    } else {
      const response = await fetch(
        `https://raw.githubusercontent.com/Outblock/token-list-jsons/outblock/jsons/${network}/flow/nfts.json`
      );
      const res = await response.json();
      const { data = {} } = res;
      storage.setExpiry(`GitNFTList${network}${chainType}`, data, 600000);
      return data;
    }
  };

  getEnabledTokenList = async (network = '') => {
    // const tokenList = await remoteFetch.flowCoins();
    if (!network) {
      network = await userWalletService.getNetwork();
    }
    const address = await userWalletService.getCurrentAddress();

    const tokenList = await this.getTokenListFromGithub(network);
    let values;
    const isChild = await userWalletService.getActiveWallet();
    try {
      if (isChild && isChild !== 'evm') {
        values = await this.isLinkedAccountTokenListEnabled(address);
      } else if (!isChild) {
        values = await this.isTokenListEnabled(address);
      }
    } catch (error) {
      console.error('Error isTokenListEnabled token:');
      values = {};
    }

    const tokenItems: TokenInfo[] = [];
    const tokenMap = {};
    if (isChild !== 'evm') {
      tokenList.forEach((token) => {
        const tokenId = `A.${token.address.slice(2)}.${token.contractName}`;
        // console.log(tokenMap,'tokenMap',values)
        if (!!values[tokenId]) {
          tokenMap[token.name] = token;
        }
      });
    }

    // const data = values.map((value, index) => ({isEnabled: value, token: tokenList[index]}))
    // return values
    //   .map((value, index) => {
    //     if (value) {
    //       return tokens[index];
    //     }
    //   })
    //   .filter((item) => item);

    Object.keys(tokenMap).map((key, idx) => {
      const item = tokenMap[key];
      tokenItems.push(item);
    });
    return tokenItems;
  };

  // todo
  isTokenStorageEnabled = async (address: string, token: TokenInfo) => {
    const network = await userWalletService.getNetwork();
    const script = await getScripts('basic', 'isTokenStorageEnabled');

    const cadence = script
      .replaceAll('<Token>', token.contractName)
      .replaceAll('<TokenBalancePath>', token.path.balance)
      .replaceAll('<TokenReceiverPath>', token.path.receiver)
      .replaceAll('<TokenAddress>', token.address);

    const isEnabled = await fcl.query({
      cadence: cadence,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return isEnabled;
  };

  isTokenListEnabled = async (address: string) => {
    const script = await getScripts('ft', 'isTokenListEnabled');
    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  isLinkedAccountTokenListEnabled = async (address: string) => {
    const script = await getScripts('ft', 'isLinkedAccountTokenListEnabled');
    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  getTokenListBalance = async (address: string, allTokens: TokenInfo[]) => {
    const network = await userWalletService.getNetwork();

    const tokens = allTokens.filter((token) => token.address);
    const script = await getScripts('ft', 'getTokenListBalance');
    const balanceList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });

    return balanceList;
  };

  getBlockList = async (hosts: string[] = [], forceCheck = false): Promise<string[]> => {
    return await googleSafeHostService.getBlockList(hosts, forceCheck);
  };

  getEnabledNFTList = async () => {
    const address = await userWalletService.getCurrentAddress();

    const promiseResult = await this.checkNFTListEnabledNew(address);
    console.log(promiseResult, 'promiseResult');

    // const network = await userWalletService.getNetwork();
    // const notEmptyTokenList = tokenList.filter(value => value.address[network] !== null && value.address[network] !== '' )
    // const data = values.map((value, index) => ({isEnabled: value, token: tokenList[index]}))
    const resultArray = Object.entries(promiseResult)
      .filter(([_, value]) => value === true) // Only keep entries with a value of true
      .map(([key, _]) => {
        const [prefix, address, contractName] = key.split('.');
        return {
          address: `0x${address}`,
          contract_name: contractName,
        };
      });
    console.log(promiseResult, 'values', resultArray);

    return resultArray;
  };

  checkNFTListEnabledNew = async (address: string) => {
    const script = await getScripts('nft', 'checkNFTListEnabled');
    console.log('script checkNFTListEnabledNew ', script);

    const isEnabledList = await fcl.query({
      cadence: script,
      args: (arg, t) => [arg(address, t.Address)],
    });
    return isEnabledList;
  };

  // checkNFTListEnabledNew = async (
  //   address: string,
  //   allTokens
  // ): Promise<NFTModel[]> => {
  //   const tokenImports = allTokens
  //     .map((token) =>
  //       'import <Token> from <TokenAddress>'
  //         .replaceAll('<Token>', token.contract_name)
  //         .replaceAll('<TokenAddress>', token.address)
  //     )
  //     .join('\r\n');
  //   const tokenFunctions = allTokens
  //     .map((token) =>
  //       `
  //     pub fun check<Token>Vault(address: Address) : Bool {
  //       let account = getAccount(address)

  //       let vaultRef = account
  //       .getCapability<&{NonFungibleToken.CollectionPublic}>(<TokenCollectionPublicPath>)
  //       .check()

  //       return vaultRef
  //     }
  //     `
  //         .replaceAll('<TokenCollectionPublicPath>', token.path.public_path)
  //         .replaceAll('<Token>', token.contract_name)
  //         .replaceAll('<TokenAddress>', token.address)
  //     )
  //     .join('\r\n');

  //   const tokenCalls = allTokens
  //     .map((token) =>
  //       `
  //     check<Token>Vault(address: address)
  //     `.replaceAll('<Token>', token.contract_name)
  //     )
  //     .join(',');

  //   const cadence = `
  //     import NonFungibleToken from 0xNonFungibleToken
  //     <TokenImports>

  //     <TokenFunctions>

  //     pub fun main(address: Address) : [Bool] {
  //       return [<TokenCall>]
  //     }
  //   `
  //     .replaceAll('<TokenFunctions>', tokenFunctions)
  //     .replaceAll('<TokenImports>', tokenImports)
  //     .replaceAll('<TokenCall>', tokenCalls);

  //   const enabledList = await fcl.query({
  //     cadence: cadence,
  //     args: (arg, t) => [arg(address, t.Address)],
  //   });

  //   return enabledList;
  // };

  checkNFTListEnabled = async (address: string, allTokens: NFTModel[]): Promise<NFTModel[]> => {
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
    const response = await fetch('https://flix.flow.com/v1/templates/search', init);
    const template = await response.json();

    console.log('template ->', template);

    const auditorsResponse = await fetch(`https://flix.flow.com/v1/auditors?network=${network}`);
    const auditors = await auditorsResponse.json();
    console.log('auditors ->', auditors);

    fcl.config().put(
      'flow.auditors',
      auditors.map((item) => item.address)
    );

    const audits = await fcl.InteractionTemplateUtils.getInteractionTemplateAudits({
      template: template,
      auditors: auditors.map((item) => item.address),
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
    const config = DATA_CONFIG.validate_recaptcha;
    const data = await this.sendRequest(config.method, config.path, {
      token,
    });

    return data;
  };

  flowScanQuery = async (query: string, operationName: string) => {
    const config = DATA_CONFIG.account_query;
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
      const response = await fetch(`https://rest-${network}.onflow.org/v1/blocks?height=sealed`);
      const result = await response.json();
      return result[0].header !== null && result[0].header !== undefined;
    } catch (err) {
      return false;
    }
  };

  updateProfilePreference = async (privacy: number) => {
    const config = DATA_CONFIG.profile_preference;
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
    const config = DATA_CONFIG.profile_update;
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
    const config = DATA_CONFIG.flowns_prepare;
    const data = await this.sendRequest(config.method, config.path, {}, {});
    return data;
  };

  flownsAuthTransaction = async (transaction, envelope: string) => {
    const message = {
      envelope_message: envelope,
    };
    // console.log({transaction,message})
    const config = DATA_CONFIG.flowns_signature;
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
    const config = DATA_CONFIG.flowns_signature;
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

  swapEstimate = async (network: string, inToken: string, outToken: string, amount) => {
    const response = await fetch(
      `https://lilico.app/api/swap/v1/${network}/estimate?inToken=${inToken}&outToken=${outToken}&inAmount=${amount}`
    );
    return response.json();
  };

  swapOutEstimate = async (network: string, inToken: string, outToken: string, amount) => {
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
    const response = await fetch(`https://lilico.app/api/swap/v1/${network}/pairs`);
    console.log(response);
    return response.json();
  };

  nftCatalog = async () => {
    const { data } = await this.sendRequest(
      'GET',
      'api/nft/collections',
      {},
      {},
      'https://lilico.app/'
    );
    return data;
  };

  cadenceScripts = async (network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/scripts?network=${network}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  cadenceScriptsV2 = async () => {
    const { data } = await this.sendRequest('GET', '/api/v2/scripts', {}, {}, WEB_NEXT_URL);
    return data;
  };

  nftCatalogList = async (address: string, limit: any, offset: any, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/list?address=${address}&limit=${limit}&offset=${offset}&network=${network}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  nftCatalogCollections = async (address: string, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/id?address=${address}&network=${network}`,
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
    offset: any,
    network: string
  ) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/collectionList?address=${address}&limit=${limit}&offset=${offset}&collectionIdentifier=${contractName}&network=${network}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  nftCollectionApiPaging = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any,
    network: string
  ) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/storage/${network}/nft?address=${address}&limit=${limit}&offset=${offset}&path=${contractName}`,
      {},
      {},
      'https://lilico.app'
    );
    return data;
  };

  nftCollectionInfo = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any,
    network: string
  ) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/storage/${network}/nft/collection?address=${address}&path=${contractName}`,
      {},
      {},
      'https://lilico.app'
    );
    return data;
  };

  nftCollectionList = async () => {
    const { data } = await this.sendRequest('GET', '/api/nft/collections', {}, {}, WEB_NEXT_URL);
    return data;
  };

  evmFTList = async () => {
    const { data } = await this.sendRequest('GET', '/api/evm/fts', {}, {}, WEB_NEXT_URL);
    return data;
  };

  getEvmFT = async (address: string, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v3/evm/${address}/fts?network=${network}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  getEvmFTPrice = async () => {
    const gitPrice = await storage.getExpiry('EVMPrice');

    if (gitPrice) {
      return gitPrice;
    } else {
      const { data } = await this.sendRequest('GET', '/api/prices', {}, {}, WEB_NEXT_URL);
      storage.setExpiry('EVMPrice', data, 6000);
      return data;
    }
  };

  evmNFTList = async () => {
    const { data } = await this.sendRequest('GET', '/api/evm/nfts', {}, {}, WEB_NEXT_URL);
    return data;
  };

  getEvmNFT = async (address: string, network: string) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/evm/${address}/nfts?network=${network}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  decodeEvmCall = async (data: string, address = '') => {
    const bodyData = {
      to: address, // address -- optional
      data: data, // calldata -- required
    };
    const res = await this.sendRequest('POST', `/api/evm/decodeData`, {}, bodyData, WEB_NEXT_URL);
    return res;
  };

  EvmNFTcollectionList = async (
    address: string,
    collectionIdentifier: string,
    limit = 24,
    offset = 0
  ) => {
    const network = await userWalletService.getNetwork();
    const { data } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/collectionList?network=${network}&address=${address}&collectionIdentifier=${collectionIdentifier}&limit=${limit}&offset=${offset}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  EvmNFTID = async (address: string) => {
    const network = await userWalletService.getNetwork();
    const { data } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/id?network=${network}&address=${address}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  EvmNFTList = async (address: string, limit = 24, offset = 0) => {
    const network = await userWalletService.getNetwork();
    const { data } = await this.sendRequest(
      'GET',
      `/api/v3/evm/nft/list?network=${network}&address=${address}&limit=${limit}&offset=${offset}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  getNFTCadenceList = async (address: string, network = 'mainnet', offset = 0, limit = 5) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/id?network=${network}&address=${address}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  getNFTCadenceCollection = async (
    address: string,
    network = 'mainnet',
    identifier,
    offset = 0,
    limit = 24
  ) => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/collectionList?network=${network}&address=${address}&offset=${offset}&limit=${limit}&collectionIdentifier=${identifier}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  getNFTV2CollectionList = async (address: string, network = 'mainnet') => {
    const { data } = await this.sendRequest(
      'GET',
      `/api/v2/nft/collections?network=${network}&address=${address}`,
      {},
      {},
      WEB_NEXT_URL
    );
    return data;
  };

  genTx = async (contract_name: string) => {
    const network = await userWalletService.getNetwork();

    const init = {
      headers: {
        Network: network,
        Authorization: `Bearer ${await getUserToken()}`,
      },
    };

    const response = await fetch(
      `${WEB_NEXT_URL}/api/nft/gentx?collectionIdentifier=${contract_name}`,
      init
    );

    return response.json();
  };

  putDeviceInfo = async (walletData) => {
    try {
      const testnetId = walletData.find((item) => item.chain_id === 'testnet')?.id;
      const mainnetId = walletData.find((item) => item.chain_id === 'mainnet')?.id;
      const installationId = await this.getInstallationId();
      // console.log('location ', userlocation);

      await this.addDevice({
        wallet_id: mainnetId ? mainnetId.toString() : '',
        wallettest_id: testnetId ? testnetId.toString() : '',
        device_info: {
          device_id: installationId,
          district: '',
          name: 'FRW Chrome Extension',
          type: '2',
          user_agent: 'Chrome',
        },
      });
    } catch (error) {
      console.error('Error while adding device:', error);
      return;
    }
  };

  getNews = async (): Promise<NewsItem[]> => {
    // Get news from firebase function

    const cachedNews = await storage.getExpiry('news');

    if (cachedNews) {
      return cachedNews;
    }

    const data = await this.sendRequest(
      'GET',
      process.env.API_NEWS_PATH,
      {},
      {},
      process.env.API_BASE_URL
    );

    const timeNow = new Date(Date.now());

    const news = data
      .map(
        (dataFromApi: {
          id: string;
          priority: string;
          type: string;
          title: string;
          body?: string;
          icon?: string;
          image?: string;
          url?: string;
          expiry_time: string;
          display_type: string;
          conditions?: string[]; // Add conditions field
        }) => {
          const newsItem = {
            ...dataFromApi,
            expiryTime: new Date(dataFromApi.expiry_time),
            displayType: dataFromApi.display_type,
            conditions: dataFromApi.conditions as NewsConditionType[], // Map conditions
          };
          return newsItem;
        }
      )
      .filter((n: { expiryTime: Date }) => {
        return n.expiryTime > timeNow;
      });

    await storage.setExpiry('news', news, 300000); // 5 minutes in milliseconds

    return news;
  };

  freshUserInfo = async (currentWallet, keys, pubKTuple, wallet, isChild) => {
    const loggedInAccounts = (await storage.get('loggedInAccounts')) || [];

    if (!isChild) {
      await storage.set('keyIndex', '');
      await storage.set('hashAlgo', '');
      await storage.set('signAlgo', '');
      await storage.set('pubKey', '');

      const { P256, SECP256K1 } = pubKTuple;

      const keyInfoA = findKeyAndInfo(keys, P256.pubK);
      const keyInfoB = findKeyAndInfo(keys, SECP256K1.pubK);
      const keyInfo = keyInfoA ||
        keyInfoB || {
          index: 0,
          signAlgo: keys.keys[0].signAlgo,
          hashAlgo: keys.keys[0].hashAlgo,
          publicKey: keys.keys[0].publicKey,
        };
      await storage.set('keyIndex', keyInfo.index);
      await storage.set('signAlgo', keyInfo.signAlgo);
      await storage.set('hashAlgo', keyInfo.hashAlgo);
      await storage.set('pubKey', keyInfo.publicKey);

      wallet['address'] = currentWallet.address;
      wallet['pubKey'] = keyInfo.publicKey;
      wallet['hashAlgo'] = keyInfo.hashAlgo;
      wallet['signAlgo'] = keyInfo.signAlgo;
      wallet['weight'] = keys.keys[0].weight;

      log.log('wallet is this:', wallet);

      const accountIndex = loggedInAccounts.findIndex(
        (account) => account.username === wallet.username
      );

      if (accountIndex === -1) {
        loggedInAccounts.push(wallet);
      } else {
        loggedInAccounts[accountIndex] = wallet;
      }
      await storage.set('loggedInAccounts', loggedInAccounts);
    }

    log.log('Updated loggedInAccounts:', loggedInAccounts);
    const otherAccounts = loggedInAccounts
      .filter((account) => account.username !== wallet.username)
      .map((account) => {
        const indexInLoggedInAccounts = loggedInAccounts.findIndex(
          (loggedInAccount) => loggedInAccount.username === account.username
        );
        return { ...account, indexInLoggedInAccounts };
      })
      .slice(0, 2);

    log.log('otherAccounts with index:', otherAccounts);
    // await setOtherAccounts(otherAccounts);
    // await setUserInfo(wallet);
    // await setLoggedIn(loggedInAccounts);
    return { otherAccounts, wallet, loggedInAccounts };
  };

  getLatestVersion = async (): Promise<string> => {
    // Get latest version from storage cache first
    const cached = await storage.getExpiry('latestVersion');
    if (cached) {
      return cached;
    }

    try {
      const result = await this.sendRequest(
        'GET',
        process.env.API_CONFIG_PATH,
        {},
        {},
        process.env.API_BASE_URL
      );

      const version = result.version;

      // Cache for 1 hour
      await storage.setExpiry('latestVersion', version, 3600000);
      return version;
    } catch (error) {
      console.error('Error fetching latest version:', error);
      return chrome.runtime.getManifest().version; // Fallback to current version
    }
  };
}

const openApiService = new OpenApiService();

// Log all functions and their signatures
const functions = Object.entries(openApiService)
  .filter(
    ([name, value]) =>
      typeof value === 'function' &&
      name !== 'constructor' &&
      typeof name === 'string' &&
      name !== 'get'
  )
  .map(([name]) => {
    const func = openApiService[name];
    // Use a safer way to get function info
    const funcStr = func.toString();
    const isAsync = funcStr.startsWith('async');
    const basicSignature = funcStr.split('{')[0].trim();

    return {
      name,
      isAsync,
      fullBody: funcStr,
      usesSendRequest: funcStr.includes('this.sendRequest'),
      usesFetchDirectly: funcStr.includes('fetch('),
      basicSignature,
      // Simple regex to extract parameter names without accessing arguments
      params: basicSignature
        .slice(basicSignature.indexOf('(') + 1, basicSignature.lastIndexOf(')'))
        .split(',')
        .map((param) => param.trim())
        .map((param) => {
          if (param.startsWith('PriceProvider.')) {
            return param.replace('PriceProvider.', '');
          }
          return param;
        })
        .filter(Boolean),
    };
  });

console.log('OpenApiService Functions:', functions);
console.table(
  functions.map((f) => ({
    name: f.name,
    async: f.isAsync ? 'yes' : 'no',
    params: f.params.join(', ') || 'none',
    signature: f.basicSignature,
  }))
);

export default openApiService;
