import React, { useEffect, useState } from 'react';
import { Box } from '@mui/system';
import { useWallet } from 'ui/utils';
// import theme from '../../style/LLTheme';
import { Typography, ButtonBase, Grid, IconButton } from '@mui/material';
// import { initOnRamp } from '@coinbase/cbpay-js';
import { generateOnRampURL } from '@coinbase/cbpay-js';
// import { LLHeader } from '@/ui/FRWComponent';
// import Coinbase from '../../FRWAssets/svg/coinbasepay-txt.svg';
import CloseIcon from '@mui/icons-material/Close';
import MoonPay from '../../FRWAssets/svg/moonpay.svg';
import Coinbase from '../../FRWAssets/svg/coinbase-pay.svg';

const OnRampList = ({ close }) => {
  const wallet = useWallet();
  const [address, setAddress] = useState<string | null>(null);

  const loadAddress = async () => {
    const address = await wallet.getCurrentAddress();
    setAddress(address);
  };

  useEffect(() => {
    loadAddress();
  }, []);

  const loadMoonPay = async () => {
    if (!address) {
      return;
    }

    // If for only one currency
    // &currencyCode=Flow
    const url = `https://buy.moonpay.com?apiKey=pk_live_6YNhgtZH8nyxkJiQRZsotO69G2loIyv0&defaultCurrencyCode=FLOW&colorCode=%23FC814A&walletAddress=${address}`;
    const response = await wallet.openapi.getMoonpayURL(url);

    if (response?.data?.url) {
      await chrome.tabs.create({
        url: response?.data?.url,
      });
    }
  };

  const loadCoinbasePay = async () => {
    if (!address) {
      return;
    }

    const onRampURL = generateOnRampURL({
      appId: 'd22a56bd-68b7-4321-9b25-aa357fc7f9ce',
      destinationWallets: [{ address: address, blockchains: ['flow'] }],
    });

    if (onRampURL) {
      await chrome.tabs.create({
        url: onRampURL,
      });
    }
  };

  return (
    <Box>
      <Grid
        container
        sx={{
          justifyContent: 'start',
          alignItems: 'center',
          px: '8px',
        }}
      >
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
            {chrome.i18n.getMessage('Choose_provider')}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={close}>
            <CloseIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mx: '18px' }}>
        <ButtonBase
          sx={{ width: '100%', backgroundColor: '#242424', borderRadius: '12px', height: '80px' }}
          onClick={loadMoonPay}
        >
          <img src={MoonPay} style={{ height: '40px' }} />
        </ButtonBase>

        <ButtonBase
          sx={{ width: '100%', backgroundColor: '#0052FF', borderRadius: '8px', height: '80px' }}
          onClick={loadCoinbasePay}
        >
          <img src={Coinbase} style={{ height: '50px' }} />
        </ButtonBase>
      </Box>
    </Box>
  );
};

export default OnRampList;
