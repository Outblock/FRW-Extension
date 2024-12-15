import { Snackbar, Alert, Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { AllSet, PickUsername, LandingComponents } from '@/ui/FRWComponent/LandingPages';
import { PageSlider, useNavigation } from '@/ui/utils/landingPage';
import { storage } from 'background/webapi';
import { LLPinAlert } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import GoogleBackup from './GoogleBackup';
import ImportPager from './ImportPager';
import RecoverPassword from './RecoverPassword';
import SetPassword from './SetPassword';

const AddressImport = () => {
  const history = useHistory();
  const wallet = useWallet();

  const navigation = useNavigation(5);

  const [mnemonic, setMnemonic] = useState('');
  const [pk, setPk] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accounts, setAccounts] = useState<any>([]);
  const [errMessage, setErrorMessage] = useState(chrome.i18n.getMessage('No__backup__found'));
  const [showError, setShowError] = useState(false);

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const loadTempPassword = useCallback(async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  }, []);

  useEffect(() => {
    loadTempPassword();
  }, []);

  const loadView = useCallback(async () => {
    wallet
      .getCurrentAccount()
      .then((res) => {
        if (res) {
          history.push('/');
        }
      })
      .catch(() => {
        return;
      });
  }, [wallet, history]);

  useEffect(() => {
    loadView();
  }, [loadView]);

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  return (
    <LandingComponents
      activeIndex={navigation.activeIndex}
      direction={navigation.direction}
      showBackButton={navigation.activeIndex !== 5}
      onBack={navigation.goBack}
      showConfetti={navigation.activeIndex === 5}
      showRegisterHeader={true}
    >
      <PageSlider activeIndex={navigation.activeIndex}>
        <ImportPager
          setMnemonic={setMnemonic}
          setPk={setPk}
          setAccounts={setAccounts}
          accounts={accounts}
          mnemonic={mnemonic}
          pk={pk}
          setUsername={setUsername}
          goPassword={() => navigation.goCustom(3)}
          handleClick={navigation.goNext}
          setErrorMessage={setErrorMessage}
          setShowError={setShowError}
        />
        <PickUsername
          handleClick={navigation.goNext}
          savedUsername={username}
          getUsername={getUsername}
        />
        <SetPassword
          handleClick={() => navigation.goCustom(4)}
          tempPassword={password}
          mnemonic={mnemonic}
          pk={pk}
          username={username}
          accounts={accounts}
          goEnd={() => navigation.goCustom(5)}
        />
        <RecoverPassword
          handleClick={navigation.goNext}
          mnemonic={mnemonic}
          pk={pk}
          tempPassword={password}
          goEnd={() => navigation.goCustom(5)}
          accountKey={accounts}
        />
        <GoogleBackup
          handleClick={navigation.goNext}
          mnemonic={mnemonic}
          username={username}
          password={password}
        />
        <AllSet handleClick={navigation.goNext} />
      </PageSlider>
    </LandingComponents>
  );
};

export default AddressImport;
