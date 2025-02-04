interface PriceParts {
  leadingPart: string;
  zeroPart: number | null;
  endingPart: string | null;
}

interface FormattedPrice {
  price: number;
  formattedPrice: PriceParts;
}

export function formatPrice(price: number, zeroCondenseThreshold = 4): FormattedPrice {
  if (price === 0) {
    return {
      price,
      formattedPrice: {
        leadingPart: '0.00',
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
  const [whole, decimal] = priceStr.split('.');

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
