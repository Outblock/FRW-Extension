import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  PickUsername,
  RepeatPhrase,
  AllSet,
  LandingComponents,
} from '@/ui/FRWComponent/LandingPages';
import { PageSlider, useNavigation } from '@/ui/utils/landingPage';
import { storage } from 'background/webapi';
import { useWallet } from 'ui/utils';

import GoogleBackup from './GoogleBackup';
import RecoveryPhrase from './RecoveryPhrase';
import SetPassword from './SetPassword';

const Register = () => {
  const history = useHistory();
  const wallet = useWallet();
  const { activeIndex, direction, goNext, goBack } = useNavigation(5);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mnemonic] = useState(bip39.generateMnemonic());

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

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

  const loadTempPassword = useCallback(async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  }, []);

  useEffect(() => {
    loadView();
    loadTempPassword();
  }, [loadView, loadTempPassword]);

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={activeIndex !== 4 && activeIndex !== 5}
      onBack={goBack}
      showConfetti={activeIndex === 5}
      showRegisterHeader={true}
    >
      <PageSlider activeIndex={activeIndex}>
        <PickUsername handleClick={goNext} savedUsername={username} getUsername={getUsername} />
        <RecoveryPhrase handleClick={goNext} mnemonic={mnemonic} />
        <RepeatPhrase handleClick={goNext} mnemonic={mnemonic} />
        <SetPassword
          handleClick={goNext}
          setExPassword={setPassword}
          tempPassword={password}
          mnemonic={mnemonic}
          username={username}
        />
        <GoogleBackup
          handleClick={goNext}
          mnemonic={mnemonic}
          username={username}
          password={password}
        />
        <AllSet handleClick={goNext} variant="add" />
      </PageSlider>
    </LandingComponents>
  );
};

export default Register;
