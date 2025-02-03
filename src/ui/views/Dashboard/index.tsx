import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import React, { useEffect, useState } from 'react';

import { NetworkIndicator } from '@/ui/FRWComponent/NetworkIndicator';
import { useNetworkStore } from '@/ui/stores/useNetworkStore';
import { getFirbaseConfig } from 'background/utils/firebaseConfig';
import { useWallet } from 'ui/utils';

import WalletTab from '../Wallet';

const Dashboard = ({ value, setValue }) => {
  // const [value, setValue] = React.useState('wallet');
  const usewallet = useWallet();
  const { currentNetwork, emulatorModeOn, setEmulatorModeOn, setNetwork } = useNetworkStore();

  useEffect(() => {
    console.log('useEffect - fetchAll');
    let isMounted = true;

    const fetchAll = async () => {
      //todo fix cadence loading
      await usewallet.getCadenceScripts();
      const [network, emulatorMode] = await Promise.all([
        usewallet.getNetwork(),
        usewallet.getEmulatorMode(),
      ]);

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

      return { network, emulatorMode };
    };

    fetchAll().then(({ network, emulatorMode }) => {
      if (isMounted) {
        setNetwork(network);
        setEmulatorModeOn(emulatorMode);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [usewallet, setEmulatorModeOn, setNetwork]);

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
