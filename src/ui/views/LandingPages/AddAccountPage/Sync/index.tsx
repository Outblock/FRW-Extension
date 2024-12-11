import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { AllSet, LandingComponents } from '@/ui/FRWComponent/LandingPages';
import { type PageConfig, renderPage, useNavigation } from '@/ui/utils/landingPage';
import { useWallet } from 'ui/utils';

import SetPassword from './SetPassword';
import SyncQr from './SyncQr';

const Sync = () => {
  const history = useHistory();
  const wallet = useWallet();
  const { activeIndex, direction, goNext, goBack } = useNavigation(2);
  const [mnemonic, setMnemonic] = useState('');
  const [username, setUsername] = useState('');

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

  useEffect(() => {
    loadView();
  }, [loadView]);

  const pages: Record<number, PageConfig> = {
    0: {
      component: SyncQr,
      props: {
        handleClick: goNext,
        savedUsername: username,
        confirmMnemonic: setMnemonic,
        setUsername: getUsername,
      },
    },
    1: {
      component: SetPassword,
      props: { handleClick: goNext, mnemonic, username },
    },
    2: {
      component: AllSet,
      props: { handleClick: goNext, variant: 'sync' },
    },
  };

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={activeIndex !== 2}
      onBack={goBack}
      showConfetti={activeIndex === 2}
      showRegisterHeader={true}
    >
      {renderPage(pages, activeIndex)}
    </LandingComponents>
  );
};

export default Sync;
