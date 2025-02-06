// Define the base token types
export type TokenType = 'FT' | 'Flow';

// Define the network types
export type NetworkType = 'Cadence' | 'Child' | 'Evm';

// Define the transaction direction
export interface TransactionDirection {
  from: NetworkType;
  to: NetworkType;
}

export interface TransactionState {
  type: TokenType;
  direction: TransactionDirection;
  status: 'pending' | 'success' | 'failed';
  amount: string;
  fromAddress: string;
  toAddress: string;
  hash?: string;
}
