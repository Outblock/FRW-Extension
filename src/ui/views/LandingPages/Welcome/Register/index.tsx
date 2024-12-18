import { Box } from '@mui/material';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getAccountKey } from '@/shared/utils/address';
import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import PickUsername from '@/ui/FRWComponent/LandingPages/PickUsername';
import RepeatPhrase from '@/ui/FRWComponent/LandingPages/RepeatPhrase';
import SetPassword from '@/ui/FRWComponent/LandingPages/SetPassword';
import { storage } from 'background/webapi';
import { saveIndex, useWallet } from 'ui/utils';

import GoogleBackup from './GoogleBackup';
import RecoveryPhrase from './RecoveryPhrase';

const STEPS = {
  USERNAME: 'username',
  RECOVERY: 'recovery',
  REPEAT: 'repeat',
  PASSWORD: 'password',
  BACKUP: 'backup',
  ALL_SET: 'all_set',
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

const Register = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.USERNAME);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mnemonic] = useState(bip39.generateMnemonic());
  const [tempPassword, setTempPassword] = useState('');

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
      setTempPassword(temp);
    }
  }, []);

  const submitPassword = useCallback(
    async (newPassword: string) => {
      setPassword(newPassword);
      await saveIndex(username);
      const accountKey = getAccountKey(mnemonic);
      await wallet.openapi.register(accountKey, username);
      await wallet.boot(newPassword);
      storage.remove('premnemonic');
      await wallet.createKeyringWithMnemonics(mnemonic);
      await wallet.openapi.createFlowAddress();
      setActiveTab(STEPS.BACKUP);
    },
    [username, mnemonic, wallet]
  );

  const goBack = () => {
    switch (activeTab) {
      case STEPS.RECOVERY:
        setActiveTab(STEPS.USERNAME);
        break;
      case STEPS.REPEAT:
        setActiveTab(STEPS.RECOVERY);
        break;
      case STEPS.PASSWORD:
        setActiveTab(STEPS.REPEAT);
        break;
      case STEPS.BACKUP:
        setActiveTab(STEPS.PASSWORD);
        break;
      default:
        history.goBack();
    }
  };

  useEffect(() => {
    loadView();
    loadTempPassword();
  }, [loadView, loadTempPassword]);

  return (
    <LandingComponents
      activeIndex={Object.values(STEPS).indexOf(activeTab)}
      direction="right"
      showBackButton={activeTab !== STEPS.BACKUP && activeTab !== STEPS.ALL_SET}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.USERNAME && (
          <PickUsername
            handleClick={() => setActiveTab(STEPS.RECOVERY)}
            savedUsername={username}
            getUsername={getUsername}
          />
        )}

        {activeTab === STEPS.RECOVERY && (
          <RecoveryPhrase handleClick={() => setActiveTab(STEPS.REPEAT)} mnemonic={mnemonic} />
        )}

        {activeTab === STEPS.REPEAT && (
          <RepeatPhrase handleClick={() => setActiveTab(STEPS.PASSWORD)} mnemonic={mnemonic} />
        )}

        {activeTab === STEPS.PASSWORD && (
          <SetPassword
            handleClick={() => setActiveTab(STEPS.BACKUP)}
            onSubmit={submitPassword}
            username={username}
            tempPassword={tempPassword}
            showTerms={true}
            autoFocus={true}
          />
        )}

        {activeTab === STEPS.BACKUP && (
          <GoogleBackup
            handleClick={() => setActiveTab(STEPS.ALL_SET)}
            mnemonic={mnemonic}
            username={username}
            password={password}
          />
        )}

        {activeTab === STEPS.ALL_SET && <AllSet handleClick={() => window.close()} variant="add" />}
      </Box>
    </LandingComponents>
  );
};

export default Register;
