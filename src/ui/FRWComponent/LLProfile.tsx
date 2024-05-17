import React from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../style/LLTheme';
import { makeStyles } from '@mui/styles';
import { formatAddress } from 'ui/utils';

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

export const LLProfile = ({ contact, isLoading = false }) => {

  const DomainLogo = () => {
    if (contact.domain?.value === '') {
      return undefined;
    }
    switch (contact.domain?.domain_type) {
      case 0:
        return 'https://raw.githubusercontent.com/Outblock/Assets/main/dapp/find/logo.png';
      case 1:
        return 'https://raw.githubusercontent.com/Outblock/Assets/main/dapp/flowns/logo.png';
      case 2:
        return 'https://lilico.app/logo.png';
      default:
        return undefined;
    }
  };

  const getName = (name: string) => {
    if (!name) {
      return '0x'
    }
    if (name.startsWith('0')){
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
          flexDirection: 'column',
          px: '0',
          py: '8px',
          alignItems: 'center',
        }}
      >
        {!isLoading ?
        
          <Avatar
            alt={contact.contact_name}
            src={DomainLogo() || contact.avatar}
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
        {!isLoading?
          <Typography variant="body2" sx={{ textAlign: 'start' }}>
            {contact.domain?.value || formatAddress(contact.contact_name)}{' '}
            {contact.username && contact.username !== '' && (
              <Box display="inline" color="info.main">
                {contact.username !== '' ? ' (@' + contact.username + ')' : ''}
              </Box>
            )}
          </Typography>: (
            <Skeleton variant="text" width={45} height={15} />
          )}
        {!isLoading?
          <Typography
            variant="overline"
            sx={{ lineHeight: '1', textAlign: 'start' }}
            color="text.secondary"
          >
            {`${formatAddress(contact.address)}`}
          </Typography>
          : (
            <Skeleton variant="text" width={45} height={15} />
          )}
        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
};
