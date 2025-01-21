import * as fcl from '@onflow/fcl';
import dayjs from 'dayjs';
import type { TokenInfo } from 'flow-native-token-registry';
import log from 'loglevel';

import { storage } from '@/background/webapi';
import { INITIAL_OPENAPI_URL, FIREBASE_FUNCTIONS_URL, WEB_NEXT_URL } from '@/constant/api-hosts';
import { type FeatureFlagKey, type FeatureFlags } from '@/shared/types/feature-types';
import { isValidFlowAddress, isValidEthereumAddress } from '@/shared/utils/address';
import { getStringFromHashAlgo, getStringFromSignAlgo } from '@/shared/utils/algo';
import { getPeriodFrequency } from '@/shared/utils/getPeriodFrequency';
import { getScripts, findKeyAndInfo } from 'background/utils';
import fetchConfig from 'background/utils/remoteConfig';

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
} from '../../shared/types/network-types';

import {
  getAppInstallationId,
  getUserToken,
  signInWithToken,
  verifyAuthStatus,
} from './authentication';

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
    method: 'GET',
    params: ['username'],
    host: INITIAL_OPENAPI_URL,
  },
  search_user: {
    path: '/v1/user/search',
    method: 'GET',
    params: ['keyword'],
    host: INITIAL_OPENAPI_URL,
  },
  register: {
    path: '/v1/register',
    method: 'POST',
    params: ['username', 'account_key'],
    host: INITIAL_OPENAPI_URL,
  },
  create_flow_address: {
    path: '/v1/user/address',
    method: 'POST',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  create_flow_sandbox_address: {
    path: '/v1/user/address/crescendo',
    method: 'POST',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  create_flow_network_address: {
    path: '/v1/user/address/network',
    method: 'POST',
    params: ['account_key', 'network'],
    host: INITIAL_OPENAPI_URL,
  },
  login: {
    path: '/v1/login',
    method: 'POST',
    params: ['public_key', 'signature'],
    host: INITIAL_OPENAPI_URL,
  },
  loginv2: {
    path: '/v2/login',
    method: 'POST',
    params: ['public_key', 'signature'],
    host: INITIAL_OPENAPI_URL,
  },
  loginv3: {
    path: '/v3/login',
    method: 'POST',
    params: ['signature', 'account_key', 'device_info'],
    host: INITIAL_OPENAPI_URL,
  },
  importKey: {
    path: '/v3/import',
    method: 'POST',
    params: ['username', 'account_key', 'device_info', 'backup_info', 'address'],
    host: INITIAL_OPENAPI_URL,
  },
  coin_map: {
    path: '/v1/coin/map',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  user_wallet: {
    path: '/v1/user/wallet',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  user_wallet_v2: {
    path: '/v2/user/wallet',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  user_info: {
    path: '/v1/user/info',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  prepare_transaction: {
    path: '/v1/account/presign',
    method: 'POST',
    params: ['transaction'],
    host: INITIAL_OPENAPI_URL,
  },
  sign_as_payer: {
    path: '/signAsPayer',
    method: 'POST',
    params: ['transaction', 'message'],
    host: FIREBASE_FUNCTIONS_URL,
  },
  sign_as_proposer: {
    path: '/signAsProposer',
    method: 'POST',
    params: ['transaction', 'message'],
    host: FIREBASE_FUNCTIONS_URL,
  },
  get_proposer: {
    path: '/getProposer',
    method: 'GET',
    params: [],
    host: FIREBASE_FUNCTIONS_URL,
  },
  send_transaction: {
    path: '/v1/account/transaction',
    method: 'POST',
    params: ['transaction'],
    host: INITIAL_OPENAPI_URL,
  },
  coin_list: {
    path: '/v1/account/info',
    method: 'GET',
    params: ['address'],
    host: INITIAL_OPENAPI_URL,
  },
  coin_rate: {
    path: '/v1/coin/rate',
    method: 'GET',
    params: ['coinId'],
    host: INITIAL_OPENAPI_URL,
  },
  nft_list_v2: {
    path: '/v2/nft/list',
    method: 'GET',
    params: ['address', 'offset', 'limit'],
    host: INITIAL_OPENAPI_URL,
  },
  nft_list_lilico_v2: {
    path: '/v2/nft/detail/list',
    method: 'GET',
    params: ['address', 'offset', 'limit'],
    host: INITIAL_OPENAPI_URL,
  },
  nft_collections_lilico_v2: {
    path: '/v2/nft/collections',
    method: 'GET',
    params: ['address'],
    host: INITIAL_OPENAPI_URL,
  },
  nft_collections_single_v2: {
    path: '/v2/nft/single',
    method: 'GET',
    params: ['address', 'contractName', 'limit', 'offset'],
    host: INITIAL_OPENAPI_URL,
  },
  nft_meta: {
    path: '/v2/nft/meta',
    method: 'GET',
    params: ['address', 'contractName', 'contractAddress', 'tokenId'],
    host: INITIAL_OPENAPI_URL,
  },
  fetch_address_book: {
    path: '/v1/addressbook/contact',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  add_address_book: {
    path: '/v1/addressbook/contact',
    method: 'put',
    params: ['contact_name', 'username', 'address', 'domain', 'domain_type'],
    host: INITIAL_OPENAPI_URL,
  },
  edit_address_book: {
    path: '/v1/addressbook/contact',
    method: 'POST',
    params: ['id', 'contact_name', 'address', 'domain', 'domain_type'],
    host: INITIAL_OPENAPI_URL,
  },
  delete_address_book: {
    path: '/v1/addressbook/contact',
    method: 'delete',
    params: ['id'],
    host: INITIAL_OPENAPI_URL,
  },
  add_external_address_book: {
    path: '/v1/addressbook/external',
    method: 'put',
    params: ['contact_name', 'address', 'domain', 'domain_type'],
    host: INITIAL_OPENAPI_URL,
  },
  account_transaction: {
    path: '/v1/account/transaction',
    method: 'GET',
    params: ['address', 'limit', 'offset'],
    host: INITIAL_OPENAPI_URL,
  },
  validate_recaptcha: {
    path: '/v1/user/recaptcha',
    method: 'GET',
    params: ['token'],
    host: INITIAL_OPENAPI_URL,
  },
  crypto_map: {
    path: '/v1/crypto/map',
    method: 'GET',
    params: ['provider', 'pair'],
    host: INITIAL_OPENAPI_URL,
  },
  crypto_flow: {
    path: '/v1/crypto/summary',
    method: 'GET',
    params: ['provider', 'pair'],
    host: INITIAL_OPENAPI_URL,
  },
  crypto_history: {
    path: '/v1/crypto/history',
    method: 'GET',
    params: ['provider', 'pair', 'after', 'history'],
    host: INITIAL_OPENAPI_URL,
  },
  account_query: {
    path: '/v1/account/query',
    method: 'POST',
    params: ['query', 'operation_name'],
    host: INITIAL_OPENAPI_URL,
  },
  profile_preference: {
    path: '/v1/profile/preference',
    method: 'POST',
    params: ['private'],
    host: INITIAL_OPENAPI_URL,
  },
  profile_update: {
    path: '/v1/profile',
    method: 'POST',
    params: ['nickname', 'avatar'],
    host: INITIAL_OPENAPI_URL,
  },
  flowns_prepare: {
    path: '/v1/flowns/prepare',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  flowns_signature: {
    path: '/v1/flowns/signature',
    method: 'POST',
    params: ['transaction', 'message'],
    host: INITIAL_OPENAPI_URL,
  },
  payer_signature: {
    path: '/v1/flowns/payer/signature',
    method: 'POST',
    params: ['transaction', 'message'],
    host: INITIAL_OPENAPI_URL,
  },
  get_transfers: {
    path: '/v1/account/transfers',
    method: 'GET',
    params: ['address', 'after', 'limit'],
    host: INITIAL_OPENAPI_URL,
  },
  manual_address: {
    path: '/v1/user/manualaddress',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  device_list: {
    path: '/v1/user/device',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  key_list: {
    path: '/v1/user/keys',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  add_device: {
    path: '/v1/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
    host: INITIAL_OPENAPI_URL,
  },
  add_device_v3: {
    path: '/v3/user/device',
    method: 'put',
    params: ['device_info', 'wallet_id', 'wallettest_id '],
    host: INITIAL_OPENAPI_URL,
  },
  get_location: {
    path: '/v1/user/location',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  sync_device: {
    path: '/v3/sync',
    method: 'POST',
    params: ['account_key', 'device_info '],
    host: INITIAL_OPENAPI_URL,
  },
  check_import: {
    path: '/v3/checkimport',
    method: 'GET',
    params: ['key'],
    host: INITIAL_OPENAPI_URL,
  },
  get_version: {
    path: '/version',
    method: 'GET',
    params: [],
    host: INITIAL_OPENAPI_URL,
  },
  get_prices: {
    path: '/api/prices',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  moonpay_signature: {
    path: '/moonPaySignature',
    method: 'POST',
    params: ['transaction', 'message'],
    host: FIREBASE_FUNCTIONS_URL,
  },
  get_evm_transfers: {
    path: (params: { address: string }) => `/api/evm/${params.address}/transactions`,
    method: 'GET',
    params: ['address', 'after', 'limit'],
    host: WEB_NEXT_URL,
  },
  nft_catalog: {
    path: '/api/nft/collections',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  cadence_scripts: {
    path: '/api/scripts',
    method: 'GET',
    params: ['network'],
    host: WEB_NEXT_URL,
  },
  cadence_scripts_v2: {
    path: '/api/v2/scripts',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  nft_catalog_list: {
    path: '/api/v2/nft/list',
    method: 'GET',
    params: ['address', 'limit', 'offset', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_catalog_collections: {
    path: '/api/v2/nft/id',
    method: 'GET',
    params: ['address', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_catalog_collection_list: {
    path: '/api/v2/nft/collectionList',
    method: 'GET',
    params: ['address', 'limit', 'offset', 'collectionIdentifier', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_catalog_collection_api_paging: {
    path: (params: { network: string }) => `/api/storage/${params.network}/nft`,
    method: 'GET',
    params: ['address', 'limit', 'offset', 'path', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_catalog_collection_info: {
    path: (params: { network: string }) => `/api/storage/${params.network}/nft/collection`,
    method: 'GET',
    params: ['address', 'path', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_collection_list: {
    path: '/api/nft/collections',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  evm_ft_list: {
    path: '/api/evm/fts',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  get_evm_ft: {
    path: (params: { address: string; network: string }) =>
      `/api/v3/evm/${params.address}/fts?network=${params.network}`,
    method: 'GET',
    params: ['address', 'network'],
    host: WEB_NEXT_URL,
  },
  evm_nft_list: {
    path: '/api/evm/nfts',
    method: 'GET',
    params: [],
    host: WEB_NEXT_URL,
  },
  evm_nft_detail: {
    path: (params: { address: string; network: string }) =>
      `/api/evm/${params.address}/nfts?network=${params.network}`,
    method: 'GET',
    params: ['address', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_v2_collection_list: {
    path: '/api/v2/nft/collections',
    method: 'GET',
    params: ['address', 'network'],
    host: WEB_NEXT_URL,
  },
  evm_decode_data: {
    path: '/api/evm/decodeData',
    method: 'POST',
    params: ['to', 'data'],
    host: WEB_NEXT_URL,
  },
  evm_nft_collection_list: {
    path: '/api/v3/evm/nft/collectionList',
    method: 'GET',
    params: ['address', 'collectionIdentifier', 'limit', 'offset', 'network'],
    host: WEB_NEXT_URL,
  },
  evm_nft_id: {
    path: '/api/v3/evm/nft/id',
    method: 'GET',
    params: ['address', 'network'],
    host: WEB_NEXT_URL,
  },
  evm_nft_list_v3: {
    path: '/api/v3/evm/nft/list',
    method: 'GET',
    params: ['address', 'limit', 'offset', 'network'],
    host: WEB_NEXT_URL,
  },
  nft_gentx: {
    path: '/api/nft/gentx',
    method: 'GET',
    params: ['collectionIdentifier'],
    host: WEB_NEXT_URL,
  },
  get_news: {
    path: process.env.API_NEWS_PATH,
    method: 'GET',
    params: [],
    host: process.env.API_BASE_URL,
  },
  get_config: {
    path: process.env.API_CONFIG_PATH,
    method: 'GET',
    params: [],
    host: process.env.API_BASE_URL,
  },
};

const recordFetch = async (response, responseData, ...args: Parameters<typeof fetch>) => {
  try {
    // Extract URL parameters from the first argument if it's a URL with query params
    const url = args[0].toString();
    const urlObj = new URL(url);
    const urlParams = Object.fromEntries(urlObj.searchParams.entries());

    // Send message to UI with request/response details

    const messageData = {
      method: args[1]?.method,
      url: args[0],
      params: urlParams, // URL parameters extracted from the URL
      requestInit: args[1],
      responseData, // Raw response from fetch
      timestamp: Date.now(),
      status: response.status,
      statusText: response.statusText,
      // Note: functionParams and functionResponse will be added by the calling function
    };
    console.log('fetchCallRecorder - response & messageData', response, messageData);

    chrome.runtime.sendMessage({
      type: 'API_CALL_RECORDED',
      data: messageData,
    });
  } catch (err) {
    console.error('Error sending message to UI:', err);
  }
  return response;
};

// Override fetch in branches other than master
const originalFetch = globalThis.fetch;

const fetchCallRecorder = async (...args: Parameters<typeof originalFetch>) => {
  const response = await originalFetch(...args);
  try {
    console.log('response', response);
    const responseData = response.ok ? await response.clone().json() : null;
    //  recordFetch(response, responseData, ...args);
  } catch (err) {
    console.error('Error recording fetch call:', err);
  }
  return response;
};
///const fetch = process.env.BRANCH_NAME === 'master' ? globalThis.fetch : fetchCallRecorder;

const fetchRequest = async (
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
  const responseData = await response.json();

  return responseData; // parses JSON response into native JavaScript objects
};

const fetchConfigRequest = <key extends keyof typeof DATA_CONFIG>(
  config: (typeof DATA_CONFIG)[key],
  params?: any,
  data?: any
) => {
  return fetchRequest(
    config.method,
    typeof config.path === 'function' ? config.path(params) : config.path,
    typeof config.path === 'function' ? {} : params,
    data,
    config.host
  );
};

class OpenApiService {
  sendRequest = async (method: string, url: string, params: any, data: any, host: string) => {
    return fetchRequest(method, url, params, data, host);
  };

  init = async () => {
    await userWalletService.setupFcl();
  };

  checkAuthStatus = async () => {
    return verifyAuthStatus();
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
    const data = await fetchConfigRequest(config, {
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
      const config = DATA_CONFIG.get_prices;
      const response = await fetchConfigRequest(config);
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
    const data = await fetchConfigRequest(config, {
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
    const data = await fetchConfigRequest(config, {
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
    const data = await fetchConfigRequest(config, {
      username,
    });
    return data;
  };

  register = async (account_key: AccountKey, username: string) => {
    // Track the time until account_created is called
    mixpanelTrack.time('account_created');

    const config = DATA_CONFIG.register;
    const data = await fetchConfigRequest(
      config,
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
    const result = await fetchConfigRequest(config, {}, { public_key, signature });
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
    const result = await fetchConfigRequest(config, {}, { public_key, signature });
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
    const result = await fetchConfigRequest(config, {}, { account_key, device_info, signature });
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
    const result = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(config);
    return data;
  };

  userInfo = async (): Promise<UserInfoResponse> => {
    const config = DATA_CONFIG.user_info;
    return await fetchConfigRequest(config);
  };

  userWallet = async () => {
    const config = DATA_CONFIG.user_wallet;
    const data = await fetchConfigRequest(config);
    return data;
  };

  //todo check data
  userWalletV2 = async () => {
    const config = DATA_CONFIG.user_wallet_v2;
    const data = await fetchConfigRequest(config);
    return data;
  };

  createFlowAddress = async () => {
    const config = DATA_CONFIG.create_flow_address;
    const data = await fetchConfigRequest(config);
    return data;
  };

  createFlowSandboxAddress = async () => {
    const config = DATA_CONFIG.create_flow_sandbox_address;
    const data = await fetchConfigRequest(config);
    return data;
  };

  createFlowNetworkAddress = async (account_key: AccountKey, network: string) => {
    const config = DATA_CONFIG.create_flow_network_address;
    const data = await fetchConfigRequest(
      config,
      {},
      {
        account_key,
        network,
      }
    );
    return data;
  };

  getMoonpayURL = async (url) => {
    const config = DATA_CONFIG.moonpay_signature;
    const response = await fetchConfigRequest(config, {}, { url: url });
    return response;
  };

  prepareTransaction = async (transaction: FlowTransaction) => {
    const config = DATA_CONFIG.prepare_transaction;
    const data = await fetchConfigRequest(config, {}, { transaction });
    return data;
  };

  signPayer = async (transaction, message: string) => {
    const messages = {
      envelope_message: message,
    };
    const config = DATA_CONFIG.sign_as_payer;
    const data = await fetchConfigRequest(config, {}, { transaction, message: messages });
    // (config.method, config.path, {}, { transaction, message: messages });
    return data;
  };

  signProposer = async (transaction, message: string) => {
    const messages = {
      envelope_message: message,
    };
    const config = DATA_CONFIG.sign_as_proposer;
    const data = await fetchConfigRequest(config, {}, { transaction, message: messages });

    return data;
  };

  getProposer = async () => {
    const config = DATA_CONFIG.get_proposer;
    const data = await fetchConfigRequest(config, {}, {});
    return data;
  };

  sendTransaction = async (transaction): Promise<SendTransactionResponse> => {
    const config = DATA_CONFIG.send_transaction;
    const data = await fetchConfigRequest(
      config,
      {},
      {
        transaction,
      }
    );
    return data;
  };

  getCoinList = async (address) => {
    const config = DATA_CONFIG.coin_list;
    const data = await fetchConfigRequest(config, {
      address,
    });
    return data;
  };

  getCoinRate = async (coinId) => {
    const config = DATA_CONFIG.coin_rate;
    const data = await fetchConfigRequest(config, { coinId });
    return data;
  };

  getNFTMetadata = async (
    address: string,
    contractName: string,
    contractAddress: string,
    tokenId: number
  ) => {
    const config = DATA_CONFIG.nft_meta;
    const data = await fetchConfigRequest(config, {
      address,
      contractName,
      contractAddress,
      tokenId,
    });

    return data;
  };

  getAddressBook = async () => {
    const config = DATA_CONFIG.fetch_address_book;
    const data = await fetchConfigRequest(config);
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
    const data = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(config, { id });
    return data;
  };

  addExternalAddressBook = async (
    contact_name: string,
    address: string,
    domain = '',
    domain_type = 0
  ) => {
    const config = DATA_CONFIG.add_external_address_book;
    const data = await fetchConfigRequest(
      config,
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
  //   const data = await fetchConfigRequest(config, {
  //     address,
  //     limit,
  //     offset,
  //   });

  //   return data;
  // };

  getTransfers = async (address: string, after = '', limit: number) => {
    const config = DATA_CONFIG.get_transfers;
    const data = await fetchConfigRequest(config, {
      address,
      after,
      limit,
    });

    return data;
  };

  getEVMTransfers = async (address: string, after = '', limit: number) => {
    const config = DATA_CONFIG.get_evm_transfers;
    const data = await fetchConfigRequest(config, {
      address,
      after,
      limit,
    });
    return data;
  };

  getManualAddress = async () => {
    const config = DATA_CONFIG.manual_address;
    const data = await fetchConfigRequest(config, {});

    return data;
  };

  deviceList = async () => {
    const config = DATA_CONFIG.device_list;
    const data = await fetchConfigRequest(config, {});

    return data;
  };

  keyList = async () => {
    const config = DATA_CONFIG.key_list;
    const data = await fetchConfigRequest(config, {});

    return data;
  };

  getLocation = async () => {
    const config = DATA_CONFIG.get_location;
    const data = await fetchConfigRequest(config, {});

    return data;
  };

  addDevice = async (params) => {
    const config = DATA_CONFIG.add_device_v3;
    const data = await fetchConfigRequest(config, {}, params);

    return data;
  };

  synceDevice = async (params) => {
    const config = DATA_CONFIG.sync_device;
    const data = await fetchConfigRequest(config, {}, params);

    return data;
  };

  getInstallationId = async () => {
    return await getAppInstallationId();
  };

  searchUser = async (keyword: string) => {
    const config = DATA_CONFIG.search_user;
    const data = await fetchConfigRequest(config, {
      keyword,
    });

    return data;
  };

  checkImport = async (key: string) => {
    const config = DATA_CONFIG.check_import;
    const data = await fetchConfigRequest(config, {
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
    const data = await fetchConfigRequest(config, {
      token,
    });

    return data;
  };

  flowScanQuery = async (query: string, operationName: string) => {
    const config = DATA_CONFIG.account_query;
    const data = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(
      config,
      {},
      {
        private: privacy,
      }
    );

    return data;
  };

  updateProfile = async (nickname: string, avatar: string) => {
    const config = DATA_CONFIG.profile_update;
    const data = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(config, {}, {});
    return data;
  };

  flownsAuthTransaction = async (transaction, envelope: string) => {
    const message = {
      envelope_message: envelope,
    };
    // console.log({transaction,message})
    const config = DATA_CONFIG.flowns_signature;
    const data = await fetchConfigRequest(
      config,
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
    const data = await fetchConfigRequest(
      config,
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
    const config = DATA_CONFIG.nft_catalog;
    const { data } = await fetchConfigRequest(config, {}, {});
    return data;
  };

  cadenceScripts = async (network: string) => {
    const config = DATA_CONFIG.cadence_scripts;
    const { data } = await fetchConfigRequest(config, { network }, {});
    return data;
  };

  cadenceScriptsV2 = async () => {
    const config = DATA_CONFIG.cadence_scripts_v2;
    const { data } = await fetchConfigRequest(config, {}, {});
    return data;
  };

  nftCatalogList = async (address: string, limit: any, offset: any, network: string) => {
    const config = DATA_CONFIG.nft_catalog_list;
    const { data } = await fetchConfigRequest(config, {
      address,
      limit,
      offset,
      network,
    });
    return data;
  };

  nftCatalogCollections = async (address: string, network: string) => {
    const config = DATA_CONFIG.nft_catalog_collections;
    const { data } = await fetchConfigRequest(config, {
      address,
      network,
    });
    return data;
  };

  nftCatalogCollectionList = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any,
    network: string
  ) => {
    const config = DATA_CONFIG.nft_catalog_collection_list;
    const { data } = await fetchConfigRequest(config, {
      address,
      limit,
      offset,
      collectionIdentifier: contractName,
      network,
    });
    return data;
  };

  nftCollectionApiPaging = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any,
    network: string
  ) => {
    const config = DATA_CONFIG.nft_catalog_collection_api_paging;
    const { data } = await fetchConfigRequest(config, {
      address,
      limit,
      offset,
      path: contractName,
      network,
    });
    return data;
  };

  nftCollectionInfo = async (
    address: string,
    contractName: string,
    limit: any,
    offset: any,
    network: string
  ) => {
    const config = DATA_CONFIG.nft_catalog_collection_info;
    const { data } = await fetchConfigRequest(config, {
      address,
      path: contractName,
      network,
    });
    return data;
  };

  nftCollectionList = async () => {
    const config = DATA_CONFIG.nft_collection_list;
    const { data } = await fetchConfigRequest(config, {}, {});
    return data;
  };

  evmFTList = async () => {
    const config = DATA_CONFIG.evm_ft_list;
    const { data } = await fetchConfigRequest(config, {}, {});
    return data;
  };

  getEvmFT = async (address: string, network: string) => {
    const config = DATA_CONFIG.get_evm_ft;
    const { data } = await fetchConfigRequest(config, {
      address,
      network,
    });
    return data;
  };

  getEvmFTPrice = async () => {
    const gitPrice = await storage.getExpiry('EVMPrice');

    if (gitPrice) {
      return gitPrice;
    } else {
      const config = DATA_CONFIG.get_prices;
      const { data } = await fetchConfigRequest(config, {}, {});

      storage.setExpiry('EVMPrice', data, 6000);
      return data;
    }
  };

  evmNFTList = async () => {
    const config = DATA_CONFIG.evm_nft_list;
    const { data } = await fetchConfigRequest(config, {}, {});
    return data;
  };

  getEvmNFT = async (address: string, network: string) => {
    const config = DATA_CONFIG.evm_nft_detail;
    const { data } = await fetchConfigRequest(config, {
      address,
      network,
    });
    return data;
  };

  decodeEvmCall = async (data: string, address = '') => {
    const bodyData = {
      to: address, // address -- optional
      data: data, // calldata -- required
    };
    const config = DATA_CONFIG.evm_decode_data;
    const res = await fetchConfigRequest(config, {}, bodyData);
    return res;
  };

  EvmNFTcollectionList = async (
    address: string,
    collectionIdentifier: string,
    limit = 24,
    offset = 0
  ) => {
    const config = DATA_CONFIG.evm_nft_collection_list;
    const network = await userWalletService.getNetwork();
    const { data } = await fetchConfigRequest(config, {
      network,
      address,
      collectionIdentifier,
      limit,
      offset,
    });
    return data;
  };

  EvmNFTID = async (address: string) => {
    const network = await userWalletService.getNetwork();
    const config = DATA_CONFIG.evm_nft_id;
    const { data } = await fetchConfigRequest(config, {
      network,
      address,
    });
    return data;
  };

  EvmNFTList = async (address: string, limit = 24, offset = 0) => {
    const network = await userWalletService.getNetwork();
    const config = DATA_CONFIG.evm_nft_list_v3;
    const { data } = await fetchConfigRequest(config, {
      network,
      address,
      limit,
      offset,
    });
    return data;
  };

  getNFTCadenceList = async (address: string, network = 'mainnet', offset = 0, limit = 5) => {
    const config = DATA_CONFIG.nft_catalog_collections;
    const { data } = await fetchConfigRequest(config, {
      network,
      address,
    });
    return data;
  };

  getNFTCadenceCollection = async (
    address: string,
    network = 'mainnet',
    identifier,
    offset = 0,
    limit = 24
  ) => {
    const config = DATA_CONFIG.nft_catalog_collection_list;
    const { data } = await fetchConfigRequest(config, {
      address,
      network,
      offset,
      limit,
      collectionIdentifier: identifier,
    });
    return data;
  };

  getNFTV2CollectionList = async (address: string, network = 'mainnet') => {
    const config = DATA_CONFIG.nft_v2_collection_list;
    const { data } = await fetchConfigRequest(config, {
      network,
      address,
    });
    return data;
  };

  genTx = async (contract_name: string) => {
    const config = DATA_CONFIG.nft_gentx;
    const { data } = await fetchConfigRequest(config, {
      collectionIdentifier: contract_name,
    });
    return data;
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

    const config = DATA_CONFIG.get_news;
    const data = await fetchConfigRequest(config, {}, {});

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
      const config = DATA_CONFIG.get_config;
      const result = await fetchConfigRequest(config, {}, {});

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

if (process.env.NODE_ENV === 'development') {
  // Log all functions and their signatures
  const functions = Object.entries(openApiService)
    .filter(
      ([name, value]) =>
        typeof value === 'function' &&
        name !== 'constructor' &&
        typeof name === 'string' &&
        name !== 'GET'
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
}

export default openApiService;
