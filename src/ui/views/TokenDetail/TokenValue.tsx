import React from 'react';

import { formatPrice } from '@/shared/utils/formatTokenValue';

interface TokenPriceProps {
  value: number | string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
  postFix?: string;
}

export const TokenValue: React.FC<TokenPriceProps> = ({
  value,
  className = '',
  prefix = '',
  postFix = '',
}) => {
  if (value === 0 || value === null || value === undefined) {
    return <span className={className}>{''}</span>;
  }

  const numberWithCommas = (x: string) => {
    // Check if the number is between 1000 and 999999
    const num = parseFloat(x);
    if (num >= 1000 && num <= 999999) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return x;
  };

  // convert value to number if it's a string
  const valueNumber = typeof value === 'string' ? parseFloat(value) : value;

  const { formattedPrice } = formatPrice(valueNumber);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className}>
      {prefix}
      <span style={leadingPart === '' ? { padding: '0 0.25rem' } : undefined}>
        {numberWithCommas(leadingPart)}
      </span>
      {zeroPart !== null && (
        <sub
          style={{
            fontSize: '0.7em',
            verticalAlign: '-0.25em',
          }}
        >
          {zeroPart}
        </sub>
      )}
      {endingPart !== null && endingPart}
      {postFix && <span style={{ marginLeft: '0.25rem' }}>{postFix}</span>}
    </span>
  );
};
