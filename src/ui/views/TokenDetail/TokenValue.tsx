import React from 'react';

import { formatPrice } from '@/shared/utils/formatTokenValue';

interface TokenPriceProps {
  value: number | string;
  className?: string;
  showPrefix?: boolean;
  prefix?: string;
  postFix?: string;
}

export const TokenPrice: React.FC<TokenPriceProps> = ({
  value,
  className = '',
  prefix = '$',
  postFix = '',
}) => {
  if (value === 0 || value === null || value === undefined) {
    return <span className={className}>{''}</span>;
  }

  // convert value to number if it's a string
  const valueNumber = typeof value === 'string' ? parseFloat(value) : value;

  const { formattedPrice } = formatPrice(valueNumber);
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
