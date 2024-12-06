import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import {
  Typography,
  List,
  ListItemText,
  ListItemIcon,
  ListItem,
  ListItemButton,
  Divider,
  CardMedia,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useWallet } from '@/ui/utils';
import Device from 'ui/FRWAssets/svg/device.svg';
import IconLink from 'ui/FRWAssets/svg/Iconlink.svg';

import IconAbout from '../../../components/iconfont/IconAbout';
import IconAccount from '../../../components/iconfont/IconAccount';
import IconAddressbook from '../../../components/iconfont/IconAddressbook';
import IconEnd from '../../../components/iconfont/IconAVector11Stroke';
import IconBackup from '../../../components/iconfont/IconBackup';
import IconDeveloper from '../../../components/iconfont/IconDeveloper';
import IconWallet from '../../../components/iconfont/IconWallet';

// Feature flags
const SHOW_DEVICES = false;

// Styles
const useStyles = makeStyles(() => ({
  listDiv: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  listItem: {
    height: '66px',
    width: '100%',
    overflow: 'hidden',
    '&:hover': {
      backgroundColor: '#282828',
    },
  },
  itemButton: {
    width: '90%',
    height: '100%',
    overflow: 'hidden',
    margin: '0 auto',
    '&:hover': {
      backgroundColor: '#282828',
    },
  },
  list: {
    width: '90%',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#282828',
    '&:hover': {
      backgroundColor: '#282828',
    },
  },
  listIcon: {
    minWidth: '25px',
  },
  icon: {
    color: '#59A1DB',
    width: '14px',
    height: '14px',
    marginRight: '16px',
  },
  iconOthers: {
    color: '#59A1DB',
    width: '16px',
    height: '16px',
    marginRight: '14px',
  },
}));

const SettingTab = () => {
  const classes = useStyles();
  const usewallet = useWallet();
  const [isActive, setIsActive] = useState(false);
  const [isKeyphrase, setIsKeyphrase] = useState(false);

  const checkIsActive = useCallback(async () => {
    // setSending(true);
    const activeChild = await usewallet.getActiveWallet();
    if (activeChild) {
      setIsActive(activeChild);
    }
    const keyrings = await usewallet.checkMnemonics();
    await setIsKeyphrase(keyrings);
  }, [usewallet]);

  useEffect(() => {
    checkIsActive();
  }, [checkIsActive]);

  return (
    <div className="page">
      <Typography component="div" variant="h5" sx={{ padding: '18px', textAlign: 'center' }}>
        {chrome.i18n.getMessage('Settings')}
      </Typography>
      <div className={classes.listDiv}>
        <List className={classes.list} sx={{ margin: '8px auto 16px auto', pt: 0, pb: 0 }}>
          <ListItem
            button
            component={Link}
            to="/dashboard/setting/account"
            disablePadding
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                <IconAccount className={classes.icon} color="#59A1DB" />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('Profile')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                <IconEnd size={12} />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
        <List className={classes.list} sx={{ margin: '8px auto 16px auto', pt: 0, pb: 0 }}>
          <ListItem
            button
            component={Link}
            to="/dashboard/setting/wallet"
            disablePadding
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                <IconWallet className={classes.icon} color="#59A1DB" />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('Acc__list')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                <IconEnd size={12} />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <Divider sx={{ width: '90%' }} variant="middle" />

          <ListItem
            button
            component={Link}
            to="/dashboard/setting/addressbook"
            disablePadding
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                <IconAddressbook className={classes.icon} color="#59A1DB" />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('Address__Book')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                <IconEnd size={12} />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <Divider sx={{ width: '90%' }} variant="middle" />
          {!isActive && (
            <ListItem
              button
              component={Link}
              to="/dashboard/setting/linked"
              disablePadding
              className={classes.listItem}
            >
              <ListItemButton className={classes.itemButton}>
                <ListItemIcon sx={{ minWidth: '25px' }}>
                  <CardMedia
                    className={classes.icon}
                    sx={{ height: '16px', width: '16px' }}
                    image={IconLink}
                  />
                </ListItemIcon>
                <ListItemText primary={chrome.i18n.getMessage('Linked_Account')} />
                <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                  <IconEnd size={12} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          )}

          {!isActive && <Divider sx={{ width: '90%' }} variant="middle" />}
          {isKeyphrase && (
            <ListItem
              button
              component={Link}
              to="/dashboard/setting/backups"
              disablePadding
              className={classes.listItem}
            >
              <ListItemButton className={classes.itemButton}>
                <ListItemIcon sx={{ minWidth: '25px' }}>
                  <IconBackup className={classes.iconOthers} color="#59A1DB" />
                </ListItemIcon>
                <ListItemText primary={chrome.i18n.getMessage('Backup')} />
                <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                  <IconEnd size={12} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <List className={classes.list} sx={{ margin: '8px auto 18px auto', pt: 0, pb: 0 }}>
          <ListItem
            // button
            // component={Link}
            // to="https://lilico.app"
            disablePadding
            onClick={() => window.open('https://core.flow.com')}
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                <PhoneIphoneIcon className={classes.iconOthers} style={{ color: '#59A1DB' }} />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('Try_Our_Mobile_APP')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px', spacing: '8px' }}>
                {/* <IconEnd size={12} /> */}
                <IconButton
                  onClick={() =>
                    window.open(
                      'https://apps.apple.com/ca/app/flow-wallet-nfts-and-crypto/id6478996750'
                    )
                  }
                >
                  <AppleIcon fontSize="small" color="disabled" />
                </IconButton>
                <IconButton
                  onClick={() =>
                    window.open(
                      'https://play.google.com/store/apps/details?id=com.flowfoundation.wallet'
                    )
                  }
                >
                  <AndroidIcon fontSize="small" color="disabled" />
                </IconButton>
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <Divider sx={{ width: '90%' }} variant="middle" />

          <ListItem
            button
            component={Link}
            to="/dashboard/setting/developerMode"
            disablePadding
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                {/* <IconSecurity className={classes.iconOthers} color='#59A1DB' /> */}
                <IconDeveloper className={classes.iconOthers} color="#59A1DB" />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('Developer__Mode')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                <IconEnd size={12} />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <Divider sx={{ width: '90%' }} variant="middle" />

          {SHOW_DEVICES && (
            <>
              <ListItem
                button
                component={Link}
                to="/dashboard/setting/devices"
                disablePadding
                className={classes.listItem}
              >
                <ListItemButton className={classes.itemButton}>
                  <ListItemIcon sx={{ minWidth: '25px' }}>
                    <CardMedia
                      className={classes.icon}
                      sx={{ height: '16px', width: '19px', marginRight: '13px' }}
                      image={Device}
                    />
                  </ListItemIcon>
                  <ListItemText primary={chrome.i18n.getMessage('Devices')} />
                  <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                    <IconEnd size={12} />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>

              <Divider sx={{ width: '90%' }} variant="middle" />
            </>
          )}

          <ListItem
            button
            component={Link}
            to="/dashboard/setting/about"
            disablePadding
            className={classes.listItem}
          >
            <ListItemButton className={classes.itemButton}>
              <ListItemIcon sx={{ minWidth: '25px' }}>
                <IconAbout className={classes.iconOthers} color="#59A1DB" />
              </ListItemIcon>
              <ListItemText primary={chrome.i18n.getMessage('About')} />
              <ListItemIcon aria-label="end" sx={{ minWidth: '15px' }}>
                <IconEnd size={12} />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </div>
  );
};

export default SettingTab;
