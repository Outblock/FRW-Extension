import React from 'react';

import { formatPrice } from '@/shared/utils/formatPrice';

interface TokenPriceProps {
  price: number;
  className?: string;
  showPrefix?: boolean;
}

export const TokenPrice: React.FC<TokenPriceProps> = ({
  price,
  className = '',
  showPrefix = true,
}) => {
  const { formattedPrice } = formatPrice(price);
  const { leadingPart, zeroPart, endingPart } = formattedPrice;

  return (
    <span className={className}>
      {showPrefix && '$'}
      {leadingPart}
      {zeroPart !== null && <sub style={{ fontSize: '0.7em' }}>{zeroPart}</sub>}
      {endingPart !== null && endingPart}
    </span>
  );
};
