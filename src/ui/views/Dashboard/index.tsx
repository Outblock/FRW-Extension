import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { getApp, initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';

import { getFirbaseConfig } from 'background/utils/firebaseConfig';
import { LLTestnetIndicator } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import NFTTab from '../NFT';
import NftEvm from '../NftEvm';
import SettingTab from '../Setting';
import Staking from '../Staking';
import WalletTab from '../Wallet';

import NavBar from './NavBar';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const Dashboard = ({ value, setValue }) => {
  // const [value, setValue] = React.useState('wallet');
  const history = useHistory();
  const wallet = useWallet();

  const theme = useTheme();
  const [currentNetwork, setNetwork] = useState<string>('mainnet');
  const [domain, setDomain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isEvm, setIsEvm] = useState<boolean>(false);

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    //todo fix cadence loading
    await wallet.getCadenceScripts();
    const [network, userDomain] = await Promise.all([
      wallet.getNetwork(),
      wallet.fetchUserDomain(),
    ]);
    const isChild = await wallet.getActiveWallet();

    if (isChild === 'evm') {
      setIsEvm(true);
    }
    const env: string = process.env.NODE_ENV!;
    const firebaseConfig = getFirbaseConfig();
    console.log(process.env.NODE_ENV);
    // const firebaseProductionConfig = prodConig;

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

    setNetwork(network);
    setDomain(userDomain);
    setLoading(false);
  }, [wallet]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, wallet]);

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
        {currentNetwork === 'testnet' && value === 0 && <LLTestnetIndicator />}
        {/* <Header loading={loading} /> */}
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          style={{ height: '100%', width: '100%', backgroundColor: 'black' }}
        >
          <TabPanel value={value} index={0}>
            <WalletTab network={currentNetwork} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            {isEvm ? <NftEvm /> : <NFTTab />}
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Staking />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <SettingTab />
          </TabPanel>
        </SwipeableViews>
        <NavBar value={value} setValue={setValue} />
      </Box>
    </div>
  );
};

export default Dashboard;
