import BN from 'bignumber.js';
import type { TokenInfo } from 'flow-native-token-registry';

import { type Contact } from '@/shared/types/network-types';
import type {
  NetworkType,
  TokenType,
  TransactionState,
  TransactionStateString,
} from '@/shared/types/transaction-types';
import { type CoinItem, type WalletAddress } from '@/shared/types/wallet-types';
import { isValidEthereumAddress } from '@/shared/utils/address';

import { getMaxDecimals, stripEnteredAmount, stripFinalAmount } from '../utils/number';

export const INITIAL_TRANSACTION_STATE: TransactionState = {
  currentTxState: '',
  rootAddress: '',
  fromAddress: '',
  tokenType: 'FT',
  fromNetwork: 'Evm',
  toNetwork: 'Evm',
  toAddress: '',
  selectedToken: {
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
  },
  coinInfo: {
    coin: '',
    unit: '',
    balance: 0,
    price: 0,
    change24h: 0,
    total: 0,
    icon: '',
  },
  amount: '0.0',
  fiatAmount: '0.0',
  fiatCurrency: 'USD',
  fiatOrCoin: 'coin',
  balanceExceeded: false,
};

type TransactionAction =
  | {
      type: 'initTransactionState';
      payload: {
        rootAddress: WalletAddress;
        fromAddress: WalletAddress;
        fromContact?: Contact;
      };
    }
  | {
      type: 'setSelectedToken';
      payload: {
        tokenInfo: TokenInfo;
        coinInfo: CoinItem;
      };
    }
  | {
      type: 'setTokenType';
      payload: TokenType;
    }
  | {
      type: 'setFromNetwork';
      payload: NetworkType;
    }
  | {
      type: 'setToNetwork';
      payload: NetworkType;
    }
  | {
      type: 'setToAddress';
      payload: {
        address: WalletAddress;
        contact?: Contact;
      };
    }
  | {
      type: 'setAmount';
      payload: string; // the amount of the transaction as a string
    }
  | {
      type: 'setFiatOrCoin';
      payload: 'fiat' | 'coin';
    }
  | {
      type: 'switchFiatOrCoin';
    }
  | {
      type: 'setAmountToMax';
    };

export const getTransactionStateString = (state: TransactionState): TransactionStateString | '' => {
  if (!state.tokenType || !state.fromNetwork || !state.toNetwork) return '';
  return `${state.tokenType}from${state.fromNetwork}to${state.toNetwork}`;
};

const deepCopyTxState = (state: TransactionState): TransactionState => {
  return {
    ...state,
    selectedToken: { ...state.selectedToken },
    coinInfo: { ...state.coinInfo },
  };
};

export const transactionReducer = (
  state: TransactionState,
  action: TransactionAction
): TransactionState => {
  switch (action.type) {
    case 'initTransactionState': {
      const { rootAddress, fromAddress, fromContact } = action.payload;
      // Set from network based on the from address
      const fromNetwork = isValidEthereumAddress(fromAddress)
        ? 'Evm'
        : fromAddress === rootAddress
          ? 'Cadence'
          : 'Child';
      return { ...deepCopyTxState(state), rootAddress, fromAddress, fromNetwork, fromContact };
    }
    case 'setSelectedToken': {
      // Set the token type based on the token symbol
      const tokenType = action.payload.tokenInfo.symbol.toLowerCase() !== 'flow' ? 'FT' : 'Flow';
      return {
        ...deepCopyTxState(state),
        selectedToken: action.payload.tokenInfo,
        tokenType,
        coinInfo: action.payload.coinInfo,
      };
    }
    case 'setToAddress': {
      const { address, contact } = action.payload;
      const toNetwork = isValidEthereumAddress(address)
        ? 'Evm'
        : address === state.rootAddress
          ? 'Cadence'
          : 'Child';
      return { ...deepCopyTxState(state), toAddress: address, toNetwork, toContact: contact };
    }
    case 'setFiatOrCoin': {
      return { ...deepCopyTxState(state), fiatOrCoin: action.payload };
    }
    case 'switchFiatOrCoin': {
      return {
        ...deepCopyTxState(state),
        fiatOrCoin: state.fiatOrCoin === 'fiat' ? 'coin' : 'fiat',
      };
    }
    case 'setAmountToMax': {
      // Check if entering in coin or fiat

      if (state.fiatOrCoin === 'coin') {
        return transactionReducer(state, {
          type: 'setAmount',
          payload: state.coinInfo.balance.toString(),
        });
      } else if (state.fiatOrCoin !== 'fiat') {
        throw new Error('Not specified if entering in coin or fiat');
      }
      // This will calculate the max fiat amount that can be entered
      const stateInCoinWithMaxAmount = transactionReducer(
        {
          ...deepCopyTxState(state),
          fiatOrCoin: 'coin',
        },
        {
          type: 'setAmount',
          payload: state.coinInfo.balance.toString(),
        }
      );
      return { ...stateInCoinWithMaxAmount, fiatOrCoin: 'fiat' };
    }
    case 'setAmount': {
      // Validate the amount
      let amountInCoin = '0.0';
      let amountInFiat = '0.0';
      let balanceExceeded = false;
      let remainingBalance = new BN(0);
      const balance = new BN(state.coinInfo.balance || '0.0');
      const price = new BN(state.coinInfo.price || '0.0');

      if (state.fiatOrCoin === 'fiat') {
        // Strip the amount entered to 3 decimal places
        amountInFiat = stripEnteredAmount(action.payload, 3);
        // Check if the balance is exceeded
        const fiatAmountAsBN = new BN(stripFinalAmount(amountInFiat, 3));
        const calculatedAmountInCoin = price.isZero() ? new BN(0) : fiatAmountAsBN.dividedBy(price);

        // Figure out the amount in coin trimmed to the max decimals
        if (calculatedAmountInCoin.isNaN()) {
          amountInCoin = '0.0';
        } else {
          amountInCoin = calculatedAmountInCoin.toFixed(
            getMaxDecimals(state.currentTxState!),
            BN.ROUND_DOWN
          );
        }
        // Calculate the remaining balance after the transaction
        remainingBalance = balance.minus(new BN(amountInCoin));
      } else if (state.fiatOrCoin === 'coin') {
        // Check if the amount entered has too many decimal places
        amountInCoin = stripEnteredAmount(action.payload, state.selectedToken.decimals);

        // Check if the balance is exceeded
        const amountBN = new BN(
          stripFinalAmount(amountInCoin, state.selectedToken.decimals) || '0'
        );
        // Calculate the remaining balance after the transaction
        remainingBalance = balance.minus(amountBN);
        // Calculate fiat amount
        const calculatedFiatAmount = amountBN.times(price);
        amountInFiat = calculatedFiatAmount.toFixed(3, BN.ROUND_DOWN);
      } else {
        console.error('Not specified if entering in coin or fiat');
        return state;
      }
      // Check the remaining balance to see if it's exceeded
      if (remainingBalance.isLessThan(0)) {
        balanceExceeded = true;
      } else if (state.coinInfo.coin === 'flow' && remainingBalance.isLessThan(0.001)) {
        // If we're less than the minimum allowed flow balance then that's also exceeding balance
        balanceExceeded = true;
      } else {
        balanceExceeded = false;
      }
      if (amountInCoin === state.amount && amountInFiat === state.fiatAmount) {
        // No changes to the state
        return state;
      }
      // Return the new state with the amount (in coin), the fiat amount, and whether the balance was exceeded
      return {
        ...deepCopyTxState(state),
        amount: amountInCoin,
        fiatAmount: amountInFiat,
        balanceExceeded,
      };
    }
  }
  return state;
};
