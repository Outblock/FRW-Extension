import React, { useEffect, useState } from 'react';
import { useWallet } from 'ui/utils';
import { Box } from '@mui/system';
import { Typography, Button, Tab, Tabs, Skeleton, Drawer } from '@mui/material';
import theme from '../../style/LLTheme';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SwipeableViews from 'react-swipeable-views';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import CoinList from './Coinlist';
import { withPrefix } from '../../utils/address';
import { useHistory } from 'react-router-dom';
import TransferList from './TransferList';
import { useLocation } from 'react-router-dom';
import eventBus from '@/eventBus';
import LLComingSoon from '@/ui/FRWComponent/LLComingSoonWarning';
import ReactTextTransition from 'react-text-transition';
import OnRampList from './OnRampList';
// import fetchRemoteConfig from 'background/utils/remoteConfig';

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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const WalletTab = ({ network }) => {
  const wallet = useWallet();
  const history = useHistory();
  const location = useLocation();
  const [value, setValue] = React.useState(0);
  const [coinLoading, setCoinLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [coinData, setCoinData] = useState<any>([]);
  const [accessible, setAccessible] = useState<any>([]);
  const [balance, setBalance] = useState<string>('$0.00');
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [txCount, setTxCount] = useState('');
  const [isOnRamp, setOnRamp] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [swapConfig, setSwapConfig] = useState(false);
  const [incLink, _] = useState(network === 'mainnet' ? 'https://app.increment.fi/swap' : 'https://demo.increment.fi/swap');

  const expiry_time = 60000;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const setUserAddress = async () => {
    const data = await wallet.getCurrentAddress();
    if (data) {
      setAddress(withPrefix(data) || '');
    } else {
      wallet.openapi.getManualAddress();
    }
    return data;
  };

  //todo: move to util
  const pollingFunction = (func, time = 1000, endTime, immediate = false) => {
    immediate && func();
    const startTime = new Date().getTime();
    const pollTimer = setInterval(async () => {
      const nowTime = new Date().getTime();
      const data = await func();
      if (data.length > 2 || nowTime - startTime >= endTime) {
        pollTimer && clearInterval(pollTimer);
        eventBus.emit('addressDone');
      }
    }, time);
    return pollTimer;
  };

  const sortWallet = (data) => {
    const sorted = data.sort((a, b) => {
      if (b.total === a.total) {
        return b.balance - a.balance;
      } else {
        return b.total - a.total;
      }
    });
    handleStorageData(sorted);
  };

  const fetchWallet = async () => {
    // const remote = await fetchRemoteConfig.remoteConfig();
    // console.log('remote ', remote)
    const isChild = await wallet.getActiveWallet();
    if (isChild) {
      setIsActive(false);
      const ftResult = await wallet.checkAccessibleFt(address);
      if (ftResult) {
        setAccessible(ftResult);
        console.log('ftResult ', ftResult);
      }
    } else {
      setIsActive(true);
    }
    const storageData = await wallet.refreshCoinList(expiry_time);
    sortWallet(storageData);
  };

  const loadCache = async () => {
    const storageSwap = await wallet.getSwapConfig();
    console.log('swapConfig -> ', storageSwap);
    setSwapConfig(storageSwap);
    const storageData = await wallet.getCoinList(expiry_time);
    sortWallet(storageData);
  };

  const handleStorageData = async (storageData) => {
    if (storageData) {
      await setCoinData(storageData);
      let sum = 0;
      storageData
        .filter((item) => item.total !== null)
        .forEach((coin) => {
          sum = sum + parseFloat(coin.total);
        });
      setBalance('$ ' + sum.toFixed(2));
    }
  };

  useEffect(() => {
    const pollTimer = pollingFunction(setUserAddress, 5000, 300000, true);

    if (location.search.includes('activity')) {
      setValue(1);
    }

    return function cleanup() {
      clearInterval(pollTimer);
    };
  }, []);

  useEffect(() => {
    setCoinLoading(address === '');
    if (address) {
      setCoinLoading(true);
      loadCache();
      setAddress(address);
      setCoinLoading(false);
      fetchWallet();
    }
  }, [address]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          backgroundColor: 'background.default',
        }}
      >
        {coinLoading ? (
          <Skeleton
            width="30%"
            sx={{
              py: '25px',
              my: '18px',
              borderRadius: '8px',
              // height: '48px',
              alignSelf: 'center',
            }}
          />
        ) : (
          <Typography
            variant="body1"
            sx={{
              py: '30px',
              alignSelf: 'center',
              fontSize: '32px',
              fontWeight: 'semi-bold',
            }}
            component="span"
          >
            {/* {balance} */}
            {/* <ReactTextTransition
              text={balance}
              springConfig={{ damping: 20 }}
              style={{textAlign: 'center' }}
              noOverflow
            /> */}

            {`${balance}`.split('').map((n, i) => (
              <ReactTextTransition
                key={i}
                text={n}
                className="big"
                delay={i * 20}
                direction="down"
                noOverflow
                inline
              />
            ))}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            height: '32px',
            px: '20px',
            mb: '20px',
          }}
        >
          {network == 'mainnet' && (
            <Button
              color="info3"
              variant="contained"
              sx={{ width: '100%' }}
              onClick={() => setOnRamp(true)}
            >
              {chrome.i18n.getMessage('Buy')}
            </Button>
          )}
          {isActive && (
            <Button
              color="info3"
              variant="contained"
              onClick={() => history.push('/dashboard/wallet/send')}
              // onClick={() => history.push('/dashboard/wallet/sendAmount')}
              sx={{ width: '100%' }}
            >
              {chrome.i18n.getMessage('Send')}
            </Button>
          )}
          <Button
            color="info3"
            variant="contained"
            sx={{ width: '100%' }}
            onClick={() => history.push('/dashboard/wallet/deposit')}
          >
            {chrome.i18n.getMessage('Receive')}
          </Button>
          {isActive && (
            <Button
              color="info3"
              variant="contained"
              sx={{ width: '100%' }}
              onClick={() => {
                if (swapConfig) {
                  history.push('/dashboard/wallet/swap');
                } else {
                  window.open(incLink, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {chrome.i18n.getMessage('Swap')}
            </Button>

          )}
          {/* <Button color="info" variant="contained" sx={{ width: '100%' }}>
              Swap
          </Button> */}
        </Box>
        <Tabs
          value={value}
          sx={{ width: '100%' }}
          onChange={handleChange}
          TabIndicatorProps={{
            style: {
              backgroundColor: '#5a5a5a',
            },
          }}
          // textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab
            icon={
              <SavingsRoundedIcon
                sx={{ color: 'text.secondary' }}
                fontSize="small"
              />
            }
            iconPosition="start"
            label={
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  textTransform: 'capitalize',
                  fontSize: '10',
                  fontWeight: 'semi-bold',
                }}
              >
                {coinData?.length || ''} {chrome.i18n.getMessage('coins')}
              </Typography>
            }
            style={{ color: '#F9F9F9', minHeight: '25px' }}
            {...a11yProps(0)}
          />
          <Tab
            icon={
              <FlashOnRoundedIcon
                sx={{ color: 'text.secondary' }}
                fontSize="small"
              />
            }
            iconPosition="start"
            label={
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  textTransform: 'capitalize',
                  fontSize: '10',
                  fontWeight: 'semi-bold',
                }}
              >
                {`${txCount}`} {chrome.i18n.getMessage('Activity')}
              </Typography>
            }
            style={{ color: '#F9F9F9', minHeight: '25px' }}
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>

      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
        style={{ height: '100%', width: '100%' }}
      >
        <TabPanel value={value} index={0}>
          <CoinList data={coinData} ableFt={accessible} isActive={isActive} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TransferList setCount={setTxCount} />
        </TabPanel>
      </SwipeableViews>
      <LLComingSoon
        alertOpen={alertOpen}
        handleCloseIconClicked={() => setAlertOpen(false)}
      />

      <Drawer
        anchor="bottom"
        open={isOnRamp}
        transitionDuration={300}
        PaperProps={{
          sx: {
            width: '100%',
            height: '65%',
            bgcolor: 'background.default',
            borderRadius: '18px 18px 0px 0px',
          },
        }}
      >
        <OnRampList close={() => setOnRamp(false)} />
      </Drawer>
    </Box>
  );
};

export default WalletTab;
