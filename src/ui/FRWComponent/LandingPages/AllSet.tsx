import { Button, Typography, CardMedia } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useEffect } from 'react';

import { storage } from 'background/webapi';
import AllSetIcon from 'ui/FRWAssets/svg/allset.svg';
import { useWallet, mixpanelBrowserService } from 'ui/utils';

interface AllSetProps {
  handleClick: () => void;
  variant?: 'register' | 'recover' | 'sync' | 'add';
}

const AllSet = ({ handleClick, variant = 'register' }: AllSetProps) => {
  const wallet = useWallet();

  const loadScript = useCallback(async () => {
    if (variant === 'register') {
      await wallet.getCadenceScripts();
    }
  }, [wallet, variant]);

  const trackAccountRecovered = useCallback(async () => {
    if (variant === 'register') {
      mixpanelBrowserService.track('account_recovered', {
        address: (await wallet.getMainAddress()) || '',
        mechanism: 'multi-backup',
        methods: [],
      });
    }
  }, [wallet, variant]);

  useEffect(() => {
    const removeTempPass = () => {
      if (variant === 'add') {
        storage.set('tempPassword', '');
      }
    };

    if (variant === 'register') {
      loadScript().then(() => {
        trackAccountRecovered();
      });
    } else if (variant === 'add') {
      removeTempPass();
    }
  }, [variant, loadScript, trackAccountRecovered]);

  const getMessage = () => {
    if (variant === 'recover') {
      return {
        title: chrome.i18n.getMessage('You__are') + ' ' + chrome.i18n.getMessage('all__set'),
        subtitle: chrome.i18n.getMessage('Start__exploring__with__Lilico__now'),
      };
    }
    return {
      title: chrome.i18n.getMessage('You__are') + chrome.i18n.getMessage('Allset'),
      subtitle: chrome.i18n.getMessage('You_can_start_experiencing_Lilico_now'),
    };
  };

  return (
    <>
      <Box className="registerBox">
        <CardMedia
          sx={{ margin: '0 auto', width: '172px', height: '172px', display: 'block' }}
          image={AllSetIcon}
        />
        <Typography variant="h4">
          {getMessage().title.split(' ')[0]}
          <Box display="inline" color="primary.main">
            {getMessage().title.split(' ')[1]}
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {getMessage().subtitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={handleClick}
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            height: '56px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            marginBottom: '8px',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Launch__My__Wallet')}
          </Typography>
        </Button>
      </Box>
    </>
  );
};

export default AllSet;