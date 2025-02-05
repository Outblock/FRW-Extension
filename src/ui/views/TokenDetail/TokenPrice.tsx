import React from 'react';

import { formatPrice } from '@/shared/utils/formatPrice';

interface TokenPriceProps {
  price: number | string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
}

export const TokenPrice: React.FC<TokenPriceProps> = ({
  price,
  className = '',
  showPrefix = true,
  prefix = '$',
}) => {
  if (price === null || price === undefined || typeof price === 'string') {
    return <span className={className}>{price}</span>;
  }

  const { formattedPrice } = formatPrice(price);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className}>
      {showPrefix && prefix}
      <span style={leadingPart === '-' ? { padding: '0 0.25rem' } : undefined}>{leadingPart}</span>
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
    </span>
  );
};
