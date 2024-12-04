import {
  Box,
  Typography,
  Avatar,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState, useEffect, useCallback } from 'react';

import { isValidEthereumAddress } from '@/shared/utils/address';
import { useWallet, isEmoji, formatAddress } from 'ui/utils';

const tempEmoji = {
  emoji: '🥥',
  name: 'Coconut',
  bgcolor: '#FFE4C4',
};

export const FWMoveDropdown = ({
  contact,
  contacts,
  setSelectedChildAccount,
  isLoading = false,
}) => {
  const usewallet = useWallet();
  const [emoji, setEmoji] = useState(tempEmoji);

  const contactKeys = Object.keys(contacts);
  const [selectedChild, setSelectedChild] = React.useState(
    contactKeys.length > 0 ? contactKeys[0] : ''
  );

  useEffect(() => {
    if (selectedChild) {
      const select = contacts[selectedChild];
      select['address'] = selectedChild;
      setSelectedChildAccount(select);
    }
  }, [selectedChild, contacts, setSelectedChildAccount]);

  const handleChange = (event) => {
    const selectedAddress = event.target.value;
    setSelectedChild(selectedAddress);
    const select = contacts[selectedChild];
    select['address'] = selectedChild;
    setSelectedChildAccount(select);
  };

  const getEmoji = useCallback(async () => {
    const emojiList = await usewallet.getEmoji();
    if (isValidEthereumAddress(contact.address)) {
      setEmoji(emojiList[1]);
    } else {
      setEmoji(emojiList[0]);
    }
  }, [contact, usewallet]);

  useEffect(() => {
    console.log('contact ', contacts);
    getEmoji();
  }, [contact, contacts, getEmoji]);

  return (
    <>
      <FormControl sx={{ flexGrow: 1, border: 'none', padding: 0 }}>
        <Select
          labelId="child-wallet-select-label"
          value={selectedChild}
          onChange={handleChange}
          disableUnderline
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              border: 'none',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            height: '100%',
          }}
        >
          {Object.keys(contacts).map((address) => (
            <MenuItem key={address} value={address}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Box sx={{ display: 'flex' }}>
                  {isEmoji(contacts[address].thumbnail.url) ? (
                    <Typography
                      sx={{
                        mr: '4px',
                        color: 'primary.main',
                        backgroundColor: '#484848',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontSize: '32px', // Adjust font size to fit within the box
                      }}
                    >
                      {contacts[address].thumbnail.url}
                    </Typography>
                  ) : (
                    <Avatar
                      src={contacts[address].thumbnail.url}
                      sx={{
                        height: '32px',
                        width: '32px',
                        borderRadius: '32px',
                        marginRight: '4px',
                      }}
                    />
                  )}
                </Box>

                <Typography
                  sx={{ textAlign: 'start', color: '#FFFFFF', fontSize: '14px', fontWeight: '600' }}
                >
                  {contacts[address].name}
                </Typography>
                <Typography
                  sx={{ lineHeight: '1', textAlign: 'start', fontSize: '10px', fontWeight: '400' }}
                  color="#FFFFFFCC"
                >
                  {formatAddress(address)}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
