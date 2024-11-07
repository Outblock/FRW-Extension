/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconDropdown = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg
      viewBox="0 0 2048 1024"
      width={size + 'px'}
      height={size + 'px'}
      style={style}
      {...rest}
    >
      <path
        d="M1024 1024L137.216 0h1773.568L1024 1024z"
        fill={getIconColor(color, 0, '#E6E6E6')}
      />
    </svg>
  );
};

IconDropdown.defaultProps = {
  size: 18,
};

export default IconDropdown;
