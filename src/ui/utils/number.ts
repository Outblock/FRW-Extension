import BigNumber from 'bignumber.js';

import { DecimalMappingValues } from '@/shared/types/transaction-types';

export const splitNumberByStep = (
  num: number | string,
  step = 3,
  symbol = ',',
  forceInt = false
) => {
  let [int, float] = (num + '').split('.');
  const reg = new RegExp(`(\\d)(?=(\\d{${step}})+(?!\\d))`, 'g');

  int = int.replace(reg, `$1${symbol}`);
  if (Number(num) > 1000000 || forceInt) {
    // hide the after-point part if number is more than 1000000
    float = '';
  }
  if (float) {
    return `${int}.${float}`;
  }
  return int;
};

export const formatTokenAmount = (amount: number | string, decimals = 4) => {
  if (!amount) return '0';
  const bn = new BigNumber(amount);
  const str = bn.toFixed();
  const split = str.split('.');
  if (!split[1] || split[1].length < decimals) {
    return splitNumberByStep(bn.toFixed());
  }
  return splitNumberByStep(bn.toFixed(decimals));
};

export const formatLargeNumber = (num) => {
  if (typeof num === 'string' && num.startsWith('$')) {
    num = num.slice(1);
  }
  if (num >= 1e12) {
    return (num / 1e12).toFixed(3) + 'T'; // Trillions
  } else if (num >= 1e9) {
    return (num / 1e9).toFixed(3) + 'B'; // Billions
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(3) + 'M'; // Millions
  } else {
    return num.toString(); // Less than 1M, return as-is
  }
};

export const addDotSeparators = (num) => {
  // replace with http://numeraljs.com/ if more requirements
  const [integerPart, decimalPart] = parseFloat(num).toFixed(8).split('.');

  // Format the integer part with comma separators
  const newIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const trimmedDecimal = decimalPart.replace(/0+$/, '');
  const formattedDecimal = trimmedDecimal.length > 0 ? trimmedDecimal : decimalPart.slice(-3);

  return `${newIntegerPart}.${formattedDecimal}`;
};

export const checkDecimals = (value: string, maxDecimals: number) => {
  const decimals = value.includes('.') ? value.split('.')[1]?.length || 0 : 0;
  return decimals <= maxDecimals;
};

export const getMaxDecimals = (currentTxState: string | undefined) => {
  if (!currentTxState) return 8;
  return DecimalMappingValues[currentTxState as keyof typeof DecimalMappingValues];
};

export const stripEnteredAmount = (value: string, maxDecimals: number) => {
  // Remove minus signs and non-digit/non-decimal characters
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Find the first decimal point and ignore everything after a second one
  const firstDecimalIndex = cleanValue.indexOf('.');
  if (firstDecimalIndex !== -1) {
    const beforeDecimal = cleanValue.slice(0, firstDecimalIndex).replace(/^0+/, '');
    const afterDecimalParts = cleanValue.slice(firstDecimalIndex + 1).split('.');
    const afterDecimal = afterDecimalParts.length > 0 ? afterDecimalParts[0] : '';

    // Handle integer part
    const integerPart = beforeDecimal === '' ? '0' : beforeDecimal;

    // Handle decimal part
    const trimmedDecimal = afterDecimal.slice(0, maxDecimals);

    return trimmedDecimal ? `${integerPart}.${trimmedDecimal}` : `${integerPart}.`;
  }

  // No decimal point case
  return cleanValue === '' ? '' : cleanValue === '0' ? '0' : cleanValue.replace(/^0+/, '');
};

export const stripFinalAmount = (value: string, maxDecimals: number) => {
  const strippedValue = stripEnteredAmount(value, maxDecimals);

  // Return '0' for empty string
  if (strippedValue === '') {
    return '0';
  }

  // Remove trailing decimal point and zeros after decimal
  if (strippedValue.includes('.')) {
    const [integerPart, decimalPart] = strippedValue.split('.');
    if (!decimalPart) {
      return integerPart;
    }

    const trimmedDecimal = decimalPart.replace(/0+$/, '');
    return trimmedDecimal ? `${integerPart}.${trimmedDecimal}` : integerPart;
  }

  return strippedValue;
};
