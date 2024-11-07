/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconWallet = ({ size, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg
      viewBox="0 0 1126 1024"
      width={size + 'px'}
      height={size + 'px'}
      style={style}
      {...rest}
    >
      <path
        d="M301.184 0C134.784 0 0 143.296 0 320v384c0 176.704 134.848 320 301.184 320h421.632c166.4 0 301.184-143.296 301.184-320V320c0-176.704-134.848-320-301.184-320H301.184zM120.448 320c0-106.048 80.896-192 180.736-192h421.632c99.84 0 180.736 85.952 180.736 192v384c0 106.048-80.896 192-180.736 192H301.184c-99.84 0-180.736-85.952-180.736-192V320zM512 448a64 64 0 0 0 0 128h192a64 64 0 1 0 0-128H512z"
        fill={getIconColor(color, 0, '#41CC5D')}
      />
    </svg>
  );
};

IconWallet.defaultProps = {
  size: 18,
};

export default IconWallet;
