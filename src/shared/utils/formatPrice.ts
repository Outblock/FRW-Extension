interface PriceParts {
  leadingPart: string;
  zeroPart: number | null;
  endingPart: string | null;
}

interface FormattedPrice {
  price: number;
  formattedPrice: PriceParts;
}

/**
 * Condenses the price to a more readable format.
 * @param price - The price to format.
 * @param zeroCondenseThreshold - The number of zeros to condense. example: 4 would condense 0.0000123 to 0.0(3)12.
 * First zero after decimal point is maintained for readability.
 * @returns The formatted price.
 */
export function formatPrice(price: number, zeroCondenseThreshold = 4): FormattedPrice {
  if (price === 0 || price === null || price === undefined) {
    return {
      price,
      formattedPrice: {
        leadingPart: '',
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  if (price >= 1) {
    return {
      price,
      formattedPrice: {
        leadingPart: price.toFixed(2),
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  // Convert to non-scientific notation string
  const priceStr = price.toFixed(20);
  const parts = priceStr.split('.');
  const decimal = parts.length > 1 ? parts[1] : '0';

  // Count total zeros after the decimal point
  let totalZeros = 0;
  let firstNonZeroIndex = 0;

  for (let i = 0; i < decimal.length; i++) {
    if (decimal[i] === '0') {
      totalZeros++;
    } else {
      firstNonZeroIndex = i;
      break;
    }
  }

  // If we don't have enough total zeros to meet threshold, format with 2 significant digits
  if (totalZeros < zeroCondenseThreshold) {
    const significantPart = decimal.slice(firstNonZeroIndex, firstNonZeroIndex + 2);
    const formattedNumber = `0.${'0'.repeat(firstNonZeroIndex)}${significantPart}`;
    return {
      price,
      formattedPrice: {
        leadingPart: formattedNumber,
        zeroPart: null,
        endingPart: null,
      },
    };
  }

  // Break up the price into parts for condensed format
  // zeroPart should be totalZeros - 1 since first zero is in leadingPart
  const significantDigits = decimal.slice(firstNonZeroIndex, firstNonZeroIndex + 2);
  return {
    price,
    formattedPrice: {
      leadingPart: '0.0',
      zeroPart: totalZeros - 1,
      endingPart: significantDigits,
    },
  };
}
