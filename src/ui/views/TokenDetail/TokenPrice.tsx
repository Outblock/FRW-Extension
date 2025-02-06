import React from 'react';

import { formatPrice } from '@/shared/utils/formatPrice';

interface TokenPriceProps {
  price: number | string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
  postFix?: string;
}

export const TokenPrice: React.FC<TokenPriceProps> = ({
  price,
  className = '',
  prefix = '$',
  postFix = '',
}) => {
  if (price === 0 || price === null || price === undefined || typeof price === 'string') {
    return <span className={className}>{''}</span>;
  }

  const { formattedPrice } = formatPrice(price);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className}>
      {prefix}
      <span style={leadingPart === '' ? { padding: '0 0.25rem' } : undefined}>{leadingPart}</span>
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
