// Define the base token types
export type TokenType = 'FT' | 'Flow';

// Define the network types
export type NetworkType = 'Evm' | 'Cadence' | 'Child';

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

export type TransactionStateString = `${TokenType}from${NetworkType}to${NetworkType}`;

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
