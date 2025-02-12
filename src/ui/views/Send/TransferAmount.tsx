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

import { type TransactionState } from '@/shared/types/transaction-types';
import { type CoinItem } from '@/shared/types/wallet-types';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';
import { getMaxDecimals } from '@/ui/utils/number';

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
  transactionState,
  handleAmountChange,
  handleTokenChange,
  handleSwitchFiatOrCoin,
  handleMaxClick,
}: {
  transactionState: TransactionState;
  handleAmountChange: (amount: string) => void;
  handleTokenChange: (tokenAddress: string) => void;
  handleSwitchFiatOrCoin: () => void;
  handleMaxClick: () => void;
}) => {
  const classes = useStyles();
  const { amount, fiatAmount } = transactionState;
  const coinStore = useCoinStore();

  const renderValue = useCallback(
    (option) => {
      const selectCoin = coinStore.coins.find((coin) => coin.unit === option);
      if (selectCoin) {
        // Debounce only the state updates, not the render
        const updateStates = debounce(() => {
          handleTokenChange(option);
        }, 300);

        updateStates();
        return <img src={selectCoin.icon} style={{ height: '24px', width: '24px' }} />;
      }
      return null;
    },
    [coinStore, handleTokenChange]
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
          {transactionState.fiatOrCoin === 'fiat' ? (
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
                  value={fiatAmount}
                  type="number"
                  onChange={(event) => handleAmountChange(event.target.value)}
                  inputProps={{ sx: { fontSize: '24px' } }}
                  endAdornment={
                    <Tooltip
                      title={
                        transactionState.coinInfo.unit === 'flow'
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
                defaultValue={transactionState.coinInfo.unit}
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
                {coinStore.coins.map((coin) => (
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
                  onChange={(event) => handleAmountChange(event.target.value)}
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
            {transactionState.fiatOrCoin === 'fiat' ? (
              <IconFlow size={16} />
            ) : (
              <AttachMoneyRoundedIcon style={{ fontSize: '16px' }} color="secondary" />
            )}
            {transactionState.fiatOrCoin === 'fiat' ? (
              <Typography>{amount}</Typography>
            ) : (
              <Typography>{fiatAmount}</Typography>
            )}
            <IconButton onClick={handleSwitchFiatOrCoin}>
              <IconSwitch size={14} />
            </IconButton>
          </Box>
        </Box>
        <SlideRelative direction="down" show={transactionState.balanceExceeded}>
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
              sx={{ fontSize: transactionState.coinInfo.unit === 'flow' ? '0.7rem' : '1rem' }}
            >
              {chrome.i18n.getMessage('Insufficient_balance') +
                (transactionState.coinInfo.unit === 'flow'
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
