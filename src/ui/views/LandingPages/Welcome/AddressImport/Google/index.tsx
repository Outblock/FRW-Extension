import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import { storage } from 'background/webapi';

import DecryptWallet from './DecryptWallet';
import GoogleAccounts from './GoogleAccounts';
import RecoveryPassword from './RecoverPassword';
import RecoveryPhrase from './RecoveryPhrase';

const STEPS = {
  ACCOUNTS: 'accounts',
  DECRYPT: 'decrypt',
  RECOVERY: 'recovery',
  PASSWORD: 'password',
  ALL_SET: 'all_set',
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

interface AccountsState {
  accounts: string[];
}

const Google = () => {
  const location = useLocation<AccountsState>();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.ACCOUNTS);
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

  const goBack = () => {
    switch (activeTab) {
      case STEPS.DECRYPT:
        setActiveTab(STEPS.ACCOUNTS);
        break;
      case STEPS.RECOVERY:
        setActiveTab(STEPS.DECRYPT);
        break;
      case STEPS.PASSWORD:
        setActiveTab(STEPS.RECOVERY);
        break;
      case STEPS.ALL_SET:
        setActiveTab(STEPS.PASSWORD);
        break;
      default:
        history.goBack();
    }
  };

  return (
    <LandingComponents
      activeIndex={Object.values(STEPS).indexOf(activeTab)}
      direction="right"
      showBackButton={activeTab !== STEPS.ALL_SET}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.ACCOUNTS && (
          <GoogleAccounts
            handleSwitchTab={() => setActiveTab(STEPS.DECRYPT)}
            accounts={accounts}
            setUsername={setUsername}
          />
        )}

        {activeTab === STEPS.DECRYPT && (
          <DecryptWallet
            handleSwitchTab={() => setActiveTab(STEPS.RECOVERY)}
            setMnemonic={setMnemonic}
            username={username}
          />
        )}

        {activeTab === STEPS.RECOVERY && (
          <RecoveryPhrase
            handleSwitchTab={() => setActiveTab(STEPS.PASSWORD)}
            mnemonic={mnemonic}
          />
        )}

        {activeTab === STEPS.PASSWORD && (
          <RecoveryPassword
            handleSwitchTab={() => setActiveTab(STEPS.ALL_SET)}
            mnemonic={mnemonic}
            username={username}
            lastPassword={password}
          />
        )}

        {activeTab === STEPS.ALL_SET && <AllSet handleSwitchTab={() => window.close()} />}
      </Box>
    </LandingComponents>
  );
};

export default Google;
