import React from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { Typography, Button, CssBaseline } from '@mui/material';
import theme from '../../style/LLTheme';
import RegisterHeader from '../Register/RegisterHeader';
import appicon from '../../FRWAssets/image/appicon.png';
import create from '../../FRWAssets/image/create.png';
import importPng from '../../FRWAssets/image/import.png';
import qr from '../../FRWAssets/image/scanIcon.png';
import { Link } from 'react-router-dom';
import IconFlow from '../../../components/iconfont/IconFlow';
import QRCode from 'react-qr-code';

const WelcomePage = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'info3.default',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <RegisterHeader />

        <Box sx={{ flexGrow: 1 }} />

        <Box
          className="welcomeBox"
          sx={{
            height: '460px',
            backgroundColor: 'transparent',
            marginBottom: '80px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              px: '60px',
              backgroundColor: '#222',
              height: '380px',
              width: '625px',
              position: 'relative',
              borderRadius: '24px'
            }}
          >
            <img
              src={appicon}
              style={{ borderRadius:'24px', margin: '0', width: '368px', position: 'absolute', right: '0px', top: '0px' }}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '20px',
                position: 'absolute',
                left: '-95px',
                top: '18px',
                width: '389px',
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
                {chrome.i18n.getMessage('Welcome_to_lilico')}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', pt: '16px', fontSize: '16px', margin: '24px 0 44px' }}
              >
                {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
                A crypto wallet on Flow built for
                <Typography sx={{ color: 'primary.light', display: 'inline' }}>
                  <span> Explorers, Collectors and Gamers</span>
                </Typography>

              </Typography>


              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/register"
                size="large"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '308px',
                  height: '48px',
                  borderRadius: '24px',
                  textTransform: 'capitalize',
                  marginBottom: '16px'
                }}
              >
                <img src={create} alt="Create Icon" style={{ marginRight: '8px', height: '18px' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: '600', fontSize: '14px' }}
                  color="primary.contrastText"
                >
                  {chrome.i18n.getMessage('Create_a_new_wallet')}
                </Typography>
              </Button>


              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/import"
                size="large"
                sx={{
                  display: 'flex',
                  width: '308px',
                  height: '48px',
                  borderRadius: '24px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'capitalize',
                  marginBottom: '16px',
                  border: '1px solid #E5E5E5',
                  backgroundColor: 'transparent'
                }}
              >
                <img src={importPng} alt="Create Icon" style={{ marginRight: '8px', height: '18px' }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#FFF',
                    '&:hover': {
                      color: 'background.paper'
                    }
                  }}
                >
                  {chrome.i18n.getMessage('Import_your_wallet')}
                </Typography>
              </Button>

              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/sync"
                size="large"
                sx={{
                  display: 'flex',
                  width: '308px',
                  height: '48px',
                  borderRadius: '24px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'capitalize',
                  border: '1px solid #E5E5E5',
                  marginBottom: '16px',
                  backgroundColor: 'transparent'
                }}
              >
                <img src={qr} alt="Create Icon" style={{ marginRight: '8px', height: '18px' }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#FFF',
                    '&:hover': {
                      color: 'background.paper'
                    }
                  }}
                >
                  Sync with Mobile App
                </Typography>
              </Button>

              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/addressimport"
                size="large"
                sx={{
                  display: 'flex',
                  width: '308px',
                  height: '48px',
                  borderRadius: '24px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'capitalize',
                  border: '1px solid #E5E5E5',
                  backgroundColor: 'transparent'
                }}
              >
                <img src={qr} alt="Create Icon" style={{ marginRight: '8px', height: '18px' }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#FFF',
                    '&:hover': {
                      color: 'background.paper'
                    }
                  }}
                >
                  Import
                </Typography>
              </Button>
            </Box>
          </Box>

          {/* <Box sx={{ flexGrow: 1 }} /> */}

        </Box>

        {/* <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            backgroundColor: 'background.paper',
            px: '24px',
            py: '18px',
            borderRadius: '12px',
            textTransform: 'none',
            mt: '36px',
            boxShadow: '0px 24px 24px rgba(0,0,0,0.36)',
          }}
          // startIcon={
          //   <QrCodeScannerRoundedIcon sx={{ color: 'primary.main' }} />
          // }
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'semi-bold' }}
            color="text.primary"
          >
            Scan QR code to Login
          </Typography>
        </Button> */}

        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
};

export default WelcomePage;
