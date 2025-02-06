import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import { Typography, Button, Skeleton, Drawer, CardMedia, Tabs, Tab } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';

import { IconNfts } from '@/components/iconfont';
import eventBus from '@/eventBus';
import { type ActiveChildType } from '@/shared/types/wallet-types';
import buyIcon from '@/ui/FRWAssets/svg/buyIcon.svg';
import iconMove from '@/ui/FRWAssets/svg/homeMove.svg';
import receiveIcon from '@/ui/FRWAssets/svg/receiveIcon.svg';
import sendIcon from '@/ui/FRWAssets/svg/sendIcon.svg';
import swapIcon from '@/ui/FRWAssets/svg/swapIcon.svg';
import LLComingSoon from '@/ui/FRWComponent/LLComingSoonWarning';
import { NumberTransition } from '@/ui/FRWComponent/NumberTransition';
import { useInitHook } from '@/ui/hooks';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useWallet } from '@/ui/utils';
import { formatLargeNumber } from '@/ui/utils/number';

import { withPrefix } from '../../../shared/utils/address';
import theme from '../../style/LLTheme';
import MoveBoard from '../MoveBoard';
import NFTTab from '../NFT';
import NftEvm from '../NftEvm';

import CoinList from './Coinlist';
import OnRampList from './OnRampList';
import TransferList from './TransferList';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      style={{ height: '100%', display: value === index ? 'block' : 'none' }}
      {...other}
    >
      {children}
    </div>
  );
}
const WalletTab = ({ network }) => {
  const usewallet = useWallet();
  const history = useHistory();
  const location = useLocation();
  const { initializeStore } = useInitHook();
  const { childAccounts, evmWallet, currentWallet } = useProfileStore();
  const { coins, balance } = useCoinStore();
  const [value, setValue] = React.useState(0);

  const [coinLoading, setCoinLoading] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [accessible, setAccessible] = useState<any>([]);
  const [childType, setChildType] = useState<ActiveChildType>(null);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [, setChildAccount] = useState<any>({});
  const [isOnRamp, setOnRamp] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [, setSwapConfig] = useState(false);
  const [showMoveBoard, setMoveBoard] = useState(false);
  const [buyHover, setBuyHover] = useState(false);
  const [sendHover, setSendHover] = useState(false);
  const [swapHover, setSwapHover] = useState(false);
  const [canMoveChild, setCanMoveChild] = useState(true);
  const [receiveHover, setReceiveHover] = useState(false);
  const [childStateLoading, setChildStateLoading] = useState<boolean>(false);

  const incLink =
    network === 'mainnet' ? 'https://app.increment.fi/swap' : 'https://demo.increment.fi/swap';

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const setUserAddress = useCallback(async () => {
    let data = '';
    try {
      if (childType === 'evm') {
        data = evmWallet.address;
      } else {
        data = currentWallet.address;
      }
    } catch (error) {
      console.error('Error getting address:', error);
      data = '';
    }
    if (data) {
      setAddress(withPrefix(data) || '');
    }
    return data;
  }, [childType, evmWallet, currentWallet]);

  //todo: move to util
  const pollingFunction = (func, time = 1000, endTime, immediate = false) => {
    if (immediate) {
      func();
    }
    const startTime = new Date().getTime();
    const pollTimer = setInterval(async () => {
      const nowTime = new Date().getTime();
      const data = await func();
      if ((data && data.length > 2) || nowTime - startTime >= endTime) {
        if (pollTimer) {
          clearInterval(pollTimer);
        }
        eventBus.emit('addressDone');
      }
    }, time);
    return pollTimer;
  };

  const fetchWallet = useCallback(async () => {
    // If childType is 'evm', handle it first
    const activeChild = await usewallet.getActiveWallet();
    if (activeChild === 'evm') {
      return;
      // If not 'evm', check if it's not active
    } else if (!isActive) {
      const ftResult = await usewallet.checkAccessibleFt(address);
      if (ftResult) {
        setAccessible(ftResult);
      }
    }

    // Handle all non-evm and non-active cases here
  }, [address, isActive, usewallet]);

  const loadCache = useCallback(async () => {
    const storageSwap = await usewallet.getSwapConfig();
    setSwapConfig(storageSwap);
  }, [usewallet]);

  const fetchChildState = useCallback(async () => {
    setChildStateLoading(true);
    const isChild = await usewallet.getActiveWallet();
    setChildAccount(childAccounts);
    setChildType(isChild);
    if (isChild && isChild !== 'evm') {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
    setChildStateLoading(false);
    return isChild;
  }, [usewallet, childAccounts]);

  useEffect(() => {
    fetchChildState();
    const pollTimer = pollingFunction(setUserAddress, 5000, 300000, true);

    if (location.search.includes('activity')) {
      setValue(2);
    }

    return function cleanup() {
      clearInterval(pollTimer);
    };
  }, [fetchChildState, location.search, setUserAddress, setValue]);

  useEffect(() => {
    // First call after 40 seconds
    const initialTimer = setTimeout(() => {
      const pollTimer = setInterval(() => {
        if (!address) {
          // Only call if address is empty
          initializeStore();
        }
      }, 10000); // Then call every 10 seconds

      // Cleanup interval when component unmounts
      return () => clearInterval(pollTimer);
    }, 40000);

    // Cleanup timeout when component unmounts
    return () => clearTimeout(initialTimer);
  }, [initializeStore, address]);

  const goMoveBoard = async () => {
    setMoveBoard(true);
  };

  const filteredCoinData = coins.filter((coin) => {
    if (childType === 'evm' && coin.unit !== 'flow' && Number(coin.balance) === 0 && !coin.custom) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    setCoinLoading(address === '');
    if (address) {
      setCoinLoading(true);
      loadCache();
      setCoinLoading(false);
      fetchWallet();
    }
  }, [address, fetchWallet, loadCache]);

  useEffect(() => {
    setUserAddress();
  }, [childType, setUserAddress]);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await usewallet.checkCanMoveChild();
      setCanMoveChild(result);
    };

    checkPermission();
  }, [usewallet]);

  useEffect(() => {
    // Add event listener for opening onramp
    const onRampHandler = () => setOnRamp(true);
    eventBus.addEventListener('openOnRamp', onRampHandler);

    // Clean up listener
    return () => {
      eventBus.removeEventListener('openOnRamp', onRampHandler);
    };
  }, []);

  return (
    <Box
      test-id="wallet-tab"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
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
            {`$${formatLargeNumber(balance)}`.split('').map((n, i) => (
              <NumberTransition key={`${n}-${i}`} number={n} delay={i * 20} />
            ))}
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            height: '32px',
            px: '20px',
            mb: '20px',
          }}
        >
          <Box sx={{ display: 'flex', gap: '2px', width: '100%' }}>
            {(!childType || childType === null || childType === 'evm') && (
              <Button
                color="info3"
                variant="contained"
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
                onClick={() => history.push('/dashboard/wallet/send')}
                sx={{
                  height: '36px',
                  borderTopLeftRadius: '24px',
                  borderBottomLeftRadius: '24px',
                  borderTopRightRadius: '0',
                  borderBottomRightRadius: '0',
                  px: '12px !important',
                  minWidth: '56px',
                  width: sendHover ? '100%' : '56px',
                  textTransform: 'capitalize !important',
                  flex: '1',
                  transition: 'width 0.3s ease-in-out',
                }}
              >
                <CardMedia sx={{ width: '20px', height: '20px', color: 'FFF' }} image={sendIcon} />
                {sendHover && (
                  <Typography
                    sx={{
                      fontWeight: 'normal',
                      color: '#FFF',
                      fontSize: '12px',
                      textTransform: 'capitalize !important',
                      marginLeft: '4px',
                    }}
                  >
                    {chrome.i18n.getMessage('Send')}
                  </Typography>
                )}
              </Button>
            )}

            {!childType && (
              <Button
                color="info3"
                variant="contained"
                sx={{
                  height: '36px',
                  px: '12px !important',
                  minWidth: '56px',
                  borderRadius: '0px',
                  width: swapHover ? '100%' : '56px',
                  textTransform: 'capitalize !important',
                  flex: '1',
                  transition: 'width 0.3s ease-in-out',
                }}
                onMouseEnter={() => setSwapHover(true)}
                onMouseLeave={() => setSwapHover(false)}
                onClick={() => {
                  window.open(incLink, '_blank', 'noopener,noreferrer');
                }}
              >
                <CardMedia sx={{ width: '20px', height: '20px', color: 'FFF' }} image={swapIcon} />
                {swapHover && (
                  <Typography
                    sx={{
                      fontWeight: 'normal',
                      color: '#FFF',
                      fontSize: '12px',
                      textTransform: 'capitalize !important',
                      marginLeft: '4px',
                    }}
                  >
                    {chrome.i18n.getMessage('Swap')}
                  </Typography>
                )}
              </Button>
            )}

            <Button
              color="info3"
              variant="contained"
              sx={{
                height: '36px',
                px: '12px !important',
                minWidth: '56px',
                borderTopLeftRadius:
                  !childType || childType === null || childType === 'evm' ? '0px' : '24px',
                borderBottomLeftRadius:
                  !childType || childType === null || childType === 'evm' ? '0px' : '24px',
                borderTopRightRadius: isActive ? '0px' : '24px',
                borderBottomRightRadius: isActive ? '0px' : '24px',
                width: receiveHover ? '100%' : '56px',
                textTransform: 'capitalize !important',
                flex: '1',
                transition: 'width 0.3s ease-in-out',
              }}
              onMouseEnter={() => setReceiveHover(true)}
              onMouseLeave={() => setReceiveHover(false)}
              onClick={() => history.push('/dashboard/wallet/deposit')}
            >
              <CardMedia sx={{ width: '20px', height: '20px', color: 'FFF' }} image={receiveIcon} />
              {receiveHover && (
                <Typography
                  sx={{
                    fontWeight: 'normal',
                    color: '#FFF',
                    fontSize: '12px',
                    textTransform: 'capitalize !important',
                    marginLeft: '4px',
                  }}
                >
                  {chrome.i18n.getMessage('Receive')}
                </Typography>
              )}
            </Button>
            {isActive && (
              <Button
                color="info3"
                variant="contained"
                sx={{
                  height: '36px',
                  borderTopRightRadius: '24px',
                  borderBottomRightRadius: '24px',
                  borderTopLeftRadius: '0px',
                  borderBottomLeftRadius: '0px',
                  px: '12px !important',
                  minWidth: '56px',
                  width: buyHover ? '100%' : '56px',
                  textTransform: 'capitalize !important',
                  flex: '1',
                  transition: 'width 0.3s ease-in-out',
                }}
                onMouseEnter={() => setBuyHover(true)}
                onMouseLeave={() => setBuyHover(false)}
                onClick={() => setOnRamp(true)}
              >
                <CardMedia sx={{ width: '20px', height: '20px', color: 'FFF' }} image={buyIcon} />
                {buyHover && (
                  <Typography
                    sx={{
                      fontWeight: 'normal',
                      color: '#FFF',
                      fontSize: '12px',
                      textTransform: 'capitalize !important',
                      marginLeft: '4px',
                    }}
                  >
                    {chrome.i18n.getMessage('Buy')}
                  </Typography>
                )}
              </Button>
            )}
          </Box>
          {canMoveChild && <Box sx={{ flex: '1 1 5px' }}></Box>}
          {canMoveChild && (
            <Box>
              <Button
                color="info3"
                variant="contained"
                onClick={() => goMoveBoard()}
                sx={{ height: '36px', borderRadius: '24px', px: '12px' }}
              >
                <CardMedia
                  sx={{ width: '20px', height: '20px', marginRight: '4px', color: 'FFF' }}
                  image={iconMove}
                />
                <Typography
                  sx={{
                    fontWeight: 'normal',
                    color: '#FFF',
                    fontSize: '12px',
                    textTransform: 'capitalize !important',
                  }}
                >
                  {chrome.i18n.getMessage('Move')}
                </Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Tabs
        value={value}
        sx={{
          width: '100%',
          position: 'sticky',
          top: '0',
          zIndex: 1100,
          backgroundColor: 'black',
        }}
        onChange={handleChange}
        TabIndicatorProps={{
          style: {
            backgroundColor: '#5a5a5a',
          },
        }}
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab
          icon={<SavingsRoundedIcon sx={{ color: 'text.secondary' }} fontSize="small" />}
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
              {childType === 'evm' ? filteredCoinData?.length || '' : coins?.length || ''}{' '}
              {chrome.i18n.getMessage('coins')}
            </Typography>
          }
          style={{ color: '#F9F9F9', minHeight: '25px' }}
        />
        <Tab
          icon={<IconNfts fontSize="small" />}
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
              {chrome.i18n.getMessage('NFTs')}
            </Typography>
          }
          style={{ color: '#F9F9F9', minHeight: '25px' }}
        />
        <Tab
          icon={<FlashOnRoundedIcon sx={{ color: 'text.secondary' }} fontSize="small" />}
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
              {chrome.i18n.getMessage('Activity')}
            </Typography>
          }
          style={{ color: '#F9F9F9', minHeight: '25px' }}
        />
      </Tabs>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
          style={{ height: '100%', width: '100%' }}
          containerStyle={{ height: '100%' }}
          resistance
          disabled
        >
          <TabPanel value={value} index={0}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              {value === 0 && (
                <CoinList
                  data={coins}
                  ableFt={accessible}
                  isActive={isActive}
                  childType={childType}
                  coinLoading={coinLoading}
                />
              )}
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              {value === 1 && (childType === 'evm' ? <NftEvm /> : <NFTTab />)}
            </Box>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Box sx={{ height: '100%', overflow: 'auto' }}>{value === 2 && <TransferList />}</Box>
          </TabPanel>
        </SwipeableViews>
      </Box>
      <LLComingSoon alertOpen={alertOpen} handleCloseIconClicked={() => setAlertOpen(false)} />

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
      {showMoveBoard && (
        <MoveBoard
          showMoveBoard={showMoveBoard}
          handleCloseIconClicked={() => setMoveBoard(false)}
          handleCancelBtnClicked={() => setMoveBoard(false)}
          handleAddBtnClicked={() => {
            setMoveBoard(false);
          }}
        />
      )}
    </Box>
  );
};

export default WalletTab;
