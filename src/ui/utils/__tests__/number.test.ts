import { describe, it, expect } from 'vitest';

import {
  splitNumberByStep,
  formatTokenAmount,
  formatLargeNumber,
  addDotSeparators,
  stripEnteredAmount,
  stripFinalAmount,
} from '../number';

describe('splitNumberByStep', () => {
  it('should format numbers with default parameters', () => {
    expect(splitNumberByStep('1234567')).toBe('1,234,567');
    expect(splitNumberByStep('1234.89')).toBe('1,234.89');
  });

  it('should handle custom step and symbol', () => {
    expect(splitNumberByStep('1234567', 2, '_')).toBe('1_23_45_67');
  });

  it('should handle forceInt parameter', () => {
    expect(splitNumberByStep('1234567.89', 3, ',', true)).toBe('1,234,567');
  });
});

describe('formatTokenAmount', () => {
  it('should format token amounts with default decimals', () => {
    expect(formatTokenAmount('1234.5678')).toBe('1,234.5678');
    expect(formatTokenAmount('1234.56789')).toBe('1,234.5679');
  });

  it('should handle custom decimals', () => {
    expect(formatTokenAmount('1234.5678', 2)).toBe('1,234.57');
  });

  it('should handle zero and empty values', () => {
    expect(formatTokenAmount(0)).toBe('0');
    expect(formatTokenAmount('')).toBe('0');
  });
});

describe('formatLargeNumber', () => {
  it('should format numbers into human readable format', () => {
    expect(formatLargeNumber(1500000)).toBe('1.500M');
    expect(formatLargeNumber(2500000000)).toBe('2.500B');
    expect(formatLargeNumber(1500000000000)).toBe('1.500T');
  });

  it('should handle numbers less than 1M', () => {
    expect(formatLargeNumber(999999)).toBe('999999');
  });

  it('should handle string numbers with $ prefix', () => {
    expect(formatLargeNumber('$1500000')).toBe('1.500M');
  });
});

describe('addDotSeparators', () => {
  it('should format numbers with proper separators', () => {
    expect(addDotSeparators('1234567.89')).toBe('1,234,567.89');
  });

  it('should handle trailing zeros', () => {
    expect(addDotSeparators('1234.50000000')).toBe('1,234.5');
  });

  it('should preserve at least some decimal places', () => {
    expect(addDotSeparators('1234.00000000')).toBe('1,234.000');
  });
});

describe('stripEnteredAmount', () => {
  it('should handle real-time input correctly', () => {
    // Basic cases
    expect(stripEnteredAmount('123', 2)).toBe('123');
    expect(stripEnteredAmount('123.', 2)).toBe('123.');
    expect(stripEnteredAmount('123.4', 2)).toBe('123.4');

    // Multiple decimal points
    expect(stripEnteredAmount('12..34.56', 2)).toBe('12.');
    expect(stripEnteredAmount('12.34.56', 2)).toBe('12.34');

    // Leading zeros
    expect(stripEnteredAmount('000123', 2)).toBe('123');
    expect(stripEnteredAmount('0', 2)).toBe('0');
    expect(stripEnteredAmount('00.123', 2)).toBe('0.12');

    // Decimal cases
    expect(stripEnteredAmount('.123', 2)).toBe('0.12');
    expect(stripEnteredAmount('.', 2)).toBe('0.');
    expect(stripEnteredAmount('', 2)).toBe('');
  });
});

describe('stripFinalAmount', () => {
  it('should handle empty and invalid inputs', () => {
    expect(stripFinalAmount('', 2)).toBe('0');
    expect(stripFinalAmount('   ', 2)).toBe('0');
    expect(stripFinalAmount('.', 2)).toBe('0');
    expect(stripFinalAmount('..', 2)).toBe('0');
  });

  it('should format final amounts correctly', () => {
    // Basic cases
    expect(stripFinalAmount('123', 2)).toBe('123');
    expect(stripFinalAmount('123.', 2)).toBe('123');
    expect(stripFinalAmount('123.4', 2)).toBe('123.4');
    expect(stripFinalAmount('123.40', 2)).toBe('123.4');
    // Removes extra zeros even when truncating
    expect(stripFinalAmount('123.401', 2)).toBe('123.4');
    expect(stripFinalAmount('123.471', 2)).toBe('123.47');
    // Truncates doesn't round up
    expect(stripFinalAmount('123.479', 2)).toBe('123.47');

    // Multiple decimal points
    expect(stripFinalAmount('12..34.56', 2)).toBe('12');
    expect(stripFinalAmount('12.34.56', 2)).toBe('12.34');

    // Leading zeros
    expect(stripFinalAmount('000123', 2)).toBe('123');
    expect(stripFinalAmount('0', 2)).toBe('0');
    expect(stripFinalAmount('00.123', 2)).toBe('0.12');

    // Decimal cases
    expect(stripFinalAmount('.123', 2)).toBe('0.12');
    expect(stripFinalAmount('.', 2)).toBe('0');
    expect(stripFinalAmount('', 2)).toBe('0');
    // Handle getting rid of trailing zeros
    expect(stripFinalAmount('123.000', 2)).toBe('123');
  });
});
