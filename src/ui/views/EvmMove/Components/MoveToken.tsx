import {
  Box,
  Typography,
  ListItemText,
  Select,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputAdornment,
  Input,
  Chip,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import BN from 'bignumber.js';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';

import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';

import CancelIcon from '../../../../components/iconfont/IconClose';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    minHeight: '64px',
    paddingRight: '12px',
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

const MoveToken = ({
  amount,
  setAmount,
  exceed,
  setExceed,
  coinInfo,
  setCurrentCoin,
  coinList,
}) => {
  const classes = useStyles();
  const { availableFlow } = useCoinStore();
  const { currentTxState, setTokenType } = useTransactionStore();
  const [coin, setCoin] = useState<string>('flow');

  const checkDecimals = useCallback(
    (value: string) => {
      if (currentTxState) {
        const decimals = value.includes('.') ? value.split('.')[1]?.length || 0 : 0;
        console.log('check decimals', currentTxState, value, decimals);
        return decimals < 8;
      }
      return true;
    },
    [currentTxState]
  );

  const handleMaxClick = () => {
    if (coinInfo) {
      if (coinInfo.unit.toLowerCase() === 'flow') {
        setAmount(availableFlow);
      } else {
        // const minimumValue = minAmount > 0.001 ? minAmount : 0.001;
        setAmount(coinInfo.balance);
      }
    }
  };

  const renderValue = useCallback(
    (option) => {
      const selectCoin = coinList.find((coin) => coin.unit === option);
      if (selectCoin) {
        // Debounce only the state updates, not the render
        const updateStates = debounce(() => {
          if (option !== coin) {
            setCurrentCoin(option);
            if (option !== 'flow') {
              setTokenType('FT');
            } else {
              setTokenType('Flow');
            }
            setCoin(option);
          }
        }, 300);

        updateStates();
        return <img src={selectCoin.icon} style={{ height: '24px', width: '24px' }} />;
      }
      return null;
    },
    [coinList, setCurrentCoin, setCoin, setTokenType, coin]
  );

  const currentCoinType = useCallback(() => {
    setCoin(coinInfo.unit);
  }, [coinInfo.unit]);

  useEffect(() => {
    currentCoinType();
  }, [coinInfo.unit, currentCoinType]);

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (!checkDecimals(value) || !currentTxState) return;
      console.log('handleAmountChange', checkDecimals(value), currentTxState);
      if (coinInfo && value) {
        const amountBN = new BN(value);
        const balanceBN = new BN(
          coinInfo.unit.toLowerCase() === 'flow' ? availableFlow : coinInfo.balance
        );
        const remainingBalance = balanceBN.minus(amountBN);

        if (remainingBalance.isLessThan(0)) {
          setExceed(true);
        } else {
          setExceed(false);
        }
      } else {
        setExceed(false);
      }

      setAmount(value);
    },
    [coinInfo, availableFlow, currentTxState, setExceed, setAmount, checkDecimals]
  );

  return (
    <StyledEngineProvider injectFirst>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
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
          <Box sx={{ width: '100%', display: 'flex' }}>
            <Select
              renderValue={renderValue}
              className={classes.selectRoot}
              defaultValue={coinInfo.unit}
              MenuProps={{ MenuListProps: { disablePadding: true } }}
            >
              {coinList.map((coin) => (
                <MenuItem value={coin.unit} key={coin.unit}>
                  <ListItemIcon>
                    <img src={coin.icon} style={{ height: '24px', width: '24px' }} />
                  </ListItemIcon>
                  <ListItemText>{coin.coin}</ListItemText>
                </MenuItem>
              ))}
            </Select>
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
                type="number"
                onChange={handleAmountChange}
                inputProps={{ sx: { fontSize: '24px' } }}
                endAdornment={
                  <InputAdornment position="end">
                    <Chip
                      label={chrome.i18n.getMessage('Max')}
                      size="small"
                      onClick={handleMaxClick}
                      sx={{ padding: '2px 5px' }}
                    />
                  </InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '4px',
              mx: '12px',
              mb: '14px',
              justifyContent: 'space-between',
            }}
          >
            <Typography>{chrome.i18n.getMessage('Balance')}</Typography>
            <Typography>{coinInfo.balance}</Typography>
          </Box>
        </Box>
        <SlideRelative direction="down" show={exceed}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '95%',
              backgroundColor: 'error.light',
              mx: 'auto',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: coin === 'flow' ? '0.7rem' : '1rem' }}
            >
              {chrome.i18n.getMessage('Insufficient_balance') +
                (coinInfo.unit.toLowerCase() === 'flow'
                  ? chrome.i18n.getMessage('on_Flow_the_balance_cant_less_than_0001_FLOW')
                  : '')}
            </Typography>
          </Box>
        </SlideRelative>
      </Box>
    </StyledEngineProvider>
  );
};

export default MoveToken;
