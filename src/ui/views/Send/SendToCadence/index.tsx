import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Typography, IconButton, CardMedia } from '@mui/material';
import BN from 'bignumber.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { type Contact } from '@/shared/types/network-types';
import { type TransactionState } from '@/shared/types/transaction-types';
import { type ActiveChildType, type CoinItem } from '@/shared/types/wallet-types';
import { withPrefix } from '@/shared/utils/address';
import { LLHeader } from '@/ui/FRWComponent';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useTransactionHook } from '@/ui/hooks/useTransactionHook';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useNetworkStore } from '@/ui/stores/networkStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';
import { LLContactCard } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import CancelIcon from '../../../../components/iconfont/IconClose';
import TransferAmount from '../TransferAmount';

import TransferConfirmation from './TransferConfirmation';

interface ContactState {
  contact: Contact;
}
const USER_CONTACT = {
  address: '',
  id: 0,
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 999,
    value: '',
  },
} as unknown as Contact;

const EMPTY_COIN: CoinItem = {
  coin: '',
  unit: '',
  balance: 0,
  price: 0,
  change24h: 0,
  total: 0,
  icon: '',
};

const SendToCadence = ({
  transactionState,
  handleAmountChange,
  handleTokenChange,
  handleSwitchFiatOrCoin,
  handleMaxClick,
}: {
  transactionState: TransactionState;
  handleAmountChange: (amountString: string) => void;
  handleTokenChange: (tokenAddress: string) => void;
  handleSwitchFiatOrCoin: () => void;
  handleMaxClick: () => void;
}) => {
  const history = useHistory();
  const wallet = useWallet();
  const { currentNetwork: network } = useNetworkStore();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [validated, setValidated] = useState<any>(null);
  const [childType, setChildType] = useState<ActiveChildType>(null);

  const checkAddress = useCallback(
    async (toAddress: string) => {
      const child = await wallet.getActiveWallet();
      setChildType(child);

      //wallet controller api
      try {
        const address = withPrefix(toAddress);
        const validatedResult = await wallet.checkAddress(address!);
        setValidated(validatedResult);
        return validatedResult;
      } catch (err) {
        console.error('checkAddress error', err);
        setValidated(false);
      }
    },
    [wallet]
  );

  useEffect(() => {
    // validate the address when the to address changes
    checkAddress(transactionState.toAddress);
  }, [transactionState.toAddress, checkAddress]);

  return (
    <div className="page">
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <LLHeader title={chrome.i18n.getMessage('Send_to')} help={true} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '16px' }}>
            <Box>
              <Box sx={{ zIndex: 999, backgroundColor: '#121212' }}>
                {/* <LLContactCard
                  contact={transactionState.toContact}
                  hideCloseButton={false}
                  isSend={true}
                /> */}
              </Box>
              {validated !== null &&
                (validated ? (
                  <></>
                ) : (
                  <SlideRelative show={true} direction="up">
                    <Box
                      sx={{
                        width: '95%',
                        backgroundColor: 'error.light',
                        mx: 'auto',
                        borderRadius: '0 0 12px 12px',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
                        <Typography variant="body1" color="text.secondary">
                          {chrome.i18n.getMessage('Invalid_address_in')}
                          {` ${network}`}
                        </Typography>
                      </Box>
                    </Box>
                  </SlideRelative>
                ))}
            </Box>

            <Typography
              variant="body1"
              sx={{
                alignSelf: 'start',
                fontSize: '14px',
              }}
            >
              {chrome.i18n.getMessage('Transfer__Amount')}
            </Typography>
            {transactionState.coinInfo.unit && (
              <TransferAmount
                transactionState={transactionState}
                handleAmountChange={handleAmountChange}
                handleTokenChange={handleTokenChange}
                handleSwitchFiatOrCoin={handleSwitchFiatOrCoin}
                handleMaxClick={handleMaxClick}
              />
            )}

            {transactionState.coinInfo.unit && (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    alignSelf: 'start',
                    fontSize: '14px',
                  }}
                >
                  {chrome.i18n.getMessage('Available__Balance')}
                </Typography>

                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CardMedia
                    sx={{ width: '18px', height: '18px' }}
                    image={transactionState.coinInfo.icon}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      alignSelf: 'start',
                      fontSize: '15px',
                    }}
                  >
                    {(Math.round(transactionState.coinInfo.balance * 100) / 100).toFixed(2) +
                      ' ' +
                      transactionState.coinInfo.unit.toUpperCase() +
                      ' ≈ ' +
                      '$ ' +
                      transactionState.coinInfo.total}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: '8px', mx: '18px', mb: '35px', mt: '10px' }}>
            <Button
              onClick={history.goBack}
              variant="contained"
              // @ts-expect-error custom color
              color="neutral"
              size="large"
              sx={{
                height: '48px',
                borderRadius: '8px',
                flexGrow: 1,
                textTransform: 'capitalize',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Cancel')}
              </Typography>
            </Button>

            <Button
              onClick={() => {
                setConfirmationOpen(true);
              }}
              // disabled={true}
              variant="contained"
              color="success"
              size="large"
              sx={{
                height: '48px',
                flexGrow: 1,
                borderRadius: '8px',
                textTransform: 'capitalize',
              }}
              disabled={
                validated === null ||
                transactionState.balanceExceeded === true ||
                transactionState.amount === null ||
                new BN(transactionState.amount || '-1').isLessThanOrEqualTo(0)
              }
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Next')}
              </Typography>
            </Button>
          </Box>
          {validated && (
            <TransferConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: transactionState.toContact,
                amount: transactionState.amount,
                secondAmount: transactionState.fiatAmount,
                userContact: transactionState.fromContact,
                tokenSymbol: transactionState.selectedToken?.symbol,
                coinInfo: transactionState.coinInfo,
                childType,
              }}
              handleCloseIconClicked={() => setConfirmationOpen(false)}
              handleCancelBtnClicked={() => setConfirmationOpen(false)}
              handleAddBtnClicked={() => {
                setConfirmationOpen(false);
              }}
            />
          )}
        </Box>
      </>
    </div>
  );
};

export default SendToCadence;
