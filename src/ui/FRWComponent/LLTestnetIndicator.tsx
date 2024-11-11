import React from 'react';

export const LLTestnetIndicator: React.FC = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 282,
          height: 26,
          borderRadius: '0 0 26px 26px',
          background: '#FF8A0029',
          color: '#FF8A00',
          fontFamily:'Inter,sans-serif',
        }}
      >
        {chrome.i18n.getMessage('Testnet')}
      </div>
    </div>
  );
};

