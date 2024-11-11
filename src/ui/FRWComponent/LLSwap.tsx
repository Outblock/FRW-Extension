import React from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../style/LLTheme';
import { makeStyles } from '@mui/styles';

export const LLSwap = ({ token, amount, isLoading = false }) => {


  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: '0',
          py: '8px',
          alignItems: 'center',
          justifyContent:'space-between',
        }}
      >
        {!isLoading ?
        
          <Avatar
            alt={token.contract_name}
            src={token.icon}
            sx={{
              mr: '0',
              marginBottom:'8px',
              color: '#fff',
              backgroundColor: '#484848',
              width: '40px',
              height: '40px',
            }}
          >
            {token.contract_name}
          </Avatar>
          : (
            <Skeleton variant="circular" width={40} height={40} />
          )
        }
        {!isLoading?
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Box display="inline" color="#fff">
              {amount + ' ' + token.symbol}
            </Box>
          </Typography>: (
            <Skeleton variant="text" width={45} height={15} />
          )}
        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
};
