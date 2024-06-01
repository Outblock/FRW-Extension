import React from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../style/LLTheme';
import { makeStyles } from '@mui/styles';
import { formatAddress } from 'ui/utils';
import { isValidEthereumAddress } from 'ui/utils/address';

const useStyles = makeStyles(() => ({
  ContactCardAvatar: {
    mr: '13px',
    color: 'primary.main',
    backgroundColor: 'neutral.main',
  },
  ContactCardContainer: {
    display: 'flex',
    // border: '1px solid #4C4C4C',
    // borderRadius: '8px',
    // padding: ''
    alignItems: 'center',
    px: '18px',
  },
}));

export const FRWProfileCard = ({ contact, isEvm = false, isLoading = false }) => {


  const getName = (name: string) => {
    if (!name) {
      return '0x'
    }
    if (name.startsWith('0')) {
      return '0x'
    } else {
      return name[0].toUpperCase()
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          padding: '16px',
          alignItems: 'center',
          borderRadius: '16px',
          backgroundColor: '#2C2C2C',
          width: '100%'
        }}
      >
        {!isLoading ?

          <Avatar
            alt={contact.contact_name}
            src={contact.avatar}
            sx={{
              mr: '13px',
              color: 'primary.main',
              backgroundColor: '#484848',
              width: '40px',
              height: '40px',
            }}
          >
            {getName(contact.contact_name)}
          </Avatar>
          : (
            <Skeleton variant="circular" width={40} height={40} />
          )
        }
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {!isLoading ?
            <Typography sx={{ textAlign: 'start', color: '#FFFFFF', fontSize: '12px' }}>
              {contact.domain?.value || formatAddress(contact.contact_name)}{' '}
              {contact.username && contact.username !== '' && (
                <Box display="inline" color="info.main">
                  {contact.username !== '' ? ' (@' + contact.username + ')' : ''}
                </Box>
              )}
              {isValidEthereumAddress(contact.address) &&
                <Typography
                  variant="body1"
                  component="span"
                  color="#FFF"
                  fontSize={'9px'}
                  sx={{
                    backgroundColor: '#7986CC',
                    padding: '0 8px',
                    borderRadius: '18px',
                    textAlign: 'center',
                    marginLeft: '8px',
                    lineHeight: '16px',
                    height: '16px',
                    display: 'inline-block'
                  }}
                >
                  EVM
                </Typography>
              }
            </Typography> : (
              <Skeleton variant="text" width={45} height={15} />
            )}
          {!isLoading ?
            <Typography
              sx={{ lineHeight: '1', textAlign: 'start', fontSize: '12px', fontWeight: '400' }}
              color="#FFFFFFCC"
            >
              {`${formatAddress(contact.address)}`}
            </Typography>
            : (
              <Skeleton variant="text" width={45} height={15} />
            )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
};
