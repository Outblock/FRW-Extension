import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
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
  Divider,
  Button,
  Avatar,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import IconCopy from '../../../components/iconfont/IconCopy';
import logo from '../../../../_raw/images/icon-128.png';
import Tooltip from '@mui/material/Tooltip';
import { useWallet } from 'ui/utils';
import { useHistory } from 'react-router-dom';
import { UserInfoResponse } from 'background/service/networkModel';
import { storage } from '@/background/webapi';
import { withPrefix } from '@/ui/utils/address';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { StyledEngineProvider } from '@mui/material/styles';
import eventBus from '@/eventBus';
import IconLock from '../../../components/iconfont/IconLock';
import LLComingSoon from '../../FRWComponent/LLComingSoonWarning';
import EyeOff from '../../FRWAssets/svg/EyeOff.svg'

const useStyles = makeStyles(() => ({
  appBar: {
    zIndex: 1399,
  },
  menuDrawer: {
    zIndex: '1400 !important',
  },
  paper: {
    background: '#282828',
  },
  active: {
    background: '#BABABA14',
    borderRadius: '12px'
  }
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


const Header = ({ loading }) => {
  const usewallet = useWallet();
  const classes = useStyles();
  const history = useHistory();

  const [isLoading, setLoading] = useState(loading);
  const [drawer, setDrawer] = useState(false);
  const [userWallet, setWallet] = useState<any>(null);
  const [currentWallet, setCurrentWallet] = useState(0);
  const [current, setCurrent] = useState({});
  const [currentNetwork, setNetwork] = useState('mainnet');
  const [isSandbox, setIsSandbox] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [childAccounts, setChildAccount] = useState<ChildAccount>({});
  const [modeOn, setModeOn] = useState(false);
  const [unread, setUnread] = useState(0);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [domain, setDomain] = useState('');

  const [mainnetAvailable, setMainnetAvailable] = useState(true);
  const [testnetAvailable, setTestnetAvailable] = useState(true);
  const [sandboxnetAvailable, setSandboxnetAvailable] = useState(true);

  const [isSandboxEnabled, setSandboxEnabled] = useState(false);

  const [modeAnonymous, setModeAnonymous] = useState(false);

  const [isPending, setIsPending] = useState(false);


  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  const toggleUnread = () => {
    setUnread(0);
  };

  const [usernameDrawer, setUsernameDrawer] = useState(false);
  const toggleUsernameDrawer = () => {
    setUsernameDrawer(!usernameDrawer);
  };

  const wallets = (data) => {
    const walletName = domain ? domain : 'Wallet';
    const filteredData = (data || []).filter((wallet, index) => {
      return wallet.chain_id == currentNetwork;
    });
    return (filteredData || []).map((wallet, index) => {
      return {
        id: index,
        name: walletName,
        address: withPrefix(wallet.blockchain[0].address),
        key: index,
      };
    });
  };

  const [walletList, setWalletList] = useState([]);

  const fetchUserWallet = async () => {
    const wallet = await usewallet.getUserWallets();
    await setWallet(wallet);
    const userInfo = await usewallet.getUserInfo(false);
    const domain = await usewallet.fetchUserDomain();
    const currentWallet = await usewallet.getCurrentWallet();
    console.log('currentWallet ', currentWallet);
    setCurrent(currentWallet);
    await setUserInfo(userInfo);
    await setDomain(domain);
    if (userInfo.private == 1) {
      setModeAnonymous(false);
    } else {
      setModeAnonymous(true)
    }
    if (domain) {
      loadInbox();
    }
    const sandboxnet = await usewallet.checkSandBoxnet();
    if (sandboxnet.length > 0) {
      setSandboxEnabled(true);
    }
    freshUserWallet();
    freshUserInfo();
    const childresp: ChildAccount = await usewallet.checkUserChildAccount();
    console.log('childresp :', childresp);
    setChildAccount(childresp);
    usewallet.setChildWallet(childresp);
  };

  const freshUserWallet = async () => {
    const wallet = await usewallet.refreshUserWallets()
    await setWallet(wallet);
  }

  const freshUserInfo = async () => {
    const wallet = await usewallet.getUserInfo(true);
    await setUserInfo(wallet);
    usewallet.checkUserDomain(wallet.username);
  }

  const loadNetwork = async () => {
    const network = await usewallet.getNetwork();
    setIsSandbox(false);
    if (network === 'sandboxnet') {
      setIsSandbox(true);
    }
    setNetwork(network);
  }

  const loadInbox = async () => {

    const giftBoxHistory = await usewallet.getHistory();
    const resp = await usewallet.fetchFlownsInbox();
    let tempRead = 0;
    let nftRead = 0;
    Object.keys(resp.vaultBalances).map(() => {
      tempRead += 1;
    });
    Object.keys(resp.collections).map((k) => {
      nftRead += resp.collections[k].length;
    });

    giftBoxHistory.token.map((token) => {
      const key = Object.keys(token)[0];
      if (parseFloat(token[key]) === parseFloat(resp.vaultBalances[key])) {
        tempRead -= 1;
      }
    });

    Object.keys(giftBoxHistory.nft).map((k) => {
      const arr = giftBoxHistory.nft[k];
      arr.map((v) => {
        if (resp.collections[k].includes(v)) {
          nftRead -= 1;
        }
      })
    });
    const totalUnread = nftRead + tempRead;
    setUnread(totalUnread);


  }
  const loadDeveloperMode = async () => {
    const developerMode = await storage.get('developerMode');
    if (developerMode) { setModeOn(developerMode); }
  }

  const goToInbox = () => {
    if (domain) {
      history.push('/dashboard/inbox');
    } else {
      history.push('/dashboard/flowns');
    }
  }

  const setWallets = async (walletInfo, key) => {
    await usewallet.setActiveWallet(walletInfo, key);
    const currentWallet = await usewallet.getCurrentWallet();
    setCurrent(currentWallet);
    usewallet.clearNFTCollection();
    // TODO: replace it with better UX
    window.location.reload();
  }

  const transactionHanlder = (request) => {
    if (request.msg === 'transactionPending') {
      setIsPending(true);
    }
    if (request.msg === 'transactionDone') {
      setIsPending(false);
    }
    return true
  }

  const checkPendingTx = async () => {
    const network = await usewallet.getNetwork()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 
    const result = await chrome.storage.session.get('transactionPending')
    const now = new Date();
    if (result.transactionPending?.date) {
      const diff = now.getTime() - result.transactionPending.date.getTime()
      const inMins = Math.round(diff / 60000);
      console.log('inMins ->', inMins, diff)
      if (inMins > 5) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await chrome.storage.session.remove('transactionPending')
        return
      }
    }
    if (result && Object.keys(result).length !== 0 && network === result.transactionPending.network) {
      setIsPending(true);
      usewallet.listenTransaction(result.transactionPending.txId, false);
    } else {
      setIsPending(false);
    }
  }

  const networkColor = (network: string) => {
    switch (network) {
      case 'mainnet':
        return '#41CC5D'
      case 'testnet':
        return '#FF8A00'
      case 'sandboxnet':
        return '#CCAF21'
    }
  }

  const checkAuthStatus = async () => {
    await usewallet.openapi.checkAuthStatus()
    await usewallet.checkNetwork();
  }

  useEffect(() => {
    fetchUserWallet();
    loadDeveloperMode();
    loadNetwork();
    checkPendingTx();
    checkAuthStatus();

    const addressDone = () => {
      fetchUserWallet();
    };

    const networkChanged = (network) => {
      loadNetwork();
    };

    chrome.runtime.onMessage.addListener(transactionHanlder);
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    eventBus.addEventListener('addressDone', addressDone);
    eventBus.addEventListener('switchNetwork', networkChanged);
    return () => {
      eventBus.removeEventListener('addressDone', addressDone);
      eventBus.removeEventListener('switchNetwork', networkChanged);
      chrome.runtime.onMessage.removeListener(transactionHanlder)
    }
  }, []);

  useEffect(() => {
    const list = wallets(userWallet);
    setWalletList(list);
    setCurrentWallet(0);
    setLoading(userWallet === null);
  }, [userWallet, currentNetwork]);

  const checkNetwork = async () => {
    const mainnetAvailable = await usewallet.openapi.pingNetwork('mainnet')
    setMainnetAvailable(mainnetAvailable)
    const testnetAvailable = await usewallet.openapi.pingNetwork('testnet')
    setTestnetAvailable(testnetAvailable)
    const sandboxnetAvailable = await usewallet.openapi.pingNetwork('sandboxnet')
    setSandboxnetAvailable(sandboxnetAvailable)
  }

  useEffect(() => {
    if (usernameDrawer) {
      checkNetwork()
    }
  }, [usernameDrawer])

  const switchNetwork = async (network: string) => {
    setNetwork(network);
    usewallet.switchNetwork(network);
    toggleUsernameDrawer();

    // TODO: replace it with better UX
    window.location.reload();
  }

  const WalletFunction = (props) => {
    return (
      <ListItem
        disablePadding
        onClick={() => {
          setWallets(null, null);
        }}
        sx={{ mb: 0, paddingX: '20px' }}
      >
        <ListItemButton sx={{ mb: 0 }} className={current['address'] === props.address ? classes.active : ''}>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                component="span"
                fontWeight={"semi-bold"}
                display="flex"
                color={
                  props.props_id == currentWallet
                    ? 'text.title'
                    : 'text.nonselect'
                }
              >
                {props.name}
                {props.address == current['address'] && (
                  <ListItemIcon style={{ display: 'flex', alignItems: 'center' }}>
                    <FiberManualRecordIcon
                      style={{
                        fontSize: '10px',
                        color: '#40C900',
                        marginLeft: '10px',
                      }}
                    />
                  </ListItemIcon>
                )}
              </Typography>
            }
            secondary={
              <Typography
                variant="body1"
                component="span"
                // display="inline"
                color={'text.nonselect'}
                sx={{ fontSize: '13px', textTransform: 'lowercase' }}
              >
                {/* <span>{'  '}</span> */}
                {props.address}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const AccountFunction = (props) => {
    return (
      <ListItem
        disablePadding
        key={props.username}
        onClick={() => {
          toggleUsernameDrawer();
        }}
      >
        <ListItemButton onClick={() => {
          navigator.clipboard.writeText(props.username);
        }}>
          <ListItemIcon>
            <Avatar
              component="span"
              src={props.avatar}
              sx={{ width: '24px', height: '24px', ml: '4px' }}
              alt="avatar"
            />
          </ListItemIcon>
          <ListItemText>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Tooltip title={chrome.i18n.getMessage('Copy__username')} arrow>
                <Typography
                  variant="body1"
                  component="div"
                  display="inline"
                  color='text'
                >
                  {'@' + props.username}
                </Typography>
              </Tooltip>
              {modeAnonymous &&
                <Tooltip title={chrome.i18n.getMessage('Anonymous__mode__on')} arrow>
                  <img style={{ display: 'inline-block', width: '20px' }} src={EyeOff} />
                </Tooltip>
              }
            </Box>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    );
  };

  const NetworkFunction = () => {
    return (
      <>
        <Typography variant='h5' color='text' padding='18px 0 0 18px' fontWeight='semi-bold'>{chrome.i18n.getMessage('Network')}</Typography>
        <List>
          <ListItem
            disablePadding
            key='mainnet'
            secondaryAction={
              !mainnetAvailable && (<ListItemText>
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
              switchNetwork('mainnet');
            }}>
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('mainnet'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    opacity: currentNetwork == 'mainnet' ? '1' : '0.1',
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
                  {chrome.i18n.getMessage('Mainnet')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>

          <ListItem
            disablePadding
            key='testnet'
            secondaryAction={
              !testnetAvailable && (<ListItemText>
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
              switchNetwork('testnet');
            }}>
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('testnet'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    fontFamily:'Inter,sans-serif',
                    opacity: currentNetwork == 'testnet' ? '1' : '0.1',
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
                  {chrome.i18n.getMessage('Testnet')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>

          {isSandboxEnabled && <ListItem
            disablePadding
            key='sandboxnet'
            secondaryAction={
              !sandboxnetAvailable && (<ListItemText>
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
              switchNetwork('sandboxnet');
            }}>
            <ListItemButton>
              <ListItemIcon>
                <FiberManualRecordIcon
                  style={{
                    color: networkColor('sandboxnet'),
                    fontSize: '10px',
                    marginLeft: '10px',
                    marginRight: '10px',
                    opacity: currentNetwork == 'sandboxnet' ? '1' : '0.1',
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
                  {chrome.i18n.getMessage('Sandboxnet')}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
          }

        </List>
      </>
    )
  }

  const createWalletList = (props) => {
    return (
      <List component="nav" key={props.id}>
        <WalletFunction
          props_id={props.id}
          name={props.name}
          address={props.address}
        />
      </List>
    );
  };

  const createAccountList = (props) => {
    return (
      props &&
      <List component="nav" key={props.username}>
        <AccountFunction
          username={props.username}
          avatar={props.avatar}
        />
      </List>
    );
  };

  const menuDrawer = (
    <Drawer
      open={drawer}
      onClose={toggleDrawer}
      className={classes.menuDrawer}
      classes={{ paper: classes.paper }}
      PaperProps={{ sx: { width: '75%' } }}
    >
      <List component="nav" sx={{ backgroundColor: '#282828' }}>
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="close" onClick={toggleDrawer}>
              <CloseRoundedIcon color="secondary" />
            </IconButton>
          }
        >
          <ListItemIcon>
            <img src={logo} width="30px" />
          </ListItemIcon>
          <ListItemText primary={chrome.i18n.getMessage('Flow_Core')} />
        </ListItem>
        <Box sx={{ px: '16px' }}>
          <Divider sx={{ my: '10px', mx: '0px' }} variant="middle" color="#4C4C4C" />
        </Box>
        {walletList.length > 0 && walletList.map(createWalletList)}
        {Object.keys(childAccounts).map((key) => (
          <ListItem
            key={key}
            disablePadding
            sx={{ mb: 0, paddingX: '20px' }}
            onClick={() => setWallets({
              name: childAccounts[key]?.name ?? key,
              address: key,
              chain_id: currentNetwork,
              coins: ['flow'],
              id: 1
            }, key)}
          >
            <ListItemButton className={current['address'] === key ? classes.active : ''} sx={{ mb: 0 }}>
              <ListItemIcon>
                <img
                  style={{
                    borderRadius: '24px',
                    marginLeft: '28px',
                    marginRight: '4px',
                    height: '24px',
                    width: '24px',
                    objectFit: 'cover'
                  }}
                  src={childAccounts[key]?.thumbnail?.url ?? 'https://lilico.app/placeholder-2.0.png'}
                  alt={childAccounts[key]?.name ?? chrome.i18n.getMessage('Linked_Account')}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    component="span"
                    color="#E6E6E6"
                    fontSize={'10px'}
                  >
                    {childAccounts[key]?.name ?? key}
                  </Typography>
                }
              />
              {current['address'] === key &&
                <ListItemIcon>
                  <FiberManualRecordIcon
                    style={{
                      fontSize: '10px',
                      color: '#40C900',
                      marginLeft: '10px',
                    }}
                  />
                </ListItemIcon>
              }
            </ListItemButton>
          </ListItem>
        ))}
        <Box sx={{ px: '16px' }}>
          <Divider sx={{ my: '10px', mx: '0px' }} variant="middle" color="#4C4C4C" />
        </Box>
        {/* <ListItem disablePadding>
          <ListItemButton onClick={() => {
            toggleDrawer();
            toggleUnread();
            goToInbox();
          }}>
            <ListItemIcon>
              <InboxIcon style={{
                marginLeft: '4px',
              }} />
            </ListItemIcon>
            <ListItemText primary={domain ? chrome.i18n.getMessage('Inbox') : chrome.i18n.getMessage('Enable__Inbox')} />
            {unread ?
              <Box
                sx={{
                  width: '32px',
                  color: '#fff',
                  textAlign: 'center',
                  background: '#41CC5D',
                  borderRadius: '12px',
                }}
              >
                {unread}
              </Box>
              :
              <Box></Box>
            }
          </ListItemButton>
        </ListItem> */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setAlertOpen(true)}>
            <ListItemIcon
              sx={{
                width:'24px',
                minWidth:'24px',
                marginRight:'12px',
              }}
            >
              <AddIcon style={{
                marginLeft: '4px',
              }} />
            </ListItemIcon>
            <ListItemText primary={chrome.i18n.getMessage('Import__Wallet')} />
          </ListItemButton>
        </ListItem>
        {/* <ListItem disablePadding>
          <ListItemButton component="a" href="/">
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Import wallet" />
          </ListItemButton>
        </ListItem> */}
        <ListItem disablePadding onClick={async () => {
          await usewallet.lockWallet();
          history.push('/unlock');
        }}>
          <ListItemButton>
            <ListItemIcon
              sx={{
                width:'24px',
                minWidth:'24px',
                marginRight:'12px',
              }}>
              <IconLock style={{
                marginLeft: '8px',
              }} />
            </ListItemIcon>
            <ListItemText primary={chrome.i18n.getMessage('Lock__Wallet')} />
          </ListItemButton>
        </ListItem>
      </List>
      <LLComingSoon
        alertOpen={alertOpen}
        handleCloseIconClicked={() => setAlertOpen(false)}
      />
    </Drawer>
  );

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
        <Typography variant='h5' color='text' padding='18px 0 0 18px' fontWeight='semi-bold'>{chrome.i18n.getMessage('Account')}</Typography>
        {userInfo && createAccountList(userInfo)}
        {modeOn && NetworkFunction()}
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
          {unread ?
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
          }
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        {!isLoading && props ? (
          <Tooltip title={chrome.i18n.getMessage('Copy__Address')} arrow>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(props.address);
              }}
              variant="text"
            >
              <Box
                component="div"
                sx={{ display: 'flex', flexDirection: 'column' }}
              >
                <Typography
                  variant="overline"
                  color="text"
                  align="center"
                  display="block"
                  sx={{ lineHeight: '1.5' }}
                >
                  {props.name === 'Lilico' ? 'Wallet' : props.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: '5px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'lowercase' }}>
                    {props.address}
                  </Typography>
                  <IconCopy fill="icon.navi" width="12px" />
                </Box>
              </Box>
            </Button>
          </Tooltip>
        ) : (
          <Skeleton
            variant="rectangular"
            width={78}
            height={33}
            sx={{ borderRadius: '8px' }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />

        {!isLoading && userInfo && props ? (
          <Tooltip title={isPending ? chrome.i18n.getMessage('Pending__Transaction') : ''} arrow>
            <Box style={{ position: 'relative' }}>
              {isPending &&
                <CircularProgress size={'28px'} sx={{ position: 'absolute', width: '28px', height: '28px', left: '-1px', top: '-1px', color: networkColor(currentNetwork) }} />
              }
              <IconButton
                edge="end"
                color="inherit"
                aria-label="avatar"
                onClick={toggleUsernameDrawer}
                sx={{
                  border: isPending ? '' : currentNetwork == 'testnet' ? '2px solid #FF8A00' : isSandbox ? '2px solid #CCAF21' : '2px solid #282828',
                  padding: '3px',
                  marginRight: '0px'
                }}
              >
                <img src={userInfo.avatar} style={{ backgroundColor: '#797979', borderRadius: '10px' }} width="20px" height="20px" />
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
          {menuDrawer}
          {appBarLabel(current)}
          {usernameSelect()}
        </Toolbar>
      </AppBar>
    </StyledEngineProvider>
  );
};

export default Header;
