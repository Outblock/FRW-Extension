/* eslint-disable */

import React from 'react';
import { getIconColor } from './helper';

const DEFAULT_STYLE = {
  display: 'block',
};

const IconAHamburgermenu = ({ size = 18, color, style: _style, ...rest }) => {
  const style = _style ? { ...DEFAULT_STYLE, ..._style } : DEFAULT_STYLE;

  return (
    <svg viewBox="0 0 1462 1024" width={size + 'px'} height={size + 'px'} style={style} {...rest}>
      <path
        d="M0 73.142857a73.142857 73.142857 0 0 1 73.142857-73.142857h1316.571429a73.142857 73.142857 0 1 1 0 146.285714H73.142857a73.142857 73.142857 0 0 1-73.142857-73.142857zM0 512a73.142857 73.142857 0 0 1 73.142857-73.142857h1316.571429a73.142857 73.142857 0 1 1 0 146.285714H73.142857a73.142857 73.142857 0 0 1-73.142857-73.142857zM0 950.857143a73.142857 73.142857 0 0 1 73.142857-73.142857h1316.571429a73.142857 73.142857 0 1 1 0 146.285714H73.142857a73.142857 73.142857 0 0 1-73.142857-73.142857z"
        fill={getIconColor(color, 0, '#787878')}
      />
    </svg>
  );
};

export default IconAHamburgermenu;
