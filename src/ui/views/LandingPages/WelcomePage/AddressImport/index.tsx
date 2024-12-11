import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { AllSet, PickUsername, LandingComponents } from '@/ui/FRWComponent/LandingPages';
import { type PageConfig, renderPage, useNavigation } from '@/ui/utils/landingPage';
import { useWallet } from 'ui/utils';

import ImportPager from './ImportPager';
import RecoverPassword from './RecoverPassword';
import SetPassword from './SetPassword';

const AddressImport = () => {
  const history = useHistory();
  const wallet = useWallet();
  const { activeIndex, direction, goNext, goBack, goCustom } = useNavigation(4);
  const [mnemonic, setMnemonic] = useState('');
  const [pk, setPk] = useState(null);
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState(chrome.i18n.getMessage('No__backup__found'));
  const [showError, setShowError] = useState(false);
  const [accounts, setAccounts] = useState<any>([]);

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
      component: ImportPager,
      props: {
        setMnemonic,
        setPk,
        setAccounts,
        accounts,
        mnemonic,
        pk,
        setUsername,
        goPassword: () => goCustom(3),
        handleClick: goNext,
        setErrorMessage,
        setShowError,
      },
    },
    1: {
      component: PickUsername,
      props: { handleClick: goNext, savedUsername: username, getUsername },
    },
    2: {
      component: SetPassword,
      props: {
        handleClick: goNext,
        mnemonic,
        pk,
        username,
        accounts,
        goEnd: () => goNext(),
      },
    },
    3: {
      component: RecoverPassword,
      props: {
        handleClick: goNext,
        mnemonic,
        pk,
        username,
        goEnd: () => goNext(),
      },
    },
    4: {
      component: AllSet,
      props: { handleClick: goNext },
    },
  };

  useEffect(() => {
    loadView();
  }, [loadView]);

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={true}
      onBack={goBack}
      showConfetti={activeIndex === 4}
      showRegisterHeader={true}
    >
      {renderPage(pages, activeIndex)}
    </LandingComponents>
  );
};

export default AddressImport;
