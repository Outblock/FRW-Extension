import { Typography, FormControl, Input, Box } from '@mui/material';
import Slide from '@mui/material/Slide';
import React from 'react';

const PrivateKey = ({ helperText, msgBgColor, pk, setpk }) => {
  return (
    <Box sx={{ padding: '0' }}>
      <Typography variant="body1" color="text.secondary">
        {chrome.i18n.getMessage('This_is_the_private_key_you')}
      </Typography>
      <Box sx={{ flexGrow: 1, maxWidth: '100%', my: '16px', padding: '0' }}>
        <FormControl sx={{ width: '100%' }}>
          <Input
            id="textfield"
            placeholder={chrome.i18n.getMessage('Please_enter_your_private_key')}
            autoFocus
            fullWidth
            multiline
            minRows={3}
            disableUnderline
            value={pk}
            onChange={(event) => {
              setpk(event.target.value);
            }}
            sx={{
              height: '128px',
              padding: '16px',
              paddingTop: '0px',
              zIndex: '999',
              overflow: 'scroll',
              backgroundColor: '#282828',
              border: '2px solid #4C4C4C',
              borderRadius: '12px',
              boxSizing: 'border-box',
              '&.Mui-focused': {
                border: '2px solid #FAFAFA',
                boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
              },
            }}
          />
          {pk && (
            <Slide direction="up" mountOnEnter unmountOnExit>
              <Box
                sx={{
                  width: '95%',
                  backgroundColor: msgBgColor(),
                  mx: 'auto',
                  borderRadius: '0 0 12px 12px',
                }}
              >
                <Box sx={{ p: '4px' }}>{helperText}</Box>
              </Box>
            </Slide>
          )}
        </FormControl>
      </Box>
    </Box>
  );
};

export default PrivateKey;
