import React from 'react';

export const LLEmulatorIndicator: React.FC = () => {
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
          background: '#ff4c0029',
          color: '#ff3d00',
          fontFamily: 'Inter,sans-serif',
        }}
      >
        {chrome.i18n.getMessage('Emulator')}
      </div>
    </div>
  );
};
