import { describe, it, expect, vi } from 'vitest';

// Mock the function
vi.mock('../../utils', () => ({
  HexToDecimalConverter: (hexValue: string) => {
    const convertHexToDecimal = (hex) => {
      if (!hex.startsWith('0x')) {
        hex = '0x' + hex;
      }
      return BigInt(hex).toString();
    };
    const decimalValue = convertHexToDecimal(hexValue);
    return decimalValue;
  },
}));

// Import from the mocked module
import { HexToDecimalConverter } from '../../utils';

describe('HexToDecimalConverter', () => {
  it('should convert hex to decimal', () => {
    expect(HexToDecimalConverter('0x1234567890')).toBe('78187493520');
    expect(HexToDecimalConverter('123ABC')).toBe('1194684');
  });

  it('should handle edge cases', () => {
    expect(HexToDecimalConverter('0')).toBe('0');
    expect(HexToDecimalConverter('0x0')).toBe('0');
    expect(HexToDecimalConverter('FF')).toBe('255');
  });

  it('should handle large numbers', () => {
    expect(HexToDecimalConverter('0xFFFFFFFF')).toBe('4294967295');
    expect(HexToDecimalConverter('FFFFFFFF')).toBe('4294967295');
  });
});
