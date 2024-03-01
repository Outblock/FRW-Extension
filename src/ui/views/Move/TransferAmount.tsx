import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ListItemText,
  Select,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputAdornment,
  Input,
  Chip,
  Tooltip,
  Stack,
  Avatar
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import IconFlow from '../../../components/iconfont/IconFlow';
import CancelIcon from '../../../components/iconfont/IconClose';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import { StyledEngineProvider } from '@mui/material/styles';
import BN from 'bignumber.js';
import { Presets } from 'react-component-transition';
import SelectIcon from '@mui/icons-material/ArrowDropDown';

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
    color: '#CDD2D7',
    border: '1px solid #282828',

    // &.${selectUnstyledClasses.expanded} {
    //   &::after {
    //     content: '▴';
    //   }
    // }

    // &::after {
    //   content: '▾';
    //   float: right;
    // }
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
    }
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


const TransferAmount = ({ token, amount, setAmount, setSwapTypes, setError, removeError, coinInfo, btnSelect }) => {
  const classes = useStyles();
  const handleMaxClick = () => {
    if (coinInfo) {
      if (coinInfo.unit === 'flow') {
        setAmount(coinInfo.balance - 0.001)
      } else {
        setAmount(coinInfo.balance)
      }
    }
  };

  useEffect(() => {
    if (coinInfo) {
      const value = parseInt(amount)
      if (value > coinInfo.balance) {
        setError();
      } else {
        removeError();
      }
    }
  }, [amount])



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
            <FormControl sx={{ flex: '1', display: 'flex' }}>
              <Input
                id="textfield"
                className={classes.inputBox}
                placeholder={chrome.i18n.getMessage('Amount')}
                autoFocus
                fullWidth
                disableUnderline
                autoComplete="off"
                value={amount}
                type='number'
                onChange={(event) => {
                  // let value = event.target.value;
                  // value = (Math.round(value * 100) / 100).toFixed(2)
                  removeError();
                  setSwapTypes(0);
                  setAmount(event.target.value);
                }}
                inputProps={{ sx: { fontSize: '24px' } }}
                startAdornment={
                  <InputAdornment position="start">
                    <Avatar src={token.icon} sx={{ height: '32px', width: '32px', marginRight: '4px' }} />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <Button variant="text" onClick={btnSelect} sx={{ width: 'auto', display: 'flex', alignItems: 'center', py: '11px', color: '#fff' }}>
                      <SelectIcon
                        fontSize="medium"
                        sx={{ color: 'icon.navi', paddingRight: '0px', cursor: 'pointer' }}
                      />
                    </Button>
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

export default TransferAmount;
