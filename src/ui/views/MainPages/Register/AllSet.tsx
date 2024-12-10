import { Button, Typography, CardMedia } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useEffect } from 'react';

import AllSetIcon from 'ui/FRWAssets/svg/allset.svg';
import { useWallet, mixpanelBrowserService } from 'ui/utils';

const AllSet = ({ handleClick }) => {
  const wallet = useWallet();

  const loadScript = useCallback(async () => {
    await wallet.getCadenceScripts();
  }, [wallet]);

  const trackAccountRecovered = useCallback(async () => {
    // I'm not sure if this is the best way to track this event
    // It's hard to know at which point the user recovers the account
    mixpanelBrowserService.track('account_recovered', {
      address: (await wallet.getMainAddress()) || '',
      mechanism: 'multi-backup',
      methods: [],
    });
  }, [wallet]);

  useEffect(() => {
    loadScript().then(() => {
      trackAccountRecovered();
    });
  }, [loadScript, trackAccountRecovered]);

  return (
    <>
      <Box className="registerBox">
        <CardMedia
          sx={{ margin: '0 auto', width: '172px', height: '172px', display: 'block' }}
          image={AllSetIcon}
        />
        <Typography variant="h4">
          {chrome.i18n.getMessage('You__are')}
          <Box display="inline" color="primary.main">
            {chrome.i18n.getMessage('Allset')}
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('You_can_start_experiencing_Lilico_now')}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={handleClick}
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            height: '56px',
            // marginTop:'40px',
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
