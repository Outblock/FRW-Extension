/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconNfts = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg
      viewBox="0 0 1072 1024"
      width={size + 'px'}
      height={size + 'px'}
      style={style}
      {...rest}
    >
      <path
        d="M33.645714 246.00381l455.289905 185.002666v549.302857L33.645714 795.257905V246.00381zM959.488 180.126476L532.967619 354.011429 106.496 180.126476 533.016381 6.826667l426.471619 173.299809zM1032.289524 246.00381v549.254095l-455.241143 185.051428V431.006476l455.289905-185.002666z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </svg>
  );
};

IconNfts.defaultProps = {
  size: 18,
};

export default IconNfts;
