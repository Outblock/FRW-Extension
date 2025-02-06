/**
 * @vitest-environment jsdom
 */

import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WalletController } from '../../../background/controller/wallet';
import MoveFromChildToken from '../../views/EvmMove/MoveFromChild/MoveToken';
import MoveFromEvmToken from '../../views/EvmMove/MoveFromEvm/MoveToken';
import MoveFromFlowToken from '../../views/EvmMove/MoveFromFlow/MoveToken';
import MoveFromParentToken from '../../views/EvmMove/MoveFromParent/MoveToken';
import TransferAmount from '../../views/Send/TransferAmount';

// Mock useCoinStore
vi.mock('@/ui/stores/useCoinStore', () => ({
  useCoinStore: () => ({
    availableFlow: '9.999',
  }),
}));

// Mock WalletController with all necessary transfer methods
vi.mock('../../../background/controller/wallet', () => {
  return {
    WalletController: class MockWalletController {
      async transferFTToEvmV2(
        tokenAddress: string,
        tokenName: string,
        amount: string,
        evmAddress: string,
        data: string
      ) {
        return amount; // Should preserve exact string value
      }

      async transferFTFromEvm(
        tokenAddress: string,
        tokenName: string,
        amount: string,
        flowAddress: string
      ) {
        return amount; // Should preserve exact string value
      }

      async moveFTfromChild(
        childAddress: string,
        tokenProvider: string,
        amount: string,
        tokenName: string
      ) {
        return amount; // Should preserve exact string value
      }
    },
  };
});

// Mock chrome.i18n.getMessage
Object.assign(global, {
  chrome: {
    i18n: {
      getMessage: (key: string) => key,
    },
  },
});

// Test helper functions
const createTestProps = (overrides = {}) => ({
  amount: '',
  setAmount: vi.fn(),
  secondAmount: '0',
  setSecondAmount: vi.fn(),
  exceed: false,
  setExceed: vi.fn(),
  coinInfo: {
    unit: 'flow',
    balance: '10',
    price: '1.5',
    coin: 'FLOW',
    icon: 'flow-icon.png',
    amountbalance: '10',
  },
  setCurrentCoin: vi.fn(),
  coinList: [
    {
      unit: 'flow',
      balance: '10',
      price: '1.5',
      coin: 'FLOW',
      icon: 'flow-icon.png',
    },
  ],
  ...overrides,
});

const renderWithRouter = (Component, props) => {
  return render(
    <BrowserRouter>
      <Component {...props} />
    </BrowserRouter>
  );
};

const testAmountInput = async (Component, props) => {
  const { setAmount, setExceed } = props;
  const rendered = renderWithRouter(Component, props);
  const input = screen.getByPlaceholderText('Amount');

  // Test exact decimal places are preserved
  fireEvent.change(input, { target: { value: '1.23456789' } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(setAmount).toHaveBeenCalledWith('1.23456789');

  // Test negative numbers
  fireEvent.change(input, { target: { value: '-1' } });
  expect((input as HTMLInputElement).value).toBe(''); // Should prevent negative numbers

  // Test non-numeric input
  fireEvent.change(input, { target: { value: 'abc' } });
  expect((input as HTMLInputElement).value).toBe(''); // Should prevent non-numeric input

  // Test exceeding balance
  fireEvent.change(input, { target: { value: '11' } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(setExceed).toHaveBeenCalledWith(true);

  return rendered;
};

const testFlowMinimumBalance = async (Component, props) => {
  const { setExceed } = props;
  renderWithRouter(Component, props);
  const input = screen.getByPlaceholderText('Amount');

  // Test amount that would leave less than 0.001 FLOW
  fireEvent.change(input, { target: { value: '9.9995' } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(setExceed).toHaveBeenCalledWith(true);

  // Test amount that leaves exactly 0.001 FLOW
  fireEvent.change(input, { target: { value: '9.999' } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(setExceed).toHaveBeenCalledWith(false);
};

const testMaxButton = async (Component, props) => {
  const { setAmount } = props;
  renderWithRouter(Component, props);
  const maxButton = screen.getByText('Max');
  await userEvent.click(maxButton);

  // For FLOW token, Max should use availableFlow from useCoinStore and preserve as string
  expect(setAmount).toHaveBeenCalledWith('9.999');
};

const testUSDConversion = async (Component, props) => {
  const { setAmount, setSecondAmount } = props;
  renderWithRouter(Component, props);
  const input = screen.getByPlaceholderText('Amount');

  // Enter precise FLOW amount
  fireEvent.change(input, { target: { value: '1.23456789' } });
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Original amount should be preserved
  expect(setAmount).toHaveBeenCalledWith('1.23456789');

  // USD conversion can be rounded to 3 decimals
  expect(setSecondAmount).toHaveBeenCalledWith('1.852');
};

describe('Amount Handling', () => {
  describe('TransferAmount Component', () => {
    let props;

    beforeEach(() => {
      props = createTestProps();
    });

    it('should preserve exact string values for amounts', async () => {
      await testAmountInput(TransferAmount, props);
    });

    it('should enforce minimum FLOW balance of 0.001', async () => {
      await testFlowMinimumBalance(TransferAmount, props);
    });

    it('should handle Max button correctly preserving string type', async () => {
      await testMaxButton(TransferAmount, props);
    });

    it('should handle USD conversion correctly while preserving amount precision', async () => {
      await testUSDConversion(TransferAmount, props);
    });
  });

  describe('MoveToken Components', () => {
    const moveTokenComponents = [
      { name: 'MoveFromChildToken', Component: MoveFromChildToken },
      { name: 'MoveFromEvmToken', Component: MoveFromEvmToken },
      { name: 'MoveFromFlowToken', Component: MoveFromFlowToken },
      { name: 'MoveFromParentToken', Component: MoveFromParentToken },
    ];

    moveTokenComponents.forEach(({ name, Component }) => {
      describe(name, () => {
        let props;

        beforeEach(() => {
          props = createTestProps();
        });

        it('should preserve exact string values for amounts', async () => {
          await testAmountInput(Component, props);
        });

        it('should enforce minimum FLOW balance of 0.001', async () => {
          await testFlowMinimumBalance(Component, props);
        });

        it('should handle Max button correctly preserving string type', async () => {
          await testMaxButton(Component, props);
        });

        it('should handle USD conversion correctly while preserving amount precision', async () => {
          await testUSDConversion(Component, props);
        });
      });
    });
  });
  /*


  describe('Transaction Amount Handling', () => {
    const walletController = new WalletController();
    const amount = '1.23456789';

    it('should preserve exact amount for Flow to EVM transfer', async () => {
      const result = await walletController.transferFTToEvmV2(
        'A.0x0000000000000000.FlowToken.Vault',
        amount,
        '0x'
      );
      expect(result).toBe('1.23456789');
    });

    it('should preserve exact amount for EVM to Flow transfer', async () => {
      const result = await walletController.transferFTFromEvm(
        'tokenAddress',
        'tokenName',
        amount,
        'flowAddress'
      );
      expect(result).toBe('1.23456789');
    });

    it('should preserve exact amount for child to parent transfer', async () => {
      const result = await walletController.moveFTfromChild(
        'childAddress',
        'flowTokenProvider',
        amount,
        'tokenName'
      );
      expect(result).toBe('1.23456789');
    });
  }); */
});
