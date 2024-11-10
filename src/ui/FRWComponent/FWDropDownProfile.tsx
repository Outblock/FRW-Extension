import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Skeleton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../style/LLTheme';
import { makeStyles } from '@mui/styles';
import { useWallet, isEmoji, formatAddress } from 'ui/utils';
import { isValidEthereumAddress } from 'ui/utils/address';


const tempEmoji = {
  "emoji": "🥥",
  "name": "Coconut",
  "bgcolor": "#FFE4C4"
};

export const FWDropDownProfile = ({ contact, contacts, setSelectedChildAccount, isLoading = false }) => {

  const usewallet = useWallet();
  const [emoji, setEmoji] = useState(tempEmoji);

  const contactKeys = Object.keys(contacts);
  const [selectedChild, setSelectedChild] = React.useState(contactKeys.length > 0 ? contactKeys[0] : '');

  useEffect(() => {
    if (selectedChild) {
      const select = contacts[selectedChild]
      select['address'] = selectedChild
      setSelectedChildAccount(select);
    }
  }, [selectedChild, contacts, setSelectedChildAccount]);

  const handleChange = (event) => {
    const selectedAddress = event.target.value;
    setSelectedChild(selectedAddress);
    const select = contacts[selectedChild]
    select['address'] = selectedChild
    setSelectedChildAccount(select);
  };


  const getEmoji = async () => {
    const emojiList = await usewallet.getEmoji();
    if (isValidEthereumAddress(contact.address)) {
      setEmoji(emojiList[1])
    } else {
      setEmoji(emojiList[0])
    }
  }


  useEffect(() => {
    getEmoji();
  }, [contact]);

  return (
    <ThemeProvider theme={theme}>
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
              border: 'none'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            }, height: '100%'
          }}
        >
          {Object.keys(contacts).map((address) => (
            <MenuItem key={address} value={address}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                <Box sx={{ display: 'flex', }}>
                  {isEmoji(contacts[address].thumbnail.url) ? (
                    <Typography
                      sx={{
                        mr: '4px',
                        color: 'primary.main',
                        backgroundColor: '#484848',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontSize: '20px', // Adjust font size to fit within the box
                      }}
                    >
                      {contacts[address].thumbnail.url}
                    </Typography>
                  ) : (
                    <Avatar src={contacts[address].thumbnail.url} sx={{ height: '20px', width: '20px', borderRadius: '20px', marginRight: '4px' }} />
                  )
                  }

                  <Typography sx={{ textAlign: 'start', color: '#FFFFFF', fontSize: '12px', fontWeight: '400' }}>
                    {contacts[address].name}
                  </Typography>
                </Box>
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
    </ThemeProvider>
  );
};
