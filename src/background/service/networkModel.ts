export interface CheckResponse {
  unique: boolean;
  username: string;
}

export enum PriceProvider {
  binance = 'binance',
  kakren = 'kraken',
  huobi = 'huobi',
  coinbase = 'coinbase-pro',
  kucoin = 'kucoin',
  increment = 'increment',
}

export interface TokenModel {
  name: string;
  address: FlowNetworkModel;
  contract_name: string;
  storage_path: FlowTokenStoragePath;
  decimal: number;
  icon: string;
  symbol: string;
  website: string | null;
}
export interface NFTModel {
  name: string;
  id: string;
  address: string;
  contract_name: string;
  logo: string | null;
  banner: string | null;
  official_website: string | null;
  marketplace: string | null;
  description: string | null;
  path: NFTPath;
}
export interface NFTPath {
  storage_path: string;
  public_path: string;
  public_collection_name: string;
  public_type: string;
  private_type: string;
}

export interface SecureCadenceCompatible {
  mainnet: boolean;
  testnet: boolean;
}

export interface FlowNetworkModel {
  mainnet: string | null;
  testnet: string | null;
}

export interface FlowTokenStoragePath {
  balance: string;
  vault: string;
  receiver: string;
}

export enum FlowNetwork {
  mainnet = 'mainnet',
  testnet = 'testnet',
  crescendo = 'crescendo',
}

export enum Period {
  oneDay = '1D',
  oneWeek = '1W',
  oneMonth = '1M',
  threeMonth = '3M',
  oneYear = '1Y',
  all = 'All',
}

export enum PeriodFrequency {
  fiveMinute = 300,
  halfHour = 1800,
  oneHour = 3600,
  oneDay = 86400,
  threeDay = 259200,
  oneWeek = 604800,
}

export interface Contact {
  id: number;
  address: string;
  avatar?: string;
  domain?: Domain;
  contact_name: string;
  username?: string;
  type?: number;
  contact_type?: number;
}

export enum FlowDomain {
  find = 0,
  flowns = 1,
  meow = 2,
  none = 999,
}

export interface NFTData {
  nfts: any[];
  nftCount: number;
}

export interface NFTCollectionData {
  name: string;
  nfts: any[];
  nftCount: number;
}
export interface NFTCollectionList {
  collection: any;
  count: number;
  ids: number[];
}

export interface Domain {
  domain_type: FlowDomain;
  value: string;
}

export interface StorageInfo {
  available: number;
  used: number;
  capacity: number;
}
export interface AccountKey {
  hash_algo: number;
  public_key: string;
  sign_algo: number;
  weight: number;
}

export interface SignInResponse {
  custom_token: string;
  id: string;
}

export interface UserInfoResponse {
  avatar: string;
  nickname: string;
  username: string;
}

export interface SendTransactionResponse {
  transaction_id: string;
}

export interface UserWalletResponse {
  id: string;
  primary_wallet: number;
  username: string;
  wallets: Array<WalletResponse>;
}

export interface WalletResponse {
  color: string;
  icon: string;
  name: string;
  chain_id: string;
  wallet_id: number;
  blockchain: Array<BlockchainResponse>;
}

export interface BlockchainResponse {
  name: string;
  address: string;
  chain_id: string;
  coins: Array<string>;
  id: number;
  icon: string;
}

interface Thumbnail {
  url: string;
}

interface AccountDetails {
  name: string;
  description: string;
  thumbnail: Thumbnail;
}

export interface ChildAccount {
  [key: string]: AccountDetails;
}

export interface FlowArgument {
  type: string;
  value: string;
}

export interface FlowTransactionProposalKey {
  address: string;
  key_index: number;
  sequence_number?: string;
}

export interface TransactionSignature {
  address: string;
  key_index: number;
  signature: string;
}

export interface FlowTransaction {
  script: string;
  arguments: Array<FlowArgument>;
  reference_block_id?: string;
  gas_limit: number | 999;
  proposal_key: FlowTransactionProposalKey;
  payer_address: string;
  authorizers: Array<string>;
  payload_signatures?: Array<TransactionSignature>;
  envelope_signatures?: Array<TransactionSignature>;
}

export interface ServerChain {
  id: string;
  community_id: number;
  name: string;
  native_token_id: string;
  logo_url: string;
  wrapped_token_id: string;
  symbol: string;
}

export interface Tx {
  chainId: number;
  data: string;
  from: string;
  gas: string;
  gasPrice: string;
  nonce: string;
  to: string;
  value: string;
  r?: string;
  s?: string;
  v?: string;
}

export interface TotalBalanceResponse {
  total_usd_value: number;
  chain_list: string[];
}

export interface TokenItem {
  amount: number;
  chain: string;
  decimals: number;
  display_symbol: string | null;
  id: string;
  is_core: boolean;
  is_verified: boolean;
  is_wallet: boolean;
  is_infinity?: boolean;
  logo_url: string;
  name: string;
  optimized_symbol: string;
  price: number;
  symbol: string;
  time_at: number;
  usd_value?: number;
  raw_amount?: number;
}

export interface RPCResponse<T> {
  result: T;
  id: number;
  jsonrpc: string;
  error?: {
    code: number;
    message: string;
  };
}

export interface GetTxResponse {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  v: string;
  r: string;
  s: string;
  front_tx_count: number;
  code: 0 | -1; // 0: success, -1: failed
  status: -1 | 0 | 1; // -1: failed, 0: pending, 1: success
  gas_used: number;
  token: TokenItem;
}

export interface TransactionItem {
  coin: string;
  interactions: string;
  status: string;
  authorizers: string[];
  proposer: string;
  payer: string;
  hash: string;
  time: number;
  interaction: string;
  amount: number;
  error?: string;
}

export interface ContractRecord {
  identifier: string;
}
export interface TransactionRecord {
  error: string;
  contractInteractions: ContractRecord;
  eventCount: number;
  authorizers: string[];
  proposer: string;
  payer: string;
  hash: string;
  time: number;
  interaction: string;
  amount: number;
}

export interface DeviceInfoRequest {
  device_id: string;
  ip: string;
  name: string;
  type: string;
  user_agent: string;

  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  district?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  currency?: string;
  isp?: string;
  org?: string;
}

export interface DeviceInfo {
  account_key: AccountKey;
  device_info: DeviceInfoRequest;
}

/*
 * News items
 */
export type NewsType = 'message' | 'image';

export type NewsPriority = 'urgent' | 'high' | 'medium' | 'low';

export type NewsDisplayType =
  | 'once' // show once
  | 'click' // close it when user click on it
  | 'expiry'; // it will display until it expired

export type NewsConditionType =
  | 'unknown'
  | 'canUpgrade'
  | 'isIOS'
  | 'isAndroid'
  | 'isWeb'
  | 'insufficientStorage';

export interface NewsItem {
  id: string;
  priority: NewsPriority;
  type: NewsType;
  title: string;
  body?: string;
  icon?: string;
  image?: string;
  url?: string;
  expiryTime: Date;
  displayType: NewsDisplayType;
  conditions?: NewsConditionType[];
}
