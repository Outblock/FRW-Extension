import React from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { Typography, Button, CssBaseline } from '@mui/material';
import theme from '../../style/LLTheme';
import RegisterHeader from '../Register/RegisterHeader';
import Bitcoin3D from '../../FRWAssets/image/Bitcoin3D.png';
import { Link } from 'react-router-dom';
import IconFlow from '../../../components/iconfont/IconFlow';

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
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              px: '60px',
              marginBottom: '70px',
              marginTop: '35px',
            }}
          >
            <img
              src={Bitcoin3D}
              style={{
                objectFit: 'contain',
                width: '220px',
                position: 'relative',
                left: '-20px',
              }}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '20px',
                gap: '10px',
                marginLeft:'15px'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '36px',
                  background:
                    '-webkit-linear-gradient(135deg, #41CC5D  0%, #1CEB8A 100%)',
                  WebkitBackgroundClip: 'text',
                  textTransform: 'uppercase',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {chrome.i18n.getMessage('Welcome_to_lilico')}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', pt: '16px', fontSize: '16px', }}
              >
                {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
                A crypto wallet on Flow built for
                <Typography sx={{ color: 'primary.main', display: 'inline' }}>
                  <span style={{ fontWeight: 600 }}> Explorers, Collectors</span> and
                  <span style={{ fontWeight: 600 }}> Gamers</span>
                </Typography>

              </Typography>
            </Box>
          </Box>

          {/* <Box sx={{ flexGrow: 1 }} /> */}

          <Box
            sx={{
              display: 'flex',
              px: '40px',
              pb: '40px',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/import"
              size="large"
              sx={{
                display: 'flex',
                flexGrow: 1,
                height: '64px',
                borderRadius: '12px',
                textTransform: 'capitalize',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: '600', fontSize: '20px' }}
                color="background.paper"
              >
                {chrome.i18n.getMessage('Import_your_wallet')}
              </Typography>
            </Button>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/register"
              size="large"
              sx={{
                display: 'flex',
                flexGrow: 1,
                height: '64px',
                borderRadius: '12px',
                textTransform: 'capitalize',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: '600', fontSize: '20px' }}
                color="primary.contrastText"
              >
                {chrome.i18n.getMessage('Create_a_new_wallet')}
              </Typography>
            </Button>
          </Box>
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
          startIcon={
            <QrCodeScannerRoundedIcon sx={{ color: 'primary.main' }} />
          }
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
