import React from 'react';

import warningIcon from '../FRWAssets/svg/lowStorage.svg';

import WarningSnackbar from './WarningSnackbar';
interface WarningStorageLowSnackbarProps {
  isLowStorage?: boolean;
  isLowStorageAfterAction?: boolean;
}

export const WarningStorageLowSnackbar = ({
  isLowStorage,
  isLowStorageAfterAction,
}: WarningStorageLowSnackbarProps = {}) => {
  const message = isLowStorage
    ? chrome.i18n.getMessage('Insufficient_storage')
    : isLowStorageAfterAction
      ? chrome.i18n.getMessage('Insufficient_storage_after_action')
      : undefined;

  if (!message) {
    return null;
  }
  return (
    <WarningSnackbar
      open={true}
      onClose={() => {}}
      alertIcon={warningIcon}
      message={chrome.i18n.getMessage('Insufficient_storage')}
    />
  );
};
