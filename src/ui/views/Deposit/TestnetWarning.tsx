import React from 'react';
import { Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const TestnetWarning: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 76,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'start',
        padding: '11px 26px 17px',
        borderRadius: '0 0 16px 16px',
        background: '#E5404029',
      }}
    >
      <InfoOutlinedIcon
        sx={{
          color: '#E54040',
          marginRight: '18px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 18,
          height: 18,
        }}
      />
      <Typography
        component="div"
        sx={{ fontWeight: 500, fontSize: 12, lineHeight: '16px', color: '#E54040', width: 228 }}
      >
        {chrome.i18n.getMessage('Make__sure__you__are__using__the__correct__network')}
      </Typography>
    </div>
  );
};
export default TestnetWarning;
