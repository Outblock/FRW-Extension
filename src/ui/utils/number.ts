import BigNumber from 'bignumber.js';

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
