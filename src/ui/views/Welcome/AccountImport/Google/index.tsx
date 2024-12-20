import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import RecoveryPhrase from '@/ui/FRWComponent/LandingPages/RecoveryPhrase';
import { storage } from 'background/webapi';

import DecryptWallet from './DecryptWallet';
import GoogleAccounts from './GoogleAccounts';
import GoogleRecoverPassword from './GoogleRecoverPassword';

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

interface GoogleProps {
  accounts: string[];
  onBack: () => void;
}

const Google: React.FC<GoogleProps> = ({ accounts, onBack }) => {
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.ACCOUNTS);
  const [mnemonic, setMnemonic] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loadTempPassword = useCallback(async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  }, []);

  useEffect(() => {
    loadTempPassword();
  }, [loadTempPassword]);

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
        onBack();
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
          <GoogleRecoverPassword
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
