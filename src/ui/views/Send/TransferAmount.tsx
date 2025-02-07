import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import {
  Box,
  Typography,
  IconButton,
  ListItemText,
  Select,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputAdornment,
  Input,
  Chip,
  Tooltip,
} from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import BN from 'bignumber.js';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';

import { DecimalMappingValues, TransactionStateString } from '@/shared/types/transaction-types';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';

import CancelIcon from '../../../components/iconfont/IconClose';
import IconFlow from '../../../components/iconfont/IconFlow';
import IconSwitch from '../../../components/iconfont/IconSwitch';

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

const TransferAmount = ({
  amount,
  setAmount,
  secondAmount,
  setSecondAmount,
  exceed,
  setExceed,
  coinInfo,
  setCurrentCoin,
  coinList,
}) => {
  const classes = useStyles();
  const { availableFlow } = useCoinStore();
  const { currentTxState } = useTransactionStore();
  const [coin, setCoin] = useState<string>('flow');
  const [coinType, setCoinType] = useState<any>(0);

  const getMaxDecimals = useCallback(() => {
    if (!currentTxState) return 8;
    return DecimalMappingValues[currentTxState];
  }, [currentTxState]);

  const checkDecimals = useCallback(
    (value: string) => {
      if (!coinType) {
        const decimals = value.includes('.') ? value.split('.')[1]?.length || 0 : 0;
        console.log('check decimals', value, decimals, getMaxDecimals());
        return decimals < getMaxDecimals();
      }
      return true;
    },
    [coinType, getMaxDecimals]
  );

  const handleMaxClick = useCallback(() => {
    if (coinInfo) {
      if (coinInfo.unit.toLowerCase() === 'flow') {
        setAmount(availableFlow);
      } else {
        const newAmount = coinInfo.balance;
        setAmount(newAmount);
      }
    }
  }, [coinInfo, availableFlow, setAmount]);

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (!checkDecimals(value)) return;

      const balance = new BN(coinInfo?.balance || '0');
      const price = new BN(coinInfo?.price || '0');

      if (coinType) {
        const secondInput = new BN(value || '0');
        const calculatedAmount = price.isZero() ? new BN(0) : secondInput.dividedBy(price);

        if (value.length < (secondAmount?.toString().length || 0)) {
          if (balance.minus(calculatedAmount).isLessThan(0)) {
            setExceed(true);
          } else {
            setExceed(false);
          }

          if (calculatedAmount.isNaN()) {
            setAmount('0');
            setSecondAmount(value);
          } else {
            setAmount(calculatedAmount.toFixed(getMaxDecimals(), BN.ROUND_DOWN));
            setSecondAmount(value);
          }
        }
      } else {
        const amountBN = new BN(value || '0');
        const remainingBalance = balance.minus(amountBN);

        if (remainingBalance.isLessThan(0)) {
          setExceed(true);
        } else if (coin === 'flow' && remainingBalance.isLessThan(0.001)) {
          setExceed(true);
        } else {
          setExceed(false);
        }

        const calculatedSecondAmount = amountBN.times(price);
        setAmount(value);
        setSecondAmount(calculatedSecondAmount.toFixed(3, BN.ROUND_DOWN));
      }
    },
    [
      coinInfo,
      coinType,
      secondAmount,
      coin,
      checkDecimals,
      getMaxDecimals,
      setAmount,
      setSecondAmount,
      setExceed,
    ]
  );

  const renderValue = useCallback(
    (option) => {
      const selectCoin = coinList.find((coin) => coin.unit === option);
      if (selectCoin) {
        // Debounce only the state updates, not the render
        const updateStates = debounce(() => {
          if (option !== coin) {
            setCurrentCoin(option);
            setCoin(option);
          }
        }, 300);

        updateStates();
        return <img src={selectCoin.icon} style={{ height: '24px', width: '24px' }} />;
      }
      return null;
    },
    [coinList, setCurrentCoin, setCoin, coin]
  );

  const swap = useCallback(() => {
    setCoinType(!coinType);
  }, [coinType, setCoinType]);

  const currentCoinType = useCallback(() => {
    setCoin(coinInfo.unit);
  }, [coinInfo.unit]);

  useEffect(() => {
    currentCoinType();
  }, [currentCoinType]);

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
          {coinType ? (
            <Box sx={{ width: '100%', display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px 0 14px',
                  fontSize: '16px',
                }}
              >
                <Typography>$</Typography>
              </Box>
              <FormControl sx={{ flex: '1', display: 'flex' }}>
                <Input
                  id="textfield"
                  className={classes.inputBox}
                  placeholder={chrome.i18n.getMessage('Amount')}
                  autoFocus
                  fullWidth
                  disableUnderline
                  autoComplete="off"
                  value={secondAmount}
                  type="number"
                  onChange={handleAmountChange}
                  inputProps={{ sx: { fontSize: '24px' } }}
                  endAdornment={
                    <Tooltip
                      title={
                        coin === 'flow'
                          ? chrome.i18n.getMessage('on_Flow_the_balance_cant_less_than_0001_FLOW')
                          : ''
                      }
                      arrow
                    >
                      <InputAdornment position="end">
                        <Chip
                          label={chrome.i18n.getMessage('Inbox')}
                          size="small"
                          onClick={handleMaxClick}
                          sx={{ padding: '2px 5px' }}
                        />
                      </InputAdornment>
                    </Tooltip>
                  }
                />
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ width: '100%', display: 'flex' }}>
              <Select
                renderValue={renderValue}
                onChange={(e) => renderValue(e.target.value)}
                className={classes.selectRoot}
                defaultValue={coinInfo.unit}
                MenuProps={{
                  MenuListProps: { disablePadding: true },
                  PaperProps: {
                    style: {
                      zIndex: 2000,
                    },
                  },
                }}
                sx={{ zIndex: 2000 }}
              >
                {coinList.map((coin) => (
                  <MenuItem value={coin.unit} key={coin.unit} sx={{ zIndex: 2000 }}>
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
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '4px',
              mx: '12px',
              mb: '14px',
            }}
          >
            <Typography>≈</Typography>
            {coinType ? (
              <IconFlow size={16} />
            ) : (
              <AttachMoneyRoundedIcon style={{ fontSize: '16px' }} color="secondary" />
            )}
            {coinType ? <Typography>{amount}</Typography> : <Typography>{secondAmount}</Typography>}
            <IconButton onClick={swap}>
              <IconSwitch size={14} />
            </IconButton>
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
                (coin === 'flow'
                  ? chrome.i18n.getMessage('on_Flow_the_balance_cant_less_than_0001_FLOW')
                  : '')}
            </Typography>
          </Box>
        </SlideRelative>
      </Box>
    </StyledEngineProvider>
  );
};

export default TransferAmount;
