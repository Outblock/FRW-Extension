import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, CardMedia, Skeleton } from '@mui/material';
import { useWallet, formatAddress, isEmoji } from 'ui/utils';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../style/LLTheme';
import { makeStyles } from '@mui/styles';
import closex from 'ui/assets/closex.svg';
import { useHistory } from 'react-router-dom';

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

export const LLContactCard = ({ contact, hideCloseButton, isSend = false, isLoading = false }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const history = useHistory();
  const [contactAdd, setContactAdd] = useState(false);

  const getName = (name: string) => {
    console.log('contact ', contact);
    if (name.startsWith('0')) {
      return '0x';
    } else if (name.length > 0) {
      return name[0].toUpperCase();
    } else {
      return '0x';
    }
  };

  const addAddressBook = async (contact) => {
    if (!contact.domain.value) {
      wallet.openapi
        .addAddressBook(contact.contact_name, contact.address, contact.contact_name)
        .then((response) => {
          if (response.status === 200) {
            setContactAdd(true);
            wallet.refreshAddressBook();
          }
        });
    } else {
      wallet.openapi
        .addExternalAddressBook(
          contact.domain.value,
          contact.address,
          contact.domain.value,
          contact.domain.domain_type
        )
        .then((response) => {
          if (response.status === 200) {
            setContactAdd(true);
            wallet.refreshAddressBook();
          }
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          // border: '1px solid #4C4C4C',
          // borderRadius: '8px',
          px: '18px',
          py: '8px',
          // borderRadius: '16px',
          alignItems: 'center',
          ':hover': {
            backgroundColor: 'neutral.main',
          },
        }}
      >
        {!isLoading ? (
          isEmoji(contact.avatar) ? (
            <Typography
              sx={{
                mr: '13px',
                color: 'primary.main',
                backgroundColor: '#484848',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '24px', // Adjust font size to fit within the box
              }}
            >
              {contact.avatar}
            </Typography>
          ) : (
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
          )
        ) : (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {!isLoading ? (
            <Typography variant="body1" sx={{ textAlign: 'start' }}>
              {contact.domain?.value || formatAddress(contact.contact_name)}{' '}
              {contact.usernam && contact.usernam !== '' && (
                <Box display="inline" color="info.main">
                  {contact.username !== '' ? ' (@' + contact.username + ')' : ''}
                </Box>
              )}
            </Typography>
          ) : (
            <Skeleton variant="text" width={45} height={15} />
          )}
          {!isLoading ? (
            <Typography
              variant="overline"
              sx={{ lineHeight: '1', textAlign: 'start' }}
              color="text.secondary"
            >
              {formatAddress(contact.address)}
            </Typography>
          ) : (
            <Skeleton variant="text" width={45} height={15} />
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {isSend ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              history.push('/dashboard/wallet/send');
            }}
          >
            <CardMedia sx={{ width: '11px', height: '11px' }} image={closex} />
          </IconButton>
        ) : contact.type === 4 && !contactAdd ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              addAddressBook(contact);
            }}
          >
            <PersonAddAltIcon color="info" />
          </IconButton>
        ) : (
          <div />
        )}
      </Box>
    </ThemeProvider>
  );
};
