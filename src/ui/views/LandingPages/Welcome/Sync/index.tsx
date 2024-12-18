import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import LandingComponents from '@/ui/FRWComponent/LandingPages/LandingComponents';
import SetPassword from '@/ui/FRWComponent/LandingPages/SetPassword';
import { useWallet, saveIndex } from 'ui/utils';

import SyncQr from './SyncQr';

const STEPS = {
  QR: 'qr',
  PASSWORD: 'password',
  ALL_SET: 'all_set',
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

const Sync = () => {
  const history = useHistory();
  const usewallet = useWallet();
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.QR);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [accountKey, setAccountKey] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const loadView = useCallback(async () => {
    usewallet
      .getCurrentAccount()
      .then((res) => {
        if (res) {
          history.push('/');
        }
      })
      .catch(() => {
        return;
      });
  }, [usewallet, history]);

  useEffect(() => {
    loadView();
  }, [loadView]);

  const submitPassword = useCallback(
    async (password: string) => {
      await usewallet.signInV3(mnemonic, accountKey, deviceInfo);
      const userInfo = await usewallet.getUserInfo(true);
      setUsername(userInfo.username);
      await saveIndex(userInfo.username);
      await usewallet.boot(password);
      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      await usewallet.createKeyringWithMnemonics(formatted);
      setActiveTab(STEPS.ALL_SET);
    },
    [usewallet, mnemonic, accountKey, deviceInfo, setUsername]
  );

  const goBack = () => {
    switch (activeTab) {
      case STEPS.PASSWORD:
        setActiveTab(STEPS.QR);
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
      activeIndex={0}
      direction="right"
      showBackButton={activeTab !== STEPS.ALL_SET}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.QR && (
          <SyncQr
            handleSwitchTab={() => setActiveTab(STEPS.PASSWORD)}
            savedUsername={username}
            confirmMnemonic={setMnemonic}
            setUsername={getUsername}
            setAccountKey={setAccountKey}
            setDeviceInfo={setDeviceInfo}
          />
        )}

        {activeTab === STEPS.PASSWORD && (
          <SetPassword
            handleSwitchTab={() => setActiveTab(STEPS.ALL_SET)}
            onSubmit={submitPassword}
            username={username}
            title={
              <>
                {chrome.i18n.getMessage('Welcome__Back')}
                <Box display="inline" color="primary.main">
                  {username}
                </Box>
              </>
            }
            isLogin={true}
            autoFocus={true}
          />
        )}

        {activeTab === STEPS.ALL_SET && (
          <AllSet handleSwitchTab={() => window.close()} variant="sync" />
        )}
      </Box>
    </LandingComponents>
  );
};

export default Sync;
