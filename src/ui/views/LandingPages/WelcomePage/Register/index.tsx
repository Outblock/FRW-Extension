import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  PickUsername,
  RepeatPhrase,
  AllSet,
  LandingComponents,
} from '@/ui/FRWComponent/LandingPages';
import { type PageConfig, renderPage, useNavigation } from '@/ui/utils/landingPage';
import { useWallet } from 'ui/utils';

import GoogleBackup from './GoogleBackup';
import RecoveryPhrase from './RecoveryPhrase';
import SetPassword from './SetPassword';

const Register = () => {
  const wallet = useWallet();
  const { activeIndex, direction, goNext, goBack } = useNavigation(5);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState<string | null>(null);
  const [mnemonic] = useState(bip39.generateMnemonic());
  const history = useHistory();

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

  const pages: Record<number, PageConfig> = {
    0: {
      component: PickUsername,
      props: { handleClick: goNext, savedUsername: username, getUsername },
    },
    1: {
      component: RecoveryPhrase,
      props: { handleClick: goNext, mnemonic },
    },
    2: {
      component: RepeatPhrase,
      props: { handleClick: goNext, mnemonic },
    },
    3: {
      component: SetPassword,
      props: { handleClick: goNext, setExPassword: setPassword, mnemonic, username },
    },
    4: {
      component: GoogleBackup,
      props: { handleClick: goNext, mnemonic, username, password },
    },
    5: {
      component: AllSet,
      props: { handleClick: goNext, variant: 'register' },
    },
  };

  useEffect(() => {
    loadView();
  }, [loadView]);

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={activeIndex !== 4 && activeIndex !== 5}
      onBack={goBack}
      showConfetti={activeIndex === 5}
      showRegisterHeader={true}
    >
      {renderPage(pages, activeIndex)}
    </LandingComponents>
  );
};

export default Register;
