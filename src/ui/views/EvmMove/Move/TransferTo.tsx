import React from 'react';
import {
  Box,
  Typography,
  CardMedia
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';


const TransferTo = ({ wallet, userInfo }) => {

  const formatWalletAddress = (address) => {
    if (address && address.length > 10) {
      return `0x${address.substring(0, 4)}...${address.substring(address.length - 6)}`;
    }
    return address;
  };

  return (
    <StyledEngineProvider injectFirst>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        zIndex: '10'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          px: '4px',
          backgroundColor: 'neutral.main',
          zIndex: 1000
        }}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Box>
              <CardMedia component="img" sx={{ marginRight: '12px', width: '40px', height: '40px' }} image={userInfo.avatar} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                  {userInfo.contact_name}
                </Typography>
                <Typography
                  variant="body1"
                  component="span"
                  color="#FFF"
                  fontSize={'9px'}
                  sx={{
                    backgroundColor: '#627EEA',
                    padding: '0 8px',
                    borderRadius: '18px',
                    textAlign: 'center',
                    marginLeft: '8px',
                    lineHeight: '19px'
                  }}
                >
                  EVM
                </Typography>
              </Box>

              <Typography sx={{ fontSize: '12px', fontWeight: '400' }}>{formatWalletAddress(wallet)}</Typography>
            </Box>

          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  );
};

export default TransferTo;
