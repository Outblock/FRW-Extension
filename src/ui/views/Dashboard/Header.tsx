import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemText,
  ListItemIcon,
  ListItem,
  ListItemButton,
  Button,
  Avatar,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import Box from '@mui/material/Box';
import { StyledEngineProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { storage } from '@/background/webapi';
import eventBus from '@/eventBus';
import { withPrefix, ensureEvmAddressPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useNews } from '@/ui/utils/NewsContext';
import type { UserInfoResponse, WalletResponse } from 'background/service/networkModel';
import { useWallet, formatAddress } from 'ui/utils';

import IconCopy from '../../../components/iconfont/IconCopy';
import EyeOff from '../../FRWAssets/svg/EyeOff.svg';

import MenuDrawer from './Components/MenuDrawer';
import NewsView from './Components/NewsView';
import Popup from './Components/Popup';
import WalletFunction from './Components/WalletFunction';

const useStyles = makeStyles(() => ({
  appBar: {
    zIndex: 1399,
  },
  paper: {
    background: '#282828',
  },
  active: {
    background: '#BABABA14',
    borderRadius: '12px',
  },
}));

type ChildAccount = {
  [key: string]: {
    name: string;
    description: string;
    thumbnail: {
      url: string;
    };
  };
};

const Header = ({ loading = false }) => {
  const usewallet = useWallet();
  const classes = useStyles();
  const history = useHistory();

  const { mainAddress, evmAddress } = useProfileStore();
  const [isLoading, setLoading] = useState(loading);

  const [mainAddressLoading, setMainLoading] = useState(true);

  const [evmLoading, setEvmLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [userWallet, setWallet] = useState<any>(null);
  const [currentWallet, setCurrentWallet] = useState(0);
  const [evmWallet, setEvmWallet] = useState<any>({
    name: '',
    icon: '',
    address: '',
    chain_id: 'evm',
    id: 1,
    coins: ['flow'],
    color: '',
  });
  const [current, setCurrent] = useState({});
  const [currentNetwork, setNetwork] = useState('mainnet');

  const [isSandbox, setIsSandbox] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [otherAccounts, setOtherAccounts] = useState<any>(null);
  const [loggedInAccounts, setLoggedIn] = useState<any>(null);
  const [childAccounts, setChildAccount] = useState<ChildAccount>({});
  const [modeOn, setModeOn] = useState(false);
  // const [unread, setUnread] = useState(0);

  const [domain] = useState('');
  const [mainnetAvailable, setMainnetAvailable] = useState(true);
  const [testnetAvailable, setTestnetAvailable] = useState(true);

  const [modeAnonymous, setModeAnonymous] = useState(false);

  const [isPending, setIsPending] = useState(false);

  const [ispop, setPop] = useState(false);

  const [initialStart, setInitial] = useState(true);

  const [switchLoading, setSwitchLoading] = useState(false);
  const [expandAccount, setExpandAccount] = useState(false);

  const [, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState(null);
  // const { unreadCount } = useNotificationStore();
  // TODO: add notification count
  const { unreadCount } = useNews();

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  const togglePop = () => {
    setPop(!ispop);
  };

  // News Drawer
  const [showNewsDrawer, setShowNewsDrawer] = useState(false);

  const toggleNewsDrawer = useCallback(() => {
    // Avoids unnecessary re-renders using a function to toggle the state
    setShowNewsDrawer((prevShowNewsDrawer) => !prevShowNewsDrawer);
  }, []);

  const [usernameDrawer, setUsernameDrawer] = useState(false);

  const toggleUsernameDrawer = useCallback(() => {
    // Avoids unnecessary re-renders using a function to toggle the state
    setUsernameDrawer((prevUsernameDrawer) => !prevUsernameDrawer);
  }, []);

  const wallets = useCallback(
    (data) => {
      let sortData = data;
      const walletName = domain ? domain : 'Wallet';
      if (!Array.isArray(sortData)) {
        sortData = [];
      }
      const filteredData = (sortData || []).filter((wallet) => {
        return wallet.chain_id === currentNetwork;
      });
      return (filteredData || []).map((wallet, index) => {
        return {
          id: index,
          name: wallet.name || 'Wallet',
          address: withPrefix(wallet.blockchain[0].address),
          key: index,
          icon: wallet.icon || '',
          color: wallet.color || '',
        };
      });
    },
    [currentNetwork, domain]
  );

  const [walletList, setWalletList] = useState([]);

  const freshUserWallet = useCallback(async () => {
    const wallet: WalletResponse[] = await usewallet.getUserWallets();
    const fData: WalletResponse[] = wallet.filter((item) => item.blockchain !== null);

    // putDeviceInfo(fData);
    setWallet(fData);
    if (initialStart) {
      await usewallet.openapi.putDeviceInfo(fData);
      setInitial(false);
    }
  }, [initialStart, usewallet]);

  const freshUserInfo = useCallback(async () => {
    const currentWallet = await usewallet.getCurrentWallet();
    const isChild = await usewallet.getActiveWallet();

    const mainAddress = await usewallet.getMainAddress();
    if (isChild === 'evm') {
      const res = await usewallet.queryEvmAddress(mainAddress!);
      const evmWallet = await usewallet.getEvmWallet();
      const evmAddress = ensureEvmAddressPrefix(res);
      evmWallet.address = evmAddress;
      await setCurrent(evmWallet);
      setMainLoading(false);
    } else if (isChild) {
      const currentWallet = await usewallet.getCurrentWallet();
      await setCurrent(currentWallet);
      setMainLoading(false);
    } else {
      const mainwallet = await usewallet.returnMainWallet();
      await setCurrent(mainwallet);
      setMainLoading(false);
    }
    const keys = await usewallet.getAccount();
    const pubKTuple = await usewallet.getPubKey();
    if (mainAddress) {
      try {
        const evmWallet = await usewallet.getEvmWallet();
        setEvmWallet(evmWallet);
      } catch (err) {
        console.error('queryEvmAddress err', err);
      } finally {
        setEvmLoading(false);
      }
    }

    const walletData = await usewallet.getUserInfo(true);

    const { otherAccounts, wallet, loggedInAccounts } = await usewallet.openapi.freshUserInfo(
      currentWallet,
      keys,
      pubKTuple,
      walletData,
      isChild
    );

    await setOtherAccounts(otherAccounts);
    await setUserInfo(wallet);
    await setLoggedIn(loggedInAccounts);
  }, [usewallet]);

  const fetchUserWallet = useCallback(async () => {
    freshUserWallet();
    freshUserInfo();
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    setChildAccount(childresp);
    usewallet.setChildWallet(childresp);
  }, [freshUserInfo, freshUserWallet, usewallet]);

  const switchAccount = useCallback(
    async (account) => {
      setSwitchLoading(true);
      try {
        const switchingTo = process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
        await storage.set('currentAccountIndex', account.indexInLoggedInAccounts);
        if (account.id) {
          await storage.set('currentId', account.id);
        } else {
          await storage.set('currentId', '');
        }

        await usewallet.lockWallet();
        await usewallet.clearWallet();
        await usewallet.switchNetwork(switchingTo);

        history.push('/switchunlock');
      } catch (error) {
        console.error('Error during account switch:', error);
        // Handle any additional error reporting or user feedback here if needed
      } finally {
        setSwitchLoading(false);
      }
    },
    [usewallet, history]
  );

  const loadNetwork = useCallback(async () => {
    const network = await usewallet.getNetwork();
    setIsSandbox(false);

    setEvmLoading(true);
    await setNetwork(network);
  }, [usewallet]);

  const loadDeveloperMode = async () => {
    const developerMode = await storage.get('developerMode');
    if (developerMode) {
      setModeOn(developerMode);
    }
  };

  const setWallets = async (walletInfo, key, index = null) => {
    await usewallet.setActiveWallet(walletInfo, key, index);
    setMainLoading(false);

    // Clear collections
    usewallet.clearNFTCollection();
    usewallet.clearCoinList();

    // Refresh wallet data
    await fetchUserWallet();
    await loadNetwork();

    // Navigate if needed
    history.push('/dashboard');
    window.location.reload();
  };

  const transactionHandler = (request) => {
    // This is just to handle pending transactions
    // The header will listen to the transactionPending event
    // It shows spinner on the header when there is a pending transaction
    if (request.msg === 'transactionPending') {
      setIsPending(true);
    }
    if (request.msg === 'transactionDone') {
      setIsPending(false);
    }
    // The header should handle transactionError events
    if (request.msg === 'transactionError') {
      console.warn('transactionError', request.errorMessage, request.errorCode);
      // The error message is not used anywhere else for now
      setErrorMessage(request.errorMessage);
      setErrorCode(request.errorCode);
    }
    return true;
  };

  const checkPendingTx = useCallback(async () => {
    const network = await usewallet.getNetwork();

    const result = await chrome.storage.session.get('transactionPending');
    const now = new Date();
    if (result.transactionPending?.date) {
      const diff = now.getTime() - result.transactionPending.date.getTime();
      const inMins = Math.round(diff / 60000);
      if (inMins > 5) {
        await chrome.storage.session.remove('transactionPending');
        return;
      }
    }
    if (
      result &&
      Object.keys(result).length !== 0 &&
      network === result.transactionPending.network
    ) {
      setIsPending(true);
      usewallet.listenTransaction(result.transactionPending.txId, false);
    } else {
      setIsPending(false);
    }
  }, [usewallet]);

  const networkColor = (network: string) => {
    switch (network) {
      case 'mainnet':
        return '#41CC5D';
      case 'testnet':
        return '#FF8A00';
      case 'crescendo':
        return '#CCAF21';
    }
  };

  const checkAuthStatus = useCallback(async () => {
    await usewallet.openapi.checkAuthStatus();
    await usewallet.checkNetwork();
  }, [usewallet]);

  useEffect(() => {
    loadNetwork();
    fetchUserWallet();
    loadDeveloperMode();
    checkPendingTx();
    checkAuthStatus();

    const addressDone = () => {
      fetchUserWallet();
    };

    const networkChanged = (network) => {
      loadNetwork();
    };

    chrome.runtime.onMessage.addListener(transactionHandler);
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    eventBus.addEventListener('addressDone', addressDone);
    eventBus.addEventListener('switchNetwork', networkChanged);
    return () => {
      eventBus.removeEventListener('addressDone', addressDone);
      eventBus.removeEventListener('switchNetwork', networkChanged);
      chrome.runtime.onMessage.removeListener(transactionHandler);
    };
  }, [checkAuthStatus, checkPendingTx, currentNetwork, fetchUserWallet, loadNetwork]);

  useEffect(() => {
    const list = wallets(userWallet);
    setWalletList(list);
    setCurrentWallet(0);
    setLoading(userWallet === null);
  }, [userWallet, currentNetwork, wallets]);

  const checkNetwork = useCallback(async () => {
    const mainnetAvailable = await usewallet.openapi.pingNetwork('mainnet');
    setMainnetAvailable(mainnetAvailable);
    const testnetAvailable = await usewallet.openapi.pingNetwork('testnet');
    setTestnetAvailable(testnetAvailable);
    // const crescendoAvailable = await usewallet.openapi.pingNetwork('crescendo')
    // setSandboxnetAvailable(crescendoAvailable)
  }, [usewallet]);

  useEffect(() => {
    if (usernameDrawer) {
      checkNetwork();
    }
  }, [usernameDrawer, checkNetwork]);

  const switchNetwork = useCallback(
    async (network: string) => {
      // Update local states
      setNetwork(network);
      setMainLoading(true);
      setEvmLoading(true);

      // Switch network in wallet
      await usewallet.switchNetwork(network);

      // Refresh wallet data
      await fetchUserWallet();
      await loadNetwork();

      toggleUsernameDrawer();

      // Navigate if needed
      history.push('/dashboard');
    },
    [usewallet, fetchUserWallet, loadNetwork, toggleUsernameDrawer, history]
  );

  const AccountFunction = (props) => {
    return (
      <ListItem
        disablePadding
        key={props.username}
        onClick={() => {
          toggleUsernameDrawer();
        }}
      >
        <ListItemButton
          onClick={() => {
            navigator.clipboard.writeText(props.username);
          }}
        >
          <ListItemIcon>
            <Avatar
              component="span"
              src={props.avatar}
              sx={{ width: '24px', height: '24px', ml: '4px' }}
              alt="avatar"
            />
          </ListItemIcon>
          <ListItemText>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Tooltip title={chrome.i18n.getMessage('Copy__username')} arrow>
                <Typography variant="body1" component="div" display="inline" color="text">
                  {'@' + props.username}
                </Typography>
              </Tooltip>
              {modeAnonymous && (
                <Tooltip title={chrome.i18n.getMessage('Anonymous__mode__on')} arrow>
                  <img style={{ display: 'inline-block', width: '20px' }} src={EyeOff} />
                </Tooltip>
              )}
            </Box>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };

  const NetworkFunction = () => {
    return (
      <>
        <Typography variant="h5" color="text" padding="18px 0 0 18px" fontWeight="semi-bold">
          {chrome.i18n.getMessage('Network')}
        </Typography>
        <List>
          <ListItem
            disablePadding
            key="mainnet"
            secondaryAction={
              !mainnetAvailable && (
                <ListItemText>
                  <Typography
                    variant="caption"
                    component="span"
                    display="inline"
                    color="error.main"
                  >
                    {chrome.i18n.getMessage('Unavailable')}
                  </Typography>
                </ListItemText>
              )
            }
            onClick={() => {
              switchNetwork('mainnet');
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('mainnet'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    opacity: currentNetwork === 'mainnet' ? '1' : '0.1',
                  }}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1" component="span" display="inline" color="text">
                  {chrome.i18n.getMessage('Mainnet')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>

          <ListItem
            disablePadding
            key="testnet"
            secondaryAction={
              !testnetAvailable && (
                <ListItemText>
                  <Typography
                    variant="caption"
                    component="span"
                    display="inline"
                    color="error.main"
                  >
                    {chrome.i18n.getMessage('Unavailable')}
                  </Typography>
                </ListItemText>
              )
            }
            onClick={() => {
              switchNetwork('testnet');
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('testnet'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    fontFamily: 'Inter,sans-serif',
                    opacity: currentNetwork === 'testnet' ? '1' : '0.1',
                  }}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1" component="span" display="inline" color="text">
                  {chrome.i18n.getMessage('Testnet')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>

          {/* {isSandboxEnabled && <ListItem
            disablePadding
            key='crescendo'
            secondaryAction={
              !crescendoAvailable && (<ListItemText>
                <Typography
                  variant="caption"
                  component="span"
                  display="inline"
                  color='error.main'
                >
                  {chrome.i18n.getMessage('Unavailable')}
                </Typography>
              </ListItemText>)
            }
            onClick={() => {
              switchNetwork('crescendo');
            }}>
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('crescendo'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    opacity: currentNetwork == 'crescendo' ? '1' : '0.1',
                  }}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography
                  variant="body1"
                  component="span"
                  display="inline"
                  color='text'
                >
                  {chrome.i18n.getMessage('Crescendo')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
          } */}
        </List>
      </>
    );
  };

  const createWalletList = (props) => {
    return (
      <List component="nav" key={props.id} sx={{ mb: '0', padding: 0 }}>
        <WalletFunction
          props_id={props.id}
          name={props.name}
          address={props.address}
          icon={props.icon}
          color={props.color}
          setWallets={setWallets}
          currentWallet={currentWallet}
          current={current}
          mainAddress={mainAddress}
          setExpandAccount={setExpandAccount}
          expandAccount={expandAccount}
          walletList={walletList}
        />
      </List>
    );
  };

  const createAccountList = (props) => {
    return (
      props && (
        <List component="nav" key={props.username}>
          <AccountFunction username={props.username} avatar={props.avatar} />
        </List>
      )
    );
  };

  const usernameSelect = () => {
    return (
      <Drawer
        open={usernameDrawer}
        anchor="top"
        onClose={toggleUsernameDrawer}
        classes={{ paper: classes.paper }}
        PaperProps={{
          sx: { width: '100%', marginTop: '56px', bgcolor: 'background.paper' },
        }}
      >
        <Typography variant="h5" color="text" padding="18px 0 0 18px" fontWeight="semi-bold">
          {chrome.i18n.getMessage('Account')}
        </Typography>
        {userInfo && createAccountList(userInfo)}
        {modeOn && NetworkFunction()}
      </Drawer>
    );
  };
  const NewsDrawer = () => {
    return (
      <Drawer
        open={showNewsDrawer}
        anchor="top"
        onClose={toggleNewsDrawer}
        classes={{ paper: classes.paper }}
        PaperProps={{
          sx: {
            width: '100%',
            marginTop: '56px',
            marginBottom: '144px',
            bgcolor: 'background.paper',
          },
        }}
      >
        <NewsView />
      </Drawer>
    );
  };

  const appBarLabel = (props) => {
    return (
      <Toolbar sx={{ height: '56px', width: '100%', display: 'flex', px: '0px' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
          sx={{ marginLeft: '0px', padding: '3px', position: 'relative' }}
        >
          <MenuIcon />
          {/* {unread ?
            <Box sx={{
              width: '8px',
              height: '8px',
              backgroundColor: '#41CC5D',
              borderRadius: '8px',
              position: 'absolute',
              top: '5px',
              right: '2px'
            }}>
            </Box>
            :
            <Box></Box>
          } */}
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        {!mainAddressLoading && props && props.address ? (
          <Tooltip title={chrome.i18n.getMessage('Copy__Address')} arrow>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(props.address);
              }}
              variant="text"
            >
              <Box component="div" sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="overline"
                  color="text"
                  align="center"
                  display="block"
                  sx={{ lineHeight: '1.5' }}
                >
                  {`${props.name === 'Flow' ? 'Wallet' : props.name}${
                    isValidEthereumAddress(props.address) ? ' EVM' : ''
                  }`}
                </Typography>
                <Box sx={{ display: 'flex', gap: '5px' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'lowercase' }}
                  >
                    {formatAddress(props.address)}
                  </Typography>
                  <IconCopy fill="icon.navi" width="12px" />
                </Box>
              </Box>
            </Button>
          </Tooltip>
        ) : (
          <Skeleton variant="rectangular" width={78} height={33} sx={{ borderRadius: '8px' }} />
        )}
        <Box sx={{ flexGrow: 1 }} />

        {!isLoading && userInfo && props ? (
          <Tooltip title={isPending ? chrome.i18n.getMessage('Pending__Transaction') : ''} arrow>
            <Box style={{ position: 'relative' }}>
              {isPending && (
                <CircularProgress
                  size={'28px'}
                  sx={{
                    position: 'absolute',
                    width: '28px',
                    height: '28px',
                    left: '-1px',
                    top: '-1px',
                    color: networkColor(currentNetwork),
                  }}
                />
              )}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="avatar"
                onClick={toggleNewsDrawer}
                sx={{
                  border: isPending
                    ? ''
                    : currentNetwork !== 'mainnet'
                      ? `2px solid ${networkColor(currentNetwork)}`
                      : isSandbox
                        ? '2px solid #CCAF21'
                        : '2px solid #282828',
                  padding: '3px',
                  marginRight: '0px',
                  position: 'relative',
                }}
              >
                <img
                  src={userInfo.avatar}
                  style={{ backgroundColor: '#797979', borderRadius: '10px' }}
                  width="20px"
                  height="20px"
                />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#4CAF50',
                      color: 'black',
                      borderRadius: '50%',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      padding: '2px',
                      border: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </Box>
                )}
              </IconButton>
            </Box>
          </Tooltip>
        ) : (
          <Skeleton variant="circular" width={20} height={20} />
        )}
      </Toolbar>
    );
  };

  return (
    <StyledEngineProvider injectFirst>
      <AppBar position="relative" className={classes.appBar} elevation={0}>
        <Toolbar sx={{ px: '12px', backgroundColor: '#282828' }}>
          {userInfo && (
            <MenuDrawer
              userInfo={userInfo!}
              drawer={drawer}
              toggleDrawer={toggleDrawer}
              otherAccounts={otherAccounts}
              switchAccount={switchAccount}
              togglePop={togglePop}
              walletList={walletList}
              childAccounts={childAccounts}
              current={current}
              createWalletList={createWalletList}
              setWallets={setWallets}
              currentNetwork={currentNetwork}
              evmWallet={evmWallet}
              networkColor={networkColor}
              evmLoading={evmLoading}
              modeOn={modeOn}
              mainAddressLoading={mainAddressLoading}
            />
          )}
          {appBarLabel(current)}
          {usernameSelect()}
          <NewsDrawer />
          {userInfo && (
            <Popup
              isConfirmationOpen={ispop}
              data={{ amount: 0 }}
              handleCloseIconClicked={() => setPop(false)}
              handleCancelBtnClicked={() => setPop(false)}
              handleAddBtnClicked={() => {
                setPop(false);
              }}
              userInfo={userInfo!}
              current={current!}
              switchAccount={switchAccount}
              loggedInAccounts={loggedInAccounts}
              switchLoading={switchLoading}
            />
          )}
        </Toolbar>
      </AppBar>
      <StorageExceededAlert open={errorCode === 1103} onClose={() => setErrorCode(null)} />
    </StyledEngineProvider>
  );
};

export default Header;
