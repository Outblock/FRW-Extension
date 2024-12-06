import { useEffect, useState, useContext } from 'react';
import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import SeedPhraseImport from './importComponent/SeedPhrase';
import KeyImport from './importComponent/KeyImport';
import JsonImport from './importComponent/JsonImport';
import Googledrive from './importComponent/Googledrive';
import ImportAddressModel from '../../FRWComponent/PopupModal/importAddressModal';

import ErrorModel from '../../FRWComponent/PopupModal/errorModel';
import { useWallet } from 'ui/utils';
import { storage } from '@/background/webapi';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

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

  const [mnemonicValid, setMnemonicValid] = useState(true);
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
      console.log('result ->', result);
      setSignLoading(false);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      goPassword();
    } catch (error) {
      console.log(error);
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
      console.log('result ->', result);
      setSignLoading(false);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      goPassword();
    } catch (error) {
      console.log(error);
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
    console.log('result ', result);
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
  const setmnemonic = (mnemonic) => {
    setMnemonic(mnemonic);
    const formatted = mnemonic.trim().split(/\s+/g).join(' ');
    setMnemonicValid(true);
    storage.set('premnemonic', formatted);
  };

  const handleShowModel = (show) => {
    setImport(show);
  };

  const handleAddressSelection = async (address) => {
    const account = accounts.filter((account) => account.address === address)[0];
    const result = await wallet.openapi.checkImport(account.pubK);
    if (result.status === 409) {
      signIn([account]);
    } else {
      setAccounts([account]);
      handleClick();
    }
  };

  const handleNotFoundPopup = async () => {
    setAddressFound(!addressFound);
  };

  const sxStyles = {
    fontFamily: 'Inter',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '24px',
    letterSpacing: '-0.252px',
    textTransform: 'capitalize',
  };

  return (
    <Box sx={{ padding: '0 16px 16px' }}>
      <Box sx={{ padding: '20px 24px' }}>
        <Typography variant="h4">{chrome.i18n.getMessage('import_account')}</Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Support_Flow_Wallet_Blocto')}
        </Typography>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="simple tabs example"
        sx={{ padding: '0 24px' }}
      >
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Google__Drive')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Keystore')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Seed_Phrase')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Private_Key')} />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <Googledrive setErrorMessage={setErrorMessage} setShowError={setShowError} />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <JsonImport
          onOpen={handleNotFoundPopup}
          onImport={handleImport}
          setPk={setPk}
          isSignLoading={isSignLoading}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <SeedPhraseImport
          onOpen={handleNotFoundPopup}
          onImport={handleImport}
          setmnemonic={setmnemonic}
          isSignLoading={isSignLoading}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={3}>
        <KeyImport
          onOpen={handleNotFoundPopup}
          onImport={handleImport}
          setPk={setPk}
          isSignLoading={isSignLoading}
        />
      </TabPanel>
      {!addressFound && (
        <ErrorModel
          isOpen={setAddressFound}
          onOpenChange={setAddressFound}
          errorName={chrome.i18n.getMessage('No_Account_found')}
          errorMessage={chrome.i18n.getMessage('We_cant_find')}
        />
      )}
      {!newKey && (
        <ErrorModel
          isOpen={setKeyNew}
          onOpenChange={setKeyNew}
          errorName={chrome.i18n.getMessage('Publickey_already_exist')}
          errorMessage={chrome.i18n.getMessage('Please_import_or_register_a_new_key')}
          isGoback={true}
        />
      )}
    </Box>
  );
};

export default ImportPager;
