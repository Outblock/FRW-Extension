import { Button, Typography, CardMedia } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

import AllSetIcon from 'ui/FRWAssets/svg/allset.svg';

const AllSet = ({ handleClick }) => {
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
