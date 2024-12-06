import SelectIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Typography, Button, FormControl, InputAdornment, Input, Avatar } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    minHeight: '64px',
    paddingLeft: '0',
    py: '14px',
    zIndex: '999',
    fontSize: '24px',
    backgroundColor: '#282828',
    borderRadius: '12px',
    boxSizing: 'border-box',
  },
  selectRoot: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
    borderRadius: '0.75em',
    marginRight: '0',
    textAlign: 'left',
    lineHeight: '1.5',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    color: '#CDD2D7',
    border: '1px solid #282828',

    '&ul': {
      fontFamily: 'IBM Plex Sans, sans-serif',
      fontSize: '0.875rem',
      boxSizing: 'border-box',
      padding: '5px',
      margin: '10px 0',
      maxHeight: '400px',
      backgroundColor: '#282828',
      border: 'none',
      borderRadius: '0.75em',
      color: '#CDD2D7',
      overflow: 'auto',
      outline: '0px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none !important',
      borderWidth: '0px !important',
      outline: 'none !important',
    },
  },
  selectList: {
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
    padding: '5px',
    margin: '10px 0',
    maxHeight: '400px',
    backgroundColor: '#282828',
    border: '1px solid #787878',
    borderRadius: '0.75em',
    color: '#CDD2D7',
    overflow: 'auto',
    outline: '0px',
  },
  exceedBox: {
    background: 'rgba(196,69,54,0.08)',
    display: 'flex',
    height: '25px',
  },
}));

const SwapTarget = ({ token, estimateOut, outAmount, btnSelect }) => {
  const classes = useStyles();

  return (
    <StyledEngineProvider injectFirst>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: '10',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            px: '4px',
            backgroundColor: 'neutral.main',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
              padding: '8px',
              color: '#fff',
            }}
          >
            <FormControl sx={{ flex: '1', display: 'flex' }}>
              <Input
                id="textfield"
                className={classes.inputBox}
                placeholder={chrome.i18n.getMessage('Amount')}
                autoFocus
                fullWidth
                disableUnderline
                autoComplete="off"
                value={outAmount}
                type="number"
                onChange={(event) => {
                  // let value = event.target.value;
                  // value = (Math.round(value * 100) / 100).toFixed(2)
                  estimateOut(event.target.value);
                }}
                inputProps={{ sx: { fontSize: '24px' } }}
                endAdornment={
                  <InputAdornment position="end">
                    {token ? (
                      <Button
                        variant="text"
                        onClick={btnSelect}
                        sx={{
                          width: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          py: '8px',
                          color: '#fff',
                          backgroundColor: '#333333',
                          marginRight: '4px',
                          px: '8px',
                          borderRadius: '16px',
                        }}
                      >
                        {/* <img src={token.icon} style={{height: '32px', width: '32px', marginRight:'4px'}}/> */}
                        <Avatar
                          src={token.icon}
                          sx={{ height: '32px', width: '32px', marginRight: '4px' }}
                        />
                        <Typography variant="body2" sx={{ color: '#fff', fontSize: '12px' }}>
                          {token.symbol}
                        </Typography>
                        <SelectIcon
                          fontSize="medium"
                          sx={{ color: 'icon.navi', paddingRight: '0px', cursor: 'pointer' }}
                        />
                      </Button>
                    ) : (
                      <Button
                        variant="text"
                        onClick={btnSelect}
                        sx={{
                          width: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          py: '11px',
                          color: '#fff',
                          border: '1px solid #41CC5D',
                          borderRadius: '16px',
                        }}
                      >
                        <Box
                          sx={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '24px',
                            marginRight: '4px',
                            background:
                              'linear-gradient(191.31deg, #41CC5D 11.11%, #7678ED 92.36%)',
                          }}
                        ></Box>
                        <Typography variant="body2" sx={{ color: '#fff', fontSize: '12px' }}>
                          Select
                        </Typography>
                        <SelectIcon
                          fontSize="medium"
                          sx={{ color: 'icon.navi', paddingRight: '0px', cursor: 'pointer' }}
                        />
                      </Button>
                    )}
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  );
};

export default SwapTarget;
