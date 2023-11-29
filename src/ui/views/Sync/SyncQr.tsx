import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, ThemeProvider } from '@mui/system';
import {
  Button,
  Typography,
  FormControl,
  Input,
  InputAdornment,
  CssBaseline,
} from '@mui/material';
import CancelIcon from '../../../components/iconfont/IconClose';
import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import theme from '../../style/LLTheme';
import EmailIcon from '../../assets/alternate-email.svg';
import { Presets } from 'react-component-transition';
import { useWallet } from 'ui/utils';
import { CircularProgress, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Core } from '@walletconnect/core';
import { Web3Wallet, IWeb3Wallet } from '@walletconnect/web3wallet';
import QRCode from "react-qr-code";


const useStyles = makeStyles((theme) => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    height: '64px',
    padding: '16px',
    zIndex: '999',
    backgroundColor: '#282828',
    border: '2px solid #4C4C4C',
    borderRadius: '12px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '2px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
}));


const SyncQr = ({ handleClick, savedUsername, getUsername }) => {
  const classes = useStyles();
  const [Uri, setUri] = useState('');
  const [pairUri, setPairUri] = useState('');
  const [web3wallet, setWeb3Wallet] = useState<any>(null);

  useEffect(() => {
    const createWeb3Wallet = async () => {
      try {
        const wallet = await Web3Wallet.init({
          core: new Core({
            projectId: '29b38ec12be4bd19bf03d7ccef29aaa6',
          }),
          metadata: {
            name: 'Flow Reference Walllet',
            description: 'Digital wallet created for everyone.',
            url: 'https://fcw-link.lilico.app',
            icons: ['https://fcw-link.lilico.app/logo.png']
          },
        });
        console.log('web3walletadress', wallet);
        const { topic, uri } = await wallet.core.pairing.create();
        console.log('uri', uri);
        setWeb3Wallet(wallet);
        setUri(uri);
      } catch (e) {
        console.error(e);
      }
    };
    createWeb3Wallet();
  }, []);

  const handleFilterAndSearch = async (e) => {
    const keyword = e.target.value;
    console.log('keyword', keyword);

    if (web3wallet) {
      const pairResponse = await web3wallet.core.pairing.pair({ uri: keyword });
      console.log('pairResponse', pairResponse);
    } else {
      console.log('Web3Wallet is not initialized');
    }
  };







  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'absolute',
          left: '-95px',
          top: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          width: '700px'

        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px',
            width: '353px',
          }}
        >

          <Typography
            variant="h4"
            sx={{
              fontWeight: '700',
              fontSize: '40px',
              WebkitBackgroundClip: 'text',
              color: '#fff',
              lineHeight: '56px'
            }}
          >
            Sync <span style={{ display: 'inline-block', width: '353px' }}>
              Flow Reference</span>
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'primary.light', pt: '16px', fontSize: '16px', margin: '24px 0 32px' }}
          >
            {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
            Open your Flow Reference on Mobile app and Scan the QR Code to Sync your Wallet.
          </Typography>


          <Typography
            variant="body1"
            sx={{ color: '#8C9BAB', pt: '12px', fontSize: '12px' }}
          >
            {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
            Note: Your recovery phrase will go through Flow Reference's server. It is end-to-end encrypted and we can never read it.
          </Typography>
        </Box>
        <Box
          sx={{
            padding: '0 60px 0 70px',
            borderRadius: '24px'
          }}
        >
          {Uri &&
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%", borderRadius: '24px' }}
              value={Uri}
              viewBox={`0 0 256 256`}
            />
          }
          <Box>
            <Input
              type="search"
              className={classes.inputBox}
              placeholder={'Pair wc uri'}
              autoFocus
              disableUnderline
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon
                    color="primary"
                    sx={{ ml: '10px', my: '5px', fontSize: '24px' }}
                  />
                </InputAdornment>
              }
              onChange={handleFilterAndSearch}
            />
          </Box>
        </Box>
      </Box>


      {/* <Box sx={{ flexGrow: 1 }} /> */}

    </ThemeProvider>
  );
};

export default SyncQr;
