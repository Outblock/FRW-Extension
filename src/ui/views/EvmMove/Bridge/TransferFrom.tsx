import React from 'react';
import {
  Box,
  Typography,
  CardMedia
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';


const TransferFrom = ({ wallet, userInfo }) => {

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
            <Box sx={{display:'flex',flexDirection:'column',padding:'16px 0'}}>
              <Typography sx={{fontSize:'14px',fontWeight:'600'}}>{userInfo.contact_name}</Typography>
              <Typography sx={{fontSize:'12px',fontWeight:'400'}}>{userInfo.address}</Typography>
            </Box>

          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  );
};

export default TransferFrom;
