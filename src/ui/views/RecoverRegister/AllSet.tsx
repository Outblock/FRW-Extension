import React from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { Button, Typography, CardMedia, CssBaseline } from '@mui/material';
import theme from '../../style/LLTheme';
import AllSetIcon from 'ui/FRWAssets/svg/allset.svg';

const AllSet = ({ handleClick }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="registerBox">
        <CardMedia
          sx={{
            margin: '0 auto',
            width: '172px',
            height: '172px',
            display: 'block',
          }}
          image={AllSetIcon}
        />
        :
        <Typography variant="h4">
          {chrome.i18n.getMessage('You__are') + ' '}
          <Box display="inline" color="primary.main">
            {chrome.i18n.getMessage('all__set')}
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Start__exploring__with__Lilico__now')}
        </Typography>
        {/* <Box sx={{ flexGrow: 1 }} /> */}
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
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold' }}
            color="background.paper"
          >
            {chrome.i18n.getMessage('Launch__My__Wallet')}
          </Typography>
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default AllSet;
