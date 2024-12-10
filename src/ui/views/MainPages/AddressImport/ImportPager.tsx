import React, { useState } from 'react';

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
  const [isImport, setImport] = useState<any>(false);
  const [isSignLoading, setSignLoading] = useState(false);
  const [addressFound, setAddressFound] = useState(true);
  const [newKey, setKeyNew] = useState(true);
  const wallet = useWallet();

  const signIn = async (accountKey) => {
    setSignLoading(true);
    if (accountKey[0].mnemonic) {
      signMnemonic(accountKey);
    } else {
      signPk(accountKey);
    }
  };

  const signMnemonic = async (accountKey) => {
    try {
      const result = await wallet.signInWithMnemonic(accountKey[0].mnemonic);
      setSignLoading(false);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      goPassword();
    } catch (error) {
      setSignLoading(false);
      if (error.message === 'NoUserFound') {
        setImport(false);
      } else {
        setKeyNew(false);
      }
    }
  };

  const signPk = async (accountKey) => {
    try {
      const result = await wallet.signInWithPrivatekey(accountKey[0].pk);
      setSignLoading(false);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      goPassword();
    } catch (error) {
      setSignLoading(false);
      if (error.message === 'NoUserFound') {
        setImport(false);
      } else {
        setKeyNew(false);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleImport = async (accountKey?: any) => {
    setAccounts(accountKey);
    const result = await wallet.openapi.checkImport(accountKey[0].pubK);
    if (result.status === 409) {
      signIn(accountKey);
    } else {
      if (!accountKey[0].address) {
        handleNotFoundPopup();
        return;
      }
      handleClick();
    }
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
      setmnemonic={setMnemonic}
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
