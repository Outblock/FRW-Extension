import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { AllSet, LandingComponents } from '@/ui/FRWComponent/LandingPages';
import { PageSlider, useNavigation } from '@/ui/utils/landingPage';
import { useWallet } from 'ui/utils';

import SetPassword from './SetPassword';
import SyncQr from './SyncQr';

const Sync = () => {
  const history = useHistory();
  const wallet = useWallet();

  const { activeIndex, direction, goNext, goBack } = useNavigation(2);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [accountKey, setAccountKey] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

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

  return (
    <LandingComponents
      activeIndex={activeIndex}
      direction={direction}
      showBackButton={activeIndex !== 2}
      onBack={goBack}
      showConfetti={activeIndex === 2}
      showRegisterHeader={true}
    >
      <PageSlider activeIndex={activeIndex}>
        <SyncQr
          handleClick={goNext}
          savedUsername={username}
          confirmMnemonic={setMnemonic}
          setUsername={getUsername}
          setAccountKey={setAccountKey}
          setDeviceInfo={setDeviceInfo}
        />
        <SetPassword
          handleClick={goNext}
          mnemonic={mnemonic}
          username={username}
          setUsername={getUsername}
          accountKey={accountKey}
          deviceInfo={deviceInfo}
        />
        <AllSet handleClick={goNext} variant="sync" />
      </PageSlider>
    </LandingComponents>
  );
};

export default Sync;
