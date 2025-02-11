import { type TokenInfo } from 'flow-native-token-registry';

import { type Contact } from './network-types';
import { type CoinItem, type WalletAddress } from './wallet-types';

// Define the base token types
export type TokenType = 'FT' | 'Flow';

// Define the network types
export type NetworkType = 'Evm' | 'Cadence' | 'Child';

// Define the transaction direction
export type TransactionStateString = `${TokenType}from${NetworkType}to${NetworkType}`;

export type TransactionState = {
  // A unique key for the transaction state
  currentTxState: TransactionStateString | '';
  // the root account that owns the account we're sending from
  rootAddress: WalletAddress | '';

  // the address of the account we're sending from
  fromAddress: WalletAddress | '';
  // the network type of the root address
  fromNetwork: NetworkType;
  // the contact of the from address (if it exists)
  fromContact?: Contact;

  // the address of the to address
  toAddress: WalletAddress | '';
  // the network type of the to address
  toNetwork: NetworkType;
  // the contact of the to address (if it exists)
  toContact?: Contact;

  // the token we've selected for the transaction
  selectedToken: TokenInfo;

  // the coin info of the selected token
  coinInfo: CoinItem;

  // the type of token we're sending
  tokenType: TokenType;

  // the amount of the transaction as a decimal string
  amount: string;
  // the fiat amount of the transaction as a decimal string
  fiatAmount: string;
  // the currency of the fiat amount (note we only support USD for now)
  fiatCurrency: 'USD';
  // what did the user enter the value in - fiat or coin
  fiatOrCoin: 'fiat' | 'coin';
  // whether the balance was exceeded
  balanceExceeded: boolean;

  // the status of the transaction
  status?: 'pending' | 'success' | 'failed';
  // The transaction if of the transaction
  txId?: string;
};

// Type for the mapping
export type DecimalMapping = {
  [K in TransactionStateString]: number;
};

export const DecimalMappingValues: DecimalMapping = {
  // To Evm
  FTfromEvmtoEvm: 16,
  FTfromCadencetoEvm: 8,
  FTfromChildtoEvm: 8,
  FlowfromEvmtoEvm: 16,
  FlowfromCadencetoEvm: 8,
  FlowfromChildtoEvm: 8,

  // To Cadence
  FTfromEvmtoCadence: 18,
  FTfromCadencetoCadence: 8,
  FTfromChildtoCadence: 8,
  FlowfromEvmtoCadence: 8,
  FlowfromCadencetoCadence: 8,
  FlowfromChildtoCadence: 8,

  // To Child unused for now
  FTfromEvmtoChild: 18,
  FTfromCadencetoChild: 18,
  FTfromChildtoChild: 18,
  FlowfromEvmtoChild: 18,
  FlowfromCadencetoChild: 18,
  FlowfromChildtoChild: 18,
} as const;
