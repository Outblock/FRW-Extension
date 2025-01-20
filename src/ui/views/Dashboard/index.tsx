import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import React, { useEffect, useState } from 'react';

import { NetworkIndicator } from '@/ui/FRWComponent/NetworkIndicator';
import { getFirbaseConfig } from 'background/utils/firebaseConfig';
import { useWallet } from 'ui/utils';

import WalletTab from '../Wallet';

const Dashboard = ({ value, setValue }) => {
  // const [value, setValue] = React.useState('wallet');
  const wallet = useWallet();

  const [currentNetwork, setNetwork] = useState<string>('mainnet');
  const [domain, setDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isEvm, setIsEvm] = useState<boolean>(false);
  const [emulatorModeOn, setEmulatorModeOn] = useState<boolean>(false);

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  useEffect(() => {
    console.log('useEffect - fetchAll');
    let isMounted = true;

    const fetchAll = async () => {
      //todo fix cadence loading
      await wallet.getCadenceScripts();
      const [network, emulatorMode, userDomain] = await Promise.all([
        wallet.getNetwork(),
        wallet.getEmulatorMode(),
        wallet.fetchUserDomain(),
      ]);
      const isChild = await wallet.getActiveWallet();

      if (isChild === 'evm') {
        setIsEvm(true);
      }
      const env: string = process.env.NODE_ENV!;
      const firebaseConfig = getFirbaseConfig();

      const app = initializeApp(firebaseConfig, env);
      const remoteConfig = getRemoteConfig(app);
      console.log('remoteConfig ', app);
      fetchAndActivate(remoteConfig)
        .then((res) => {
          console.log('res ', remoteConfig);

          console.log('Remote Config values fetched and activated');
        })
        .catch((error) => {
          console.error('Error fetching remote config:', error);
        });

      return { network, emulatorMode, userDomain };
    };

    fetchAll().then(({ network, emulatorMode, userDomain }) => {
      if (isMounted) {
        setNetwork(network);
        setEmulatorModeOn(emulatorMode);
        setDomain(userDomain);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [wallet]);

  return (
    <div className="page">
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <NetworkIndicator network={currentNetwork} emulatorMode={emulatorModeOn} />
        <div test-id="x-overflow" style={{ overflowX: 'hidden', height: '100%' }}>
          <div style={{ display: 'block', width: '100%' }}>
            <WalletTab network={currentNetwork} />
          </div>
        </div>
      </Box>
    </div>
  );
};

export default Dashboard;
