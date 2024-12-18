import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import { useNavigation, PageSlider } from '@/ui/utils/landingPage';
import { storage } from 'background/webapi';

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

  const loadTempPassword = useCallback(async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  }, []);

  const getGoogleAccounts = useCallback(async () => {
    const users = location?.state?.accounts;
    setAccounts(users);
  }, [location?.state?.accounts]);

  useEffect(() => {
    getGoogleAccounts();
    loadTempPassword();
  }, [getGoogleAccounts, loadTempPassword]);

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={true}
      onBack={goBack}
      showConfetti={activeIndex === 4}
      showRegisterHeader={true}
    >
      <PageSlider activeIndex={activeIndex}>
        <GoogleAccounts handleClick={goNext} accounts={accounts} setUsername={setUsername} />
        <DecryptWallet handleClick={goNext} setMnemonic={setMnemonic} username={username} />
        <RecoveryPhrase handleClick={goNext} mnemonic={mnemonic} />
        <RecoveryPassword
          handleClick={goNext}
          mnemonic={mnemonic}
          username={username}
          lastPassword={password}
        />
        <AllSet handleClick={goNext} />
      </PageSlider>
    </LandingComponents>
  );
};

export default GoogleImport;
