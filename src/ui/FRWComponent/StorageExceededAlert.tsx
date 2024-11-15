import React from 'react';

import warningIcon from '../FRWAssets/svg/lowStorage.svg';

import WarningSnackbar from './WarningSnackbar';

export const StorageExceededAlert = () => {
  return (
    <WarningSnackbar
      open={true}
      onClose={() => {}}
      alertIcon={warningIcon}
      message={chrome.i18n.getMessage('Insufficient_storage')}
    />
  );
};
