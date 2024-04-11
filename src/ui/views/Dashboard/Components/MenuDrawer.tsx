import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, Typography, Drawer, IconButton, ListItem, ListItemIcon, ListItemText, Divider, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from 'ui/utils';
import { useHistory } from 'react-router-dom';
import popLock from 'ui/FRWAssets/svg/popLock.svg';
import popAdd from 'ui/FRWAssets/svg/popAdd.svg';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { makeStyles } from '@mui/styles';
import { UserInfoResponse } from 'background/service/networkModel';
import sideMore from '../../../FRWAssets/svg/sideMore.svg'
import planetr from '../../../FRWAssets/svg/planetr.svg'
import rightarrow from '../../../FRWAssets/svg/rightarrow.svg'

import evmlogo from 'ui/FRWAssets/image/evmlogo.png';

const useStyles = makeStyles(() => ({

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



interface MenuDrawerProps {
  userInfo: UserInfoResponse;
  drawer: boolean;
  toggleDrawer: any;
  otherAccounts: any;
  switchAccount: any;
  togglePop: any;
  walletList: any;
  childAccounts: any;
  current: any;
  createWalletList: any;
  setWallets: any;
  currentNetwork: string;
  evmAddress: string;
}


const MenuDrawer = (props: MenuDrawerProps) => {


  const usewallet = useWallet();
  const history = useHistory();
  const classes = useStyles();

  function formatString(str: string): string {
    if (!str || str.length < 16) return str; // Check if string is too short
    return `0x${str.substring(0, 6)}...${str.substring(str.length - 10)}`;
  }

  interface EvmADDComponentProps {
    myString: string;
  }

  const EvmADDComponent: React.FC<EvmADDComponentProps> = ({ myString }) => {
    const formattedString = formatString(myString);

    return (
      <Typography
        sx={{
          color: '#808080',
          fontWeight: '400',
          fontSize: '12px',
          marginTop: '4px'
        }}
      >
        {formattedString}
      </Typography>
    );
  }

  const gradientStyle: React.CSSProperties = {
    background: 'linear-gradient(92deg, #00EF8B 63.42%, #627EEA 91.99%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline',
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: 600,
    letterSpacing: "0.1px"
  };

  const goEnable = async () => {
    props.toggleDrawer();
    history.push('/dashboard/enable');
  };



  return (
    <Drawer
      open={props.drawer}
      onClose={props.toggleDrawer}
      className={classes.menuDrawer}
      classes={{ paper: classes.paper }}
      PaperProps={{ sx: { width: '75%' } }}
    >
      <List sx={{ backgroundColor: '#282828', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {props.userInfo &&
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <ListItemIcon>
                <img src={props.userInfo!.avatar} width="48px" />
              </ListItemIcon>
              <ListItemText primary={props.userInfo!.username} />
            </Box>
          }
          <Box sx={{ paddingTop: '4px', px: '2px' }}>
            {props.otherAccounts && props.otherAccounts.map((account, index) => (
              <IconButton key={index} edge="end" aria-label="account" onClick={() => props.switchAccount(account)}>
                <img src={account.avatar} alt={`Avatar of ${account.username}`} style={{ display: 'inline-block', width: '20px' }} />
              </IconButton>
            ))}
            <IconButton edge="end" aria-label="close" onClick={props.togglePop}>
              <img style={{ display: 'inline-block', width: '24px' }} src={sideMore} />
            </IconButton>
          </Box>
        </ListItem>
        <Box sx={{ px: '16px' }}>
          <Divider sx={{ my: '10px', mx: '0px' }} variant="middle" color="#4C4C4C" />
        </Box>
        {props.walletList.length > 0 && props.walletList.map(props.createWalletList)}

        {props.evmAddress ?
          <Box
            sx={{ display: 'flex', justifyCOntent: 'space-between', padding: '16px' }}
            onClick={() => props.setWallets({
              name: 'evm',
              address: props.evmAddress,
              chain_id: props.currentNetwork,
              coins: ['flow'],
              id: 1
            }, 'evm')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMedia sx={{ margin: '0 auto', width: '32px', height: '32px', display: 'block', marginRight: '12px' }} image={evmlogo} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alginItems: 'center' }}>
                <Typography
                  variant="body1"
                  component="span"
                  color="#FFF"
                  fontSize={'12px'}
                >
                  Flow EVM Wallet
                </Typography>

                <Typography
                  variant="body1"
                  component="span"
                  color="#FFF"
                  fontSize={'9px'}
                  sx={{
                    backgroundColor: '#627EEA',
                    padding: '0 8px',
                    borderRadius: '18px',
                    textAlign: 'center',
                    marginLeft: '8px',
                    lineHeight: '19px'
                  }}
                >
                  EVM
                </Typography>
              </Box>
              <EvmADDComponent myString={props.evmAddress} />
            </Box>
          </Box>
          :
          <Box sx={{ display: 'flex', justifyCOntent: 'space-between', padding: '16px' }} >
            <Box
              sx={{
                borderRadius: '12px',
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0, 0, 0, 0.30)',
                padding: '16px',
                ':hover': {
                  opacity: 0.8
                }
              }}
              onClick={goEnable}
            >
              <Box>
                <Typography
                  sx={{
                    color: " #FFF",
                    fontSize: "12px",
                    fontStyle: "normal",
                    fontWeight: 600,
                    letterSpacing: "0.1px"
                  }}
                >
                  Enable the path to  <Typography style={gradientStyle}>FlowEVM</Typography> !
                </Typography>
                <Typography
                  sx={{
                    color: " rgba(255, 255, 255, 0.80)",
                    fontSize: "10px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    letterSpacing: "0.1px"
                  }}
                >
                  Manage multi-VM assets seamlessly.
                </Typography>
              </Box>
              <CardMedia sx={{ width: '20px', height: '20px', display: 'block', marginLeft: '6px' }} image={rightarrow} />
            </Box>
          </Box>
        }

        {Object.keys(props.childAccounts).map((key) => (
          <ListItem
            key={key}
            disablePadding
            sx={{ mb: 0, paddingX: '20px' }}
            onClick={() => props.setWallets({
              name: props.childAccounts[key]?.name ?? key,
              address: key,
              chain_id: props.currentNetwork,
              coins: ['flow'],
              id: 1
            }, key)}
          >
            <ListItemButton className={props.current['address'] === key ? classes.active : ''} sx={{ mb: 0 }}>
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
                  src={props.childAccounts[key]?.thumbnail?.url ?? 'https://lilico.app/placeholder-2.0.png'}
                  alt={props.childAccounts[key]?.name ?? chrome.i18n.getMessage('Linked_Account')}
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
                    {props.childAccounts[key]?.name ?? key}
                  </Typography>
                }
              />
              {props.current['address'] === key &&
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
        {/* <ListItem disablePadding>
          <ListItemButton onClick={() => setAlertOpen(true)}>
            <ListItemIcon
              sx={{
                width: '24px',
                minWidth: '24px',
                marginRight: '12px',
              }}
            >
              <AddIcon style={{
                marginLeft: '4px',
              }} />
            </ListItemIcon>
            <ListItemText primary={chrome.i18n.getMessage('Import__Wallet')} />
          </ListItemButton>
        </ListItem> */}
        {/* <ListItem disablePadding>
          <ListItemButton component="a" href="/">
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Import wallet" />
          </ListItemButton>
        </ListItem> */}
        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex',
            paddingLeft: '16px',
            marginTop: 'auto',
            marginBottom: '30px'
          }}
        >
          <ListItem disablePadding onClick={async () => {
            await usewallet.lockAdd();
            // history.push('/add');
          }}>
            <ListItemButton sx={{ padding: '8px', margin: '0', borderRadius: '5px' }}>
              <ListItemIcon
                sx={{
                  width: '24px',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={popAdd} />
              </ListItemIcon>
              <Typography
                variant="body1"
                component="div"
                display="inline"
                color='text'
                sx={{ fontSize: '12px' }}
              >
                {chrome.i18n.getMessage('Add_account')}
              </Typography>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ marginTop: '16px' }} disablePadding onClick={async () => {
            await usewallet.lockWallet();
            history.push('/unlock');
          }}>
            <ListItemButton sx={{ padding: '8px', margin: '0', borderRadius: '5px' }}>
              <ListItemIcon
                sx={{
                  width: '24px',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={popLock} />
              </ListItemIcon>
              <Typography
                variant="body1"
                component="div"
                display="inline"
                color='text'
                sx={{ fontSize: '12px' }}
              >
                {chrome.i18n.getMessage('Lock__Wallet')}
              </Typography>
            </ListItemButton>
          </ListItem>
        </Box>
      </List>
    </Drawer>
  );
}


export default MenuDrawer;