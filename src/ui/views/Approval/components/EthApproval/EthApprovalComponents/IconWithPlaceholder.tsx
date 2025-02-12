import { CardMedia } from '@mui/material';
import React from 'react';

import flowgrey from 'ui/FRWAssets/svg/flow-grey.svg';

interface IconWithPlaceholderProps {
  imageUrl: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  backgroundColor?: string;
}

const IconWithPlaceholder: React.FC<IconWithPlaceholderProps> = ({
  imageUrl,
  width = '60px',
  height = '60px',
  borderRadius = '12px',
  backgroundColor = 'text.secondary',
}) => {
  return (
    <CardMedia
      component="img"
      sx={{
        width,
        height,
        borderRadius,
        backgroundColor,
      }}
      image={imageUrl}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = flowgrey;
      }}
    />
  );
};

export default IconWithPlaceholder;
