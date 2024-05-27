import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import WalletTab from '../Wallet';
import NFTTab from '../NFT';
import NftEvm from '../NftEvm';
import Staking from '../Staking';
import SettingTab from '../Setting';
import { useLocation, useHistory } from 'react-router-dom';
import NavBar from './NavBar';
import { useWallet } from 'ui/utils';
import { LLTestnetIndicator } from 'ui/FRWComponent';
import { LLFlownsPop } from '@/ui/FRWComponent/LLFlownsPop';

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

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const Dashboard = ({ value, setValue }) => {
  // const [value, setValue] = React.useState('wallet');
  const history = useHistory();
  const wallet = useWallet();

  const theme = useTheme();
  const [currentNetwork, setNetwork] = useState<string>('mainnet');
  const [domain, setDomain] = useState<string>('');
  const [flownsPop, setFlownsPop] = useState<boolean>(false);

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const fetchAll = async () => {
    const [network, userDomain, popStat] = await Promise.all([
      wallet.getNetwork(),
      wallet.fetchUserDomain(),
      wallet.fetchPopStat()
    ]);

    setNetwork(network);
    setDomain(userDomain);

    const address = await wallet.getCurrentAddress();
    if (address) {
      setFlownsPop(popStat);
    }
  };


  useEffect(() => {
    fetchAll();
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
            {currentNetwork === 'previewnet' ?
              <NftEvm />
              :
              <NFTTab />
            }
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Staking />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <SettingTab />
          </TabPanel>
        </SwipeableViews>
        <NavBar value={value} setValue={setValue} />
        {flownsPop &&
          <LLFlownsPop
            deleteBackupPop={flownsPop}
            handleCloseIconClicked={() => setFlownsPop(false)}
            handleCancelBtnClicked={() => setFlownsPop(false)}
            handleNextBtnClicked={() => {
              setFlownsPop(false);
              history.push('/dashboard/flowns')
            }}
          />
        }
      </Box>
    </div>
  );
};

export default Dashboard;
