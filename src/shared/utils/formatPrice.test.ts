import { describe, it, expect } from 'vitest';

import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  const DEFAULT_THRESHOLD = 4;

  it('should handle zero', () => {
    const testCases = [
      {
        input: 0,
        threshold: 4,
        expected: { leadingPart: '0.00', zeroPart: null, endingPart: null },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should format numbers >= 1 with two decimal places', () => {
    const testCases = [
      { input: 1.23456, threshold: 4, expected: '1.23' },
      { input: 123.456789, threshold: 4, expected: '123.46' },
      { input: 1000, threshold: 4, expected: '1000.00' },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: {
          leadingPart: expected,
          zeroPart: null,
          endingPart: null,
        },
      });
    });
  });

  it('should format numbers < 1 with two significant digits after zeros', () => {
    const testCases = [
      { input: 0.123456, threshold: 4, expected: '0.12' },
      { input: 0.0123456, threshold: 4, expected: '0.012' },
      { input: 0.00123456, threshold: 4, expected: '0.0012' },
      { input: 0.000123456, threshold: 4, expected: '0.00012' }, // 3 zeros, not condensed
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: {
          leadingPart: expected,
          zeroPart: null,
          endingPart: null,
        },
      });
    });
  });

  it('should condense numbers with many zeros after decimal', () => {
    const testCases = [
      {
        input: 0.0001234, // 4 zeros total, should not condense yet
        threshold: 4,
        expected: {
          leadingPart: '0.00012',
          zeroPart: null,
          endingPart: null,
        },
      },
      {
        input: 0.00001234, // 4 zeros total, should condense with zeroPart 4
        threshold: 4,
        expected: {
          leadingPart: '0.0',
          zeroPart: 3,
          endingPart: '12',
        },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should handle numbers with up to 8 zeros after decimal', () => {
    const testCases = [
      {
        input: 0.00000001234,
        expected: {
          leadingPart: '0.0',
          zeroPart: 6,
          endingPart: '12',
        },
      },
      {
        input: 0.000000001234,
        expected: {
          leadingPart: '0.0',
          zeroPart: 7,
          endingPart: '12',
        },
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = formatPrice(input, DEFAULT_THRESHOLD);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should handle sequential test cases for all zero counts', () => {
    const testCases = [
      {
        input: 0.1234,
        threshold: 4,
        expected: { leadingPart: '0.12', zeroPart: null, endingPart: null },
      },
      {
        input: 0.01234,
        threshold: 4,
        expected: { leadingPart: '0.012', zeroPart: null, endingPart: null },
      },
      {
        input: 0.001234,
        threshold: 4,
        expected: { leadingPart: '0.0012', zeroPart: null, endingPart: null },
      },
      {
        input: 0.0001234,
        threshold: 4,
        expected: { leadingPart: '0.00012', zeroPart: null, endingPart: null },
      },
      {
        input: 0.00001234,
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 3, endingPart: '12' },
      },
      {
        input: 0.000001234,
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 4, endingPart: '12' },
      },
      {
        input: 0.0000001234,
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 5, endingPart: '12' },
      },
      {
        input: 0.00000001234,
        threshold: 4,
        expected: { leadingPart: '0.0', zeroPart: 6, endingPart: '12' },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result.price).toBe(input);
      expect(result.formattedPrice).toEqual(expected);
    });
  });

  it('should respect different threshold values', () => {
    const testCases = [
      {
        input: 0.0001234, // 4 zeros
        threshold: 3,
        expected: {
          leadingPart: '0.0',
          zeroPart: 2,
          endingPart: '12',
        },
      },
      {
        input: 0.0001234, // 4 zeros
        threshold: 5,
        expected: {
          leadingPart: '0.00012',
          zeroPart: null,
          endingPart: null,
        },
      },
      {
        input: 0.001234, // 2 zeros
        threshold: 2,
        expected: {
          leadingPart: '0.0',
          zeroPart: 1,
          endingPart: '12',
        },
      },
      {
        input: 0.000001234, // 5 zeros
        threshold: 6,
        expected: {
          leadingPart: '0.0000012',
          zeroPart: null,
          endingPart: null,
        },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });

  it('should handle edge cases with different thresholds', () => {
    const testCases = [
      {
        input: 0,
        threshold: 2,
        expected: {
          leadingPart: '0.00',
          zeroPart: null,
          endingPart: null,
        },
      },
      {
        input: 123.456,
        threshold: 2,
        expected: {
          leadingPart: '123.46',
          zeroPart: null,
          endingPart: null,
        },
      },
      {
        input: 0.00000001234,
        threshold: 10,
        expected: {
          leadingPart: '0.000000012',
          zeroPart: null,
          endingPart: null,
        },
      },
      {
        input: 0.00000001234,
        threshold: 2,
        expected: {
          leadingPart: '0.0',
          zeroPart: 6,
          endingPart: '12',
        },
      },
    ];

    testCases.forEach(({ input, threshold, expected }) => {
      const result = formatPrice(input, threshold);
      expect(result).toEqual({
        price: input,
        formattedPrice: expected,
      });
    });
  });
});
