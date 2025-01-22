import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import { AppBar, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect } from 'react';

import { useWallet } from 'ui/utils';

import IconNfts from '../../../components/iconfont/IconNfts';
import IconWallet from '../../../components/iconfont/IconWallet';

// import { useWallet } from 'ui/utils';

const NavBar = ({ value, setValue }) => {
  const wallet = useWallet();

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchStuff = async () => {
      const dashIndex = await wallet.getDashIndex();
      if (isMounted) {
        setValue(dashIndex);
      }
    };
    fetchStuff();
    return () => {
      isMounted = false;
    };
  }, [setValue, wallet]);

  const colors = ['#41CC5D', '#FFDD32', '#60C293', '#59A1DB'];

  return (
    <AppBar position="relative">
      <Tabs
        value={value}
        onChange={handleChange}
        TabIndicatorProps={{
          style: {
            top: 0,
            backgroundColor: colors[value],
          },
        }}
        indicatorColor="primary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="tabs"
        sx={{ backgroundColor: '#282828' }}
      >
        <Tab
          icon={<IconWallet fontSize="small" />}
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
    </AppBar>
  );
};

export default NavBar;
