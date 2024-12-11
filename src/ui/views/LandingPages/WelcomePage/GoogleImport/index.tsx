import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AllSet, LandingComponents } from '@/ui/FRWComponent/LandingPages';
import { type PageConfig, renderPage, useNavigation } from '@/ui/utils/landingPage';

import DecryptWallet from './DecryptWallet';
import GoogleAccounts from './GoogleAccounts';
import RecoveryPassword from './RecoverPassword';
import RecoveryPhrase from './RecoveryPhrase';

interface AccountsState {
  accounts: string[];
}

const GoogleImport = () => {
  const location = useLocation<AccountsState>();
  const history = useHistory();
  const { activeIndex, direction, goNext, goBack } = useNavigation(4);
  const [mnemonic, setMnemonic] = useState('');
  const [accounts, setAccounts] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const getGoogleAccounts = useCallback(async () => {
    const users = location?.state?.accounts;
    setAccounts(users);
  }, [location?.state?.accounts]);

  useEffect(() => {
    getGoogleAccounts();
  }, [getGoogleAccounts]);

  const pages: Record<number, PageConfig> = {
    0: {
      component: GoogleAccounts,
      props: { handleClick: goNext, accounts, setUsername },
    },
    1: {
      component: DecryptWallet,
      props: { handleClick: goNext, setMnemonic, username, setNextPassword: setPassword },
    },
    2: {
      component: RecoveryPhrase,
      props: { handleClick: goNext, mnemonic },
    },
    3: {
      component: RecoveryPassword,
      props: { handleClick: goNext, mnemonic, username, lastPassword: password },
    },
    4: {
      component: AllSet,
      props: { handleClick: goNext },
    },
  };

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

export default GoogleImport;
