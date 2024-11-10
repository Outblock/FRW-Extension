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
import { makeStyles} from '@mui/styles';
import StakeConfirm from './StakeConfirm';
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
    backgroundColor: '#1a1a1a',
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
    border:'1px solid #282828',
  
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
      border:'none',
      borderRadius: '0.75em',
      color: '#CDD2D7',
      overflow: 'auto',
      outline: '0px',
    },
    '& .MuiOutlinedInput-notchedOutline':{
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
    border:'1px solid #787878',
    borderRadius: '0.75em',
    color: '#CDD2D7',
    overflow: 'auto',
    outline: '0px',

  },
  exceedBox: {
    background: 'rgba(196,69,54,0.08)',
    display:'flex',
    height: '25px',
  },
}));


const StakeAmount = ({token, amount, setAmount, setSwapTypes, setError, setLess, removeError, coinInfo}) => {
  const classes = useStyles();
  const [coin, setCoin] = useState<string>('flow');
  const [coinType, setCoinType] = useState<any>(0);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (coinInfo) {
      const value = parseFloat(amount)
      if (value > coinInfo.balance) {
        setError();
      } else if (value < 50) {
        setLess();
      } else {
        removeError();
      }
    }
  },[amount])


  const currentCoinType = () => {
    setCoin(coinInfo.unit);
  };

  useEffect(() => {
    currentCoinType();
  },[]);


  return (
    <StyledEngineProvider injectFirst> 
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        zIndex:'10'
      }}>
        <Box sx={{        
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          px:'18px',
          backgroundColor: '#1a1a1a',
          zIndex: 1000
        }}>
          <Box sx={{ width: '100%', display: 'flex',alignItems:'center',padding:'8px 0' }}>
            <FormControl sx={{ flex: '1', display: 'flex',}}>
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
                inputProps={{ sx: {fontSize: '24px', backgroundColor: '#1a1a1a',}}}
                endAdornment={
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={1}>
                      <Typography color="text.primary" variant="caption">${parseFloat((coinInfo.price * amount).toFixed(2)).toLocaleString('en-US')}</Typography>
                      <Typography color="text.secondary" variant="caption">USD</Typography>
                    </Stack>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box sx={{width:'100%',backgroundColor:'#333333',height:'1px',}}></Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '4px',
              py: '16px',
              alignItems:'center',
            }}
          >
            <img src="https://raw.githubusercontent.com/Outblock/Assets/main/ft/flow/logo.png" style={{height: '12px', width: '12px',}}/>
            <Typography color="text.secondary" variant="caption">{coinInfo.balance}</Typography>
            <Typography sx={{color:'#5E5E5E'}} variant="caption">FLOW available</Typography>
          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  );
};

export default StakeAmount;
