import React from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { Button } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import theme from '../../style/LLTheme';

const RegisterHeader = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          px: '32px',
          pt: '40px',
        }}
      >
        <Button
          variant="text"
          sx={{
            color: '#F9F9F9',
            backgroundColor: '#404040',
            px: '16px',
            py: '8px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            ':hover': {
              bgcolor: '#6E6E6E',
            },
          }}
          startIcon={<PhoneAndroidRoundedIcon sx={{ color: '#5e5e5e' }} />}
        >
          {chrome.i18n.getMessage('Try__Our__New__App')}
        </Button>

        <div style={{ flexGrow: 1 }}></div>

        <Button
          variant="text"
          sx={{
            color: '#F9F9F9',
            backgroundColor: '#404040',
            px: '16px',
            py: '8px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            ':hover': {
              bgcolor: '#6E6E6E',
            },
          }}
          startIcon={<HelpOutlineRoundedIcon sx={{ color: '#5e5e5e' }} />}
        >
          {chrome.i18n.getMessage('Need__Help')}
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default RegisterHeader;
