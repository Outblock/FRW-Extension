import * as bip39 from 'bip39';
import React, { useState } from 'react';

import { storage } from '@/background/webapi';
import BaseImportPager from '@/ui/FRWComponent/MainPages/ImportComponents/ImportPager';
import { useWallet } from '@/ui/utils';

const ImportPager = ({
  setMnemonic,
  setPk,
  setAccounts,
  accounts,
  mnemonic,
  pk,
  setUsername,
  goPassword,
  handleClick,
  setErrorMessage,
  setShowError,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mnemonicValid, setMnemonicValid] = useState(true);
  const [isSignLoading, setSignLoading] = useState(false);
  const [addressFound, setAddressFound] = useState(true);
  const [newKey, setKeyNew] = useState(true);
  const wallet = useWallet();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleImport = async (accountKey?: any) => {
    setAccounts(accountKey);
    const result = await wallet.openapi.checkImport(accountKey[0].pubK);
    if (result.status === 409) {
      goPassword();
    } else {
      if (!accountKey[0].address) {
        handleNotFoundPopup();
        return;
      }
      handleClick();
    }
  };

  const setmnemonic = (mnemonic) => {
    setMnemonic(mnemonic);
    const formatted = mnemonic.trim().split(/\s+/g).join(' ');
    setMnemonicValid(true);
    storage.set('premnemonic', formatted);
  };

  const handleNotFoundPopup = async () => {
    setAddressFound(!addressFound);
  };

  return (
    <BaseImportPager
      selectedTab={selectedTab}
      handleTabChange={handleTabChange}
      handleNotFoundPopup={handleNotFoundPopup}
      handleImport={handleImport}
      setmnemonic={setmnemonic}
      setPk={setPk}
      setErrorMessage={setErrorMessage}
      setShowError={setShowError}
      isSignLoading={isSignLoading}
      addressFound={addressFound}
      setAddressFound={setAddressFound}
      newKey={newKey}
      setKeyNew={setKeyNew}
    />
  );
};

export default ImportPager;
